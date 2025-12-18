/*
  # Fix Status Column and Constraints
  
  1. Changes:
    - Force schema reload
    - Ensure status column exists
    - Drop restrictive check constraint on payment_status if it exists to allow more flexibility
*/

-- 1. Şema önbelleğini yenile
NOTIFY pgrst, 'reload schema';

-- 2. Status sütununu garantiye al
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'status') THEN
        ALTER TABLE orders ADD COLUMN status text DEFAULT 'pending';
    END IF;
END $$;

-- 3. payment_status üzerindeki kısıtlamayı (constraint) kaldır
-- Bu, 'completed' gibi değerlerin payment_status'e yazılabilmesini sağlar (Fallback için gerekli)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_payment_status_check') THEN
        ALTER TABLE orders DROP CONSTRAINT orders_payment_status_check;
    END IF;
END $$;

-- 4. Yeni, daha esnek bir kısıtlama ekle (Opsiyonel, veri bütünlüğü için)
-- Şimdilik kısıtlama eklemiyoruz ki hata almayalım.
