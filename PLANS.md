# PLANS.md

Use this file when a task affects more than 3 files, changes database schema, changes auth/security, or introduces a new product module.

## Active plan: Correct field reporting mistakes

## Goal

Let electricians correct mistakes in reported time, material, notes, and photos from the mobile field workflow.

## User story

As an electrician, I want to remove an incorrect report row directly from `Mina jobb`, so that admin does not invoice wrong time, material, notes, or photos.

## Scope

Included:
- Delete reported time entries
- Delete reported material entries
- Delete work order notes
- Delete work order photo metadata and storage object
- Clear loading states and Supabase error messages

Excluded:
- New schema changes
- Editing existing rows inline
- Undo/restore after delete
- Admin correction screens

## Files likely affected

- `components/**`
- `README.md`
- `PLANS.md`

## Data model changes

- No schema changes.
- Uses existing RLS delete policies for reporting tables and storage objects.

## UI changes

- Add small delete buttons next to reported rows in `Mina jobb`.
- Keep delete controls visible but secondary to reporting actions.
- Show per-row deleting state.

## Security/RLS considerations

- Deletes are enforced by existing RLS.
- Electricians can only delete reporting connected to assigned work orders.
- Photo deletion removes database metadata and then attempts storage cleanup.

## Implementation steps

1. Add delete handlers for time, material, notes, and photos.
2. Add row-level delete buttons in the field workflow.
3. Clean up storage objects for deleted photos.
4. Keep UI states clear on mobile.
5. Validate lint, typecheck, build, and browser smoke.

## Validation

Commands to run:
- npm run lint
- npm run typecheck
- npm run build

Manual checks:
- Confirm delete buttons render in reported rows.
- Confirm loading state prevents repeat taps.
- Confirm RLS errors surface clearly if deletion is denied.

## Risks

- Deletes are currently immediate; a future confirmation or undo may be useful once real users test the flow.
- If storage deletion fails after metadata deletion, the UI reports it but the orphaned storage object may remain.

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
