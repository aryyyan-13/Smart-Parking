import { Router } from 'express';
import { BookingsController } from './bookings.controller.js';
import { authMiddleware } from '../../middleware/auth.js';

export const bookingsRouter = Router();

// Public: create booking (works in demo mode without auth)
bookingsRouter.post('/', BookingsController.create);

// Public: get single booking by ID (for confirmation page)
bookingsRouter.get('/:id', BookingsController.getById);

// Protected routes
bookingsRouter.use(authMiddleware);
bookingsRouter.get('/me', BookingsController.getMine);
bookingsRouter.patch('/:id/status', BookingsController.updateStatus);
