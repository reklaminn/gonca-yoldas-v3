/*
  # Add "Bebeğimle Evde İngilizce Programı"
  
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
  'bebegimle-evde-ingilizce-programi',
  'Bebeğimle Evde İngilizce Programı',
  'Baby English',
  'English at Home with My Baby Program',
  '0-2',
  '0-2 Yaş',
  'Bebeğinize İngilizce öğretmek istiyor ama nereden başlayacağınızı bilmiyor musunuz? Anadiliniz İngilizce değil mi? İngilizce konuşulan bir ülkede yaşamıyorsanız bile çift dilli çocuk yetiştirmek mümkün! "Bebeğimle Evde İngilizce", 0–2 yaş arası bebeği olan ebeveynler için özel olarak tasarlanmış bir çevrim içi programdır.',
  12000,
  '12 hafta',
  'Her Perşembe, saat 22:00',
  1,
  '45-60 dakika',
  20,
  'active',
  true,
  1,
  jsonb_build_object(
    'instructor', 'Gonca Yoldaş',
    'start_date', '2026-01-08',
    'platform', 'Zoom',
    'recording_access', '6 ay',
    'whatsapp_group', true,
    'parent_only', true,
    'installments', jsonb_build_array(3, 6, 9),
    'limited_capacity', true,
    'subtitle', 'Bebekler İçin Çift Dilli Eğitim'
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
    ('Konuya uygun oyunlar, şarkılar ve kitap önerileri'),
    ('Gonca Yoldaş tarafından seslendirilen haftalık hikâye kitabı'),
    ('Mini Gramer Köşesi: Basit dil bilgisi açıklamaları ve örnekler'),
    ('Çift Dilli Bebekler Köşesi: Süreç, yöntem ve örnekler'),
    ('Haftalık içerik, döküman ve materyaller'),
    ('Her görüşmenin kaydı 6 ay boyunca erişilebilir'),
    ('İletişim ve destek için WhatsApp grubu'),
    ('Program sadece ebeveynler içindir – çocuklu katılım yoktur')
) AS t(feature)
WHERE p.slug = 'bebegimle-evde-ingilizce-programi'
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
    ('Türkiye''de ebeveyn-bebek odaklı ilk İngilizce gelişim programı'),
    ('Anadiliniz İngilizce olmasa bile çift dilli çocuk yetiştirmek mümkün'),
    ('Ebeveynlere bebekleriyle İngilizce konuşmak için günlük ifadeler'),
    ('Hem bebeğiniz hem siz günlük İngilizce becerilerinizi geliştirirsiniz'),
    ('İngilizceyi hayatınızın doğal bir parçası haline getirin'),
    ('Evde İngilizceyi keyifle ve doğru yöntemle kullanmayı öğrenin'),
    ('Çift dillilik sürecinde karşılaşabilecekleri durumlara yönelik rehberlik')
) AS t(outcome)
WHERE p.slug = 'bebegimle-evde-ingilizce-programi'
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
      '0–2 yaş arası bebeği olan, başlangıç, orta ya da ileri düzey İngilizce bilen, çocuğunu çift dilli yetiştirmek veya erken yaşta İngilizce öğretmek isteyen tüm ebeveynler katılabilir.'
    ),
    (
      'Bebeğim de derse katılacak mı?',
      'Hayır, bu program sadece ebeveynler içindir. Çocuklu katılım yoktur. Ebeveynler öğrendiklerini evde bebekleriyle uygularlar.'
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
      'Program 8 Ocak 2026 tarihinde başlayacaktır. Her Perşembe saat 22:00''de Zoom üzerinden canlı olarak gerçekleştirilecektir.'
    ),
    (
      'Kontenjan sınırlı mı?',
      'Evet, program sınırlı sayıda kontenjan ile yürütülmektedir. Erken kayıt önerilir.'
    ),
    (
      'Çift dilli çocuk yetiştirmek gerçekten mümkün mü?',
      'Evet! Anadiliniz İngilizce olmasa bile, doğru yöntemler ve tutarlı uygulama ile çift dilli çocuk yetiştirmek mümkündür. Program size bu konuda rehberlik edecektir.'
    )
) AS t(question, answer)
WHERE p.slug = 'bebegimle-evde-ingilizce-programi'
ON CONFLICT DO NOTHING;
