import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const validateEmail = (value: string): boolean => {
    if (!value.trim()) {
      setValidationError('E-posta adresi gereklidir');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(value)) {
      setValidationError('Geçerli bir e-posta adresi giriniz');
      return false;
    }
    
    setValidationError(null);
    return true;
  };

  const handleBlur = () => {
    setTouched(true);
    validateEmail(email);
  };

  const handleChange = (value: string) => {
    setEmail(value);
    if (touched) {
      validateEmail(value);
    }
    if (error) setError(null);
    if (success) setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setTouched(true);

    if (!validateEmail(email)) {
      return;
    }

    console.log('🔵 Starting password reset process');
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) {
        console.error('❌ Password reset failed:', resetError);
        setError(resetError.message || 'Şifre sıfırlama bağlantısı gönderilemedi');
        setLoading(false);
        return;
      }

      console.log('✅ Password reset email sent successfully');
      setSuccess(true);
      setEmail('');
      setTouched(false);
    } catch (err: any) {
      console.error('❌ Password reset error:', err);
      setError(err?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

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
              Şifremi Unuttum
            </CardTitle>
            <CardDescription className="text-center text-[var(--fg-muted)]">
              E-posta adresinize şifre sıfırlama bağlantısı göndereceğiz
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

              {success && (
                <Alert className="bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100 border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[var(--fg)]">
                  E-posta
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={(e) => handleChange(e.target.value)}
                  onBlur={handleBlur}
                  disabled={loading || success}
                  className={`bg-[var(--bg-input)] text-[var(--fg)] border-[var(--border)] ${
                    touched && validationError ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  autoComplete="email"
                />
                {touched && validationError && (
                  <div className="flex items-center mt-1 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>{validationError}</span>
                  </div>
                )}
              </div>

              {success && (
                <div className="text-sm text-[var(--fg-muted)] space-y-2">
                  <p>E-postayı görmüyorsanız:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Spam/gereksiz klasörünü kontrol edin</li>
                    <li>Birkaç dakika bekleyin</li>
                    <li>E-posta adresinizi doğru yazdığınızdan emin olun</li>
                  </ul>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || success}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Gönderildi
                  </>
                ) : (
                  'Şifre Sıfırlama Bağlantısı Gönder'
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm">
                <Link 
                  to="/auth/login" 
                  className="flex items-center gap-1 text-[var(--color-primary)] hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Giriş sayfasına dön
                </Link>
              </div>

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
