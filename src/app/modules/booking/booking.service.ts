// src/modules/bookings/booking.service.ts
import { Booking, Prisma, BookingStatus, PaymentStatus } from "@prisma/client";
import prisma from "../../../shared/prisma";
import { paginationHelper } from "../../../helpers/paginationHelper";
import { IPaginationOptions } from "../../interfaces/pagination";
import { IBookingCreate, IBookingFilterRequest, IBookingUpdateStatus } from "./booking.interface";
import { bookingSearchableFields } from "./booking.constant";

// --- Helper Functions & Core Services ---

/**
 * Creates a new booking in the database.
 * Ensures the listing exists and isn't deleted.
 */
const createBooking = async (req: any): Promise<Booking> => {
  const payload: IBookingCreate = req.body;
  const touristId: string = req.user.id;
  const { listingId, bookingDate } = payload;

  // 1. Verify the listing exists and is active
  const listing = await prisma.listing.findUnique({
    where: { id: listingId, isDeleted: false },
  });

  if (!listing) {
    throw new Error("Listing not found or is unavailable.");
  }
  
  // 2. Format the date correctly if it came as a string from the client
  const dateObject = new Date(bookingDate);

  const newBooking = await prisma.booking.create({
    data: {
      touristId,
      listingId,
      bookingDate: dateObject,
      status: BookingStatus.PENDING, // Default status
      paymentStatus: PaymentStatus.PENDING, // Default status
    },
    include: {
      tourist: { select: { id: true, name: true, profilePhoto: true } },
      listing: { select: { id: true, title: true, price: true, location: true } },
    },
  });

  return newBooking;
};

/**
 * Retrieves a single booking by its ID.
 */
const getById = async (id: string): Promise<Booking | null> => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      tourist: { select: { id: true, name: true, profilePhoto: true } },
      listing: {
        include: {
          guide: { select: { id: true, name: true, profilePhoto: true } },
        },
      },
    },
  });

  if (!booking || booking.isDeleted) return null;
  return booking;
};

/**
 * Retrieves all bookings, with filtering and pagination.
 * Can filter specifically for a tourist's or a guide's bookings.
 */
const getAllFromDB = async (
  filters: IBookingFilterRequest,
  options: IPaginationOptions,
  userRole?: 'guide' | 'tourist',
  userId?: string
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, guideId, ...filterData } = filters;

  const andConditions: Prisma.BookingWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: bookingSearchableFields.map((field) => ({
        [field]: { contains: searchTerm, mode: "insensitive" },
      })),
    });
  }

  // Handle specific user roles for filtering their own bookings
  if (userRole === 'tourist' && userId) {
    andConditions.push({ touristId: userId });
  }

  // Handle specific filtering for a guide's listings (requires a nested filter)
  if (userRole === 'guide' && userId) {
    andConditions.push({
      listing: {
        guideId: userId
      }
    });
  }

  // Handle general filter data (status, paymentStatus, etc.)
  if (Object.keys(filterData).length > 0) {
    andConditions.push(
      ...Object.keys(filterData).map((k) => ({
        [k]: { equals: (filterData as any)[k] },
      }))
    );
  }

  andConditions.push({ isDeleted: false });

  const where: Prisma.BookingWhereInput = andConditions.length ? { AND: andConditions } : {};

  const result = await prisma.booking.findMany({
    where,
    skip,
    take: limit,
    orderBy: options.sortBy && options.sortOrder ? { [options.sortBy]: options.sortOrder } : { createdAt: "desc" },
    include: {
        tourist: { select: { id: true, name: true, profilePhoto: true } },
        listing: { select: { id: true, title: true, price: true, location: true } },
    },
  });

  const total = await prisma.booking.count({ where });

  return { meta: { total, page, limit }, data: result };
};


/**
 * Updates the status or payment status of a booking.
 */
const updateBookingStatus = async (id: string, payload: IBookingUpdateStatus): Promise<Booking | null> => {
  const { status, paymentStatus } = payload;

  const bookingInfo = await prisma.booking.findUniqueOrThrow({ where: { id, isDeleted: false } });

  const updatedData: Partial<Booking> = {};
  if (status) updatedData.status = status;
  if (paymentStatus) updatedData.paymentStatus = paymentStatus;

  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: updatedData,
  });

  return updatedBooking;
};

/**
 * Soft deletes a booking by marking it as deleted.
 */
const softDelete = async (id: string): Promise<Booking> => {
  return prisma.booking.update({
    where: { id },
    data: { isDeleted: true },
  });
};

export const BookingService = {
  createBooking,
  getById,
  getAllFromDB,
  updateBookingStatus,
  softDelete,
};

