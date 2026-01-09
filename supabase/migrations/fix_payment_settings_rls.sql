/*
  # Fix Payment Settings RLS and Display Order

  1. Changes
    - Ensure `display_order` column exists
    - Add RLS policy to allow authenticated users to update payment settings
*/

-- display_order kolonunun varlığından emin ol
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_settings' AND column_name = 'display_order') THEN
    ALTER TABLE payment_settings ADD COLUMN display_order INTEGER DEFAULT 0;
  END IF;
END $$;

-- RLS Politikalarını Güncelle
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle (çakışmayı önlemek için)
DROP POLICY IF EXISTS "Enable read access for all users" ON payment_settings;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON payment_settings;

-- Okuma izni (Herkese açık - ödeme sayfası için)
CREATE POLICY "Enable read access for all users" ON payment_settings
    FOR SELECT
    USING (true);

-- Yazma/Güncelleme izni (Sadece giriş yapmış kullanıcılar/adminler için)
CREATE POLICY "Enable all access for authenticated users" ON payment_settings
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
