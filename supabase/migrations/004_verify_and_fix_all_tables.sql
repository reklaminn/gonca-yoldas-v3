/*
  # Comprehensive Schema Verification and Fixes

  1. Tables Verified
    - orders: Ensure all columns exist
    - order_items: Ensure all columns exist
    - subscription_plans: Ensure all columns exist
    - user_subscriptions: Ensure all columns exist
    - payment_transactions: Ensure all columns exist
    - audit_logs: Create if missing

  2. Changes
    - Add any missing columns to existing tables
    - Create audit_logs table if it doesn't exist
    - Add missing indexes for performance
    - Ensure all foreign keys are properly set

  3. Security
    - Verify RLS policies are in place
    - Ensure proper access controls
*/

-- =====================================================
-- 1. VERIFY AND FIX ORDERS TABLE
-- =====================================================

DO $$
BEGIN
  -- Ensure postal_code exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'postal_code'
  ) THEN
    ALTER TABLE orders ADD COLUMN postal_code text;
  END IF;

  -- Ensure address exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'address'
  ) THEN
    ALTER TABLE orders ADD COLUMN address text;
  END IF;

  -- Ensure order_date exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'order_date'
  ) THEN
    ALTER TABLE orders ADD COLUMN order_date timestamptz DEFAULT now();
  END IF;
END $$;

-- =====================================================
-- 2. VERIFY AND FIX ORDER_ITEMS TABLE
-- =====================================================

-- Table should exist from migration 003, verify it exists
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

-- =====================================================
-- 3. VERIFY AND FIX SUBSCRIPTION_PLANS TABLE
-- =====================================================

-- Table should exist from migration 002, verify all columns
DO $$
BEGIN
  -- Ensure features column is jsonb
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_plans' 
    AND column_name = 'features'
    AND data_type != 'jsonb'
  ) THEN
    ALTER TABLE subscription_plans ALTER COLUMN features TYPE jsonb USING features::jsonb;
  END IF;
END $$;

-- =====================================================
-- 4. VERIFY AND FIX USER_SUBSCRIPTIONS TABLE
-- =====================================================

-- Table should exist from migration 002, verify all columns
DO $$
BEGIN
  -- Ensure metadata column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_subscriptions' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE user_subscriptions ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- =====================================================
-- 5. VERIFY AND FIX PAYMENT_TRANSACTIONS TABLE
-- =====================================================

-- Table should exist from migration 002, verify all columns
DO $$
BEGIN
  -- Ensure metadata column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payment_transactions' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE payment_transactions ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- =====================================================
-- 6. CREATE AUDIT_LOGS TABLE (MISSING)
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

-- Create indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can read all audit logs
CREATE POLICY "Admins can read all audit logs"
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
-- 7. ADD MISSING INDEXES FOR PERFORMANCE
-- =====================================================

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_program_id ON orders(program_id);
CREATE INDEX IF NOT EXISTS idx_orders_program_slug ON orders(program_slug);
CREATE INDEX IF NOT EXISTS idx_orders_sendpulse_sent ON orders(sendpulse_sent);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_program_id ON order_items(program_id);
CREATE INDEX IF NOT EXISTS idx_order_items_program_slug ON order_items(program_slug);

-- Subscription plans indexes
CREATE INDEX IF NOT EXISTS idx_subscription_plans_billing_period ON subscription_plans(billing_period);

-- User subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_started_at ON user_subscriptions(started_at);

-- Payment transactions indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_subscription_id ON payment_transactions(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_provider ON payment_transactions(payment_provider);

-- =====================================================
-- 8. VERIFY FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Ensure order_items has proper foreign key
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'order_items_order_id_fkey'
    AND table_name = 'order_items'
  ) THEN
    ALTER TABLE order_items
    ADD CONSTRAINT order_items_order_id_fkey
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
  END IF;
END $$;

-- =====================================================
-- 9. ADD HELPFUL COMMENTS
-- =====================================================

COMMENT ON TABLE orders IS 'Customer orders for programs';
COMMENT ON TABLE order_items IS 'Line items for orders (future multi-item support)';
COMMENT ON TABLE subscription_plans IS 'Available subscription plans';
COMMENT ON TABLE user_subscriptions IS 'User subscription records';
COMMENT ON TABLE payment_transactions IS 'Payment transaction history';
COMMENT ON TABLE audit_logs IS 'System audit trail for security and debugging';

-- =====================================================
-- 10. VERIFY RLS IS ENABLED ON ALL TABLES
-- =====================================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
