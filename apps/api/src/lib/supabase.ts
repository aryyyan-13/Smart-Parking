import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

/**
 * Supabase admin client — uses the service_role key.
 * NEVER expose this to the browser. Use only in the API.
 * This client bypasses Row Level Security.
 */
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

/**
 * Supabase anon client — used only to verify incoming JWTs from the frontend.
 */
export const supabaseAnon = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
