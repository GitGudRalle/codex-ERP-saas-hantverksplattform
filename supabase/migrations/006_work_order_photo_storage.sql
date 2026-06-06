insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'work-order-photos',
  'work-order-photos',
  false,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function app_private.can_access_work_order_photo_object(object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = public, app_private
as $$
declare
  path_parts text[];
  target_company_id uuid;
  target_work_order_id uuid;
begin
  path_parts := string_to_array(object_name, '/');

  if array_length(path_parts, 1) < 3 then
    return false;
  end if;

  if path_parts[1] !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return false;
  end if;

  if path_parts[2] !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return false;
  end if;

  target_company_id := path_parts[1]::uuid;
  target_work_order_id := path_parts[2]::uuid;

  return target_company_id = app_private.current_company_id()
    and app_private.can_access_work_order(target_work_order_id)
    and exists (
      select 1
      from public.work_orders wo
      where wo.id = target_work_order_id
        and wo.company_id = target_company_id
    );
end;
$$;

grant execute on function app_private.can_access_work_order_photo_object(text)
to authenticated;

drop policy if exists "company users can view allowed work order photo objects"
on storage.objects;
create policy "company users can view allowed work order photo objects"
on storage.objects for select
to authenticated
using (
  bucket_id = 'work-order-photos'
  and app_private.can_access_work_order_photo_object(name)
);

drop policy if exists "company users can insert allowed work order photo objects"
on storage.objects;
create policy "company users can insert allowed work order photo objects"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'work-order-photos'
  and owner_id = (select auth.uid())::text
  and app_private.can_access_work_order_photo_object(name)
);

drop policy if exists "company users can update allowed work order photo objects"
on storage.objects;
create policy "company users can update allowed work order photo objects"
on storage.objects for update
to authenticated
using (
  bucket_id = 'work-order-photos'
  and app_private.can_access_work_order_photo_object(name)
)
with check (
  bucket_id = 'work-order-photos'
  and owner_id = (select auth.uid())::text
  and app_private.can_access_work_order_photo_object(name)
);

drop policy if exists "company users can delete allowed work order photo objects"
on storage.objects;
create policy "company users can delete allowed work order photo objects"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'work-order-photos'
  and app_private.can_access_work_order_photo_object(name)
);
