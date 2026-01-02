/*
  # Halka Açık Tablolar İçin Erişim İzinlerini Düzeltme (Düzeltilmiş)
  
  Düzeltme: 'testimonials' tablosu yerine 'parent_testimonials' kullanıldı.
  Amaç: Giriş yapmış kullanıcıların (authenticated) verileri okuyabilmesini sağlamak.
*/

-- 1. PROGRAMS (Eğitimler)
ALTER TABLE IF EXISTS programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access" ON programs;
DROP POLICY IF EXISTS "Anon read access" ON programs;
DROP POLICY IF EXISTS "Everyone can read programs" ON programs;
CREATE POLICY "Everyone can read programs" ON programs FOR SELECT TO public USING (true);

-- 2. PAGE_CONTENT (Sayfa İçerikleri)
ALTER TABLE IF EXISTS page_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access" ON page_content;
DROP POLICY IF EXISTS "Everyone can read page content" ON page_content;
CREATE POLICY "Everyone can read page content" ON page_content FOR SELECT TO public USING (true);

-- 3. AGE_GROUPS (Yaş Grupları)
ALTER TABLE IF EXISTS age_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access" ON age_groups;
DROP POLICY IF EXISTS "Everyone can read age groups" ON age_groups;
CREATE POLICY "Everyone can read age groups" ON age_groups FOR SELECT TO public USING (true);

-- 4. PARENT_TESTIMONIALS (Yorumlar - Doğru Tablo Adı)
-- Mevcut politikayı kontrol et, gerekirse güncelle
ALTER TABLE IF EXISTS parent_testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access" ON parent_testimonials;
DROP POLICY IF EXISTS "Everyone can read parent testimonials" ON parent_testimonials;
-- Eğer eski politika varsa çakışmaması için
DROP POLICY IF EXISTS "Public can read active testimonials" ON parent_testimonials;

CREATE POLICY "Everyone can read parent testimonials" 
ON parent_testimonials 
FOR SELECT 
TO public 
USING (is_active = true);
