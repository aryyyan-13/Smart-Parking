import { Router } from 'express';
import { SearchController } from './search.controller.js';

export const searchRouter = Router();

searchRouter.get('/', SearchController.search);
searchRouter.get('/:id', SearchController.getById);
