/*
  # Add created_at column to profiles table

  1. Changes
    - Add `created_at` column with default value
    - Backfill existing records with current timestamp
    - Add index for performance

  2. Security
    - No RLS changes needed
    - Column is read-only for users
*/

-- Add created_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'created_at'
  ) THEN
    -- Add column with default value
    ALTER TABLE profiles 
    ADD COLUMN created_at timestamptz DEFAULT now();
    
    -- Backfill existing records
    UPDATE profiles 
    SET created_at = updated_at 
    WHERE created_at IS NULL;
    
    -- Make it NOT NULL after backfill
    ALTER TABLE profiles 
    ALTER COLUMN created_at SET NOT NULL;
    
    -- Add index for performance
    CREATE INDEX IF NOT EXISTS idx_profiles_created_at 
    ON profiles(created_at DESC);
    
    RAISE NOTICE 'created_at column added successfully';
  ELSE
    RAISE NOTICE 'created_at column already exists';
  END IF;
END $$;
