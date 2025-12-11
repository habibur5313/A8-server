import express from 'express';
import { ListingController } from './listing.controller';

const router = express.Router();

router.post('/', ListingController.createIntoDB);
router.get('/', ListingController.getAllFromDB);
router.get('/:id', ListingController.getByIdFromDB);
router.patch('/:id', ListingController.updateIntoDB);
router.delete('/:id', ListingController.deleteFromDB);
router.patch('/soft-delete/:id', ListingController.softDelete);

export default router;
export const ListingRoutes = router;
