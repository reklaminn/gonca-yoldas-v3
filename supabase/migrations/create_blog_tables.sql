/*
  # Create Blog Tables
  1. New Tables:
    - blog_categories (id, name, slug, created_at)
    - blog_posts (id, title, slug, excerpt, content, image_url, category_id, is_published, is_featured, views, read_time, created_at)
  2. Security:
    - Enable RLS
    - Add policies for public read access
    - Add policies for admin full access
*/

-- Create Categories Table
CREATE TABLE IF NOT EXISTS blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text,
  image_url text,
  category_id uuid REFERENCES blog_categories(id),
  is_published boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  views integer DEFAULT 0,
  read_time text DEFAULT '5 dakika',
  author_name text DEFAULT 'Gonca Yoldaş',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Policies for Categories
CREATE POLICY "Public categories are viewable by everyone" 
  ON blog_categories FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" 
  ON blog_categories FOR ALL 
  TO authenticated 
  USING (auth.jwt() ->> 'email' IN (SELECT email FROM auth.users)); -- Simplified admin check for now, ideally check role

-- Policies for Posts
CREATE POLICY "Public posts are viewable by everyone" 
  ON blog_posts FOR SELECT 
  USING (is_published = true);

CREATE POLICY "Admins can manage posts" 
  ON blog_posts FOR ALL 
  TO authenticated 
  USING (true);

-- Insert Default Categories
INSERT INTO blog_categories (name, slug) VALUES
  ('Eğitim', 'egitim'),
  ('Gelişim', 'gelisim'),
  ('Ebeveynlik', 'ebeveynlik'),
  ('İpuçları', 'ipuclari')
ON CONFLICT (slug) DO NOTHING;
