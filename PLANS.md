# PLANS.md

Use this file when a task affects more than 3 files, changes database schema, changes auth/security, or introduces a new product module.

## Active plan: Core MVP foundation - data model, work order flow, and mobile jobs

## Goal

Add the first practical MVP foundation: company-scoped database schema, a simple customer-to-work-order flow, and a mobile-first electrician jobs view.

## User story

As a small electrical company, I want to register a customer request, turn it into an assigned work order, and let the electrician update job status from mobile, so that work does not get lost before invoicing.

## Scope

Included:
- Supabase migration SQL for core MVP entities
- RLS policies and indexes for company-scoped data
- Shared TypeScript domain model and status labels
- Dashboard update reflecting the first operational workflow
- Customer/work-order page with a simple local MVP workflow
- Mobile-first "Mina jobb" status view

Excluded:
- Full authentication UI
- Live Supabase CRUD integration
- File upload/storage for photos
- Time/material reporting persistence
- Invoice integrations

## Files likely affected

- `supabase/migrations/**`
- `lib/**`
- `app/**`
- `components/**`
- `README.md`
- `PLANS.md`

## Data model changes

- Add company-scoped tables for profiles, customers, sites, work_orders, time_entries, material_entries, work_order_notes, work_order_photos, and invoice_drafts.
- Add enums for roles, work order statuses, priorities, and invoice draft statuses.

## UI changes

- Replace broad placeholders with practical MVP screens for customer/work order flow and electrician status handling.
- Keep Swedish labels and mobile-first touch targets.

## Security/RLS considerations

- Every business table is company-scoped.
- Admin/manager policies can manage all company data.
- Electricians can only read assigned work orders and related records.
- Live UI data access must not be added until auth/session context is wired.

## Implementation steps

1. Add migration SQL with tables, indexes, triggers, and RLS policies.
2. Add shared domain constants for statuses, priorities, and seeded MVP demo data.
3. Build customer/work-order page as a local interactive workflow.
4. Build mobile-first electrician jobs page with status transitions.
5. Update README with current development status and validation notes.

## Validation

Commands to run:
- npm run lint
- npm run typecheck
- npm test, if available

Manual checks:
- Confirm work order statuses use the approved Swedish labels.
- Confirm mobile jobs view exposes phone, address, status, and primary actions.

## Risks

- RLS SQL must be reviewed against a real Supabase project before production data is added.
- Local UI state is temporary and must be replaced by authenticated Supabase reads/writes.

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
