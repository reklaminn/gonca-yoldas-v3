import React from 'react';
import { Menu, Bell, Search, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '@/components/theme/ThemeToggle';

interface DashboardHeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ setSidebarOpen }) => {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getUserInitials = () => {
    const name = profile?.full_name || '';
    if (name) {
      const names = name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-sm border-b border-[var(--border)]">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Left Side - Mobile Menu Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-[var(--fg)] hover:text-[var(--color-primary)] transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-3 h-4 w-4 text-[var(--fg-muted)]" />
            <Input
              type="search"
              placeholder="Ara..."
              className="pl-10 w-64 bg-[var(--bg-card)] border-[var(--border)] focus:border-[var(--color-primary)]"
            />
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-[var(--fg)] hover:text-[var(--color-primary)] hover:bg-[var(--bg-hover)]"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* User Menu */}
          <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-[var(--border)]">
            <Avatar className="h-8 w-8 border-2 border-[var(--color-primary)]/20">
              <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
              <AvatarFallback className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-semibold">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:block">
              <p className="text-sm font-semibold text-[var(--fg)]">{profile?.full_name || 'Kullanıcı'}</p>
              <p className="text-xs text-[var(--fg-muted)]">{user?.email}</p>
            </div>
          </div>

          {/* Logout Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="text-[var(--fg)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
            title="Çıkış Yap"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
