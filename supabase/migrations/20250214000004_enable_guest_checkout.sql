/*
  # Fix Orders RLS for Guest Checkout
  
  1. Changes:
    - Drop all existing policies on 'orders' to ensure a clean state and avoid conflicts.
    - Create a permissive INSERT policy for 'public' role (includes anon/guest users).
    - Create SELECT/UPDATE policies restricted to authenticated users owning the record.
    - Ensure user_id column is nullable (required for guest checkout).
*/

-- 1. Ensure user_id is nullable for guest orders (just in case)
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- 2. Drop all existing policies to prevent conflicts
-- We use DO block to handle potential errors if policies don't exist, 
-- but explicit DROP IF EXISTS is cleaner for known policy names.
DROP POLICY IF EXISTS "Orders: authenticated users select own" ON orders;
DROP POLICY IF EXISTS "Orders: allow insert for all" ON orders;
DROP POLICY IF EXISTS "Orders: authenticated users update own" ON orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
DROP POLICY IF EXISTS "Enable insert for everyone" ON orders;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON orders;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON orders;

-- 3. Re-enable RLS (Ensure it is on)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 4. INSERT Policy: Allow EVERYONE (Guests + Authenticated) to create orders
-- This is the critical fix for the 401 error during guest checkout
CREATE POLICY "Enable insert for everyone"
ON orders FOR INSERT
TO public
WITH CHECK (true);

-- 5. SELECT Policy: Only authenticated users can see their OWN orders
-- Guests cannot query orders table directly (security best practice)
CREATE POLICY "Enable select for users based on user_id"
ON orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 6. UPDATE Policy: Only authenticated users can update their OWN orders
CREATE POLICY "Enable update for users based on user_id"
ON orders FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
