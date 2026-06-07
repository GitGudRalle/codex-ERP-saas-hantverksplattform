# PLANS.md

Use this file when a task affects more than 3 files, changes database schema, changes auth/security, or introduces a new product module.

## Active plan: Edit customer and site details

## Goal

Let admin and manager update customer contact details and site access information without leaving the customer detail page.

## User story

As an admin or manager, I want to correct customer phone, email, address, and access notes, so that electricians have accurate field information.

## Scope

Included:
- Edit customer name, phone, email, and customer type
- Edit site name, address, city, and access notes
- Success/error feedback on customer detail page
- Role-gated forms for admin/manager

Excluded:
- New schema changes
- Creating additional sites from customer detail
- Deleting customers or sites
- Advanced validation beyond MVP basics

## Files likely affected

- `components/**`
- `README.md`
- `PLANS.md`

## Data model changes

- No schema changes.
- Uses existing customer and site tables with RLS update policies.

## UI changes

- Add edit forms to customer detail.
- Keep forms visible only for admin/manager.
- Preserve mobile-friendly large inputs and buttons.

## Security/RLS considerations

- Updates are enforced by existing RLS.
- Electricians do not see edit forms.
- Admin/manager can only update company-scoped data.

## Implementation steps

1. Add customer update handler.
2. Add site update handler.
3. Render role-gated forms.
4. Add feedback states.
5. Validate lint, typecheck, build, and browser smoke.

## Validation

Commands to run:
- npm run lint
- npm run typecheck
- npm run build

Manual checks:
- Confirm logged-out customer detail still renders safely.
- Confirm electrician users do not see edit forms.
- Confirm update errors surface clearly if RLS denies the write.

## Risks

- Forms are simple and visible inline; if customer detail grows, we may later split edit sections into collapsible panels.

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
