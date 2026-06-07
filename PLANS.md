# PLANS.md

Use this file when a task affects more than 3 files, changes database schema, changes auth/security, or introduces a new product module.

## Active plan: Mark invoice basis invoiced

## Goal

Let admin and manager close the MVP flow by marking a reviewed invoice basis as invoiced.

## User story

As an admin or manager, I want to mark a work order as invoiced after saving an invoice basis, so that it leaves the ready-for-invoice queue.

## Scope

Included:
- Mark invoice draft as exported
- Mark work order as invoiced
- Keep real invoice sending outside the MVP
- Require an existing invoice draft before closing the work order

Excluded:
- New schema changes
- Sending a real invoice
- Fortnox/Visma export
- Accounting integration

## Files likely affected

- `components/**`
- `README.md`
- `PLANS.md`

## Data model changes

- No schema changes.
- Uses existing `invoice_drafts.status` and `work_orders.status`.

## UI changes

- Add "Markera fakturerad" action to invoice draft cards.
- Disable the action until an invoice draft exists.
- Remove invoiced work orders from the ready-for-invoice queue after reload.

## Security/RLS considerations

- Updates are enforced by existing RLS.
- Admin/manager can update invoice drafts and work orders inside their company.
- Electricians cannot access invoice draft flow.

## Implementation steps

1. Add invoicing state and handler.
2. Update invoice draft to exported.
3. Update work order to invoiced.
4. Add action button and feedback.
5. Validate lint, typecheck, build, and browser smoke.

## Validation

Commands to run:
- npm run lint
- npm run typecheck
- npm run build

Manual checks:
- Confirm button is disabled until a draft exists.
- Confirm invoiced work order leaves the ready queue.
- Confirm RLS errors surface clearly if update is denied.

## Risks

- This does not send a real invoice; it only records MVP workflow state.

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
