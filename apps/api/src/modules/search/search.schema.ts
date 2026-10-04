import { z } from 'zod';

export const searchSchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().min(0.1).max(50).default(5),
  vehicleType: z.enum(['TWO_WHEELER', 'FOUR_WHEELER']).optional(),
  startTime: z.string().datetime().optional(), // ISO string
  endTime: z.string().datetime().optional(),   // ISO string
});
