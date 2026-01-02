/*
  # Add SELECT RLS policy for profiles table

  1. Security
    - Add SELECT policy to allow users to read their own profile
    - Add SELECT policy to allow admins to read all profiles

  2. Changes
    - Create policy for authenticated users to SELECT their own profile
    - Create policy for admin users to SELECT all profiles
*/

-- Drop existing SELECT policies if any
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow admins to read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
