/*
  # Create Payment Settings Table

  1. New Tables
    - `payment_settings`
      - `id` (uuid, primary key)
      - `payment_method` (text) - 'credit_card' or 'bank_transfer'
      - `is_active` (boolean) - Enable/disable payment method
      - `config` (jsonb) - Method-specific configuration
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `payment_settings` table
    - Add policies for admin access only
*/

-- Create payment_settings table
CREATE TABLE IF NOT EXISTS payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_method text NOT NULL UNIQUE CHECK (payment_method IN ('credit_card', 'bank_transfer')),
  is_active boolean DEFAULT false,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active payment methods (for checkout page)
CREATE POLICY "Anyone can read active payment methods"
  ON payment_settings
  FOR SELECT
  USING (is_active = true);

-- Policy: Admins can read all payment methods
CREATE POLICY "Admins can read all payment methods"
  ON payment_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can update payment methods
CREATE POLICY "Admins can update payment methods"
  ON payment_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can insert payment methods
CREATE POLICY "Admins can insert payment methods"
  ON payment_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert default payment methods
INSERT INTO payment_settings (payment_method, is_active, config)
VALUES 
  ('credit_card', true, '{"provider": "iyzico", "api_key": "", "secret_key": "", "base_url": "https://api.iyzipay.com"}'::jsonb),
  ('bank_transfer', false, '{"bank_name": "", "account_holder": "", "iban": "", "instructions": ""}'::jsonb)
ON CONFLICT (payment_method) DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_payment_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_settings_updated_at
  BEFORE UPDATE ON payment_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_settings_updated_at();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_payment_settings_active ON payment_settings(is_active);
CREATE INDEX IF NOT EXISTS idx_payment_settings_method ON payment_settings(payment_method);
