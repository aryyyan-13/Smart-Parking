import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';

export const healthRouter = Router();

/**
 * GET /api/health
 *
 * Liveness + readiness check for Render's health check pings.
 * Checks: API process alive, Postgres reachable.
 * Returns 200 when healthy, 503 when any dependency is unavailable.
 */
healthRouter.get('/', async (_req: Request, res: Response) => {
  const checks: Record<string, 'ok' | 'error'> = {
    api: 'ok',
    database: 'ok',
  };

  let healthy = true;

  // Postgres connectivity check
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    checks['database'] = 'error';
    healthy = false;
  }

  const status = healthy ? 200 : 503;

  res.status(status).json({
    status: healthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
    version: process.env['npm_package_version'] ?? '0.1.0',
    uptime: Math.floor(process.uptime()),
  });
});
