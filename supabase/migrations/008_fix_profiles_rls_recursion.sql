/*
  # Fix Profiles RLS Infinite Recursion

  1. Problem
    - Current RLS policies cause infinite recursion (PostgreSQL 42P17)
    - Likely caused by admin check that queries profiles table within policy

  2. Solution
    - Drop ALL existing policies
    - Create SIMPLE policies without recursive checks
    - Use only auth.uid() for user identification
    - Remove admin policies that cause recursion

  3. Security
    - Users can only access their own profile
    - No complex admin checks in RLS
    - Admin access will be handled at application level
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

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 1. SELECT: Users can read their own profile
CREATE POLICY "profiles_select_own"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 2. INSERT: Users can insert their own profile during signup
CREATE POLICY "profiles_insert_own"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 3. UPDATE: Users can update their own profile (but not role)
CREATE POLICY "profiles_update_own"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
  );

-- 4. DELETE: No one can delete profiles (safety)
-- No DELETE policy = no one can delete

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
