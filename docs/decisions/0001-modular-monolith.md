# ADR 0001 — Modular Monolith with Separate Frontend and API Apps

## Status
Accepted

## Context
We are a solo/small team building a Smart Parking SaaS at Phase 1. The primary constraints are: low operational overhead, easy local debugging, fast iteration speed, and the ability to deploy incrementally. The system requires a public-facing web app, a REST API, background jobs, and a database.

Two broad options existed: a true microservices architecture or a monolith of some form.

## Decision
We adopt a **modular monolith** split into two deployable units:
1. `apps/web` — Next.js frontend (Vercel)
2. `apps/api` — Express API with pg-boss background workers (Render)

Both share types and schemas via `packages/shared`. The API is internally organized into feature modules (`listings`, `bookings`, `search`, etc.) but there is a single database, a single deployment, and no inter-service network calls.

## Alternatives Considered

### Microservices
- Separate services per domain (booking-service, listing-service, etc.)
- **Rejected**: Adds distributed-systems complexity (service discovery, inter-service auth, distributed tracing) with no benefit at Phase 1 scale. Debugging a booking failure across three services is far harder than reading a single log stream.

### True monolith (Next.js only, API routes)
- All backend logic in Next.js API routes; no Express
- **Rejected**: Next.js API routes run as serverless functions on Vercel — no persistent process, which makes pg-boss (Postgres-backed queue) impossible. Also couples frontend and backend deploy cycles.

## Consequences
- ✅ Single database to reason about, migrate, and back up
- ✅ One log stream per app, easy `console.log` debugging
- ✅ Feature boundaries are enforced by module structure, not network calls
- ✅ Can split into separate services later without changing business logic
- ⚠️ API and frontend must be kept in sync on shared types — enforced by `packages/shared`
- ⚠️ Background jobs share the HTTP process — monitored via `/api/health`
