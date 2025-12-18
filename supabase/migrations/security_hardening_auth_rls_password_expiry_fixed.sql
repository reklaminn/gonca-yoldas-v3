/*
      # Fix Duplicate Policy Creation Error

      This migration:
      - Adds `password_changed_at` column if missing.
      - Enables RLS on profiles.
      - Conditionally creates policies only if they do not exist to avoid duplicate errors.
      - Enforces password expiry in SELECT and UPDATE policies.
    */

    -- Add password_changed_at column if not exists
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'password_changed_at'
      ) THEN
        ALTER TABLE profiles ADD COLUMN password_changed_at timestamptz DEFAULT now();
      END IF;
    END $$;

    -- Enable RLS on profiles table
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

    -- Conditionally create SELECT policy
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'profiles' AND policyname = 'Allow users to select own profile if password valid'
      ) THEN
        EXECUTE '
          CREATE POLICY "Allow users to select own profile if password valid"
          ON profiles
          FOR SELECT
          TO authenticated
          USING (
            auth.uid() = id
            AND password_changed_at > now() - interval ''90 days''
          )
        ';
      END IF;
    END $$;

    -- Conditionally create UPDATE policy
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'profiles' AND policyname = 'Allow users to update own profile if password valid'
      ) THEN
        EXECUTE '
          CREATE POLICY "Allow users to update own profile if password valid"
          ON profiles
          FOR UPDATE
          TO authenticated
          USING (
            auth.uid() = id
            AND password_changed_at > now() - interval ''90 days''
          )
        ';
      END IF;
    END $$;

    -- Conditionally create INSERT policy
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'profiles' AND policyname = 'Allow users to insert own profile'
      ) THEN
        EXECUTE '
          CREATE POLICY "Allow users to insert own profile"
          ON profiles
          FOR INSERT
          TO authenticated
          WITH CHECK (auth.uid() = id)
        ';
      END IF;
    END $$;
