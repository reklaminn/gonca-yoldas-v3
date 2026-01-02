import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function Login() {
  const navigate = useNavigate();
  const { user, profile, session, loading: authLoading, setUser, setProfile, setSession } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [touched, setTouched] = useState<{
    email: boolean;
    password: boolean;
  }>({
    email: false,
    password: false,
  });

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user && profile && session) {
      console.log('✅ User already logged in, role:', profile.role);
      console.log('✅ Session available:', !!session.access_token);
      
      if (profile.role === 'admin') {
        console.log('🔐 Admin user detected, redirecting to /admin');
        navigate('/admin', { replace: true });
      } else {
        console.log('👤 Regular user detected, redirecting to /dashboard');
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, profile, session, authLoading, navigate]);

  const validateField = (field: string, value: string) => {
    const newErrors = { ...validationErrors };
    
    if (field === 'email') {
      if (!value) {
        newErrors.email = 'E-posta adresi gereklidir';
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        newErrors.email = 'Geçerli bir e-posta adresi giriniz';
      } else {
        delete newErrors.email;
      }
    }
    
    if (field === 'password') {
      if (!value) {
        newErrors.password = 'Şifre gereklidir';
      } else {
        delete newErrors.password;
      }
    }
    
    setValidationErrors(newErrors);
    return !newErrors[field as keyof typeof newErrors];
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'email') validateField('email', email);
    if (field === 'password') validateField('password', password);
  };

  const handleChange = (field: string, value: string) => {
    if (field === 'email') {
      setEmail(value);
      if (touched.email) validateField('email', value);
    } else if (field === 'password') {
      setPassword(value);
      if (touched.password) validateField('password', value);
    }
    
    if (error) setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setTouched({ email: true, password: true });

    const isEmailValid = validateField('email', email);
    const isPasswordValid = validateField('password', password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    console.log('🔵 [Login] Starting login process for:', email);
    setLoading(true);

    try {
      // 1. Sign in with Supabase Auth
      console.log('🔵 [Login] Calling signInWithPassword...');
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('❌ [Login] Sign in failed:', signInError);
        setError('E-posta veya şifre hatalı');
        setLoading(false);
        return;
      }

      if (!data.user || !data.session) {
        console.error('❌ [Login] No user or session returned');
        setError('Giriş yapılamadı. Lütfen tekrar deneyin.');
        setLoading(false);
        return;
      }

      console.log('✅ [Login] Sign in successful, user ID:', data.user.id);
      console.log('✅ [Login] Session received, access_token:', !!data.session.access_token);

      // 2. ✅ CRITICAL: Store session in Zustand IMMEDIATELY
      console.log('🔵 [Login] Storing session in Zustand...');
      setSession(data.session);
      setUser(data.user);

      // 3. Fetch user profile
      console.log('🔵 [Login] Fetching user profile...');
      const profileResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${data.user.id}&select=*`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${data.session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        console.error('❌ [Login] Profile fetch failed:', errorData);
        setError('Profil bilgileri alınamadı');
        setLoading(false);
        return;
      }

      const profiles = await profileResponse.json();
      const userProfile = profiles[0];

      if (!userProfile) {
        console.error('❌ [Login] No profile found');
        setError('Kullanıcı profili bulunamadı');
        setLoading(false);
        return;
      }

      console.log('✅ [Login] Profile loaded, role:', userProfile.role);
      
      // 4. Store profile in Zustand
      setProfile(userProfile);

      // 5. Verify Zustand state
      console.log('🔵 [Login] Verifying Zustand state...');
      const currentState = useAuthStore.getState();
      console.log('✅ [Login] Zustand state:', {
        hasUser: !!currentState.user,
        hasProfile: !!currentState.profile,
        hasSession: !!currentState.session,
        hasToken: !!currentState.session?.access_token,
        role: currentState.profile?.role
      });

      toast.success('Giriş başarılı!');

      // 6. Redirect based on role
      if (userProfile.role === 'admin') {
        console.log('🔐 [Login] Admin login detected, redirecting to /admin');
        navigate('/admin', { replace: true });
      } else {
        console.log('👤 [Login] Regular user login, redirecting to /dashboard');
        navigate('/dashboard', { replace: true });
      }

      setLoading(false);
    } catch (err: any) {
      console.error('❌ [Login] Unexpected error:', err);
      setError(err?.message || 'Giriş yapılırken bir hata oluştu');
      setLoading(false);
    }
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-[var(--border)] bg-[var(--bg-card)]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-[var(--fg)]">Giriş Yap</CardTitle>
            <CardDescription className="text-center text-[var(--fg-muted)]">
              Hesabınıza giriş yapın
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin} noValidate>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[var(--fg)]">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  disabled={loading}
                  className={`bg-[var(--bg-input)] text-[var(--fg)] border-[var(--border)] ${
                    touched.email && validationErrors.email ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                />
                {touched.email && validationErrors.email && (
                  <div className="flex items-center mt-1 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{validationErrors.email}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[var(--fg)]">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  disabled={loading}
                  className={`bg-[var(--bg-input)] text-[var(--fg)] border-[var(--border)] ${
                    touched.password && validationErrors.password ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                />
                {touched.password && validationErrors.password && (
                  <div className="flex items-center mt-1 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{validationErrors.password}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end">
                <Link 
                  to="/auth/forgot-password" 
                  className="text-sm text-[var(--color-primary)] hover:underline"
                >
                  Şifremi unuttum
                </Link>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Giriş yapılıyor...
                  </>
                ) : (
                  'Giriş Yap'
                )}
              </Button>
              <p className="text-sm text-center text-[var(--fg-muted)]">
                Hesabınız yok mu?{' '}
                <Link to="/auth/signup" className="text-[var(--color-primary)] hover:underline">
                  Kayıt Ol
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
