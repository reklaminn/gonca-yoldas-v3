/*
  # Add KDV Display Toggle to General Settings

  1. Changes
    - Add `show_prices_with_vat` column to `general_settings` table
    - Default value: true (show prices with VAT)

  2. Notes
    - This toggle controls whether prices are displayed with or without VAT
    - Affects checkout page and pricing pages
*/

-- Add show_prices_with_vat column to general_settings
ALTER TABLE general_settings
ADD COLUMN IF NOT EXISTS show_prices_with_vat boolean NOT NULL DEFAULT true;

-- Update existing row if it exists
UPDATE general_settings
SET show_prices_with_vat = true
WHERE show_prices_with_vat IS NULL;
