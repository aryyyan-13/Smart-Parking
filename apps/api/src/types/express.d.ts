import 'express';
import '@prisma/client';

/**
 * Express Request type augmentations.
 * These are attached by middleware and available in all route handlers.
 */
declare global {
  namespace Express {
    interface Request {
      /** Unique request ID — set by requestIdMiddleware */
      id: string;

      /** Authenticated user from our database — set by authMiddleware */
      user?: {
        id: string;
        authId: string;
        memberships: {
          organizationId: string;
          role: import('@prisma/client').UserRole;
        }[];
        status: import('@prisma/client').UserStatus;
        email: string;
        name: string | null;
      };
    }
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    id: string;
  }
}

export {};
