import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  ShoppingBag,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  ShieldCheck,
  Mail
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const AdminLayout: React.FC = () => {
  const { user, profile } = useAuthStore();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const isAdmin = profile?.role === 'admin';

  const navigation = [
    { name: 'Genel Bakış', href: '/admin', icon: LayoutDashboard },
    { name: 'Mesajlar', href: '/admin/messages', icon: Mail },
    { name: 'Kullanıcılar', href: '/admin/students', icon: Users },
    { name: 'Kullanıcı Rolleri', href: '/admin/roles', icon: ShieldCheck },
    { name: 'Programlar', href: '/admin/programs', icon: BookOpen },
    { name: 'Siparişler', href: '/admin/orders', icon: ShoppingBag },
    { name: 'İçerik Yönetimi', href: '/admin/content', icon: FileText },
    { name: 'Ayarlar', href: '/admin/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (!user) return <Navigate to="/auth/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 w-64 bg-gray-900 dark:bg-gray-950 text-white transform transition-transform duration-300 ease-in-out z-50 lg:translate-x-0 border-r border-gray-800 dark:border-gray-900 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-800 dark:border-gray-900">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <p className="text-sm text-gray-400 mt-1">Gonca Yoldaş</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white"><X className="h-6 w-6" /></button>
            </div>
            <div className="pt-4 border-t border-gray-800 dark:border-gray-900">
              <Link to="/" onClick={() => setSidebarOpen(false)}>
                <Button variant="outline" className="w-full justify-start gap-3 border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white">
                  <Home className="h-5 w-5" />
                  <span className="font-medium">Ana Sayfaya Dön</span>
                </Button>
              </Link>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href || (item.href !== '/admin' && location.pathname.startsWith(item.href));
              return (
                <Link key={item.name} to={item.href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-800 space-y-3">
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-800 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">{profile?.full_name?.[0] || 'A'}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{profile?.full_name || user?.email}</p>
                <p className="text-xs text-gray-400">Admin</p>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start gap-3 text-gray-300 hover:text-white hover:bg-gray-800" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Çıkış Yap</span>
            </Button>
          </div>
        </div>
      </aside>

      <div className="lg:ml-64">
        <header className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 sticky top-0 z-30 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-600 dark:text-gray-400"><Menu className="h-6 w-6" /></button>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Admin Panel</h1>
            <Link to="/"><Button variant="ghost" size="sm"><Home className="h-5 w-5" /></Button></Link>
          </div>
        </header>
        <main className="p-4 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
};

export default AdminLayout;
