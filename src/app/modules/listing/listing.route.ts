import express from 'express';
import { ListingController } from './listing.controller';

const router = express.Router();

router.post('/', ListingController.createListing);
router.get('/', ListingController.getAllListings);
router.get('/:id', ListingController.getListingById);
router.patch('/:id', ListingController.updateListing);
router.delete('/:id', ListingController.deleteListing);
router.patch('/soft-delete/:id', ListingController.softDeleteListing);

export default router;
export const ListingRoutes = router;
