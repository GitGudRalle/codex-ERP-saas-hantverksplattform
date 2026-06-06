# Supabase setup

## Run the first migration

Use the raw GitHub version of the migration when copying into Supabase SQL Editor:

```text
https://github.com/GitGudRalle/codex-ERP-saas-hantverksplattform/raw/main/supabase/migrations/001_core_mvp_schema.sql
```

Choose **Run and enable RLS** when Supabase asks.

## If the migration partially failed

If the SQL Editor has several running queries or you have retried the same migration several times, stop/cancel the running queries first.

For a fresh development project with no real data, run this reset script once:

```text
supabase/dev_reset_core_schema.sql
```

Then run the migration again from a new SQL Editor tab.

Do not use the reset script in production or in a Supabase project with real customer data.

## Add development test data

After the migration has run successfully, create two users in Supabase Authentication:

- one admin/manager user
- one electrician user

Then copy their user IDs from Supabase Authentication and paste them into:

```text
supabase/dev_bootstrap_seed.sql
```

Replace:

```sql
admin_user_id uuid := '00000000-0000-0000-0000-000000000001';
electrician_user_id uuid := '00000000-0000-0000-0000-000000000002';
```

Run the seed script in Supabase SQL Editor.

The script creates:

- Ljungqvist Elservice AB
- one admin profile
- one electrician profile
- two customers
- two sites
- two assigned work orders
- one work order note

This gives enough data to test company scoping and the first customer-to-work-order flow.
