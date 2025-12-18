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
  ShieldCheck
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const AdminLayout: React.FC = () => {
  const { user, profile, loading } = useAuthStore();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navigation = [
    { name: 'Genel Bakış', href: '/admin', icon: LayoutDashboard },
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[var(--surface)] text-[var(--text)] transform transition-transform duration-300 ease-in-out z-50 lg:translate-x-0 border-r border-[var(--border)] ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-[var(--border)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-[var(--text)]">Admin Panel</h1>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Gonca Yoldaş</p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Homepage Button */}
            <div className="pt-4 border-t border-[var(--border)]">
              <Link to="/" onClick={() => setSidebarOpen(false)}>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3 border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--bg)] text-[var(--text-secondary)] hover:text-[var(--text)] transition-all duration-200"
                >
                  <Home className="h-5 w-5" />
                  <span className="font-medium">Ana Sayfaya Dön</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--border)] scrollbar-track-[var(--surface)]">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href || 
                             (item.href !== '/admin' && location.pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/20'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg)] hover:text-[var(--text)]'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-[var(--border)] space-y-3">
            {/* User Info */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[var(--bg)] rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                {profile?.full_name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text)] truncate">
                  {profile?.full_name || user?.email}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">Admin</p>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-all duration-200"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Çıkış Yap</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Mobile Header */}
        <header className="lg:hidden bg-[var(--surface)] border-b border-[var(--border)] px-4 py-3 sticky top-0 z-30 backdrop-blur-sm bg-[var(--surface)]/95">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-bold text-[var(--text)]">Admin Panel</h1>
            <Link to="/">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[var(--text-secondary)] hover:text-[var(--text)]"
              >
                <Home className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
