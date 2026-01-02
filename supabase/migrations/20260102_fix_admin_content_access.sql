/*
  # Fix Admin Access to Public Content & Profile Security
  
  PROBLEM:
  Authenticated users with 'admin' role cannot see public content on the homepage
  because existing policies might be restricted to 'anon' only or conflicting.
  
  SOLUTION:
  1. Consolidate policies for core public tables (`programs`, `page_content`, `parent_testimonials`, `age_groups`).
  2. Ensure 'public' role (covers both anon and authenticated) has READ access to ACTIVE content.
  3. Ensure 'admin' role has FULL access (read/write) to EVERYTHING.
  4. Fix `profiles` table to allow authenticated users to read their own profile (crucial for admin check).
*/

-- ====================================================================
-- 1. PROFILES TABLE (Crucial for Admin Checks)
-- ====================================================================
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;

-- Drop potential conflicting policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- New Consolidated Policies:

-- A) Users can read their own profile
CREATE POLICY "Users can read own profile" 
ON profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- B) Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- C) Admins can do EVERYTHING on profiles
CREATE POLICY "Admins full access to profiles" 
ON profiles FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ====================================================================
-- 2. PROGRAMS TABLE
-- ====================================================================
ALTER TABLE IF EXISTS programs ENABLE ROW LEVEL SECURITY;

-- Clean up old policies
DROP POLICY IF EXISTS "Public read access" ON programs;
DROP POLICY IF EXISTS "Anon read access" ON programs;
DROP POLICY IF EXISTS "Everyone can read programs" ON programs;
DROP POLICY IF EXISTS "Public can read active programs" ON programs;
DROP POLICY IF EXISTS "Admins can manage programs" ON programs;

-- A) Public (Anon + Auth) can read ACTIVE programs
CREATE POLICY "Public read active programs" 
ON programs FOR SELECT 
TO public 
USING (status = 'active');

-- B) Admins have FULL access (Read ALL, Write ALL)
CREATE POLICY "Admins full access programs" 
ON programs FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ====================================================================
-- 3. PAGE_CONTENT TABLE
-- ====================================================================
ALTER TABLE IF EXISTS page_content ENABLE ROW LEVEL SECURITY;

-- Clean up
DROP POLICY IF EXISTS "Public read access" ON page_content;
DROP POLICY IF EXISTS "Everyone can read page content" ON page_content;
DROP POLICY IF EXISTS "Public read active content" ON page_content;
DROP POLICY IF EXISTS "Authenticated read all content" ON page_content;
DROP POLICY IF EXISTS "Authenticated insert content" ON page_content;
DROP POLICY IF EXISTS "Authenticated update content" ON page_content;
DROP POLICY IF EXISTS "Authenticated delete content" ON page_content;

-- A) Public (Anon + Auth) can read ACTIVE content
CREATE POLICY "Public read active page content" 
ON page_content FOR SELECT 
TO public 
USING (is_active = true);

-- B) Admins have FULL access
CREATE POLICY "Admins full access page content" 
ON page_content FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ====================================================================
-- 4. PARENT_TESTIMONIALS TABLE
-- ====================================================================
ALTER TABLE IF EXISTS parent_testimonials ENABLE ROW LEVEL SECURITY;

-- Clean up
DROP POLICY IF EXISTS "Public read access" ON parent_testimonials;
DROP POLICY IF EXISTS "Everyone can read parent testimonials" ON parent_testimonials;
DROP POLICY IF EXISTS "Public can read active testimonials" ON parent_testimonials;

-- A) Public (Anon + Auth) can read ACTIVE testimonials
CREATE POLICY "Public read active testimonials" 
ON parent_testimonials FOR SELECT 
TO public 
USING (is_active = true);

-- B) Admins have FULL access
CREATE POLICY "Admins full access testimonials" 
ON parent_testimonials FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ====================================================================
-- 5. AGE_GROUPS TABLE
-- ====================================================================
ALTER TABLE IF EXISTS age_groups ENABLE ROW LEVEL SECURITY;

-- Clean up
DROP POLICY IF EXISTS "Public read access" ON age_groups;
DROP POLICY IF EXISTS "Everyone can read age groups" ON age_groups;

-- A) Everyone can read age groups (Ref Data)
CREATE POLICY "Everyone read age groups" 
ON age_groups FOR SELECT 
TO public 
USING (true);

-- B) Admins full access
CREATE POLICY "Admins full access age groups" 
ON age_groups FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
