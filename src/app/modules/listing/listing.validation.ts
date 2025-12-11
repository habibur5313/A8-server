// src/modules/listings/listing.validation.ts
import { z } from "zod";

export const createListingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  price: z.coerce.number().nonnegative("Price must be >= 0"),
  location: z.string().optional(),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
  guideId: z.string().uuid("guideId must be a valid UUID"),
  maxGroupSize: z.coerce.number().int().positive().optional(),
  duration: z.string().optional(),
  category: z.enum(['Food', 'Adventure', 'Culture', 'Photography', 'Nature']).optional(),
  languages: z.array(z.string()).optional(),
});

export const updateListingSchema = createListingSchema.partial();

