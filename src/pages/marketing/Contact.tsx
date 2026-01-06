import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MapPin, Phone, Mail, Send, MessageCircle, Loader2 } from 'lucide-react';
import { usePageContent } from '@/hooks/usePageContent';
import { getGeneralSettings, GeneralSettings } from '@/services/generalSettings';
import { toast } from 'sonner';
import { sendContactEvent } from '@/services/sendpulse';
import { useNavigate } from 'react-router-dom';

const Contact: React.FC = () => {
  const { content, loading: contentLoading } = usePageContent('contact');
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userIp, setUserIp] = useState<string>('');
  
  // SPAM KORUMASI İÇİN REFERANSLAR
  const formLoadTime = useRef<number>(Date.now()); // Sayfa ne zaman yüklendi?
  const [honeypot, setHoneypot] = useState(''); // Botlar için gizli alan

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getGeneralSettings();
        setSettings(data);
      } catch (e) {
        console.error('Settings fetch error:', e);
      } finally {
        setSettingsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setUserIp(data.ip))
      .catch(() => setUserIp('unknown'));
  }, []);

  const checkRateLimit = () => {
    const STORAGE_KEY = 'contact_form_attempts';
    const MAX_ATTEMPTS = 3;
    const TIME_WINDOW = 5 * 60 * 1000; // 5 dakika

    try {
      const attempts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const now = Date.now();
      
      // Süresi geçmiş denemeleri temizle
      const recentAttempts = attempts.filter((timestamp: number) => now - timestamp < TIME_WINDOW);
      
      if (recentAttempts.length >= MAX_ATTEMPTS) {
        return false;
      }

      // Yeni denemeyi ekle
      recentAttempts.push(now);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentAttempts));
      return true;
    } catch {
      return true; // LocalStorage hatası olursa engelleme
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- SPAM KORUMASI KONTROLLERİ ---
    
    // 1. Honeypot Kontrolü: Eğer gizli alan doluysa bottur.
    if (honeypot) {
      console.warn('Bot detected: Honeypot filled');
      // Botu kandırmak için başarılı gibi davranabiliriz veya sessizce dönebiliriz
      return; 
    }

    // 2. Zaman Kontrolü: Form çok hızlı gönderildiyse (örn: 2 saniyeden az)
    const timeElapsed = Date.now() - formLoadTime.current;
    if (timeElapsed < 2000) {
      console.warn('Bot detected: Form submitted too quickly');
      toast.error('Lütfen formu doldurmak için biraz bekleyin.');
      return;
    }

    // 3. Rate Limit Kontrolü
    if (!checkRateLimit()) {
      toast.error('Çok fazla mesaj gönderdiniz. Lütfen 5 dakika bekleyin.');
      return;
    }

    // --- NORMAL AKIŞ ---

    setIsSubmitting(true);
    console.log('🚀 Form submission started...');

    try {
      // 1. ÖNCE VERİTABANINA KAYDET (Direct REST API ile)
      console.log('💾 Step 1: Saving to Supabase DB (via REST API)...');
      
      const insertPayload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        ip_address: userIp,
        referer_page: window.location.href,
        status: 'new'
      };
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase environment variables missing');
      }

      // Direct Fetch Call
      const response = await fetch(`${supabaseUrl}/rest/v1/contact_submissions`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(insertPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ REST API Error:', errorText);
        throw new Error(`Database save failed: ${response.status}`);
      }

      const responseData = await response.json();
      const submission = responseData[0];

      if (!submission) {
        throw new Error('No submission ID returned');
      }

      console.log('✅ Saved to Supabase successfully. ID:', submission.id);

      // 2. SENDPULSE'A GÖNDER (Edge Function Invoke)
      console.log('📧 Step 2: Invoking SendPulse Edge Function...');
      
      try {
        await sendContactEvent({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message
        }, submission.id);
        console.log('✅ SendPulse process completed.');
      } catch (spError) {
        console.warn('⚠️ SendPulse failed but DB save was successful:', spError);
      }

      // 3. BAŞARI VE YÖNLENDİRME
      toast.success('Mesajınız başarıyla alındı.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      navigate('/tesekkurler');

    } catch (error: any) {
      console.error('❌ Form submission error:', error);
      toast.error(`Mesaj gönderilemedi: ${error.message || 'Bilinmeyen hata'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Boş olan iletişim bilgilerini filtrele
  const contactInfo = [
    { 
      icon: MapPin, 
      title: 'Adres', 
      content: settings?.address 
    },
    { 
      icon: Phone, 
      title: 'Telefon', 
      content: settings?.phone 
    },
    { 
      icon: Mail, 
      title: 'E-posta', 
      content: settings?.contact_email 
    },
  ].filter(info => info.content && info.content.trim() !== '');

  if (contentLoading || settingsLoading) {
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
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* HONEYPOT FIELD (Hidden from users, visible to bots) */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="website_url">Website</label>
                    <input
                      type="text"
                      id="website_url"
                      name="website_url"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

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
