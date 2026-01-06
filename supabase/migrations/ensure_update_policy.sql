/*
  # Ensure Update Policy for Contact Submissions
  1. Security: Add UPDATE policy for authenticated users (if not exists)
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'contact_submissions' 
    AND policyname = 'Enable update for authenticated users'
  ) THEN
    CREATE POLICY "Enable update for authenticated users" 
    ON contact_submissions 
    FOR UPDATE
    TO authenticated 
    USING (true)
    WITH CHECK (true);
  END IF;
END $$;