import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Laptop, 
  Users, 
  BookOpen, 
  Video, 
  Award, 
  TrendingUp,
  MessageCircle,
  Calendar,
  FileText,
  BarChart3,
  Bell,
  Shield,
  Loader2
} from 'lucide-react';
import { usePageContent } from '@/hooks/usePageContent';

const LearningPlatform: React.FC = () => {
  const { content, loading } = usePageContent('learning-platform');

  const studentFeatures = [
    {
      icon: Video,
      title: 'İnteraktif Dersler',
      description: 'Canlı video dersler ve kayıtlı içeriklerle istediğiniz zaman öğrenin',
    },
    {
      icon: BookOpen,
      title: 'Dijital Materyaller',
      description: 'Oyunlar, aktiviteler ve alıştırmalarla eğlenceli öğrenme',
    },
    {
      icon: Award,
      title: 'Başarı Rozetleri',
      description: 'Her başarınızda rozet kazanın ve motivasyonunuzu artırın',
    },
    {
      icon: TrendingUp,
      title: 'İlerleme Takibi',
      description: 'Gelişiminizi grafiklerle takip edin ve hedeflerinize ulaşın',
    },
  ];

  const parentFeatures = [
    {
      icon: BarChart3,
      title: 'Detaylı Raporlar',
      description: 'Çocuğunuzun gelişimini haftalık raporlarla takip edin',
    },
    {
      icon: Bell,
      title: 'Anlık Bildirimler',
      description: 'Ders saatleri ve ödevler için hatırlatmalar alın',
    },
    {
      icon: MessageCircle,
      title: 'Eğitmen İletişimi',
      description: 'Eğitmenlerle doğrudan mesajlaşın ve geri bildirim alın',
    },
    {
      icon: Calendar,
      title: 'Ders Takvimi',
      description: 'Tüm dersleri ve etkinlikleri tek yerden yönetin',
    },
  ];

  const instructorFeatures = [
    {
      icon: Users,
      title: 'Sınıf Yönetimi',
      description: 'Öğrencilerinizi gruplar halinde organize edin',
    },
    {
      icon: FileText,
      title: 'İçerik Yönetimi',
      description: 'Ders materyallerini kolayca yükleyin ve paylaşın',
    },
    {
      icon: BarChart3,
      title: 'Performans Analizi',
      description: 'Öğrenci başarılarını detaylı raporlarla inceleyin',
    },
    {
      icon: Shield,
      title: 'Güvenli Ortam',
      description: 'KVKK uyumlu, güvenli bir eğitim platformu',
    },
  ];

  // Animasyon varyantları
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <Loader2 className="h-12 w-12 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Hero Section */}
      {(content.hero_title || content.hero_description) && (
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 py-20"
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-[var(--bg-elev)] text-[var(--color-primary)] px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Akıllı Öğrenme Platformu
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-[var(--fg)] mb-6">
              {content.hero_title || 'Öğrenme deneyimini'}{' '}
              <span 
                className="bg-gradient-primary bg-clip-text text-transparent" 
                style={{ 
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                {content.hero_subtitle || 'yeniden tanımlıyoruz'}
              </span>
            </h1>
            <p className="text-xl text-[var(--fg-muted)] mb-12">
              {content.hero_description || 'Öğrenciler, veliler ve eğitmenler için özel tasarlanmış, modern ve kullanıcı dostu dijital öğrenme platformu'}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="text-lg px-8 py-6 bg-gradient-primary text-white font-poppins font-semibold hover:shadow-soft-lg transition-all duration-200 hover:scale-105 rounded-lg">
                Platformu Keşfet
              </Button>
            </div>
          </div>
        </motion.section>
      )}

      {/* Platform Preview */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="container mx-auto px-4 py-12"
      >
        <div className="bg-gradient-primary rounded-2xl p-8 md:p-12 text-white">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Her Cihazda, Her Yerde
            </h2>
            <p className="text-lg opacity-90">
              Bilgisayar, tablet veya telefon - istediğiniz cihazdan erişin
            </p>
          </div>
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/4145153/pexels-photo-4145153.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              alt="Platform Preview"
              className="rounded-lg shadow-2xl w-full"
            />
          </div>
        </div>
      </motion.section>

      {/* Student Features */}
      {content.students_title && (
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="container mx-auto px-4 py-20"
        >
          <div className="text-center mb-12">
            <Laptop className="h-12 w-12 text-[var(--color-primary)] mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-[var(--fg)] mb-4">{content.students_title}</h2>
            <p className="text-xl text-[var(--fg-muted)]">
              {content.students_description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {studentFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="text-center hover:shadow-soft-lg transition-shadow border-[var(--border)] bg-[var(--bg-card)]">
                    <CardHeader>
                      <div className="mx-auto bg-[var(--bg-elev)] w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <Icon className="h-8 w-8 text-[var(--color-primary)]" />
                      </div>
                      <CardTitle className="text-lg text-[var(--fg)]">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base text-[var(--fg-muted)]">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* Parent Features */}
      {content.parents_title && (
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-[var(--bg-elev)] py-20"
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Users className="h-12 w-12 text-[var(--color-primary)] mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-[var(--fg)] mb-4">{content.parents_title}</h2>
              <p className="text-xl text-[var(--fg-muted)]">
                {content.parents_description}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {parentFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="text-center hover:shadow-soft-lg transition-shadow border-[var(--border)] bg-[var(--bg-card)]">
                      <CardHeader>
                        <div className="mx-auto bg-[var(--bg)] w-16 h-16 rounded-full flex items-center justify-center mb-4">
                          <Icon className="h-8 w-8 text-[var(--color-primary)]" />
                        </div>
                        <CardTitle className="text-lg text-[var(--fg)]">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base text-[var(--fg-muted)]">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.section>
      )}

      {/* Instructor Features */}
      {content.instructors_title && (
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="container mx-auto px-4 py-20"
        >
          <div className="text-center mb-12">
            <BookOpen className="h-12 w-12 text-[var(--color-primary)] mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-[var(--fg)] mb-4">{content.instructors_title}</h2>
            <p className="text-xl text-[var(--fg-muted)]">
              {content.instructors_description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {instructorFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="text-center hover:shadow-soft-lg transition-shadow border-[var(--border)] bg-[var(--bg-card)]">
                    <CardHeader>
                      <div className="mx-auto bg-[var(--bg-elev)] w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <Icon className="h-8 w-8 text-[var(--color-primary)]" />
                      </div>
                      <CardTitle className="text-lg text-[var(--fg)]">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base text-[var(--fg-muted)]">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* Security Section */}
      {content.security_title && (
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-gradient-primary text-white py-20"
        >
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Shield className="h-16 w-16 mx-auto mb-6" />
              <h2 className="text-4xl font-bold mb-6">
                {content.security_title}
              </h2>
              <p className="text-xl opacity-90 mb-8">
                {content.security_description}
              </p>
              <div className="grid md:grid-cols-3 gap-6 text-left">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6"
                >
                  <h3 className="font-semibold text-lg mb-2">SSL Şifreleme</h3>
                  <p className="opacity-90">Tüm veriler şifreli olarak iletilir</p>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6"
                >
                  <h3 className="font-semibold text-lg mb-2">KVKK Uyumlu</h3>
                  <p className="opacity-90">Kişisel veriler korunur</p>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6"
                >
                  <h3 className="font-semibold text-lg mb-2">Düzenli Yedekleme</h3>
                  <p className="opacity-90">Verileriniz güvende</p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* CTA Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="container mx-auto px-4 py-20"
      >
        <div className="bg-gradient-primary rounded-2xl p-12 text-white text-center">
          <h2 className="text-4xl font-bold mb-6">
            Platformu Denemeye Hazır Mısınız?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Ücretsiz deneme hesabı oluşturun ve tüm özellikleri keşfedin
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-6 bg-white text-[var(--color-primary)] hover:bg-gray-100 font-poppins font-semibold rounded-lg transition-all duration-200 hover:scale-105">
            Ücretsiz Hesap Oluştur
          </Button>
        </div>
      </motion.section>
    </div>
  );
};

export default LearningPlatform;
