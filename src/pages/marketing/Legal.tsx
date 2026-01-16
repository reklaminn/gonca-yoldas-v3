import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, FileText, Scale, ArrowLeft, ScrollText, Cookie, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAllPageContent } from '@/hooks/usePageContent';

// URL slug'larını veritabanı page_key'lerine eşle
const SLUG_TO_DB_KEY: Record<string, string> = {
  'privacy-policy': 'legal-privacy',
  'terms-of-service': 'legal-terms',
  'cookies': 'legal-cookies',
  'kvkk': 'legal-kvkk',
  'distance-sales-agreement': 'legal-distance-sales'
};

// Sayfa meta verileri (Başlık, İkon vb.)
const LEGAL_PAGES_META = {
  'privacy-policy': {
    title: 'Gizlilik Politikası',
    icon: Shield,
  },
  'terms-of-service': {
    title: 'Kullanım Koşulları',
    icon: FileText,
  },
  'cookies': {
    title: 'Çerez Politikası',
    icon: Cookie,
  },
  'kvkk': {
    title: 'KVKK Aydınlatma Metni',
    icon: Scale,
  },
  'distance-sales-agreement': {
    title: 'Mesafeli Satış Sözleşmesi',
    icon: ScrollText,
  },
};

const Legal: React.FC = () => {
  const { slug } = useParams();
  
  // Geçerli bir slug mı kontrol et
  const isValidSlug = slug && slug in SLUG_TO_DB_KEY;
  const pageKey = isValidSlug ? SLUG_TO_DB_KEY[slug as string] : '';
  const pageMeta = isValidSlug ? LEGAL_PAGES_META[slug as keyof typeof LEGAL_PAGES_META] : null;

  // Veritabanından içeriği çek
  const { contentItems, loading } = useAllPageContent(pageKey);

  if (!isValidSlug || !pageMeta) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Card className="max-w-md border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Sayfa Bulunamadı</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Aradığınız sayfa bulunamadı.</p>
            <Button asChild>
              <Link to="/">Ana Sayfaya Dön</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const Icon = pageMeta.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Header */}
      <section className="bg-gradient-primary text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" className="mb-6 text-white hover:text-white hover:bg-white/10" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Ana Sayfaya Dön
              </Link>
            </Button>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Icon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">{pageMeta.title}</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <CardContent className="pt-8 min-h-[300px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
                  <p className="text-gray-500 dark:text-gray-400">İçerik yükleniyor...</p>
                </div>
              ) : contentItems.length > 0 ? (
                <div className="space-y-8">
                  {contentItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-[var(--color-primary)] prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:text-blue-500"
                    >
                      {item.content_type === 'rich_text' ? (
                        <div dangerouslySetInnerHTML={{ __html: item.content_value || '' }} />
                      ) : (
                        <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{item.content_value}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Bu sayfa için henüz içerik eklenmemiş.</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Admin panelinden içerik ekleyebilirsiniz.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(LEGAL_PAGES_META).map(([key, meta]) => {
              if (key === slug) return null; // Mevcut sayfayı gösterme
              const PageIcon = meta.icon;
              
              return (
                <Card 
                  key={key}
                  className="hover:shadow-lg transition-all cursor-pointer border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-[var(--color-primary)] dark:hover:border-[var(--color-primary)] group"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm flex items-center gap-2 text-gray-900 dark:text-white group-hover:text-[var(--color-primary)] transition-colors">
                      <PageIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-[var(--color-primary)]" />
                      {meta.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Button variant="ghost" className="p-0 h-auto text-xs text-gray-500 dark:text-gray-400 hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] hover:bg-transparent" asChild>
                      <Link to={`/legal/${key}`}>Görüntüle →</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Legal;
