import express from 'express'
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import { GuideController } from './guide.controller';
import { GuideValidation } from './guide.validation';

const router = express.Router();

// AI driven doctor suggestion
router.get('/suggestion', GuideController.getAiSuggestion);

router.get('/', GuideController.getAllFromDB);

router.get('/:id', GuideController.getByIdFromDB);

router.patch(
    '/:id',
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.GUIDE),
    validateRequest(GuideValidation.update),
    GuideController.updateIntoDB
);

router.delete(
    '/:id',
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    GuideController.deleteFromDB
);

router.delete(
    '/soft/:id',
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
    GuideController.softDelete);

export const GuideRoutes = router