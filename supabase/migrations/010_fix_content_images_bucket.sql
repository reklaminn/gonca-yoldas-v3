/*
  # Fix Content Images Bucket
  
  1. Storage
    - Create 'content-images' bucket if not exists
    - Set public access
    - Set file size limit to 5MB
    - Set allowed mime types
  
  2. Security
    - Drop existing policies to avoid conflicts
    - Re-create policies for public read and authenticated write
*/

-- Create storage bucket for content images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'content-images',
  'content-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

-- Drop existing policies to ensure clean state
DROP POLICY IF EXISTS "Public can view content images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload content images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update content images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete content images" ON storage.objects;

-- Allow public read access (Anyone can view images)
CREATE POLICY "Public can view content images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'content-images');

-- Allow authenticated users to upload (Admin/User)
CREATE POLICY "Authenticated users can upload content images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'content-images');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update content images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'content-images');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete content images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'content-images');
