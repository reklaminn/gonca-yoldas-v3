import React from 'react';
import { Menu, Bell, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/authStore';
import { signOutUser } from '@/services/auth';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

interface DashboardHeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ setSidebarOpen }) => {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOutUser();
      navigate('/', { replace: true });
      toast.success('Başarıyla çıkış yapıldı');
    } catch (error) {
      console.error('Logout error:', error);
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

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-500 rounded-md lg:hidden hover:text-gray-900 hover:bg-gray-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <h1 className="text-xl font-bold text-gray-900 lg:hidden">
            Gonca Yoldaş
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900">
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url || undefined} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {profile?.full_name || user?.user_metadata?.full_name || 'Kullanıcı'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/dashboard/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Çıkış Yap</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
