/*
  # Simplify Orders Schema

  1. Changes
    - Remove `country` column (hardcoded to "Türkiye")
    - Remove `postal_code` column (not needed for Turkey)
    - Remove `address` column (not needed for online service)
    - Keep `city` and `district` (mandatory)
    - Keep `tax_office` and `tax_number` (optional, for corporate customers)

  2. Migration Strategy
    - Use ALTER TABLE to drop columns
    - Preserve all existing data
    - No data loss
*/

-- Drop unnecessary columns
DO $$
BEGIN
  -- Drop country column (hardcoded to "Türkiye" in application)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'country'
  ) THEN
    ALTER TABLE orders DROP COLUMN country;
  END IF;

  -- Drop postal_code column (not needed)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'postal_code'
  ) THEN
    ALTER TABLE orders DROP COLUMN postal_code;
  END IF;

  -- Drop address column (not needed for online service)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'address'
  ) THEN
    ALTER TABLE orders DROP COLUMN address;
  END IF;
END $$;

-- Verify remaining columns
COMMENT ON COLUMN orders.city IS 'City (İl) - Mandatory';
COMMENT ON COLUMN orders.district IS 'District (İlçe) - Mandatory';
COMMENT ON COLUMN orders.tax_office IS 'Tax Office (Vergi Dairesi) - Optional, for corporate customers';
COMMENT ON COLUMN orders.tax_number IS 'Tax Number (Vergi Numarası) - Optional, for corporate customers';
