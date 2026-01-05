/*
  # Update "Ebeveynler için Online İngilizce" Content
  
  1. Updates
    - Title, Description, Price, Duration based on user feedback
    - Adds specific metadata for 2 pricing options (12 vs 24 lessons)
    - Updates features list exactly as requested
  
  2. Content
    - 12 Lessons: 12.000 TL
    - 24 Lessons: 20.000 TL
    - Start Date: 10 Jan 2026
*/

-- Update main program details
UPDATE programs SET
  title = 'Ebeveynler için Online İngilizce Eğitimi',
  description = 'Çocuğum ile Evde İngilizce konuşmak istiyorum ama kendini yetersiz hissediyorum diyorsanız, çocuğunuzun ikinci dil gelişimi için kendinizi geliştirmek istiyorsanız bu eğitim içeriği GONCA YOLDAŞ tarafından sizin için hazırlandı. Aramıza katılarak yapacağımız canlı derslerde İngilizcenizi geliştirebilirsiniz.' || E'\n\n' || 'Kimler Katılabilir?' || E'\n' || 'İngilizcesi başlangıç ve orta seviye olan, doğru bir temel ile İngilizce öğretmek, günlük dilde kendini geliştirmek isteyen ve çocuğuna faydalı olmak isteyen ebeveynler ve yetişkinler katılabilir.',
  price = 12000,
  duration = '12 Hafta',
  schedule = 'Haftada 1 veya 2 Ders Seçeneği',
  lessons_per_week = 2,
  lesson_duration = '50 dakika',
  max_students = 5,
  metadata = '{
    "instructor": "Gonca Yoldaş",
    "start_date": "2026-01-10",
    "parent_only": true,
    "recording_access": "Kayıt alınacaktır",
    "installments": [3, 6, 9],
    "pricing_options": [
      {
        "id": "opt_12_lessons",
        "title": "12 Derslik Eğitim",
        "price": 12000,
        "description": "12 Haftalık Program - Haftada 1 Ders",
        "details": [
          "Süre: 50 dk/ders",
          "Gün: Pazar",
          "Saat: 21.45",
          "Toplam 12 Hafta"
        ]
      },
      {
        "id": "opt_24_lessons",
        "title": "24 Derslik Eğitim",
        "price": 20000,
        "description": "12 Haftalık Program - Haftada 2 Ders",
        "details": [
          "Süre: 50 dk/ders",
          "Günler: Salı ve Cuma",
          "Saat: 20.50 (Başlangıç) / 21.45 (Orta)",
          "Toplam 12 Hafta"
        ]
      }
    ]
  }'::jsonb
WHERE slug = 'ebeveynler-icin-online-ingilizce';

-- Clear existing features to replace with correct ones
DELETE FROM program_features 
WHERE program_id = (SELECT id FROM programs WHERE slug = 'ebeveynler-icin-online-ingilizce');

-- Insert correct features
INSERT INTO program_features (program_id, feature_text, feature_type, sort_order)
SELECT (SELECT id FROM programs WHERE slug = 'ebeveynler-icin-online-ingilizce'), t.feature, 'feature', t.sort_order
FROM unnest(ARRAY[
  'Derslerimiz temel seviye İngilizce öğrenmek isteyen, kendini İngilizcede geliştirmek isteyen ebeveynler için hazırlanmıştır.',
  'Eğitim 10 Ocak''ta başlayacaktır.',
  'Haftada 1 ve 2 ders olmak üzere 2 seçenek mevcuttur.',
  'Derslerimiz 50 dakikadır, zoom''dan canlı olarak yapılır.',
  '2 farklı seviye grubu olacaktır. (Temel seviye ve orta seviye)',
  'Derslerimiz 5 kişilik sınıflarda işlenecektir.',
  'Katılamadığınız dersler için kayıt alınacaktır.',
  'Dersler konuşma ve günlük dil üzerinedir.'
]) WITH ORDINALITY AS t(feature, sort_order);

-- Clear existing FAQs
DELETE FROM program_faqs 
WHERE program_id = (SELECT id FROM programs WHERE slug = 'ebeveynler-icin-online-ingilizce');

-- Insert relevant FAQs based on the text
INSERT INTO program_faqs (program_id, question, answer, sort_order)
SELECT (SELECT id FROM programs WHERE slug = 'ebeveynler-icin-online-ingilizce'), t.question, t.answer, t.sort_order
FROM unnest(
  ARRAY[
    'Kimler katılabilir?',
    'Dersleri kaçırırsam ne olur?',
    'Ödeme seçenekleri nelerdir?'
  ],
  ARRAY[
    'İngilizcesi başlangıç ve orta seviye olan, doğru bir temel ile İngilizce öğretmek, günlük dilde kendini geliştirmek isteyen ve çocuğuna faydalı olmak isteyen ebeveynler ve yetişkinler katılabilir.',
    'Katılamadığınız dersler için kayıt alınacaktır, sonradan izleyebilirsiniz.',
    'Kredi kartına 3, 6 ve 9 taksit imkanı mevcuttur. Fiyatlara KDV dahildir.'
  ]
) WITH ORDINALITY AS t(question, answer, sort_order);
