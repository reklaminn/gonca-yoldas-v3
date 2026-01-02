import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Users, 
  Loader2,
  Search,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

const AdminRoles: React.FC = () => {
  const { session } = useAuthStore();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔵 [AdminRoles] Component mounted');
    console.log('🔵 [AdminRoles] Session available:', !!session);
    console.log('🔵 [AdminRoles] Access token:', !!session?.access_token);
    
    if (session?.access_token) {
      fetchProfiles();
    } else {
      console.error('❌ [AdminRoles] No access token available!');
      setLoading(false);
      toast.error('Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
    }
  }, [session?.access_token]); // ✅ Only depend on access_token

  const fetchProfiles = async () => {
    if (!session?.access_token) {
      console.error('❌ [AdminRoles] Cannot fetch without token');
      return;
    }

    try {
      console.log('🔵 [AdminRoles] Fetching profiles...');
      setLoading(true);
      
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?select=id,email,full_name,role&order=full_name.asc`,
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
        console.error('❌ [AdminRoles] Fetch failed:', response.status, errorData);
        throw new Error(`HTTP ${response.status}: ${errorData.message || 'Fetch failed'}`);
      }

      const data = await response.json();
      console.log('✅ [AdminRoles] Profiles fetched:', data.length);
      setProfiles(data || []);
    } catch (error: any) {
      console.error('❌ [AdminRoles] Error fetching profiles:', error);
      toast.error('Kullanıcılar yüklenirken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId: string, newRole: string) => {
    if (!session?.access_token) {
      toast.error('Oturum bilgisi bulunamadı');
      return;
    }

    try {
      console.log('🔵 [AdminRoles] Updating role for user:', userId, 'to:', newRole);
      setUpdatingId(userId);
      
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [AdminRoles] Update failed:', response.status, errorData);
        throw new Error(`HTTP ${response.status}: ${errorData.message || 'Update failed'}`);
      }

      console.log('✅ [AdminRoles] Role updated successfully');
      setProfiles(profiles.map(p => p.id === userId ? { ...p, role: newRole } : p));
      toast.success('Kullanıcı rolü güncellendi');
    } catch (error: any) {
      console.error('❌ [AdminRoles] Error updating role:', error);
      toast.error('Rol güncellenirken hata oluştu: ' + error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredProfiles = profiles.filter(p => 
    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const roleStats = {
    admin: profiles.filter(p => p.role === 'admin').length,
    instructor: profiles.filter(p => p.role === 'instructor').length,
    user: profiles.filter(p => p.role === 'user' || p.role === 'student').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)] mx-auto mb-4" />
          <p className="text-[var(--fg-muted)]">Kullanıcılar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--fg)]">Kullanıcı Rolleri</h1>
        <p className="text-[var(--fg-muted)] mt-2">Sistemdeki yetki seviyelerini ve kullanıcı rollerini yönetin</p>
      </div>

      {/* Role Overview Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-[var(--border)] bg-[var(--bg-card)]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Yöneticiler</CardTitle>
              <ShieldAlert className="h-5 w-5 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{roleStats.admin}</div>
            <p className="text-xs text-[var(--fg-muted)] mt-1">Tam sistem erişimi</p>
          </CardContent>
        </Card>

        <Card className="border-[var(--border)] bg-[var(--bg-card)]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Eğitmenler</CardTitle>
              <ShieldCheck className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{roleStats.instructor}</div>
            <p className="text-xs text-[var(--fg-muted)] mt-1">İçerik ve öğrenci yönetimi</p>
          </CardContent>
        </Card>

        <Card className="border-[var(--border)] bg-[var(--bg-card)]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Öğrenciler</CardTitle>
              <Users className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{roleStats.user}</div>
            <p className="text-xs text-[var(--fg-muted)] mt-1">Eğitim içeriği erişimi</p>
          </CardContent>
        </Card>
      </div>

      {/* User Role Management Table */}
      <Card className="border-[var(--border)] bg-[var(--bg-card)]">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Rol Atamaları</CardTitle>
              <CardDescription>Kullanıcıların yetki seviyelerini hızlıca değiştirin</CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--fg-muted)]" />
              <Input 
                placeholder="Kullanıcı ara..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredProfiles.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-[var(--fg-muted)] mx-auto mb-4" />
              <p className="text-[var(--fg-muted)]">Kullanıcı bulunamadı</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="py-4 px-4 font-semibold text-sm">Kullanıcı</th>
                    <th className="py-4 px-4 font-semibold text-sm">Mevcut Rol</th>
                    <th className="py-4 px-4 font-semibold text-sm text-right">Rolü Değiştir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredProfiles.map((profile) => (
                    <tr key={profile.id} className="hover:bg-[var(--bg-surface)] transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium">{profile.full_name || 'İsimsiz'}</div>
                        <div className="text-xs text-[var(--fg-muted)]">{profile.email}</div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge 
                          variant="outline" 
                          className={
                            profile.role === 'admin' ? 'border-red-500 text-red-500 bg-red-500/5' :
                            profile.role === 'instructor' ? 'border-blue-500 text-blue-500 bg-blue-500/5' :
                            'border-green-500 text-green-500 bg-green-500/5'
                          }
                        >
                          {profile.role === 'admin' ? 'Admin' : 
                           profile.role === 'instructor' ? 'Eğitmen' : 'Öğrenci'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {updatingId === profile.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-[var(--color-primary)]" />
                          ) : (
                            <>
                              {profile.role !== 'user' && profile.role !== 'student' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-xs h-8"
                                  onClick={() => updateRole(profile.id, 'user')}
                                >
                                  Öğrenci Yap
                                </Button>
                              )}
                              {profile.role !== 'instructor' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-xs h-8 text-blue-500 hover:text-blue-600"
                                  onClick={() => updateRole(profile.id, 'instructor')}
                                >
                                  Eğitmen Yap
                                </Button>
                              )}
                              {profile.role !== 'admin' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-xs h-8 text-red-500 hover:text-red-600"
                                  onClick={() => updateRole(profile.id, 'admin')}
                                >
                                  Admin Yap
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRoles;
