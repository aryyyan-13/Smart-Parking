# Smart Parking — Developer Reference

## Stack

| Layer | Technology | Hosting |
|---|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript | Vercel (ap-south-1 edge) |
| Backend | Express 5 + TypeScript | Render (India region) |
| Database | Supabase PostgreSQL 15 + PostGIS | Supabase (ap-south-1) |
| Auth | Supabase Auth (JWT, Google OAuth, email/password) | Supabase |
| Storage | Supabase Storage (private buckets, signed URLs) | Supabase |
| ORM | Prisma (schema-first, migrations in `apps/api/prisma/`) | — |
| Maps | Google Maps Platform (Maps JS + Geocoding + Places) | — |
| Background jobs | pg-boss (Postgres-backed queue, runs inside API process) | — |
| Email | Resend (React Email templates) | — |
| Error tracking | Sentry (browser SDK in web, Node SDK in api) | — |
| Shared types | `packages/shared` (Zod schemas + derived TS types) | — |

## Architecture

Shape: **Modular monolith** — two deployable units sharing types via `packages/shared`. Single Supabase project for DB + Auth + Storage. No microservices.

```
smart-parking/
├── apps/api/         ← Express REST API (Render)
│   └── src/
│       ├── config/       ← env validation (Zod)
│       ├── middleware/   ← auth, error-handler, request-id, logger
│       ├── modules/      ← auth | users | vehicles | listings | search | bookings | admin
│       ├── services/     ← availability, booking, notification (business logic lives here)
│       ├── jobs/         ← pg-boss job definitions + handlers
│       └── lib/          ← prisma client, supabase admin, email (resend)
├── apps/web/         ← Next.js app (Vercel)
└── packages/shared/  ← Zod schemas, enums, TS types (used by both apps)
```

Full detail: [`docs/architecture.md`](docs/architecture.md)  
ADRs: [`docs/decisions/`](docs/decisions/)

## Setup

```bash
# Install all workspace dependencies
npm install

# API
cd apps/api
cp .env.example .env
# Fill in .env values from Supabase dashboard
npx prisma migrate dev
npx prisma db seed
npm run dev          # http://localhost:3001

# Web
cd apps/web
cp .env.example .env.local
# Fill in .env.local values
npm run dev          # http://localhost:3000
```

## Key constraints

- Business logic lives in `services/` — **never** in route handlers or React components
- Money stored as integer paise (₹1 = 100) — never floats
- All timestamps in UTC; display uses listing-local IANA timezone
- Every tenant table has RLS policies in Supabase
- Prisma `$queryRaw` bypasses RLS — always add explicit `owner_id`/`user_id` filter in raw queries
