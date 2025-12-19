import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabaseClient';
import { Loader2 } from 'lucide-react'; // Eksik olan import eklendi

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
const Contact = React.lazy(() => import('./pages/marketing/Contact'));
const LearningPlatform = React.lazy(() => import('./pages/marketing/LearningPlatform'));
const Checkout = React.lazy(() => import('./pages/marketing/Checkout'));
const PaymentSuccess = React.lazy(() => import('./pages/marketing/PaymentSuccess'));
const PaymentFailure = React.lazy(() => import('./pages/marketing/PaymentFailure'));

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

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly = false }) => {
  const { user, profile, loading } = useAuthStore();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div>;
  if (!user) return <Navigate to="/auth/login" replace />;
  if (adminOnly && profile?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

function App() {
  const { setUser, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setProfile, setLoading]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Router>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-blue-600" /></div>}>
          <Routes>
            <Route element={<MarketingLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/programs/:slug" element={<ProgramDetail />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/learning-platform" element={<LearningPlatform />} />
              <Route path="/siparis" element={<Checkout />} />
            </Route>

            <Route path="/odeme-basarili" element={<PaymentSuccess />} />
            <Route path="/odeme-basarisiz" element={<PaymentFailure />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />

            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
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

            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
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
              <Route path="content/:pageKey" element={<PageContentEditor />} />
              <Route path="content/testimonials" element={<TestimonialsManagement />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;
