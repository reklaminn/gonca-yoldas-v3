/*
  # Fix Orders RLS with Role Based Access
  
  1. Temizlik:
    - Eski ve çakışan tüm politikaları temizler.
  
  2. Yeni Kurallar:
    - INSERT: Herkes (Anonim + Giriş yapmış) sipariş oluşturabilir.
    - SELECT (User): Kullanıcılar sadece kendi siparişlerini görür.
    - SELECT (Admin): 'admin' rolüne sahip kullanıcılar TÜM siparişleri görür.
    - UPDATE (Admin): 'admin' rolüne sahip kullanıcılar sipariş durumunu güncelleyebilir.
*/

-- 1. RLS'i Garantiye Al
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 2. Eski Politikaları Temizle (Çakışmaları önlemek için hepsini düşürüyoruz)
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can delete all orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can update all orders" ON orders;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON orders;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON orders;
DROP POLICY IF EXISTS "Give anon insert access" ON orders;
DROP POLICY IF EXISTS "orders_insert_authenticated" ON orders;
DROP POLICY IF EXISTS "orders_insert_guest" ON orders;
DROP POLICY IF EXISTS "orders_select_by_email" ON orders;
DROP POLICY IF EXISTS "orders_select_own" ON orders;
DROP POLICY IF EXISTS "orders_update_link_guest" ON orders;
DROP POLICY IF EXISTS "orders_update_own" ON orders;
DROP POLICY IF EXISTS "Allow Public Insert" ON orders;
DROP POLICY IF EXISTS "Allow Select Own" ON orders;
DROP POLICY IF EXISTS "Final_Insert_Policy" ON orders;
DROP POLICY IF EXISTS "Final_Select_Policy" ON orders;
DROP POLICY IF EXISTS "Final_Update_Policy" ON orders;
DROP POLICY IF EXISTS "Authenticated users can update orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can delete orders" ON orders;

-- 3. YENİ POLİTİKALAR

-- A. HERKES Sipariş Oluşturabilsin (Guest Checkout Dahil)
CREATE POLICY "Anyone can create order"
ON orders FOR INSERT
TO public
WITH CHECK (true);

-- B. KULLANICILAR Sadece Kendi Siparişlerini Görsün
CREATE POLICY "Users view own orders"
ON orders FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
);

-- C. ADMİNLER Tüm Siparişleri Görsün
-- (profiles tablosunda rolü 'admin' olanlar)
CREATE POLICY "Admins view all orders"
ON orders FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- D. ADMİNLER Siparişleri Güncelleyebilsin (Durum değişimi vb.)
CREATE POLICY "Admins update all orders"
ON orders FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- E. KULLANICILAR Kendi Siparişlerini Güncelleyebilsin (Gerekirse)
-- (Örn: İptal talebi veya bilgi güncelleme için)
CREATE POLICY "Users update own orders"
ON orders FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
);
