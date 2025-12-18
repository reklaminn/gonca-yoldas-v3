/*
  # Programs Management System

  1. New Tables
    - `programs` - Educational programs with all details
    - `program_features` - Program features/benefits
    - `program_faqs` - Program FAQs
  
  2. Storage
    - `program-images` bucket for program images
  
  3. Security
    - Enable RLS on all tables
    - Public read access
    - Admin-only write access
*/

-- =====================================================
-- 1. PROGRAMS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  short_title text NOT NULL,
  title_en text,
  age_group text NOT NULL CHECK (age_group IN ('0-2', '2-5', '5-10')),
  age_range text NOT NULL,
  description text NOT NULL,
  image_url text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  duration text NOT NULL,
  schedule text NOT NULL,
  lessons_per_week integer NOT NULL DEFAULT 2,
  lesson_duration text NOT NULL,
  max_students integer NOT NULL DEFAULT 10,
  enrolled_students integer DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'archived')),
  featured boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_programs_slug ON programs(slug);
CREATE INDEX IF NOT EXISTS idx_programs_age_group ON programs(age_group);
CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(status);
CREATE INDEX IF NOT EXISTS idx_programs_featured ON programs(featured);
CREATE INDEX IF NOT EXISTS idx_programs_sort_order ON programs(sort_order);

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- Public can read active programs
CREATE POLICY "Public can read active programs"
  ON programs
  FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

-- Admins can manage all programs
CREATE POLICY "Admins can manage programs"
  ON programs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- 2. PROGRAM FEATURES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS program_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES programs(id) ON DELETE CASCADE NOT NULL,
  feature_text text NOT NULL,
  feature_type text DEFAULT 'feature' CHECK (feature_type IN ('feature', 'outcome')),
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_program_features_program_id ON program_features(program_id);
CREATE INDEX IF NOT EXISTS idx_program_features_type ON program_features(feature_type);

ALTER TABLE program_features ENABLE ROW LEVEL SECURITY;

-- Public can read features of active programs
CREATE POLICY "Public can read program features"
  ON program_features
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM programs
      WHERE programs.id = program_features.program_id
      AND programs.status = 'active'
    )
  );

-- Admins can manage features
CREATE POLICY "Admins can manage features"
  ON program_features
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- 3. PROGRAM FAQS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS program_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES programs(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_program_faqs_program_id ON program_faqs(program_id);

ALTER TABLE program_faqs ENABLE ROW LEVEL SECURITY;

-- Public can read FAQs of active programs
CREATE POLICY "Public can read program faqs"
  ON program_faqs
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM programs
      WHERE programs.id = program_faqs.program_id
      AND programs.status = 'active'
    )
  );

-- Admins can manage FAQs
CREATE POLICY "Admins can manage faqs"
  ON program_faqs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- 4. HELPER FUNCTIONS
-- =====================================================

-- Get program with all related data
CREATE OR REPLACE FUNCTION get_program_details(program_slug text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'program', row_to_json(p.*),
    'features', (
      SELECT jsonb_agg(row_to_json(f.*) ORDER BY f.sort_order)
      FROM program_features f
      WHERE f.program_id = p.id AND f.feature_type = 'feature'
    ),
    'outcomes', (
      SELECT jsonb_agg(row_to_json(o.*) ORDER BY o.sort_order)
      FROM program_features o
      WHERE o.program_id = p.id AND o.feature_type = 'outcome'
    ),
    'faqs', (
      SELECT jsonb_agg(row_to_json(faq.*) ORDER BY faq.sort_order)
      FROM program_faqs faq
      WHERE faq.program_id = p.id
    )
  ) INTO result
  FROM programs p
  WHERE p.slug = program_slug AND p.status = 'active';

  RETURN result;
END;
$$;

-- Update program updated_at timestamp
CREATE OR REPLACE FUNCTION update_program_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$;

CREATE TRIGGER programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW
  EXECUTE FUNCTION update_program_timestamp();

-- =====================================================
-- 5. SEED DATA (Initial Programs)
-- =====================================================

-- Insert default programs
INSERT INTO programs (
  slug, title, short_title, title_en, age_group, age_range,
  description, price, duration, schedule, lessons_per_week,
  lesson_duration, max_students, status, featured, sort_order
) VALUES
  (
    'bebeğimle-evde-ingilizce',
    'Bebeğimle Evde İngilizce',
    'Baby English',
    'Baby English at Home',
    '0-2',
    '0-2 Yaş',
    'Bebekler için özel tasarlanmış, bilimsel yöntemlerle desteklenen İngilizce edinim programı. Anne-baba katılımlı, müzik ve ritim temelli öğrenme.',
    2500,
    '12 hafta',
    'Haftada 2 ders, 30 dakika',
    2,
    '30 dakika',
    6,
    'active',
    true,
    1
  ),
  (
    'çocuğumla-evde-ingilizce',
    'Çocuğumla Evde İngilizce',
    'Toddler English',
    'English at Home with My Child',
    '2-5',
    '2-5 Yaş',
    'Okul öncesi çocuklar için oyun temelli, etkileşimli İngilizce öğrenme programı. Hikaye anlatımı ve drama aktiviteleri ile desteklenir.',
    3200,
    '16 hafta',
    'Haftada 3 ders, 40 dakika',
    3,
    '40 dakika',
    8,
    'active',
    true,
    2
  ),
  (
    'çocuklar-için-online-ingilizce',
    'Çocuklar için Online İngilizce',
    'Kids English',
    'Online English for Kids',
    '5-10',
    '5-10 Yaş',
    'İlkokul çağı çocuklar için kapsamlı, müfredat destekli İngilizce programı. Okuma-yazma becerileri ve proje tabanlı öğrenme.',
    4500,
    '24 hafta',
    'Haftada 3 ders, 50 dakika',
    3,
    '50 dakika',
    10,
    'active',
    true,
    3
  )
ON CONFLICT (slug) DO NOTHING;

-- Insert features for Baby English
INSERT INTO program_features (program_id, feature_text, feature_type, sort_order)
SELECT id, feature, 'feature', sort_order
FROM programs, 
  unnest(ARRAY[
    'Anne-baba katılımlı online dersler',
    'Müzik ve ritim temelli öğrenme',
    'Dijital materyal paketi',
    'Haftalık ilerleme raporları'
  ]) WITH ORDINALITY AS t(feature, sort_order)
WHERE slug = 'bebeğimle-evde-ingilizce';

INSERT INTO program_features (program_id, feature_text, feature_type, sort_order)
SELECT id, outcome, 'outcome', sort_order
FROM programs,
  unnest(ARRAY[
    'Temel İngilizce seslere aşinalık kazanır',
    'Basit kelimeleri tanır ve tepki verir',
    'Müzik ve ritim yoluyla dil gelişimi desteklenir',
    'Anne-baba ile birlikte öğrenme alışkanlığı kazanır',
    'Sosyal etkileşim becerileri gelişir'
  ]) WITH ORDINALITY AS t(outcome, sort_order)
WHERE slug = 'bebeğimle-evde-ingilizce';

-- Insert FAQs for Baby English
INSERT INTO program_faqs (program_id, question, answer, sort_order)
SELECT id, question, answer, sort_order
FROM programs,
  unnest(
    ARRAY[
      'Bebeğim çok küçük, İngilizce öğrenebilir mi?',
      'Dersler nasıl işleniyor?',
      'Materyaller dahil mi?'
    ],
    ARRAY[
      '0-2 yaş arası bebekler dil öğrenimine en açık dönemdedir. Programımız, bebeğinizin doğal öğrenme kapasitesini destekleyecek şekilde tasarlanmıştır.',
      'Online derslerimiz interaktif, oyun temelli ve müzik eşliğinde gerçekleşir. Anne-baba katılımı zorunludur ve evde uygulayabileceğiniz aktiviteler paylaşılır.',
      'Evet, tüm dijital materyaller, şarkılar ve aktivite kılavuzları programa dahildir.'
    ]
  ) WITH ORDINALITY AS t(question, answer, sort_order)
WHERE slug = 'bebeğimle-evde-ingilizce';

-- Repeat for other programs...
INSERT INTO program_features (program_id, feature_text, feature_type, sort_order)
SELECT id, feature, 'feature', sort_order
FROM programs, 
  unnest(ARRAY[
    'Oyun temelli öğrenme metodolojisi',
    'Hikaye anlatımı ve drama aktiviteleri',
    'Dijital ve fiziksel materyal paketi',
    'Aylık gelişim değerlendirmeleri'
  ]) WITH ORDINALITY AS t(feature, sort_order)
WHERE slug = 'çocuğumla-evde-ingilizce';

INSERT INTO program_features (program_id, feature_text, feature_type, sort_order)
SELECT id, outcome, 'outcome', sort_order
FROM programs,
  unnest(ARRAY[
    'Temel kelime dağarcığı oluşturur (100+ kelime)',
    'Basit cümleler kurar ve anlar',
    'Günlük rutinlerde İngilizce kullanır',
    'Özgüven ve iletişim becerileri gelişir',
    'Okuma-yazmaya hazırlık kazanır'
  ]) WITH ORDINALITY AS t(outcome, sort_order)
WHERE slug = 'çocuğumla-evde-ingilizce';

INSERT INTO program_features (program_id, feature_text, feature_type, sort_order)
SELECT id, feature, 'feature', sort_order
FROM programs, 
  unnest(ARRAY[
    'Müfredat destekli kapsamlı program',
    'Okuma-yazma becerileri geliştirme',
    'Proje tabanlı öğrenme',
    'Sertifikalı eğitmenler',
    'Çevrimiçi öğrenme platformu'
  ]) WITH ORDINALITY AS t(feature, sort_order)
WHERE slug = 'çocuklar-için-online-ingilizce';

INSERT INTO program_features (program_id, feature_text, feature_type, sort_order)
SELECT id, outcome, 'outcome', sort_order
FROM programs,
  unnest(ARRAY[
    'Akıcı okuma ve yazma becerileri kazanır',
    'Günlük konuşmalarda rahatça İngilizce kullanır',
    'Temel gramer yapılarını öğrenir',
    'Sunum ve proje hazırlama becerileri gelişir',
    'Uluslararası sınavlara hazırlık kazanır'
  ]) WITH ORDINALITY AS t(outcome, sort_order)
WHERE slug = 'çocuklar-için-online-ingilizce';
