create schema if not exists app_private;

revoke all on schema app_private from public;
grant usage on schema app_private to authenticated;

create or replace function app_private.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.company_id
  from public.profiles p
  where p.id = (select auth.uid())
  limit 1
$$;

create or replace function app_private.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.role::text
  from public.profiles p
  where p.id = (select auth.uid())
  limit 1
$$;

create or replace function app_private.is_admin_or_manager()
returns boolean
language sql
stable
security definer
set search_path = public, app_private
as $$
  select app_private.current_role() in ('admin', 'manager')
$$;

create or replace function app_private.can_access_work_order(target_work_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, app_private
as $$
  select exists (
    select 1
    from public.work_orders wo
    where wo.id = target_work_order_id
      and wo.company_id = app_private.current_company_id()
      and (
        app_private.is_admin_or_manager()
        or wo.assigned_to = (select auth.uid())
      )
  )
$$;

grant execute on function app_private.current_company_id() to authenticated;
grant execute on function app_private.current_role() to authenticated;
grant execute on function app_private.is_admin_or_manager() to authenticated;
grant execute on function app_private.can_access_work_order(uuid) to authenticated;

drop policy if exists "company members can view their company" on public.companies;
create policy "company members can view their company"
on public.companies for select
to authenticated
using (id = (select app_private.current_company_id()));

drop policy if exists "profiles are visible inside company" on public.profiles;
create policy "profiles are visible inside company"
on public.profiles for select
to authenticated
using (company_id = (select app_private.current_company_id()));

drop policy if exists "admins and managers manage company profiles" on public.profiles;
create policy "admins and managers insert company profiles"
on public.profiles for insert
to authenticated
with check (
  company_id = (select app_private.current_company_id())
  and (select app_private.is_admin_or_manager())
);

create policy "admins and managers update company profiles"
on public.profiles for update
to authenticated
using (
  company_id = (select app_private.current_company_id())
  and (select app_private.is_admin_or_manager())
)
with check (
  company_id = (select app_private.current_company_id())
  and (select app_private.is_admin_or_manager())
);

create policy "admins and managers delete company profiles"
on public.profiles for delete
to authenticated
using (
  company_id = (select app_private.current_company_id())
  and (select app_private.is_admin_or_manager())
);

drop policy if exists "admins and managers manage customers" on public.customers;
drop policy if exists "electricians view customers on assigned work orders" on public.customers;
create policy "company users can view allowed customers"
on public.customers for select
to authenticated
using (
  company_id = (select app_private.current_company_id())
  and (
    (select app_private.is_admin_or_manager())
    or exists (
      select 1
      from public.work_orders wo
      where wo.customer_id = customers.id
        and wo.company_id = customers.company_id
        and wo.assigned_to = (select auth.uid())
    )
  )
);

create policy "admins and managers insert customers"
on public.customers for insert
to authenticated
with check (
  company_id = (select app_private.current_company_id())
  and (select app_private.is_admin_or_manager())
);

create policy "admins and managers update customers"
on public.customers for update
to authenticated
using (
  company_id = (select app_private.current_company_id())
  and (select app_private.is_admin_or_manager())
)
with check (
  company_id = (select app_private.current_company_id())
  and (select app_private.is_admin_or_manager())
);

create policy "admins and managers delete customers"
on public.customers for delete
to authenticated
using (
  company_id = (select app_private.current_company_id())
  and (select app_private.is_admin_or_manager())
);

drop policy if exists "admins and managers manage sites" on public.sites;
drop policy if exists "electricians view sites on assigned work orders" on public.sites;
create policy "company users can view allowed sites"
on public.sites for select
to authenticated
using (
  company_id = (select app_private.current_company_id())
  and (
    (select app_private.is_admin_or_manager())
    or exists (
      select 1
      from public.work_orders wo
      where wo.site_id = sites.id
        and wo.company_id = sites.company_id
        and wo.assigned_to = (select auth.uid())
    )
  )
);

create policy "admins and managers insert sites"
on public.sites for insert
to authenticated
with check (
  company_id = (select app_private.current_company_id())
  and (select app_private.is_admin_or_manager())
);

create policy "admins and managers update sites"
on public.sites for update
to authenticated
using (
  company_id = (select app_private.current_company_id())
  and (select app_private.is_admin_or_manager())
)
with check (
  company_id = (select app_private.current_company_id())
  and (select app_private.is_admin_or_manager())
);

create policy "admins and managers delete sites"
on public.sites for delete
to authenticated
using (
  company_id = (select app_private.current_company_id())
  and (select app_private.is_admin_or_manager())
);

drop policy if exists "admins and managers manage work orders" on public.work_orders;
drop policy if exists "electricians view assigned work orders" on public.work_orders;
drop policy if exists "electricians update assigned work order status" on public.work_orders;
create policy "company users can view allowed work orders"
on public.work_orders for select
to authenticated
using (
  company_id = (select app_private.current_company_id())
  and (
    (select app_private.is_admin_or_manager())
    or assigned_to = (select auth.uid())
  )
);

create policy "admins and managers insert work orders"
on public.work_orders for insert
to authenticated
with check (
  company_id = (select app_private.current_company_id())
  and (select app_private.is_admin_or_manager())
);

create policy "company users can update allowed work orders"
on public.work_orders for update
to authenticated
using (
  company_id = (select app_private.current_company_id())
  and (
    (select app_private.is_admin_or_manager())
    or assigned_to = (select auth.uid())
  )
)
with check (
  company_id = (select app_private.current_company_id())
  and (
    (select app_private.is_admin_or_manager())
    or assigned_to = (select auth.uid())
  )
);

create policy "admins and managers delete work orders"
on public.work_orders for delete
to authenticated
using (
  company_id = (select app_private.current_company_id())
  and (select app_private.is_admin_or_manager())
);

drop policy if exists "admins and managers manage time entries" on public.time_entries;
drop policy if exists "electricians manage time on assigned work orders" on public.time_entries;
create policy "company users can view allowed time entries"
on public.time_entries for select
to authenticated
using (
  company_id = (select app_private.current_company_id())
  and (
    (select app_private.is_admin_or_manager())
    or (select app_private.can_access_work_order(work_order_id))
  )
);

create policy "company users can insert allowed time entries"
on public.time_entries for insert
to authenticated
with check (
  company_id = (select app_private.current_company_id())
  and (
    (select app_private.is_admin_or_manager())
    or (
      electrician_id = (select auth.uid())
      and (select app_private.can_access_work_order(work_order_id))
    )
  )
);

create policy "company users can update allowed time entries"
on public.time_entries for update
to authenticated
using (
  company_id = (select app_private.current_company_id())
  and (
    (select app_private.is_admin_or_manager())
    or (select app_private.can_access_work_order(work_order_id))
  )
)
with check (
  company_id = (select app_private.current_company_id())
  and (
    (select app_private.is_admin_or_manager())
    or (
      electrician_id = (select auth.uid())
      and (select app_private.can_access_work_order(work_order_id))
    )
  )
);

create policy "company users can delete allowed time entries"
on public.time_entries for delete
to authenticated
using (
  company_id = (select app_private.current_company_id())
  and (
    (select app_private.is_admin_or_manager())
    or (select app_private.can_access_work_order(work_order_id))
  )
);

drop policy if exists "admins and managers manage materials" on public.material_entries;
drop policy if exists "electricians manage materials on assigned work orders" on public.material_entries;
create policy "company users can view allowed materials"
on public.material_entries for select
to authenticated
using (
  company_id = (select app_private.current_company_id())
  and (
    (select app_private.is_admin_or_manager())
    or (select app_private.can_access_work_order(work_order_id))
  )
);

create policy "company users can insert allowed materials"
on public.material_entries for insert
to authenticated
with check (
  company_id = (select app_private.current_company_id())
  and (
    (select app_private.is_admin_or_manager())
    or (
      added_by = (select auth.uid())
      and (select app_private.can_access_work_order(work_order_id))
    )
  )
);

create policy "company users can update allowed materials"
on public.material_entries for update
to authenticated
using (
  company_id = (select app_private.current_company_id())
  and (
    (select app_private.is_admin_or_manager())
    or (select app_private.can_access_work_order(work_order_id))
  )
)
with check (
  company_id = (select app_private.current_company_id())
  and (
    (select app_private.is_admin_or_manager())
    or (
      added_by = (select auth.uid())
      and (select app_private.can_access_work_order(work_order_id))
    )
  )
);

create policy "company users can delete allowed materials"
on public.material_entries for delete
to authenticated
using (
  company_id = (select app_private.current_company_id())
  and (
    (select app_private.is_admin_or_manager())
    or (select app_private.can_access_work_order(work_order_id))
  )
);

drop policy if exists "admins and managers manage notes" on public.work_order_notes;
drop policy if exists "electricians manage notes on assigned work orders" on public.work_order_notes;
create policy "company users can view allowed notes"
on public.work_order_notes for select
to authenticated
using (
  company_id = (select app_private.current_company_id())
  and (
    (select app_private.is_admin_or_manager())
    or (select app_private.can_access_work_order(work_order_id))
  )
);

create policy "company users can insert allowed notes"
on public.work_order_notes for insert
to authenticated
with check (
  company_id = (select app_private.current_company_id())
  and (
    (select app_private.is_admin_or_manager())
    or (
      author_id = (select auth.uid())
      and (select app_private.can_access_work_order(work_order_id))
    )
  )
);

create policy "company users can update allowed notes"
on public.work_order_notes for update
to authenticated
using (
  company_id = (select app_private.current_company_id())
  and (
    (select app_private.is_admin_or_manager())
    or (select app_private.can_access_work_order(work_order_id))
  )
)
with check (
  company_id = (select app_private.current_company_id())
  and (
    (select app_private.is_admin_or_manager())
    or (
      author_id = (select auth.uid())
      and (select app_private.can_access_work_order(work_order_id))
    )
  )
);

create policy "company users can delete allowed notes"
on public.work_order_notes for delete
to authenticated
using (
  company_id = (select app_private.current_company_id())
  and (
    (select app_private.is_admin_or_manager())
    or (select app_private.can_access_work_order(work_order_id))
  )
);

drop policy if exists "admins and managers manage photos" on public.work_order_photos;
drop policy if exists "electricians manage photos on assigned work orders" on public.work_order_photos;
create policy "company users can view allowed photos"
on public.work_order_photos for select
to authenticated
using (
  company_id = (select app_private.current_company_id())
  and (
    (select app_private.is_admin_or_manager())
    or (select app_private.can_access_work_order(work_order_id))
  )
);

create policy "company users can insert allowed photos"
on public.work_order_photos for insert
to authenticated
with check (
  company_id = (select app_private.current_company_id())
  and (
    (select app_private.is_admin_or_manager())
    or (
      uploaded_by = (select auth.uid())
      and (select app_private.can_access_work_order(work_order_id))
    )
  )
);

create policy "company users can update allowed photos"
on public.work_order_photos for update
to authenticated
using (
  company_id = (select app_private.current_company_id())
  and (
    (select app_private.is_admin_or_manager())
    or (select app_private.can_access_work_order(work_order_id))
  )
)
with check (
  company_id = (select app_private.current_company_id())
  and (
    (select app_private.is_admin_or_manager())
    or (
      uploaded_by = (select auth.uid())
      and (select app_private.can_access_work_order(work_order_id))
    )
  )
);

create policy "company users can delete allowed photos"
on public.work_order_photos for delete
to authenticated
using (
  company_id = (select app_private.current_company_id())
  and (
    (select app_private.is_admin_or_manager())
    or (select app_private.can_access_work_order(work_order_id))
  )
);

drop policy if exists "admins and managers manage invoice drafts" on public.invoice_drafts;
create policy "admins and managers manage invoice drafts"
on public.invoice_drafts for all
to authenticated
using (
  company_id = (select app_private.current_company_id())
  and (select app_private.is_admin_or_manager())
)
with check (
  company_id = (select app_private.current_company_id())
  and (select app_private.is_admin_or_manager())
);

revoke all on function public.current_company_id() from public, anon, authenticated;
revoke all on function public.current_role() from public, anon, authenticated;
revoke all on function public.is_admin_or_manager() from public, anon, authenticated;
revoke all on function public.can_access_work_order(uuid) from public, anon, authenticated;

drop function if exists public.current_user_role();
