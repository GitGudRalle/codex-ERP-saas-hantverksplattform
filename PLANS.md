# PLANS.md

Use this file when a task affects more than 3 files, changes database schema, changes auth/security, or introduces a new product module.

## Active plan: Work order form and mobile jobs iteration

## Goal

Polish the quick work order form and make the electrician mobile job view faster in the field.

## User story

As an admin or manager, I want a clearer job intake form, and as an electrician I want the most important job actions first on mobile.

## Scope

Included:
- Clean Swedish labels in the quick work order form.
- Improve next-step feedback after creating a work order.
- Lift phone, map, status, address, and summary to the top of "Mina jobb".
- Keep reporting sections available below the field actions.

Excluded:
- New schema changes
- Customer merge tools
- Advanced scheduling or route optimization

## Files likely affected

- `PLANS.md`
- `components/customer-work-order-flow.tsx`
- `components/electrician-jobs.tsx`
- `lib/domain.ts`

## Data model changes

- No schema changes.
- Uses existing `customers`, `sites`, `work_orders`, and reporting tables.

## UI changes

- Correct broken Swedish characters in the touched UI.
- Make the quick form button text match new/existing customer mode.
- Add a top field action area in "Mina jobb" before notes/photos/reporting.

## Security/RLS considerations

- Existing RLS continues to enforce company scoping.
- Client selections continue to be validated against loaded company-scoped rows before insert.
- No new API or database permissions.

## Implementation steps

1. Clean Swedish strings in the touched work order and field views.
2. Improve created-work-order feedback and button labels.
3. Add a mobile-first top summary/action/status area to "Mina jobb".
4. Validate lint, typecheck, build, and browser smoke.

## Validation

Commands to run:
- npm run lint
- npm run typecheck
- npm run build

Manual checks:
- Confirm the quick form still supports new and existing customers.
- Confirm "Mina jobb" shows call/map/status near the top on mobile.

## Risks

- The field view is growing; keep this iteration focused before splitting components.

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
