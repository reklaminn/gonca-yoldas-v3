/*
  # Subscription System

  1. New Tables
    - `subscription_plans` - Available subscription plans
    - `user_subscriptions` - User subscription records
    - `payment_transactions` - Payment history
  
  2. Security
    - Enable RLS on all tables
    - Add policies for user access
    - Admin-only management
  
  3. Changes
    - Add subscription_tier to profiles
    - Add payment tracking
*/

-- =====================================================
-- 1. SUBSCRIPTION PLANS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  currency text DEFAULT 'TRY',
  billing_period text NOT NULL CHECK (billing_period IN ('monthly', 'yearly', 'lifetime')),
  features jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscription_plans_slug ON subscription_plans(slug);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_is_active ON subscription_plans(is_active);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Public can read active plans
CREATE POLICY "Public can read active plans"
  ON subscription_plans
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Admins can manage plans
CREATE POLICY "Admins can manage plans"
  ON subscription_plans
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert default plans
INSERT INTO subscription_plans (name, slug, description, price, billing_period, features) VALUES
  ('Free', 'free', 'Temel özellikler', 0, 'lifetime', '["1 program erişimi", "Temel dersler", "Topluluk desteği"]'::jsonb),
  ('Pro', 'pro', 'Tüm özellikler', 299, 'monthly', '["Tüm programlara erişim", "Canlı dersler", "Öncelikli destek", "Sertifikalar", "İlerleme takibi"]'::jsonb),
  ('Pro Yıllık', 'pro-yearly', 'Tüm özellikler (Yıllık)', 2990, 'yearly', '["Tüm programlara erişim", "Canlı dersler", "Öncelikli destek", "Sertifikalar", "İlerleme takibi", "%17 indirim"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 2. USER SUBSCRIPTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id uuid REFERENCES subscription_plans(id) NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  cancelled_at timestamptz,
  payment_method text,
  payment_provider text CHECK (payment_provider IN ('stripe', 'paypal', 'iyzico')),
  external_subscription_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires_at ON user_subscriptions(expires_at);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscriptions
CREATE POLICY "Users can read own subscriptions"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can manage all subscriptions
CREATE POLICY "Admins can manage subscriptions"
  ON user_subscriptions
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
-- 3. PAYMENT TRANSACTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  subscription_id uuid REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'TRY',
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method text,
  payment_provider text CHECK (payment_provider IN ('stripe', 'paypal', 'iyzico')),
  external_transaction_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Users can read their own transactions
CREATE POLICY "Users can read own transactions"
  ON payment_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can read all transactions
CREATE POLICY "Admins can read all transactions"
  ON payment_transactions
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
-- 4. ADD SUBSCRIPTION TIER TO PROFILES
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro'));
  END IF;
END $$;

-- =====================================================
-- 5. SUBSCRIPTION FUNCTIONS
-- =====================================================

-- Get user's current subscription
CREATE OR REPLACE FUNCTION get_user_subscription(user_uuid uuid)
RETURNS TABLE (
  plan_name text,
  plan_slug text,
  status text,
  expires_at timestamptz,
  features jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.name,
    sp.slug,
    us.status,
    us.expires_at,
    sp.features
  FROM user_subscriptions us
  JOIN subscription_plans sp ON sp.id = us.plan_id
  WHERE us.user_id = user_uuid
    AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;
END;
$$;

-- Activate subscription after payment
CREATE OR REPLACE FUNCTION activate_subscription(
  user_uuid uuid,
  plan_slug text,
  payment_provider_name text,
  external_sub_id text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  plan_record subscription_plans;
  subscription_id uuid;
  expiry_date timestamptz;
BEGIN
  -- Get plan details
  SELECT * INTO plan_record
  FROM subscription_plans
  WHERE slug = plan_slug AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan not found: %', plan_slug;
  END IF;

  -- Calculate expiry date
  IF plan_record.billing_period = 'monthly' THEN
    expiry_date := now() + interval '1 month';
  ELSIF plan_record.billing_period = 'yearly' THEN
    expiry_date := now() + interval '1 year';
  ELSE
    expiry_date := NULL; -- Lifetime
  END IF;

  -- Cancel any existing active subscriptions
  UPDATE user_subscriptions
  SET status = 'cancelled',
      cancelled_at = now()
  WHERE user_id = user_uuid
    AND status = 'active';

  -- Create new subscription
  INSERT INTO user_subscriptions (
    user_id,
    plan_id,
    status,
    expires_at,
    payment_provider,
    external_subscription_id
  ) VALUES (
    user_uuid,
    plan_record.id,
    'active',
    expiry_date,
    payment_provider_name,
    external_sub_id
  )
  RETURNING id INTO subscription_id;

  -- Update user's subscription tier
  UPDATE profiles
  SET subscription_tier = CASE 
    WHEN plan_record.slug = 'free' THEN 'free'
    ELSE 'pro'
  END
  WHERE id = user_uuid;

  -- Log the activation
  INSERT INTO audit_logs (user_id, action, resource, metadata)
  VALUES (
    user_uuid,
    'subscription_activated',
    'subscriptions',
    jsonb_build_object(
      'plan', plan_slug,
      'subscription_id', subscription_id,
      'expires_at', expiry_date
    )
  );

  RETURN subscription_id;
END;
$$;

-- Check if user has pro access
CREATE OR REPLACE FUNCTION has_pro_access(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  has_access boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM user_subscriptions us
    JOIN subscription_plans sp ON sp.id = us.plan_id
    WHERE us.user_id = user_uuid
      AND us.status = 'active'
      AND sp.slug != 'free'
      AND (us.expires_at IS NULL OR us.expires_at > now())
  ) INTO has_access;

  RETURN has_access;
END;
$$;

-- Expire subscriptions (run daily via cron)
CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update expired subscriptions
  UPDATE user_subscriptions
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at < now();

  -- Update user profiles to free tier
  UPDATE profiles
  SET subscription_tier = 'free'
  WHERE id IN (
    SELECT user_id
    FROM user_subscriptions
    WHERE status = 'expired'
      AND user_id NOT IN (
        SELECT user_id
        FROM user_subscriptions
        WHERE status = 'active'
      )
  );

  -- Log the expiration
  INSERT INTO audit_logs (action, resource, metadata)
  VALUES (
    'subscriptions_expired',
    'system',
    jsonb_build_object('timestamp', now())
  );
END;
$$;
