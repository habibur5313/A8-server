import { Request, Response } from "express";
import { userService } from "./user.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import pick from "../../../shared/pick";
import { userFilterableFields } from "./user.constant";
import { IAuthUser } from "../../interfaces/common";

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createAdmin(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin created successfully!",
    data: result,
  });
});

const createGuide = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createGuide(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Guide created successfully!",
    data: result,
  });
});

const createTourist = catchAsync(async (req: Request, res: Response) => {
    console.log(req.body, "controller body")
  const result = await userService.createTourist(req);

  console.log(result)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Tourist created successfully!",
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, userFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await userService.getAllFromDB(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users fetched successfully!",
    meta: result.meta,
    data: result.data,
  });
});

const changeProfileStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await userService.changeProfileStatus(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User status updated!",
    data: result,
  });
});

const getMyProfile = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await userService.getMyProfile(req.user!);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My profile fetched!",
      data: result,
    });
  }
);

const updateMyProfile = catchAsync(
  async (req: Request & { user?: IAuthUser }, res: Response) => {
    const result = await userService.updateMyProfile(req.user!, req);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My profile updated!",
      data: result,
    });
  }
);

export const userController = {
  createAdmin,
  createGuide,
  createTourist,
  getAllFromDB,
  changeProfileStatus,
  getMyProfile,
  updateMyProfile,
};
