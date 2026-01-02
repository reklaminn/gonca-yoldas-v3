import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useProgramDetails } from '@/hooks/usePrograms';
import {
  Clock,
  Users,
  Calendar,
  Award,
  CheckCircle,
  ChevronRight,
  Loader2,
  AlertCircle,
  BookOpen,
  Video,
  MessageCircle,
  CreditCard,
  Star,
  ArrowLeft,
  ShoppingCart,
} from 'lucide-react';

const ProgramDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { program, loading, error } = useProgramDetails(slug || '');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-[var(--bg)] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[var(--color-primary)] mx-auto mb-4" />
          <p className="text-[var(--fg-muted)]">Program yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="bg-[var(--bg)] min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-error" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--fg)] mb-2">Program bulunamadı</h2>
          <p className="text-[var(--fg-muted)] mb-6">
            {error || 'Aradığınız program mevcut değil veya kaldırılmış olabilir.'}
          </p>
          <Button
            onClick={() => navigate('/programs')}
            className="bg-gradient-primary text-white font-poppins font-semibold hover:shadow-soft-lg transition-all duration-200 hover:scale-105 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Programlara Dön
          </Button>
        </div>
      </div>
    );
  }

  const metadata = program.metadata || {};
  const installments = metadata.installments || [];

  // ✅ Checkout sayfasına yönlendirme fonksiyonu - DEBUG EKLENDI
  const handleEnrollClick = () => {
    console.log('🛒 [ProgramDetail] Checkout button clicked');
    console.log('🛒 [ProgramDetail] Program slug:', program.slug);
    console.log('🛒 [ProgramDetail] Navigating to:', `/siparis?program=${program.slug}`);
    
    navigate(`/siparis?program=${program.slug}`);
    
    console.log('🛒 [ProgramDetail] Navigate called');
  };

  return (
    <div className="bg-[var(--bg)] min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-primary text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] animate-pulse"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Button
            variant="ghost"
            onClick={() => navigate('/programs')}
            className="text-white hover:bg-white/10 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Programlara Dön
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <Badge className="bg-white/20 text-white border-white/30 mb-4">
                {program.age_range}
              </Badge>
              {metadata.limited_capacity && (
                <Badge className="bg-yellow-500 text-white border-yellow-600 mb-4 ml-2">
                  <Star className="h-3 w-3 mr-1" />
                  Sınırlı Kontenjan
                </Badge>
              )}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                {program.title}
              </h1>
              {program.title_en && (
                <p className="text-xl text-white/80 mb-6">{program.title_en}</p>
              )}
              <p className="text-lg text-white/90 mb-8">{program.description}</p>

              <div className="flex flex-wrap gap-4 mb-8">
                {metadata.instructor && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <Award className="h-5 w-5" />
                    <span className="font-semibold">{metadata.instructor}</span>
                  </div>
                )}
                {metadata.start_date && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <Calendar className="h-5 w-5" />
                    <span>
                      {new Date(metadata.start_date).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="bg-white text-[var(--color-primary)] px-6 py-4 rounded-lg">
                  <div className="text-3xl font-bold">₺{program.price.toLocaleString()}</div>
                  <div className="text-sm opacity-80">{program.duration}</div>
                </div>
                <Button
                  size="lg"
                  onClick={handleEnrollClick}
                  className="bg-white text-[var(--color-primary)] hover:bg-gray-100 font-poppins font-semibold rounded-lg text-lg px-8 transition-all duration-200 hover:scale-105"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Hemen Kayıt Ol
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="relative">
              {program.image_url ? (
                <motion.img
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  src={program.image_url}
                  alt={program.title}
                  className="rounded-2xl shadow-2xl w-full"
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl w-full aspect-video flex items-center justify-center"
                >
                  <BookOpen className="h-24 w-24 text-white/50" />
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Program Details */}
            <Card className="border-[var(--border)] bg-[var(--bg-card)]">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-[var(--fg)] mb-6">Program Detayları</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--fg)] mb-1">Süre</div>
                      <div className="text-[var(--fg-muted)]">{program.duration}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--fg)] mb-1">Program</div>
                      <div className="text-[var(--fg-muted)]">{program.schedule}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                      <Users className="h-5 w-5 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--fg)] mb-1">Kontenjan</div>
                      <div className="text-[var(--fg-muted)]">
                        {program.enrolled_students} / {program.max_students} öğrenci
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-5 w-5 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--fg)] mb-1">Ders Süresi</div>
                      <div className="text-[var(--fg-muted)]">{program.lesson_duration}</div>
                    </div>
                  </div>

                  {metadata.platform && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                        <Video className="h-5 w-5 text-[var(--color-primary)]" />
                      </div>
                      <div>
                        <div className="font-semibold text-[var(--fg)] mb-1">Platform</div>
                        <div className="text-[var(--fg-muted)]">{metadata.platform}</div>
                      </div>
                    </div>
                  )}

                  {metadata.recording_access && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                        <Video className="h-5 w-5 text-[var(--color-primary)]" />
                      </div>
                      <div>
                        <div className="font-semibold text-[var(--fg)] mb-1">Kayıt Erişimi</div>
                        <div className="text-[var(--fg-muted)]">{metadata.recording_access}</div>
                      </div>
                    </div>
                  )}
                </div>

                {metadata.parent_only && (
                  <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                          Önemli Not
                        </div>
                        <div className="text-sm text-yellow-800 dark:text-yellow-200">
                          Bu program sadece ebeveynler içindir. Çocuklu katılım yoktur.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            {program.features && program.features.length > 0 && (
              <Card className="border-[var(--border)] bg-[var(--bg-card)]">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-[var(--fg)] mb-6">Program İçeriği</h2>
                  <div className="space-y-4">
                    {program.features.map((feature, index) => (
                      <motion.div
                        key={feature.id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle className="h-5 w-5 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
                        <span className="text-[var(--fg-muted)]">{feature.feature_text}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Outcomes */}
            {program.outcomes && program.outcomes.length > 0 && (
              <Card className="border-[var(--border)] bg-[var(--bg-card)]">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-[var(--fg)] mb-6">Neden Bu Program?</h2>
                  <div className="space-y-4">
                    {program.outcomes.map((outcome, index) => (
                      <motion.div
                        key={outcome.id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <Award className="h-5 w-5 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
                        <span className="text-[var(--fg-muted)]">{outcome.feature_text}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* FAQs */}
            {program.faqs && program.faqs.length > 0 && (
              <Card className="border-[var(--border)] bg-[var(--bg-card)]">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-[var(--fg)] mb-6">
                    Sıkça Sorulan Sorular
                  </h2>
                  <div className="space-y-6">
                    {program.faqs.map((faq, index) => (
                      <motion.div
                        key={faq.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                      >
                        <h3 className="font-semibold text-[var(--fg)] mb-2">{faq.question}</h3>
                        <p className="text-[var(--fg-muted)]">{faq.answer}</p>
                        {index < program.faqs.length - 1 && (
                          <Separator className="mt-6 bg-[var(--border)]" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card className="border-[var(--border)] bg-[var(--bg-card)] sticky top-24">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-[var(--fg)] mb-2">
                    ₺{program.price.toLocaleString()}
                  </div>
                  <div className="text-[var(--fg-muted)]">{program.duration}</div>
                </div>

                {installments.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard className="h-4 w-4 text-[var(--color-primary)]" />
                      <span className="font-semibold text-[var(--fg)]">Taksit Seçenekleri</span>
                    </div>
                    <div className="space-y-2">
                      {installments.map((months: number) => (
                        <div
                          key={months}
                          className="flex justify-between items-center p-3 bg-[var(--bg-elev)] rounded-lg"
                        >
                          <span className="text-[var(--fg-muted)]">{months} Taksit</span>
                          <span className="font-semibold text-[var(--fg)]">
                            ₺{Math.ceil(program.price / months).toLocaleString()} / ay
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  size="lg"
                  onClick={handleEnrollClick}
                  className="w-full bg-gradient-primary text-white font-poppins font-semibold hover:shadow-soft-lg transition-all duration-200 hover:scale-105 rounded-lg"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Hemen Kayıt Ol
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>

                {metadata.whatsapp_group && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">WhatsApp grubu dahildir</span>
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-[var(--border)]">
                  <div className="space-y-3 text-sm text-[var(--fg-muted)]">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-[var(--color-primary)]" />
                      <span>Uzman eğitmen desteği</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-[var(--color-primary)]" />
                      <span>Tüm materyaller dahil</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-[var(--color-primary)]" />
                      <span>Sertifika</span>
                    </div>
                    {metadata.recording_access && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-[var(--color-primary)]" />
                        <span>{metadata.recording_access} kayıt erişimi</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Card - Sticky */}
            <div className="sticky top-[calc(100vh-12rem)]">
              <Card className="border-[var(--border)] bg-gradient-primary text-white">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-3">Sorularınız mı var?</h3>
                  <p className="text-white/90 text-sm mb-4">
                    Program hakkında detaylı bilgi almak için bizimle iletişime geçin.
                  </p>
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/contact')}
                    className="w-full bg-white text-[var(--color-primary)] hover:bg-gray-100"
                  >
                    İletişime Geç
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetail;
