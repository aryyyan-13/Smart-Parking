import { Request, Response } from 'express';
import { z } from 'zod';
import { createListingSchema, updateListingSchema } from './listings.schema.js';
import { ListingsService } from './listings.service.js';
import { logger } from '../../lib/logger.js';

export class ListingsController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const data = createListingSchema.parse(req.body);
      const listing = await ListingsService.createListing(req.user, data);
      res.status(201).json(listing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      logger.error({ error }, 'Failed to create listing');
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getMine(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const listings = await ListingsService.getUserListings(req.user);
      res.json(listings);
    } catch (error) {
      logger.error({ error }, 'Failed to fetch user listings');
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const listingId = req.params.id;
      const data = updateListingSchema.parse(req.body);
      const listing = await ListingsService.updateListing(req.user, listingId, data);
      res.json(listing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      logger.error({ error }, 'Failed to update listing');
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
