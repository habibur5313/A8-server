// src/modules/bookings/booking.controller.ts

import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { BookingService } from './booking.service';
import pick from '../../../shared/pick';
import { bookingFilterableFields, paginationFields } from './booking.constant';
import { Booking } from '@prisma/client';
import { IAuthUser } from '../../interfaces/common';





// const createBooking = catchAsync(async (req: Request & { user?: IAuthUser }, res: Response) => {
//   const result = await BookingService.createBooking(req.body, req.user!);

//   sendResponse<Booking>(res, {
//     statusCode: httpStatus.CREATED,
//     success: true,
//     message: 'Booking created successfully',
//     data: result,
//   });
// });

const createBooking = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {

    const result = await BookingService.createBooking(req, req.user!);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Booking created successfully',
      data: result,
    });
  }
);



const getBookingById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BookingService.getById(id);

  sendResponse<Booking>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking fetched successfully',
    data: result,
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, bookingFilterableFields);
  const options = pick(req.query, paginationFields);
  
  // This controller assumes an admin can fetch anything, but specific users might have restricted views:
  // const { userId, userRole } = getUserInfoFromReq(req);
  // const result = await BookingService.getAllFromDB(filters, options, userRole, userId);
  
  // For simplicity here, calling the service without role restrictions in controller:
  const result = await BookingService.getAllFromDB(filters, options);


  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bookings fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BookingService.updateBookingStatus(id, req.body);

  sendResponse<Booking>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking status updated successfully',
    data: result,
  });
});

const deleteBooking = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BookingService.deleteBooking(id);
  sendResponse<Booking>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking deleted successfully',
    data: result,
  });
})

const softDeleteBooking = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await BookingService.softDelete(id);

    sendResponse<Booking>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Booking deleted successfully',
        data: result,
    });
});

export const BookingController = {
  createBooking,
  getBookingById,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
  softDeleteBooking,
};
