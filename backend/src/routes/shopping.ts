import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { aiClient, AiServiceError } from '../services/aiClient.js';
import { ApiError } from '../middleware/errorHandler.js';
import { createResourceRouter } from './resource.js';

export const shoppingRouter = Router();

// Must be registered before the generic /:id resource router below,
// otherwise GET /:id would match "search" as an id.
shoppingRouter.get('/search', requireAuth, async (req, res, next) => {
  const query = req.query.q;
  if (typeof query !== 'string' || query.trim().length === 0) {
    return next(new ApiError(400, 'Query parameter "q" is required'));
  }
  try {
    const results = await aiClient.searchShopping(query);
    res.json({ data: results, sortedBy: 'price_ascending' });
  } catch (err) {
    if (err instanceof AiServiceError) {
      return res.status(503).json({ error: 'Price comparison is temporarily unavailable.' });
    }
    next(err);
  }
});

shoppingRouter.use('/', createResourceRouter('shopping'));
