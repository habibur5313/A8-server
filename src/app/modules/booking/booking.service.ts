// src/modules/bookings/booking.service.ts
import {
  Booking,
  Prisma,
  BookingStatus,
  PaymentStatus,
  UserRole,
} from "@prisma/client";
import prisma from "../../../shared/prisma";
import { paginationHelper } from "../../../helpers/paginationHelper";
import { IPaginationOptions } from "../../interfaces/pagination";
import {
  IBookingCreate,
  IBookingFilterRequest,
  IBookingUpdateStatus,
} from "./booking.interface";
import { bookingSearchableFields } from "./booking.constant";
import { IAuthUser } from "../../interfaces/common";
import { v4 as uuidv4 } from 'uuid';
import { stripe } from "../../../helpers/stripe";


// --- Helper Functions & Core Services ---

/**
 * Creates a new booking in the database.
 * Ensures the listing exists and isn't deleted.
 */
// const createBooking = async (req: any, user: IAuthUser): Promise<Booking> => {
//   const payload: IBookingCreate = req.body;
//   const { listingId, guideId, bookingDate } = payload;

//   if (!user) {
//     throw new Error("User not authenticated");
//   }

//   const foundUser = await prisma.tourist.findUnique({
//     where: { email: user.email },
//   });

//   console.log("FOUND USER FROM DB:", foundUser);

//   if (!foundUser) {
//     throw new Error("User not found in DB");
//   }

//   if (listingId) {
//     const listing = await prisma.listing.findUnique({
//       where: { id: listingId, isDeleted: false },
//     });

//     if (!listing) {
//       throw new Error("Listing not found or is unavailable.");
//     }
//   }

//   const guide = await prisma.guide.findUnique({
//     where: { id: guideId, isDeleted: false },
//   });

//   if (!guide) {
//     throw new Error("Guide not found or is unavailable.");
//   }

//   // 2. Format the date correctly if it came as a string from the client
//   const dateObject = new Date(bookingDate);

//   const newBooking = await prisma.booking.create({
//     data: {
//       touristId: foundUser.id,
//       guideId: guideId,
//       listingId,
//       bookingDate: dateObject,
//       status: BookingStatus.PENDING, // Default status
//       paymentStatus: PaymentStatus.PENDING, // Default status
//     },
//     include: {
//       tourist: { select: { id: true, name: true, profilePhoto: true } },
//       listing: {
//         select: { id: true, title: true, price: true, location: true },
//       },
//       guide: { select: { id: true, name: true, profilePhoto: true } },
//     },
//   });

//   return newBooking;
// };


const createBooking = async (req: any, user: IAuthUser) => {
  const payload: IBookingCreate = req.body;
  const { listingId, guideId, bookingDate } = payload;

  if (!user) {
    throw new Error("User not authenticated");
  }

  const foundUser = await prisma.tourist.findUnique({
    where: { email: user.email },
  });

  if (!foundUser) {
    throw new Error("User not found in DB");
  }

  const guide = await prisma.guide.findUniqueOrThrow({
    where: { id: guideId, isDeleted: false },
  });

  const listing = listingId
    ? await prisma.listing.findUniqueOrThrow({
        where: { id: listingId, isDeleted: false },
      })
    : null;

  const dateObject = new Date(bookingDate);

  const result = await prisma.$transaction(async (tnx) => {
    // 1️⃣ Create Booking
    const newBooking = await tnx.booking.create({
      data: {
        touristId: foundUser.id,
        guideId: guideId,
        listingId,
        bookingDate: dateObject,
        status: BookingStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
      },
    });

    // 2️⃣ Create Payment Record
    const transactionId = uuidv4();

    const payment = await tnx.payment.create({
      data: {
        bookingId: newBooking.id,
        amount: listing ? listing.price : guide.guideFee,
        transactionId,
      },
    });

    // 3️⃣ Create Stripe Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: user.email || "",
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: listing
                ? `Tour Booking: ${listing.title}`
                : `Guide Booking: ${guide.name}`,
            },
            unit_amount: (listing ? listing.price : guide.guideFee) * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: newBooking.id,
        paymentId: payment.id,
      },
      success_url: `${process.env.FRONTEND_URL}/payment/success`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard/my-bookings`,
    });

    return { paymentUrl: session.url };
  });

  return result;
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
        select: { id: true, title: true, price: true, location: true },
      },
      guide: {
        select: {
          id: true,
          name: true,
          profilePhoto: true,
      }
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
  userRole?: UserRole,
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
  if (userRole === UserRole.TOURIST && userId) {
    andConditions.push({ touristId: userId });
  }

  // Handle specific filtering for a guide's listings (requires a nested filter)
  if (userRole === UserRole.GUIDE && userId) {
    andConditions.push({
      listing: {
        guideId: userId,
      },
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

  const where: Prisma.BookingWhereInput = andConditions.length
    ? { AND: andConditions }
    : {};

  const result = await prisma.booking.findMany({
    where,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    include: {
      tourist: { select: { id: true, name: true, profilePhoto: true } },
      listing: {
        select: {
          id: true,
          title: true,
          price: true,
          location: true,
        },
      },
      guide: {
        select: {
          id: true,
          name: true,
          profilePhoto: true,
          guideFee: true,
          
        },
      },
    },
  });

  const total = await prisma.booking.count({ where });

  return { meta: { total, page, limit }, data: result };
};

/**
 * Updates the status or payment status of a booking.
 */
const updateBookingStatus = async (
  id: string,
  payload: IBookingUpdateStatus
): Promise<Booking | null> => {
  const { status, paymentStatus } = payload;

  const bookingInfo = await prisma.booking.findUniqueOrThrow({
    where: { id, isDeleted: false },
  });

  const updatedData: Partial<Booking> = {};
  if (status) updatedData.status = status;
  if (paymentStatus) updatedData.paymentStatus = paymentStatus;

  const updatedBooking = await prisma.booking.update({
    where: { id },
    data: updatedData,
  });

  return updatedBooking;
};

const deleteBooking = async (id: string): Promise<Booking> => {
  return prisma.booking.delete({ where: { id } });
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
  deleteBooking,
  softDelete,
};
