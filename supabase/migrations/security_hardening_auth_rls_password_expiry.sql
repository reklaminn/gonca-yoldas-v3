/*
      # Security Hardening: Authentication, RLS, Password Expiry, and API Key Protection

      1. Changes to profiles table:
        - Add `password_changed_at` column to track password age.
        - Enable Row Level Security (RLS).
        - Add policies to allow authenticated users to SELECT, INSERT, UPDATE their own profiles only.
        - Add policy to restrict access if password expired (enforced by client or edge function).

      2. Security:
        - Enforce email/password authentication only (Supabase default).
        - No magic links or social providers enabled.
        - Protect API keys by using environment variables only.
        - Password expiry enforced by checking `password_changed_at` timestamp.

      3. Notes:
        - Password expiry duration is 90 days (example).
        - OTP expiry to be handled by client or edge functions (not included here).
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

    -- Policy: Allow authenticated users to SELECT their own profile only if password not expired
    CREATE POLICY "Allow users to select own profile if password valid"
      ON profiles
      FOR SELECT
      TO authenticated
      USING (
        auth.uid() = id
        AND password_changed_at > now() - interval '90 days'
      );

    -- Policy: Allow authenticated users to UPDATE their own profile only if password not expired
    CREATE POLICY "Allow users to update own profile if password valid"
      ON profiles
      FOR UPDATE
      TO authenticated
      USING (
        auth.uid() = id
        AND password_changed_at > now() - interval '90 days'
      );

    -- Policy: Allow authenticated users to INSERT their own profile
    CREATE POLICY "Allow users to insert own profile"
      ON profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);

    -- Optional: Deny access if password expired (enforced by above policies)
