/*
  # Halka Açık Tablolar İçin Erişim İzinlerini Düzeltme
  
  Sorun: Giriş yapmış kullanıcılar (authenticated), sadece 'anon' rolüne izin verilen tabloları okuyamıyor olabilir.
  Çözüm: Okuma izinlerini 'public' (herkes) olarak güncelleyerek hem anonim hem giriş yapmış kullanıcıların görmesini sağla.
*/

-- 1. PROGRAMS (Eğitimler) Tablosu
ALTER TABLE IF EXISTS programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access" ON programs;
DROP POLICY IF EXISTS "Anon read access" ON programs;
DROP POLICY IF EXISTS "Everyone can read programs" ON programs;
-- 'public' rolü hem anonim hem authenticated kullanıcıları kapsar
CREATE POLICY "Everyone can read programs" ON programs FOR SELECT TO public USING (true);

-- 2. PAGE_CONTENT (Sayfa İçerikleri) Tablosu
ALTER TABLE IF EXISTS page_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access" ON page_content;
DROP POLICY IF EXISTS "Everyone can read page content" ON page_content;
CREATE POLICY "Everyone can read page content" ON page_content FOR SELECT TO public USING (true);

-- 3. TESTIMONIALS (Yorumlar) Tablosu
ALTER TABLE IF EXISTS testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access" ON testimonials;
DROP POLICY IF EXISTS "Everyone can read testimonials" ON testimonials;
CREATE POLICY "Everyone can read testimonials" ON testimonials FOR SELECT TO public USING (true);

-- 4. AGE_GROUPS (Yaş Grupları) Tablosu
ALTER TABLE IF EXISTS age_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read access" ON age_groups;
DROP POLICY IF EXISTS "Everyone can read age groups" ON age_groups;
CREATE POLICY "Everyone can read age groups" ON age_groups FOR SELECT TO public USING (true);

-- 5. PROFILES (Profiller) - Kullanıcıların kendi profilini okuması ve adminlerin her şeyi görmesi
-- Not: Profiller genellikle public değildir ama bazen öğretmen profilleri public olabilir.
-- Şimdilik sadece temel güvenliği garantiye alalım.
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
-- Mevcut politikaları koru, sadece eksikse ekle
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can read own profile'
    ) THEN
        CREATE POLICY "Users can read own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
    END IF;
END $$;
