import { z } from "zod";

const ListingCategorySchema = z.enum([
  "Food",
  "Adventure",
  "Culture",
  "Photography",
  "Nature",
]);

const createListingZodSchema = z.object({
  title: z.string({
    error: "Title is required",
  }),
  description: z.string().optional(),
  price: z
    .number({
      error: "Price is required",
    })
    .int()
    .positive("Price must be a positive integer"),
  location: z.string().optional(),
  images: z.array(z.string()).optional(), // Assuming these might come from user input or separate uploads
  category: ListingCategorySchema,
});

const updateListingZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    price: z.number().int().positive().optional(),
    location: z.string().optional(),
    image: z.string().optional(),
    images: z.array(z.string()).optional(),
    category: ListingCategorySchema.optional(),
    isDeleted: z.boolean().optional(),
  }),
});

export const ListingValidation = {
  createListingZodSchema,
  updateListingZodSchema,
};
