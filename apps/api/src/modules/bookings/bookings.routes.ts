import { Router } from 'express';
import { BookingsController } from './bookings.controller.js';
import { authMiddleware } from '../../middleware/auth.js';

export const bookingsRouter = Router();

// Allow public access to create booking for the demo
bookingsRouter.post('/', BookingsController.create);

bookingsRouter.use(authMiddleware);
bookingsRouter.get('/me', BookingsController.getMine);
bookingsRouter.patch('/:id/status', BookingsController.updateStatus);
