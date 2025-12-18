/*
      # Comprehensive Security Hardening

      1. Tables & Security
        - Create audit_logs table for tracking security events
        - Create sessions table for session management
        - Enable RLS on all tables
      
      2. Authentication Security
        - Implement failed login tracking
        - Add account lockout mechanism
        - Track password history
      
      3. RLS Policies
        - Strict user isolation
        - Admin access controls
        - Audit trail protection
      
      4. Functions
        - Password validation
        - Session cleanup
        - Rate limiting helpers
    */

    -- Create audit_logs table for security tracking
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

    -- System can insert audit logs
    CREATE POLICY "System can insert audit logs"
      ON audit_logs
      FOR INSERT
      TO authenticated
      WITH CHECK (true);

    -- Create sessions table for session management
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

    -- Add security columns to profiles if not exists
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'failed_login_attempts'
      ) THEN
        ALTER TABLE profiles ADD COLUMN failed_login_attempts integer DEFAULT 0;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'account_locked_until'
      ) THEN
        ALTER TABLE profiles ADD COLUMN account_locked_until timestamptz;
      END IF;

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

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'role'
      ) THEN
        ALTER TABLE profiles ADD COLUMN role text DEFAULT 'student' CHECK (role IN ('student', 'parent', 'admin'));
      END IF;
    END $$;

    -- Create password history table
    CREATE TABLE IF NOT EXISTS password_history (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      password_hash text NOT NULL,
      created_at timestamptz DEFAULT now()
    );

    ALTER TABLE password_history ENABLE ROW LEVEL SECURITY;

    -- Only system can access password history
    CREATE POLICY "System only access to password history"
      ON password_history
      FOR ALL
      TO authenticated
      USING (false)
      WITH CHECK (false);

    -- Create OTP table for one-time passwords
    CREATE TABLE IF NOT EXISTS otp_codes (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      code text NOT NULL,
      purpose text NOT NULL CHECK (purpose IN ('login', 'password_reset', 'email_verification')),
      expires_at timestamptz NOT NULL,
      used_at timestamptz,
      created_at timestamptz DEFAULT now()
    );

    ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

    -- Users cannot directly access OTP codes
    CREATE POLICY "No direct OTP access"
      ON otp_codes
      FOR ALL
      TO authenticated
      USING (false)
      WITH CHECK (false);

    -- Create function to validate password strength
    CREATE OR REPLACE FUNCTION validate_password_strength(password text)
    RETURNS boolean
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      -- Minimum 8 characters
      IF length(password) < 8 THEN
        RETURN false;
      END IF;
      
      -- Must contain at least one uppercase letter
      IF password !~ '[A-Z]' THEN
        RETURN false;
      END IF;
      
      -- Must contain at least one lowercase letter
      IF password !~ '[a-z]' THEN
        RETURN false;
      END IF;
      
      -- Must contain at least one number
      IF password !~ '[0-9]' THEN
        RETURN false;
      END IF;
      
      RETURN true;
    END;
    $$;

    -- Create function to check if account is locked
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

    -- Create function to record failed login attempt
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
      END IF;
    END;
    $$;

    -- Create function to clean up expired sessions
    CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      DELETE FROM user_sessions
      WHERE expires_at < now();
      
      DELETE FROM otp_codes
      WHERE expires_at < now();
    END;
    $$;

    -- Create function to generate secure OTP
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
      VALUES (user_uuid, otp_code, otp_purpose, now() + (expiry_minutes || ' minutes')::interval);
      
      RETURN otp_code;
    END;
    $$;

    -- Create function to verify OTP
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
    BEGIN
      SELECT EXISTS (
        SELECT 1 FROM otp_codes
        WHERE user_id = user_uuid
          AND code = otp_code
          AND purpose = otp_purpose
          AND used_at IS NULL
          AND expires_at > now()
      ) INTO is_valid;
      
      IF is_valid THEN
        -- Mark OTP as used
        UPDATE otp_codes
        SET used_at = now()
        WHERE user_id = user_uuid
          AND code = otp_code
          AND purpose = otp_purpose;
      END IF;
      
      RETURN is_valid;
    END;
    $$;

    -- Create indexes for performance
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_otp_codes_user_id ON otp_codes(user_id);
    CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);
    CREATE INDEX IF NOT EXISTS idx_password_history_user_id ON password_history(user_id);
