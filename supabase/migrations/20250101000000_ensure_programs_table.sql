/*
  # Ensure Programs Table Exists
  1. New Tables: programs (if not exists)
  2. Columns: Ensure all required columns including sendpulse_id exist
  3. Security: Enable RLS and add policies
*/

CREATE TABLE IF NOT EXISTS programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  title_en text,
  short_title text,
  age text,
  age_group text,
  age_range text,
  description text,
  image_url text,
  price numeric DEFAULT 0,
  duration text,
  schedule text,
  lessons_per_week integer DEFAULT 0,
  lesson_duration text,
  max_students integer,
  enrolled_students integer DEFAULT 0,
  features text[],
  outcomes text[],
  status text DEFAULT 'draft',
  iyzilink text,
  metadata jsonb DEFAULT '{}'::jsonb,
  sendpulse_id text,
  sendpulse_upsell_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- Policies (Drop existing to avoid conflicts if re-running)
DROP POLICY IF EXISTS "Public read access" ON programs;
DROP POLICY IF EXISTS "Admin full access" ON programs;

-- Create Policies
CREATE POLICY "Public read access" ON programs FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON programs FOR ALL USING (auth.role() = 'authenticated');
