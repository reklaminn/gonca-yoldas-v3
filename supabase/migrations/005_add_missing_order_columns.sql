/*
  # Add Missing Columns to Orders Table

  1. Changes
    - Add `tax_office` column (optional, for corporate customers)
    - Add `tax_number` column (optional, for corporate customers)
    - Both columns are TEXT type and nullable

  2. Security
    - No RLS changes needed (existing policies cover new columns)
*/

-- Add tax_office column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'tax_office'
  ) THEN
    ALTER TABLE orders ADD COLUMN tax_office TEXT;
    COMMENT ON COLUMN orders.tax_office IS 'Tax Office (Vergi Dairesi) - Optional, for corporate customers';
  END IF;
END $$;

-- Add tax_number column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'tax_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN tax_number TEXT;
    COMMENT ON COLUMN orders.tax_number IS 'Tax Number (Vergi Numarası) - Optional, for corporate customers';
  END IF;
END $$;

-- Verify columns exist
DO $$
DECLARE
  tax_office_exists BOOLEAN;
  tax_number_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'tax_office'
  ) INTO tax_office_exists;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'tax_number'
  ) INTO tax_number_exists;

  IF tax_office_exists AND tax_number_exists THEN
    RAISE NOTICE '✅ Both tax_office and tax_number columns added successfully';
  ELSE
    RAISE EXCEPTION '❌ Failed to add columns: tax_office=%, tax_number=%', tax_office_exists, tax_number_exists;
  END IF;
END $$;
