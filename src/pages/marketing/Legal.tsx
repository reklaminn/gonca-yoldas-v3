import React from 'react';
    import { useParams, Link } from 'react-router-dom';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Shield, FileText, Scale, ArrowLeft } from 'lucide-react';
    import { Button } from '@/components/ui/button';

    const Legal: React.FC = () => {
      const { slug } = useParams();

      const legalPages = {
        'privacy-policy': {
          title: 'Gizlilik Politikası',
          icon: Shield,
          lastUpdated: '15 Ocak 2025',
          content: `
            <h2>1. Giriş</h2>
            <p>Gonca Yoldaş Bilingual Education olarak, kişisel verilerinizin güvenliği bizim için son derece önemlidir. Bu gizlilik politikası, kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklamaktadır.</p>

            <h2>2. Toplanan Bilgiler</h2>
            <p>Hizmetlerimizi kullanırken aşağıdaki bilgileri toplayabiliriz:</p>
            <ul>
              <li>Ad, soyad ve iletişim bilgileri</li>
              <li>E-posta adresi ve telefon numarası</li>
              <li>Çocuğunuzun yaşı ve eğitim seviyesi</li>
              <li>Ödeme bilgileri (güvenli ödeme sağlayıcıları aracılığıyla)</li>
              <li>Platform kullanım verileri ve tercihleri</li>
            </ul>

            <h2>3. Bilgilerin Kullanımı</h2>
            <p>Topladığımız bilgileri şu amaçlarla kullanırız:</p>
            <ul>
              <li>Eğitim hizmetlerini sağlamak ve geliştirmek</li>
              <li>Müşteri desteği sunmak</li>
              <li>Ödemeleri işlemek</li>
              <li>İletişim kurmak ve bilgilendirmek</li>
              <li>Hizmet kalitesini artırmak</li>
            </ul>

            <h2>4. Veri Güvenliği</h2>
            <p>Kişisel verilerinizi korumak için endüstri standardı güvenlik önlemleri kullanıyoruz:</p>
            <ul>
              <li>SSL şifreleme</li>
              <li>Güvenli veri depolama</li>
              <li>Düzenli güvenlik denetimleri</li>
              <li>Sınırlı erişim kontrolleri</li>
            </ul>

            <h2>5. Çerezler</h2>
            <p>Web sitemiz, kullanıcı deneyimini iyileştirmek için çerezler kullanır. Çerez tercihlerinizi tarayıcı ayarlarınızdan yönetebilirsiniz.</p>

            <h2>6. Üçüncü Taraf Paylaşımı</h2>
            <p>Kişisel verilerinizi, yasal zorunluluklar dışında üçüncü taraflarla paylaşmayız. Hizmet sağlayıcılarımız (ödeme işlemcileri, hosting sağlayıcıları) verilerinizi yalnızca hizmet sunmak için kullanır.</p>

            <h2>7. Haklarınız</h2>
            <p>KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
            <ul>
              <li>Kişisel verilerinize erişim</li>
              <li>Düzeltme ve güncelleme</li>
              <li>Silme talebi</li>
              <li>İşlemeye itiraz</li>
              <li>Veri taşınabilirliği</li>
            </ul>

            <h2>8. İletişim</h2>
            <p>Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz:</p>
            <p>E-posta: privacy@goncayoldas.com<br>Telefon: +90 (212) 123 45 67</p>
          `,
        },
        'terms-of-service': {
          title: 'Kullanım Koşulları',
          icon: FileText,
          lastUpdated: '15 Ocak 2025',
          content: `
            <h2>1. Hizmet Koşulları</h2>
            <p>Bu kullanım koşulları, Gonca Yoldaş Bilingual Education platformunu kullanımınızı düzenler. Platformu kullanarak bu koşulları kabul etmiş sayılırsınız.</p>

            <h2>2. Hesap Oluşturma</h2>
            <p>Platform kullanımı için bir hesap oluşturmanız gerekmektedir:</p>
            <ul>
              <li>Doğru ve güncel bilgiler sağlamalısınız</li>
              <li>Hesap güvenliğinden siz sorumlusunuz</li>
              <li>Şifrenizi kimseyle paylaşmamalısınız</li>
              <li>Şüpheli aktiviteleri derhal bildirmelisiniz</li>
            </ul>

            <h2>3. Hizmet Kullanımı</h2>
            <p>Platformumuzu kullanırken:</p>
            <ul>
              <li>Yasalara ve düzenlemelere uymalısınız</li>
              <li>Diğer kullanıcıların haklarına saygı göstermelisiniz</li>
              <li>Zararlı içerik paylaşmamalısınız</li>
              <li>Sistemi kötüye kullanmamalısınız</li>
            </ul>

            <h2>4. Ödeme ve İptal</h2>
            <p>Program kayıtları ve ödemeler:</p>
            <ul>
              <li>Tüm ücretler TL cinsindendir</li>
              <li>Ödemeler güvenli ödeme sistemleri üzerinden yapılır</li>
              <li>İptal politikamız program başlangıcından 7 gün öncesine kadar geçerlidir</li>
              <li>İade talepleri 14 iş günü içinde işleme alınır</li>
            </ul>

            <h2>5. Fikri Mülkiyet</h2>
            <p>Platform içeriği (dersler, materyaller, videolar) telif hakkı ile korunmaktadır:</p>
            <ul>
              <li>İçerikleri kopyalayamaz veya dağıtamazsınız</li>
              <li>Ticari amaçla kullanamazsınız</li>
              <li>Sadece kişisel eğitim amaçlı kullanabilirsiniz</li>
            </ul>

            <h2>6. Sorumluluk Sınırlaması</h2>
            <p>Hizmetlerimizi en iyi şekilde sunmaya çalışsak da:</p>
            <ul>
              <li>Teknik aksaklıklardan sorumlu değiliz</li>
              <li>Üçüncü taraf hizmetlerinden kaynaklanan sorunlardan sorumlu değiliz</li>
              <li>Kullanıcı hatalarından kaynaklanan kayıplardan sorumlu değiliz</li>
            </ul>

            <h2>7. Değişiklikler</h2>
            <p>Bu koşulları zaman zaman güncelleyebiliriz. Önemli değişiklikler e-posta ile bildirilecektir.</p>

            <h2>8. İletişim</h2>
            <p>Kullanım koşulları hakkında sorularınız için:</p>
            <p>E-posta: legal@goncayoldas.com<br>Telefon: +90 (212) 123 45 67</p>
          `,
        },
        'kvkk': {
          title: 'KVKK Aydınlatma Metni',
          icon: Scale,
          lastUpdated: '15 Ocak 2025',
          content: `
            <h2>1. Veri Sorumlusu</h2>
            <p>6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla Gonca Yoldaş Bilingual Education tarafından işlenmektedir.</p>

            <h2>2. Kişisel Verilerin İşlenme Amacı</h2>
            <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
            <ul>
              <li>Eğitim hizmetlerinin sunulması</li>
              <li>Sözleşme yükümlülüklerinin yerine getirilmesi</li>
              <li>Müşteri memnuniyetinin sağlanması</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              <li>İletişim faaliyetlerinin yürütülmesi</li>
            </ul>

            <h2>3. İşlenen Kişisel Veriler</h2>
            <p>Aşağıdaki kategorilerdeki kişisel verileriniz işlenmektedir:</p>
            <ul>
              <li>Kimlik bilgileri (ad, soyad, TC kimlik no)</li>
              <li>İletişim bilgileri (telefon, e-posta, adres)</li>
              <li>Müşteri işlem bilgileri</li>
              <li>Finansal bilgiler</li>
              <li>Görsel ve işitsel kayıtlar</li>
            </ul>

            <h2>4. Kişisel Verilerin Aktarılması</h2>
            <p>Kişisel verileriniz, yukarıda belirtilen amaçların gerçekleştirilmesi doğrultusunda:</p>
            <ul>
              <li>İş ortaklarımıza</li>
              <li>Hizmet sağlayıcılarımıza</li>
              <li>Yasal yükümlülükler çerçevesinde kamu kurum ve kuruluşlarına</li>
            </ul>
            <p>aktarılabilmektedir.</p>

            <h2>5. Kişisel Veri Toplamanın Yöntemi ve Hukuki Sebebi</h2>
            <p>Kişisel verileriniz:</p>
            <ul>
              <li>Web sitesi ve mobil uygulama üzerinden</li>
              <li>Sözleşme ve formlar aracılığıyla</li>
              <li>E-posta ve telefon iletişimi ile</li>
              <li>Fiziksel ortamda</li>
            </ul>
            <p>toplanmakta ve KVKK'nın 5. ve 6. maddelerinde belirtilen kişisel veri işleme şartları ve amaçları kapsamında işlenmektedir.</p>

            <h2>6. Kişisel Veri Sahibinin Hakları</h2>
            <p>KVKK'nın 11. maddesi uyarınca, kişisel veri sahipleri:</p>
            <ul>
              <li>Kişisel verilerinin işlenip işlenmediğini öğrenme</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme</li>
              <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
              <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
              <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme</li>
              <li>Düzeltme, silme ve yok edilme işlemlerinin kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
              <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
              <li>Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
            </ul>
            <p>haklarına sahiptir.</p>

            <h2>7. Başvuru Yöntemi</h2>
            <p>Yukarıda belirtilen haklarınızı kullanmak için:</p>
            <p>E-posta: kvkk@goncayoldas.com<br>
            Adres: Nispetiye Cad. No:12/A Levent, İstanbul<br>
            Telefon: +90 (212) 123 45 67</p>
            <p>üzerinden bizimle iletişime geçebilirsiniz.</p>
          `,
        },
      };

      const currentPage = slug ? legalPages[slug as keyof typeof legalPages] : null;

      if (!currentPage) {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>Sayfa Bulunamadı</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Aradığınız sayfa bulunamadı.</p>
                <Button asChild>
                  <Link to="/">Ana Sayfaya Dön</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      }

      const Icon = currentPage.icon;

      return (
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <Button variant="ghost" className="mb-6 text-white hover:text-white hover:bg-white/10" asChild>
                  <Link to="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Ana Sayfaya Dön
                  </Link>
                </Button>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <Icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold">{currentPage.title}</h1>
                    <p className="text-blue-100 mt-2">Son güncelleme: {currentPage.lastUpdated}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Content */}
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardContent className="pt-6">
                  <div 
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: currentPage.content }}
                  />
                </CardContent>
              </Card>

              {/* Quick Links */}
              <div className="mt-8 grid md:grid-cols-3 gap-4">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      Gizlilik Politikası
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="p-0" asChild>
                      <Link to="/legal/privacy-policy">Görüntüle →</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      Kullanım Koşulları
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="p-0" asChild>
                      <Link to="/legal/terms-of-service">Görüntüle →</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Scale className="h-5 w-5 text-blue-600" />
                      KVKK Aydınlatma
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="p-0" asChild>
                      <Link to="/legal/kvkk">Görüntüle →</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      );
    };

    export default Legal;
