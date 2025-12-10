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
  maxGroupSize?: number;
  duration?: string;
  category?: ListingCategory;
  languages?: string[];
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
  images?: string[];
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
}
