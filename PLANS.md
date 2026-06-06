# PLANS.md

Use this file when a task affects more than 3 files, changes database schema, changes auth/security, or introduces a new product module.

## Active plan: Customer and invoice review improvements

## Goal

Tighten the review flow after a field job is completed, and make customer context easier to inspect.

## User story

As an admin or manager, I want to review completed jobs with documentation context, open a customer detail page, and mark invoice drafts as ready, so that fewer details are missed before invoicing.

## Scope

Included:
- Completed-job review includes note/photo counts and latest notes
- Customer detail route with contact info, sites, and work orders
- Customer list links to customer details
- Invoice draft status labels and a "ready" action

Excluded:
- New database schema
- Advanced reporting
- Sending real invoices
- Fortnox/Visma export
- Photo upload/storage changes

## Files likely affected

- `app/**`
- `components/**`
- `README.md`
- `PLANS.md`

## Data model changes

- No schema changes.
- Uses existing customer, site, work order, documentation, and invoice draft tables.

## UI changes

- Add `/customers/[id]`.
- Add practical review signals for notes/photos in completed-job review.
- Show invoice draft status as Utkast/Redo/Exporterad and allow marking underlag redo.

## Security/RLS considerations

- Reads and writes are still enforced by existing Supabase RLS.
- No new policies are required.
- Customer detail only shows records visible to the current role.

## Implementation steps

1. Load notes and photos in the admin work order review flow.
2. Add documentation signals and latest notes to completed job cards.
3. Add customer detail route and component.
4. Add invoice draft status labels and ready action.
5. Validate lint, typecheck, build, and browser smoke.

## Validation

Commands to run:
- npm run lint
- npm run typecheck
- npm run build

Manual checks:
- Confirm customer detail logged-out state.
- Confirm customer cards link to `/customers/[id]`.
- Confirm invoice draft buttons render without layout issues.

## Risks

- The app can show photo counts before upload exists; this is intentional until storage is implemented.
- Invoice drafts can be marked ready, but no external invoice export exists yet.

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
