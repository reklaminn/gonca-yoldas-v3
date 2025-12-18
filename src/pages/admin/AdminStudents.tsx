import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Users as UsersIcon, 
  Search, 
  UserPlus,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Edit,
  Trash2,
  Loader2,
  Eye,
  MapPin,
  Building2,
  Shield,
  Save,
  Plus
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

interface Student {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  city?: string;
  district?: string;
  tax_office?: string;
  tax_number?: string;
  created_at: string;
  last_sign_in_at?: string;
}

const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // New User State
  const [newUser, setNewUser] = useState({
    email: '',
    full_name: '',
    phone: '',
    role: 'user',
    password: '' // In a real app, you'd send an invite or use an edge function
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Kullanıcılar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      // Not: İstemci tarafında doğrudan Auth kullanıcısı oluşturmak güvenlik nedeniyle kısıtlıdır.
      // Normalde burada bir Supabase Edge Function çağrılır.
      // Şimdilik profil tablosuna ekleme yapıyoruz (Auth ile senkronize olması için Edge Function gerekir).
      
      toast.info('Yeni kullanıcı oluşturma işlemi başlatıldı...');
      
      // Simüle edilmiş başarılı işlem (Gerçek uygulamada auth.admin.createUser kullanılır)
      const { data: { user }, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password || 'Temp123456!',
        options: {
          data: {
            full_name: newUser.full_name,
            role: newUser.role
          }
        }
      });

      if (authError) throw authError;

      toast.success('Kullanıcı başarıyla oluşturuldu ve doğrulama e-postası gönderildi.');
      setIsAddingUser(false);
      setNewUser({ email: '', full_name: '', phone: '', role: 'user', password: '' });
      fetchStudents();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Kullanıcı oluşturulurken bir hata oluştu');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editingStudent.full_name,
          phone: editingStudent.phone,
          city: editingStudent.city,
          district: editingStudent.district,
          tax_office: editingStudent.tax_office,
          tax_number: editingStudent.tax_number,
          role: editingStudent.role
        })
        .eq('id', editingStudent.id);

      if (error) throw error;

      setStudents(students.map(s => s.id === editingStudent.id ? editingStudent : s));
      toast.success('Kullanıcı bilgileri güncellendi');
      setEditingStudent(null);
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Güncelleme sırasında bir hata oluştu');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setStudents(students.filter(s => s.id !== id));
      toast.success('Kullanıcı başarıyla silindi');
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Kullanıcı silinirken hata oluştu');
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const config = {
      admin: { label: 'Admin', variant: 'default' as const, color: 'bg-red-500/10 text-red-500 border-red-500/20' },
      instructor: { label: 'Eğitmen', variant: 'secondary' as const, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
      user: { label: 'Öğrenci', variant: 'outline' as const, color: 'bg-green-500/10 text-green-500 border-green-500/20' },
      student: { label: 'Öğrenci', variant: 'outline' as const, color: 'bg-green-500/10 text-green-500 border-green-500/20' },
    };
    const roleConfig = config[role as keyof typeof config] || config.user;
    return <Badge variant={roleConfig.variant} className={roleConfig.color}>{roleConfig.label}</Badge>;
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      (student.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (student.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || student.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const stats = [
    {
      label: 'Toplam Kullanıcı',
      value: students.length,
      icon: UsersIcon,
      color: 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
    },
    {
      label: 'Öğrenci',
      value: students.filter(s => s.role === 'user' || s.role === 'student').length,
      icon: BookOpen,
      color: 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400'
    },
    {
      label: 'Eğitmen',
      value: students.filter(s => s.role === 'instructor').length,
      icon: UsersIcon,
      color: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400'
    },
    {
      label: 'Admin',
      value: students.filter(s => s.role === 'admin').length,
      icon: Shield,
      color: 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--fg)]">Kullanıcı Yönetimi</h1>
            <p className="text-[var(--fg-muted)] mt-2">Tüm kullanıcıları ve rollerini yönetin</p>
          </div>
          
          {/* New User Dialog */}
          <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
            <DialogTrigger asChild>
              <Button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90">
                <UserPlus className="h-4 w-4 mr-2" />
                Yeni Kullanıcı
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
                <DialogDescription>
                  Sisteme yeni bir kullanıcı kaydı oluşturun. Kullanıcıya doğrulama e-postası gönderilecektir.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="new_full_name">Ad Soyad</Label>
                  <Input 
                    id="new_full_name"
                    placeholder="Örn: Ahmet Yılmaz"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_email">E-posta Adresi</Label>
                  <Input 
                    id="new_email"
                    type="email"
                    placeholder="ornek@eposta.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_password">Geçici Şifre</Label>
                  <Input 
                    id="new_password"
                    type="password"
                    placeholder="En az 6 karakter"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_role">Rol</Label>
                  <Select 
                    value={newUser.role} 
                    onValueChange={(val) => setNewUser({...newUser, role: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Rol seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Öğrenci</SelectItem>
                      <SelectItem value="instructor">Eğitmen</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddingUser(false)}>
                    İptal
                  </Button>
                  <Button type="submit" disabled={isCreating} className="bg-[var(--color-primary)]">
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Oluşturuluyor...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Kullanıcıyı Oluştur
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-[var(--border)] bg-[var(--bg-card)]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--fg-muted)] mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-[var(--fg)]">{stat.value}</p>
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
      <Card className="border-[var(--border)] bg-[var(--bg-card)]">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--fg-muted)]" />
              <Input
                placeholder="Kullanıcı ara (isim, e-posta)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[var(--bg-input)] text-[var(--fg)] border-[var(--border)]"
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
                variant={selectedRole === 'user' ? 'default' : 'outline'}
                onClick={() => setSelectedRole('user')}
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
      <Card className="border-[var(--border)] bg-[var(--bg-card)]">
        <CardHeader>
          <CardTitle className="text-[var(--fg)]">Kullanıcı Listesi ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <div key={student.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] hover:border-[var(--color-primary-alpha)] transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {student.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-bold text-[var(--fg)]">{student.full_name || 'İsimsiz Kullanıcı'}</h3>
                    {getRoleBadge(student.role)}
                  </div>
                  <div className="grid md:grid-cols-3 gap-2 text-sm text-[var(--fg-muted)]">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 flex-shrink-0 text-[var(--color-primary)]" />
                      <span className="truncate">{student.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 flex-shrink-0 text-[var(--color-primary)]" />
                      <span>{student.phone || 'Telefon yok'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 flex-shrink-0 text-[var(--color-primary)]" />
                      <span>Kayıt: {new Date(student.created_at).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:ml-auto">
                  {/* Detail Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedStudent(student)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Detay
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Kullanıcı Profili</DialogTitle>
                        <DialogDescription>
                          {student.full_name} kullanıcısının detaylı bilgileri
                        </DialogDescription>
                      </DialogHeader>
                      
                      {selectedStudent && (
                        <div className="space-y-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                              {selectedStudent.full_name?.[0].toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-lg font-bold">{selectedStudent.full_name}</h4>
                              <p className="text-sm text-[var(--fg-muted)]">{selectedStudent.email}</p>
                            </div>
                          </div>

                          <div className="grid gap-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)]">
                              <Phone className="h-5 w-5 text-[var(--color-primary)]" />
                              <div>
                                <p className="text-xs text-[var(--fg-muted)]">Telefon</p>
                                <p className="text-sm font-medium">{selectedStudent.phone || '-'}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)]">
                              <MapPin className="h-5 w-5 text-[var(--color-primary)]" />
                              <div>
                                <p className="text-xs text-[var(--fg-muted)]">Konum</p>
                                <p className="text-sm font-medium">
                                  {selectedStudent.district && selectedStudent.city 
                                    ? `${selectedStudent.district} / ${selectedStudent.city}` 
                                    : 'Belirtilmemiş'}
                                </p>
                              </div>
                            </div>

                            {(selectedStudent.tax_office || selectedStudent.tax_number) && (
                              <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)]">
                                <Building2 className="h-5 w-5 text-[var(--color-primary)]" />
                                <div>
                                  <p className="text-xs text-[var(--fg-muted)]">Vergi Bilgileri</p>
                                  <p className="text-sm font-medium">
                                    {selectedStudent.tax_office} - {selectedStudent.tax_number}
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)]">
                              <Shield className="h-5 w-5 text-[var(--color-primary)]" />
                              <div>
                                <p className="text-xs text-[var(--fg-muted)]">Rol</p>
                                <p className="text-sm font-medium capitalize">{selectedStudent.role}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  {/* Edit Dialog */}
                  <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setEditingStudent(student)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Kullanıcıyı Düzenle</DialogTitle>
                        <DialogDescription>
                          Kullanıcı bilgilerini güncelleyin. E-posta adresi değiştirilemez.
                        </DialogDescription>
                      </DialogHeader>
                      
                      {editingStudent && (
                        <form onSubmit={handleUpdate} className="space-y-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="full_name">Ad Soyad</Label>
                              <Input 
                                id="full_name"
                                value={editingStudent.full_name}
                                onChange={(e) => setEditingStudent({...editingStudent, full_name: e.target.value})}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="phone">Telefon</Label>
                              <Input 
                                id="phone"
                                value={editingStudent.phone || ''}
                                onChange={(e) => setEditingStudent({...editingStudent, phone: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="city">Şehir</Label>
                              <Input 
                                id="city"
                                value={editingStudent.city || ''}
                                onChange={(e) => setEditingStudent({...editingStudent, city: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="district">İlçe</Label>
                              <Input 
                                id="district"
                                value={editingStudent.district || ''}
                                onChange={(e) => setEditingStudent({...editingStudent, district: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="tax_office">Vergi Dairesi</Label>
                              <Input 
                                id="tax_office"
                                value={editingStudent.tax_office || ''}
                                onChange={(e) => setEditingStudent({...editingStudent, tax_office: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="tax_number">Vergi No / TC</Label>
                              <Input 
                                id="tax_number"
                                value={editingStudent.tax_number || ''}
                                onChange={(e) => setEditingStudent({...editingStudent, tax_number: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="role">Kullanıcı Rolü</Label>
                              <Select 
                                value={editingStudent.role} 
                                onValueChange={(val) => setEditingStudent({...editingStudent, role: val})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Rol seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">Öğrenci</SelectItem>
                                  <SelectItem value="instructor">Eğitmen</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditingStudent(null)}>
                              İptal
                            </Button>
                            <Button type="submit" disabled={isUpdating} className="bg-[var(--color-primary)]">
                              {isUpdating ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Güncelleniyor...
                                </>
                              ) : (
                                <>
                                  <Save className="mr-2 h-4 w-4" />
                                  Değişiklikleri Kaydet
                                </>
                              )}
                            </Button>
                          </DialogFooter>
                        </form>
                      )}
                    </DialogContent>
                  </Dialog>

                  {/* Delete Confirmation */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Kullanıcıyı Sil</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bu kullanıcıyı silmek istediğinize emin misiniz? Bu işlem kullanıcının profil verilerini kalıcı olarak silecektir.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(student.id)}
                          className="bg-red-500 hover:bg-red-600"
                          disabled={isDeleting}
                        >
                          {isDeleting ? 'Siliniyor...' : 'Evet, Sil'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}

            {filteredStudents.length === 0 && (
              <div className="text-center py-12">
                <UsersIcon className="h-16 w-16 text-[var(--fg-muted)] mx-auto mb-4" />
                <p className="text-[var(--fg-muted)] text-lg">Kullanıcı bulunamadı</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStudents;
