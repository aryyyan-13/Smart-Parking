import { z } from 'zod';

export const createBookingSchema = z.object({
  listingId: z.string().uuid(),
  vehicleId: z.string().uuid().optional(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  amountPaise: z.number().int().positive(),
  currency: z.string().default('INR'),
});
