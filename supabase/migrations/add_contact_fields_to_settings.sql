/*
  # Add Contact Fields to General Settings
  1. New Columns: address (text), phone (text)
  2. Default Values: Sets initial placeholder data
*/

ALTER TABLE general_settings 
ADD COLUMN IF NOT EXISTS address text DEFAULT 'Nispetiye Cad. No:12/A Levent, İstanbul',
ADD COLUMN IF NOT EXISTS phone text DEFAULT '+90 (212) 123 45 67';

-- Update existing row if needed to ensure data exists
UPDATE general_settings 
SET 
  address = 'Nispetiye Cad. No:12/A Levent, İstanbul',
  phone = '+90 (212) 123 45 67'
WHERE address IS NULL;