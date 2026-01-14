import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings as SettingsIcon,
  Save,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  Shield,
  Bell,
  Loader2,
  Server,
  Lock,
  Eye,
  EyeOff,
  CreditCard,
  ShieldCheck,
  Image as ImageIcon
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { AgeGroupsManager } from '@/components/admin/AgeGroupsManager';
import type { SecurityBadge } from '@/services/generalSettings';

const AdminSettings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [generalSettings, setGeneralSettings] = useState({
    site_name: 'Gonca Yoldaş',
    site_email: 'info@goncayoldas.com',
    site_phone: '+90 532 123 45 67',
    site_address: 'İstanbul, Türkiye',
    invoice_enabled: true,
    email_notifications: true,
    maintenance_mode: false,
    footer_payment_message: 'Ödeme bilgileriniz 256-bit SSL sertifikası ile şifrelenir ve güvenli bir şekilde işlenir.',
    footer_payment_badge_url: 'https://www.esasartdesign.com/contents/img/temp/logo-band_iyzico_ile_ode1x.png',
    footer_security_badges: [
      { id: 'ssl', label: 'SSL Güvenliği', enabled: true },
      { id: '3d_secure', label: '3D Secure', enabled: true },
      { id: 'pci_dss', label: 'PCI DSS', enabled: true }
    ] as SecurityBadge[]
  });

  const [smtpSettings, setSmtpSettings] = useState({
    host: '',
    port: 587,
    user_email: '',
    password: '',
    from_name: '',
    encryption: 'tls'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Fetch General Settings
      const { data: genData } = await supabase
        .from('general_settings')
        .select('*')
        .single();
      
      if (genData) {
        // Parse security badges if it's a string
        if (typeof genData.footer_security_badges === 'string') {
          genData.footer_security_badges = JSON.parse(genData.footer_security_badges);
        }
        setGeneralSettings(prev => ({ ...prev, ...genData }));
      }

      // Fetch SMTP Settings
      const { data: smtpData } = await supabase
        .from('smtp_settings')
        .select('*')
        .single();
      
      if (smtpData) setSmtpSettings(smtpData);

    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Save General Settings
      const { error: genError } = await supabase
        .from('general_settings')
        .upsert(generalSettings);

      if (genError) throw genError;

      // Save SMTP Settings
      const { error: smtpError } = await supabase
        .from('smtp_settings')
        .upsert(smtpSettings);

      if (smtpError) throw smtpError;

      toast.success('Tüm ayarlar başarıyla kaydedildi');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error('Ayarlar kaydedilirken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityBadgeToggle = (badgeId: string, enabled: boolean) => {
    setGeneralSettings(prev => ({
      ...prev,
      footer_security_badges: prev.footer_security_badges.map(badge =>
        badge.id === badgeId ? { ...badge, enabled } : badge
      )
    }));
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--fg)]">Sistem Ayarları</h1>
          <p className="text-[var(--fg-muted)] mt-2">Site genel ayarları ve e-posta yapılandırması</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90"
        >
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Değişiklikleri Kaydet
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Site Information */}
        <Card className="border-[var(--border)] bg-[var(--bg-card)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[var(--fg)]">
              <Globe className="h-5 w-5 text-[var(--color-primary)]" />
              Site Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Site Adı</Label>
              <Input
                value={generalSettings.site_name}
                onChange={(e) => setGeneralSettings({ ...generalSettings, site_name: e.target.value })}
                className="bg-[var(--bg-input)] border-[var(--border)]"
              />
            </div>
            <div className="space-y-2">
              <Label>İletişim E-postası</Label>
              <Input
                type="email"
                value={generalSettings.site_email}
                onChange={(e) => setGeneralSettings({ ...generalSettings, site_email: e.target.value })}
                className="bg-[var(--bg-input)] border-[var(--border)]"
              />
            </div>
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input
                value={generalSettings.site_phone}
                onChange={(e) => setGeneralSettings({ ...generalSettings, site_phone: e.target.value })}
                className="bg-[var(--bg-input)] border-[var(--border)]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Age Groups Manager */}
        <AgeGroupsManager />

        {/* 🆕 Footer Payment Settings */}
        <Card className="border-[var(--border)] bg-[var(--bg-card)] lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[var(--fg)]">
              <CreditCard className="h-5 w-5 text-[var(--color-primary)]" />
              Footer Ödeme Güvenlik Ayarları
            </CardTitle>
            <CardDescription>Footer'da görünen ödeme güvenlik mesajı ve badge'leri</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Security Message */}
            <div className="space-y-2">
              <Label>Güvenlik Mesajı</Label>
              <Textarea
                placeholder="Ödeme bilgileriniz 256-bit SSL sertifikası ile şifrelenir..."
                value={generalSettings.footer_payment_message}
                onChange={(e) => setGeneralSettings({ ...generalSettings, footer_payment_message: e.target.value })}
                className="bg-[var(--bg-input)] border-[var(--border)]"
                rows={3}
              />
              <p className="text-xs text-[var(--fg-muted)]">
                Footer'da görünen güvenlik mesajı
              </p>
            </div>

            {/* Payment Badge URL */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Ödeme Badge URL
              </Label>
              <Input
                placeholder="https://example.com/payment-badge.png"
                value={generalSettings.footer_payment_badge_url}
                onChange={(e) => setGeneralSettings({ ...generalSettings, footer_payment_badge_url: e.target.value })}
                className="bg-[var(--bg-input)] border-[var(--border)]"
              />
              <p className="text-xs text-[var(--fg-muted)]">
                İyzico veya başka ödeme sağlayıcı badge'i URL'si
              </p>
              {/* Preview */}
              {generalSettings.footer_payment_badge_url && (
                <div className="mt-3 p-4 rounded-lg border border-[var(--border)] bg-[var(--bg)]">
                  <p className="text-xs text-[var(--fg-muted)] mb-2">Önizleme:</p>
                  <img 
                    src={generalSettings.footer_payment_badge_url} 
                    alt="Payment Badge Preview" 
                    className="h-12 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <Separator />

            {/* Security Badges */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Güvenlik Badge'leri
              </Label>
              <div className="grid md:grid-cols-3 gap-4">
                {generalSettings.footer_security_badges.map((badge) => (
                  <div 
                    key={badge.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] bg-[var(--bg)]"
                  >
                    <div className="space-y-0.5">
                      <Label className="text-sm">{badge.label}</Label>
                      <p className="text-xs text-[var(--fg-muted)]">
                        {badge.id === 'ssl' && 'SSL Güvenliği'}
                        {badge.id === '3d_secure' && '3D Secure'}
                        {badge.id === 'pci_dss' && 'PCI DSS'}
                      </p>
                    </div>
                    <Switch
                      checked={badge.enabled}
                      onCheckedChange={(checked) => handleSecurityBadgeToggle(badge.id, checked)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SMTP Settings */}
        <Card className="border-[var(--border)] bg-[var(--bg-card)] lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[var(--fg)]">
              <Server className="h-5 w-5 text-[var(--color-primary)]" />
              SMTP E-posta Ayarları
            </CardTitle>
            <CardDescription>İletişim formunun mail gönderebilmesi için gereklidir</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>SMTP Host</Label>
                <Input
                  placeholder="smtp.gmail.com"
                  value={smtpSettings.host}
                  onChange={(e) => setSmtpSettings({ ...smtpSettings, host: e.target.value })}
                  className="bg-[var(--bg-input)] border-[var(--border)]"
                />
              </div>
              <div className="space-y-2">
                <Label>Port</Label>
                <Input
                  type="number"
                  placeholder="587"
                  value={smtpSettings.port}
                  onChange={(e) => setSmtpSettings({ ...smtpSettings, port: parseInt(e.target.value) })}
                  className="bg-[var(--bg-input)] border-[var(--border)]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>E-posta / Kullanıcı Adı</Label>
              <Input
                type="email"
                placeholder="ornek@gmail.com"
                value={smtpSettings.user_email}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, user_email: e.target.value })}
                className="bg-[var(--bg-input)] border-[var(--border)]"
              />
            </div>

            <div className="space-y-2">
              <Label>Şifre / Uygulama Şifresi</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={smtpSettings.password}
                  onChange={(e) => setSmtpSettings({ ...smtpSettings, password: e.target.value })}
                  className="bg-[var(--bg-input)] border-[var(--border)] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gönderen Adı</Label>
                <Input
                  placeholder="Gonca Yoldaş"
                  value={smtpSettings.from_name}
                  onChange={(e) => setSmtpSettings({ ...smtpSettings, from_name: e.target.value })}
                  className="bg-[var(--bg-input)] border-[var(--border)]"
                />
              </div>
              <div className="space-y-2">
                <Label>Şifreleme</Label>
                <Select 
                  value={smtpSettings.encryption} 
                  onValueChange={(val) => setSmtpSettings({ ...smtpSettings, encryption: val })}
                >
                  <SelectTrigger className="bg-[var(--bg-input)] border-[var(--border)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tls">TLS (Önerilen)</SelectItem>
                    <SelectItem value="ssl">SSL</SelectItem>
                    <SelectItem value="none">Yok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Features */}
        <Card className="border-[var(--border)] bg-[var(--bg-card)] lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[var(--fg)]">
              <Shield className="h-5 w-5 text-[var(--color-primary)]" />
              Sistem Durumu
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] bg-[var(--bg)]">
              <div className="space-y-0.5">
                <Label>E-posta Bildirimleri</Label>
                <p className="text-xs text-[var(--fg-muted)]">Form sonrası mail gönderimi</p>
              </div>
              <Switch
                checked={generalSettings.email_notifications}
                onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, email_notifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] bg-[var(--bg)]">
              <div className="space-y-0.5">
                <Label>Fatura Sistemi</Label>
                <p className="text-xs text-[var(--fg-muted)]">Otomatik fatura oluşturma</p>
              </div>
              <Switch
                checked={generalSettings.invoice_enabled}
                onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, invoice_enabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] bg-[var(--bg)]">
              <div className="space-y-0.5">
                <Label className="text-red-500">Bakım Modu</Label>
                <p className="text-xs text-[var(--fg-muted)]">Siteyi ziyaretçilere kapat</p>
              </div>
              <Switch
                checked={generalSettings.maintenance_mode}
                onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, maintenance_mode: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
