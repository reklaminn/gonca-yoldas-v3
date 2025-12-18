import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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
  Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

const AdminSettings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    site_name: 'Gonca Yoldaş',
    site_email: 'info@goncayoldas.com',
    site_phone: '+90 532 123 45 67',
    site_address: 'İstanbul, Türkiye',
    invoice_enabled: true,
    email_notifications: true,
    sms_notifications: false,
    maintenance_mode: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('general_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('general_settings')
        .upsert(settings);

      if (error) throw error;
      toast.success('Ayarlar başarıyla kaydedildi');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Ayarlar kaydedilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--fg)]">Sistem Ayarları</h1>
        <p className="text-[var(--fg-muted)] mt-2">Genel sistem ayarlarını yönetin</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Site Information */}
        <Card className="border-[var(--border)] bg-[var(--bg-card)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[var(--fg)]">
              <Globe className="h-5 w-5" />
              Site Bilgileri
            </CardTitle>
            <CardDescription className="text-[var(--fg-muted)]">Temel site bilgilerini düzenleyin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site_name">Site Adı</Label>
              <Input
                id="site_name"
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                className="bg-[var(--bg-input)] text-[var(--fg)] border-[var(--border)]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="site_email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                E-posta
              </Label>
              <Input
                id="site_email"
                type="email"
                value={settings.site_email}
                onChange={(e) => setSettings({ ...settings, site_email: e.target.value })}
                className="bg-[var(--bg-input)] text-[var(--fg)] border-[var(--border)]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="site_phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefon
              </Label>
              <Input
                id="site_phone"
                value={settings.site_phone}
                onChange={(e) => setSettings({ ...settings, site_phone: e.target.value })}
                className="bg-[var(--bg-input)] text-[var(--fg)] border-[var(--border)]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="site_address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Adres
              </Label>
              <Input
                id="site_address"
                value={settings.site_address}
                onChange={(e) => setSettings({ ...settings, site_address: e.target.value })}
                className="bg-[var(--bg-input)] text-[var(--fg)] border-[var(--border)]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="border-[var(--border)] bg-[var(--bg-card)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[var(--fg)]">
              <FileText className="h-5 w-5" />
              Özellikler
            </CardTitle>
            <CardDescription className="text-[var(--fg-muted)]">Sistem özelliklerini yönetin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="invoice_enabled">Fatura Sistemi</Label>
                <p className="text-sm text-[var(--fg-muted)]">Sipariş faturalarını etkinleştir</p>
              </div>
              <Switch
                id="invoice_enabled"
                checked={settings.invoice_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, invoice_enabled: checked })}
              />
            </div>

            <Separator className="bg-[var(--border)]" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email_notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  E-posta Bildirimleri
                </Label>
                <p className="text-sm text-[var(--fg-muted)]">Otomatik e-posta gönderimi</p>
              </div>
              <Switch
                id="email_notifications"
                checked={settings.email_notifications}
                onCheckedChange={(checked) => setSettings({ ...settings, email_notifications: checked })}
              />
            </div>

            <Separator className="bg-[var(--border)]" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms_notifications">SMS Bildirimleri</Label>
                <p className="text-sm text-[var(--fg-muted)]">SMS ile bildirim gönder</p>
              </div>
              <Switch
                id="sms_notifications"
                checked={settings.sms_notifications}
                onCheckedChange={(checked) => setSettings({ ...settings, sms_notifications: checked })}
              />
            </div>

            <Separator className="bg-[var(--border)]" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="maintenance_mode" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Bakım Modu
                </Label>
                <p className="text-sm text-[var(--fg-muted)]">Siteyi bakım moduna al</p>
              </div>
              <Switch
                id="maintenance_mode"
                checked={settings.maintenance_mode}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenance_mode: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Ayarları Kaydet
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
