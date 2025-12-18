/*
  # Create Content Images Bucket
  
  1. Storage
    - Create 'content-images' bucket for CMS media
    - Set public access
    - Allow authenticated users to upload/manage
*/

-- Create storage bucket for content images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'content-images',
  'content-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public can view content images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'content-images');

-- Allow authenticated users to upload
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
