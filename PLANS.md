# PLANS.md

Use this file when a task affects more than 3 files, changes database schema, changes auth/security, or introduces a new product module.

## Active plan: Invoice draft hardening, field notes, and role UX

## Goal

Harden invoice draft persistence, add field notes to the mobile electrician workflow, and reduce navigation noise by role.

## User story

As a small electrical company, I want each work order to have at most one invoice draft, let electricians add notes in the field, and show each role the most relevant workspace, so that daily use stays fast.

## Scope

Included:
- Unique invoice draft per work order enforced in Postgres
- Mobile notes form in "Mina jobb"
- Notes list per assigned work order
- Zod validation for work order notes
- Role-aware navigation
- Electrician-focused dashboard call-to-action

Excluded:
- Photo storage changes
- Advanced reporting
- Sending real invoices
- Fortnox/Visma export

## Files likely affected

- `supabase/migrations/**`
- `lib/**`
- `app/**`
- `components/**`
- `README.md`
- `PLANS.md`

## Data model changes

- Add a unique index on `invoice_drafts(work_order_id)`.
- Use existing `work_order_notes` table.

## UI changes

- Add a note panel to each mobile job card.
- Keep note creation fast with one textarea and one save action.
- Show electricians a direct path to "Mina jobb".
- Hide admin-only navigation from electrician and logged-out views.

## Security/RLS considerations

- Invoice drafts remain admin/manager only through existing RLS.
- Electricians can create notes only on assigned work orders through existing RLS.
- All reads and writes stay company-scoped through RLS.

## Implementation steps

1. Add and apply invoice draft uniqueness migration.
2. Add work order note validation.
3. Load notes in "Mina jobb".
4. Add mobile-friendly note form and note list per job.
5. Add role-aware navigation and electrician start card.
6. Validate lint, typecheck, build, and basic browser smoke.

## Validation

Commands to run:
- npm run lint
- npm run typecheck
- npm test, if available

Manual checks:
- Confirm invoice draft uniqueness migration is applied.
- Confirm "Mina jobb" renders note controls without console errors.
- Confirm logged-out users remain safely blocked by auth/RLS.
- Confirm navigation changes by logged-out, electrician, and admin/manager roles where possible.

## Risks

- Existing duplicate invoice drafts are cleaned by the migration before the unique index is added.
- Notes are simple text only; photo documentation remains a later step.
- Role-aware navigation is a UX convenience; RLS remains the security boundary.

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
