/*
  # Fix Blog Categories RLS
  1. Changes:
    - Drop existing restrictive policies for blog_categories
    - Add new policy allowing ALL operations (INSERT, UPDATE, DELETE) for authenticated users
    - Ensure public read access remains
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage categories" ON blog_categories;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON blog_categories;

-- Create comprehensive policy for authenticated users
CREATE POLICY "Authenticated users can manage categories"
  ON blog_categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure public read access is still there (if not already)
DROP POLICY IF EXISTS "Public categories are viewable by everyone" ON blog_categories;
CREATE POLICY "Public categories are viewable by everyone" 
  ON blog_categories FOR SELECT USING (true);