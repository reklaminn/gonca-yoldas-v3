/*
  # Add About Page Content to Database
  
  1. Changes
    - Insert all About page sections into page_content table
    - Includes hero, bio, credentials, programs, stats, and CTA sections
    - Preserves existing content structure
*/

-- Delete existing about page content to avoid conflicts
DELETE FROM page_content WHERE page_key = 'about';

-- Hero Section
INSERT INTO page_content (page_key, section_key, content_type, content_value, display_order, is_active) VALUES
  ('about', 'hero_name', 'text', 'Gonca Yoldaş', 1, true),
  ('about', 'hero_titles', 'json', '["İngilizce Öğretmeni","Dil Bilimci","Eğitmen","Çift Dilli Eğitim Uzmanı"]', 2, true),
  ('about', 'hero_quote', 'text', 'Çift dilli çocuk yetiştirmek hayal değil!', 3, true);

-- Bio Section
INSERT INTO page_content (page_key, section_key, content_type, content_value, display_order, is_active) VALUES
  ('about', 'bio_paragraph_1', 'rich_text', 'Gonca Yoldaş, Selçuk Üniversitesi İngiliz Dili ve Edebiyatı bölümünden mezun olduktan sonra aynı üniversitenin Eğitim Fakültesi''nde öğretmenlik formasyonunu tamamlamıştır. İngilizce öğretmeni, dil bilimci ve eğitmen olarak; özellikle erken yaşta İngilizce öğretimi, ikinci dil edinimi ve çift dilli eğitim üzerine uzmanlaşmıştır.', 4, true),
  ('about', 'bio_paragraph_2', 'rich_text', 'Uluslararası geçerliliği olan TEFL (Teaching English as a Foreign Language) sertifikasına ve British Council''ın "English in Early Childhood: Language Learning and Development" eğitimine sahiptir. Okul öncesi ve ilkokul düzeyinde uzun yıllar öğretmenlik yapmış, 0–10 yaş arası çocuklara yönelik İngilizce eğitimi konusunda kapsamlı deneyim kazanmıştır.', 5, true);

-- Credentials Section
INSERT INTO page_content (page_key, section_key, content_type, content_value, display_order, is_active) VALUES
  ('about', 'credentials_title', 'text', 'Eğitim ve Sertifikalar', 6, true),
  ('about', 'credentials_academic', 'json', '{"title":"Akademik Eğitim","items":["Selçuk Üniversitesi - İngiliz Dili ve Edebiyatı","Eğitim Fakültesi - Öğretmenlik Formasyonu"]}', 7, true),
  ('about', 'credentials_certificates', 'json', '{"title":"Sertifikalar","items":["TEFL (Teaching English as a Foreign Language)","British Council - English in Early Childhood"]}', 8, true),
  ('about', 'credentials_expertise', 'json', '{"title":"Uzmanlık Alanları","items":["Erken Yaşta İngilizce Öğretimi","İkinci Dil Edinimi","Çift Dilli Eğitim"]}', 9, true);

-- Bilingual Education Journey
INSERT INTO page_content (page_key, section_key, content_type, content_value, display_order, is_active) VALUES
  ('about', 'bilingual_title', 'text', 'Çift Dilli Eğitim ve Ebeveyn Rehberliği', 10, true),
  ('about', 'bilingual_paragraph_1', 'rich_text', 'Kendi çift dilli çocuk yetiştirme yolculuğuna 2014 yılında iki çocuğunu Türkçe ve İngilizce çift dilli yetiştirerek başlayan Gonca Yoldaş, son 12 yıldır erken yaşta ikinci dil edinimi üzerine çalışmalar yürütmektedir.', 11, true),
  ('about', 'bilingual_paragraph_2', 'rich_text', 'Bu alandaki bilgi ve deneyimlerini çocuklarına İngilizce öğretmek isteyen ailelerle, binlerce ebeveyne ve eğitimciye ilham olan <a href="https://instagram.com/cocugumaingilizceogretiyorum" target="_blank" rel="noopener noreferrer" class="text-[var(--color-primary)] hover:underline font-semibold">@cocugumaingilizceogretiyorum</a> Instagram hesabı üzerinden paylaşmaktadır.', 12, true);

-- Parent Programs
INSERT INTO page_content (page_key, section_key, content_type, content_value, display_order, is_active) VALUES
  ('about', 'parent_programs_title', 'text', 'Ebeveynler İçin Programlar', 13, true),
  ('about', 'parent_programs_subtitle', 'text', 'Evde İngilizce konuşmak isteyen ebeveynler için özel olarak geliştirilmiş çift dilli eğitimler', 14, true),
  ('about', 'parent_program_0_2', 'json', '{"age":"0-2 Yaş","title":"Bebeğimle Evde İngilizce","description":"Bebeklerle İngilizce iletişim kurmak isteyen ebeveynler için özel program","color":"from-pink-500 to-rose-500","features":["Günlük İngilizce cümleler","Yaşa uygun oyunlar ve şarkılar","Kitap önerileri ve sesli kaynaklar","Çift dillilik rehberliği"]}', 15, true),
  ('about', 'parent_program_2_5', 'json', '{"age":"2-5 Yaş","title":"Çocuğumla Evde İngilizce","description":"Okul öncesi dönemde çift dilli yetiştirmek isteyen aileler için","color":"from-blue-500 to-cyan-500","features":["Haftalık İngilizce aktiviteler","Oyun temelli öğrenme","Planlama ve sürdürülebilirlik desteği","Ebeveyn-çocuk etkileşim stratejileri"]}', 16, true);

-- Children's Course
INSERT INTO page_content (page_key, section_key, content_type, content_value, display_order, is_active) VALUES
  ('about', 'children_course_title', 'text', 'Çocuklar İçin Online Kurslar', 17, true),
  ('about', 'children_course', 'json', '{"age":"6-10 Yaş","title":"Online İngilizce Kursları","description":"Konuşma odaklı, Phonics temelli İngilizce eğitimi","color":"from-purple-500 to-indigo-500","features":["Phonics temelli doğru telaffuz","İlk dersten itibaren konuşma pratiği","Okuma-yazma becerileri","Özgüvenli İngilizce kullanımı"]}', 18, true);

-- Institutional Services
INSERT INTO page_content (page_key, section_key, content_type, content_value, display_order, is_active) VALUES
  ('about', 'institutional_title', 'text', 'Okul ve Kurumlar İçin Danışmanlık', 19, true),
  ('about', 'institutional_subtitle', 'text', 'Anaokulları ve ilkokullar için profesyonel destek hizmetleri', 20, true),
  ('about', 'institutional_services', 'json', '[{"title":"Müfredat Danışmanlığı","description":"Anaokulları ve ilkokullar için İngilizce müfredat geliştirme"},{"title":"Öğretmen Eğitimleri","description":"Profesyonel gelişim atölyeleri ve eğitim programları"},{"title":"Veli Seminerleri","description":"Çift dilli eğitim ve aile desteği bilgilendirmeleri"},{"title":"İçerik Geliştirme","description":"Kuruma özel eğitim materyalleri ve uygulama desteği"}]', 21, true);

-- Stats
INSERT INTO page_content (page_key, section_key, content_type, content_value, display_order, is_active) VALUES
  ('about', 'stats', 'json', '[{"number":"12+","label":"Yıl Deneyim"},{"number":"1000+","label":"Mutlu Aile"},{"number":"4","label":"Yaş Grubu"},{"number":"100%","label":"Memnuniyet"}]', 22, true);

-- CTA Section
INSERT INTO page_content (page_key, section_key, content_type, content_value, display_order, is_active) VALUES
  ('about', 'cta_title', 'text', 'Bize Katılın', 23, true),
  ('about', 'cta_description', 'text', 'Çocuğunuzun İngilizce öğrenme yolculuğunda yanınızdayız', 24, true);
