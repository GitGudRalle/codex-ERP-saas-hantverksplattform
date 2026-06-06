# Elfirma Platform

Operational SaaS MVP for small Swedish electrical companies. The first goal is a fast flow from incoming customer request to work order, field reporting, review, and invoice draft.

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase

## Getting started

For a fuller guide on running the project from a new computer or another device, see [docs/dev-hosting-from-github.md](docs/dev-hosting-from-github.md).

1. Install dependencies:

```bash
npm install
```

2. Create local environment variables:

```bash
cp .env.example .env.local
```

3. Add Supabase values to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

4. Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Available scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

## Current scope

This setup includes the initial app shell and the first local MVP prototype:

- Dashboard
- Kunder
- Arbetsordrar with a customer request to work order flow
- Mina jobb with mobile-first status changes
- Fakturaunderlag placeholder
- Supabase migration SQL for the core company-scoped data model and RLS

Auth UI, live Supabase CRUD, photo storage, and real invoice integrations are intentionally not implemented yet.

## Database

The first schema migration is available at:

```text
supabase/migrations/001_core_mvp_schema.sql
```

It includes the MVP tables, indexes, update triggers, and Row Level Security policies for company-scoped data. Review and run it in a Supabase project before connecting live app data.

Security notes are documented in [docs/database-security.md](docs/database-security.md).

Supabase setup and recovery from partial migration attempts is documented in [docs/supabase-setup.md](docs/supabase-setup.md).
