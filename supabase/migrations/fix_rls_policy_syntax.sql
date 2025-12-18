/*
      # Fix Supabase Policy Creation Syntax

      1. Removed unsupported IF NOT EXISTS from CREATE POLICY statements.
      2. Added DROP POLICY IF EXISTS before each CREATE POLICY to avoid conflicts.
      3. Ensured safe re-creation of policies without syntax errors.

      Tables affected:
        - profiles

      Notes:
        - This migration replaces policies safely.
        - RLS remains enabled on profiles.
    */

    -- Enable RLS on profiles table
    ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;

    -- Drop and recreate policy: Allow users to select own profile
    DROP POLICY IF EXISTS "Allow users to select own profile" ON profiles;
    CREATE POLICY "Allow users to select own profile"
      ON profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);

    -- Drop and recreate policy: Allow users to update own profile
    DROP POLICY IF EXISTS "Allow users to update own profile" ON profiles;
    CREATE POLICY "Allow users to update own profile"
      ON profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id);

    -- Add password_changed_at column to profiles for password expiry tracking
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'password_changed_at'
      ) THEN
        ALTER TABLE profiles ADD COLUMN password_changed_at timestamptz DEFAULT now();
      END IF;
    END $$;

    -- Drop and recreate policy: Allow users to insert own profile
    DROP POLICY IF EXISTS "Allow users to insert own profile" ON profiles;
    CREATE POLICY "Allow users to insert own profile"
      ON profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);

    -- Example policy to restrict access if password expired (pseudo logic)
    -- This requires client or edge function enforcement; here is a sample policy snippet:
    -- DROP POLICY IF EXISTS "Restrict access if password expired" ON profiles;
    -- CREATE POLICY "Restrict access if password expired"
    --   ON profiles
    --   FOR ALL
    --   TO authenticated
    --   USING (password_changed_at > now() - interval '90 days');
