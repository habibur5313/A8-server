// import { UserRole } from '@prisma/client';
import express from 'express';
import auth from '../../middlewares/auth';
import { authLimiter } from '../../middlewares/rateLimiter';
import { AuthController } from './auth.controller';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post(
    '/login',
    authLimiter,
    AuthController.loginUser
);

router.post(
    '/refresh-token',
    AuthController.refreshToken
)

router.post(
    '/change-password',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN,
        UserRole.GUIDE,
        UserRole.TOURIST
    ),
    AuthController.changePassword
);

router.post(
    '/forgot-password',
    AuthController.forgotPassword
);

router.post(
    '/reset-password',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN,
        UserRole.GUIDE,
        UserRole.TOURIST
    ),
    AuthController.resetPassword
)

router.get(
    '/me',
    auth(
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN,
        UserRole.GUIDE,
        UserRole.TOURIST
    ),
    AuthController.getMe
)

export const AuthRoutes = router;