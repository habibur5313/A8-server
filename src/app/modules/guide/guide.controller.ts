import { Request, Response } from 'express';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import { guideFilterableFields } from './guide.constants';
import { GuideService } from './guide.service';

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, guideFilterableFields);

    const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

    const result = await GuideService.getAllFromDB(filters, options);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Guides retrieval successfully',
        meta: result.meta,
        data: result.data,
    });
});

const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await GuideService.getByIdFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Guide retrieval successfully',
        data: result,
    });
});

const updateIntoDB = catchAsync(async (req: Request, res: Response) => {

    const { id } = req.params;
    const result = await GuideService.updateIntoDB(id, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Guide data updated!",
        data: result
    })
});

const deleteFromDB = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await GuideService.deleteFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Guide deleted successfully',
        data: result,
    });
});


const softDelete = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await GuideService.softDelete(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Guide soft deleted successfully',
        data: result,
    });
});

const getAiSuggestion = catchAsync(async (req: Request, res: Response) => {
    const { symptoms } = req.body;

  // Basic validation
  if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length < 5) {
    res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Please provide valid symptoms for doctor suggestion.',
    });
  }

  const result = await GuideService.getAISuggestion({ symptoms: symptoms.trim() });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Guide suggestion retrieval successfully',
        data: result,
    });
});


export const GuideController = {
    updateIntoDB,
    getAllFromDB,
    getByIdFromDB,
    deleteFromDB,
    softDelete,
    getAiSuggestion,
}