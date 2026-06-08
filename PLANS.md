# PLANS.md

Use this file when a task affects more than 3 files, changes database schema, changes auth/security, or introduces a new product module.

## Active plan: HEIC photo preview reliability

## Goal

Make iPhone/Android photo uploads preview reliably in the browser.

## User story

As an electrician, I want uploaded photos to be visible in the work order, so that documentation can be reviewed before invoicing.

## Scope

Included:
- Convert HEIC/HEIF uploads to browser-friendly JPEG before saving.
- Keep JPG, PNG, and WebP upload behavior unchanged.
- Show a clear fallback for existing files the browser cannot preview.

Excluded:
- New schema changes
- Server-side image processing
- Native mobile capture features

## Files likely affected

- `components/electrician-jobs.tsx`
- `components/work-order-photo-gallery.tsx`
- `package.json`
- `package-lock.json`
- `.gitignore`
- `PLANS.md`

## Data model changes

- No schema changes.
- Future HEIC/HEIF uploads are stored as JPEG objects in the existing private bucket.

## UI changes

- Existing HEIC files no longer show as a blank preview area.
- Users get a Swedish explanation and an open/download action when a preview is unavailable.

## Security/RLS considerations

- Existing Supabase Storage bucket and RLS policies remain unchanged.
- Conversion happens locally in the browser before upload.
- Stored objects remain company/work-order scoped.

## Implementation steps

1. Add browser-side HEIC/HEIF conversion helper.
2. Upload converted JPEG files with correct content type and filename.
3. Add gallery fallback for unsupported previews.
4. Validate lint, typecheck, build, and browser smoke.

## Validation

Commands to run:
- npm run lint
- npm run typecheck
- npm run build

Manual checks:
- Upload HEIC from the electrician view.
- Confirm the saved image renders as a preview.
- Confirm existing unsupported HEIC files show fallback text instead of a blank box.

## Risks

- HEIC conversion runs on the device and may take a few seconds for large photos.

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
