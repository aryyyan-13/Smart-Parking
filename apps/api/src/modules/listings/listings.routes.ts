import { Router } from 'express';
import { ListingsController } from './listings.controller.js';

export const listingsRouter = Router();

listingsRouter.post('/', ListingsController.create);
listingsRouter.get('/me', ListingsController.getMine);
listingsRouter.patch('/:id', ListingsController.update);
