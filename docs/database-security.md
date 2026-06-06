# Database security notes

The first MVP migration is:

```text
supabase/migrations/001_core_mvp_schema.sql
```

## Security impact

- Business data is scoped with `company_id`.
- Row Level Security is enabled on every MVP table.
- Admin and manager users can manage company data.
- Electricians can read only assigned work orders.
- Electricians can read customer and site details only when they belong to an assigned work order.
- Electricians can add time, material, notes, and photos only for assigned work orders.
- Invoice drafts are restricted to admin and manager users.

## Bootstrap note

The migration does not solve company onboarding by itself. The first company and first admin profile need to be created through a trusted setup path before ordinary users can rely on RLS policies.

## RLS hardening

Migration `supabase/migrations/003_rls_policy_hardening.sql` moves RLS helper functions into the `app_private` schema and rewrites policies so they apply only to authenticated users. Migration `supabase/migrations/004_private_rls_function_grants.sql` tightens function grants explicitly for the private helper functions.

- Helper functions are no longer exposed as public RPC endpoints.
- Policies use `(select auth.uid())` and `(select app_private.helper())` where appropriate to avoid row-by-row auth initialization overhead.
- Admin/manager and electrician permissions are consolidated per action where practical to reduce overlapping permissive policies.
- The old unused `public.current_user_role()` helper is dropped.

Supabase may still report unused-index info while the test database has very little data. Keep the MVP indexes until real query patterns prove otherwise.

## Before live data

Before connecting real app writes:

1. Apply the migration in a Supabase project.
2. Create a test company with admin, manager, and electrician profiles.
3. Verify that an electrician cannot query another company's customers, sites, work orders, time entries, materials, notes, photos, or invoice drafts.
4. Verify that admin and manager users can manage only their own company data.
