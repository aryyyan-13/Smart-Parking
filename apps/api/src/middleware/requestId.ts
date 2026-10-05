import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * Middleware that assigns a unique request ID to each incoming HTTP request.
 * Reads X-Request-Id header if present; otherwise generates a new UUID v4.
 * Attaches id to req.id and sets the X-Request-Id response header.
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const headerId = req.headers['x-request-id'];
  const requestId = (typeof headerId === 'string' && headerId.trim())
    ? headerId
    : Array.isArray(headerId) && headerId[0]
      ? headerId[0]
      : randomUUID();

  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);

  next();
}
