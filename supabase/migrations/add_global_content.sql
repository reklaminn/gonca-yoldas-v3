/*
  # Global İçerik ve Duyuru Bandı Eklenmesi
  
  1. New Content
    - `global` sayfa anahtarı ile tüm sitede geçerli ayarlar
    - `announcement_text`: Duyuru bandı metni
*/

-- Global içerik için varsayılan veriler
INSERT INTO page_content (page_key, section_key, content_type, content_value, display_order, is_active)
VALUES 
  ('global', 'announcement_text', 'text', '🎉 Yeni programlarımız yayında! İlk kayıt olanlara %20 indirim', 1, true)
ON CONFLICT (page_key, section_key, content_type) DO NOTHING;
