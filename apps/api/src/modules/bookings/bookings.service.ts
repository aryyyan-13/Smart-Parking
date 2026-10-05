import { prisma } from '../../lib/prisma.js';
import { z } from 'zod';
import { createBookingSchema } from './bookings.schema.js';

export class BookingsService {
  static async createBooking(driverId: string, data: z.infer<typeof createBookingSchema>) {
    return prisma.$transaction(async (tx) => {
      const listing = await tx.listing.findUnique({
        where: { id: data.listingId },
      });
      if (!listing) {
        throw new Error('Listing not found');
      }

      let vehicleId = data.vehicleId;
      if (!vehicleId) {
        let vehicle = await tx.vehicle.findFirst({ where: { userId: driverId } });
        if (!vehicle) {
          vehicle = await tx.vehicle.create({
            data: {
              userId: driverId,
              organizationId: listing.organizationId,
              licensePlate: 'DEMO-' + Math.floor(Math.random() * 9999),
              type: listing.vehicleType,
            }
          });
        }
        vehicleId = vehicle.id;
      }

      // Check for overlapping confirmed/pending bookings
      const overlapping = await tx.booking.findFirst({
        where: {
          listingId: data.listingId,
          status: { in: ['CONFIRMED', 'PENDING'] },
          OR: [
            {
              startsAt: { lt: data.endsAt },
              endsAt: { gt: data.startsAt },
            },
          ],
        },
      });

      if (overlapping) {
        throw new Error('Time slot overlaps with an existing booking');
      }

      const booking = await tx.booking.create({
        data: {
          organizationId: listing.organizationId,
          listingId: listing.id,
          driverId,
          vehicleId,
          startsAt: data.startsAt,
          endsAt: data.endsAt,
          amountPaise: data.amountPaise,
          currency: data.currency,
          status: listing.approvalMode === 'AUTO' ? 'CONFIRMED' : 'PENDING',
        },
      });

      return booking;
    });
  }

  static async getUserBookings(driverId: string) {
    return prisma.booking.findMany({
      where: { driverId },
      include: {
        listing: { select: { title: true, address: true, slotLabel: true } },
        vehicle: { select: { licensePlate: true, type: true } },
      },
      orderBy: { startsAt: 'desc' },
    });
  }

  static async updateStatus(bookingId: string, status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED', driverId?: string) {
    return prisma.booking.update({
      where: {
        id: bookingId,
        ...(driverId ? { driverId } : {}),
      },
      data: { status },
    });
  }
}
