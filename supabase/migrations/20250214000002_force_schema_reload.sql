/*
  # Fix Schema Cache and Ensure Status Column
  
  1. Changes:
    - Safely adds 'status' column if missing
    - Updates null status values
    - Forces PostgREST schema cache reload
*/

-- 1. Sütunu güvenli bir şekilde ekle
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE orders ADD COLUMN status text DEFAULT 'pending';
    END IF;
END $$;

-- 2. Verileri eşitle
UPDATE orders 
SET status = payment_status 
WHERE status IS NULL OR status = '';

-- 3. İzinleri tekrar tanımla (Garanti olsun diye)
GRANT ALL ON orders TO authenticated;
GRANT ALL ON orders TO service_role;

-- 4. Şema önbelleğini ZORLA yenile
NOTIFY pgrst, 'reload schema';
