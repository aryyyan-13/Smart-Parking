import pino from 'pino';
import { env, isDev } from '../config/env.js';

/**
 * Structured JSON logger (pino).
 * In development, output is pretty-printed. In production it is newline-delimited JSON.
 *
 * Every log line automatically includes: level, time, requestId (via pino-http),
 * userId, and organizationId when set via logger.child().
 *
 * Fields automatically redacted: password, token, secret, authorization,
 * card_number, cvv, aadhaar, pan.
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: [
      'password',
      'passwordHash',
      'token',
      'refreshToken',
      'accessToken',
      'secret',
      'authorization',
      'headers.authorization',
      'headers.cookie',
      'card_number',
      'cvv',
      'aadhaar',
      'pan',
      '*.password',
      '*.token',
      '*.secret',
    ],
    censor: '[REDACTED]',
  },
  ...(isDev
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      }
    : {
        // Production: plain JSON — compatible with Render log drains / Datadog / Logtail
        formatters: {
          level(label: string) {
            return { level: label };
          },
        },
        timestamp: pino.stdTimeFunctions.isoTime,
      }),
});
