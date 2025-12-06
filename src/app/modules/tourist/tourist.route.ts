import express from 'express';
import { TouristController } from './tourist.controller';

const router = express.Router();

router.get(
    '/',
    TouristController.getAllFromDB
);

router.get(
    '/:id',
    TouristController.getByIdFromDB
);

router.patch(
    '/:id',
    TouristController.updateIntoDB
);

router.delete(
    '/:id',
    TouristController.deleteFromDB
);
router.delete(
    '/soft/:id',
    TouristController.softDelete
);

export const TouristRoutes = router;
