/*
  # Create Storage Bucket for Blog Images
  1. New Bucket: 'content-images'
  2. Security: Enable public access and allow uploads for anon users (for this dev environment)
*/

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-images', 'content-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow Public Read Access (Everyone can see images)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'content-images' );

-- Policy: Allow Uploads (For Admin/Anon in this dev setup)
CREATE POLICY "Allow Uploads"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'content-images' );

-- Policy: Allow Deletes
CREATE POLICY "Allow Deletes"
ON storage.objects FOR DELETE
USING ( bucket_id = 'content-images' );
