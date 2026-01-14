/*
  # Create Payment Badges Storage Bucket RLS Policies

  1. Security Policies
    - Public read access (anyone can view uploaded images)
    - Admin upload access (only admins can upload)
    - Admin update access (only admins can replace images)
    - Admin delete access (only admins can delete images)

  2. Notes
    - Bucket must be created manually in Supabase Dashboard first
    - These policies apply to the storage.objects table
*/

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public read access to payment badges
CREATE POLICY "Public read access for payment badges"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'payment-badges');

-- Policy 2: Allow authenticated admins to upload payment badges
CREATE POLICY "Admin upload access for payment badges"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-badges' 
  AND (auth.jwt() ->> 'role')::text = 'admin'
);

-- Policy 3: Allow authenticated admins to update payment badges
CREATE POLICY "Admin update access for payment badges"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'payment-badges' 
  AND (auth.jwt() ->> 'role')::text = 'admin'
);

-- Policy 4: Allow authenticated admins to delete payment badges
CREATE POLICY "Admin delete access for payment badges"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'payment-badges' 
  AND (auth.jwt() ->> 'role')::text = 'admin'
);
