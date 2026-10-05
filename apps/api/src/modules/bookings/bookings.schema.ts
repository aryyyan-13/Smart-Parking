import { z } from 'zod';

export const createBookingSchema = z.object({
  // Accept both real UUIDs and demo IDs (e.g. "demo-001-...")
  listingId: z.string().min(1),
  vehicleId: z.string().optional(),
  vehicleNumber: z.string().optional().default('KA-01-XX-0000'),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  amountPaise: z.number().int().positive().optional(),
  currency: z.string().default('INR'),
  // Guest checkout fields
  guestName: z.string().optional(),
  guestEmail: z.string().email().optional(),
  slotLabel: z.string().optional().default('G-01'),
});
