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
