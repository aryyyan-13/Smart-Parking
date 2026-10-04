# ADR 0002 — Supabase as Database, Auth, and Storage Provider

## Status
Accepted

## Context
The system needs: a relational database (with geospatial support), authentication (email/password, Google OAuth, JWT issuance), and file storage (listing photos). These could be sourced from three separate vendors or consolidated.

We are optimising for low ops burden and minimal vendor sprawl.

## Decision
Use **Supabase** as the single provider for:
- PostgreSQL 15 with PostGIS (via Supabase hosted project)
- Auth: email/password, magic link, Google OAuth (via Supabase Auth)
- File storage: private buckets with signed URLs (via Supabase Storage)
- Row Level Security (RLS) policies for tenant isolation

Region: `ap-south-1` (India / Mumbai) to minimise latency for the primary user base.

## Alternatives Considered

### Neon (Postgres) + Auth0 + Cloudflare R2
- Best-of-breed for each concern
- **Rejected**: Three vendor accounts, three billing dashboards, three sets of API keys, three sets of SDK integrations. Eliminates the "low ops" requirement.

### Neon (Postgres only), auth in Express, S3 for storage
- Neon for serverless Postgres; hand-rolled JWT auth; AWS S3 for files
- **Rejected**: Hand-rolling auth is explicitly forbidden by AGENTS.md. Neon has cold-start latency on Render (persistent server). S3 requires AWS IAM.

### PlanetScale / Turso
- MySQL-based or SQLite-based
- **Rejected**: ARCHITECTURE.md specifies PostgreSQL. PostGIS (required for geospatial search) is not available on MySQL. 

## Consequences
- ✅ One vendor dashboard, one billing account
- ✅ PostGIS available out of the box — no extension installation required
- ✅ Supabase Auth JWTs can be verified by the Express API without a DB round-trip
- ✅ RLS policies provide a defense-in-depth layer on top of Express middleware auth checks
- ⚠️ Supabase free tier has limitations (500 MB DB, no PITR, pauses after 1 week inactivity) — upgrade to Pro ($25/mo) before any real user data is stored
- ⚠️ Prisma `$queryRaw` bypasses RLS — must be explicitly avoided or audited
- ⚠️ Supabase vendor lock-in: migrating away requires extracting Postgres data + replacing Auth SDK + moving Storage files. Acceptable risk at this stage.
