import httpStatus from "http-status";
import prisma from "../../../shared/prisma"
import ApiError from "../../errors/ApiError";
import { IAuthUser } from "../../interfaces/common"
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../../helpers/paginationHelper";
import { Prisma } from "@prisma/client";

const insertIntoDB = async (user: IAuthUser, payload: any) => {
    const touristData = await prisma.tourist.findUniqueOrThrow({
        where: {
            email: user?.email
        }
    });

    return await prisma.$transaction(async (tx) => {
        const result = await tx.review.create({
            data: {
                 touristId: touristData.id,
                 guideId: payload.guideId,
                rating: payload.rating,
                comment: payload.comment
            }
        });

        const averageRating = await tx.review.aggregate({
            _avg: {
                rating: true
            }
        });

        await tx.guide.update({
            where: {
                id: result.guideId
            },
            data: {
                averageRating: averageRating._avg.rating as number
            }
        })

        return result;
    })
};

const getAllFromDB = async (
    filters: any,
    options: IPaginationOptions,
) => {
    const { limit, page, skip } = paginationHelper.calculatePagination(options);
    const { touristEmail, guideEmail } = filters;
    const andConditions = [];

    if (touristEmail) {
        andConditions.push({
            tourist: {
                email: touristEmail
            }
        })
    }

    if (guideEmail) {
        andConditions.push({
            guide: {
                email: guideEmail
            }
        })
    }

    const whereConditions: Prisma.ReviewWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.review.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : {
                    createdAt: 'desc',
                },
        include: {
            guide: true,
            tourist: true,
            //appointment: true,
        },
    });
    const total = await prisma.review.count({
        where: whereConditions,
    });

    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result,
    };
};

export const ReviewService = {
    insertIntoDB,
    getAllFromDB
}