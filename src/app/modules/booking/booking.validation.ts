// src/modules/bookings/booking.validation.ts

import { z } from 'zod';
import { BookingStatus, PaymentStatus } from '@prisma/client';

// Schema for creating a new booking
const createBookingZodSchema = z.object({
  body: z.object({
    listingId: z.string({
      error: 'Listing ID is required',
    }),
    // We expect an ISO string from the client
    bookingDate: z.string({ 
      error: 'Booking date is required',
    }).datetime("Invalid datetime format, expected ISO string"),
    // touristId is automatically added from req.user by the controller/service
  }),
});

// Schema for updating a booking's status
const updateBookingStatusZodSchema = z.object({
  body: z.object({
    status: z.enum(Object.values(BookingStatus) as [string, ...string[]]).optional(),
    paymentStatus: z.enum(Object.values(PaymentStatus) as [string, ...string[]]).optional(),
  }).refine(data => data.status || data.paymentStatus, {
    message: "Either status or paymentStatus must be provided for update",
    path: ["body"],
  }),
});

export const BookingValidation = {
  createBookingZodSchema,
  updateBookingStatusZodSchema,
};
