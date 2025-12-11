// src/modules/listings/listing.interface.ts
import { Listing } from "@prisma/client";

export type ListingCategory = 'Food' | 'Adventure' | 'Culture' | 'Photography' | 'Nature';


export interface IListing {
  id: string;
  title: string;
  description?: string;
  price: number;
  location?: string;
  image?: string;
  images?: string[];
  guideId: string;
  category?: ListingCategory;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface IListingCreate {
  title: string;
  description?: string;
  price: number;
  location?: string;
  image?: string;
  images?: string[]; // array of image URLs
  guideId: string;
  maxGroupSize?: number;
  duration?: string;
  category?: ListingCategory;
  languages?: string[];
}

export interface IListingUpdate {
  title?: string;
  description?: string;
  price?: number;
  location?: string;
  image?: string;
  images?: string[];
  maxGroupSize?: number;
  duration?: string;
  category?: ListingCategory;
  languages?: string[];
  isDeleted?: boolean;
}

export interface IListingFilterRequest {
  searchTerm?: string;
  category?: ListingCategory | ListingCategory[];
  minPrice?: number;
  maxPrice?: number;
  location?: string;
}

export type IListingResponse = Listing;
