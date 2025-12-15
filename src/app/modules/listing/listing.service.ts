// src/modules/listings/listing.service.ts
import { Prisma, PrismaClient } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { paginationHelper } from "../../../helpers/paginationHelper";
import { IPaginationOptions } from "../../interfaces/pagination";
import { listingSearchableFields } from "./listing.constant";
import {
  IListingCreate,
  IListingCreateInputFromReqBody,
  IListingFilterRequest,
  IListingUpdate,
} from "./listing.interface";
import { IAuthUser } from "../../interfaces/common";
import { fileUploader } from "../../../helpers/fileUploader";



const getAllFromDB = async (
  filters: IListingFilterRequest,
  options: IPaginationOptions
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, category, minPrice, maxPrice, ...filterData } = filters;

  const andConditions: Prisma.ListingWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: listingSearchableFields.map((field) => ({
        [field]: { contains: searchTerm, mode: "insensitive" },
      })),
    });
  }

  if (category) {
    const cats = Array.isArray(category) ? category : [category];
    andConditions.push({ category: { in: cats as any } });
  }

  if (typeof minPrice === "number" || typeof maxPrice === "number") {
    const priceCondition: any = {};
    if (typeof minPrice === "number") priceCondition.gte = minPrice;
    if (typeof maxPrice === "number") priceCondition.lte = maxPrice;
    andConditions.push({ price: priceCondition });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push(
      ...Object.keys(filterData).map((k) => ({
        [k]: { equals: (filterData as any)[k] },
      }))
    );
  }

  andConditions.push({ isDeleted: false });

  const where: Prisma.ListingWhereInput = andConditions.length
    ? { AND: andConditions }
    : {};

  const result = await prisma.listing.findMany({
    where,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    include: {
      guide: {
        select: { id: true, name: true, profilePhoto: true, email: true },
      },
    },
  });

  const total = await prisma.listing.count({ where });

  return { meta: { total, page, limit }, data: result };
};

const getByIdFromDB = async (id: string) => {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      guide: {
        select: { id: true, name: true, profilePhoto: true, email: true, reviews: true },
      },
      bookings: false,
      reviews: false,
    },
  });
  if (!listing || listing.isDeleted) return null;
  return listing;
};

const createIntoDB = async (req: any, user: IAuthUser) => {
  const payload = req.body;
  const file = req.file;

  if (file) {
    const upload = await fileUploader.uploadToCloudinary(file);
    req.body.image = upload?.secure_url;
  }

  const processedPrice = Number(payload.price);
  const { ...listingData } = payload;

  if (!user) {
    throw new Error("User not authenticated");
  }

  const foundUser = await prisma.guide.findUnique({
    where: { email: user.email },
  });

  console.log("FOUND USER FROM DB:", foundUser);

  if (!foundUser) {
    throw new Error("User not found in DB");
  }

  const listing = await prisma.listing.create({
    data: {
      ...listingData,
      guideId: foundUser.id, // MUST match users.id
      price: processedPrice,
    },
    include: {
      guide: { select: { id: true, name: true, profilePhoto: true } },
    },
  });

  return listing;
};

const updateIntoDB = async (id: string, payload: IListingUpdate) => {
  const { ...listingData } = payload;

  const listingInfo = await prisma.listing.findUniqueOrThrow({ where: { id } });

  await prisma.$transaction(async (tx) => {
    if (Object.keys(listingData).length > 0) {
      await tx.listing.update({ where: { id }, data: listingData });
    }
  });

  return prisma.listing.findUnique({
    where: { id },
  });
};

const deleteFromDB = async (id: string) => {
  return await prisma.$transaction(async (tx) => {
    const listing = await tx.listing.delete({ where: { id } });
    return listing;
  });
};

const softDelete = async (id: string) => {
  return prisma.listing.update({
    where: { id },
    data: { isDeleted: true },
  });
};

export const ListingService = {
  getAllFromDB,
  getByIdFromDB,
  createIntoDB,
  updateIntoDB,
  deleteFromDB,
  softDelete,
};
