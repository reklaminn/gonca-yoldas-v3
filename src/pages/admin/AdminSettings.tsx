import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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
  EyeOff
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

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
      
      if (genData) setGeneralSettings(prev => ({ ...prev, ...genData }));

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

        {/* SMTP Settings */}
        <Card className="border-[var(--border)] bg-[var(--bg-card)]">
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
