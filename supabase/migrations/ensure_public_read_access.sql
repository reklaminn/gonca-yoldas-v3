/*
  # Ensure Public Read Access for Blog
  1. Changes:
    - Explicitly enable public read access for profiles (needed for author info)
    - Re-affirm public read access for blog_posts and blog_categories
*/

-- Profiles: Allow public read access to basic info
-- (Assuming 'profiles' table exists, if not this might fail but it's usually standard)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
    CREATE POLICY "Public profiles are viewable by everyone"
      ON profiles FOR SELECT
      USING (true);
  END IF;
END $$;

-- Blog Posts: Ensure public read
DROP POLICY IF EXISTS "Enable read access for all users" ON blog_posts;
CREATE POLICY "Enable read access for all users"
  ON blog_posts FOR SELECT
  USING (true);

-- Blog Categories: Ensure public read
DROP POLICY IF EXISTS "Enable read access for all users" ON blog_categories;
CREATE POLICY "Enable read access for all users"
  ON blog_categories FOR SELECT
  USING (true);
