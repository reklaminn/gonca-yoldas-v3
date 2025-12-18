/*
  # Add Iyzilink to payment settings
  1. Data: Insert 'iyzilink' into payment_settings table if it doesn't exist
*/

INSERT INTO payment_settings (payment_method, is_active, config)
VALUES (
  'iyzilink', 
  false, 
  '{"instructions": "Ödeme işlemini tamamlamak için güvenli ödeme sayfasına yönlendirileceksiniz."}'::jsonb
)
ON CONFLICT (payment_method) DO NOTHING;
