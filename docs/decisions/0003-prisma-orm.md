# ADR 0003 — Prisma as the ORM

## Status
Accepted

## Context
The Express API needs a type-safe way to interact with the Supabase PostgreSQL database. Options range from raw SQL to full ORMs with codegen.

## Decision
Use **Prisma** as the ORM. Prisma provides:
- A declarative schema file (`schema.prisma`) as the single source of truth for the DB shape
- Auto-generated, fully-typed TypeScript client
- Built-in migration tooling (`prisma migrate dev`, `prisma migrate deploy`)
- Prisma Studio for ad-hoc DB inspection during development

## Alternatives Considered

### Drizzle ORM
- SQL-first ORM, lightweight, very fast
- **Rejected**: Drizzle's migration story (`drizzle-kit`) is less mature than Prisma's. For a small team, `prisma migrate dev` is significantly more productive. Drizzle becomes the better choice when raw query performance is a hard constraint, which it is not at Phase 1 scale.

### Knex.js (query builder)
- Lightweight query builder, not a full ORM
- **Rejected**: No auto-generated types. Developer must manually define TypeScript interfaces that mirror the DB schema — a maintenance burden that Prisma eliminates.

### Raw `pg` driver + SQL
- Maximum control
- **Rejected**: No type safety without a codegen step. SQL migrations managed manually. Much higher maintenance surface for a solo/small team.

### Supabase JS client (with RLS)
- Use `supabase.from('table').select(...)` directly — no ORM
- **Rejected**: The Supabase JS client is designed for browser/edge usage. On the server it is equivalent to a typed query builder but without migration tooling or schema-first design. Mixing Supabase client calls and raw SQL in the API creates inconsistent patterns.

## Consequences
- ✅ Single `schema.prisma` file is the authoritative DB definition
- ✅ Every DB query is type-checked at compile time — no `any` rows
- ✅ Migration history is in version control under `prisma/migrations/`
- ✅ `prisma migrate reset && prisma db seed` gives a reproducible local environment in one command
- ⚠️ Prisma `$queryRaw` and `$executeRaw` bypass RLS — these must be reviewed in every PR
- ⚠️ Prisma does not support PostGIS geometry types natively — spatial queries are written as `$queryRaw` with explicit `organization_id` / `owner_id` filters to compensate for RLS bypass
