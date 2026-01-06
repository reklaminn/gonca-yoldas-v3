/*
  # Fix: Add SELECT Policy for Contact Submissions
  
  CRITICAL FIX for "new row violates row-level security policy" error.
  
  Reason:
  The client sends "Prefer: return=representation" header.
  This forces Supabase to perform a SELECT after the INSERT to return the data.
  Even if INSERT is allowed, if SELECT is not allowed by policy, the entire operation fails.
  
  This migration adds a SELECT policy for anon/authenticated users.
*/

-- 1. Ensure permissions are granted (Privileges)
GRANT SELECT, INSERT ON contact_submissions TO anon, authenticated;

-- 2. Add the missing SELECT policy (Row Level Security)
-- This allows the API to read back the row it just inserted
CREATE POLICY "Enable select for all users" 
ON contact_submissions 
FOR SELECT 
TO anon, authenticated 
USING (true);
