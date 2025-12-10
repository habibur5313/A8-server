import prisma from '../../../shared/prisma';
import { IListingCreate, IListingUpdate } from './listing.interface';
import { Prisma } from '@prisma/client';
import { paginationHelper } from '../../../helpers/paginationHelper';
import { IPaginationOptions } from '../../interfaces/pagination';
import { listingFilterableFields } from './listing.constant';

const createListing = async (payload: IListingCreate) => {
  return prisma.listing.create({ data: payload });
};

const getAllListings = async (filters: any, options: IPaginationOptions) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);

  const andConditions: Prisma.ListingWhereInput[] = [{ isDeleted: false }];

  Object.keys(filters).forEach((key) => {
    if (listingFilterableFields.includes(key)) {
      andConditions.push({ [key]: { equals: filters[key] } });
    }
  });

  const whereCondition: Prisma.ListingWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

  const data = await prisma.listing.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy: options.sortBy && options.sortOrder ? { [options.sortBy]: options.sortOrder } : { createdAt: 'desc' },
  });

  const total = await prisma.listing.count({ where: whereCondition });

  return { meta: { total, page, limit }, data };
};

const getListingById = async (id: string) => {
  return prisma.listing.findUnique({ where: { id } });
};

const updateListing = async (id: string, payload: IListingUpdate) => {
  return prisma.listing.update({ where: { id }, data: payload });
};

const deleteListing = async (id: string) => {
  return prisma.listing.delete({ where: { id } });
};

const softDeleteListing = async (id: string) => {
  return prisma.listing.update({ where: { id }, data: { isDeleted: true } });
};

export const ListingService = {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
  softDeleteListing,
};
