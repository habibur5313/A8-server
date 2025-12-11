import { Guide, Prisma, UserStatus } from "@prisma/client";
import { paginationHelper } from "../../../helpers/paginationHelper";
import prisma from "../../../shared/prisma";
import { IPaginationOptions } from "../../interfaces/pagination";
import { guideSearchableFields } from "./guide.constants";
import { IGuideFilterRequest, IGuideUpdate } from "./guide.interface";
import { askOpenRouter } from "../../../helpers/openRouterClient";

const getAllFromDB = async (
  filters: IGuideFilterRequest,
  options: IPaginationOptions
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, specialties, ...filterData } = filters;

  const andConditions: Prisma.GuideWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: guideSearchableFields.map((field) => ({
        [field]: { contains: searchTerm, mode: "insensitive" },
      })),
    });
  }

  if (specialties && specialties.length > 0) {
    const specialtiesArray = Array.isArray(specialties)
      ? specialties
      : [specialties];
    // andConditions.push({
    //   guideSpecialties: {
    //     some: { specialities: { id: { in: specialtiesArray } } },
    //   },
    // });
  }

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: { equals: (filterData as any)[key] },
    }));
    andConditions.push(...filterConditions);
  }

  andConditions.push({ isDeleted: false });

  const whereConditions: Prisma.GuideWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.guide.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { averageRating: "desc" },
    include: {
      reviews: { select: { rating: true } },
    },
  });

  const total = await prisma.guide.count({ where: whereConditions });

  return { meta: { total, page, limit }, data: result };
};

const getByIdFromDB = async (id: string) => {
  const guide = await prisma.guide.findUnique({
    where: { id },
    include: {
      reviews: {
        select: {
          rating: true,
          comment: true,
          createdAt: true,
          tourist: { select: { name: true, profilePhoto: true } },
        },
      },
    },
  });
  if (!guide || guide.isDeleted) return null;
  return guide;
};

const updateIntoDB = async (id: string, payload: IGuideUpdate) => {
  const { ...guideData } = payload;

  const guideInfo = await prisma.guide.findUniqueOrThrow({ where: { id } });

  await prisma.$transaction(async (tx) => {
    if (Object.keys(guideData).length > 0) {
      await tx.guide.update({ where: { id }, data: guideData });
    }
  });

  return prisma.guide.findUnique({
    where: { id },
  });
};

const deleteFromDB = async (id: string) => {
  return await prisma.$transaction(async (tx) => {
    const guide = await tx.guide.delete({ where: { id } });
    await tx.user.delete({ where: { id: guide.userId } });
    return guide;
  });
};

const softDelete = async (id: string) => {
  return await prisma.$transaction(async (tx) => {
    const guide = await tx.guide.update({
      where: { id },
      data: { isDeleted: true },
    });
    await tx.user.update({
      where: { id: guide.userId },
      data: { status: UserStatus.DELETED },
    });
    return guide;
  });
};

type PatientInput = { symptoms: string };

const getAISuggestion = async (input: PatientInput) => {
  const guides = await prisma.guide.findMany({
    where: { isDeleted: false, isAvailable: true },
    // include: { guideSpecialties: { include: { specialities: true } }, review: { select: { rating: true } } },
  });

  const systemMessage = {
    role: "system",
    content:
      "You are a recommendation assistant. Based on patient's symptoms and guide data including specialties, skills, languages, experience, guideFee, averageRating, suggest top 5 guides in JSON.",
  };

  const userMessage = {
    role: "user",
    content: `
Patient Symptoms: ${input.symptoms}

Available guides:
${JSON.stringify(guides)}

Instructions:
Return top 5 guides in valid JSON format, each object including: id, name, specialties, skills, languages, experience, guideFee, averageRating.
`,
  };

  const response = await askOpenRouter([systemMessage, userMessage]);
  const cleanedJson = response
    .replace(/`(?:json)?\s*/, "")
    .replace(/`$/, "")
    .trim();
  return JSON.parse(cleanedJson);
};

const getAllPublic = async (
  filters: IGuideFilterRequest,
  options: IPaginationOptions
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, specialties, ...filterData } = filters;

  const andConditions: Prisma.GuideWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: guideSearchableFields.map((f) => ({
        [f]: { contains: searchTerm, mode: "insensitive" },
      })),
    });
  }

  // if (specialties?.length) {
  // const arr = Array.isArray(specialties) ? specialties : [specialties];
  // andConditions.push({ guideSpecialties: { some: { specialities: { title: { in: arr, mode: "insensitive" } } } } });
  // }

  if (Object.keys(filterData).length) {
    andConditions.push(
      ...Object.keys(filterData).map((k) => ({
        [k]: { equals: (filterData as any)[k] },
      }))
    );
  }

  andConditions.push({ isDeleted: false, isAvailable: true });

  const result = await prisma.guide.findMany({
    where: { AND: andConditions },
    skip,
    take: limit,
    orderBy: { averageRating: "desc" },
    select: {
      id: true,
      name: true,
      profilePhoto: true,
      contactNumber: true,
      gender: true,
      district: true,
      address: true,
      experience: true,
      qualification: true,
      about: true,
      currentWorkingPlace: true,
      designation: true,
      languages: true,
      skills: true,
      guideFee: true,
      averageRating: true,
      totalReviews: true,
      isAvailable: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
      // guideSpecialties: { include: { specialities: true } },
      // review: { select: { rating: true, comment: true, createdAt: true, patient: { select: { name: true, profilePhoto: true } } } },
    },
  });

  const total = await prisma.guide.count({ where: { AND: andConditions } });
  return { meta: { total, page, limit }, data: result };
};

export const GuideService = {
  getAllFromDB,
  getByIdFromDB,
  updateIntoDB,
  deleteFromDB,
  softDelete,
  getAISuggestion,
  getAllPublic,
};
