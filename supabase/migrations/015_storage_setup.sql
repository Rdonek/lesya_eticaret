-- Create a public bucket for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Set up access policies for the bucket

-- 1. Allow public access to view images
create policy "Public Access"
on storage.objects for select
to public
using ( bucket_id = 'product-images' );

-- 2. Allow authenticated users (admins) to upload images
create policy "Admins can upload images"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'product-images' );

-- 3. Allow authenticated users (admins) to update/delete images
create policy "Admins can update and delete images"
on storage.objects for all
to authenticated
using ( bucket_id = 'product-images' );
