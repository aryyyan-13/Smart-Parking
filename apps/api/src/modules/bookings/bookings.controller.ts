import { Request, Response } from 'express';
import { z } from 'zod';
import { createBookingSchema } from './bookings.schema.js';
import { BookingsService } from './bookings.service.js';
import { logger } from '../../lib/logger.js';
import { prisma } from '../../lib/prisma.js';

export class BookingsController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      let userId = req.user?.id;
      if (!userId) {
        const firstUser = await prisma.user.findFirst();
        if (!firstUser) {
          res.status(500).json({ error: 'No user found to assign booking' });
          return;
        }
        userId = firstUser.id;
      }
      
      const data = createBookingSchema.parse(req.body);
      const booking = await BookingsService.createBooking(userId, data);
      res.status(201).json(booking);
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
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const bookings = await BookingsService.getUserBookings(req.user.id);
      res.json(bookings);
    } catch (error) {
      logger.error({ error }, 'Failed to fetch user bookings');
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
      const booking = await BookingsService.updateStatus(req.params.id as string, status, req.user.id);
      res.json(booking);
    } catch (error) {
      logger.error({ error }, 'Failed to update booking status');
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
