/*
  # Duyuru Sistemini Çoklu Yapıya Geçirme
  
  1. Changes
    - `announcement_text` anahtarını `announcements` olarak değiştiriyoruz.
    - Veri tipini JSON listesi olarak güncelliyoruz.
*/

-- Eski veriyi temizle veya güncelle
DELETE FROM page_content WHERE page_key = 'global' AND section_key = 'announcement_text';

-- Yeni JSON yapısını ekle
INSERT INTO page_content (page_key, section_key, content_type, content_value, display_order, is_active)
VALUES 
  ('global', 'announcements', 'json', '["🎉 Yeni programlarımız yayında! İlk kayıt olanlara %20 indirim", "📚 Ücretsiz deneme dersleri için hemen randevu alın", "🌟 Uzman eğitmen kadromuzla tanışın"]', 1, true)
ON CONFLICT (page_key, section_key, content_type) DO NOTHING;
