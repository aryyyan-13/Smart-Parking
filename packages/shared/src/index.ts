// Ponytail cut: Instead of maintaining a separate constants file that mirrors Prisma enums,
// we just re-export the generated types directly from Prisma.
export type {
  UserRole,
  UserStatus,
  VehicleType,
  ListingStatus,
  ApprovalMode,
  PricingUnit,
  BookingStatus,
  NotificationType,
} from '@prisma/client';

export const ACTIVE_BOOKING_STATUSES = [
  'REQUESTED',
  'PENDING',
  'CONFIRMED',
];

export const INACTIVE_BOOKING_STATUSES = [
  'CANCELLED',
  'DECLINED',
  'EXPIRED',
  'COMPLETED',
];

export const DEFAULT_CURRENCY = 'INR' as const;
export const DEFAULT_PENDING_EXPIRY_MINUTES = 30;
export const MAX_LISTING_PHOTOS = 10;
export const MAX_SEARCH_RADIUS_KM = 50;
export const DEFAULT_SEARCH_RADIUS_KM = 5;
