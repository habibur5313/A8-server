// src/modules/listings/listing.constant.ts
export const listingSearchableFields = ["title", "description", "location"];

export const listingFilterableFields: string[] = [
    "searchTerm",
    "category",
    "minPrice",
    "maxPrice",
    "location",
];

export const listingCategories = [
  "Food",
  "Adventure",
  "Culture",
  "Photography",
  "Nature",
] as const;

export type ListingCategory = (typeof listingCategories)[number];
