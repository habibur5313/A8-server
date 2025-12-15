import { z } from "zod";
import { BookingStatus, PaymentStatus } from "@prisma/client";

export const createBookingZodSchema = z.object({
  body: z.object({
    listingId: z.string({
      error: "Listing ID is required",
    }).optional(),
    guideId: z.string({
      error: "Guide ID is required",
    }),

    bookingDate: z
      .string({
        error: "Booking date is required",
      })
      .datetime("Invalid datetime format, expected ISO string"),
  }),
});

// Schema for updating a booking's status
const updateBookingStatusZodSchema = z.object({
  body: z
    .object({
      status: z
        .enum(Object.values(BookingStatus) as [string, ...string[]])
        .optional(),
      paymentStatus: z
        .enum(Object.values(PaymentStatus) as [string, ...string[]])
        .optional(),
    })
    .refine((data) => data.status || data.paymentStatus, {
      message: "Either status or paymentStatus must be provided for update",
      path: ["body"],
    }),
});

export const BookingValidation = {
  createBookingZodSchema,
  updateBookingStatusZodSchema,
};
