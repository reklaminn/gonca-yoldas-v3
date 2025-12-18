/*
  # Create profiles table with RLS and policies

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text, nullable)
      - `avatar_url` (text, nullable)
      - `email_verified` (boolean, default false)
      - `role` (text, default 'student', check constraint)
      - `updated_at` (timestamptz, default now())
      - `password_changed_at` (timestamptz, default now())
      - `failed_login_attempts` (integer, default 0)
      - `account_locked_until` (timestamptz, nullable)
      - `last_login_at` (timestamptz, nullable)
      - `last_login_ip` (inet, nullable)

  2. Security
    - Enable Row Level Security (RLS) on `profiles`.
    - Add policies to allow authenticated users to SELECT, UPDATE, INSERT their own profile only.
    - Add policies for admin access to all profiles.

  Notes:
    - `id` references the authenticated user's id.
    - Policies ensure users can only access their own profile.
    - Admins can manage all profiles.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  email_verified boolean DEFAULT false,
  role text DEFAULT 'student' CHECK (role IN ('student', 'parent', 'admin')),
  updated_at timestamptz DEFAULT now(),
  password_changed_at timestamptz DEFAULT now(),
  failed_login_attempts integer DEFAULT 0,
  account_locked_until timestamptz,
  last_login_at timestamptz,
  last_login_ip inet
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM profiles WHERE id = auth.uid()) -- Cannot change own role
  );

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
