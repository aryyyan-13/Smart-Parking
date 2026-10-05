# Deployment & Operations Guide

## Environments
We support three environments:
1. **Local**: Developer machines (uses local postgres via docker or direct).
2. **Staging**: Supabase (ap-south-1) for DB + Vercel (Preview) + Render (Free/Starter).
3. **Production**: Supabase (ap-south-1) for DB + Vercel (Production) + Render (Pro).

## Infrastructure Stack
- **Frontend**: Next.js App Router deployed on Vercel Edge.
- **Backend**: Express/Node.js API deployed on Render (Web Service).
- **Database**: PostgreSQL on Supabase (ap-south-1).
- **Authentication**: Supabase Auth (JWT).
- **Blob Storage**: Supabase Storage.

## Environment Variables

### Frontend (`apps/web/.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
NEXT_PUBLIC_API_URL=https://api.smartparking.com
```

### Backend (`apps/api/.env`)
```env
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
DIRECT_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_KEY]
SENTRY_DSN=https://[DSN]@sentry.io/[ID]
RESEND_API_KEY=re_[KEY]
```

## Deployment Steps

1. **Database Migrations**
   ```bash
   cd apps/api
   npm run db:migrate:prod
   ```
2. **Backend (Render)**
   - Connect the GitHub repository to a new Render Web Service.
   - Root directory: `apps/api`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
   - Populate `.env` securely in Render Dashboard.
3. **Frontend (Vercel)**
   - Connect the GitHub repository to Vercel.
   - Framework: Next.js
   - Root Directory: `apps/web`
   - Populate Environment Variables.

## Monitoring & Observability
- **Errors**: Sentry is integrated in both the API and Web applications to capture unhandled exceptions and performance bottlenecks.
- **Logs**: Pino is used for structured JSON logging on the backend. Render streams these logs natively, which can be piped to Datadog or Papertrail.
- **Uptime**: We target < 3 seconds response for search/booking routes. Monitor this via Vercel Analytics and Sentry Performance.

## Backups
- **PostgreSQL**: Supabase automatically performs daily logical backups and Point-in-Time Recovery (PITR) is enabled for production instances.
- **Files**: Supabase Storage objects are durable and geographically redundant.
