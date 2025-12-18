/*
  # Enable Guest Checkout - RLS Policies

  1. Changes
    - Drop ALL existing orders policies
    - Create new policies that allow:
      - Authenticated users: Full CRUD on their own orders (user_id = auth.uid())
      - Anonymous users: INSERT only (for guest checkout with user_id IS NULL)
      - Email-based SELECT: Allow querying by email for order linking

  2. Security
    - Authenticated users can only see/update their own orders
    - Guest orders can be created but require email
    - Guest orders can be queried by email (for order linking on registration)
*/

-- Drop ALL existing policies on orders table
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'orders'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON orders', policy_record.policyname);
    RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
  END LOOP;
END $$;

-- ============================================
-- SELECT POLICIES
-- ============================================

-- Allow authenticated users to select their own orders
CREATE POLICY "orders_select_own"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow selecting orders by email (for order linking when guest registers)
CREATE POLICY "orders_select_by_email"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = email
  );

-- ============================================
-- INSERT POLICIES
-- ============================================

-- Allow authenticated users to insert their own orders
CREATE POLICY "orders_insert_authenticated"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow anonymous users to insert guest orders (user_id IS NULL)
CREATE POLICY "orders_insert_guest"
  ON orders
  FOR INSERT
  TO anon
  WITH CHECK (
    user_id IS NULL 
    AND email IS NOT NULL
    AND email != ''
  );

-- ============================================
-- UPDATE POLICIES
-- ============================================

-- Allow authenticated users to update their own orders
CREATE POLICY "orders_update_own"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow updating guest orders to link them to user (for order claiming)
CREATE POLICY "orders_update_link_guest"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    user_id IS NULL 
    AND auth.jwt() ->> 'email' = email
  )
  WITH CHECK (
    auth.uid() = user_id
  );
