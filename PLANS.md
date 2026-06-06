# PLANS.md

Use this file when a task affects more than 3 files, changes database schema, changes auth/security, or introduces a new product module.

## Active plan: RLS hardening and completed-job review

## Goal

Harden the current Supabase access model and add the first admin review step between completed field work and invoice basis.

## User story

As an admin or manager, I want to review completed work orders and see missing time/material before marking them ready for invoicing, so that invoice drafts are based on complete field data.

## Scope

Included:
- RLS helper functions moved out of the exposed public API schema
- RLS policies scoped to authenticated users and optimized for auth helper calls
- Admin/manager review section for completed work orders
- Missing time/material flags before invoice readiness

Excluded:
- Full invoice draft generation
- Fortnox/Visma export
- Photo storage changes
- Advanced reporting

## Files likely affected

- `supabase/migrations/**`
- `lib/**`
- `app/**`
- `components/**`
- `README.md`
- `PLANS.md`

## Data model changes

- No new business tables.
- Add private database helper schema for RLS functions.

## UI changes

- Add a completed-job review section to the work order page.
- Keep review cards readable on mobile and useful on desktop.

## Security/RLS considerations

- Helper functions should not be callable as public RPC endpoints.
- Policies should apply to authenticated users only.
- Electricians must remain limited to assigned work orders and related records.

## Implementation steps

1. Add and apply RLS hardening migration.
2. Update database security notes.
3. Extend work order data loading with time and material reports.
4. Add completed-job review cards and mark-ready action.
5. Validate lint, typecheck, build, and basic browser smoke.

## Validation

Commands to run:
- npm run lint
- npm run typecheck
- npm test, if available

Manual checks:
- Confirm admin/manager can see completed jobs and mark them ready for invoicing.
- Confirm missing time/material is visible before the action.
- Confirm electrician access still relies on assigned work orders.

## Risks

- Moving helpers to a private schema must not break app reads/writes.
- The review screen is a first pass and does not create invoice drafts yet.

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
