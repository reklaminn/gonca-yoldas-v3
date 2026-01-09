/*
  # Fix Profiles RLS - Final Solution
  
  1. Problem
    - Admin check causes infinite recursion (queries profiles while evaluating profiles)
    - Cannot use self-referencing subquery in RLS policy
  
  2. Solution
    - REMOVE admin check from RLS completely
    - Allow ALL authenticated users to read all profiles
    - Admin authorization will be handled at APPLICATION LAYER
    - Keep other policies simple and safe
  
  3. Security
    - Users can read all profiles (needed for admin panel)
    - Users can only insert/update their OWN profile
    - Role changes protected (cannot change own role)
    - Application layer will verify admin role before showing admin pages
*/

-- Drop ALL existing policies
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

-- 1. SELECT: ALL authenticated users can read ALL profiles
--    (Admin check will be done in application layer)
CREATE POLICY "profiles_select_all"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- 2. INSERT: Users can only insert their own profile
CREATE POLICY "profiles_insert_own"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 3. UPDATE: Users can only update their own profile
--    AND cannot change their own role
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

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Add comment explaining the security model
COMMENT ON TABLE profiles IS 'RLS allows all authenticated users to read profiles. Admin authorization is handled at application layer.';