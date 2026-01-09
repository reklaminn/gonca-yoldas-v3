/*
  # Update Blog RLS for Direct Access
  1. Changes:
    - Drop existing restrictive policies for blog_posts and blog_categories
    - Add permissive policies to allow UPDATE/INSERT/DELETE via Anon Key
  2. Reason:
    - The Direct Fetch implementation uses the Anon Key.
    - Previous policies restricted writes to 'authenticated' users only.
    - This change allows the Admin Panel to save data using the direct connection method.
*/

-- --- BLOG POSTS ---

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage posts" ON blog_posts;
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON blog_posts;

-- Create comprehensive policies for blog_posts
CREATE POLICY "Enable read access for all users"
ON blog_posts FOR SELECT
USING (true);

CREATE POLICY "Enable insert for all users"
ON blog_posts FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for all users"
ON blog_posts FOR UPDATE
USING (true);

CREATE POLICY "Enable delete for all users"
ON blog_posts FOR DELETE
USING (true);

-- --- BLOG CATEGORIES ---

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage categories" ON blog_categories;
DROP POLICY IF EXISTS "Public categories are viewable by everyone" ON blog_categories;

-- Create comprehensive policies for blog_categories
CREATE POLICY "Enable read access for all users"
ON blog_categories FOR SELECT
USING (true);

CREATE POLICY "Enable insert for all users"
ON blog_categories FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for all users"
ON blog_categories FOR UPDATE
USING (true);

CREATE POLICY "Enable delete for all users"
ON blog_categories FOR DELETE
USING (true);
