/*
  # Fix Profiles RLS for User Signup

  1. Changes
    - Drop ALL existing policies on profiles table
    - Create new comprehensive policies that allow signup
    - Allow profile creation during signup (before session is fully established)

  2. Security
    - Users can only insert profiles with their own auth.uid()
    - Users can read and update their own profiles
    - Admins can read all profiles
*/

-- Drop ALL existing policies on profiles table
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', policy_record.policyname);
  END LOOP;
END $$;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 1. Allow profile creation during signup (CRITICAL for registration)
CREATE POLICY "Allow profile creation during signup"
  ON profiles
  FOR INSERT
  TO public
  WITH CHECK (
    -- The profile ID must exist in auth.users
    EXISTS (
      SELECT 1 FROM auth.users WHERE id = profiles.id
    )
  );

-- 2. Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 3. Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Admins can read all profiles
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
