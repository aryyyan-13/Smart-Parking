import 'dotenv/config'; // must be first — loads .env before anything else imports env.ts
import { env } from './config/env.js';
import { createApp } from './app.js';
import { prisma } from './lib/prisma.js';
import { logger } from './lib/logger.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(
    { port: env.PORT, env: env.NODE_ENV },
    `🚀 API server listening on http://localhost:${env.PORT}`,
  );
});

// ── Graceful shutdown ────────────────────────────────────────────────────────
// Allows in-flight requests to complete before the process exits.
// Render sends SIGTERM on deploy; we give existing connections 10 s to drain.

let isShuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info({ signal }, 'Shutdown signal received — draining connections…');

  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      await prisma.$disconnect();
      logger.info('Database connection closed');
    } catch (err) {
      logger.error({ err }, 'Error disconnecting from database');
    }

    logger.info('Shutdown complete');
    process.exit(0);
  });

  // Force exit if drain takes too long
  setTimeout(() => {
    logger.warn('Graceful shutdown timeout — forcing exit');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled promise rejection');
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception — exiting');
  process.exit(1);
});
