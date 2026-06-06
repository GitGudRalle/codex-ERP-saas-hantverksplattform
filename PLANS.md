# PLANS.md

Use this file when a task affects more than 3 files, changes database schema, changes auth/security, or introduces a new product module.

## Active plan: Invoice draft creation

## Goal

Add the first saved invoice draft flow after a work order has been reviewed and marked ready for invoicing.

## User story

As an admin or manager, I want to turn a ready work order into a saved invoice draft, so that I have a clear basis for creating the real invoice later.

## Scope

Included:
- Invoice draft page backed by Supabase
- Ready-for-invoice work order list
- Time and material review on each draft card
- Editable invoice text generated from work order data
- Insert/update of `invoice_drafts`

Excluded:
- Fortnox/Visma export
- Photo storage changes
- Advanced reporting
- Sending real invoices

## Files likely affected

- `supabase/migrations/**`
- `lib/**`
- `app/**`
- `components/**`
- `README.md`
- `PLANS.md`

## Data model changes

- No schema changes.
- Uses existing `invoice_drafts` table.

## UI changes

- Replace invoice placeholder with a practical invoice draft workflow.
- Keep cards readable on mobile while still useful for admin desktop work.

## Security/RLS considerations

- Invoice drafts remain admin/manager only through existing RLS.
- All reads and writes stay company-scoped through RLS.

## Implementation steps

1. Add invoice draft validation and row type.
2. Replace invoice placeholder page with a live component.
3. Load ready work orders, related time/material, and existing drafts.
4. Generate editable invoice text and save insert/update drafts.
5. Validate lint, typecheck, build, and basic browser smoke.

## Validation

Commands to run:
- npm run lint
- npm run typecheck
- npm test, if available

Manual checks:
- Confirm logged-out users see the login prompt.
- Confirm admin/manager can save invoice drafts for ready work orders.
- Confirm empty state appears when nothing is ready for invoicing.

## Risks

- Duplicate drafts are avoided in the UI by updating the first existing draft for a work order, but the database does not yet enforce uniqueness.
- The generated text is deliberately simple and should be refined with real users.

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
