import { Request, Response } from 'express';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import { ListingService } from './listing.service';
import { listingFilterableFields } from './listing.constant';

const createListing = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await ListingService.createListing(payload);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Listing created successfully',
    data: result,
  });
});

const getAllListings = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, listingFilterableFields);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await ListingService.getAllListings(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Listings retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getListingById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ListingService.getListingById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Listing retrieved successfully',
    data: result,
  });
});

const updateListing = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ListingService.updateListing(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Listing updated successfully',
    data: result,
  });
});

const deleteListing = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ListingService.deleteListing(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Listing deleted successfully',
    data: result,
  });
});

const softDeleteListing = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ListingService.softDeleteListing(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Listing soft deleted successfully',
    data: result,
  });
});

export const ListingController = {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
  softDeleteListing,
};
