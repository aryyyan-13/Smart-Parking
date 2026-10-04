# Smart Parking API

Express 5 REST API · TypeScript strict mode · Prisma + Supabase Postgres · pg-boss background jobs

## Prerequisites

- Node.js 20+
- A Supabase project (see [`docs/architecture.md`](../../docs/architecture.md))

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy the environment template
cp .env.example .env

# 3. Fill in .env — required values:
#    DATABASE_URL, DIRECT_URL        → Supabase → Project → Settings → Database
#    SUPABASE_URL, SUPABASE_ANON_KEY,
#    SUPABASE_SERVICE_ROLE_KEY,
#    SUPABASE_JWT_SECRET              → Supabase → Project → Settings → API
#    GOOGLE_GEOCODING_KEY             → Google Cloud Console (Geocoding API, server-only key)
#    RESEND_API_KEY, EMAIL_FROM       → resend.com

# 4. Generate the Prisma client
npm run db:generate

# 5. Run migrations (creates all tables)
npm run db:migrate

# 6. Seed the database with sample data
npm run db:seed

# 7. Start the dev server
npm run dev
```

Server starts at **http://localhost:3001**

## Health check

```bash
curl http://localhost:3001/api/health
# → {"status":"ok","timestamp":"...","checks":{"api":"ok","database":"ok"},...}
```

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with tsx watch (hot-reload) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run the compiled server (production) |
| `npm run typecheck` | Type-check without emitting |
| `npm run lint` | Run ESLint |
| `npm run test` | Run all tests (Vitest) |
| `npm run db:generate` | Re-generate Prisma client after schema changes |
| `npm run db:migrate` | Create and apply a new migration |
| `npm run db:migrate:prod` | Apply pending migrations (production) |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio (DB GUI) |
| `npm run db:reset` | Drop and recreate the DB, re-seed |

## Project structure

```
src/
├── config/       # env.ts — Zod validation, crashes loudly if vars missing
├── middleware/   # auth, requestId, requestLogger, errorHandler
├── modules/      # feature modules — each has routes.ts + service.ts
│   └── health/   # GET /api/health
├── services/     # cross-cutting domain logic (availability, booking, notification)
├── jobs/         # pg-boss job definitions and handlers
├── lib/          # prisma.ts, supabase.ts, email.ts, logger.ts
├── types/        # express.d.ts augmentations
├── app.ts        # Express app factory (no side-effects — importable in tests)
└── server.ts     # Process entry: listen + graceful shutdown
```

## Dependency rationale

| Package | Why |
|---|---|
| `express` | HTTP framework |
| `@prisma/client` + `prisma` | Type-safe ORM + migration CLI |
| `@supabase/supabase-js` | JWT verification + Storage signed URLs |
| `pg-boss` | Postgres-backed job queue (no Redis needed) |
| `zod` | Runtime env + request validation |
| `pino` + `pino-http` | Structured JSON logging |
| `helmet` | Security headers |
| `cors` | Cross-Origin Resource Sharing |
| `resend` | Transactional email |
| `@sentry/node` | Error tracking |
| `uuid` | UUID generation |
| `tsx` | TypeScript execution in dev (no build step) |
| `vitest` | Fast unit + integration tests |
| `supertest` | HTTP integration test assertions |
