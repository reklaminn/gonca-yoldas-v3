/*
  # Add "Ebeveynler için Online İngilizce" Program
  
  1. New Program
    - Title: Ebeveynler için Online İngilizce
    - Slug: ebeveynler-icin-online-ingilizce
    - Target: Parents (Adults)
  
  2. Content
    - Features: Speaking focus, daily dialogues, strategies for kids
    - Outcomes: Fluency, confidence, supporting children
    - FAQs: Level requirements, schedule, materials
*/

-- Insert the program
INSERT INTO programs (
  slug,
  title,
  short_title,
  title_en,
  age_group,
  age_range,
  description,
  image_url,
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
  'ebeveynler-icin-online-ingilizce',
  'Ebeveynler için Online İngilizce',
  'Parents English',
  'Online English for Parents',
  'Ebeveyn',
  'Yetişkin',
  'Çocuğunuzun İngilizce öğrenme sürecine bilinçli bir şekilde destek olmak, evde İngilizce konuşulan zamanlar yaratmak ve kendi dil becerilerinizi geliştirmek için tasarlanmış özel program.',
  'https://images.pexels.com/photos/3769981/pexels-photo-3769981.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  3500,
  '12 hafta',
  'Haftada 2 ders, 40 dakika',
  2,
  '40 dakika',
  6,
  'active',
  true,
  4,
  '{"instructor": "Uzman Eğitmen Kadrosu", "start_date": "2024-03-01", "parent_only": true}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  status = 'active';

-- Insert Features
INSERT INTO program_features (program_id, feature_text, feature_type, sort_order)
SELECT programs.id, t.feature, 'feature', t.sort_order
FROM programs,
  unnest(ARRAY[
    'Konuşma odaklı interaktif dersler',
    'Günlük hayattan pratik diyaloglar',
    'Çocuklarla İngilizce iletişim stratejileri',
    'Evde uygulanabilir oyun ve aktivite önerileri',
    'Kişiselleştirilmiş geri bildirimler'
  ]) WITH ORDINALITY AS t(feature, sort_order)
WHERE programs.slug = 'ebeveynler-icin-online-ingilizce'
ON CONFLICT DO NOTHING;

-- Insert Outcomes
INSERT INTO program_features (program_id, feature_text, feature_type, sort_order)
SELECT programs.id, t.outcome, 'outcome', t.sort_order
FROM programs,
  unnest(ARRAY[
    'Günlük konuşmalarda akıcılık ve özgüven kazanma',
    'Çocuğunuzla İngilizce oyun oynama becerisi',
    'İngilizce hikaye okuma teknikleri',
    'Doğru telaffuz ve tonlama',
    'Çocuğunuzun dil gelişimini takip edebilme'
  ]) WITH ORDINALITY AS t(outcome, sort_order)
WHERE programs.slug = 'ebeveynler-icin-online-ingilizce'
ON CONFLICT DO NOTHING;

-- Insert FAQs
INSERT INTO program_faqs (program_id, question, answer, sort_order)
SELECT programs.id, t.question, t.answer, t.sort_order
FROM programs,
  unnest(
    ARRAY[
      'İngilizce seviyem başlangıç düzeyinde, katılabilir miyim?',
      'Dersler nasıl işleniyor?',
      'Çocuğumla birlikte mi katılacağım?'
    ],
    ARRAY[
      'Evet, sınıflarımız seviyelere göre (Başlangıç, Orta, İleri) oluşturulmaktadır. Seviye tespit sınavı sonrası size en uygun gruba yerleştirilirsiniz.',
      'Derslerimiz Zoom üzerinden canlı ve interaktif olarak işlenir. Gramer ezberi yerine konuşma pratiği ve gerçek hayat senaryoları üzerine odaklanılır.',
      'Hayır, bu program sadece ebeveynlere yöneliktir. Ancak derslerde öğrendiğiniz teknikleri ve oyunları ders dışı zamanlarda çocuğunuzla uygulamanız hedeflenir.'
    ]
  ) WITH ORDINALITY AS t(question, answer, sort_order)
WHERE programs.slug = 'ebeveynler-icin-online-ingilizce'
ON CONFLICT DO NOTHING;
