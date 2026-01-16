/*
  # Update Cookie Policy Content
  
  1. Purpose
    - Updates the 'legal-cookies' page content with a comprehensive and professional text.
    - Uses 'rich_text' format for proper HTML rendering.

  2. Content Structure
    - Introduction
    - What are cookies?
    - Types of cookies used (Strictly Necessary, Performance, Functional, Targeting)
    - How to manage cookies
*/

DO $$
DECLARE
  v_content text;
BEGIN
  v_content := '
<div class="space-y-6 text-gray-700 dark:text-gray-300">
  <p class="lead">
    Gonca Yoldaş Eğitim Danışmanlık ("Şirket") olarak, web sitemizden en verimli şekilde faydalanabilmeniz ve kullanıcı deneyiminizi geliştirebilmek için Çerez (Cookie) kullanıyoruz. Bu Çerez Politikası, web sitemizi ziyaret ettiğinizde kullanılan çerez türlerini, kullanım amaçlarını ve bu çerezleri nasıl yönetebileceğinizi açıklamaktadır.
  </p>

  <h3 class="text-xl font-semibold text-primary mt-8 mb-4">1. Çerez (Cookie) Nedir?</h3>
  <p>
    Çerezler, ziyaret ettiğiniz internet siteleri tarafından tarayıcılar aracılığıyla cihazınıza veya ağ sunucusuna depolanan küçük metin dosyalarıdır. Çerezler, web sitesinin daha verimli çalışmasını sağlamak, kişiselleştirilmiş sayfalar sunmak ve site ziyaretçilerinin tercihlerini hatırlamak amacıyla kullanılır. Çerezler, bilgisayarınızda veya dosyalarınızda depolanan kişisel veriler de dahil olmak üzere herhangi bir bilgi toplamaz.
  </p>

  <h3 class="text-xl font-semibold text-primary mt-8 mb-4">2. Çerezleri Neden Kullanıyoruz?</h3>
  <p>Web sitemizde çerez kullanılmasının başlıca amaçları şunlardır:</p>
  <ul class="list-disc pl-6 space-y-2 mt-2">
    <li>Web sitesinin işlevselliğini ve performansını artırarak sizlere sunulan hizmetleri geliştirmek,</li>
    <li>Web sitesini iyileştirmek ve web sitesi üzerinden yeni özellikler sunmak ve sunulan özellikleri sizlerin tercihlerine göre kişiselleştirmek,</li>
    <li>Web sitesinin, sizin ve Şirketimizin hukuki ve ticari güvenliğini temin etmek.</li>
  </ul>

  <h3 class="text-xl font-semibold text-primary mt-8 mb-4">3. Web Sitemizde Kullanılan Çerez Türleri</h3>
  
  <div class="overflow-x-auto mt-4">
    <table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <thead class="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b dark:border-gray-700">Çerez Türü</th>
          <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b dark:border-gray-700">Açıklama</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
        <tr>
          <td class="px-4 py-3 text-sm font-medium">Zorunlu Çerezler</td>
          <td class="px-4 py-3 text-sm">Web sitesinin düzgün çalışması için gerekli olan çerezlerdir. Bu çerezler olmadan, oturum açma, sepet işlemleri gibi temel fonksiyonlar kullanılamaz.</td>
        </tr>
        <tr>
          <td class="px-4 py-3 text-sm font-medium">Performans ve Analiz Çerezleri</td>
          <td class="px-4 py-3 text-sm">Ziyaretçilerin web sitesini nasıl kullandığını analiz etmemize yardımcı olur (örn. en çok ziyaret edilen sayfalar, hata mesajları). Bu bilgiler anonim olarak toplanır ve siteyi geliştirmek için kullanılır.</td>
        </tr>
        <tr>
          <td class="px-4 py-3 text-sm font-medium">İşlevsel Çerezler</td>
          <td class="px-4 py-3 text-sm">Web sitesinin dil tercihi, bölge seçimi gibi kişiselleştirilmiş ayarlarınızı hatırlamasını sağlar.</td>
        </tr>
        <tr>
          <td class="px-4 py-3 text-sm font-medium">Hedefleme ve Reklam Çerezleri</td>
          <td class="px-4 py-3 text-sm">İlgi alanlarınıza uygun içerik ve reklamları sunmak amacıyla kullanılır. Ayrıca reklam kampanyalarının etkinliğini ölçmeye yardımcı olur.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h3 class="text-xl font-semibold text-primary mt-8 mb-4">4. Çerezlerin Yönetimi ve Silinmesi</h3>
  <p>
    Çoğu internet tarayıcısı, çerezleri otomatik olarak kabul edecek şekilde ayarlanmıştır. Ancak, tarayıcınızın ayarlarını değiştirerek çerezleri engelleyebilir veya silebilirsiniz. Çerezleri devre dışı bırakmanız durumunda, web sitemizin bazı özelliklerinin düzgün çalışmayabileceğini lütfen unutmayın.
  </p>
  <p class="mt-4">Tarayıcınızın ayarlarından çerezleri yönetmek için aşağıdaki adımları izleyebilirsiniz:</p>
  <ul class="list-disc pl-6 space-y-2 mt-2">
    <li><strong>Google Chrome:</strong> Ayarlar > Gizlilik ve Güvenlik > Çerezler ve diğer site verileri</li>
    <li><strong>Mozilla Firefox:</strong> Seçenekler > Gizlilik ve Güvenlik > Çerezler ve Site Verileri</li>
    <li><strong>Safari:</strong> Tercihler > Gizlilik > Çerezleri ve web sitesi verilerini yönet</li>
    <li><strong>Microsoft Edge:</strong> Ayarlar > Çerezler ve site izinleri</li>
  </ul>

  <h3 class="text-xl font-semibold text-primary mt-8 mb-4">5. Yürürlük</h3>
  <p>
    Şirketimiz, bu Çerez Politikası hükümlerini dilediği zaman değiştirebilir. Güncel politika, web sitesinde yayınlandığı tarihte yürürlüğe girer.
  </p>
</div>';

  -- Insert or Update the content
  INSERT INTO page_content (page_key, section_key, content_type, content_value, display_order, is_active)
  VALUES ('legal-cookies', 'main_content', 'rich_text', v_content, 1, true)
  ON CONFLICT (page_key, section_key, content_type) 
  DO UPDATE SET 
    content_value = EXCLUDED.content_value,
    updated_at = now();

END $$;