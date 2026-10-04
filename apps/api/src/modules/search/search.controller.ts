import { Request, Response } from 'express';
import { z } from 'zod';
import { searchSchema } from './search.schema.js';
import { SearchService } from './search.service.js';
import { logger } from '../../lib/logger.js';

export class SearchController {
  static async search(req: Request, res: Response): Promise<void> {
    try {
      const params = searchSchema.parse(req.query);
      const results = await SearchService.searchListings(params);
      res.json(results);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      logger.error({ error }, 'Search failed');
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
