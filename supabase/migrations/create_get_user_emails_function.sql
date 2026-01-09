/*
  # Create function to get user emails from auth.users
  
  1. New Functions
    - `get_user_emails(user_ids uuid[])`: Returns user IDs and emails from auth.users
  
  2. Security
    - Function is SECURITY DEFINER to access auth.users
    - Only accessible by authenticated users
*/

-- Create function to get user emails
CREATE OR REPLACE FUNCTION get_user_emails(user_ids uuid[])
RETURNS TABLE (id uuid, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT au.id, au.email::text
  FROM auth.users au
  WHERE au.id = ANY(user_ids);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_emails(uuid[]) TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_user_emails IS 'Returns user emails from auth.users table for given user IDs';
