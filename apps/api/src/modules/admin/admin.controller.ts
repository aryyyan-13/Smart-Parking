import { Request, Response } from 'express';
import { AdminService } from './admin.service.js';
import { logger } from '../../lib/logger.js';

export class AdminController {
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await AdminService.getStats();
      res.json(stats);
    } catch (error) {
      logger.error({ error }, 'Failed to fetch admin stats');
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getPendingListings(req: Request, res: Response): Promise<void> {
    try {
      const listings = await AdminService.getPendingListings();
      res.json(listings);
    } catch (error) {
      logger.error({ error }, 'Failed to fetch pending listings');
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateListingStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const actorId = req.user!.id;
      const [listing] = await AdminService.updateListingStatus(id as string, status, actorId);
      res.json(listing);
    } catch (error) {
      logger.error({ error }, 'Failed to update listing status');
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await AdminService.getUsers();
      res.json(users);
    } catch (error) {
      logger.error({ error }, 'Failed to fetch users');
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async updateUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const user = await AdminService.updateUserStatus(id as string, status);
      res.json(user);
    } catch (error) {
      logger.error({ error }, 'Failed to update user status');
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const logs = await AdminService.getAuditLogs();
      res.json(logs);
    } catch (error) {
      logger.error({ error }, 'Failed to fetch audit logs');
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
