import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, Loader2 } from 'lucide-react';
import { usePageContent } from '@/hooks/usePageContent';

const Contact: React.FC = () => {
  const { content, loading } = usePageContent('contact');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic will be implemented with Supabase
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Adres',
      content: content.address || 'Nispetiye Cad. No:12/A\nLevent, İstanbul',
      key: 'address'
    },
    {
      icon: Phone,
      title: 'Telefon',
      content: content.phone || '+90 (212) 123 45 67\n+90 (532) 123 45 67',
      key: 'phone'
    },
    {
      icon: Mail,
      title: 'E-posta',
      content: content.email || 'info@goncayoldas.com\ndestek@goncayoldas.com',
      key: 'email'
    },
    {
      icon: Clock,
      title: 'Çalışma Saatleri',
      content: content.hours || 'Pazartesi - Cuma: 09:00 - 18:00\nCumartesi: 10:00 - 16:00',
      key: 'hours'
    },
  ];

  const faqs = [
    {
      question: 'Ücretsiz deneme dersi nasıl alabilirim?',
      answer: 'Formu doldurarak veya bizi arayarak ücretsiz deneme dersi talebinde bulunabilirsiniz.',
    },
    {
      question: 'Hangi yaş grupları için programlarınız var?',
      answer: '0-2, 2-5 ve 5-10 yaş grupları için özel tasarlanmış programlarımız bulunmaktadır.',
    },
    {
      question: 'Online dersler nasıl işliyor?',
      answer: 'Online derslerimiz Zoom üzerinden canlı olarak gerçekleşir. Kayıtlara da erişim sağlanır.',
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
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16"
        >
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              {content.hero_title && (
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">{content.hero_title}</h1>
              )}
              {content.hero_description && (
                <p className="text-xl text-blue-100">
                  {content.hero_description}
                </p>
              )}
            </div>
          </div>
        </motion.section>
      )}

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="border-[var(--border)] bg-[var(--bg-card)]">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2 text-[var(--fg)]">
                  <MessageCircle className="h-6 w-6 text-[var(--color-primary)]" />
                  {content.form_title || 'Bize Mesaj Gönderin'}
                </CardTitle>
                <CardDescription className="text-[var(--fg-muted)]">
                  {content.form_description || 'Formu doldurun, en kısa sürede size dönüş yapalım'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-[var(--fg)]">Ad Soyad *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Adınız ve soyadınız"
                        required
                        className="bg-[var(--bg-input)] border-[var(--border)] text-[var(--fg)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[var(--fg)]">E-posta *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="ornek@email.com"
                        required
                        className="bg-[var(--bg-input)] border-[var(--border)] text-[var(--fg)]"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-[var(--fg)]">Telefon</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+90 (5XX) XXX XX XX"
                        className="bg-[var(--bg-input)] border-[var(--border)] text-[var(--fg)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-[var(--fg)]">Konu *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Mesajınızın konusu"
                        required
                        className="bg-[var(--bg-input)] border-[var(--border)] text-[var(--fg)]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-[var(--fg)]">Mesajınız *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Mesajınızı buraya yazın..."
                      rows={6}
                      required
                      className="bg-[var(--bg-input)] border-[var(--border)] text-[var(--fg)]"
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full md:w-auto">
                    <Send className="h-4 w-4 mr-2" />
                    Mesaj Gönder
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="mt-8 border-[var(--border)] bg-[var(--bg-card)]">
                <CardHeader>
                  <CardTitle className="text-2xl text-[var(--fg)]">Sıkça Sorulan Sorular</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {faqs.map((faq, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + (index * 0.1) }}
                      className="border-b border-[var(--border)] last:border-0 pb-6 last:pb-0"
                    >
                      <h3 className="font-semibold text-lg mb-2 text-[var(--fg)]">{faq.question}</h3>
                      <p className="text-[var(--fg-muted)]">{faq.answer}</p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Contact Info Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              // Only show if content exists (or default exists)
              if (!info.content) return null;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
                >
                  <Card className="border-[var(--border)] bg-[var(--bg-card)]">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[var(--bg-elev)] rounded-full flex items-center justify-center">
                          <Icon className="h-6 w-6 text-[var(--color-primary)]" />
                        </div>
                        <CardTitle className="text-lg text-[var(--fg)]">{info.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[var(--fg-muted)] whitespace-pre-line">{info.content}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                <CardHeader>
                  <CardTitle>Hızlı İşlemler</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="secondary" className="w-full">
                    Ücretsiz Deneme Dersi
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent text-white border-white hover:bg-white hover:text-blue-600">
                    Programları İncele
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="mt-8 border-[var(--border)] bg-[var(--bg-card)]">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2 text-[var(--fg)]">
                <MapPin className="h-6 w-6 text-[var(--color-primary)]" />
                Bizi Ziyaret Edin
              </CardTitle>
              <CardDescription className="text-[var(--fg-muted)]">
                Levent ofisimizde sizi ağırlamaktan mutluluk duyarız
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3008.3936653087887!2d29.011489315415!3d41.08037797929171!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab7650656bd63%3A0x8ca058b28c20b6c3!2sLevent%2C%20Istanbul!5e0!3m2!1sen!2str!4v1234567890123!5m2!1sen!2str"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
