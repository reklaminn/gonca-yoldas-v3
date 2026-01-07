import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabaseClient';
import { Loader2 } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';

// Layouts
import MarketingLayout from './layouts/MarketingLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';

// Marketing Pages
const Home = React.lazy(() => import('./pages/marketing/Home'));
const About = React.lazy(() => import('./pages/marketing/About'));
const Programs = React.lazy(() => import('./pages/marketing/Programs'));
const ProgramDetail = React.lazy(() => import('./pages/marketing/ProgramDetail'));
const Blog = React.lazy(() => import('./pages/marketing/Blog'));
const BlogPost = React.lazy(() => import('./pages/marketing/BlogPost'));
const Contact = React.lazy(() => import('./pages/marketing/Contact'));
const LearningPlatform = React.lazy(() => import('./pages/marketing/LearningPlatform'));
const Checkout = React.lazy(() => import('./pages/marketing/Checkout'));
const PaymentSuccess = React.lazy(() => import('./pages/marketing/PaymentSuccess'));
const PaymentFailure = React.lazy(() => import('./pages/marketing/PaymentFailure'));
const ThankYou = React.lazy(() => import('./pages/marketing/ThankYou'));

// Auth Pages
const Login = React.lazy(() => import('./pages/auth/Login'));
const Signup = React.lazy(() => import('./pages/auth/SignUp'));
const ForgotPassword = React.lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/auth/ResetPassword'));

// Student Dashboard
const Dashboard = React.lazy(() => import('./pages/student/Dashboard'));
const MyPrograms = React.lazy(() => import('./pages/student/MyPrograms'));
const Schedule = React.lazy(() => import('./pages/student/Schedule'));
const Progress = React.lazy(() => import('./pages/student/Progress'));
const Resources = React.lazy(() => import('./pages/student/Resources'));
const Messages = React.lazy(() => import('./pages/student/Messages'));
const Orders = React.lazy(() => import('./pages/student/Orders'));
const OrderDetails = React.lazy(() => import('./pages/student/OrderDetails'));
const StudentSettings = React.lazy(() => import('./pages/student/Settings'));
const Profile = React.lazy(() => import('./pages/student/Profile'));

// Admin Pages
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminMessages = React.lazy(() => import('./pages/admin/AdminMessages'));
const AdminPrograms = React.lazy(() => import('./pages/admin/AdminPrograms'));
const ProgramForm = React.lazy(() => import('./pages/admin/ProgramForm'));
const AdminStudents = React.lazy(() => import('./pages/admin/AdminStudents'));
const AdminRoles = React.lazy(() => import('./pages/admin/AdminRoles'));
const AdminOrders = React.lazy(() => import('./pages/admin/AdminOrders'));
const AdminSettings = React.lazy(() => import('./pages/admin/Settings'));
const ContentManagement = React.lazy(() => import('./pages/admin/ContentManagement'));
const PageContentEditor = React.lazy(() => import('./pages/admin/PageContentEditor'));
const TestimonialsManagement = React.lazy(() => import('./pages/admin/TestimonialsManagement'));
const BlogManagement = React.lazy(() => import('./pages/admin/BlogManagement'));
const BlogEditor = React.lazy(() => import('./pages/admin/BlogEditor'));
const BlogCategories = React.lazy(() => import('./pages/admin/BlogCategories'));

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const fetchProfileDirect = async (userId: string, accessToken?: string): Promise<any> => {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) return null;
    const data = await response.json();
    return data && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error('❌ [fetchProfile] Exception:', err);
    return null;
  }
};

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly = false }) => {
  const { user, profile, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Oturum kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }
  
  if (adminOnly && profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { setUser, setProfile, setLoading, setSession, reset } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        console.log('🔐 [App] Auth initialization started...');
        
        // 1. Supabase'den GÜNCEL oturum bilgisini al
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error || !session) {
          // Oturum yoksa veya hata varsa, temizlik yap
          console.log('ℹ️ [App] No active session found. Clearing storage.');
          reset(); // Zustand ve LocalStorage'ı temizle
        } else {
          // Oturum varsa state'i güncelle
          console.log('✅ [App] Active session found:', session.user.email);
          setUser(session.user);
          setSession(session);
          
          // Profili çek
          const profileData = await fetchProfileDirect(session.user.id, session.access_token);
          if (profileData) {
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error('❌ [App] Auth init failed:', error);
        reset();
      } finally {
        if (mounted) {
          setLoading(false); // Yükleme işlemini SADECE burada bitir
        }
      }
    };

    initAuth();

    // Auth durum değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('🔄 [App] Auth state changed:', event);
      
      if (event === 'SIGNED_OUT') {
        reset(); // Çıkış yapıldığında her şeyi temizle
        setLoading(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          setUser(session.user);
          setSession(session);
          const profileData = await fetchProfileDirect(session.user.id, session.access_token);
          if (profileData) setProfile(profileData);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setUser, setProfile, setLoading, setSession, reset]);

  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          </div>
        }>
          <Routes>
            {/* Marketing Routes */}
            <Route element={<MarketingLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/programs/:slug" element={<ProgramDetail />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/learning-platform" element={<LearningPlatform />} />
              <Route path="/siparis" element={<Checkout />} />
              <Route path="/tesekkurler" element={<ThankYou />} />
            </Route>

            {/* Payment Routes */}
            <Route path="/odeme-basarili" element={<PaymentSuccess />} />
            <Route path="/odeme-basarisiz" element={<PaymentFailure />} />
            
            {/* Auth Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />

            {/* Student Dashboard */}
            <Route path="/dashboard" element={
              <ErrorBoundary>
                <ProtectedRoute><DashboardLayout /></ProtectedRoute>
              </ErrorBoundary>
            }>
              <Route index element={<Dashboard />} />
              <Route path="programs" element={<MyPrograms />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="progress" element={<Progress />} />
              <Route path="resources" element={<Resources />} />
              <Route path="messages" element={<Messages />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:orderId" element={<OrderDetails />} />
              <Route path="settings" element={<StudentSettings />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Admin Panel */}
            <Route path="/admin" element={
              <ErrorBoundary>
                <ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>
              </ErrorBoundary>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="roles" element={<AdminRoles />} />
              <Route path="programs" element={<AdminPrograms />} />
              <Route path="programs/new" element={<ProgramForm />} />
              <Route path="programs/edit/:id" element={<ProgramForm />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="content" element={<ContentManagement />} />
              <Route path="content/blog" element={<BlogManagement />} />
              <Route path="content/blog/new" element={<BlogEditor />} />
              <Route path="content/blog/edit/:id" element={<BlogEditor />} />
              <Route path="content/blog/categories" element={<BlogCategories />} />
              <Route path="content/:pageKey" element={<PageContentEditor />} />
              <Route path="content/testimonials" element={<TestimonialsManagement />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
      <Toaster position="top-right" richColors />
    </ErrorBoundary>
  );
}

export default App;
