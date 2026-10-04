import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';

declare global {
  // Prevent multiple instances in dev (hot-reload)
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: [
      { level: 'warn', emit: 'event' },
      { level: 'error', emit: 'event' },
    ],
  });

  client.$on('warn', (e) => {
    logger.warn({ source: 'prisma', message: e.message }, 'Prisma warning');
  });

  client.$on('error', (e) => {
    logger.error({ source: 'prisma', message: e.message }, 'Prisma error');
  });

  return client;
}

export const prisma: PrismaClient =
  globalThis.__prisma ?? createPrismaClient();

if (process.env['NODE_ENV'] !== 'production') {
  globalThis.__prisma = prisma;
}
