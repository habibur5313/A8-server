import express, { NextFunction, Request, Response } from "express";
import { ListingController } from "./listing.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../../helpers/fileUploader";
import { ListingValidation } from "./listing.validation";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.GUIDE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  // Middleware to handle the 'file' field from form-data
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    // 1. Parse the 'data' string field from the form-data into a JSON object
    req.body = JSON.parse(req.body.data as string);

    // 2. Validate the parsed JSON data against the Zod schema
    ListingValidation.createListingZodSchema.parse(req.body);

    // Optional: If a file was uploaded, assign its URL/path to the image field in req.body
    if (req.file && (req.file as any).path) {
      // Assuming your uploader provides a 'path' or 'secure_url'
      req.body.image = (req.file as any).path;
    }

    // 3. Hand off to the controller
    return ListingController.createIntoDB(req, res, next);
  }
);
router.get("/", ListingController.getAllFromDB);
router.get(
  "/:id",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.GUIDE, UserRole.TOURIST),
  ListingController.getByIdFromDB
);
router.patch(
  "/:id",
  auth(UserRole.GUIDE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ListingController.updateIntoDB
);
router.delete(
  "/:id",
  auth(UserRole.GUIDE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ListingController.deleteFromDB
);
router.patch(
  "/soft-delete/:id",
  auth(UserRole.GUIDE, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ListingController.softDelete
);

export default router;
export const ListingRoutes = router;
