import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, Camera, Loader2, Save, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

interface ProfileFormData {
  full_name: string;
  phone: string;
  city: string;
  district: string;
}

const Profile: React.FC = () => {
  const { user, profile, setProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    phone: '',
    city: '',
    district: '',
  });

  // Load profile data from the store
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        city: profile.city || '',
        district: profile.district || '',
      });
    }
  }, [profile]);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        city: profile.city || '',
        district: profile.district || '',
      });
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!user?.id) {
      toast.error('Kullanıcı bilgisi bulunamadı');
      return;
    }

    if (!formData.full_name.trim()) {
      toast.error('Ad Soyad alanı zorunludur');
      return;
    }

    setLoading(true);
    try {
      const { data: updatedData, error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim(),
          city: formData.city.trim(),
          district: formData.district.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(updatedData);
      setIsEditing(false);
      toast.success('Profil başarıyla güncellendi');
    } catch (error: any) {
      toast.error(`Profil güncellenemedi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getUserInitials = () => {
    const name = formData.full_name || profile?.full_name || '';
    if (!name) return user?.email?.[0].toUpperCase() || 'U';
    const names = name.split(' ');
    return names.length >= 2
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : names[0][0].toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-[var(--fg)]">Profil</h1>
        <p className="text-[var(--fg-muted)] mt-2">
          Profil bilgilerinizi görüntüleyin ve düzenleyin
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card className="border-[var(--border)] bg-[var(--bg-card)]">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-[var(--color-primary)]/20">
                    <AvatarImage src={profile?.avatar_url || undefined} alt={formData.full_name || 'User'} />
                    <AvatarFallback className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-3xl font-bold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full h-10 w-10"
                    disabled={loading}
                  >
                    <Camera className="h-5 w-5" />
                  </Button>
                </div>

                {/* User Info */}
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-[var(--fg)]">
                    {formData.full_name || 'Kullanıcı'}
                  </h2>
                  <p className="text-[var(--fg-muted)]">{user?.email}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 w-full pt-4 border-t border-[var(--border)]">
                  <div>
                    <p className="text-2xl font-bold text-[var(--fg)]">3</p>
                    <p className="text-xs text-[var(--fg-muted)]">Kurs</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--fg)]">65%</p>
                    <p className="text-xs text-[var(--fg-muted)]">İlerleme</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--fg)]">2</p>
                    <p className="text-xs text-[var(--fg-muted)]">Sertifika</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="border-[var(--border)] bg-[var(--bg-card)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[var(--fg)]">Kişisel Bilgiler</CardTitle>
                  <CardDescription className="text-[var(--fg-muted)]">
                    Profil bilgilerinizi güncelleyin
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={loading}
                      >
                        <X className="h-4 w-4 mr-2" />
                        İptal
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Kaydediliyor...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Kaydet
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                    >
                      Düzenle
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2 text-[var(--fg)]">
                  <User className="h-4 w-4" />
                  Ad Soyad *
                </Label>
                <Input
                  id="fullName"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  disabled={!isEditing || loading}
                  className="border-[var(--border)] bg-[var(--bg)] text-[var(--fg)]"
                  placeholder="Ad Soyad giriniz"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-[var(--fg)]">
                  <Mail className="h-4 w-4" />
                  E-posta
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="border-[var(--border)] bg-[var(--bg-muted)] text-[var(--fg-muted)] cursor-not-allowed"
                />
                <p className="text-xs text-[var(--fg-muted)]">
                  E-posta adresi değiştirilemez
                </p>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 text-[var(--fg)]">
                  <Phone className="h-4 w-4" />
                  Telefon
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+90 (5XX) XXX XX XX"
                  disabled={!isEditing || loading}
                  className="border-[var(--border)] bg-[var(--bg)] text-[var(--fg)]"
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city" className="flex items-center gap-2 text-[var(--fg)]">
                  <MapPin className="h-4 w-4" />
                  Şehir
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Şehir giriniz"
                  disabled={!isEditing || loading}
                  className="border-[var(--border)] bg-[var(--bg)] text-[var(--fg)]"
                />
              </div>

              {/* District */}
              <div className="space-y-2">
                <Label htmlFor="district" className="flex items-center gap-2 text-[var(--fg)]">
                  <MapPin className="h-4 w-4" />
                  İlçe
                </Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  placeholder="İlçe giriniz"
                  disabled={!isEditing || loading}
                  className="border-[var(--border)] bg-[var(--bg)] text-[var(--fg)]"
                />
              </div>

              {/* Member Since */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-[var(--fg)]">
                  <Calendar className="h-4 w-4" />
                  Üyelik Tarihi
                </Label>
                <Input
                  value={user?.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                  disabled
                  className="border-[var(--border)] bg-[var(--bg-muted)] text-[var(--fg-muted)] cursor-not-allowed"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
