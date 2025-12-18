/*
  # Status Sütunu Ekleme ve Veri Onarımı
  
  1. Changes:
    - `orders` tablosuna `status` sütunu ekle (varsayılan: 'pending')
    - Mevcut siparişlerin `status` bilgisini `payment_status` ile doldur
    - İndex oluştur
*/

-- Status sütununu ekle (Eğer yoksa)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'status'
  ) THEN
    ALTER TABLE orders ADD COLUMN status text DEFAULT 'pending';
  END IF;
END $$;

-- Mevcut verileri onar (Status boşsa payment_status değerini kopyala)
UPDATE orders 
SET status = payment_status 
WHERE status IS NULL OR status = '';

-- İndex ekle
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Schema cache'i yenilemek için (Supabase bazen cache'i hemen yenilemez)
NOTIFY pgrst, 'reload schema';
