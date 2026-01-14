/*
  # Fix Payment Badges Storage - Add Missing INSERT Policy

  1. Problem
    - Upload hanging at "Starting upload to payment-badges bucket..."
    - Only SELECT policy exists, INSERT policy is missing
    - Admin users cannot upload files

  2. Solution
    - Add INSERT policy for authenticated admin users
    - Ensure policy checks user role from profiles table

  3. Security
    - Only authenticated users with role='admin' can upload
    - Public users can only read (SELECT)
*/

-- Drop existing INSERT policy if exists (cleanup)
DROP POLICY IF EXISTS "Admin upload access for payment badges" ON storage.objects;

-- Create INSERT policy for admin users
CREATE POLICY "Admin upload access for payment badges"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-badges' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Verify all policies exist
DO $$
BEGIN
  -- Check if all required policies exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Admin upload access for payment badges'
  ) THEN
    RAISE EXCEPTION 'INSERT policy creation failed!';
  END IF;

  RAISE NOTICE 'Payment badges INSERT policy created successfully';
END $$;
