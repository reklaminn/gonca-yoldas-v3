import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { usePageContent } from '@/hooks/usePageContent';
import { supabase } from '@/lib/supabaseClient'; // Hatalı yol düzeltildi
import { toast } from 'sonner';

const Contact: React.FC = () => {
  const { content, loading } = usePageContent('contact');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userIp, setUserIp] = useState<string>('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  // IP adresini al
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setUserIp(data.ip))
      .catch(() => setUserIp('unknown'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            subject: formData.subject,
            message: formData.message,
            ip_address: userIp,
            referer_page: window.location.href,
            status: 'new'
          }
        ]);

      if (error) throw error;

      setIsSuccess(true);
      toast.success('Mesajınız başarıyla iletildi.');
      
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setIsSuccess(false), 5000);

    } catch (error: any) {
      console.error('Form submission error:', error);
      toast.error('Mesaj gönderilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactInfo = [
    { icon: MapPin, title: 'Adres', content: content.address || 'Nispetiye Cad. No:12/A\nLevent, İstanbul' },
    { icon: Phone, title: 'Telefon', content: content.phone || '+90 (212) 123 45 67' },
    { icon: Mail, title: 'E-posta', content: content.email || 'info@goncayoldas.com' },
    { icon: Clock, title: 'Çalışma Saatleri', content: content.hours || 'Pzt - Cum: 09:00 - 18:00' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <Loader2 className="h-12 w-12 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16"
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            {content.hero_title || 'Bizimle İletişime Geçin'}
          </h1>
          <p className="text-xl text-blue-100">
            {content.hero_description || 'Sorularınız için buradayız.'}
          </p>
        </div>
      </motion.section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
            <Card className="border-[var(--border)] bg-[var(--bg-card)]">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2 text-[var(--fg)]">
                  <MessageCircle className="h-6 w-6 text-[var(--color-primary)]" />
                  Bize Mesaj Gönderin
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isSuccess ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--fg)]">Mesajınız Alındı!</h3>
                    <Button variant="outline" onClick={() => setIsSuccess(false)}>Yeni Mesaj Gönder</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-[var(--fg)]">Ad Soyad *</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} required disabled={isSubmitting} className="bg-[var(--bg-input)] border-[var(--border)] text-[var(--fg)]" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-[var(--fg)]">E-posta *</Label>
                        <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required disabled={isSubmitting} className="bg-[var(--bg-input)] border-[var(--border)] text-[var(--fg)]" />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-[var(--fg)]">Telefon</Label>
                        <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} disabled={isSubmitting} className="bg-[var(--bg-input)] border-[var(--border)] text-[var(--fg)]" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-[var(--fg)]">Konu *</Label>
                        <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} required disabled={isSubmitting} className="bg-[var(--bg-input)] border-[var(--border)] text-[var(--fg)]" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-[var(--fg)]">Mesajınız *</Label>
                      <Textarea id="message" name="message" value={formData.message} onChange={handleChange} rows={6} required disabled={isSubmitting} className="bg-[var(--bg-input)] border-[var(--border)] text-[var(--fg)]" />
                    </div>
                    <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isSubmitting}>
                      {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Gönderiliyor...</> : <><Send className="h-4 w-4 mr-2" /> Mesaj Gönder</>}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <div className="lg:col-span-1 space-y-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <Card key={index} className="border-[var(--border)] bg-[var(--bg-card)]">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[var(--bg-elev)] rounded-full flex items-center justify-center">
                        <Icon className="h-5 w-5 text-[var(--color-primary)]" />
                      </div>
                      <CardTitle className="text-lg text-[var(--fg)]">{info.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent><p className="text-[var(--fg-muted)] whitespace-pre-line">{info.content}</p></CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
