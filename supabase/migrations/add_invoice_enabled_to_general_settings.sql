/*
  # Add invoice_enabled to general_settings
  1. Changes: Add invoice_enabled column to general_settings table
  2. Default: true (Existing behavior preserved)
*/
ALTER TABLE general_settings ADD COLUMN IF NOT EXISTS invoice_enabled boolean DEFAULT true;
