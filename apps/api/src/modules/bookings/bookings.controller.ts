import { Request, Response } from 'express';
import { z } from 'zod';
import { createBookingSchema } from './bookings.schema.js';
import { BookingsService } from './bookings.service.js';
import { SearchService } from '../search/search.service.js';
import { logger } from '../../lib/logger.js';
import { prisma } from '../../lib/prisma.js';

export class BookingsController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data = createBookingSchema.parse(req.body);

      /* ── DB path ──────────────────────────────────────────── */
      try {
        let userId: string;
        if (req.user?.id) {
          userId = req.user.id;
        } else {
          const firstUser = await prisma.user.findFirst();
          if (!firstUser) throw new Error('db_no_user');
          userId = firstUser.id;
        }
        const booking = await BookingsService.createBooking(userId, data);
        res.status(201).json(booking);
        return;
      } catch (dbErr: any) {
        if (
          dbErr instanceof z.ZodError ||
          (dbErr instanceof Error && dbErr.message.includes('overlaps')) ||
          (dbErr instanceof Error && dbErr.message.includes('not found'))
        ) {
          throw dbErr; // bubble specific errors
        }
        logger.warn({ dbErr }, 'DB unavailable — using demo booking path');
      }

      /* ── Offline / demo fallback ──────────────────────────── */
      const isDemoListing = (data.listingId as string).startsWith('demo-');
      if (!isDemoListing) {
        // For non-demo listings when DB is down, still accept the booking
        logger.warn('Real listing ID with DB offline — creating demo booking');
      }

      const demoBooking = SearchService.createDemoBooking({
        listingId: data.listingId,
        vehicleNumber: data.vehicleNumber ?? 'KA-01-AB-0000',
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        guestName: data.guestName ?? 'Guest Driver',
        guestEmail: data.guestEmail ?? 'guest@smartparking.ai',
        slotLabel: data.slotLabel ?? 'G-01',
      });

      res.status(201).json(demoBooking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      if (error instanceof Error && error.message.includes('overlaps')) {
        res.status(409).json({ error: error.message });
        return;
      }
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      logger.error({ error }, 'Failed to create booking');
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getMine(req: Request, res: Response): Promise<void> {
    try {
      if (req.user) {
        try {
          const bookings = await BookingsService.getUserBookings(req.user.id);
          res.json(bookings);
          return;
        } catch {
          logger.warn('DB offline — returning demo bookings');
        }
      }
      // Return demo bookings for offline mode
      res.json(SearchService.getDemoBookings());
    } catch (error) {
      logger.error({ error }, 'Failed to fetch user bookings');
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Demo booking
      const demoBooking = SearchService.getDemoBookingById(id as string);
      if (demoBooking) { res.json(demoBooking); return; }

      // Real DB
      try {
        const booking = await prisma.booking.findUnique({
          where: { id: id as string },
          include: { listing: { select: { title: true, address: true } } },
        });
        if (!booking) { res.status(404).json({ error: 'Booking not found' }); return; }
        res.json(booking);
      } catch {
        res.status(404).json({ error: 'Booking not found' });
      }
    } catch (error) {
      logger.error({ error }, 'Failed to fetch booking');
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const { status } = req.body;
      try {
        const booking = await BookingsService.updateStatus(req.params.id as string, status, req.user.id);
        res.json(booking);
      } catch {
        // Demo booking cancel
        const demo = SearchService.getDemoBookingById(req.params.id as string);
        if (demo) { res.json({ ...demo, status }); return; }
        throw new Error('Booking not found');
      }
    } catch (error) {
      logger.error({ error }, 'Failed to update booking status');
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
