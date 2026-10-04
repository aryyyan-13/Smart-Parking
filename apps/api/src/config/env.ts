import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),

  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid postgres connection URL'),
  DIRECT_URL: z.string().url('DIRECT_URL must be a valid postgres connection URL').optional(),

  // Supabase
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  SUPABASE_JWT_SECRET: z.string().min(1, 'SUPABASE_JWT_SECRET is required'),

  // Storage
  STORAGE_BUCKET_LISTINGS: z.string().default('listing-photos'),

  // Google Maps (server-side only)
  GOOGLE_GEOCODING_KEY: z.string().min(1, 'GOOGLE_GEOCODING_KEY is required'),

  // Email
  RESEND_API_KEY: z.string().startsWith('re_', 'RESEND_API_KEY must start with re_'),
  EMAIL_FROM: z.string().email('EMAIL_FROM must be a valid email address'),

  // Sentry
  SENTRY_DSN: z.string().url('SENTRY_DSN must be a valid URL').optional(),

  // CORS
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),

  // Application
  PENDING_BOOKING_EXPIRY_MINUTES: z.coerce.number().int().positive().default(30),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `  • ${e.path.join('.')}: ${e.message}`)
      .join('\n');

    console.error(
      `\n❌ Environment validation failed. Fix the following before starting:\n\n${errors}\n\n` +
        `  → Copy apps/api/.env.example to apps/api/.env and fill in every value.\n`,
    );
    process.exit(1);
  }

  return result.data;
}

export const env = validateEnv();

export const isDev = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';
export const isProd = env.NODE_ENV === 'production';

export const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
