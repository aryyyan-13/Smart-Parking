import { prisma } from '../../lib/prisma.js';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { searchSchema } from './search.schema.js';

export class SearchService {
  static async searchListings(params: z.infer<typeof searchSchema>) {
    const { lat, lng, radiusKm, vehicleType, startTime, endTime } = params;

    // Use Prisma.sql for safe parameterized queries
    const vehicleFilter = vehicleType
      ? Prisma.sql`AND vehicle_type = ${vehicleType}::"VehicleType"`
      : Prisma.empty;

    // PostGIS on-the-fly casting
    let query;
    if (lat !== undefined && lng !== undefined) {
      query = Prisma.sql`
        SELECT
          l.id, l.title as name, l.address, l.latitude as lat, l.longitude as lng, l.vehicle_type as "vehicleType", l.status,
          (SELECT amount FROM price_rules pr WHERE pr.listing_id = l.id AND pr.unit = 'HOUR' LIMIT 1) as "pricePerHour",
          ST_Distance(
            ST_MakePoint(l.longitude::float, l.latitude::float)::geography,
            ST_MakePoint(${lng}, ${lat})::geography
          ) as distance
        FROM listings l
        WHERE l.status = 'PUBLISHED'
          AND l.deleted_at IS NULL
          ${vehicleFilter}
          AND ST_DWithin(
            ST_MakePoint(l.longitude::float, l.latitude::float)::geography,
            ST_MakePoint(${lng}, ${lat})::geography,
            ${radiusKm * 1000}
          )
        ORDER BY distance ASC
        LIMIT 100
      `;
    } else {
      query = Prisma.sql`
        SELECT
          l.id, l.title as name, l.address, l.latitude as lat, l.longitude as lng, l.vehicle_type as "vehicleType", l.status,
          (SELECT amount FROM price_rules pr WHERE pr.listing_id = l.id AND pr.unit = 'HOUR' LIMIT 1) as "pricePerHour",
          0 as distance
        FROM listings l
        WHERE l.status = 'PUBLISHED'
          AND l.deleted_at IS NULL
          ${vehicleFilter}
        LIMIT 100
      `;
    }

    const results = await prisma.$queryRaw<any[]>(query);

    // If startTime and endTime are provided, filter out listings that have conflicting bookings
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);

      const listingIds = results.map(r => r.id);
      
      if (listingIds.length > 0) {
        // Find conflicting bookings
        const conflicts = await prisma.booking.findMany({
          where: {
            listingId: { in: listingIds },
            status: { in: ['CONFIRMED', 'PENDING'] },
            NOT: {
              OR: [
                { endsAt: { lte: start } },
                { startsAt: { gte: end } }
              ]
            }
          },
          select: { listingId: true }
        });

        const conflictingListingIds = new Set(conflicts.map(c => c.listingId));
        return results.filter(r => !conflictingListingIds.has(r.id));
      }
    }

    return results;
  }

  static async getById(id: string) {
    // Validate UUID format before querying Prisma to prevent 500 crash
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return null;
    }

    const listing = await prisma.listing.findUnique({
      where: { id, status: 'PUBLISHED' },
      include: {
        priceRules: true,
      },
    });

    if (!listing) return null;

    const basePrice = listing.priceRules[0]?.amount ?? 5000;

    return {
      id: listing.id,
      name: listing.title,
      address: listing.address,
      lat: Number(listing.latitude),
      lng: Number(listing.longitude),
      distance: 0,
      pricePerHour: basePrice,
      vehicleType: listing.vehicleType,
      isEV: true, // Mocked for Phase 1
      isAccessible: true, // Mocked for Phase 1
      hasCCTV: true, // Mocked for Phase 1
      cctvScore: 98,
      rating: 4.8,
      totalSpots: 50,
      availableSpots: 12,
      densityZone: 'medium',
      cityId: 'ALL',
      cityName: 'India',
    };
  }
}
