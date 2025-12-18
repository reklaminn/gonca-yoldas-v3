import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Bell, 
  Lock, 
  Globe,
  Save,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export default function Settings() {
  const { user, profile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    city: profile?.city || '',
    district: profile?.district || '',
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    lessonReminders: true,
    progressReports: true,
  });

  const handleSaveProfile = async () => {
    setLoading(true);
    // Save profile logic here
    setTimeout(() => {
      setLoading(false);
      toast.success('Profil bilgileriniz güncellendi');
    }, 1000);
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    // Save notifications logic here
    setTimeout(() => {
      setLoading(false);
      toast.success('Bildirim ayarlarınız güncellendi');
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--fg)]">Ayarlar</h1>
        <p className="text-[var(--fg-muted)] mt-2">Hesap ve bildirim ayarlarınızı yönetin</p>
      </div>

      {/* Profile Settings */}
      <Card className="border-[var(--border)] bg-[var(--bg-card)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-[var(--color-primary)]" />
            <CardTitle className="text-[var(--fg)]">Profil Bilgileri</CardTitle>
          </div>
          <CardDescription className="text-[var(--fg-muted)]">
            Kişisel bilgilerinizi güncelleyin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-[var(--fg)]">Ad Soyad</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="bg-[var(--bg-input)] text-[var(--fg)] border-[var(--border)]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[var(--fg)]">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-[var(--bg-input)] text-[var(--fg)] border-[var(--border)] opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[var(--fg)]">Telefon</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-[var(--bg-input)] text-[var(--fg)] border-[var(--border)]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" className="text-[var(--fg)]">İl</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="bg-[var(--bg-input)] text-[var(--fg)] border-[var(--border)]"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="district" className="text-[var(--fg)]">İlçe</Label>
              <Input
                id="district"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="bg-[var(--bg-input)] text-[var(--fg)] border-[var(--border)]"
              />
            </div>
          </div>
          <Button onClick={handleSaveProfile} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Kaydet
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border-[var(--border)] bg-[var(--bg-card)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-[var(--color-primary)]" />
            <CardTitle className="text-[var(--fg)]">Bildirim Ayarları</CardTitle>
          </div>
          <CardDescription className="text-[var(--fg-muted)]">
            Bildirim tercihlerinizi yönetin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-[var(--fg)]">E-posta Bildirimleri</Label>
              <p className="text-sm text-[var(--fg-muted)]">
                Önemli güncellemeler için e-posta alın
              </p>
            </div>
            <Switch
              checked={notifications.emailNotifications}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, emailNotifications: checked })
              }
            />
          </div>
          <Separator className="bg-[var(--border)]" />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-[var(--fg)]">SMS Bildirimleri</Label>
              <p className="text-sm text-[var(--fg-muted)]">
                Ders hatırlatmaları için SMS alın
              </p>
            </div>
            <Switch
              checked={notifications.smsNotifications}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, smsNotifications: checked })
              }
            />
          </div>
          <Separator className="bg-[var(--border)]" />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-[var(--fg)]">Ders Hatırlatmaları</Label>
              <p className="text-sm text-[var(--fg-muted)]">
                Yaklaşan dersler için hatırlatma alın
              </p>
            </div>
            <Switch
              checked={notifications.lessonReminders}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, lessonReminders: checked })
              }
            />
          </div>
          <Separator className="bg-[var(--border)]" />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-[var(--fg)]">İlerleme Raporları</Label>
              <p className="text-sm text-[var(--fg-muted)]">
                Haftalık ilerleme raporları alın
              </p>
            </div>
            <Switch
              checked={notifications.progressReports}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, progressReports: checked })
              }
            />
          </div>
          <Button onClick={handleSaveNotifications} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Kaydet
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="border-[var(--border)] bg-[var(--bg-card)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-[var(--color-primary)]" />
            <CardTitle className="text-[var(--fg)]">Güvenlik</CardTitle>
          </div>
          <CardDescription className="text-[var(--fg-muted)]">
            Hesap güvenliği ayarları
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            <Lock className="mr-2 h-4 w-4" />
            Şifre Değiştir
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
