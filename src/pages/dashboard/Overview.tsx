import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Award, TrendingUp, Clock, Download } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

interface DashboardStats {
  totalOrders: number;
  activeCourses: number;
  completedLessons: number;
  certificates: number;
}

interface RecentOrder {
  id: string;
  program_name: string;
  amount: number;
  status: string;
  created_at: string;
}

const DashboardOverview: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    activeCourses: 0,
    completedLessons: 0,
    certificates: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    console.log('🔵 Dashboard Overview: Mount/Update', { 
      authLoading, 
      userExists: !!user,
      userId: user?.id,
      hasFetched: hasFetchedRef.current
    });
    
    if (!authLoading && user && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchDashboardData();
    }

    if (!user) {
      hasFetchedRef.current = false;
    }
  }, [user, authLoading]);

  const fetchDashboardData = async () => {
    if (!user) {
      console.log('⚠️ fetchDashboardData called but no user');
      setLoading(false);
      return;
    }

    console.log('🔵 Fetching dashboard data for user:', user.id);
    setLoading(true);
    setError(null);

    try {
      const startTime = Date.now();
      
      const [ordersResult, enrollmentsResult, progressResult, certificatesResult] = await Promise.all([
        supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('enrollments').select('*').eq('user_id', user.id).eq('status', 'active'),
        supabase.from('progress').select('*').eq('user_id', user.id).eq('completed', true),
        supabase.from('certificates').select('*').eq('user_id', user.id)
      ]);

      if (ordersResult.error) throw ordersResult.error;
      if (enrollmentsResult.error) throw enrollmentsResult.error;
      if (progressResult.error) throw progressResult.error;
      if (certificatesResult.error) throw certificatesResult.error;

      console.log(`✅ All dashboard data fetched in ${Date.now() - startTime}ms`, {
        orders: ordersResult.data?.length || 0,
        enrollments: enrollmentsResult.data?.length || 0,
        progress: progressResult.data?.length || 0,
        certificates: certificatesResult.data?.length || 0
      });

      setStats({
        totalOrders: ordersResult.data?.length || 0,
        activeCourses: enrollmentsResult.data?.length || 0,
        completedLessons: progressResult.data?.length || 0,
        certificates: certificatesResult.data?.length || 0,
      });

      setRecentOrders(ordersResult.data?.slice(0, 5) || []);
    } catch (error: any) {
      console.error('❌ Error fetching dashboard data:', error);
      setError('Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
      
      setStats({
        totalOrders: 0,
        activeCourses: 0,
        completedLessons: 0,
        certificates: 0,
      });
      setRecentOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadUserData = async () => {
    if (!user) return;

    try {
      const [profileResult, ordersResult, enrollmentsResult, progressResult, certificatesResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('orders').select('*').eq('user_id', user.id),
        supabase.from('enrollments').select('*').eq('user_id', user.id),
        supabase.from('progress').select('*').eq('user_id', user.id),
        supabase.from('certificates').select('*').eq('user_id', user.id)
      ]);

      const userData = {
        profile: profileResult.data,
        orders: ordersResult.data,
        enrollments: enrollmentsResult.data,
        progress: progressResult.data,
        certificates: certificatesResult.data,
        exportDate: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gonca-yoldas-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading user data:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-3 text-foreground">Kimlik doğrulanıyor...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-foreground mb-4">Oturum açmanız gerekiyor.</p>
        <Button onClick={() => window.location.href = '/auth/signin'}>
          Giriş Yap
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-3 text-foreground">Veriler yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => {
          hasFetchedRef.current = false;
          fetchDashboardData();
        }}>
          Yeniden Dene
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Genel Bakış</h1>
          <p className="text-muted mt-1">Hoş geldiniz, {user?.email}</p>
        </div>
        <Button onClick={downloadUserData} variant="outline" className="border-border hover:bg-surface-2">
          <Download className="h-4 w-4 mr-2" />
          Verilerimi İndir
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-surface-1 border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted">
              Toplam Sipariş
            </CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card className="bg-surface-1 border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted">
              Aktif Kurslar
            </CardTitle>
            <Clock className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.activeCourses}</div>
          </CardContent>
        </Card>

        <Card className="bg-surface-1 border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted">
              Tamamlanan Dersler
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.completedLessons}</div>
          </CardContent>
        </Card>

        <Card className="bg-surface-1 border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted">
              Sertifikalar
            </CardTitle>
            <Award className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.certificates}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="bg-surface-1 border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Son Siparişler</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-muted text-center py-8">
              Henüz siparişiniz bulunmamaktadır.
            </p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg bg-surface-2"
                >
                  <div>
                    <p className="font-medium text-foreground">{order.program_name}</p>
                    <p className="text-sm text-muted">
                      {new Date(order.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">₺{order.amount}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'completed'
                          ? 'bg-success/20 text-success'
                          : order.status === 'pending'
                          ? 'bg-warning/20 text-warning'
                          : 'bg-error/20 text-error'
                      }`}
                    >
                      {order.status === 'completed'
                        ? 'Tamamlandı'
                        : order.status === 'pending'
                        ? 'Beklemede'
                        : 'İptal'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
