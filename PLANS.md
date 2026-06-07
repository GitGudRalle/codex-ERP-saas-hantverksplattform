# PLANS.md

Use this file when a task affects more than 3 files, changes database schema, changes auth/security, or introduces a new product module.

## Active plan: Invoice review documentation

## Goal

Make invoice draft review show enough job documentation for admin/manager to catch missing reporting before marking an invoice basis ready.

## User story

As an admin or manager, I want to see time, material, and photo documentation in the invoice draft flow, so that I can create invoice basis without opening several separate pages.

## Scope

Included:
- Photo documentation in the invoice draft flow
- Per-work-order warnings for missing time, material, and photos
- Summary counts for ready drafts and missing reporting
- Existing private photo gallery reused through signed URLs

Excluded:
- New schema changes
- Real invoice sending
- Fortnox/Visma export

## Files likely affected

- `components/**`
- `README.md`
- `PLANS.md`

## Data model changes

- No schema changes.
- Uses existing `work_order_photos`, `time_entries`, `material_entries`, and `invoice_drafts`.

## UI changes

- Add invoice review summary cards.
- Show warning badges on invoice draft cards.
- Show photo gallery inside the invoice draft review card.

## Security/RLS considerations

- Reads are still enforced by existing Supabase RLS.
- Photo previews still use signed URLs from the private storage bucket.
- No new policies are required.

## Implementation steps

1. Load work order photos in the invoice draft flow.
2. Add review summary counts.
3. Add missing-data warning badges per work order.
4. Render photo documentation in each invoice draft card.
5. Validate lint, typecheck, build, and browser smoke.

## Validation

Commands to run:
- npm run lint
- npm run typecheck
- npm run build

Manual checks:
- Confirm invoice draft page renders logged-out and logged-in states.
- Confirm warnings show when time, material, or photos are missing.
- Confirm photo gallery can render without public bucket access.

## Risks

- HEIC previews may still depend on browser support; the signed open link remains available.
- Invoice review now loads photos in addition to reporting rows, so large future datasets may need pagination.

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
