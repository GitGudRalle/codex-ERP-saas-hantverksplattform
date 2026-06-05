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

This setup includes only the initial app shell and placeholder pages:

- Dashboard
- Kunder
- Arbetsordrar
- Mina jobb
- Fakturaunderlag

Auth, database schema, RLS policies, and real CRUD flows are intentionally not implemented yet.
