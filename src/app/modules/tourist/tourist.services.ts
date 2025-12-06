import { Prisma, UserStatus, Tourist } from "@prisma/client";
import { paginationHelper } from "../../../helpers/paginationHelper";
import prisma from "../../../shared/prisma";
import { IPaginationOptions } from "../../interfaces/pagination";
import { ITouristFilterRequest } from "./tourist.interface";
import { touristSearchableFields } from "./tourist.constants";

const getAllFromDB = async (
filters: ITouristFilterRequest,
options: IPaginationOptions
) => {
const { limit, page, skip } = paginationHelper.calculatePagination(options);
const { searchTerm, ...filterData } = filters;

const andConditions: Prisma.TouristWhereInput[] = [];

if (searchTerm) {
andConditions.push({
OR: touristSearchableFields.map((field) => ({
[field]: { contains: searchTerm, mode: "insensitive" },
})),
});
}

if (Object.keys(filterData).length > 0) {
const filterConditions = Object.keys(filterData).map((key) => ({
[key]: { equals: (filterData as any)[key] },
}));
andConditions.push(...filterConditions);
}

andConditions.push({ isDeleted: false });

const whereConditions: Prisma.TouristWhereInput =
andConditions.length > 0 ? { AND: andConditions } : {};

const result = await prisma.tourist.findMany({
where: whereConditions,
skip,
take: limit,
orderBy:
options.sortBy && options.sortOrder
? { [options.sortBy]: options.sortOrder }
: { createdAt: "desc" },
});

const total = await prisma.tourist.count({ where: whereConditions });

return { meta: { total, page, limit }, data: result };
};

const getByIdFromDB = async (id: string): Promise<Tourist | null> => {
const tourist = await prisma.tourist.findUnique({
where: { id },
});
if (!tourist || tourist.isDeleted) return null;
return tourist;
};

const updateIntoDB = async (id: string, payload: Partial<Tourist>): Promise<Tourist | null> => {
const touristInfo = await prisma.tourist.findUniqueOrThrow({ where: { id } });

const updatedTourist = await prisma.tourist.update({
where: { id },
data: payload,
});

return updatedTourist;
};

const deleteFromDB = async (id: string): Promise<Tourist | null> => {
const result = await prisma.$transaction(async (tx) => {
const deletedTourist = await tx.tourist.delete({ where: { id } });
await tx.user.delete({ where: { id: deletedTourist.userId } });
return deletedTourist;
});

return result;
};

const softDelete = async (id: string): Promise<Tourist | null> => {
const result = await prisma.$transaction(async (tx) => {
const deletedTourist = await tx.tourist.update({
where: { id },
data: { isDeleted: true },
});
await tx.user.update({
where: { id: deletedTourist.userId },
data: { status: UserStatus.DELETED },
});
return deletedTourist;
});

return result;
};

export const TouristService = {
getAllFromDB,
getByIdFromDB,
updateIntoDB,
deleteFromDB,
softDelete,
};
