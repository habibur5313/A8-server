// src/modules/bookings/booking.constant.ts

export const bookingSearchableFields = [
  'id',
  'listingId',
  'touristId',
];

export const bookingFilterableFields = [
  'searchTerm',
  'status',
  'paymentStatus',
  'touristId',
  // Note: guideId can be used for filtering via the listing relation
];

export const paginationFields = ['page', 'limit', 'sortBy', 'sortOrder'];