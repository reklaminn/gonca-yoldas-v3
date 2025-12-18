/*
  # Create General Settings Table

  1. New Tables
    - `general_settings`
      - `id` (uuid, primary key, single row)
      - `site_name` (text)
      - `site_url` (text)
      - `site_description` (text)
      - `contact_email` (text)
      - `support_email` (text)
      - `timezone` (text)
      - `language` (text)
      - `maintenance_mode_active` (boolean)
      - `courses_external_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `general_settings` table
    - Add policies for public read and admin update/insert
*/

-- Create general_settings table
CREATE TABLE IF NOT EXISTS general_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT 'Gonca Yoldaş',
  site_url text NOT NULL DEFAULT 'https://goncayoldas.com',
  site_description text NOT NULL DEFAULT '0-10 yaş arası çocuklar için iki dilli İngilizce eğitim platformu',
  contact_email text NOT NULL DEFAULT 'info@goncayoldas.com',
  support_email text NOT NULL DEFAULT 'support@goncayoldas.com',
  timezone text NOT NULL DEFAULT 'Europe/Istanbul',
  language text NOT NULL DEFAULT 'tr',
  maintenance_mode_active boolean NOT NULL DEFAULT false,
  courses_external_url text NOT NULL DEFAULT 'https://goncayoldas.com/courses',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE general_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read general settings
CREATE POLICY "Anyone can read general settings"
  ON general_settings
  FOR SELECT
  USING (true);

-- Policy: Admins can update general settings
CREATE POLICY "Admins can update general settings"
  ON general_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can insert general settings (only once for initial setup)
CREATE POLICY "Admins can insert general settings"
  ON general_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert initial default settings if the table is empty
INSERT INTO general_settings (site_name, site_url, site_description, contact_email, support_email, timezone, language, maintenance_mode_active, courses_external_url)
SELECT
  'Gonca Yoldaş',
  'https://goncayoldas.com',
  '0-10 yaş arası çocuklar için iki dilli İngilizce eğitim platformu',
  'info@goncayoldas.com',
  'support@goncayoldas.com',
  'Europe/Istanbul',
  'tr',
  false,
  'https://goncayoldas.com/courses'
WHERE NOT EXISTS (SELECT 1 FROM general_settings);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_general_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER general_settings_updated_at
  BEFORE UPDATE ON general_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_general_settings_updated_at();
