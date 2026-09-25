import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { aiClient, AiServiceError } from '../services/aiClient.js';
import { ApiError } from '../middleware/errorHandler.js';
import { createResourceRouter } from './resource.js';

export const travelRouter = Router();

// Registered before the generic /:id resource router below.
travelRouter.get('/flights', requireAuth, async (req, res, next) => {
  const { origin, destination, departureDate, adults } = req.query;
  if (typeof origin !== 'string' || typeof destination !== 'string' || typeof departureDate !== 'string') {
    return next(new ApiError(400, 'origin, destination, and departureDate query params are required'));
  }
  try {
    const results = await aiClient.searchFlights({
      origin,
      destination,
      departureDate,
      adults: adults ? Number(adults) : undefined,
    });
    res.json({ data: results, sortedBy: 'price_ascending' });
  } catch (err) {
    if (err instanceof AiServiceError) {
      return res.status(503).json({ error: 'Flight search is temporarily unavailable.' });
    }
    next(err);
  }
});

travelRouter.get('/hotels', requireAuth, async (req, res, next) => {
  const { destination, checkInDate, checkOutDate, adults } = req.query;
  if (typeof destination !== 'string' || typeof checkInDate !== 'string' || typeof checkOutDate !== 'string') {
    return next(new ApiError(400, 'destination, checkInDate, and checkOutDate query params are required'));
  }
  try {
    const results = await aiClient.searchHotels({
      destination,
      checkInDate,
      checkOutDate,
      adults: adults ? Number(adults) : undefined,
    });
    res.json({ data: results, sortedBy: 'price_ascending' });
  } catch (err) {
    if (err instanceof AiServiceError) {
      return res.status(503).json({ error: 'Hotel search is temporarily unavailable.' });
    }
    next(err);
  }
});

travelRouter.use('/', createResourceRouter('travel'));
