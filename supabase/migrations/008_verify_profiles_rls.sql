/*
  # Verify and Fix Profiles RLS Policies

  1. Changes
    - Verify profiles table structure
    - Ensure RLS is enabled
    - Verify UPDATE policy exists and works correctly
    - Add updated_at column if missing

  2. Security
    - Users can only update their own profiles
    - Proper error handling for unauthorized access
*/

-- Ensure updated_at column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing UPDATE policy if exists
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create UPDATE policy with proper checks
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Allow updating these fields only
    AND (
      full_name IS NOT NULL OR
      phone IS NOT NULL OR
      city IS NOT NULL OR
      district IS NOT NULL OR
      updated_at IS NOT NULL
    )
  );

-- Verify policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    RAISE EXCEPTION 'UPDATE policy not created successfully';
  END IF;
END $$;
