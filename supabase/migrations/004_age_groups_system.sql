/*
  # Dynamic Age Groups System

  1. New Tables
    - `age_groups` table to store dynamic filter options
  
  2. Changes
    - Remove hardcoded CHECK constraint from programs table
    - Seed initial data
  
  3. Security
    - Enable RLS
    - Public read access
    - Admin write access
*/

-- 1. Create age_groups table
CREATE TABLE IF NOT EXISTS age_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL, -- e.g. "0-2 Yaş"
  value text NOT NULL UNIQUE, -- e.g. "0-2"
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE age_groups ENABLE ROW LEVEL SECURITY;

-- 3. Policies
CREATE POLICY "Public can read age groups"
  ON age_groups FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage age groups"
  ON age_groups FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 4. Seed Data (Migrate existing hardcoded values)
INSERT INTO age_groups (label, value, sort_order) VALUES
  ('0-2 Yaş', '0-2', 1),
  ('2-5 Yaş', '2-5', 2),
  ('5-10 Yaş', '5-10', 3)
ON CONFLICT (value) DO NOTHING;

-- 5. Remove Constraint from programs table
-- We need to drop the constraint that forces age_group to be one of the 3 hardcoded values
ALTER TABLE programs DROP CONSTRAINT IF EXISTS programs_age_group_check;
