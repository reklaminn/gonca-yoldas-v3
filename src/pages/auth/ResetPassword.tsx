import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [touched, setTouched] = useState<{
    password: boolean;
    confirmPassword: boolean;
  }>({
    password: false,
    confirmPassword: false,
  });
  const [isValidSession, setIsValidSession] = useState(false);

  useEffect(() => {
    // Check if user came from password reset email
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Geçersiz veya süresi dolmuş bağlantı');
        navigate('/auth/forgot-password');
        return;
      }
      
      setIsValidSession(true);
    };

    checkSession();
  }, [navigate]);

  const validateField = (field: string, value: string) => {
    const newErrors = { ...validationErrors };
    
    if (field === 'password') {
      if (!value) {
        newErrors.password = 'Yeni şifre gereklidir';
      } else if (value.length < 6) {
        newErrors.password = 'Şifre en az 6 karakter olmalıdır';
      } else {
        delete newErrors.password;
      }
      
      if (touched.confirmPassword) {
        if (confirmPassword !== value) {
          newErrors.confirmPassword = 'Şifreler eşleşmiyor';
        } else {
          delete newErrors.confirmPassword;
        }
      }
    }
    
    if (field === 'confirmPassword') {
      if (!value) {
        newErrors.confirmPassword = 'Şifre tekrarı gereklidir';
      } else if (value !== password) {
        newErrors.confirmPassword = 'Şifreler eşleşmiyor';
      } else {
        delete newErrors.confirmPassword;
      }
    }
    
    setValidationErrors(newErrors);
    return !newErrors[field as keyof typeof newErrors];
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'password') validateField('password', password);
    if (field === 'confirmPassword') validateField('confirmPassword', confirmPassword);
  };

  const handleChange = (field: string, value: string) => {
    if (field === 'password') {
      setPassword(value);
      if (touched.password) validateField('password', value);
    } else if (field === 'confirmPassword') {
      setConfirmPassword(value);
      if (touched.confirmPassword) validateField('confirmPassword', value);
    }
    
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setTouched({ password: true, confirmPassword: true });

    const isPasswordValid = validateField('password', password);
    const isConfirmPasswordValid = validateField('confirmPassword', confirmPassword);

    if (!isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    console.log('🔵 Starting password update process');
    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        console.error('❌ Password update failed:', updateError);
        setError(updateError.message || 'Şifre güncellenemedi');
        setLoading(false);
        return;
      }

      console.log('✅ Password updated successfully');
      toast.success('Şifreniz başarıyla güncellendi!');
      
      setTimeout(() => {
        navigate('/auth/login');
      }, 1500);
    } catch (err: any) {
      console.error('❌ Password update error:', err);
      setError(err?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (!isValidSession) {
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
            <CardTitle className="text-2xl font-bold text-center text-[var(--fg)]">
              Yeni Şifre Belirle
            </CardTitle>
            <CardDescription className="text-center text-[var(--fg-muted)]">
              Hesabınız için yeni bir şifre oluşturun
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} noValidate>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[var(--fg)]">
                  Yeni Şifre
                </Label>
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
                  autoComplete="new-password"
                />
                {touched.password && validationErrors.password && (
                  <div className="flex items-center mt-1 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{validationErrors.password}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[var(--fg)]">
                  Yeni Şifre (Tekrar)
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  disabled={loading}
                  className={`bg-[var(--bg-input)] text-[var(--fg)] border-[var(--border)] ${
                    touched.confirmPassword && validationErrors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  autoComplete="new-password"
                />
                {touched.confirmPassword && validationErrors.confirmPassword && (
                  <div className="flex items-center mt-1 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{validationErrors.confirmPassword}</span>
                  </div>
                )}
              </div>

              <div className="text-sm text-[var(--fg-muted)] space-y-1">
                <p className="font-medium">Şifre gereksinimleri:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>En az 6 karakter uzunluğunda olmalı</li>
                  <li>Güvenli bir şifre seçin</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Güncelleniyor...
                  </>
                ) : (
                  'Şifreyi Güncelle'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
