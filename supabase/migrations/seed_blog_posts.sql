/*
  # Seed Blog Posts
  1. Content: Adds 6 demo blog posts with rich content
  2. Relations: Automatically links to existing categories by slug
  3. Data: Includes views, read times, and publish dates
*/

WITH 
  cat_egitim AS (SELECT id FROM blog_categories WHERE slug = 'egitim' LIMIT 1),
  cat_gelisim AS (SELECT id FROM blog_categories WHERE slug = 'gelisim' LIMIT 1),
  cat_ebeveynlik AS (SELECT id FROM blog_categories WHERE slug = 'ebeveynlik' LIMIT 1),
  cat_ipuclari AS (SELECT id FROM blog_categories WHERE slug = 'ipuclari' LIMIT 1)

INSERT INTO blog_posts (
  title, 
  slug, 
  excerpt, 
  content, 
  image_url, 
  is_published, 
  is_featured, 
  views, 
  read_time, 
  author_name, 
  category_id, 
  created_at
)
VALUES
-- 1. Öne Çıkan Eğitim Yazısı
(
  'Çocuklara İngilizce Öğretmenin 5 Altın Kuralı',
  'cocuklara-ingilizce-ogretmenin-5-altin-kurali',
  'Erken yaşta dil öğreniminin önemi ve etkili yöntemler hakkında kapsamlı rehber. Bilimsel araştırmalarla desteklenen pratik önerilerle çocuğunuzun dil gelişimini destekleyin.',
  '<h2>Erken Yaşta Dil Öğrenimi Neden Önemli?</h2><p>Çocukların beyin gelişimi ilk 6 yılda muazzam bir hızla ilerler. Bu dönemde ikinci bir dil ile tanışmak, sadece dil becerilerini değil, bilişsel esnekliği ve problem çözme yeteneklerini de artırır.</p><h3>1. Oyunla Öğretin</h3><p>Çocuklar en iyi oyun oynarken öğrenirler. İngilizce kelimeleri kartlarla ezberletmek yerine, saklambaç oynarken sayıları İngilizce saymak veya renkleri oyuncaklar üzerinden anlatmak çok daha kalıcıdır.</p><h3>2. Rutinler Oluşturun</h3><p>Her gün belirli bir saati "İngilizce Saati" ilan edin. Bu sürede sadece İngilizce şarkılar dinleyin veya İngilizce çizgi filmler izleyin.</p>',
  'https://images.pexels.com/photos/8535214/pexels-photo-8535214.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  true,
  true,
  1250,
  '8 dakika',
  'Gonca Yoldaş',
  (SELECT id FROM cat_egitim),
  NOW() - INTERVAL '2 days'
),

-- 2. Gelişim Yazısı
(
  '0-2 Yaş Arası Bebeklerde Dil Gelişimi',
  '0-2-yas-arasi-bebeklerde-dil-gelisimi',
  'Bebeklik döneminde dil gelişimini desteklemenin yolları ve dikkat edilmesi gereken kritik dönemler.',
  '<h2>İlk Kelimeler Ne Zaman Gelir?</h2><p>Bebekler genellikle 12. ay civarında ilk anlamlı kelimelerini söylerler. Ancak dil gelişimi doğumla başlar. Bebeğinizle kurduğunuz göz teması, ona şarkılar söylemeniz ve çıkardığı seslere tepki vermeniz, konuşma öncesi becerilerin temelini oluşturur.</p>',
  'https://images.pexels.com/photos/3662632/pexels-photo-3662632.jpeg?auto=compress&cs=tinysrgb&w=600',
  true,
  false,
  850,
  '6 dakika',
  'Gonca Yoldaş',
  (SELECT id FROM cat_gelisim),
  NOW() - INTERVAL '5 days'
),

-- 3. İpuçları Yazısı
(
  'Evde İngilizce Pratiği İçin 10 Eğlenceli Aktivite',
  'evde-ingilizce-pratigi-icin-10-aktivite',
  'Çocuğunuzla evde yapabileceğiniz, hem eğlenceli hem de öğretici İngilizce aktiviteleri listesi.',
  '<h2>Mutfakta İngilizce</h2><p>Yemek yaparken malzemelerin İngilizce isimlerini söyleyin. "Give me the apple please" gibi basit komutlarla dili günlük hayata entegre edin.</p><h2>Şarkı ve Dans</h2><p>Hareketli İngilizce çocuk şarkıları ile dans etmek, kelimelerin hafızada yer etmesini kolaylaştırır.</p>',
  'https://images.pexels.com/photos/8535227/pexels-photo-8535227.jpeg?auto=compress&cs=tinysrgb&w=600',
  true,
  false,
  620,
  '4 dakika',
  'Gonca Yoldaş',
  (SELECT id FROM cat_ipuclari),
  NOW() - INTERVAL '1 week'
),

-- 4. Ebeveynlik Yazısı
(
  'Çocuklarda Motivasyonu Artırmanın Yolları',
  'cocuklarda-motivasyonu-artirmanin-yollari',
  'Öğrenme sürecinde çocuğunuzun motivasyonunu yüksek tutmak için ebeveynlere özel stratejiler.',
  '<h2>Süreci Övün, Sonucu Değil</h2><p>Çocuğunuzun aldığı nottan ziyade, o notu almak için gösterdiği çabayı takdir edin. "Çok zekisin" yerine "Çok çalıştın ve başardın" demek, gelişim odaklı bir zihniyet (growth mindset) oluşturur.</p>',
  'https://images.pexels.com/photos/8535209/pexels-photo-8535209.jpeg?auto=compress&cs=tinysrgb&w=600',
  true,
  false,
  940,
  '5 dakika',
  'Gonca Yoldaş',
  (SELECT id FROM cat_ebeveynlik),
  NOW() - INTERVAL '10 days'
),

-- 5. Taslak Yazı (Yayınlanmamış)
(
  'İki Dilli Çocuklarda Okuma Alışkanlığı',
  'iki-dilli-cocuklarda-okuma-aliskanligi',
  'Farklı dillerde kitap okuma alışkanlığı kazandırmak için ipuçları.',
  'Taslak içerik...',
  'https://images.pexels.com/photos/3662667/pexels-photo-3662667.jpeg?auto=compress&cs=tinysrgb&w=600',
  false,
  false,
  0,
  '3 dakika',
  'Gonca Yoldaş',
  (SELECT id FROM cat_egitim),
  NOW()
),

-- 6. Popüler Gelişim Yazısı
(
  'Oyun Temelli Öğrenme Nedir?',
  'oyun-temelli-ogrenme-nedir',
  'Çocukların en doğal öğrenme aracı olan oyunun eğitimdeki yeri ve önemi.',
  '<h2>Oyun Ciddi Bir İştir</h2><p>Maria Montessori''nin dediği gibi, "Oyun çocuğun işidir." Oyun sırasında çocuklar kuralları öğrenir, sosyal beceriler geliştirir ve hayal güçlerini kullanırlar.</p>',
  'https://images.pexels.com/photos/8363104/pexels-photo-8363104.jpeg?auto=compress&cs=tinysrgb&w=600',
  true,
  true,
  2100,
  '7 dakika',
  'Gonca Yoldaş',
  (SELECT id FROM cat_gelisim),
  NOW() - INTERVAL '3 weeks'
)
ON CONFLICT (slug) DO NOTHING;
