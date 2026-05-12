# PLANS.md

Use this file when a task affects more than 3 files, changes database schema, changes auth/security, or introduces a new product module.

## Active plan: Initial Next.js SaaS MVP structure

## Goal

Create the initial app structure for the Swedish electrical company SaaS MVP without building the full feature set.

## User story

As an admin, manager, or electrician, I want a clear first app shell with the main MVP areas visible, so that the product can grow from the core workflow without becoming a generic ERP.

## Scope

Included:
- Next.js App Router project files
- TypeScript and Tailwind setup
- Basic responsive app shell
- Dashboard page
- Placeholder pages for customers, work orders, electrician jobs, and invoice drafts
- Supabase browser client setup
- `.env.example`
- README setup instructions

Excluded:
- Authentication implementation
- Database schema and migrations
- RLS policies
- Real CRUD features
- Invoice integrations

## Files likely affected

- `package.json`
- `app/**`
- `components/**`
- `lib/**`
- config files
- `.env.example`
- `README.md`

## Data model changes

- None.

## UI changes

- Swedish app shell and placeholder pages.
- Mobile-first navigation and dashboard cards.

## Security/RLS considerations

- No database schema or policies are introduced in this step.
- Supabase setup uses public URL and anon key environment variables only.
- Company scoping and RLS must be implemented before real data access.

## Implementation steps

1. Add project configuration for Next.js, TypeScript, Tailwind, and linting.
2. Add reusable app shell/navigation and placeholder page components.
3. Add dashboard and MVP route placeholders.
4. Add Supabase client setup and environment documentation.
5. Validate with available package scripts if dependencies are installed.

## Validation

Commands to run:
- npm run lint
- npm run typecheck
- npm test, if available

Manual checks:
- Confirm Swedish labels render in the main routes.
- Confirm routes exist for dashboard, customers, work orders, jobs, and invoice drafts.

## Risks

- Dependencies may not be installed yet in this empty workspace.
- Real auth/RLS behavior is intentionally not validated until schema and auth are implemented.

## Plan template

# Plan: <feature name>

## Goal

What are we trying to achieve?

## User story

As a <role>, I want to <action>, so that <benefit>.

## Scope

Included:
- 

Excluded:
- 

## Files likely affected

- 

## Data model changes

- 

## UI changes

- 

## Security/RLS considerations

- 

## Implementation steps

1. 
2. 
3. 

## Validation

Commands to run:
- npm run lint
- npm run typecheck
- npm test, if available

Manual checks:
- 

## Risks

- 
