import express from 'express';
import { apiLimiter } from '../middlewares/rateLimiter';
import { userRoutes } from '../modules/user/user.routes';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { AdminRoutes } from '../modules/admin/admin.routes';
import { GuideRoutes } from '../modules/guide/guide.routes';
import { TouristRoutes } from '../modules/tourist/tourist.route';
import { ListingRoutes } from '../modules/listing/listing.route';
import { PaymentRoutes } from '../modules/payment/payment.routes';
import { ReviewRoutes } from '../modules/review/review.routes';
import { MetaRoutes } from '../modules/meta/meta.routes';
import { BookingRoutes } from '../modules/booking/booking.routes';

const router = express.Router();



// router.use(apiLimiter); // Apply to all routes

const moduleRoutes = [
    {
        path: '/user',
        route: userRoutes
    },
    {
        path: '/auth',
        route: AuthRoutes
    },
    {
        path: '/admin',
        route: AdminRoutes
    },
    {
        path: '/guide',
        route: GuideRoutes
    },
    {
        path: '/tourist',
        route: TouristRoutes
    },
    {
        path: '/listing',
        route: ListingRoutes
    },
    {
        path: '/booking',
        route: BookingRoutes
    },
    {
        path: '/payment',
        route: PaymentRoutes
    },
    {
        path: '/review',
        route: ReviewRoutes
    },
    {
        path: '/meta',
        route: MetaRoutes
    }
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;