/*
  # Fix RLS Policies Cleanup
  
  1. Changes:
    - Grants explicit permissions to anon/authenticated roles
    - Drops all conflicting legacy policies shown in user screenshot
    - Creates simplified, permissive policies for guest checkout
    - Ensures user_id is nullable
*/

-- 1. Grant basic table permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE orders TO anon;
GRANT ALL ON TABLE orders TO authenticated;

-- 2. Ensure user_id is nullable
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- 3. Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 4. Drop ALL existing policies to remove conflicts
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can delete all orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can update all orders" ON orders;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON orders;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON orders;
DROP POLICY IF EXISTS "Give anon insert access" ON orders;
DROP POLICY IF EXISTS "orders_insert_authenticated" ON orders;
DROP POLICY IF EXISTS "orders_insert_guest" ON orders;
DROP POLICY IF EXISTS "orders_select_by_email" ON orders;
DROP POLICY IF EXISTS "orders_select_own" ON orders;
DROP POLICY IF EXISTS "orders_update_link_guest" ON orders;
DROP POLICY IF EXISTS "orders_update_own" ON orders;
DROP POLICY IF EXISTS "Allow Public Insert" ON orders;
DROP POLICY IF EXISTS "Allow Select Own" ON orders;

-- 5. Create simplified policies

-- Allow everyone to insert (Guest Checkout)
CREATE POLICY "Final_Insert_Policy"
ON orders FOR INSERT
TO public
WITH CHECK (true);

-- Allow users to see their own orders
CREATE POLICY "Final_Select_Policy"
ON orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to update their own orders
CREATE POLICY "Final_Update_Policy"
ON orders FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
