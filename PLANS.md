# PLANS.md

Use this file when a task affects more than 3 files, changes database schema, changes auth/security, or introduces a new product module.

## Active plan: Work order photo documentation

## Goal

Allow electricians to upload work order photos from mobile devices and make the documentation visible through review and detail flows.

## User story

As an electrician, I want to add photos from my phone to an assigned work order, so that documentation follows the job into admin review and invoice preparation.

## Scope

Included:
- Private Supabase Storage bucket for work order photos
- Storage RLS policies scoped by company and work order access
- Mobile-compatible upload UI in `Mina jobb`
- Photo metadata saved in `work_order_photos`
- Photo gallery in `Mina jobb`, work order detail, and completed-job review

Excluded:
- Native camera app integration
- Offline upload queue
- Image compression/transcoding
- Sending real invoices
- Fortnox/Visma export

## Files likely affected

- `supabase/migrations/**`
- `app/**`
- `components/**`
- `README.md`
- `PLANS.md`
- `docs/**`

## Data model changes

- Adds a private Supabase Storage bucket and storage object policies.
- Uses the existing `work_order_photos` table for metadata.

## UI changes

- Add photo upload section in each mobile job card.
- Show uploaded photos with signed URLs.
- Keep controls large enough for iPhone and Android mobile browsers.

## Security/RLS considerations

- The storage bucket is private.
- Object paths include `company_id/work_order_id/...`.
- Storage policies call private helper functions to verify company and work order access.
- Table metadata remains protected by existing `work_order_photos` RLS policies.

## Implementation steps

1. Add storage bucket and object policies.
2. Add reusable signed-photo gallery component.
3. Add mobile upload form in `Mina jobb`.
4. Show photos in detail and review surfaces.
5. Validate lint, typecheck, build, browser smoke, and Supabase advisors.

## Validation

Commands to run:
- npm run lint
- npm run typecheck
- npm run build

Manual checks:
- Confirm logged-out users cannot access photo UI.
- Confirm upload accepts common iPhone/Android image formats.
- Confirm gallery renders signed URLs without public bucket access.

## Risks

- HEIC preview support depends on the browser; the app still stores the file and offers an open link.
- Large phone photos may hit the 10 MB limit until compression is added.
- Some mobile browsers report HEIC files with generic MIME types; migration `007` and client-side MIME normalization handle that case.

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
