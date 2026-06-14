# PLANS.md

Use this file when a task affects more than 3 files, changes database schema, changes auth/security, or introduces a new product module.

## Active plan: Invoice draft documentation review

## Goal

Make invoice draft review include field notes and clearer documentation completeness.

## User story

As an admin or manager, I want notes and photo counts included when reviewing invoice basis, so that important field documentation is not missed.

## Scope

Included:
- Fetch work order notes in invoice draft flow.
- Include notes and photo count in generated invoice text.
- Treat documentation as notes or photos, not photos only.
- Show notes beside time/material/photos during review.

Excluded:
- New schema changes
- Real invoice sending
- AI-generated invoice text
- Accounting integrations

## Files likely affected

- `PLANS.md`
- `components/invoice-draft-flow.tsx`

## Data model changes

- No schema changes.
- Uses existing `work_order_notes` and `work_order_photos`.

## UI changes

- Add notes to the invoice review card.
- Improve generated text with field notes and documentation count.

## Security/RLS considerations

- Existing RLS continues to enforce company scoping.
- No new API or database permissions.

## Implementation steps

1. Fetch notes in invoice draft flow.
2. Include notes/photos in review summary and generated text.
3. Render notes in invoice review cards.
4. Validate lint, typecheck, build, and browser smoke.

## Validation

Commands to run:
- npm run lint
- npm run typecheck
- npm run build

Manual checks:
- Confirm completed documentation is recognized when notes or photos exist.
- Confirm generated invoice text includes notes where present.

## Risks

- Notes may contain internal wording; admin can edit invoice text before saving.

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
