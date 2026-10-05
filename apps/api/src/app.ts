import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import * as Sentry from '@sentry/node';
import pinoHttp from 'pino-http';
import { env, allowedOrigins, isDev } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { healthRouter } from './modules/health/health.routes.js';
import { listingsRouter } from './modules/listings/listings.routes.js';
import { searchRouter } from './modules/search/search.routes.js';
import { bookingsRouter } from './modules/bookings/bookings.routes.js';
import { adminRouter } from './modules/admin/admin.routes.js';
import { authMiddleware } from './middleware/auth.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { logger } from './lib/logger.js';

export function createApp() {
  // Initialise Sentry before any other code that might throw
  if (env.SENTRY_DSN) {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.NODE_ENV,
      tracesSampleRate: isDev ? 1.0 : 0.1,
    });
  }

  const app = express();

  // ── Security headers ────────────────────────────────────────────────────────
  app.use(helmet());

  // ── CORS ────────────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (curl, Postman, same-origin)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: origin ${origin} not allowed`));
        }
      },
      credentials: true,
    }),
  );

  // ── Body parsing ────────────────────────────────────────────────────────────
  app.use(express.json({ limit: '1mb' }));

  // ── Request ID tracking ────────────────────────────────────────────────────
  app.use(requestIdMiddleware);

  // ── HTTP request logging (ponytail: replaced custom middleware) ─────────────
  app.use(pinoHttp({ logger, genReqId: (req) => (req as any).id }));

  // ── Routes ──────────────────────────────────────────────────────────────────

  // Public health check — no auth required
  app.use('/api/health', healthRouter);

  // All feature routes live under /api/v1
  // Registered here as modules are implemented:
  // app.use('/api/v1/auth', authRouter);
  // app.use('/api/v1/users', authMiddleware, usersRouter);
  // app.use('/api/v1/vehicles', authMiddleware, vehiclesRouter);
  app.use('/api/v1/listings', authMiddleware, listingsRouter);
  app.use('/api/v1/search', searchRouter);
  app.use('/api/v1/bookings', bookingsRouter);
  app.use('/api/v1/admin', authMiddleware, adminRouter);

  // 404 handler for unmatched routes
  app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // ── Central error handler (must be last) ────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use(errorHandler);

  return app;
}
