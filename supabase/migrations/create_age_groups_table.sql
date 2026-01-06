/*
  # Create age_groups table and policies
  1. New Tables: age_groups (id, label, value, sort_order, created_at)
  2. Security: Enable RLS
  3. Policies: 
     - Public read access
     - Authenticated insert/update/delete access
*/

CREATE TABLE IF NOT EXISTS age_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  value text NOT NULL,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE age_groups ENABLE ROW LEVEL SECURITY;

-- Policy for reading (Public)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'age_groups' AND policyname = 'Public read access'
    ) THEN
        CREATE POLICY "Public read access" ON age_groups FOR SELECT USING (true);
    END IF;
END
$$;

-- Policy for inserting (Authenticated users)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'age_groups' AND policyname = 'Authenticated insert access'
    ) THEN
        CREATE POLICY "Authenticated insert access" ON age_groups FOR INSERT TO authenticated WITH CHECK (true);
    END IF;
END
$$;

-- Policy for updating (Authenticated users)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'age_groups' AND policyname = 'Authenticated update access'
    ) THEN
        CREATE POLICY "Authenticated update access" ON age_groups FOR UPDATE TO authenticated USING (true);
    END IF;
END
$$;

-- Policy for deleting (Authenticated users)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'age_groups' AND policyname = 'Authenticated delete access'
    ) THEN
        CREATE POLICY "Authenticated delete access" ON age_groups FOR DELETE TO authenticated USING (true);
    END IF;
END
$$;