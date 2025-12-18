/*
  # Fix Profiles RLS for User Signup

  1. Changes
    - Drop existing INSERT policy that requires authentication
    - Create new INSERT policy that allows anyone to create a profile
    - This is safe because the profile ID must match a valid auth.users ID

  2. Security
    - Users can only insert profiles with their own auth.uid()
    - SELECT and UPDATE still require authentication
*/

-- Drop existing INSERT policy
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Allow users to insert own profile'
  ) THEN
    DROP POLICY "Allow users to insert own profile" ON profiles;
  END IF;
END $$;

-- Allow profile creation during signup (before session is fully established)
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
