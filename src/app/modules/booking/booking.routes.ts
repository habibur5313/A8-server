// src/modules/bookings/booking.routes.ts

import express from 'express';
import { BookingController } from './booking.controller';
import validateRequest from '../../middlewares/validateRequest';
import { BookingValidation } from './booking.validation';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Routes accessible to Tourists (to create their own bookings)
router.post(
  '/',
  auth(UserRole.TOURIST), // Only a tourist can initiate a booking
  validateRequest(BookingValidation.createBookingZodSchema),
  BookingController.createBooking
);

// General route to get all bookings (admin/super_admin usually handles this view)
router.get(
    '/', 
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.GUIDE, UserRole.TOURIST),
    BookingController.getAllBookings
);

// Routes for specific booking ID
router.get(
  '/:id',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.GUIDE, UserRole.TOURIST),
  BookingController.getBookingById
);

// Route to update status (admin or guide might update status)
router.patch(
  '/:id/status',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.GUIDE), // Only authorized personnel update status
  validateRequest(BookingValidation.updateBookingStatusZodSchema),
  BookingController.updateBookingStatus
);

// Route to soft delete a booking (admin/super_admin)
router.delete(
  '/:id',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  BookingController.softDeleteBooking
);

export const BookingRoutes = router;
