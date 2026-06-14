# PLANS.md

Use this file when a task affects more than 3 files, changes database schema, changes auth/security, or introduces a new product module.

## Active plan: Admin work order pipeline

## Goal

Give admin and manager a quick operational overview of work orders by status.

## User story

As an owner or admin, I want to filter work orders by lifecycle status, so that I can see what needs action without scanning every job.

## Scope

Included:
- Add status filter chips to the work order list.
- Show counts for the most important operational statuses.
- Keep the existing assignment actions in the list.

Excluded:
- New schema changes
- Drag-and-drop boards
- Advanced reporting
- Route planning

## Files likely affected

- `PLANS.md`
- `components/customer-work-order-flow.tsx`
- `lib/domain.ts`

## Data model changes

- No schema changes.
- Uses existing `work_orders.status`.

## UI changes

- Add mobile-friendly filter buttons above the work order list.
- Show filtered empty state when no jobs match the selected status.

## Security/RLS considerations

- Existing RLS continues to enforce company scoping.
- No new API or database permissions.

## Implementation steps

1. Add filter state and status counts.
2. Add status chips above the work order list.
3. Render filtered work orders and empty state.
4. Validate lint, typecheck, build, and browser smoke.

## Validation

Commands to run:
- npm run lint
- npm run typecheck
- npm run build

Manual checks:
- Confirm status chips update the visible list.
- Confirm unassigned jobs still show assignment buttons.

## Risks

- This remains a list, not a full kanban board, to avoid overbuilding.

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
