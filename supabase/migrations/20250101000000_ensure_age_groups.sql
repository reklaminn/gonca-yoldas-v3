/*
  # Ensure Age Groups Table Exists
  
  1. Checks if table exists, creates if not
  2. Enables RLS
  3. Adds policies for public read and authenticated write
*/

CREATE TABLE IF NOT EXISTS age_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  value text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE age_groups ENABLE ROW LEVEL SECURITY;

-- Allow public read access (needed for visitors to see filters)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'age_groups' AND policyname = 'Public read access'
  ) THEN
    CREATE POLICY "Public read access" ON age_groups FOR SELECT USING (true);
  END IF;
END $$;

-- Allow authenticated users (admins) to insert/update/delete
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'age_groups' AND policyname = 'Authenticated users can manage'
  ) THEN
    CREATE POLICY "Authenticated users can manage" ON age_groups FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;
