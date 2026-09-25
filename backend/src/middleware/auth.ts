import type { NextFunction, Request, Response } from 'express';
import { ApiError } from './errorHandler.js';

export interface AuthedRequest extends Request {
  userId?: string;
  accessToken?: string;
}

/**
 * Extracts the Supabase-issued JWT from the Authorization header.
 * Actual verification/RLS enforcement happens in Supabase when the
 * per-user client executes queries — this only makes the token available.
 */
export function requireAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Missing bearer token'));
  }
  const token = header.slice('Bearer '.length);
  req.accessToken = token;
  next();
}
