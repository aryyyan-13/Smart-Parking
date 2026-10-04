import { z } from 'zod';

export const createListingSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(1000).optional(),
  address: z.string().min(5),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  vehicleType: z.enum(['TWO_WHEELER', 'FOUR_WHEELER']),
  slotLabel: z.string().max(50).optional(),
  pricePerHour: z.number().int().positive().optional(), // in paise
});

export const updateListingSchema = createListingSchema.partial().extend({
  status: z.enum(['DRAFT', 'PUBLISHED', 'UNPUBLISHED']).optional(),
  approvalMode: z.enum(['AUTO', 'MANUAL']).optional(),
});
