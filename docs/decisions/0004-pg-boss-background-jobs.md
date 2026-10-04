# ADR 0004 — pg-boss for Background Jobs (In-Process)

## Status
Accepted

## Context
Phase 1 requires two background processes:
1. Expiring `PENDING` bookings that have not been approved within the configured window
2. Dispatching in-app notifications when booking status changes

These need to run reliably without manual invocation. Options are: a cron inside the API process, a separate worker service, a managed queue, or a Postgres-native queue.

## Decision
Use **pg-boss** running inside the Express API process on Render.

pg-boss stores jobs in a `pgboss` schema in our existing Supabase Postgres database. Jobs are enqueued transactionally (enqueue and DB write in one transaction — no lost jobs on crash). The worker runs in the same Node.js process as the HTTP server.

## Alternatives Considered

### BullMQ + Redis
- Industry-standard job queue backed by Redis
- **Rejected**: Requires provisioning a Redis instance (Upstash or Render Redis add-on, ~$10–20/mo). Adds a second connection to manage, monitor, and secure. At Phase 1 job volume (tens of jobs/hour), Redis is pure overhead.

### Trigger.dev (managed)
- Managed background job SaaS with a generous free tier
- **Rejected**: Adds an outbound HTTP call from the API to Trigger.dev for every job enqueue. Increases failure surface. Also makes local development dependent on a tunnel (ngrok) for job delivery. pg-boss works fully offline.

### Render Cron Job (separate service)
- A separate Render service that runs on a schedule
- **Rejected**: Requires a second Render service ($7/mo minimum), a shared secret for the API to accept its calls, and separate deployment management. pg-boss achieves the same outcome inside one service.

### Node.js `setInterval` / `cron` package
- In-process cron without a queue
- **Rejected**: No persistence — jobs that were "in flight" when the process restarts are lost. No visibility (can't query what jobs are pending). pg-boss solves both.

## Consequences
- ✅ Zero extra infrastructure — jobs live in the existing Postgres DB
- ✅ Transactional enqueue: if the surrounding DB transaction rolls back, the job is never enqueued
- ✅ Full SQL visibility: `SELECT * FROM pgboss.job WHERE state = 'failed'`
- ✅ Works in local development without any external services
- ⚠️ Jobs share the event loop with HTTP requests — `teamConcurrency` must be set conservatively (default: 1)
- ⚠️ On Render free tier the process sleeps after inactivity — upgrade to a paid plan to ensure cron jobs fire reliably
- ⚠️ When scaling to multiple API instances, only one instance should run the scheduler (or use pg-boss's built-in leader election, which it does automatically via Postgres advisory locks)
