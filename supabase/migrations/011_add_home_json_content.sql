/*
  # Add JSON Content for Home Page Features and Testimonials
  
  1. Content
    - Add 'features_list' (json) to home page content
    - Add 'testimonials_list' (json) to home page content
*/

-- Insert Features List (JSON)
INSERT INTO page_content (page_key, section_key, content_type, content_value, display_order, is_active)
VALUES (
  'home',
  'features_list',
  'json',
  '[
    {
      "icon": "BookOpen",
      "title": "Kapsamlı Programlar",
      "description": "0-10 yaş arası her yaş grubuna özel tasarlanmış eğitim programları"
    },
    {
      "icon": "Users",
      "title": "Uzman Eğitmenler",
      "description": "Alanında uzman, deneyimli eğitmenlerle birebir eğitim"
    },
    {
      "icon": "Award",
      "title": "Sertifikalı Eğitim",
      "description": "Uluslararası geçerliliğe sahip sertifika programları"
    },
    {
      "icon": "TrendingUp",
      "title": "İlerleme Takibi",
      "description": "Çocuğunuzun gelişimini adım adım takip edin"
    }
  ]',
  8, -- Order after features_description
  true
)
ON CONFLICT (page_key, section_key, content_type) 
DO UPDATE SET content_value = EXCLUDED.content_value;

-- Insert Testimonials List (JSON)
INSERT INTO page_content (page_key, section_key, content_type, content_value, display_order, is_active)
VALUES (
  'home',
  'testimonials_list',
  'json',
  '[
    {
      "id": 1,
      "name": "Ayşe Yılmaz",
      "role": "Anne",
      "content": "Kızım 18 aylıkken başladık ve şimdi basit kelimeleri anlıyor. Harika bir program!",
      "rating": 5
    },
    {
      "id": 2,
      "name": "Mehmet Demir",
      "role": "Baba",
      "content": "Gonca Hanım çok profesyonel ve sabırlı. Oğlumuz dersleri çok seviyor.",
      "rating": 5
    },
    {
      "id": 3,
      "name": "Zeynep Kaya",
      "role": "Anne",
      "content": "Çocuğumun özgüveni arttı ve İngilizce konuşmaktan çekinmiyor artık.",
      "rating": 5
    }
  ]',
  10, -- Order after testimonials_title
  true
)
ON CONFLICT (page_key, section_key, content_type) 
DO UPDATE SET content_value = EXCLUDED.content_value;
