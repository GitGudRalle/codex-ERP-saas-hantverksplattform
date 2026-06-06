-- DEV ONLY.
-- Use this only in a fresh development Supabase project when the first MVP
-- schema migration has been partially applied and needs to be rerun cleanly.
-- This deletes the MVP tables, storage bucket, and helper functions created by this project.

delete from storage.objects where bucket_id = 'work-order-photos';
delete from storage.buckets where id = 'work-order-photos';

drop table if exists public.invoice_drafts cascade;
drop table if exists public.work_order_photos cascade;
drop table if exists public.work_order_notes cascade;
drop table if exists public.material_entries cascade;
drop table if exists public.time_entries cascade;
drop table if exists public.work_orders cascade;
drop table if exists public.sites cascade;
drop table if exists public.customers cascade;
drop table if exists public.profiles cascade;
drop table if exists public.companies cascade;

drop function if exists public.can_access_work_order(uuid);
drop function if exists public.is_admin_or_manager();
drop function if exists public.current_role();
drop function if exists public.current_company_id();
drop function if exists public.set_updated_at();
drop function if exists app_private.can_access_work_order_photo_object(text);

drop type if exists public.invoice_draft_status;
drop type if exists public.work_order_priority;
drop type if exists public.work_order_status;
drop type if exists public.profile_role;
