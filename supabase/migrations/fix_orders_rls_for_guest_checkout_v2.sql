/*
  # Fix Orders RLS to Allow Guest Checkout (v2)

  1. Changes
    - Drop ALL existing orders policies safely
    - Create new policies that allow:
      - Authenticated users to manage their own orders (user_id = auth.uid())
      - Guest users to create orders (user_id IS NULL)
      - Anyone to insert orders (for guest checkout)

  2. Security
    - Authenticated users can only see/update their own orders
    - Guest orders can be created but not queried without order ID
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

-- Allow authenticated users to select their own orders
CREATE POLICY "Orders: authenticated users select own"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow anyone to insert orders (guest checkout)
CREATE POLICY "Orders: allow insert for all"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow authenticated users to update their own orders
CREATE POLICY "Orders: authenticated users update own"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
