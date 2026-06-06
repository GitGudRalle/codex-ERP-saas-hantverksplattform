create extension if not exists "pgcrypto";

do $$
begin
  create type public.profile_role as enum ('admin', 'manager', 'electrician');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.work_order_status as enum (
    'new',
    'scheduled',
    'assigned',
    'on_the_way',
    'in_progress',
    'waiting_for_material',
    'waiting_for_customer',
    'completed',
    'ready_for_invoice',
    'invoiced',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.work_order_priority as enum ('low', 'normal', 'high', 'urgent');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.invoice_draft_status as enum ('draft', 'ready', 'exported');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  role public.profile_role not null default 'electrician',
  full_name text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  customer_type text not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  name text,
  address text not null,
  city text,
  access_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.work_orders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  site_id uuid not null references public.sites(id) on delete restrict,
  assigned_to uuid references public.profiles(id) on delete set null,
  title text not null,
  description text not null,
  status public.work_order_status not null default 'new',
  priority public.work_order_priority not null default 'normal',
  scheduled_start timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  electrician_id uuid not null references public.profiles(id) on delete restrict,
  entry_date date not null default current_date,
  hours numeric(5, 2) not null check (hours > 0),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.material_entries (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  added_by uuid not null references public.profiles(id) on delete restrict,
  name text not null,
  quantity numeric(10, 2) not null check (quantity > 0),
  unit text not null default 'st',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.work_order_notes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete restrict,
  note text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.work_order_photos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete restrict,
  storage_path text not null,
  caption text,
  created_at timestamptz not null default now()
);

create table if not exists public.invoice_drafts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  work_order_id uuid not null references public.work_orders(id) on delete restrict,
  status public.invoice_draft_status not null default 'draft',
  invoice_text text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_company_id_idx on public.profiles(company_id);
create index if not exists customers_company_id_idx on public.customers(company_id);
create index if not exists customers_company_name_idx on public.customers(company_id, name);
create index if not exists sites_customer_id_idx on public.sites(customer_id);
create index if not exists work_orders_company_status_idx on public.work_orders(company_id, status);
create index if not exists work_orders_assigned_status_idx on public.work_orders(assigned_to, status);
create index if not exists time_entries_work_order_id_idx on public.time_entries(work_order_id);
create index if not exists material_entries_work_order_id_idx on public.material_entries(work_order_id);
create index if not exists work_order_notes_work_order_id_idx on public.work_order_notes(work_order_id);
create index if not exists work_order_photos_work_order_id_idx on public.work_order_photos(work_order_id);
create index if not exists invoice_drafts_company_status_idx on public.invoice_drafts(company_id, status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at before update on public.companies
for each row execute function public.set_updated_at();
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at before update on public.customers
for each row execute function public.set_updated_at();
drop trigger if exists sites_set_updated_at on public.sites;
create trigger sites_set_updated_at before update on public.sites
for each row execute function public.set_updated_at();
drop trigger if exists work_orders_set_updated_at on public.work_orders;
create trigger work_orders_set_updated_at before update on public.work_orders
for each row execute function public.set_updated_at();
drop trigger if exists time_entries_set_updated_at on public.time_entries;
create trigger time_entries_set_updated_at before update on public.time_entries
for each row execute function public.set_updated_at();
drop trigger if exists material_entries_set_updated_at on public.material_entries;
create trigger material_entries_set_updated_at before update on public.material_entries
for each row execute function public.set_updated_at();
drop trigger if exists work_order_notes_set_updated_at on public.work_order_notes;
create trigger work_order_notes_set_updated_at before update on public.work_order_notes
for each row execute function public.set_updated_at();
drop trigger if exists invoice_drafts_set_updated_at on public.invoice_drafts;
create trigger invoice_drafts_set_updated_at before update on public.invoice_drafts
for each row execute function public.set_updated_at();

create or replace function public.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from public.profiles where id = auth.uid()
$$;

drop function if exists public.current_role();
create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role::text from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin_or_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() in ('admin', 'manager')
$$;

create or replace function public.can_access_work_order(target_work_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.work_orders wo
    where wo.id = target_work_order_id
      and wo.company_id = public.current_company_id()
      and (
        public.is_admin_or_manager()
        or wo.assigned_to = auth.uid()
      )
  )
$$;

alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.sites enable row level security;
alter table public.work_orders enable row level security;
alter table public.time_entries enable row level security;
alter table public.material_entries enable row level security;
alter table public.work_order_notes enable row level security;
alter table public.work_order_photos enable row level security;
alter table public.invoice_drafts enable row level security;

drop policy if exists "company members can view their company" on public.companies;
create policy "company members can view their company"
on public.companies for select
using (id = public.current_company_id());

drop policy if exists "profiles are visible inside company" on public.profiles;
create policy "profiles are visible inside company"
on public.profiles for select
using (company_id = public.current_company_id());

drop policy if exists "admins and managers manage company profiles" on public.profiles;
create policy "admins and managers manage company profiles"
on public.profiles for all
using (company_id = public.current_company_id() and public.is_admin_or_manager())
with check (company_id = public.current_company_id() and public.is_admin_or_manager());

drop policy if exists "admins and managers manage customers" on public.customers;
create policy "admins and managers manage customers"
on public.customers for all
using (company_id = public.current_company_id() and public.is_admin_or_manager())
with check (company_id = public.current_company_id() and public.is_admin_or_manager());

drop policy if exists "electricians view customers on assigned work orders" on public.customers;
create policy "electricians view customers on assigned work orders"
on public.customers for select
using (
  company_id = public.current_company_id()
  and exists (
    select 1
    from public.work_orders wo
    where wo.customer_id = customers.id
      and wo.company_id = customers.company_id
      and wo.assigned_to = auth.uid()
  )
);

drop policy if exists "admins and managers manage sites" on public.sites;
create policy "admins and managers manage sites"
on public.sites for all
using (company_id = public.current_company_id() and public.is_admin_or_manager())
with check (company_id = public.current_company_id() and public.is_admin_or_manager());

drop policy if exists "electricians view sites on assigned work orders" on public.sites;
create policy "electricians view sites on assigned work orders"
on public.sites for select
using (
  company_id = public.current_company_id()
  and exists (
    select 1
    from public.work_orders wo
    where wo.site_id = sites.id
      and wo.company_id = sites.company_id
      and wo.assigned_to = auth.uid()
  )
);

drop policy if exists "admins and managers manage work orders" on public.work_orders;
create policy "admins and managers manage work orders"
on public.work_orders for all
using (company_id = public.current_company_id() and public.is_admin_or_manager())
with check (company_id = public.current_company_id() and public.is_admin_or_manager());

drop policy if exists "electricians view assigned work orders" on public.work_orders;
create policy "electricians view assigned work orders"
on public.work_orders for select
using (company_id = public.current_company_id() and assigned_to = auth.uid());

drop policy if exists "electricians update assigned work order status" on public.work_orders;
create policy "electricians update assigned work order status"
on public.work_orders for update
using (company_id = public.current_company_id() and assigned_to = auth.uid())
with check (company_id = public.current_company_id() and assigned_to = auth.uid());

drop policy if exists "admins and managers manage time entries" on public.time_entries;
create policy "admins and managers manage time entries"
on public.time_entries for all
using (company_id = public.current_company_id() and public.is_admin_or_manager())
with check (company_id = public.current_company_id() and public.is_admin_or_manager());

drop policy if exists "electricians manage time on assigned work orders" on public.time_entries;
create policy "electricians manage time on assigned work orders"
on public.time_entries for all
using (company_id = public.current_company_id() and public.can_access_work_order(work_order_id))
with check (
  company_id = public.current_company_id()
  and electrician_id = auth.uid()
  and public.can_access_work_order(work_order_id)
);

drop policy if exists "admins and managers manage materials" on public.material_entries;
create policy "admins and managers manage materials"
on public.material_entries for all
using (company_id = public.current_company_id() and public.is_admin_or_manager())
with check (company_id = public.current_company_id() and public.is_admin_or_manager());

drop policy if exists "electricians manage materials on assigned work orders" on public.material_entries;
create policy "electricians manage materials on assigned work orders"
on public.material_entries for all
using (company_id = public.current_company_id() and public.can_access_work_order(work_order_id))
with check (
  company_id = public.current_company_id()
  and added_by = auth.uid()
  and public.can_access_work_order(work_order_id)
);

drop policy if exists "admins and managers manage notes" on public.work_order_notes;
create policy "admins and managers manage notes"
on public.work_order_notes for all
using (company_id = public.current_company_id() and public.is_admin_or_manager())
with check (company_id = public.current_company_id() and public.is_admin_or_manager());

drop policy if exists "electricians manage notes on assigned work orders" on public.work_order_notes;
create policy "electricians manage notes on assigned work orders"
on public.work_order_notes for all
using (company_id = public.current_company_id() and public.can_access_work_order(work_order_id))
with check (
  company_id = public.current_company_id()
  and author_id = auth.uid()
  and public.can_access_work_order(work_order_id)
);

drop policy if exists "admins and managers manage photos" on public.work_order_photos;
create policy "admins and managers manage photos"
on public.work_order_photos for all
using (company_id = public.current_company_id() and public.is_admin_or_manager())
with check (company_id = public.current_company_id() and public.is_admin_or_manager());

drop policy if exists "electricians manage photos on assigned work orders" on public.work_order_photos;
create policy "electricians manage photos on assigned work orders"
on public.work_order_photos for all
using (company_id = public.current_company_id() and public.can_access_work_order(work_order_id))
with check (
  company_id = public.current_company_id()
  and uploaded_by = auth.uid()
  and public.can_access_work_order(work_order_id)
);

drop policy if exists "admins and managers manage invoice drafts" on public.invoice_drafts;
create policy "admins and managers manage invoice drafts"
on public.invoice_drafts for all
using (company_id = public.current_company_id() and public.is_admin_or_manager())
with check (company_id = public.current_company_id() and public.is_admin_or_manager());
