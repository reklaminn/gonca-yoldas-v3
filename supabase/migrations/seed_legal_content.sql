/*
  # Seed Legal Pages Content
  
  1. Purpose
    - Populates all legal pages with sample rich HTML content.
    - Covers: Privacy Policy, Terms of Service, Cookies, KVKK, Distance Sales Agreement.
    - Uses 'rich_text' content_type so the frontend renders it as HTML.

  2. Content
    - Professional placeholder text formatted with HTML tags (h2, h3, p, ul, li, strong).
*/

-- Helper function to insert or update content
CREATE OR REPLACE FUNCTION insert_legal_content(
  p_page_key text,
  p_title text,
  p_html_content text
) RETURNS void AS $$
BEGIN
  INSERT INTO page_content (page_key, section_key, content_type, content_value, display_order)
  VALUES 
    (p_page_key, 'main_content', 'rich_text', p_html_content, 1)
  ON CONFLICT (page_key, section_key, content_type) 
  DO UPDATE SET 
    content_value = EXCLUDED.content_value,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- 1. Gizlilik Politikası (Privacy Policy)
SELECT insert_legal_content(
  'legal-privacy',
  'Gizlilik Politikası',
  '<div class="space-y-6">
    <p class="lead">Gonca Yoldaş Eğitim Danışmanlık ("Şirket") olarak, müşterilerimizin ve ziyaretçilerimizin gizliliğine büyük önem veriyoruz. Bu Gizlilik Politikası, kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklar.</p>

    <h3 class="text-xl font-semibold text-primary mt-6">1. Toplanan Veriler</h3>
    <p>Hizmetlerimizi kullanırken aşağıdaki bilgileri toplayabiliriz:</p>
    <ul class="list-disc pl-6 space-y-2">
      <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, T.C. kimlik numarası (fatura işlemleri için).</li>
      <li><strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası, adres.</li>
      <li><strong>İşlem Güvenliği Bilgileri:</strong> IP adresi, tarayıcı bilgileri, web sitesi trafik verileri.</li>
      <li><strong>Müşteri İşlem Bilgileri:</strong> Sipariş geçmişi, talep ve şikayetler.</li>
    </ul>

    <h3 class="text-xl font-semibold text-primary mt-6">2. Verilerin Kullanım Amacı</h3>
    <p>Toplanan kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
    <ul class="list-disc pl-6 space-y-2">
      <li>Ürün ve hizmetlerin sunulması ve satış süreçlerinin yürütülmesi.</li>
      <li>Müşteri ilişkileri yönetimi ve destek hizmetlerinin sağlanması.</li>
      <li>Yasal yükümlülüklerin yerine getirilmesi (fatura kesimi vb.).</li>
      <li>Pazarlama faaliyetleri (açık rızanız olması halinde).</li>
    </ul>

    <h3 class="text-xl font-semibold text-primary mt-6">3. Veri Güvenliği</h3>
    <p>Kişisel verileriniz, yetkisiz erişime, kayba veya ifşaya karşı korunması amacıyla teknik ve idari tedbirlerle güvence altına alınmıştır. SSL şifreleme teknolojileri kullanılarak verileriniz güvenli bir şekilde iletilir.</p>

    <h3 class="text-xl font-semibold text-primary mt-6">4. Çerezler (Cookies)</h3>
    <p>Web sitemizde kullanıcı deneyimini iyileştirmek amacıyla çerezler kullanılmaktadır. Detaylı bilgi için <a href="/legal/cookies" class="text-blue-600 hover:underline">Çerez Politikamızı</a> inceleyebilirsiniz.</p>
  </div>'
);

-- 2. Kullanım Koşulları (Terms of Service)
SELECT insert_legal_content(
  'legal-terms',
  'Kullanım Koşulları',
  '<div class="space-y-6">
    <p>Bu web sitesini ("Site") ziyaret ederek veya hizmetlerimizi kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız.</p>

    <h3 class="text-xl font-semibold text-primary mt-6">1. Hizmetlerin Kapsamı</h3>
    <p>Gonca Yoldaş, 0-10 yaş grubu çocuklara yönelik İngilizce eğitim programları ve danışmanlık hizmetleri sunmaktadır. Site üzerinden sunulan içerikler bilgilendirme ve eğitim amaçlıdır.</p>

    <h3 class="text-xl font-semibold text-primary mt-6">2. Fikri Mülkiyet Hakları</h3>
    <p>Sitede yer alan tüm metinler, görseller, videolar, logolar ve eğitim materyalleri Gonca Yoldaş''a aittir ve Fikir ve Sanat Eserleri Kanunu kapsamında korunmaktadır. İzinsiz kopyalanması, çoğaltılması veya ticari amaçla kullanılması yasaktır.</p>

    <h3 class="text-xl font-semibold text-primary mt-6">3. Kullanıcı Sorumlulukları</h3>
    <ul class="list-disc pl-6 space-y-2">
      <li>Kullanıcılar, siteyi kullanırken yasalara ve genel ahlak kurallarına uygun davranmayı kabul eder.</li>
      <li>Hesap bilgilerinin güvenliğinden kullanıcı sorumludur.</li>
      <li>Siteye zarar verecek yazılım veya işlemlerden kaçınılmalıdır.</li>
    </ul>

    <h3 class="text-xl font-semibold text-primary mt-6">4. Değişiklik Hakkı</h3>
    <p>Şirket, işbu Kullanım Koşulları''nı dilediği zaman önceden bildirmeksizin değiştirme hakkını saklı tutar. Güncel koşullar sitede yayınlandığı tarihte yürürlüğe girer.</p>
  </div>'
);

-- 3. Çerez Politikası (Cookies)
SELECT insert_legal_content(
  'legal-cookies',
  'Çerez Politikası',
  '<div class="space-y-6">
    <p>Gonca Yoldaş olarak, web sitemizden en verimli şekilde faydalanabilmeniz ve kullanıcı deneyiminizi geliştirebilmek için Çerez (Cookie) kullanıyoruz.</p>

    <h3 class="text-xl font-semibold text-primary mt-6">Çerez Nedir?</h3>
    <p>Çerezler, ziyaret ettiğiniz internet siteleri tarafından tarayıcılar aracılığıyla cihazınıza veya ağ sunucusuna depolanan küçük metin dosyalarıdır.</p>

    <h3 class="text-xl font-semibold text-primary mt-6">Kullandığımız Çerez Türleri</h3>
    <div class="overflow-x-auto">
      <table class="min-w-full border border-gray-200 mt-4">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-2 text-left border-b">Çerez Türü</th>
            <th class="px-4 py-2 text-left border-b">Açıklama</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="px-4 py-2 border-b font-medium">Zorunlu Çerezler</td>
            <td class="px-4 py-2 border-b">Sitenin düzgün çalışması için gereklidir (örn. oturum açma, sepet işlemleri).</td>
          </tr>
          <tr>
            <td class="px-4 py-2 border-b font-medium">Analitik Çerezler</td>
            <td class="px-4 py-2 border-b">Ziyaretçi sayıları ve trafik kaynaklarını görmemizi sağlar (Google Analytics vb.).</td>
          </tr>
          <tr>
            <td class="px-4 py-2 border-b font-medium">İşlevsel Çerezler</td>
            <td class="px-4 py-2 border-b">Dil tercihleri gibi kişiselleştirilmiş ayarları hatırlar.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3 class="text-xl font-semibold text-primary mt-6">Çerezleri Nasıl Yönetebilirsiniz?</h3>
    <p>Tarayıcınızın ayarlarını değiştirerek çerezlere ilişkin tercihlerinizi kişiselleştirme imkanına sahipsiniz. Ancak zorunlu çerezlerin engellenmesi durumunda sitenin bazı özellikleri çalışmayabilir.</p>
  </div>'
);

-- 4. KVKK Aydınlatma Metni (KVKK)
SELECT insert_legal_content(
  'legal-kvkk',
  'KVKK Aydınlatma Metni',
  '<div class="space-y-6">
    <p>6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, Gonca Yoldaş olarak Veri Sorumlusu sıfatıyla, kişisel verilerinizi aşağıda açıklanan kapsamda işlemekteyiz.</p>

    <h3 class="text-xl font-semibold text-primary mt-6">1. Veri Sorumlusu</h3>
    <p><strong>Unvan:</strong> Gonca Yoldaş Eğitim Danışmanlık<br>
    <strong>Adres:</strong> Nispetiye Cad. No:12/A Levent, İstanbul<br>
    <strong>E-posta:</strong> kvkk@goncayoldas.com</p>

    <h3 class="text-xl font-semibold text-primary mt-6">2. Kişisel Verilerin İşlenme Amaçları</h3>
    <p>Kişisel verileriniz; eğitim hizmetlerinin sunulması, faturalandırma, müşteri iletişimi, yasal yükümlülüklerin ifası ve hizmet kalitesinin artırılması amaçlarıyla işlenmektedir.</p>

    <h3 class="text-xl font-semibold text-primary mt-6">3. Kişisel Verilerin Aktarılması</h3>
    <p>Verileriniz, yasal zorunluluklar dışında üçüncü kişilerle paylaşılmamaktadır. Ancak ödeme işlemleri için bankalarla ve kargo gönderimi için kargo şirketleriyle gerekli bilgiler paylaşılabilir.</p>

    <h3 class="text-xl font-semibold text-primary mt-6">4. Haklarınız</h3>
    <p>KVKK''nın 11. maddesi uyarınca, veri sahibi olarak aşağıdaki haklara sahipsiniz:</p>
    <ul class="list-disc pl-6 space-y-2">
      <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
      <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
      <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
      <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
      <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme.</li>
    </ul>
  </div>'
);

-- 5. Mesafeli Satış Sözleşmesi (Distance Sales)
SELECT insert_legal_content(
  'legal-distance-sales',
  'Mesafeli Satış Sözleşmesi',
  '<div class="space-y-6">
    <h3 class="text-xl font-semibold text-primary mt-6">MADDE 1 - TARAFLAR</h3>
    
    <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
      <p><strong>1.1. SATICI</strong></p>
      <p><strong>Unvan:</strong> Gonca Yoldaş Eğitim Danışmanlık</p>
      <p><strong>Adres:</strong> Nispetiye Cad. No:12/A Levent, İstanbul</p>
      <p><strong>Telefon:</strong> +90 (212) 123 45 67</p>
      <p><strong>E-posta:</strong> info@goncayoldas.com</p>
    </div>

    <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <p><strong>1.2. ALICI</strong></p>
      <p>Alıcı, www.goncayoldas.com internet sitesine üye olan veya sipariş veren kişidir. Üyelik veya sipariş sırasında kullanılan adres ve iletişim bilgileri esas alınır.</p>
    </div>

    <h3 class="text-xl font-semibold text-primary mt-6">MADDE 2 - KONU</h3>
    <p>İşbu sözleşmenin konusu, ALICI''nın SATICI''ya ait internet sitesinden elektronik ortamda siparişini yaptığı aşağıda nitelikleri ve satış fiyatı belirtilen ürünün/hizmetin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.</p>

    <h3 class="text-xl font-semibold text-primary mt-6">MADDE 3 - CAYMA HAKKI</h3>
    <p>ALICI, dijital içerik ve hizmetlerde (online eğitim, indirilebilir materyal vb.) hizmetin ifasına başlandıktan sonra cayma hakkını kullanamaz. Fiziki ürünlerde ise teslim tarihinden itibaren 14 (on dört) gün içinde cayma hakkına sahiptir.</p>

    <h3 class="text-xl font-semibold text-primary mt-6">MADDE 4 - YETKİLİ MAHKEME</h3>
    <p>İşbu sözleşmeden doğabilecek uyuşmazlıklarda, Tüketici Hakem Heyetleri ve İstanbul Mahkemeleri yetkilidir.</p>
  </div>'
);

-- Cleanup function
DROP FUNCTION insert_legal_content;