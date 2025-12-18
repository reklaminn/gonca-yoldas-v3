/*
  # Admin Sipariş Politikaları
  1. Security: Siparişleri güncelleme ve silme yetkisi ver
  
  Not: Gerçek bir prodüksiyon ortamında 'admin' rolü kontrolü yapılmalıdır.
  Şimdilik authenticated (giriş yapmış) kullanıcıların işlem yapmasına izin veriyoruz.
*/

-- Mevcut politikaları temizle (çakışmayı önlemek için)
DROP POLICY IF EXISTS "Users can update their own orders" ON orders;
DROP POLICY IF EXISTS "Users can delete their own orders" ON orders;

-- Güncelleme politikası (Admin/Kullanıcı sipariş durumunu değiştirebilsin)
CREATE POLICY "Authenticated users can update orders"
ON orders FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Silme politikası
CREATE POLICY "Authenticated users can delete orders"
ON orders FOR DELETE
TO authenticated
USING (true);
