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

This setup includes the initial app shell and the first live Supabase-backed MVP flows:

- Dashboard
- Kunder
- Customer detail page with contact info, sites, and linked work orders
- Arbetsordrar with customer request to work order flow, assignment, and completed-job review
- Work order detail page with customer, site, reporting, documentation, and invoice summary
- Mina jobb with mobile-first status changes, time reporting, material reporting, and notes
- Fakturaunderlag with review of ready work orders, saved invoice text, and draft/ready status
- Role-aware navigation and an electrician-focused start card
- Supabase migration SQL for the core company-scoped data model, hardened RLS policies, and one invoice draft per work order

Photo storage and real invoice integrations are intentionally not implemented yet.

## Database

The schema migrations are available in:

```text
supabase/migrations/
```

They include the MVP tables, indexes, update triggers, and Row Level Security policies for company-scoped data. Apply them in order for a new Supabase project.

Security notes are documented in [docs/database-security.md](docs/database-security.md).

Supabase setup and recovery from partial migration attempts is documented in [docs/supabase-setup.md](docs/supabase-setup.md).

Development seed data is available at:

```text
supabase/dev_bootstrap_seed.sql
```
