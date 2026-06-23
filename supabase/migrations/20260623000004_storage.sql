-- Create storage bucket for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Allow admins to upload
create policy "admin upload product images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and (select role from public.profiles where id = auth.uid()) = 'admin'
);

-- Allow public read
create policy "public read product images"
on storage.objects for select
to public
using (bucket_id = 'product-images');

-- Allow admins to delete
create policy "admin delete product images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'product-images'
  and (select role from public.profiles where id = auth.uid()) = 'admin'
);
