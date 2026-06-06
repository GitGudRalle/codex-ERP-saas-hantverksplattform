create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create index if not exists sites_company_id_idx on public.sites(company_id);
create index if not exists work_orders_customer_id_idx on public.work_orders(customer_id);
create index if not exists work_orders_site_id_idx on public.work_orders(site_id);
create index if not exists time_entries_company_id_idx on public.time_entries(company_id);
create index if not exists time_entries_electrician_id_idx on public.time_entries(electrician_id);
create index if not exists material_entries_company_id_idx on public.material_entries(company_id);
create index if not exists material_entries_added_by_idx on public.material_entries(added_by);
create index if not exists work_order_notes_company_id_idx on public.work_order_notes(company_id);
create index if not exists work_order_notes_author_id_idx on public.work_order_notes(author_id);
create index if not exists work_order_photos_company_id_idx on public.work_order_photos(company_id);
create index if not exists work_order_photos_uploaded_by_idx on public.work_order_photos(uploaded_by);
create index if not exists invoice_drafts_work_order_id_idx on public.invoice_drafts(work_order_id);
create index if not exists invoice_drafts_created_by_idx on public.invoice_drafts(created_by);
