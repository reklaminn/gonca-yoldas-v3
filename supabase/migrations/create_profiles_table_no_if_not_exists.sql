/*
      # Create profiles table with RLS and policies

      1. New Tables
        - `profiles`
          - `id` (uuid, primary key, references auth.users)
          - `full_name` (text, nullable)
          - `avatar_url` (text, nullable)
          - `updated_at` (timestamptz, default now())
          - `password_changed_at` (timestamptz, default now())

      2. Security
        - Enable Row Level Security (RLS) on `profiles`.
        - Add policies to allow authenticated users to SELECT, UPDATE, INSERT their own profile only.

      Notes:
        - `id` references the authenticated user's id.
        - Policies ensure users can only access their own profile.
    */

    CREATE TABLE IF NOT EXISTS profiles (
      id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
      full_name text,
      avatar_url text,
      updated_at timestamptz DEFAULT now(),
      password_changed_at timestamptz DEFAULT now()
    );

    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

    DROP POLICY "Allow users to select own profile" ON profiles;
    CREATE POLICY "Allow users to select own profile"
      ON profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);

    DROP POLICY "Allow users to update own profile" ON profiles;
    CREATE POLICY "Allow users to update own profile"
      ON profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id);

    DROP POLICY "Allow users to insert own profile" ON profiles;
    CREATE POLICY "Allow users to insert own profile"
      ON profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
