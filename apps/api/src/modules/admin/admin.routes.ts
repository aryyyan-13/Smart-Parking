import { Router } from 'express';
import { AdminController } from './admin.controller.js';
import { requireAdmin } from '../../middleware/auth.js';

export const adminRouter = Router();

adminRouter.use(requireAdmin);

adminRouter.get('/stats', AdminController.getStats);
adminRouter.get('/listings/pending', AdminController.getPendingListings);
adminRouter.patch('/listings/:id/status', AdminController.updateListingStatus);
adminRouter.get('/users', AdminController.getUsers);
adminRouter.patch('/users/:id/status', AdminController.updateUserStatus);
adminRouter.get('/audit-logs', AdminController.getAuditLogs);
