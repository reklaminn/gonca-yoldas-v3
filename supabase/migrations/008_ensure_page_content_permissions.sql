/*
  # Fix Page Content Permissions
  
  1. Security
    - Ensure authenticated users (admins) can UPDATE page_content
    - Drop existing restrictive policies if any
*/

-- Enable RLS
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

-- Drop potential conflicting policies
DROP POLICY IF EXISTS "Authenticated users can update page content" ON page_content;
DROP POLICY IF EXISTS "Authenticated update content" ON page_content;

-- Create permissive update policy for authenticated users
CREATE POLICY "Authenticated update content"
  ON page_content
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure select policy exists
DROP POLICY IF EXISTS "Authenticated read all content" ON page_content;
CREATE POLICY "Authenticated read all content"
  ON page_content
  FOR SELECT
  TO authenticated
  USING (true);
