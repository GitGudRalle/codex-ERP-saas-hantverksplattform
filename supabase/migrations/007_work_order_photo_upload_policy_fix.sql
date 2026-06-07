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
    'image/heif',
    'application/octet-stream'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "company users can insert allowed work order photo objects"
on storage.objects;
create policy "company users can insert allowed work order photo objects"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'work-order-photos'
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
  and app_private.can_access_work_order_photo_object(name)
);
