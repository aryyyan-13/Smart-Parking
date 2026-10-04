import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

/**
 * Authentication middleware.
 *
 * Expects: Authorization: Bearer <supabase-access-token>
 *
 * On success: attaches req.user (Supabase auth user) and req.dbUser (Prisma user row).
 * On failure: responds 401 with a JSON error.
 *
 * Routes that don't require auth should use this middleware explicitly — all
 * /api/v1 routes are protected by default via the router setup in app.ts.
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' });
    return;
  }

  const token = authHeader.slice(7);

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    logger.warn(
      { requestId: req.id, error: error?.message },
      'Invalid or expired JWT',
    );
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  // Load the application-level user row from our DB
  const dbUser = await prisma.user.findUnique({
    where: { authId: data.user.id },
    select: {
      id: true,
      authId: true,
      memberships: {
        select: {
          organizationId: true,
          role: true,
        },
      },
      status: true,
      email: true,
      name: true,
    },
  });

  if (!dbUser) {
    // Auth succeeded but no corresponding user row — account not fully set up
    res.status(401).json({ error: 'User account not found' });
    return;
  }

  if (dbUser.status === 'BANNED') {
    res.status(403).json({ error: 'Account suspended' });
    return;
  }

  req.user = dbUser;
  next();
}
