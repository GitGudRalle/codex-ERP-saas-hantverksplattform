# PLANS.md

Use this file when a task affects more than 3 files, changes database schema, changes auth/security, or introduces a new product module.

## Active plan: Work order detail hub

## Goal

Add a shared work order detail view that gathers customer, site, reporting, documentation, and invoice basis in one place.

## User story

As an admin, manager, or electrician, I want to open a work order and see the full operational picture, so that I do not have to hunt across lists for customer details, time, material, notes, and invoice status.

## Scope

Included:
- Dynamic work order detail route
- Links from admin work order cards and electrician job cards
- Customer phone/address actions
- Time, material, notes, photo count, and invoice draft summary
- RLS-backed loading for both admin/manager and assigned electrician access

Excluded:
- Photo storage changes
- Advanced reporting
- Sending real invoices
- Fortnox/Visma export
- Editing every work order field on the detail page

## Files likely affected

- `supabase/migrations/**`
- `lib/**`
- `app/**`
- `components/**`
- `README.md`
- `PLANS.md`

## Data model changes

- No schema changes.
- Uses existing work order, reporting, documentation, and invoice draft tables.

## UI changes

- Add a first detail page under `/work-orders/[id]`.
- Keep the page useful on mobile with large customer action buttons.
- Add detail links from existing work order lists.

## Security/RLS considerations

- Detail reads are still enforced by existing RLS.
- Electricians can only open assigned work orders.
- Admin/manager can open company work orders.

## Implementation steps

1. Add dynamic detail route and component.
2. Load work order, customer, site, assigned electrician, time, materials, notes, photos, and invoice draft.
3. Add practical summary sections and customer action buttons.
4. Link existing admin and electrician cards to the detail route.
5. Validate lint, typecheck, build, and basic browser smoke.

## Validation

Commands to run:
- npm run lint
- npm run typecheck
- npm test, if available

Manual checks:
- Confirm logged-out users see login prompt.
- Confirm detail page handles inaccessible/missing work orders.
- Confirm linked cards navigate to `/work-orders/[id]`.

## Risks

- Detail page duplicates some summary rendering from list views; later we can extract small shared display components if it becomes noisy.
- Photo upload is not included yet; the page only surfaces current photo count.

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
