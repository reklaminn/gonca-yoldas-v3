/*
  # Fix Page Content RLS Policies
  
  1. Changes
    - Drop existing policies
    - Create new comprehensive policies for authenticated users
    - Ensure all CRUD operations work correctly
  
  2. Security
    - Public can only read active content
    - Authenticated users have full CRUD access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view active page content" ON page_content;
DROP POLICY IF EXISTS "Authenticated users can insert page content" ON page_content;
DROP POLICY IF EXISTS "Authenticated users can update page content" ON page_content;
DROP POLICY IF EXISTS "Authenticated users can delete page content" ON page_content;

-- Create new policies with proper permissions

-- Public can read active content
CREATE POLICY "Public read active content"
  ON page_content
  FOR SELECT
  TO public
  USING (is_active = true);

-- Authenticated users can read all content
CREATE POLICY "Authenticated read all content"
  ON page_content
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert content
CREATE POLICY "Authenticated insert content"
  ON page_content
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update content
CREATE POLICY "Authenticated update content"
  ON page_content
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users can delete content
CREATE POLICY "Authenticated delete content"
  ON page_content
  FOR DELETE
  TO authenticated
  USING (true);
