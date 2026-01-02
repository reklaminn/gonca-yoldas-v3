import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Loader2 } from 'lucide-react';

const DashboardLayout: React.FC = () => {
  // ARTIK Context yerine Store kullanıyoruz
  const { user, loading } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Loading durumu ProtectedRoute tarafından yönetilse de,
  // layout içinde de tutarlı olması için store'dan kontrol ediyoruz.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  // Kullanıcı yoksa doğru login sayfasına yönlendir
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <DashboardSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <DashboardHeader 
          setSidebarOpen={setSidebarOpen}
        />

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
