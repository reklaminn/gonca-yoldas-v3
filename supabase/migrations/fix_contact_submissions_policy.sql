/*
  # Fix Contact Submissions Policies
  1. Security: Add DELETE policy for authenticated users
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'contact_submissions' 
    AND policyname = 'Enable delete for authenticated users'
  ) THEN
    CREATE POLICY "Enable delete for authenticated users" 
    ON contact_submissions 
    FOR DELETE 
    TO authenticated 
    USING (true);
  END IF;
END $$;