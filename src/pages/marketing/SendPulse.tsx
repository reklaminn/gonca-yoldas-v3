import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  BookOpen, 
  Users, 
  Video, 
  BarChart3, 
  MessageSquare, 
  Calendar,
  CheckCircle2,
  Mail,
  Phone,
  Building2,
  ArrowRight,
  Sparkles,
  Target,
  TrendingUp,
  Award
} from 'lucide-react';
import SEO from '@/components/SEO';
import { generateOrganizationSchema } from '@/utils/schema';
import { toast } from 'sonner';

const SendPulse: React.FC = () => {
  const [formData, setFormData] = React.useState({
    fullName: '',
    email: '',
    phone: '',
    organization: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Front-end POST placeholder - no real API call
    console.log('SendPulse Demo Request:', formData);
    
    toast.success('Demo talebiniz alındı! En kısa sürede sizinle iletişime geçeceğiz.');
    
    // Reset form
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      organization: '',
      message: '',
    });
  };

  const features = [
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: 'Kurs Yönetimi',
      description: 'Tüm eğitim programlarınızı tek bir platformdan yönetin. Kurs içerikleri, modüller ve dersler için kapsamlı yönetim araçları.',
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Öğrenci Takibi',
      description: 'Öğrencilerinizin ilerlemesini gerçek zamanlı takip edin. Detaylı raporlar ve analitiklerle başarıyı ölçün.',
    },
    {
      icon: <Video className="h-8 w-8" />,
      title: 'Canlı Dersler',
      description: 'Entegre video konferans sistemi ile canlı dersler düzenleyin. Kayıt, paylaşım ve etkileşim özellikleri.',
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'Gelişmiş Raporlama',
      description: 'Detaylı analitik raporlar ile eğitim performansınızı ölçün. Öğrenci başarısı, katılım ve ilerleme metrikleri.',
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: 'İletişim Araçları',
      description: 'E-posta, SMS ve push bildirimleri ile öğrencilerinizle etkili iletişim kurun. Otomatik hatırlatmalar ve duyurular.',
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: 'Takvim ve Planlama',
      description: 'Ders programları, sınavlar ve etkinlikler için entegre takvim sistemi. Otomatik hatırlatmalar ve senkronizasyon.',
    },
  ];

  const benefits = [
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Hedef Odaklı Eğitim',
      description: 'Her öğrenci için kişiselleştirilmiş öğrenme yolları oluşturun',
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Artan Verimlilik',
      description: 'Otomasyonlar ile zaman tasarrufu sağlayın ve verimliliği artırın',
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: 'Sertifika Yönetimi',
      description: 'Otomatik sertifika oluşturma ve dağıtım sistemi',
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: 'Modern Arayüz',
      description: 'Kullanıcı dostu, modern ve responsive tasarım',
    },
  ];

  const stats = [
    { value: '10,000+', label: 'Aktif Öğrenci' },
    { value: '500+', label: 'Eğitim Kurumu' },
    { value: '98%', label: 'Memnuniyet Oranı' },
    { value: '24/7', label: 'Teknik Destek' },
  ];

  return (
    <>
      <SEO
        title="SendPulse Eğitim Platformu"
        description="Eğitim kurumları için kapsamlı öğrenme yönetim sistemi. Kurs yönetimi, öğrenci takibi, canlı dersler ve daha fazlası."
        canonical="/sendpulse-egitim-platformu"
        schema={generateOrganizationSchema()}
      />

      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
        {/* Hero Section */}
        <section 
          className="py-20 lg:py-32"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
          }}
        >
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
                Eğitim Kurumları için
                <br />
                <span className="inline-flex items-center gap-3 mt-2">
                  Kapsamlı Öğrenme Platformu
                  <Sparkles className="h-12 w-12" />
                </span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-white/90">
                SendPulse ile eğitim süreçlerinizi dijitalleştirin, öğrenci başarısını artırın
              </p>
              <Button
                onClick={() => document.getElementById('demo-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-[var(--color-primary)] hover:bg-gray-100 font-poppins font-semibold rounded-lg text-lg px-8 py-6 transition-all duration-200 hover:scale-105"
              >
                Ücretsiz Demo Talep Et
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-[var(--bg-elev)]">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                    {stat.value}
                  </div>
                  <div className="text-sm md:text-base" style={{ color: 'var(--fg-muted)' }}>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: 'var(--fg)' }}>
                Platform Özellikleri
              </h2>
              <p className="text-lg" style={{ color: 'var(--fg-muted)' }}>
                Eğitim kurumunuz için ihtiyacınız olan her şey
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="card h-full hover:shadow-soft-lg transition-all duration-200">
                    <CardHeader>
                      <div className="mb-4" style={{ color: 'var(--color-primary)' }}>
                        {feature.icon}
                      </div>
                      <CardTitle style={{ color: 'var(--fg)' }}>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p style={{ color: 'var(--fg-muted)' }}>{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-[var(--bg-elev)]">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: 'var(--fg)' }}>
                Neden SendPulse?
              </h2>
              <p className="text-lg" style={{ color: 'var(--fg-muted)' }}>
                Eğitim kurumunuza sağlayacağı avantajlar
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="p-6 rounded-xl border"
                  style={{ 
                    backgroundColor: 'var(--surface-1)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="mb-4" style={{ color: 'var(--color-accent)' }}>
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--fg)' }}>
                    {benefit.title}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Demo Request Form */}
        <section id="demo-form" className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Card className="card" style={{ backgroundColor: 'var(--surface-1)' }}>
                  <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl text-center" style={{ color: 'var(--fg)' }}>
                      Ücretsiz Demo Talep Edin
                    </CardTitle>
                    <p className="text-center" style={{ color: 'var(--fg-muted)' }}>
                      Platformu deneyimleyin, sorularınızı sorun
                    </p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <Label htmlFor="fullName">Ad Soyad *</Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          required
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">E-posta *</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--fg-muted)' }} />
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="phone">Telefon *</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--fg-muted)' }} />
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="organization">Kurum Adı</Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--fg-muted)' }} />
                          <Input
                            id="organization"
                            value={formData.organization}
                            onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="message">Mesajınız</Label>
                        <textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="input w-full min-h-[120px]"
                          placeholder="Platformla ilgili sorularınız veya özel ihtiyaçlarınız..."
                        />
                      </div>

                      <Button type="submit" className="btn-primary w-full" size="lg">
                        Demo Talep Et
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>

                      <p className="text-xs text-center" style={{ color: 'var(--fg-muted)' }}>
                        Demo talebiniz 24 saat içinde değerlendirilecektir.
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-[var(--bg-elev)]">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-primary rounded-2xl p-12 text-center text-white"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Eğitim Kurumunuzu Dijitalleştirin
              </h2>
              <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                SendPulse ile öğrenci başarısını artırın, eğitim süreçlerinizi optimize edin
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  onClick={() => document.getElementById('demo-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white text-[var(--color-primary)] hover:bg-gray-100 font-poppins font-semibold rounded-lg text-lg px-8 py-6 transition-all duration-200 hover:scale-105"
                >
                  Demo Talep Et
                </Button>
                <Button
                  onClick={() => window.location.href = '/contact'}
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-poppins font-semibold rounded-lg text-lg px-8 py-6 transition-all duration-200"
                >
                  İletişime Geç
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default SendPulse;
