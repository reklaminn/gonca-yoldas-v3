/*
  # Create Page Content Management System
  
  1. New Tables
    - `page_content`
      - `id` (uuid, primary key)
      - `page_key` (text, unique) - Sayfa tanımlayıcısı (home, about, contact, learning-platform)
      - `section_key` (text) - Bölüm tanımlayıcısı (hero, features, testimonials, etc.)
      - `content_type` (text) - İçerik tipi (text, html, image_url, json)
      - `content_value` (text) - İçerik değeri
      - `display_order` (integer) - Sıralama
      - `is_active` (boolean) - Aktif/Pasif
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `page_content` table
    - Add policies for public read and authenticated admin write
*/

-- Create page_content table
CREATE TABLE IF NOT EXISTS page_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL,
  section_key text NOT NULL,
  content_type text NOT NULL DEFAULT 'text',
  content_value text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(page_key, section_key, content_type)
);

-- Enable RLS
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

-- Public can read active content
CREATE POLICY "Public can view active page content"
  ON page_content
  FOR SELECT
  TO public
  USING (is_active = true);

-- Authenticated users can manage content
CREATE POLICY "Authenticated users can insert page content"
  ON page_content
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update page content"
  ON page_content
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete page content"
  ON page_content
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_page_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER page_content_updated_at
  BEFORE UPDATE ON page_content
  FOR EACH ROW
  EXECUTE FUNCTION update_page_content_updated_at();

-- Insert default content for Home page
INSERT INTO page_content (page_key, section_key, content_type, content_value, display_order) VALUES
  ('home', 'hero_title', 'text', 'Çocuğunuza İkinci Bir Dil Kazandırmak', 1),
  ('home', 'hero_subtitle', 'text', 'Artık Daha Kolay', 2),
  ('home', 'hero_description', 'text', '0–10 yaş arası çocuklar için bilimsel temelli İngilizce edinim programları', 3),
  ('home', 'hero_image', 'image_url', 'https://images.pexels.com/photos/8535214/pexels-photo-8535214.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 4),
  ('home', 'programs_title', 'text', 'Programlarımız', 5),
  ('home', 'programs_description', 'text', 'Her yaş grubuna özel tasarlanmış, bilimsel temelli eğitim programları', 6),
  ('home', 'features_title', 'text', 'Neden Bizi Seçmelisiniz?', 7),
  ('home', 'features_description', 'text', 'Çocuğunuzun eğitimi için en iyi seçimi yapmanıza yardımcı olacak özelliklerimiz', 8),
  ('home', 'testimonials_title', 'text', 'Velilerimiz Ne Diyor?', 9),
  ('home', 'cta_title', 'text', 'Hemen Başlayın', 10),
  ('home', 'cta_description', 'text', 'Çocuğunuzun İngilizce öğrenme yolculuğuna bugün başlayın', 11);

-- Insert default content for About page
INSERT INTO page_content (page_key, section_key, content_type, content_value, display_order) VALUES
  ('about', 'hero_title', 'text', 'Hakkımızda', 1),
  ('about', 'hero_description', 'text', 'Çocukların dil öğrenme yolculuğunda güvenilir rehberiniz', 2),
  ('about', 'mission_title', 'text', 'Misyonumuz', 3),
  ('about', 'mission_description', 'text', '0-10 yaş arası çocuklara, bilimsel yöntemlerle desteklenen, eğlenceli ve etkili İngilizce eğitimi sunarak, onların küresel vatandaşlar olarak yetişmelerine katkıda bulunmak.', 4),
  ('about', 'vision_title', 'text', 'Vizyonumuz', 5),
  ('about', 'vision_description', 'text', 'Türkiye''nin en güvenilir ve yenilikçi erken çocukluk İngilizce eğitim kurumu olmak.', 6),
  ('about', 'values_title', 'text', 'Değerlerimiz', 7),
  ('about', 'values_description', 'text', 'Bizi biz yapan temel prensipler', 8),
  ('about', 'team_title', 'text', 'Ekibimiz', 9),
  ('about', 'team_description', 'text', 'Deneyimli ve tutkulu eğitmenlerimiz', 10);

-- Insert default content for Contact page
INSERT INTO page_content (page_key, section_key, content_type, content_value, display_order) VALUES
  ('contact', 'hero_title', 'text', 'İletişim', 1),
  ('contact', 'hero_description', 'text', 'Sorularınız için bize ulaşın, size yardımcı olmaktan mutluluk duyarız', 2),
  ('contact', 'form_title', 'text', 'Bize Mesaj Gönderin', 3),
  ('contact', 'form_description', 'text', 'Formu doldurun, en kısa sürede size dönüş yapalım', 4),
  ('contact', 'address', 'text', 'Nispetiye Cad. No:12/A\nLevent, İstanbul', 5),
  ('contact', 'phone', 'text', '+90 (212) 123 45 67\n+90 (532) 123 45 67', 6),
  ('contact', 'email', 'text', 'info@goncayoldas.com\ndestek@goncayoldas.com', 7),
  ('contact', 'hours', 'text', 'Pazartesi - Cuma: 09:00 - 18:00\nCumartesi: 10:00 - 16:00', 8);

-- Insert default content for Learning Platform page
INSERT INTO page_content (page_key, section_key, content_type, content_value, display_order) VALUES
  ('learning-platform', 'hero_title', 'text', 'Öğrenme deneyimini', 1),
  ('learning-platform', 'hero_subtitle', 'text', 'yeniden tanımlıyoruz', 2),
  ('learning-platform', 'hero_description', 'text', 'Öğrenciler, veliler ve eğitmenler için özel tasarlanmış, modern ve kullanıcı dostu dijital öğrenme platformu', 3),
  ('learning-platform', 'students_title', 'text', 'Öğrenciler İçin', 4),
  ('learning-platform', 'students_description', 'text', 'Eğlenceli ve etkileşimli öğrenme deneyimi', 5),
  ('learning-platform', 'parents_title', 'text', 'Veliler İçin', 6),
  ('learning-platform', 'parents_description', 'text', 'Çocuğunuzun gelişimini yakından takip edin', 7),
  ('learning-platform', 'instructors_title', 'text', 'Eğitmenler İçin', 8),
  ('learning-platform', 'instructors_description', 'text', 'Profesyonel araçlarla eğitim yönetimi', 9),
  ('learning-platform', 'security_title', 'text', 'Güvenlik ve Gizlilik Önceliğimiz', 10),
  ('learning-platform', 'security_description', 'text', 'KVKK uyumlu, SSL şifreli ve güvenli bir platform. Çocuklarınızın ve verilerinizin güvenliği bizim için en önemli öncelik.', 11);
