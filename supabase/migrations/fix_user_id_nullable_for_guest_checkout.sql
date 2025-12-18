/*
  # Fix user_id Column to Allow Guest Checkout

  1. Changes
    - Alter `user_id` column to allow NULL values
    - Remove default value `auth.uid()` (will be set by application)
    - This enables guest checkout where user_id can be NULL

  2. Security
    - RLS policies already handle both authenticated and guest users
    - Authenticated users: user_id = auth.uid()
    - Guest users: user_id IS NULL

  3. Important Notes
    - Existing orders with user_id will remain unchanged
    - New orders can have NULL user_id for guest checkout
    - Orders can be linked to users later via email matching
*/

-- ============================================
-- 🔧 STEP 1: Make user_id Nullable
-- ============================================
ALTER TABLE orders 
  ALTER COLUMN user_id DROP NOT NULL;

-- ============================================
-- 🔧 STEP 2: Remove Default Value
-- ============================================
-- Default değeri kaldır (application'da set edeceğiz)
ALTER TABLE orders 
  ALTER COLUMN user_id DROP DEFAULT;

-- ============================================
-- ✅ STEP 3: Verify Changes
-- ============================================
-- Değişiklikleri kontrol et
DO $$
DECLARE
  is_nullable TEXT;
  has_default TEXT;
BEGIN
  SELECT 
    c.is_nullable,
    c.column_default
  INTO is_nullable, has_default
  FROM information_schema.columns c
  WHERE c.table_name = 'orders'
    AND c.column_name = 'user_id';
  
  RAISE NOTICE '✅ user_id is_nullable: %', is_nullable;
  RAISE NOTICE '✅ user_id column_default: %', COALESCE(has_default, 'NULL (no default)');
  
  IF is_nullable = 'YES' THEN
    RAISE NOTICE '✅ SUCCESS: user_id is now nullable!';
  ELSE
    RAISE EXCEPTION '❌ FAILED: user_id is still NOT NULL!';
  END IF;
END $$;
