// src/modules/listings/listing.controller.ts
import { listingFilterableFields } from "./listing.constant";
import httpStatus from "http-status";
import { Request, Response, NextFunction } from "express";
import { ListingService } from "./listing.service";
import sendResponse from "../../../shared/sendResponse";
import pick from "../../../shared/pick";
import { IAuthUser } from "../../interfaces/common";

const getAllFromDB = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const filters = pick(req.query, listingFilterableFields);

  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await ListingService.getAllFromDB(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Tour retrieval successfully",
    meta: result.meta,
    data: result.data,
  });
};

const getByIdFromDB = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const result = await ListingService.getByIdFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Tour retrieval successfully",
    data: result,
  });
};

const createIntoDB = async (
  req: Request & { user?: IAuthUser },
  res: Response,
  next: NextFunction
) => {
  const result = await ListingService.createIntoDB(req,req.user!);
  console.log("result", result)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Tour Created successfully",
    data: result,
  });
};

const updateIntoDB = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const result = await ListingService.updateIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Tour data updated!",
    data: result,
  });
};

const deleteFromDB = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const result = await ListingService.deleteFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Tour deleted successfully",
    data: result,
  });
};

const softDelete = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  // soft delete preferred
  const result = await ListingService.softDelete(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Tour deleted successfully",
    data: result,
  });
};

export const ListingController = {
  getAllFromDB,
  getByIdFromDB,
  createIntoDB,
  updateIntoDB,
  deleteFromDB,
  softDelete,
};
