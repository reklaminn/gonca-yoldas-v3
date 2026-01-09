import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Shield,
  Phone,
  MapPin,
  AlertCircle,
  Key,
  ShoppingBag,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  phone?: string | null;
  city?: string | null;
  district?: string | null;
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

interface Order {
  id: string;
  order_number: string;
  order_date: string;
  program_title: string;
  total_amount: number;
  payment_status: string;
  created_at: string;
}

const AdminStudents: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useAuthStore();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [error, setError] = useState<string | null>(null);
  
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

  // Delete Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Orders Modal State
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [selectedUserOrders, setSelectedUserOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedUserForOrders, setSelectedUserForOrders] = useState<Profile | null>(null);

  useEffect(() => {
    console.log('👥 [AdminStudents] Component mounted');
    console.log('👥 [AdminStudents] Session:', session ? 'Available' : 'Missing');
    console.log('👥 [AdminStudents] Access Token:', session?.access_token ? 'Available' : 'Missing');
    
    if (session?.access_token) {
      fetchProfiles();
    } else {
      console.error('❌ [AdminStudents] No access token available!');
      setError('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
      setLoading(false);
    }
  }, [session?.access_token]);

  const fetchProfiles = async () => {
    if (!session?.access_token) {
      console.error('❌ [AdminStudents] Cannot fetch without token');
      setError('Oturum bilgisi bulunamadı');
      return;
    }

    try {
      console.log('👥 [AdminStudents] Starting fetch...');
      console.log('👥 [AdminStudents] Supabase URL:', SUPABASE_URL);
      setLoading(true);
      setError(null);

      // 1. Fetch profiles
      console.log('📊 [AdminStudents] Fetching profiles...');
      const profilesResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?select=*&order=created_at.desc`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('📊 [AdminStudents] Profiles response status:', profilesResponse.status);

      if (!profilesResponse.ok) {
        const errorText = await profilesResponse.text();
        console.error('❌ [AdminStudents] Profiles fetch failed:', errorText);
        throw new Error(`Profiller yüklenemedi: ${profilesResponse.status}`);
      }

      const profilesData = await profilesResponse.json();
      console.log('✅ [AdminStudents] Profiles fetched:', profilesData.length);
      console.log('📊 [AdminStudents] Sample profile:', profilesData[0]);

      // 2. Fetch emails via RPC
      console.log('📧 [AdminStudents] Fetching emails via RPC...');
      const userIds = profilesData.map((p: any) => p.id);
      console.log('📧 [AdminStudents] User IDs count:', userIds.length);
      
      const emailsResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/rpc/get_user_emails`,
        {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({ user_ids: userIds })
        }
      );

      console.log('📧 [AdminStudents] RPC response status:', emailsResponse.status);

      let emailsMap: Record<string, string> = {};
      
      if (emailsResponse.ok) {
        const emailsData = await emailsResponse.json();
        console.log('✅ [AdminStudents] Emails fetched:', emailsData.length);
        
        emailsMap = emailsData.reduce((acc: any, item: any) => {
          acc[item.id] = item.email;
          return acc;
        }, {});
        
        console.log('📧 [AdminStudents] Emails mapped:', Object.keys(emailsMap).length);
      } else {
        const errorText = await emailsResponse.text();
        console.warn('⚠️ [AdminStudents] RPC failed:', errorText);
        console.warn('⚠️ [AdminStudents] Continuing without emails...');
      }

      // 3. Merge profiles with emails
      const profilesWithEmail = profilesData.map((profile: any) => ({
        ...profile,
        email: emailsMap[profile.id] || profile.email || null
      }));

      console.log('✅ [AdminStudents] Final profiles count:', profilesWithEmail.length);
      setProfiles(profilesWithEmail);
      setError(null);
    } catch (error: any) {
      console.error('❌ [AdminStudents] Error:', error);
      setError(error.message || 'Kullanıcılar yüklenirken hata oluştu');
      toast.error(error.message || 'Kullanıcılar yüklenirken hata oluştu');
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
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveUser = async () => {
    if (!editingUser || !session?.access_token) {
      toast.error('Kullanıcı bilgisi bulunamadı');
      return;
    }

    if (!editFormData.full_name.trim()) {
      toast.error('İsim alanı zorunludur');
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
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            full_name: editFormData.full_name.trim(),
            role: editFormData.role,
            phone: editFormData.phone.trim() || null,
            city: editFormData.city.trim() || null,
            district: editFormData.district.trim() || null
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Güncelleme başarısız: ${response.status}`);
      }

      console.log('✅ [AdminStudents] User updated');

      setProfiles(prev => prev.map(p => 
        p.id === editingUser.id 
          ? { 
              ...p, 
              full_name: editFormData.full_name.trim(),
              role: editFormData.role,
              phone: editFormData.phone.trim() || null,
              city: editFormData.city.trim() || null,
              district: editFormData.district.trim() || null
            } 
          : p
      ));

      toast.success('Kullanıcı başarıyla güncellendi!');
      handleCloseModal();
    } catch (error: any) {
      console.error('❌ [AdminStudents] Save error:', error);
      toast.error('Kullanıcı güncellenirken hata oluştu: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordReset = async (profile: Profile) => {
    if (!profile.email) {
      toast.error('Kullanıcının e-posta adresi bulunamadı');
      return;
    }

    try {
      console.log('🔑 [AdminStudents] Sending password reset email to:', profile.email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('❌ [AdminStudents] Password reset error:', error);
        throw error;
      }

      console.log('✅ [AdminStudents] Password reset email sent');
      toast.success(`Şifre sıfırlama e-postası ${profile.email} adresine gönderildi`);
    } catch (error: any) {
      console.error('❌ [AdminStudents] Password reset failed:', error);
      toast.error('Şifre sıfırlama e-postası gönderilemedi: ' + error.message);
    }
  };

  const handleViewOrders = async (profile: Profile) => {
    console.log('🛒 [AdminStudents] Fetching orders for user:', profile.id);
    
    try {
      setLoadingOrders(true);
      setSelectedUserForOrders(profile);
      setIsOrdersModalOpen(true);

      if (!session?.access_token) {
        toast.error('Oturum bilgisi bulunamadı');
        return;
      }

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/orders?select=*&email=eq.${profile.email}&order=created_at.desc`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Siparişler yüklenemedi: ${response.status}`);
      }

      const orders = await response.json();
      console.log('✅ [AdminStudents] Orders fetched:', orders.length);
      setSelectedUserOrders(orders);
    } catch (error: any) {
      console.error('❌ [AdminStudents] Orders fetch error:', error);
      toast.error('Siparişler yüklenirken hata oluştu');
      setSelectedUserOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleDeleteClick = (profile: Profile) => {
    setUserToDelete(profile);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete || !session?.access_token) {
      toast.error('Kullanıcı bilgisi bulunamadı');
      return;
    }

    try {
      console.log('🗑️ [AdminStudents] Deleting user completely:', userToDelete.id);
      setIsDeleting(true);

      // Use RPC function to delete user completely (both profiles and auth.users)
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/rpc/delete_user_completely`,
        {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({ user_id: userToDelete.id })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [AdminStudents] Delete RPC failed:', errorText);
        throw new Error(`Silme işlemi başarısız: ${response.status}`);
      }

      const result = await response.json();
      console.log('📊 [AdminStudents] Delete result:', result);

      if (!result.success) {
        throw new Error(result.error || 'Silme işlemi başarısız');
      }

      console.log('✅ [AdminStudents] User deleted completely (profiles + auth.users)');

      // Remove from local state
      setProfiles(prev => prev.filter(p => p.id !== userToDelete.id));
      
      toast.success('Kullanıcı tamamen silindi (profil + kimlik doğrulama)');
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error: any) {
      console.error('❌ [AdminStudents] Delete error:', error);
      toast.error('Kullanıcı silinirken hata oluştu: ' + error.message);
    } finally {
      setIsDeleting(false);
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

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string, variant: "default" | "outline" | "destructive" | "secondary" }> = {
      completed: { label: 'Tamamlandı', variant: 'default' },
      pending: { label: 'Bekliyor', variant: 'outline' },
      failed: { label: 'Başarısız', variant: 'destructive' },
      cancelled: { label: 'İptal', variant: 'destructive' },
    };
    const statusConfig = config[status] || config.pending;
    return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>;
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Hata Oluştu</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <Button onClick={fetchProfiles} className="bg-blue-600 hover:bg-blue-700">
                Tekrar Dene
              </Button>
            </div>
          </CardContent>
        </Card>
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
          <Button 
            onClick={() => navigate('/admin/users/new')}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
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
                      <span className="truncate">{profile.email || 'E-posta yok'}</span>
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
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                        title="Daha fazla seçenek"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handlePasswordReset(profile)}>
                        <Key className="h-4 w-4 mr-2" />
                        Şifre Sıfırla
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewOrders(profile)}>
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Siparişleri Görüntüle
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteClick(profile)}
                        className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Kullanıcıyı Sil
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                  {editingUser.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Kullanıcı Düzenle</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{editingUser.email || 'E-posta yok'}</p>
                </div>
              </div>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
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

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900 dark:text-white flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  E-posta
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={editFormData.email || 'E-posta yok'}
                  readOnly
                  className="border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Email auth.users tablosunda saklanır ve düzenlenemez
                </p>
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-900 dark:text-white flex items-center gap-2">
                  <Phone className="h-4 w-4" />
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

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-gray-900 dark:text-white flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
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

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
              <Button variant="outline" onClick={handleCloseModal} disabled={isSaving}>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kullanıcıyı Tamamen Sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{userToDelete?.full_name}</strong> kullanıcısını <strong>tamamen</strong> silmek istediğinize emin misiniz? 
              <br /><br />
              Bu işlem:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Kullanıcı profilini silecek</li>
                <li>Kimlik doğrulama kaydını silecek</li>
                <li>İlişkili tüm verileri silecek</li>
                <li><strong>GERİ ALINAMAZ</strong></li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Siliniyor...
                </>
              ) : (
                'Tamamen Sil'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Orders Modal */}
      <Dialog open={isOrdersModalOpen} onOpenChange={setIsOrdersModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kullanıcı Siparişleri</DialogTitle>
            <DialogDescription>
              {selectedUserForOrders?.full_name} - {selectedUserForOrders?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {loadingOrders ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : selectedUserOrders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Bu kullanıcının siparişi bulunmuyor</p>
              </div>
            ) : (
              selectedUserOrders.map((order) => (
                <div key={order.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {order.order_number || `#${order.id.slice(0, 8)}`}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{order.program_title}</p>
                    </div>
                    {getStatusBadge(order.payment_status)}
                  </div>
                  <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(order.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ₺{order.total_amount?.toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStudents;
