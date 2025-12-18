import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users as UsersIcon, 
  Search, 
  Filter,
  UserPlus,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  XCircle
} from 'lucide-react';

const UsersManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const users = [
    {
      id: 1,
      name: 'Ayşe Yılmaz',
      email: 'ayse.yilmaz@example.com',
      phone: '+90 532 123 45 67',
      role: 'student',
      status: 'active',
      joinDate: '1 Ocak 2025',
      courses: 3,
      totalSpent: 10497,
      lastActive: '2 saat önce'
    },
    {
      id: 2,
      name: 'Mehmet Demir',
      email: 'mehmet.demir@example.com',
      phone: '+90 533 234 56 78',
      role: 'student',
      status: 'active',
      joinDate: '5 Ocak 2025',
      courses: 2,
      totalSpent: 7498,
      lastActive: '1 gün önce'
    },
    {
      id: 3,
      name: 'Zeynep Kaya',
      email: 'zeynep.kaya@example.com',
      phone: '+90 534 345 67 89',
      role: 'instructor',
      status: 'active',
      joinDate: '15 Aralık 2024',
      courses: 5,
      totalSpent: 0,
      lastActive: '5 saat önce'
    },
    {
      id: 4,
      name: 'Ali Öztürk',
      email: 'ali.ozturk@example.com',
      phone: '+90 535 456 78 90',
      role: 'student',
      status: 'inactive',
      joinDate: '20 Kasım 2024',
      courses: 1,
      totalSpent: 2499,
      lastActive: '2 hafta önce'
    },
    {
      id: 5,
      name: 'Fatma Şahin',
      email: 'fatma.sahin@example.com',
      phone: '+90 536 567 89 01',
      role: 'admin',
      status: 'active',
      joinDate: '1 Eylül 2024',
      courses: 0,
      totalSpent: 0,
      lastActive: '1 saat önce'
    },
  ];

  const stats = [
    {
      label: 'Toplam Kullanıcı',
      value: users.length,
      icon: UsersIcon,
      color: 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
    },
    {
      label: 'Aktif Kullanıcı',
      value: users.filter(u => u.status === 'active').length,
      icon: CheckCircle,
      color: 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400'
    },
    {
      label: 'Öğrenci',
      value: users.filter(u => u.role === 'student').length,
      icon: BookOpen,
      color: 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400'
    },
    {
      label: 'Eğitmen',
      value: users.filter(u => u.role === 'instructor').length,
      icon: UsersIcon,
      color: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400'
    },
  ];

  const getRoleBadge = (role: string) => {
    const config = {
      admin: { label: 'Admin', variant: 'default' as const },
      instructor: { label: 'Eğitmen', variant: 'secondary' as const },
      student: { label: 'Öğrenci', variant: 'outline' as const },
    };
    const roleConfig = config[role as keyof typeof config];
    return <Badge variant={roleConfig.variant}>{roleConfig.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const config = {
      active: { label: 'Aktif', variant: 'default' as const, icon: CheckCircle },
      inactive: { label: 'Pasif', variant: 'secondary' as const, icon: XCircle },
    };
    const statusConfig = config[status as keyof typeof config];
    const Icon = statusConfig.icon;
    return (
      <Badge variant={statusConfig.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {statusConfig.label}
      </Badge>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8">
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
                className="border-gray-300 dark:border-gray-700"
              >
                Tümü
              </Button>
              <Button
                variant={selectedRole === 'student' ? 'default' : 'outline'}
                onClick={() => setSelectedRole('student')}
                size="sm"
                className="border-gray-300 dark:border-gray-700"
              >
                Öğrenci
              </Button>
              <Button
                variant={selectedRole === 'instructor' ? 'default' : 'outline'}
                onClick={() => setSelectedRole('instructor')}
                size="sm"
                className="border-gray-300 dark:border-gray-700"
              >
                Eğitmen
              </Button>
              <Button
                variant={selectedRole === 'admin' ? 'default' : 'outline'}
                onClick={() => setSelectedRole('admin')}
                size="sm"
                className="border-gray-300 dark:border-gray-700"
              >
                Admin
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Kullanıcı Listesi ({filteredUsers.length})</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">Sistemdeki tüm kullanıcılar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-100 dark:border-gray-800">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                    {getRoleBadge(user.role)}
                    {getStatusBadge(user.status)}
                  </div>
                  <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span>Kayıt: {user.joinDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 flex-shrink-0" />
                      <span>{user.courses} kurs</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Toplam Harcama</p>
                  <p className="font-bold text-gray-900 dark:text-white">₺{user.totalSpent.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{user.lastActive}</p>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-700">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-700">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <UsersIcon className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">Kullanıcı bulunamadı</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Arama kriterlerinizi değiştirmeyi deneyin</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersManagement;
