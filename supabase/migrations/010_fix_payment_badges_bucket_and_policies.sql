/*
  # Fix Payment Badges Bucket & Policies (FULL RESET)

  1. Bucket Operations
    - Ensure 'payment-badges' bucket exists
    - Ensure it is set to PUBLIC
  
  2. Policy Operations
    - DROP ALL existing policies for this bucket to remove conflicts
    - Create CLEAN policies for:
      - SELECT (Public access)
      - INSERT (Admin only)
      - UPDATE (Admin only)
      - DELETE (Admin only)
*/

-- 1. Ensure Bucket Exists and is Public
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-badges', 'payment-badges', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- 2. Drop ALL potential existing policies for this bucket (Cleanup)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload access for payment badges" ON storage.objects;
DROP POLICY IF EXISTS "Give admin access to payment badges" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Access" ON storage.objects;

-- 3. Create Fresh, Correct Policies

-- Policy: Public Read (Everyone can see badges)
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'payment-badges' );

-- Policy: Admin Insert (Only admins can upload)
CREATE POLICY "Admin Insert Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-badges' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy: Admin Update (Only admins can update)
CREATE POLICY "Admin Update Access"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'payment-badges' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy: Admin Delete (Only admins can delete)
CREATE POLICY "Admin Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'payment-badges' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);