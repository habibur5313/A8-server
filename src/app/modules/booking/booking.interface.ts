// src/modules/bookings/booking.interface.ts

import { Booking, BookingStatus, PaymentStatus } from "@prisma/client";

export type IBookingCreate = Omit<Booking, 'id' | 'touristId' | 'status' | 'paymentStatus' | 'createdAt' | 'updatedAt' |  'listingId' | 'isDeleted' | 'payment'> & {
  bookingDate: string; // Use string for input, convert to Date object in service
  guideId: string;
  listingId?: string;
};

export interface IBookingFilterRequest {
  searchTerm?: string;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  touristId?: string;
  guideId?: string; // Implicitly filtered via the listing relationship
}

export interface IBookingUpdateStatus {
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
}
