/*
  # Update Payment Methods Constraint
  
  1. Changes
    - Drop existing check constraint on payment_settings.payment_method
    - Add new check constraint including 'iyzilink'
    - Insert 'iyzilink' payment setting
*/

-- Mevcut kısıtlamayı kaldır
ALTER TABLE payment_settings 
DROP CONSTRAINT IF EXISTS payment_settings_payment_method_check;

-- Yeni kısıtlamayı ekle (iyzilink dahil)
ALTER TABLE payment_settings 
ADD CONSTRAINT payment_settings_payment_method_check 
CHECK (payment_method IN ('credit_card', 'bank_transfer', 'iyzilink'));

-- Şimdi iyzilink verisini ekle
INSERT INTO payment_settings (payment_method, is_active, config)
VALUES (
  'iyzilink', 
  false, 
  '{"instructions": "Ödeme işlemini tamamlamak için güvenli ödeme sayfasına yönlendirileceksiniz."}'::jsonb
)
ON CONFLICT (payment_method) DO NOTHING;
