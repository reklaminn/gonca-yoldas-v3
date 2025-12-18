/*
  # Add "Çocuğumla Evde İngilizce Programı"
  
  1. Insert new program with all details
  2. Add program features
  3. Add program outcomes
  4. Add program FAQs
*/

-- Insert the new program
INSERT INTO programs (
  slug,
  title,
  short_title,
  title_en,
  age_group,
  age_range,
  description,
  price,
  duration,
  schedule,
  lessons_per_week,
  lesson_duration,
  max_students,
  status,
  featured,
  sort_order,
  metadata
) VALUES (
  'cocugumla-evde-ingilizce-programi',
  'Çocuğumla Evde İngilizce Programı',
  'Ebeveyn İngilizce',
  'English at Home with My Child Program',
  '2-5',
  '2-5 Yaş',
  'Çocuğunuza İngilizce öğretmek istiyorsunuz ama nereden başlayacağınızı bilmiyor musunuz? İngilizce sizin de ana diliniz değil mi? O halde bu program tam size göre! "Çocuğumla Evde İngilizce", 2–5 yaş arası çocuğu olan ebeveynler için özel olarak tasarlanmış, online yürütülen bir İngilizce gelişim ve rehberlik programıdır.',
  12000,
  '12 hafta (3 ay)',
  'Her Pazartesi, saat 22:00',
  1,
  '45-60 dakika',
  20,
  'active',
  true,
  0,
  jsonb_build_object(
    'instructor', 'Gonca Yoldaş',
    'start_date', '2026-01-05',
    'platform', 'Zoom',
    'recording_access', '6 ay',
    'whatsapp_group', true,
    'parent_only', true,
    'installments', jsonb_build_array(3, 6, 9),
    'limited_capacity', true
  )
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  duration = EXCLUDED.duration,
  schedule = EXCLUDED.schedule,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- Add program features
INSERT INTO program_features (program_id, feature_text, feature_type, sort_order)
SELECT 
  p.id,
  feature,
  'feature',
  row_number() OVER () - 1
FROM programs p,
LATERAL (
  VALUES
    ('Her hafta yeni bir İngilizce konu'),
    ('Günlük cümleler ve ifadeler (Türkçe açıklamalı + ses dosyalı)'),
    ('Konuyu çocuğa öğretme yöntemleri'),
    ('İlgili oyunlar, şarkılar ve kitap önerileri'),
    ('Gonca Yoldaş tarafından seslendirilen haftalık hikâye kitabı'),
    ('Mini Gramer Köşesi: Haftalık temel dilbilgisi ipuçları'),
    ('Çift Dilli Çocuklar Köşesi: Yöntem, motivasyon ve örnekler'),
    ('Haftalık içerik, döküman ve materyaller'),
    ('Her görüşmenin kaydı sisteme yüklenir ve 6 ay boyunca izlenebilir'),
    ('İletişim ve destek için WhatsApp grubu')
) AS t(feature)
WHERE p.slug = 'cocugumla-evde-ingilizce-programi'
ON CONFLICT DO NOTHING;

-- Add program outcomes
INSERT INTO program_features (program_id, feature_text, feature_type, sort_order)
SELECT 
  p.id,
  outcome,
  'outcome',
  row_number() OVER () - 1
FROM programs p,
LATERAL (
  VALUES
    ('Türkiye''de ebeveyn odaklı ilk İngilizce gelişim programı'),
    ('Anadil ortamı olmayan bir ülkede İngilizceyi evde öğretmenin mümkün olduğunu gösterir'),
    ('Ebeveynlere adım adım rehberlik eder'),
    ('Hem çocuk hem ebeveyn İngilizce gelişir'),
    ('Kitaplarda olmayan günlük hayatta kullanılan ifadeler öğrenilir'),
    ('Çocuğunuza doğru yöntemlerle İngilizce öğretme becerisi kazanırsınız'),
    ('Günlük dile odaklanarak çocuğunuzla İngilizce iletişim kurarsınız')
) AS t(outcome)
WHERE p.slug = 'cocugumla-evde-ingilizce-programi'
ON CONFLICT DO NOTHING;

-- Add program FAQs
INSERT INTO program_faqs (program_id, question, answer, sort_order)
SELECT 
  p.id,
  question,
  answer,
  row_number() OVER () - 1
FROM programs p,
LATERAL (
  VALUES
    (
      'Kimler bu programa katılabilir?',
      '2–5 yaş arası çocuğu olan, başlangıç, orta ya da ileri düzey İngilizce bilen, çocuğuna İngilizce öğretmek veya çift dilli yetiştirmek isteyen tüm ebeveynler katılabilir.'
    ),
    (
      'Çocuğum da derse katılacak mı?',
      'Hayır, bu program sadece ebeveynler içindir. Çocuklu katılım yoktur. Ebeveynler öğrendiklerini evde çocuklarıyla uygularlar.'
    ),
    (
      'İngilizcem çok iyi değil, katılabilir miyim?',
      'Evet! Program başlangıç, orta ve ileri düzey tüm ebeveynler için uygundur. Türkçe açıklamalar ve ses dosyaları ile desteklenir.'
    ),
    (
      'Derslerin kaydı olacak mı?',
      'Evet, her görüşmenin kaydı sisteme yüklenir ve 6 ay boyunca izlenebilir. Canlı katılamazsanız kayıtlardan takip edebilirsiniz.'
    ),
    (
      'Taksit imkanı var mı?',
      'Evet, kredi kartına 3, 6 ve 9 taksit seçenekleri mevcuttur.'
    ),
    (
      'Program ne zaman başlıyor?',
      'Program 5 Ocak 2026 tarihinde başlayacaktır. Her Pazartesi saat 22:00''de Zoom üzerinden canlı olarak gerçekleştirilecektir.'
    ),
    (
      'Kontenjan sınırlı mı?',
      'Evet, program sınırlı sayıda kontenjan ile yürütülmektedir. Erken kayıt önerilir.'
    )
) AS t(question, answer)
WHERE p.slug = 'cocugumla-evde-ingilizce-programi'
ON CONFLICT DO NOTHING;
