import { Admin, Guide, Prisma, Tourist, UserRole } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { Request } from "express";
import { fileUploader } from "../../../helpers/fileUploader";
import { paginationHelper } from "../../../helpers/paginationHelper";
import prisma from "../../../shared/prisma";
import { IAuthUser } from "../../interfaces/common";
import { IPaginationOptions } from "../../interfaces/pagination";
import { userSearchAbleFields } from "./user.constant";
import config from "../../../config";

const createAdmin = async (req: Request): Promise<Admin> => {
  const file = req.file;

  if (file) {
    const upload = await fileUploader.uploadToCloudinary(file);
    req.body.admin.profilePhoto = upload?.secure_url;
  }

  const hashedPassword = await bcrypt.hash(
    req.body.password,
    Number(config.salt_round)
  );

  const userData = {
    email: req.body.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };

  return await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({ data: userData });

    const createdAdmin = await tx.admin.create({
      data: {
        ...req.body.admin,
        email: createdUser.email,
      },
    });

    return createdAdmin;
  });
};

const createGuide = async (req: Request): Promise<Guide> => {
  const file = req.file;

  if (file) {
    const upload = await fileUploader.uploadToCloudinary(file);
    req.body.guide.profilePhoto = upload?.secure_url;
  }

  const hashedPassword = await bcrypt.hash(
    req.body.password,
    Number(config.salt_round)
  );

  return await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        email: req.body.guide.email,
        password: hashedPassword,
        role: UserRole.GUIDE,
      },
    });

    const createdGuide = await tx.guide.create({
      data: {
        ...req.body.guide,
        userId: createdUser.id,
      },
    });

    return createdGuide;
  });
};

const createTourist = async (req: Request): Promise<Tourist> => {
  const file = req.file;
  console.log(file, "file");

  if (file) {
    const upload = await fileUploader.uploadToCloudinary(file);
    req.body.tourist.profilePhoto = upload?.secure_url;
  }

  const hashedPassword = await bcrypt.hash(
    req.body.password,
    Number(config.salt_round)
  );

  return await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        email: req.body.tourist.email,
        password: hashedPassword,
        role: UserRole.TOURIST,
        needPasswordChange: false,
      },
    });

    console.log(createdUser, "createdUser");

    const createdTourist = await tx.tourist.create({
      data: {
        ...req.body.tourist,
        userId: createdUser.id,
      },
    });

    return createdTourist;
  });
};

const getAllFromDB = async (params: any, options: IPaginationOptions) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filters } = params;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: userSearchAbleFields.map((field) => ({
        [field]: { contains: searchTerm, mode: "insensitive" },
      })),
    });
  }

  if (Object.keys(filters).length > 0) {
    andConditions.push({
      AND: Object.entries(filters).map(([key, value]) => ({
        [key]: { equals: value },
      })),
    });
  }

  const where: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const users = await prisma.user.findMany({
    where,
    skip,
    take: limit,
    orderBy: options.sortBy
      ? { [options.sortBy]: options.sortOrder }
      : { createdAt: "desc" },
    include: {
      admin: true,
      guide: true,
      tourist: true,
      superAdmin: true,
    },
  });

  const total = await prisma.user.count({ where });

  return {
    meta: { total, page, limit },
    data: users,
  };
};

const changeProfileStatus = async (id: string, data: any) => {
  return prisma.user.update({
    where: { id },
    data,
  });
};

const getMyProfile = async (user: IAuthUser) => {
  if (!user) {
    throw new Error("User not authenticated");
  }

  const u = await prisma.user.findUniqueOrThrow({
    where: { email: user.email },
  });

  let profile = null;

  if (u.role === UserRole.SUPER_ADMIN) {
    profile = await prisma.superAdmin.findUnique({ where: { email: u.email } });
  } else if (u.role === UserRole.ADMIN) {
    profile = await prisma.admin.findUnique({ where: { email: u.email } });
  } else if (u.role === UserRole.GUIDE) {
    profile = await prisma.guide.findUnique({ where: { userId: u.id } });
  } else if (u.role === UserRole.TOURIST) {
    profile = await prisma.tourist.findUnique({ where: { userId: u.id } });
  }

  return { ...u, profile };
};

const updateMyProfile = async (user: IAuthUser, req: Request) => {
  if (!user) {
    throw new Error("User not authenticated");
  }

  const u = await prisma.user.findUniqueOrThrow({
    where: { email: user.email },
  });

  const file = req.file;

  if (file) {
    const upload = await fileUploader.uploadToCloudinary(file);
    req.body.profilePhoto = upload?.secure_url;
  }

  let updatedProfile;

  if (u.role === UserRole.ADMIN) {
    updatedProfile = await prisma.admin.update({
      where: { email: u.email },
      data: req.body,
    });
  } else if (u.role === UserRole.SUPER_ADMIN) {
    updatedProfile = await prisma.superAdmin.update({
      where: { email: u.email },
      data: req.body,
    });
  } else if (u.role === UserRole.GUIDE) {
    updatedProfile = await prisma.guide.update({
      where: { userId: u.id },
      data: req.body,
    });
  } else if (u.role === UserRole.TOURIST) {
    updatedProfile = await prisma.tourist.update({
      where: { userId: u.id },
      data: req.body,
    });
  }

  return updatedProfile;
};

export const userService = {
  createAdmin,
  createGuide,
  createTourist,
  getAllFromDB,
  changeProfileStatus,
  getMyProfile,
  updateMyProfile,
};
