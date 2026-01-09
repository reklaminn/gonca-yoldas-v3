/*
  # Add Customer Details to Orders
  
  1. New Columns:
     - customer_type (text): 'individual' or 'corporate'
     - tc_no (text): TC Identity Number
  
  2. Purpose:
     - Store missing customer details collected in checkout form
*/

DO $$
BEGIN
  -- Add customer_type if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_type') THEN
    ALTER TABLE orders ADD COLUMN customer_type text DEFAULT 'individual';
  END IF;

  -- Add tc_no if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'tc_no') THEN
    ALTER TABLE orders ADD COLUMN tc_no text;
  END IF;
END $$;
