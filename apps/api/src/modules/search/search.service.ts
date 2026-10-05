import { prisma } from '../../lib/prisma.js';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { searchSchema } from './search.schema.js';
import { logger } from '../../lib/logger.js';

/* ── Realistic demo fallback (used when DB is unreachable) ── */
const DEMO_LISTINGS = [
  {
    id: 'demo-001-0000-0000-000000000001',
    name: 'Phoenix Marketcity Basement P1',
    address: 'Whitefield Main Rd, Whitefield, Bengaluru, 560066',
    lat: 12.9977, lng: 77.6955,
    vehicleType: 'CAR', status: 'PUBLISHED',
    pricePerHour: 4000, distance: 320,
    isEV: true, isAccessible: true, hasCCTV: true, cctvScore: 99,
    rating: 4.7, totalSpots: 200, availableSpots: 34, densityZone: 'low',
    cityId: 'BLR', cityName: 'Bengaluru',
  },
  {
    id: 'demo-002-0000-0000-000000000002',
    name: 'UB City Underground Parking',
    address: 'Vittal Mallya Rd, Shanthala Nagar, Bengaluru, 560001',
    lat: 12.9719, lng: 77.5946,
    vehicleType: 'CAR', status: 'PUBLISHED',
    pricePerHour: 6000, distance: 850,
    isEV: true, isAccessible: true, hasCCTV: true, cctvScore: 97,
    rating: 4.9, totalSpots: 120, availableSpots: 8, densityZone: 'high',
    cityId: 'BLR', cityName: 'Bengaluru',
  },
  {
    id: 'demo-003-0000-0000-000000000003',
    name: 'Mantri Square Mall Level B2',
    address: 'Sampige Rd, Malleswaram, Bengaluru, 560003',
    lat: 12.9915, lng: 77.5678,
    vehicleType: 'CAR', status: 'PUBLISHED',
    pricePerHour: 3500, distance: 1200,
    isEV: false, isAccessible: true, hasCCTV: true, cctvScore: 94,
    rating: 4.5, totalSpots: 180, availableSpots: 55, densityZone: 'medium',
    cityId: 'BLR', cityName: 'Bengaluru',
  },
  {
    id: 'demo-004-0000-0000-000000000004',
    name: 'Indiranagar 100 Feet Road Open Lot',
    address: '100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru, 560038',
    lat: 12.9784, lng: 77.6408,
    vehicleType: 'CAR', status: 'PUBLISHED',
    pricePerHour: 2000, distance: 1800,
    isEV: false, isAccessible: false, hasCCTV: true, cctvScore: 88,
    rating: 4.2, totalSpots: 60, availableSpots: 22, densityZone: 'medium',
    cityId: 'BLR', cityName: 'Bengaluru',
  },
  {
    id: 'demo-005-0000-0000-000000000005',
    name: 'Koramangala Forum Mall P3',
    address: 'Hosur Rd, Koramangala 1 Block, Bengaluru, 560029',
    lat: 12.9349, lng: 77.6107,
    vehicleType: 'CAR', status: 'PUBLISHED',
    pricePerHour: 5000, distance: 2100,
    isEV: true, isAccessible: true, hasCCTV: true, cctvScore: 96,
    rating: 4.8, totalSpots: 150, availableSpots: 18, densityZone: 'high',
    cityId: 'BLR', cityName: 'Bengaluru',
  },
  {
    id: 'demo-006-0000-0000-000000000006',
    name: 'Jayanagar 4th Block BBMP Parking',
    address: '4th Block, Jayanagar, Bengaluru, 560041',
    lat: 12.9282, lng: 77.5832,
    vehicleType: 'TWO_WHEELER', status: 'PUBLISHED',
    pricePerHour: 1000, distance: 2800,
    isEV: false, isAccessible: false, hasCCTV: false, cctvScore: 75,
    rating: 3.9, totalSpots: 80, availableSpots: 45, densityZone: 'low',
    cityId: 'BLR', cityName: 'Bengaluru',
  },
];

const DEMO_BOOKINGS: Array<{
  id: string; listingId: string; vehicleNumber: string;
  startsAt: string; endsAt: string; totalAmount: number;
  status: string; guestName: string; guestEmail: string;
  slotLabel: string; createdAt: string;
}> = [];

function isDemoId(id: string): boolean {
  return id.startsWith('demo-');
}

async function dbHealthy(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export class SearchService {
  static async searchListings(params: z.infer<typeof searchSchema>) {
    const { lat, lng, radiusKm, vehicleType } = params;

    /* Try real DB first */
    try {
      const vehicleFilter = vehicleType
        ? Prisma.sql`AND vehicle_type = ${vehicleType}::"VehicleType"`
        : Prisma.empty;

      let query;
      if (lat !== undefined && lng !== undefined) {
        query = Prisma.sql`
          SELECT
            l.id, l.title as name, l.address, l.latitude as lat, l.longitude as lng,
            l.vehicle_type as "vehicleType", l.status,
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
            l.id, l.title as name, l.address, l.latitude as lat, l.longitude as lng,
            l.vehicle_type as "vehicleType", l.status,
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
      logger.info({ count: results.length }, 'Search returned from DB');
      return results;
    } catch (err) {
      logger.warn({ err }, 'DB unavailable — returning demo listings');
    }

    /* Fallback: return demo data filtered by vehicleType */
    let results = DEMO_LISTINGS;
    if (vehicleType) results = results.filter(l => l.vehicleType === vehicleType);
    return results;
  }

  static async getById(id: string) {
    /* Demo shortcut */
    if (isDemoId(id)) {
      return DEMO_LISTINGS.find(l => l.id === id) ?? null;
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) return null;

    try {
      const listing = await prisma.listing.findUnique({
        where: { id, status: 'PUBLISHED' },
        include: { priceRules: true },
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
        isEV: true, isAccessible: true, hasCCTV: true,
        cctvScore: 98, rating: 4.8,
        totalSpots: 50, availableSpots: 12,
        densityZone: 'medium', cityId: 'BLR', cityName: 'Bengaluru',
      };
    } catch {
      return null;
    }
  }

  /* ── Demo booking store (in-memory for offline mode) ──── */
  static createDemoBooking(body: {
    listingId: string; vehicleNumber: string;
    startsAt: string; endsAt: string; guestName: string;
    guestEmail: string; slotLabel: string;
  }) {
    const listing = DEMO_LISTINGS.find(l => l.id === body.listingId);
    const hours = (new Date(body.endsAt).getTime() - new Date(body.startsAt).getTime()) / 3600000;
    const total = Math.round(hours * (listing?.pricePerHour ?? 4000));

    const booking = {
      id: `booking-${Date.now()}`,
      listingId: body.listingId,
      vehicleNumber: body.vehicleNumber,
      startsAt: body.startsAt,
      endsAt: body.endsAt,
      totalAmount: total,
      status: 'CONFIRMED',
      guestName: body.guestName,
      guestEmail: body.guestEmail,
      slotLabel: body.slotLabel,
      createdAt: new Date().toISOString(),
    };

    DEMO_BOOKINGS.push(booking);
    logger.info({ booking }, 'Demo booking created (offline mode)');
    return booking;
  }

  static getDemoBookings() { return DEMO_BOOKINGS; }

  static getDemoBookingById(id: string) {
    return DEMO_BOOKINGS.find(b => b.id === id) ?? null;
  }
}
