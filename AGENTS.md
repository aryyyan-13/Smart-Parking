# Working Agreement for Antigravity

## Source of truth

- Treat `SPEC.md` as the product contract, `ARCHITECTURE.md` as the technical baseline, and `TASKS.md` as the implementation order.
- Do not expand Phase 1 scope into payments, IoT, barriers, or dynamic pricing without an explicit request.
- When a requirement is ambiguous, identify the decision and its impact before implementing. Do not silently invent business policy.

## Delivery rules

- Work on one coherent, verifiable task at a time. State the files you expect to change and the acceptance criterion before editing.
- Prefer small, reviewable commits. Do not overwrite unrelated user changes.
- Keep API contracts typed and validate all external input.
- Add tests for new business rules, especially availability, time zones, price calculations, booking conflicts, ownership, and role authorization.
- Run relevant lint, typecheck, unit/integration tests, and build checks before declaring a task complete. Report commands run and any unrun checks.

## Security and data integrity

- Enforce authentication, roles, and resource ownership on the API; never rely on client-side checks alone.
- Store secrets in environment variables, never in committed files or logs.
- Use UTC storage and listing-local IANA time zones for schedules/display.
- Make booking creation transactional and overlap-safe. Never permit two active bookings for the same slot/time interval.
- Do not claim a payment was made or revenue settled; Phase 1 reports calculated booking amounts only.

## UX and performance

- Build mobile-first but retain a strong desktop experience.
- Keep the map central to discovery, with a usable list alternative and accessible form/error states.
- Avoid blocking the core booking flow on optional integrations or third-party widgets.
- Preserve a <3-second target for typical search and booking screens where practical; measure before optimizing.

## Completion format

For each task, provide: summary of implementation, changed files, test/build results, known limitations, and the next recommended task. Update `TASKS.md` only when its matching acceptance criterion is met.

---

## Stack

| Layer | Technology | Hosting |
|---|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript | Vercel (ap-south-1 edge) |
| Backend | Express 5 + TypeScript | Render (India region) |
| Database | Supabase PostgreSQL 15 + PostGIS | Supabase (ap-south-1) |
| Auth | Supabase Auth (JWT, Google OAuth, email/password) | Supabase |
| Storage | Supabase Storage (private buckets, signed URLs) | Supabase |
| ORM | Prisma (schema-first, migrations) | — |
| Maps | Google Maps Platform (Maps JS + Geocoding + Places) | — |
| Background jobs | pg-boss (Postgres-backed queue, in API process) | — |
| Email | Resend (React Email templates) | — |
| Error tracking | Sentry (browser + Node SDK) | — |
| Shared types | `packages/shared` (Zod schemas + TS types) | — |

## Architecture

Shape: **Modular monolith** — two deployable units (`apps/web`, `apps/api`) sharing types via `packages/shared`. Single Supabase project for DB + Auth + Storage. No microservices.

Full architecture detail: [`docs/architecture.md`](docs/architecture.md)  
Architecture Decision Records: [`docs/decisions/`](docs/decisions/)

Key constraints:
- Business logic lives in `apps/api/src/services/` and `apps/api/src/modules/*/service.ts` — **never in route files or UI components**
- Every tenant-owned table has Row Level Security policies in Supabase
- Money is stored as integer minor units (paise) — never floats
- All timestamps stored in UTC; display uses listing-local IANA timezone
- Prisma `$queryRaw` bypasses RLS — every raw query must include explicit `owner_id`/`user_id` filter
- Two Google Maps API keys: one browser key (restricted to Maps JS + Places), one server key (restricted to Geocoding only)
