-- DEV ONLY.
-- Run this after 001_core_mvp_schema.sql in a fresh development Supabase project.
--
-- Before running:
-- 1. Create two users in Supabase Authentication.
-- 2. Copy their user IDs into the variables below.
-- 3. Run this script in Supabase SQL Editor.

do $$
declare
  company_id uuid := gen_random_uuid();
  admin_user_id uuid := '00000000-0000-0000-0000-000000000001';
  electrician_user_id uuid := '00000000-0000-0000-0000-000000000002';
  customer_private_id uuid := gen_random_uuid();
  customer_brf_id uuid := gen_random_uuid();
  site_private_id uuid := gen_random_uuid();
  site_brf_id uuid := gen_random_uuid();
  work_order_1_id uuid := gen_random_uuid();
  work_order_2_id uuid := gen_random_uuid();
begin
  if admin_user_id = '00000000-0000-0000-0000-000000000001'
    or electrician_user_id = '00000000-0000-0000-0000-000000000002'
  then
    raise exception 'Replace admin_user_id and electrician_user_id with real Supabase auth user IDs before running this seed.';
  end if;

  insert into public.companies (id, name, organization_number)
  values (company_id, 'Ljungqvist Elservice AB', '559000-0000');

  insert into public.profiles (id, company_id, role, full_name, phone)
  values
    (admin_user_id, company_id, 'admin', 'Rasmus Ljungqvist', '070-111 22 33'),
    (electrician_user_id, company_id, 'electrician', 'Erik Andersson', '070-123 45 01');

  insert into public.customers (id, company_id, name, email, phone, customer_type)
  values
    (customer_private_id, company_id, 'Anna Karlsson', 'anna@example.se', '070-555 12 34', 'private'),
    (customer_brf_id, company_id, 'BRF Eken', 'styrelse@brfeken.se', '08-555 44 33', 'brf');

  insert into public.sites (id, company_id, customer_id, name, address, city, access_notes)
  values
    (
      site_private_id,
      company_id,
      customer_private_id,
      'Villa',
      'Björkgatan 12',
      'Skövde',
      'Ring innan, hund finns i huset.'
    ),
    (
      site_brf_id,
      company_id,
      customer_brf_id,
      'Trapphus A',
      'Ekvägen 4',
      'Skövde',
      'Nyckelbricka hämtas hos ordförande.'
    );

  insert into public.work_orders (
    id,
    company_id,
    customer_id,
    site_id,
    assigned_to,
    title,
    description,
    status,
    priority,
    scheduled_start
  )
  values
    (
      work_order_1_id,
      company_id,
      customer_private_id,
      site_private_id,
      electrician_user_id,
      'Felsökning köksuttag',
      'Jordfelsbrytaren löser ut när kaffebryggaren startas.',
      'assigned',
      'normal',
      now() + interval '1 hour'
    ),
    (
      work_order_2_id,
      company_id,
      customer_brf_id,
      site_brf_id,
      electrician_user_id,
      'Belysning i trapphus',
      'Två armaturer blinkar och behöver kontrolleras.',
      'on_the_way',
      'high',
      now() + interval '4 hours'
    );

  insert into public.work_order_notes (company_id, work_order_id, author_id, note)
  values (
    company_id,
    work_order_1_id,
    admin_user_id,
    'Kunden vill gärna bli uppringd 30 minuter innan ankomst.'
  );
end $$;
