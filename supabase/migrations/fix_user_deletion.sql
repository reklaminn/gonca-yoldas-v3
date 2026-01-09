/*
  # Fix User Deletion - Remove Auto-Recreation Trigger
  
  1. Check and remove trigger that auto-creates profiles
  2. Add proper cascade delete from auth.users to profiles
  3. Create admin function to delete users completely
*/

-- 1. Drop the trigger that auto-creates profiles (if exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Ensure profiles table has proper foreign key with cascade
ALTER TABLE profiles 
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- 3. Create admin function to delete user completely (requires service role)
CREATE OR REPLACE FUNCTION delete_user_completely(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: Admin access required'
    );
  END IF;

  -- Delete from profiles first (will cascade to related tables)
  DELETE FROM profiles WHERE id = user_id;
  
  -- Delete from auth.users (this requires SECURITY DEFINER)
  DELETE FROM auth.users WHERE id = user_id;
  
  -- Log the deletion
  INSERT INTO audit_logs (user_id, action, resource, metadata)
  VALUES (
    auth.uid(),
    'user_deleted',
    'admin',
    jsonb_build_object('deleted_user_id', user_id, 'timestamp', now())
  );
  
  result := jsonb_build_object(
    'success', true,
    'message', 'User deleted successfully'
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permission to authenticated users (function checks admin role internally)
GRANT EXECUTE ON FUNCTION delete_user_completely(uuid) TO authenticated;

COMMENT ON FUNCTION delete_user_completely(uuid) IS 
'Completely deletes a user from both profiles and auth.users tables. 
Only admins can execute this function.';
