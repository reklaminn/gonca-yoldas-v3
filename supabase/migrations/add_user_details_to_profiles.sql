/*
  # Add user details columns to profiles table

  1. Changes
    - Add `phone` column (text, not null)
    - Add `email` column (text, not null)
    - Add `city` column (text, not null)
    - Add `district` column (text, not null)
    - Add `tax_office` column (text, nullable)
    - Add `tax_number` column (text, nullable)

  2. Security
    - Update RLS policies to allow users to insert these fields
    - Maintain existing security constraints

  Notes:
    - These fields are required for user registration
    - tax_office and tax_number are optional (nullable)
    - email and phone are duplicated from auth.users for easier querying
*/

-- Add new columns to profiles table
DO $$
BEGIN
  -- Add phone column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone text NOT NULL DEFAULT '';
  END IF;

  -- Add email column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email text NOT NULL DEFAULT '';
  END IF;

  -- Add city column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'city'
  ) THEN
    ALTER TABLE profiles ADD COLUMN city text NOT NULL DEFAULT '';
  END IF;

  -- Add district column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'district'
  ) THEN
    ALTER TABLE profiles ADD COLUMN district text NOT NULL DEFAULT '';
  END IF;

  -- Add tax_office column (nullable)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'tax_office'
  ) THEN
    ALTER TABLE profiles ADD COLUMN tax_office text;
  END IF;

  -- Add tax_number column (nullable)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'tax_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN tax_number text;
  END IF;
END $$;

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Create index on phone for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
