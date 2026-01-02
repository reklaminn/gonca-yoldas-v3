import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  BookOpen, 
  User,
  X,
  Home,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/authStore';
import { getGeneralSettings } from '@/services/generalSettings';
import { signOutUser } from '@/services/auth';
import { toast } from 'sonner';

interface DashboardSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, profile } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [coursesExternalUrl, setCoursesExternalUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoursesUrl = async () => {
      const settings = await getGeneralSettings();
      if (settings) {
        setCoursesExternalUrl(settings.courses_external_url);
      }
    };
    fetchCoursesUrl();
  }, []);

  const navigation = [
    { name: 'Genel Bakış', href: '/dashboard', icon: LayoutDashboard, isExternal: false },
    { name: 'Siparişlerim', href: '/dashboard/orders', icon: ShoppingBag, isExternal: false },
    { name: 'Profil', href: '/dashboard/profile', icon: User, isExternal: false },
  ];

  const handleSignOut = async () => {
    console.log('🔵 [DashboardSidebar] handleSignOut called');
    alert('BUTTON CLICKED!'); // 🔴 TEST: Bu alert görünmeli!
    
    try {
      const success = await signOutUser();
      
      if (success) {
        console.log('✅ [DashboardSidebar] Logout successful, redirecting...');
        setSidebarOpen(false);
        navigate('/', { replace: true });
      } else {
        console.error('❌ [DashboardSidebar] Logout failed');
        toast.error('Çıkış yapılırken bir hata oluştu');
      }
    } catch (error) {
      console.error('❌ [DashboardSidebar] Logout error:', error);
      toast.error('Çıkış yapılırken bir hata oluştu');
    }
  };

  const getUserInitials = () => {
    const fullName = profile?.full_name || user?.user_metadata?.full_name;
    
    if (fullName) {
      const names = fullName.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    return profile?.full_name || user?.user_metadata?.full_name || 'Kullanıcı';
  };

  return (
    <aside 
      className={`fixed inset-y-0 left-0 w-64 bg-[var(--bg-card)] border-r border-[var(--border)] z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header with Avatar and User Info */}
        <div className="p-6 border-b border-[var(--border)]">
          <div className="space-y-4">
            {/* Close button for mobile */}
            <div className="flex items-center justify-between lg:hidden mb-4">
              <h2 className="text-lg font-bold text-[var(--fg)]">Menü</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Avatar and User Info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-[var(--color-primary)]/20">
                <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url || undefined} alt={getDisplayName()} />
                <AvatarFallback className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-semibold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-bold text-[var(--fg)] truncate">
                  {getDisplayName()}
                </h1>
                <p className="text-xs text-[var(--fg-muted)] truncate">{user?.email}</p>
              </div>
            </div>
            
            {/* Homepage Button */}
            <div className="pt-4 border-t border-[var(--border)]">
              <Link to="/" onClick={() => setSidebarOpen(false)}>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-[var(--border)] hover:bg-[var(--bg-hover)] hover:text-[var(--color-primary)] transition-colors"
                >
                  <Home className="h-5 w-5 mr-3" />
                  Ana Sayfaya Dön
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-semibold'
                      : 'text-[var(--fg)] hover:bg-[var(--bg-hover)] hover:text-[var(--color-primary)] font-medium'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              </motion.div>
            );
          })}

          {/* Dynamic "Kurslarım" link */}
          {coursesExternalUrl && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: navigation.length * 0.05 }}
            >
              <a
                href={coursesExternalUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-[var(--fg)] hover:bg-[var(--bg-hover)] hover:text-[var(--color-primary)] font-medium"
              >
                <BookOpen className="h-5 w-5 flex-shrink-0" />
                <span>Kurslarım</span>
              </a>
            </motion.div>
          )}
        </nav>

        {/* 🔴 TEST LOGOUT BUTTON - INLINE ONCLICK */}
        <div className="p-4 border-t border-[var(--border)]">
          <button
            onClick={() => {
              alert('🔴 INLINE ONCLICK WORKS!');
              console.log('🔴 INLINE ONCLICK TRIGGERED');
              handleSignOut();
            }}
            className="inline-flex items-center justify-start gap-3 w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors text-[var(--fg)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
            style={{ position: 'relative', zIndex: 9999 }}
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Çıkış Yap (TEST)</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
