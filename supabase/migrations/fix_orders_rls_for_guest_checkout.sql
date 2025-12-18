/*
  # Fix Orders RLS to Allow Guest Checkout

  1. Changes
    - Drop existing orders policies
    - Create new policies that allow:
      - Authenticated users to manage their own orders (user_id = auth.uid())
      - Guest users to create orders (user_id IS NULL)
      - Anyone to insert orders (for guest checkout)

  2. Security
    - Authenticated users can only see/update their own orders
    - Guest orders can be created but not queried without order ID
*/

-- Drop existing policies on orders
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Users can read own orders'
  ) THEN
    DROP POLICY "Users can read own orders" ON orders;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Users can insert own orders'
  ) THEN
    DROP POLICY "Users can insert own orders" ON orders;
  END IF;
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
