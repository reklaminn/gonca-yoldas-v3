/*
  # Orders System Schema

  1. New Tables
    - `orders`
      - Core order information (customer, program, payment)
      - Automatic order number generation
      - SendPulse integration tracking
    - `order_items`
      - Line items for future multi-item orders
      - Quantity and pricing details

  2. Security
    - Enable RLS on both tables
    - Users can only read their own orders
    - Admin functions for statistics

  3. Functions
    - `generate_order_number()`: Auto-generate unique order numbers (GY-YYYYMMDD-XXXX)
    - `get_order_statistics()`: Admin dashboard statistics
*/

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Customer Information
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  country text NOT NULL DEFAULT 'Türkiye',
  city text NOT NULL,
  district text NOT NULL,
  postal_code text,
  address text,
  tax_office text,
  tax_number text,
  
  -- Program Information
  program_id integer NOT NULL,
  program_slug text NOT NULL,
  program_title text NOT NULL,
  program_price numeric(10,2) NOT NULL,
  
  -- Order Totals
  subtotal numeric(10,2) NOT NULL,
  discount_percentage integer DEFAULT 0,
  discount_amount numeric(10,2) DEFAULT 0,
  tax_rate integer NOT NULL DEFAULT 20,
  tax_amount numeric(10,2) NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  
  -- Payment Information
  payment_method text NOT NULL DEFAULT 'credit_card',
  installment integer DEFAULT 1,
  coupon_code text,
  payment_status text NOT NULL DEFAULT 'pending',
  
  -- Card Information (last 4 digits only for security)
  card_name text,
  card_last_four text,
  
  -- Order Management
  order_number text UNIQUE,
  order_date timestamptz DEFAULT now(),
  
  -- SendPulse Integration
  sendpulse_sent boolean DEFAULT false,
  sendpulse_sent_at timestamptz,
  sendpulse_error text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table (for future expansion)
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

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for order_items
CREATE POLICY "Users can read own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  date_part text;
  sequence_part text;
  next_sequence integer;
BEGIN
  -- Get current date in YYYYMMDD format
  date_part := to_char(CURRENT_DATE, 'YYYYMMDD');
  
  -- Get the next sequence number for today
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(order_number FROM 'GY-\d{8}-(\d{4})') AS integer
    )
  ), 0) + 1
  INTO next_sequence
  FROM orders
  WHERE order_number LIKE 'GY-' || date_part || '-%';
  
  -- Format sequence with leading zeros
  sequence_part := LPAD(next_sequence::text, 4, '0');
  
  -- Return formatted order number
  RETURN 'GY-' || date_part || '-' || sequence_part;
END;
$$;

-- Function to get order statistics (for admin dashboard)
CREATE OR REPLACE FUNCTION get_order_statistics()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_orders', COUNT(*),
    'total_revenue', COALESCE(SUM(total_amount), 0),
    'pending_orders', COUNT(*) FILTER (WHERE payment_status = 'pending'),
    'completed_orders', COUNT(*) FILTER (WHERE payment_status = 'completed'),
    'failed_orders', COUNT(*) FILTER (WHERE payment_status = 'failed')
  )
  INTO result
  FROM orders;
  
  RETURN result;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
