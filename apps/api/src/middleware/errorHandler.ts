import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { ZodError } from 'zod';
import { logger } from '../lib/logger.js';

/** Shape of every API error response */
interface ApiErrorResponse {
  error: string;
  details?: unknown;
  requestId?: string | undefined;
}

/**
 * Central error-handling middleware.
 *
 * Catches all errors thrown by route handlers and converts them to
 * structured JSON responses. Never leaks stack traces to the client.
 *
 * Error types handled:
 *  - AppError (our custom typed errors)
 *  - ZodError (validation failures from request parsing)
 *  - Generic Error (unknown server errors → 500)
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  const requestId = req.id ? String(req.id) : undefined;

  // Zod validation errors → 400
  if (err instanceof ZodError) {
    const body: ApiErrorResponse = {
      error: 'Validation failed',
      details: err.flatten().fieldErrors,
      requestId,
    };
    res.status(400).json(body);
    return;
  }

  // Our typed application errors
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err, requestId }, err.message);
      Sentry.captureException(err, { extra: { requestId } });
    } else {
      logger.warn({ statusCode: err.statusCode, requestId }, err.message);
    }

    const body: ApiErrorResponse = {
      error: err.message,
      ...(err.details !== undefined && { details: err.details }),
      requestId,
    };
    res.status(err.statusCode).json(body);
    return;
  }

  // Unknown errors → 500
  logger.error({ err, requestId }, 'Unhandled error');
  Sentry.captureException(err, { extra: { requestId } });

  res.status(500).json({
    error: 'An unexpected error occurred. Our team has been notified.',
    requestId,
  } satisfies ApiErrorResponse);
}
