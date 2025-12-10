import { z } from 'zod';

export const createListingSchema = z.object({
  title: z.string().min(3),
  price: z.number().positive(),
  guideId: z.string(),
  description: z.string().optional(),
  location: z.string().optional(),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
  maxGroupSize: z.number().optional(),
  duration: z.string().optional(),
  category: z.enum(['Food', 'Adventure', 'Culture', 'Photography', 'Nature']).optional(),
  languages: z.array(z.string()).optional(),
});

export const updateListingSchema = createListingSchema.partial();
