import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Users as UsersIcon, 
  Search, 
  UserPlus,
  MoreVertical,
  Mail,
  Calendar,
  BookOpen,
  Edit,
  Loader2,
  X,
  Save,
  User,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  phone?: string;
  city?: string;
  district?: string;
  created_at: string;
}

interface EditFormData {
  full_name: string;
  email: string;
  role: string;
  phone: string;
  city: string;
  district: string;
}

const AdminStudents: React.FC = () => {
  const { session } = useAuthStore();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  
  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    full_name: '',
    email: '',
    role: 'user',
    phone: '',
    city: '',
    district: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    console.log('👥 [AdminStudents] Component mounted');
    
    if (session?.access_token) {
      fetchProfiles();
    } else {
      console.error('❌ [AdminStudents] No access token available!');
      setLoading(false);
      toast.error('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
    }
  }, [session?.access_token]);

  const fetchProfiles = async () => {
    if (!session?.access_token) {
      console.error('❌ [AdminStudents] Cannot fetch without token');
      return;
    }

    try {
      console.log('👥 [AdminStudents] Fetching profiles...');
      setLoading(true);

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?select=id,full_name,email,role,phone,city,district,created_at&order=created_at.desc`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [AdminStudents] Fetch failed:', response.status, errorData);
        throw new Error(`HTTP ${response.status}: ${errorData.message || 'Fetch failed'}`);
      }

      const data = await response.json();
      console.log('✅ [AdminStudents] Profiles loaded:', data.length);
      setProfiles(data || []);
    } catch (error: any) {
      console.error('❌ [AdminStudents] Error fetching profiles:', error);
      toast.error('Kullanıcılar yüklenirken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (profile: Profile) => {
    console.log('✏️ [AdminStudents] Opening edit modal for:', profile.id);
    setEditingUser(profile);
    setEditFormData({
      full_name: profile.full_name || '',
      email: profile.email || '',
      role: profile.role || 'user',
      phone: profile.phone || '',
      city: profile.city || '',
      district: profile.district || ''
    });
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
    setEditFormData({
      full_name: '',
      email: '',
      role: 'user',
      phone: '',
      city: '',
      district: ''
    });
  };

  const handleInputChange = (field: keyof EditFormData, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveUser = async () => {
    if (!editingUser || !session?.access_token) {
      toast.error('Kullanıcı bilgisi bulunamadı');
      return;
    }

    // Validation
    if (!editFormData.full_name.trim()) {
      toast.error('İsim alanı zorunludur');
      return;
    }

    if (!editFormData.email.trim()) {
      toast.error('E-posta alanı zorunludur');
      return;
    }

    try {
      console.log('💾 [AdminStudents] Saving user:', editingUser.id);
      setIsSaving(true);

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${editingUser.id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            full_name: editFormData.full_name.trim(),
            email: editFormData.email.trim(),
            role: editFormData.role,
            phone: editFormData.phone.trim(),
            city: editFormData.city.trim(),
            district: editFormData.district.trim()
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [AdminStudents] Save failed:', response.status, errorData);
        throw new Error(`HTTP ${response.status}: ${errorData.message || 'Save failed'}`);
      }

      const updatedData = await response.json();
      console.log('✅ [AdminStudents] User updated:', updatedData);

      // Update local state
      setProfiles(prev => prev.map(p => 
        p.id === editingUser.id ? { ...p, ...updatedData[0] } : p
      ));

      toast.success('Kullanıcı başarıyla güncellendi!');
      handleCloseModal();
    } catch (error: any) {
      console.error('❌ [AdminStudents] Error saving user:', error);
      toast.error('Kullanıcı güncellenirken hata oluştu: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const config = {
      admin: { label: 'Admin', variant: 'default' as const },
      instructor: { label: 'Eğitmen', variant: 'secondary' as const },
      student: { label: 'Öğrenci', variant: 'outline' as const },
      user: { label: 'Öğrenci', variant: 'outline' as const },
    };
    const roleConfig = config[role as keyof typeof config] || config.student;
    return <Badge variant={roleConfig.variant}>{roleConfig.label}</Badge>;
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        profile.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || profile.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const stats = [
    {
      label: 'Toplam Kullanıcı',
      value: profiles.length,
      icon: UsersIcon,
      color: 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
    },
    {
      label: 'Öğrenci',
      value: profiles.filter(p => p.role === 'student' || p.role === 'user').length,
      icon: BookOpen,
      color: 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400'
    },
    {
      label: 'Eğitmen',
      value: profiles.filter(p => p.role === 'instructor').length,
      icon: UsersIcon,
      color: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400'
    },
    {
      label: 'Admin',
      value: profiles.filter(p => p.role === 'admin').length,
      icon: Shield,
      color: 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Kullanıcılar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kullanıcı Yönetimi</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Tüm kullanıcıları görüntüleyin ve yönetin</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
            <UserPlus className="h-4 w-4 mr-2" />
            Yeni Kullanıcı
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-gray-200 dark:border-gray-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="border-gray-200 dark:border-gray-800">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Kullanıcı ara (isim, e-posta)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300 dark:border-gray-700"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedRole === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedRole('all')}
                size="sm"
              >
                Tümü
              </Button>
              <Button
                variant={selectedRole === 'student' ? 'default' : 'outline'}
                onClick={() => setSelectedRole('student')}
                size="sm"
              >
                Öğrenci
              </Button>
              <Button
                variant={selectedRole === 'instructor' ? 'default' : 'outline'}
                onClick={() => setSelectedRole('instructor')}
                size="sm"
              >
                Eğitmen
              </Button>
              <Button
                variant={selectedRole === 'admin' ? 'default' : 'outline'}
                onClick={() => setSelectedRole('admin')}
                size="sm"
              >
                Admin
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Kullanıcı Listesi ({filteredProfiles.length})</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">Sistemdeki tüm kullanıcılar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProfiles.map((profile) => (
              <div key={profile.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-100 dark:border-gray-800">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {profile.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{profile.full_name || 'İsimsiz'}</h3>
                    {getRoleBadge(profile.role)}
                  </div>
                  <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{profile.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span>Kayıt: {new Date(profile.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEditClick(profile)}
                    className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-500 dark:hover:border-blue-500 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                    title="Düzenle"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => toast.info('Daha fazla seçenek yakında...')}
                    className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                    title="Daha fazla seçenek"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {filteredProfiles.length === 0 && (
              <div className="text-center py-12">
                <UsersIcon className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">Kullanıcı bulunamadı</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Arama kriterlerinizi değiştirmeyi deneyin</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                  {editingUser.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Kullanıcı Düzenle</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{editingUser.email}</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Ad Soyad *
                </Label>
                <Input
                  id="full_name"
                  value={editFormData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Kullanıcının tam adı"
                  className="border-gray-300 dark:border-gray-700"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900 dark:text-white flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  E-posta *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="kullanici@example.com"
                  className="border-gray-300 dark:border-gray-700"
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-gray-900 dark:text-white flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Rol *
                </Label>
                <select
                  id="role"
                  value={editFormData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">Öğrenci</option>
                  <option value="instructor">Eğitmen</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-900 dark:text-white">
                  Telefon
                </Label>
                <Input
                  id="phone"
                  value={editFormData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="0555 123 45 67"
                  className="border-gray-300 dark:border-gray-700"
                />
              </div>

              {/* City & District */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-gray-900 dark:text-white">
                    Şehir
                  </Label>
                  <Input
                    id="city"
                    value={editFormData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="İstanbul"
                    className="border-gray-300 dark:border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district" className="text-gray-900 dark:text-white">
                    İlçe
                  </Label>
                  <Input
                    id="district"
                    value={editFormData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    placeholder="Kadıköy"
                    className="border-gray-300 dark:border-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
              <Button
                variant="outline"
                onClick={handleCloseModal}
                disabled={isSaving}
              >
                İptal
              </Button>
              <Button
                onClick={handleSaveUser}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                {isSaving ? (
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;
