/*
  # Add RLS policies and enable row level security for profiles and orders tables

  1. Security
    - Enable RLS on `profiles` and `orders` tables
    - Drop existing policies if any to avoid conflicts
    - Add policies for authenticated users to perform CRUD on their own data

  2. Changes
    - `profiles` table policies allow users to SELECT, INSERT, UPDATE their own profile (matching auth.uid())
    - `orders` table policies allow users to SELECT, INSERT, UPDATE their own orders (matching user_id)
*/

ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on profiles
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Profiles: allow authenticated users to select own profile'
  ) THEN
    EXECUTE 'DROP POLICY "Profiles: allow authenticated users to select own profile" ON profiles';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Profiles: allow authenticated users to insert own profile'
  ) THEN
    EXECUTE 'DROP POLICY "Profiles: allow authenticated users to insert own profile" ON profiles';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Profiles: allow authenticated users to update own profile'
  ) THEN
    EXECUTE 'DROP POLICY "Profiles: allow authenticated users to update own profile" ON profiles';
  END IF;
END $$;

-- Create policies on profiles
CREATE POLICY "Profiles: allow authenticated users to select own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Profiles: allow authenticated users to insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Profiles: allow authenticated users to update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Drop existing policies on orders
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Orders: allow authenticated users to select own orders'
  ) THEN
    EXECUTE 'DROP POLICY "Orders: allow authenticated users to select own orders" ON orders';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Orders: allow authenticated users to insert own orders'
  ) THEN
    EXECUTE 'DROP POLICY "Orders: allow authenticated users to insert own orders" ON orders';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Orders: allow authenticated users to update own orders'
  ) THEN
    EXECUTE 'DROP POLICY "Orders: allow authenticated users to update own orders" ON orders';
  END IF;
END $$;

-- Create policies on orders
CREATE POLICY "Orders: allow authenticated users to select own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Orders: allow authenticated users to insert own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Orders: allow authenticated users to update own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
