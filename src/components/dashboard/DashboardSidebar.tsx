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
    try {
      // Sidebar'ı kapat
      setSidebarOpen(false);
      
      // Çıkış işlemini başlat
      await signOutUser();
      
      // Ana sayfaya yönlendir
      navigate('/', { replace: true });
      toast.success('Başarıyla çıkış yapıldı');
    } catch (error) {
      console.error('Logout error:', error);
      // Hata olsa bile ana sayfaya at
      navigate('/', { replace: true });
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
      className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header with Avatar and User Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="space-y-4">
            {/* Close button for mobile */}
            <div className="flex items-center justify-between lg:hidden mb-4">
              <h2 className="text-lg font-bold text-gray-900">Menü</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Avatar and User Info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-blue-100">
                <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url || undefined} alt={getDisplayName()} />
                <AvatarFallback className="bg-blue-50 text-blue-600 font-semibold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-bold text-gray-900 truncate">
                  {getDisplayName()}
                </h1>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            
            {/* Homepage Button */}
            <div className="pt-4 border-t border-gray-200">
              <Link to="/" onClick={() => setSidebarOpen(false)}>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-gray-200 hover:bg-gray-50 hover:text-blue-600 transition-colors"
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
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600 font-medium'
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
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-50 hover:text-blue-600 font-medium"
              >
                <BookOpen className="h-5 w-5 flex-shrink-0" />
                <span>Kurslarım</span>
              </a>
            </motion.div>
          )}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors text-gray-600 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
