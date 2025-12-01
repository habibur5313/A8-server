import {
  Admin,
  GUIDE,
  Prisma,
  TOURIST,
  UserRole,
  UserStatus,
} from "@prisma/client";
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
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.admin.profilePhoto = uploadToCloudinary?.secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(
    req.body.password,
    Number(config.salt_round)
  );

  const userData = {
    email: req.body.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdAdminData = await transactionClient.admin.create({
      data: req.body.admin,
    });

    return createdAdminData;
  });

  return result;
};

const createGuide = async (req: Request): Promise<GUIDE> => {
  const file = req.file;

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.doctor.profilePhoto = uploadToCloudinary?.secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(
    req.body.password,
    Number(config.salt_round)
  );

  const userData = {
    email: req.body.doctor.email,
    password: hashedPassword,
    role: UserRole.GUIDE,
  };

  // Extract specialties from doctor data
  const { specialties, ...doctorData } = req.body.doctor;

  const result = await prisma.$transaction(async (transactionClient) => {
    // Step 1: Create user
    await transactionClient.user.create({
      data: userData,
    });

    // Step 2: Create doctor
    const createdDoctorData = await transactionClient.guide.create({
      data: doctorData,
    });

    // Step 4: Return doctor with specialties
    const doctorWithSpecialties = await transactionClient.guide.findUnique({
      where: {
        id: createdDoctorData.id,
      },
    });

    return doctorWithSpecialties!;
  });

  return result;
};

const createTourist = async (req: Request): Promise<TOURIST> => {
  const file = req.file;

  if (file) {
    const uploadedProfileImage = await fileUploader.uploadToCloudinary(file);
    req.body.patient.profilePhoto = uploadedProfileImage?.secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(
    req.body.password,
    Number(config.salt_round)
  );

  const userData = {
    email: req.body.patient.email,
    password: hashedPassword,
    role: UserRole.TOURIST,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: {
        ...userData,
        needPasswordChange: false,
      },
    });

    const createdPatientData = await transactionClient.tourist.create({
      data: req.body.patient,
    });

    return createdPatientData;
  });

  return result;
};

const getAllFromDB = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (params.searchTerm) {
    andConditions.push({
      OR: userSearchAbleFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.user.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
    select: {
      id: true,
      email: true,
      role: true,
      needPasswordChange: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      admin: true,
      tourist: true,
      guide: true,
    },
  });

  const total = await prisma.user.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const changeProfileStatus = async (id: string, status: UserRole) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const updateUserStatus = await prisma.user.update({
    where: {
      id,
    },
    data: status,
  });

  return updateUserStatus;
};

const getMyProfile = async (user: IAuthUser) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      needPasswordChange: true,
      role: true,
      status: true,
    },
  });

  let profileInfo;

  if (userInfo.role === UserRole.SUPER_ADMIN) {
    profileInfo = await prisma.admin.findUnique({
      where: {
        email: userInfo.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true,
        contactNumber: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } else if (userInfo.role === UserRole.ADMIN) {
    profileInfo = await prisma.admin.findUnique({
      where: {
        email: userInfo.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true,
        contactNumber: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } else if (userInfo.role === UserRole.GUIDE) {
    profileInfo = await prisma.guide.findUnique({
      where: {
        email: userInfo.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true,
        contactNumber: true,
        address: true,
        registrationNumber: true,
        experience: true,
        gender: true,
        appointmentFee: true,
        qualification: true,
        currentWorkingPlace: true,
        designation: true,
        averageRating: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } else if (userInfo.role === UserRole.TOURIST) {
    profileInfo = await prisma.tourist.findUnique({
      where: {
        email: userInfo.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true,
        contactNumber: true,
        address: true,
        isDeleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  return { ...userInfo, ...profileInfo };
};

const updateMyProfie = async (user: IAuthUser, req: Request) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
      status: UserStatus.ACTIVE,
    },
  });

  const file = req.file;
  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.profilePhoto = uploadToCloudinary?.secure_url;
  }

  let profileInfo;

  if (userInfo.role === UserRole.SUPER_ADMIN) {
    profileInfo = await prisma.admin.update({
      where: {
        email: userInfo.email,
      },
      data: req.body,
    });
  } else if (userInfo.role === UserRole.ADMIN) {
    profileInfo = await prisma.admin.update({
      where: {
        email: userInfo.email,
      },
      data: req.body,
    });
  } else if (userInfo.role === UserRole.GUIDE) {
    profileInfo = await prisma.guide.update({
      where: {
        email: userInfo.email,
      },
      data: req.body,
    });
  } else if (userInfo.role === UserRole.TOURIST) {
    profileInfo = await prisma.tourist.update({
      where: {
        email: userInfo.email,
      },
      data: req.body,
    });
  }

  return { ...profileInfo };
};

export const userService = {
  createAdmin,
  createGuide,
  createTourist,
  getAllFromDB,
  changeProfileStatus,
  getMyProfile,
  updateMyProfie,
};
