/*
  # Add Billing Details to Orders Table
  1. New Columns:
    - customer_type (text): 'individual' or 'corporate'
    - tc_no (text): 11-digit ID for individuals
    - billing_address (text): Full address for corporate invoices
  2. Constraints:
    - customer_type must be one of 'individual', 'corporate'
*/

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_type') THEN
    ALTER TABLE orders ADD COLUMN customer_type text DEFAULT 'individual';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'tc_no') THEN
    ALTER TABLE orders ADD COLUMN tc_no text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'billing_address') THEN
    ALTER TABLE orders ADD COLUMN billing_address text;
  END IF;
END $$;