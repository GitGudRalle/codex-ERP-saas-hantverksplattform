# PLANS.md

Use this file when a task affects more than 3 files, changes database schema, changes auth/security, or introduces a new product module.

## Active plan: Existing customer work order creation

## Goal

Reduce duplicate customers by letting admin and manager create work orders for existing customers and sites.

## User story

As an admin or manager, I want to register a new job on an existing customer and site, so that incoming calls become work orders without duplicate customer records.

## Scope

Included:
- Choose new or existing customer in the quick work order form.
- Choose existing site or create a new site for an existing customer.
- Keep the existing new-customer flow available.

Excluded:
- New schema changes
- Customer merge tools
- Advanced search/filtering

## Files likely affected

- `PLANS.md`
- `components/customer-work-order-flow.tsx`

## Data model changes

- No schema changes.
- Uses existing `customers`, `sites`, and `work_orders`.

## UI changes

- Add a simple customer mode selector to the quick form.
- Show customer/site dropdowns when existing records are used.
- Keep large mobile-friendly inputs.

## Security/RLS considerations

- Existing RLS continues to enforce company scoping.
- Client selections are validated against loaded company-scoped rows before insert.

## Implementation steps

1. Add customer/site mode state to the quick form.
2. Update create handler to reuse selected customer/site where appropriate.
3. Add Swedish UI controls and validation messages.
4. Validate lint, typecheck, build, and browser smoke.

## Validation

Commands to run:
- npm run lint
- npm run typecheck
- npm run build

Manual checks:
- Create a work order for a new customer.
- Create a work order for an existing customer and existing site.
- Create a work order for an existing customer and new site.

## Risks

- Dropdowns are enough for MVP data volume, but later we may need searchable comboboxes.

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
