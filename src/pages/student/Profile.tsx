import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, Calendar, Camera, 
  Loader2, Save, X, Building2, ShoppingBag, 
  FileText, CreditCard, Home
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

interface ProfileFormData {
  full_name: string;
  phone: string;
  city: string;
  district: string;
  billing_type: 'individual' | 'corporate';
  tc_number: string;
  tax_office: string;
  tax_number: string;
  company_name: string;
  full_address: string;
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
    billing_type: 'individual',
    tc_number: '',
    tax_office: '',
    tax_number: '',
    company_name: '',
    full_address: '',
  });
  const [orderCount, setOrderCount] = useState(0);
  const [countLoading, setCountLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        city: profile.city || '',
        district: profile.district || '',
        billing_type: (profile.billing_type as 'individual' | 'corporate') || 'individual',
        tc_number: profile.tc_number || '',
        tax_office: profile.tax_office || '',
        tax_number: profile.tax_number || '',
        company_name: profile.company_name || '',
        full_address: profile.full_address || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    const fetchOrderCount = async () => {
      if (!user?.id) return;
      setCountLoading(true);
      try {
        const { count, error } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (error) throw error;
        setOrderCount(count || 0);
      } catch (error) {
        console.error('Error fetching order count:', error);
      } finally {
        setCountLoading(false);
      }
    };

    if (user) fetchOrderCount();
  }, [user]);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        city: profile.city || '',
        district: profile.district || '',
        billing_type: (profile.billing_type as 'individual' | 'corporate') || 'individual',
        tc_number: profile.tc_number || '',
        tax_office: profile.tax_office || '',
        tax_number: profile.tax_number || '',
        company_name: profile.company_name || '',
        full_address: profile.full_address || '',
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
          billing_type: formData.billing_type,
          tc_number: formData.tc_number.trim(),
          tax_office: formData.tax_office.trim(),
          tax_number: formData.tax_number.trim(),
          company_name: formData.company_name.trim(),
          full_address: formData.full_address.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(updatedData);
      setIsEditing(false);
      toast.success('Profil ve fatura bilgileri başarıyla güncellendi');
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
    <div className="space-y-6 pb-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold text-[var(--fg)]">Profil ve Fatura Ayarları</h1>
        <p className="text-[var(--fg-muted)] mt-2">Kişisel bilgilerinizi ve fatura detaylarınızı yönetin</p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sol Kolon: Profil Özeti */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card className="border-[var(--border)] bg-[var(--bg-card)] sticky top-6">
            <CardContent className="pt-8 flex flex-col items-center text-center space-y-6">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-[var(--color-primary)]/20 transition-transform group-hover:scale-105">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={formData.full_name || 'User'} />
                  <AvatarFallback className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-4xl font-bold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-10 w-10 shadow-lg" disabled={loading}>
                  <Camera className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-[var(--fg)]">{formData.full_name || 'Kullanıcı'}</h2>
                <p className="text-[var(--fg-muted)] flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" /> {user?.email}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 w-full">
                <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-[var(--fg-muted)]">Toplam Sipariş</span>
                  </div>
                  {countLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-[var(--color-primary)]" />
                  ) : (
                    <span className="text-xl font-bold text-[var(--fg)]">{orderCount}</span>
                  )}
                </div>
              </div>

              <div className="w-full pt-4 border-t border-[var(--border)]">
                <p className="text-xs text-[var(--fg-muted)] flex items-center justify-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Üyelik: {user?.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR') : '-'}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sağ Kolon: Formlar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Kişisel Bilgiler */}
          <Card className="border-[var(--border)] bg-[var(--bg-card)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <User className="h-5 w-5 text-[var(--color-primary)]" />
                  Kişisel Bilgiler
                </CardTitle>
                <CardDescription>İletişim ve profil detaylarınız</CardDescription>
              </div>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Düzenle</Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Ad Soyad *</Label>
                  <Input id="fullName" value={formData.full_name} onChange={(e) => handleInputChange('full_name', e.target.value)} disabled={!isEditing} className="bg-[var(--bg)]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} disabled={!isEditing} className="bg-[var(--bg)]" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Şehir</Label>
                  <Input id="city" value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)} disabled={!isEditing} className="bg-[var(--bg)]" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">İlçe</Label>
                  <Input id="district" value={formData.district} onChange={(e) => handleInputChange('district', e.target.value)} disabled={!isEditing} className="bg-[var(--bg)]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fatura Bilgileri */}
          <Card className="border-[var(--border)] bg-[var(--bg-card)]">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-[var(--color-primary)]" />
                Fatura Bilgileri
              </CardTitle>
              <CardDescription>Siparişleriniz için kullanılacak fatura detayları</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Fatura Tipi</Label>
                <RadioGroup 
                  value={formData.billing_type} 
                  onValueChange={(val) => handleInputChange('billing_type', val as 'individual' | 'corporate')}
                  disabled={!isEditing}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="individual" id="individual" />
                    <Label htmlFor="individual" className="cursor-pointer">Bireysel</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="corporate" id="corporate" />
                    <Label htmlFor="corporate" className="cursor-pointer">Kurumsal</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid gap-4">
                {formData.billing_type === 'individual' ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="tc_number">T.C. Kimlik No</Label>
                    <Input 
                      id="tc_number" 
                      value={formData.tc_number} 
                      onChange={(e) => handleInputChange('tc_number', e.target.value)} 
                      disabled={!isEditing}
                      placeholder="11 haneli T.C. No"
                      maxLength={11}
                      className="bg-[var(--bg)]"
                    />
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Şirket Ünvanı</Label>
                      <Input 
                        id="company_name" 
                        value={formData.company_name} 
                        onChange={(e) => handleInputChange('company_name', e.target.value)} 
                        disabled={!isEditing}
                        placeholder="Resmi şirket adı"
                        className="bg-[var(--bg)]"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tax_office">Vergi Dairesi</Label>
                        <Input 
                          id="tax_office" 
                          value={formData.tax_office} 
                          onChange={(e) => handleInputChange('tax_office', e.target.value)} 
                          disabled={!isEditing}
                          className="bg-[var(--bg)]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tax_number">Vergi Numarası</Label>
                        <Input 
                          id="tax_number" 
                          value={formData.tax_number} 
                          onChange={(e) => handleInputChange('tax_number', e.target.value)} 
                          disabled={!isEditing}
                          className="bg-[var(--bg)]"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="full_address" className="flex items-center gap-2">
                    <Home className="h-4 w-4" /> Tam Adres
                  </Label>
                  <Textarea 
                    id="full_address" 
                    value={formData.full_address} 
                    onChange={(e) => handleInputChange('full_address', e.target.value)} 
                    disabled={!isEditing}
                    placeholder="Fatura için açık adresinizi giriniz..."
                    className="bg-[var(--bg)] min-h-[100px] resize-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kaydet/İptal Butonları */}
          {isEditing && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-end gap-3"
            >
              <Button variant="outline" onClick={handleCancel} disabled={loading}>
                <X className="h-4 w-4 mr-2" /> İptal
              </Button>
              <Button onClick={handleSave} disabled={loading} className="bg-[var(--color-primary)]">
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Kaydediliyor...</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" /> Değişiklikleri Kaydet</>
                )}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
