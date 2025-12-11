import { PaymentStatus, UserRole } from "@prisma/client";
import { IAuthUser } from "../../interfaces/common";
import ApiError from "../../errors/ApiError";
import prisma from "../../../shared/prisma";

const fetchDashboardMetaData = async (user: IAuthUser) => {
    let metaData;
    switch (user?.role) {
        case UserRole.SUPER_ADMIN:
            metaData = getSuperAdminMetaData();
            break;
        case UserRole.ADMIN:
            metaData = getAdminMetaData();
            break;
        case UserRole.GUIDE:
            metaData = getGuideMetaData(user as IAuthUser);
            break;
        case UserRole.TOURIST:
            metaData = getTouristMetaData(user)
            break;
        default:
            throw new Error('Invalid user role!')
    }

    return metaData;
};

const getSuperAdminMetaData = async () => {
    const bookingCount = await prisma.booking.count();
    const touristCount = await prisma.tourist.count();
    const guideCount = await prisma.guide.count();
    const adminCount = await prisma.admin.count();
    const paymentCount = await prisma.payment.count();

    const totalRevenue = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
            status: PaymentStatus.PAID
        }
    });

    const barChartData = await getBarChartData();
    const pieCharData = await getPieChartData();

    return { bookingCount, touristCount, guideCount, adminCount, paymentCount, totalRevenue, barChartData, pieCharData }
}

const getAdminMetaData = async () => {
    const bookingCount = await prisma.booking.count();
    const touristCount = await prisma.tourist.count();
    const guideCount = await prisma.guide.count();
    const paymentCount = await prisma.payment.count();

    const totalRevenue = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
            status: PaymentStatus.PAID
        }
    });

    const barChartData = await getBarChartData();
    const pieCharData = await getPieChartData();

    return { bookingCount, touristCount, guideCount, paymentCount, totalRevenue, barChartData, pieCharData }
}

const getGuideMetaData = async (user: IAuthUser) => {
    const guideData = await prisma.guide.findUniqueOrThrow({
        where: {
            email: user?.email
        }
    });

    const bookingCount = await prisma.booking.count({
        where: {
            listing: {
                guideId: guideData.id
            }
        }
    });

    const touristCount = await prisma.booking.groupBy({
        by: ['touristId'],
        _count: {
            id: true
        }
    });

    const reviewCount = await prisma.review.count({
        where: {
            guideId: guideData.id
        }
    });

    const totalRevenue = await prisma.payment.aggregate({
        _sum: {
            amount: true
        },
        where: {
            booking: {
                listing: {
                    guideId: guideData.id
                }
            },
            status: PaymentStatus.PAID
        }
    });

    const bookingStatusDistribution = await prisma.booking.groupBy({
        by: ['status'],
        _count: { id: true },
        where: {
            listing: {
                guideId: guideData.id
            }
        }
    });

    const formattedbookingStatusDistribution = bookingStatusDistribution.map(({ status, _count }) => ({
        status,
        count: Number(_count.id)
    }))

    return {
        bookingCount,
        reviewCount,
        touristCount: touristCount.length,
        totalRevenue,
        formattedbookingStatusDistribution
    }
}

const getTouristMetaData = async (user: IAuthUser) => {
    const touristData = await prisma.tourist.findUniqueOrThrow({
        where: {
            email: user?.email
        }
    });

    const bookingCount = await prisma.booking.count({
        where: {
            touristId: touristData.id
        }
    });


    const reviewCount = await prisma.review.count({
        where: {
            touristId: touristData.id
        }
    });

    const bookingStatusDistribution = await prisma.booking.groupBy({
        by: ['status'],
        _count: { id: true },
        where: {
            touristId: touristData.id
        }
    });

    const formattedbookingStatusDistribution = bookingStatusDistribution.map(({ status, _count }) => ({
        status,
        count: Number(_count.id)
    }))

    return {
        bookingCount,
        reviewCount,
        formattedbookingStatusDistribution
    }
}

const getBarChartData = async () => {
    const bookingCountByMonth: { month: Date, count: bigint }[] = await prisma.$queryRaw`
        SELECT DATE_TRUNC('month', "createdAt") AS month,
        CAST(COUNT(*) AS INTEGER) AS count
        FROM "bookings"
        GROUP BY month
        ORDER BY month ASC
    `

    return bookingCountByMonth;
};

const getPieChartData = async () => {
    const bookingStatusDistribution = await prisma.booking.groupBy({
        by: ['status'],
        _count: { id: true }
    });

    const formattedbookingStatusDistribution = bookingStatusDistribution.map(({ status, _count }) => ({
        status,
        count: Number(_count.id)
    }));

    return formattedbookingStatusDistribution;
}

export const MetaService = {
    fetchDashboardMetaData
}