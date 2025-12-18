/*
  # Create Missing Tables First

  1. New Tables
    - subscription_plans: If not exists
    - user_subscriptions: If not exists
    - payment_transactions: If not exists
    - audit_logs: If not exists
    - order_items: If not exists

  2. Changes
    - Create all tables with complete schema
    - Add all necessary columns
    - Set up proper relationships

  3. Security
    - Enable RLS on all tables
    - Add basic policies
*/

-- =====================================================
-- 1. CREATE SUBSCRIPTION_PLANS TABLE
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
CREATE INDEX IF NOT EXISTS idx_subscription_plans_billing_period ON subscription_plans(billing_period);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Public can read active plans
CREATE POLICY "Public can read active plans"
  ON subscription_plans
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Insert default plans if not exists
INSERT INTO subscription_plans (name, slug, description, price, billing_period, features) 
SELECT * FROM (VALUES
  ('Free', 'free', 'Temel özellikler', 0, 'lifetime', '["1 program erişimi", "Temel dersler", "Topluluk desteği"]'::jsonb),
  ('Pro', 'pro', 'Tüm özellikler', 299, 'monthly', '["Tüm programlara erişim", "Canlı dersler", "Öncelikli destek", "Sertifikalar", "İlerleme takibi"]'::jsonb),
  ('Pro Yıllık', 'pro-yearly', 'Tüm özellikler (Yıllık)', 2990, 'yearly', '["Tüm programlara erişim", "Canlı dersler", "Öncelikli destek", "Sertifikalar", "İlerleme takibi", "%17 indirim"]'::jsonb)
) AS v(name, slug, description, price, billing_period, features)
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE slug = v.slug);

-- =====================================================
-- 2. CREATE USER_SUBSCRIPTIONS TABLE
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
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_started_at ON user_subscriptions(started_at);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscriptions
CREATE POLICY "Users can read own subscriptions"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- 3. CREATE PAYMENT_TRANSACTIONS TABLE
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
CREATE INDEX IF NOT EXISTS idx_payment_transactions_subscription_id ON payment_transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_provider ON payment_transactions(payment_provider);

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Users can read their own transactions
CREATE POLICY "Users can read own transactions"
  ON payment_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- 4. CREATE AUDIT_LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can read their own audit logs
CREATE POLICY "Users can read own audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
  ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =====================================================
-- 5. CREATE ORDER_ITEMS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  program_id integer NOT NULL,
  program_slug text NOT NULL,
  program_title text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_program_id ON order_items(program_id);
CREATE INDEX IF NOT EXISTS idx_order_items_program_slug ON order_items(program_slug);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Users can read their own order items
CREATE POLICY "Users can read own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- =====================================================
-- 6. ADD MISSING COLUMNS TO ORDERS
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'postal_code'
  ) THEN
    ALTER TABLE orders ADD COLUMN postal_code text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'address'
  ) THEN
    ALTER TABLE orders ADD COLUMN address text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'order_date'
  ) THEN
    ALTER TABLE orders ADD COLUMN order_date timestamptz DEFAULT now();
  END IF;
END $$;

-- =====================================================
-- 7. ADD PERFORMANCE INDEXES TO ORDERS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_orders_program_id ON orders(program_id);
CREATE INDEX IF NOT EXISTS idx_orders_program_slug ON orders(program_slug);
CREATE INDEX IF NOT EXISTS idx_orders_sendpulse_sent ON orders(sendpulse_sent);

-- =====================================================
-- 8. ADD TABLE COMMENTS
-- =====================================================

COMMENT ON TABLE subscription_plans IS 'Available subscription plans';
COMMENT ON TABLE user_subscriptions IS 'User subscription records';
COMMENT ON TABLE payment_transactions IS 'Payment transaction history';
COMMENT ON TABLE audit_logs IS 'System audit trail for security and debugging';
COMMENT ON TABLE order_items IS 'Line items for orders (future multi-item support)';
