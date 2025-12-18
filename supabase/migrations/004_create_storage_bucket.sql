/*
  # Create Storage Bucket for Program Images

  1. Storage
    - Create 'program-images' bucket
    - Set public access for reading
    - Allow authenticated users to upload
  
  2. Security
    - Public read access
    - Authenticated upload access
    - File size limit: 5MB
    - Allowed types: image/*
*/

-- Create storage bucket for program images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'program-images',
  'program-images',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public can view program images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'program-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload program images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'program-images' AND
    (storage.foldername(name))[1] = 'public'
  );

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update program images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'program-images')
  WITH CHECK (bucket_id = 'program-images');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete program images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'program-images');
