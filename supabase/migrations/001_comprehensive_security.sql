/*
  # Comprehensive Security Hardening

  1. Tables & Security
    - Create audit_logs table for tracking security events
    - Create user_sessions table for session management
    - Create password_history table for password reuse prevention
    - Create otp_codes table for one-time passwords
    - Enable RLS on all tables
  
  2. Authentication Security
    - Implement failed login tracking
    - Add account lockout mechanism
    - Track password history
    - OTP expiry system
  
  3. RLS Policies
    - Strict user isolation for profiles
    - Admin-only access for sensitive tables
    - Public read for published content
    - Audit trail protection
  
  4. Security Functions
    - Password validation
    - Session cleanup
    - OTP generation and verification
    - Account lockout management
*/

-- =====================================================
-- 1. AUDIT LOGGING SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource text NOT NULL,
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Admins can read audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- System can insert audit logs (service role)
CREATE POLICY "System can insert audit logs"
  ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =====================================================
-- 2. SESSION MANAGEMENT
-- =====================================================

CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token_hash text NOT NULL,
  ip_address inet,
  user_agent text,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_activity timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
CREATE POLICY "Users can view own sessions"
  ON user_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own sessions (logout)
CREATE POLICY "Users can delete own sessions"
  ON user_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- System can manage all sessions
CREATE POLICY "System can manage sessions"
  ON user_sessions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- 3. PROFILES TABLE SECURITY ENHANCEMENTS
-- =====================================================

-- Add security columns to profiles
DO $$
BEGIN
  -- Failed login tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'failed_login_attempts'
  ) THEN
    ALTER TABLE profiles ADD COLUMN failed_login_attempts integer DEFAULT 0;
  END IF;

  -- Account lockout
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'account_locked_until'
  ) THEN
    ALTER TABLE profiles ADD COLUMN account_locked_until timestamptz;
  END IF;

  -- Last login tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_login_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_login_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_login_ip'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_login_ip inet;
  END IF;

  -- Password change tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'password_changed_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN password_changed_at timestamptz DEFAULT now();
  END IF;

  -- Role management
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text DEFAULT 'student' CHECK (role IN ('student', 'parent', 'admin'));
  END IF;

  -- Email verification
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email_verified boolean DEFAULT false;
  END IF;
END $$;

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM profiles WHERE id = auth.uid()) -- Cannot change own role
  );

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- 4. PASSWORD HISTORY
-- =====================================================

CREATE TABLE IF NOT EXISTS password_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_password_history_user_id ON password_history(user_id);
CREATE INDEX IF NOT EXISTS idx_password_history_created_at ON password_history(created_at);

ALTER TABLE password_history ENABLE ROW LEVEL SECURITY;

-- Only system can access password history
CREATE POLICY "System only access to password history"
  ON password_history
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- =====================================================
-- 5. OTP SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  code text NOT NULL,
  purpose text NOT NULL CHECK (purpose IN ('login', 'password_reset', 'email_verification', '2fa')),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_codes_user_id ON otp_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_codes_code ON otp_codes(code);

ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Users cannot directly access OTP codes
CREATE POLICY "No direct OTP access"
  ON otp_codes
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- =====================================================
-- 6. SECURITY FUNCTIONS
-- =====================================================

-- Validate password strength
CREATE OR REPLACE FUNCTION validate_password_strength(password text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  errors text[] := '{}';
BEGIN
  -- Minimum 8 characters
  IF length(password) < 8 THEN
    errors := array_append(errors, 'Password must be at least 8 characters');
  END IF;
  
  -- Must contain uppercase
  IF password !~ '[A-Z]' THEN
    errors := array_append(errors, 'Password must contain at least one uppercase letter');
  END IF;
  
  -- Must contain lowercase
  IF password !~ '[a-z]' THEN
    errors := array_append(errors, 'Password must contain at least one lowercase letter');
  END IF;
  
  -- Must contain number
  IF password !~ '[0-9]' THEN
    errors := array_append(errors, 'Password must contain at least one number');
  END IF;
  
  -- Must contain special character
  IF password !~ '[!@#$%^&*(),.?":{}|<>]' THEN
    errors := array_append(errors, 'Password must contain at least one special character');
  END IF;
  
  result := jsonb_build_object(
    'valid', array_length(errors, 1) IS NULL,
    'errors', errors
  );
  
  RETURN result;
END;
$$;

-- Check if account is locked
CREATE OR REPLACE FUNCTION is_account_locked(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  locked_until timestamptz;
BEGIN
  SELECT account_locked_until INTO locked_until
  FROM profiles
  WHERE id = user_uuid;
  
  IF locked_until IS NULL THEN
    RETURN false;
  END IF;
  
  IF locked_until > now() THEN
    RETURN true;
  ELSE
    -- Unlock account if lock period has passed
    UPDATE profiles
    SET account_locked_until = NULL,
        failed_login_attempts = 0
    WHERE id = user_uuid;
    RETURN false;
  END IF;
END;
$$;

-- Record failed login attempt
CREATE OR REPLACE FUNCTION record_failed_login(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  attempts integer;
BEGIN
  UPDATE profiles
  SET failed_login_attempts = failed_login_attempts + 1
  WHERE id = user_uuid
  RETURNING failed_login_attempts INTO attempts;
  
  -- Lock account after 5 failed attempts for 30 minutes
  IF attempts >= 5 THEN
    UPDATE profiles
    SET account_locked_until = now() + interval '30 minutes'
    WHERE id = user_uuid;
    
    -- Log the lockout
    INSERT INTO audit_logs (user_id, action, resource, metadata)
    VALUES (
      user_uuid,
      'account_locked',
      'auth',
      jsonb_build_object('reason', 'too_many_failed_attempts', 'attempts', attempts)
    );
  END IF;
END;
$$;

-- Reset failed login attempts on successful login
CREATE OR REPLACE FUNCTION reset_failed_login(user_uuid uuid, login_ip inet DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET failed_login_attempts = 0,
      account_locked_until = NULL,
      last_login_at = now(),
      last_login_ip = COALESCE(login_ip, last_login_ip)
  WHERE id = user_uuid;
  
  -- Log successful login
  INSERT INTO audit_logs (user_id, action, resource, ip_address, metadata)
  VALUES (
    user_uuid,
    'login_success',
    'auth',
    login_ip,
    jsonb_build_object('timestamp', now())
  );
END;
$$;

-- Generate OTP
CREATE OR REPLACE FUNCTION generate_otp(
  user_uuid uuid,
  otp_purpose text,
  expiry_minutes integer DEFAULT 10
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  otp_code text;
BEGIN
  -- Generate 6-digit OTP
  otp_code := lpad(floor(random() * 1000000)::text, 6, '0');
  
  -- Invalidate any existing OTPs for this purpose
  UPDATE otp_codes
  SET used_at = now()
  WHERE user_id = user_uuid
    AND purpose = otp_purpose
    AND used_at IS NULL
    AND expires_at > now();
  
  -- Insert new OTP
  INSERT INTO otp_codes (user_id, code, purpose, expires_at)
  VALUES (
    user_uuid,
    otp_code,
    otp_purpose,
    now() + (expiry_minutes || ' minutes')::interval
  );
  
  -- Log OTP generation
  INSERT INTO audit_logs (user_id, action, resource, metadata)
  VALUES (
    user_uuid,
    'otp_generated',
    'auth',
    jsonb_build_object('purpose', otp_purpose, 'expires_in_minutes', expiry_minutes)
  );
  
  RETURN otp_code;
END;
$$;

-- Verify OTP
CREATE OR REPLACE FUNCTION verify_otp(
  user_uuid uuid,
  otp_code text,
  otp_purpose text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_valid boolean;
  otp_id uuid;
BEGIN
  SELECT id INTO otp_id
  FROM otp_codes
  WHERE user_id = user_uuid
    AND code = otp_code
    AND purpose = otp_purpose
    AND used_at IS NULL
    AND expires_at > now()
  LIMIT 1;
  
  is_valid := otp_id IS NOT NULL;
  
  IF is_valid THEN
    -- Mark OTP as used
    UPDATE otp_codes
    SET used_at = now()
    WHERE id = otp_id;
    
    -- Log successful verification
    INSERT INTO audit_logs (user_id, action, resource, metadata)
    VALUES (
      user_uuid,
      'otp_verified',
      'auth',
      jsonb_build_object('purpose', otp_purpose, 'success', true)
    );
  ELSE
    -- Log failed verification
    INSERT INTO audit_logs (user_id, action, resource, metadata)
    VALUES (
      user_uuid,
      'otp_verification_failed',
      'auth',
      jsonb_build_object('purpose', otp_purpose, 'success', false)
    );
  END IF;
  
  RETURN is_valid;
END;
$$;

-- Clean up expired sessions and OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_sessions integer;
  deleted_otps integer;
BEGIN
  -- Delete expired sessions
  DELETE FROM user_sessions
  WHERE expires_at < now();
  GET DIAGNOSTICS deleted_sessions = ROW_COUNT;
  
  -- Delete expired or used OTPs older than 24 hours
  DELETE FROM otp_codes
  WHERE expires_at < now() - interval '24 hours'
     OR (used_at IS NOT NULL AND used_at < now() - interval '24 hours');
  GET DIAGNOSTICS deleted_otps = ROW_COUNT;
  
  -- Log cleanup
  INSERT INTO audit_logs (action, resource, metadata)
  VALUES (
    'cleanup_expired_data',
    'system',
    jsonb_build_object(
      'deleted_sessions', deleted_sessions,
      'deleted_otps', deleted_otps,
      'timestamp', now()
    )
  );
END;
$$;

-- Check password history (prevent reuse of last 5 passwords)
CREATE OR REPLACE FUNCTION check_password_history(
  user_uuid uuid,
  new_password_hash text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_reused boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM password_history
    WHERE user_id = user_uuid
      AND password_hash = new_password_hash
    ORDER BY created_at DESC
    LIMIT 5
  ) INTO is_reused;
  
  RETURN NOT is_reused;
END;
$$;

-- Add password to history
CREATE OR REPLACE FUNCTION add_password_to_history(
  user_uuid uuid,
  password_hash text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO password_history (user_id, password_hash)
  VALUES (user_uuid, password_hash);
  
  -- Keep only last 10 passwords
  DELETE FROM password_history
  WHERE user_id = user_uuid
    AND id NOT IN (
      SELECT id FROM password_history
      WHERE user_id = user_uuid
      ORDER BY created_at DESC
      LIMIT 10
    );
  
  -- Update password change timestamp
  UPDATE profiles
  SET password_changed_at = now()
  WHERE id = user_uuid;
END;
$$;

-- =====================================================
-- 7. PROGRAMS TABLE RLS
-- =====================================================

-- Enable RLS on programs
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- Public can read published programs
CREATE POLICY "Public can read published programs"
  ON programs
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- Admins can manage all programs
CREATE POLICY "Admins can manage programs"
  ON programs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- 8. LESSONS TABLE RLS
-- =====================================================

-- Enable RLS on lessons
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Enrolled users can read lessons
CREATE POLICY "Enrolled users can read lessons"
  ON lessons
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.user_id = auth.uid()
      AND enrollments.program_id = lessons.program_id
      AND enrollments.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can manage all lessons
CREATE POLICY "Admins can manage lessons"
  ON lessons
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- 9. ORDERS TABLE RLS
-- =====================================================

-- Enable RLS on orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can read their own orders
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can read all orders
CREATE POLICY "Admins can read all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update orders
CREATE POLICY "Admins can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- 10. BLOG POSTS TABLE RLS
-- =====================================================

-- Enable RLS on blog_posts
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "Public can read published posts"
  ON blog_posts
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- Admins can manage all posts
CREATE POLICY "Admins can manage blog posts"
  ON blog_posts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- 11. ENROLLMENTS TABLE RLS
-- =====================================================

-- Enable RLS on enrollments
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Users can read their own enrollments
CREATE POLICY "Users can read own enrollments"
  ON enrollments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can manage all enrollments
CREATE POLICY "Admins can manage enrollments"
  ON enrollments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- 12. PROGRESS TABLE RLS
-- =====================================================

-- Enable RLS on progress
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Users can manage their own progress
CREATE POLICY "Users can manage own progress"
  ON progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all progress
CREATE POLICY "Admins can read all progress"
  ON progress
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- 13. CERTIFICATES TABLE RLS
-- =====================================================

-- Enable RLS on certificates
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Users can read their own certificates
CREATE POLICY "Users can read own certificates"
  ON certificates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can manage all certificates
CREATE POLICY "Admins can manage certificates"
  ON certificates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- 14. SCHEDULED CLEANUP JOB
-- =====================================================

-- Note: This would typically be set up as a cron job in Supabase
-- For now, we'll create the function that can be called manually or via Edge Function

COMMENT ON FUNCTION cleanup_expired_data() IS 
'Run this function periodically (e.g., daily) to clean up expired sessions and OTPs. 
Can be triggered via Supabase cron job or Edge Function.';
