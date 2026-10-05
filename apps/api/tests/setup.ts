// Test setup file — runs before every test file.
// Sets NODE_ENV=test and loads test env variables.
import 'dotenv/config';

process.env['NODE_ENV'] = 'test';
process.env['PORT'] = '3000';
process.env['DATABASE_URL'] = 'postgresql://postgres:postgres@localhost:5432/test_db';
process.env['DIRECT_URL'] = 'postgresql://postgres:postgres@localhost:5432/test_db';
process.env['SUPABASE_URL'] = 'https://example.supabase.co';
process.env['SUPABASE_ANON_KEY'] = 'dummy_anon_key';
process.env['SUPABASE_SERVICE_ROLE_KEY'] = 'dummy_service_key';
process.env['SENTRY_DSN'] = 'https://dummy@dummy.ingest.sentry.io/dummy';
process.env['RESEND_API_KEY'] = 're_dummy_key';
