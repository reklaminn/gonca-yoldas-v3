/*
  # Create Parent Testimonials Table
  
  1. New Table
    - `parent_testimonials` - Stores parent testimonials for homepage
      - `id` (uuid, primary key)
      - `parent_name` (text) - Parent's name
      - `student_info` (text) - Student age/info (e.g., "5 yaşında kızım")
      - `testimonial_text` (text) - The testimonial content
      - `rating` (integer) - Star rating (1-5)
      - `image_url` (text, nullable) - Optional parent/student photo
      - `program_slug` (text, nullable) - Related program if any
      - `is_featured` (boolean) - Highlight this testimonial
      - `is_active` (boolean) - Show/hide testimonial
      - `display_order` (integer) - Sort order
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS
    - Public read access for active testimonials
    - Admin-only write access
*/

-- Create parent_testimonials table
CREATE TABLE IF NOT EXISTS parent_testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_name text NOT NULL,
  student_info text NOT NULL,
  testimonial_text text NOT NULL,
  rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  image_url text,
  program_slug text,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE parent_testimonials ENABLE ROW LEVEL SECURITY;

-- Public read policy for active testimonials
CREATE POLICY "Public can read active testimonials"
  ON parent_testimonials
  FOR SELECT
  TO public
  USING (is_active = true);

-- Admin full access policy
CREATE POLICY "Admins have full access to testimonials"
  ON parent_testimonials
  FOR ALL
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

-- Create index for ordering
CREATE INDEX idx_testimonials_display_order ON parent_testimonials(display_order, created_at DESC);

-- Create index for active testimonials
CREATE INDEX idx_testimonials_active ON parent_testimonials(is_active, display_order);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_parent_testimonials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER parent_testimonials_updated_at
  BEFORE UPDATE ON parent_testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_parent_testimonials_updated_at();
