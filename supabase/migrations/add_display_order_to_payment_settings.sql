/*
  # Add display_order to payment_settings

  1. Changes
    - Add `display_order` column to `payment_settings` table
    - Set default value to 0
    - Update existing records to have a sequential order based on creation
*/

ALTER TABLE payment_settings 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Mevcut kayıtları oluşturulma tarihine göre sırala (varsayılan sıralama)
WITH ranked_payments AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM payment_settings
)
UPDATE payment_settings
SET display_order = ranked_payments.rn
FROM ranked_payments
WHERE payment_settings.id = ranked_payments.id;
