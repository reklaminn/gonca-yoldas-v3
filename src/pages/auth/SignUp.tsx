import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { signUpUser } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

type FormData = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  city: string;
  district: string;
  taxOffice: string;
  taxNumber: string;
};

type ValidationErrors = {
  [key in keyof FormData]?: string;
};

type TouchedFields = {
  [key in keyof FormData]: boolean;
};

export default function SignUp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Program bilgisini state'den al
  const programInfo = location.state as { programSlug?: string; programTitle?: string } | null;

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
    district: '',
    taxOffice: '',
    taxNumber: '',
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
    phone: false,
    city: false,
    district: false,
    taxOffice: false,
    taxNumber: false,
  });

  useEffect(() => {
    if (programInfo?.programTitle) {
      console.log('🔵 SignUp: User came from program:', programInfo.programTitle);
      toast.info(`${programInfo.programTitle} programı için kayıt oluyorsunuz`);
    }
  }, [programInfo]);

  const validateField = (field: keyof FormData, value: string): boolean => {
    const newErrors = { ...validationErrors };
    
    switch (field) {
      case 'fullName':
        if (!value.trim()) {
          newErrors.fullName = 'Ad Soyad gereklidir';
        } else {
          delete newErrors.fullName;
        }
        break;
      
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'E-posta adresi gereklidir';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          newErrors.email = 'Geçerli bir e-posta adresi giriniz';
        } else {
          delete newErrors.email;
        }
        break;
      
      case 'password':
        if (!value) {
          newErrors.password = 'Şifre gereklidir';
        } else if (value.length < 6) {
          newErrors.password = 'Şifre en az 6 karakter olmalıdır';
        } else {
          delete newErrors.password;
        }
        
        if (touched.confirmPassword) {
          if (formData.confirmPassword !== value) {
            newErrors.confirmPassword = 'Şifreler eşleşmiyor';
          } else {
            delete newErrors.confirmPassword;
          }
        }
        break;
      
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Şifre tekrarı gereklidir';
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Şifreler eşleşmiyor';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
      
      case 'phone':
        if (!value.trim()) {
          newErrors.phone = 'Telefon numarası gereklidir';
        } else {
          delete newErrors.phone;
        }
        break;
      
      case 'city':
        if (!value.trim()) {
          newErrors.city = 'İl gereklidir';
        } else {
          delete newErrors.city;
        }
        break;
      
      case 'district':
        if (!value.trim()) {
          newErrors.district = 'İlçe gereklidir';
        } else {
          delete newErrors.district;
        }
        break;
      
      case 'taxOffice':
      case 'taxNumber':
        break;
    }
    
    setValidationErrors(newErrors);
    return !newErrors[field];
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (touched[field]) {
      validateField(field, value);
    }
    
    if (error) setError(null);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key as keyof FormData] = true;
      return acc;
    }, {} as TouchedFields);
    
    setTouched(allTouched);

    let isValid = true;
    const requiredFields: (keyof FormData)[] = ['fullName', 'email', 'password', 'confirmPassword', 'phone', 'city', 'district'];
    
    for (const field of requiredFields) {
      const valid = validateField(field, formData[field]);
      if (!valid) {
        isValid = false;
      }
    }

    if (!isValid) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    console.log('🔵 SignUp: Starting registration process');
    if (programInfo?.programSlug) {
      console.log('🔵 SignUp: Program context:', programInfo.programSlug);
    }
    
    setLoading(true);

    try {
      const userId = await signUpUser({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        city: formData.city,
        district: formData.district,
        taxOffice: formData.taxOffice,
        taxNumber: formData.taxNumber,
      });

      if (!userId) {
        console.error('❌ SignUp: Registration failed');
        setError('Kayıt işlemi başarısız oldu. Lütfen tekrar deneyin.');
        setLoading(false);
        return;
      }

      console.log('✅ SignUp: Registration successful, user ID:', userId);
      
      if (programInfo?.programSlug) {
        toast.success(`Kayıt başarılı! ${programInfo.programTitle} programı için giriş yapabilirsiniz.`);
      } else {
        toast.success('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
      }
      
      setTimeout(() => {
        navigate('/auth/signin', { 
          state: { 
            fromSignup: true,
            programSlug: programInfo?.programSlug 
          } 
        });
      }, 1500);
    } catch (err: any) {
      console.error('❌ SignUp: Unexpected error:', err);
      setError(err?.message || 'Kayıt sırasında bir hata oluştu');
      toast.error(err?.message || 'Kayıt sırasında bir hata oluştu');
    } finally {
      setLoading(false);
      console.log('🔵 SignUp: Process completed');
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-[var(--border)] bg-[var(--bg-card)]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-[var(--fg)]">Kayıt Ol</CardTitle>
            <CardDescription className="text-center text-[var(--fg-muted)]">
              Yeni hesap oluşturun
            </CardDescription>
            
            {programInfo?.programTitle && (
              <Alert className="mt-4 border-[var(--color-primary)] bg-[var(--color-primary)]/10">
                <Info className="h-4 w-4 text-[var(--color-primary)]" />
                <AlertDescription className="text-[var(--fg)]">
                  <strong>{programInfo.programTitle}</strong> programı için kayıt oluyorsunuz
                </AlertDescription>
              </Alert>
            )}
          </CardHeader>
          <form onSubmit={handleSignUp} noValidate>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <motion.div 
                variants={staggerChildren}
                className="grid md:grid-cols-2 gap-4"
              >
                <motion.div variants={fadeIn} className="space-y-2">
                  <Label htmlFor="fullName" className="text-[var(--fg)]">Ad Soyad *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    onBlur={() => handleBlur('fullName')}
                    disabled={loading}
                    className={`bg-[var(--bg-input)] text-[var(--fg)] border-[var(--border)] ${
                      touched.fullName && validationErrors.fullName ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {touched.fullName && validationErrors.fullName && (
                    <div className="flex items-center mt-1 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span>{validationErrors.fullName}</span>
                    </div>
                  )}
                </motion.div>

                <motion.div variants={fadeIn} className="space-y-2">
                  <Label htmlFor="email" className="text-[var(--fg)]">E-posta *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
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
                </motion.div>

                <motion.div variants={fadeIn} className="space-y-2">
                  <Label htmlFor="password" className="text-[var(--fg)]">Şifre *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
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
                </motion.div>

                <motion.div variants={fadeIn} className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[var(--fg)]">Şifre Tekrar *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    disabled={loading}
                    className={`bg-[var(--bg-input)] text-[var(--fg)] border-[var(--border)] ${
                      touched.confirmPassword && validationErrors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {touched.confirmPassword && validationErrors.confirmPassword && (
                    <div className="flex items-center mt-1 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span>{validationErrors.confirmPassword}</span>
                    </div>
                  )}
                </motion.div>

                <motion.div variants={fadeIn} className="space-y-2">
                  <Label htmlFor="phone" className="text-[var(--fg)]">Telefon *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    onBlur={() => handleBlur('phone')}
                    placeholder="5XX XXX XX XX"
                    disabled={loading}
                    className={`bg-[var(--bg-input)] text-[var(--fg)] border-[var(--border)] ${
                      touched.phone && validationErrors.phone ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {touched.phone && validationErrors.phone && (
                    <div className="flex items-center mt-1 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span>{validationErrors.phone}</span>
                    </div>
                  )}
                </motion.div>

                <motion.div variants={fadeIn} className="space-y-2">
                  <Label htmlFor="city" className="text-[var(--fg)]">İl *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    onBlur={() => handleBlur('city')}
                    disabled={loading}
                    className={`bg-[var(--bg-input)] text-[var(--fg)] border-[var(--border)] ${
                      touched.city && validationErrors.city ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {touched.city && validationErrors.city && (
                    <div className="flex items-center mt-1 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span>{validationErrors.city}</span>
                    </div>
                  )}
                </motion.div>

                <motion.div variants={fadeIn} className="space-y-2">
                  <Label htmlFor="district" className="text-[var(--fg)]">İlçe *</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    onBlur={() => handleBlur('district')}
                    disabled={loading}
                    className={`bg-[var(--bg-input)] text-[var(--fg)] border-[var(--border)] ${
                      touched.district && validationErrors.district ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {touched.district && validationErrors.district && (
                    <div className="flex items-center mt-1 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span>{validationErrors.district}</span>
                    </div>
                  )}
                </motion.div>

                <motion.div variants={fadeIn} className="space-y-2">
                  <Label htmlFor="taxOffice" className="text-[var(--fg)]">Vergi Dairesi (Opsiyonel)</Label>
                  <Input
                    id="taxOffice"
                    value={formData.taxOffice}
                    onChange={(e) => handleInputChange('taxOffice', e.target.value)}
                    disabled={loading}
                    className="bg-[var(--bg-input)] text-[var(--fg)] border-[var(--border)]"
                  />
                </motion.div>

                <motion.div variants={fadeIn} className="space-y-2 md:col-span-2">
                  <Label htmlFor="taxNumber" className="text-[var(--fg)]">Vergi Numarası (Opsiyonel)</Label>
                  <Input
                    id="taxNumber"
                    value={formData.taxNumber}
                    onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                    disabled={loading}
                    className="bg-[var(--bg-input)] text-[var(--fg)] border-[var(--border)]"
                  />
                </motion.div>
              </motion.div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Kayıt yapılıyor...
                  </>
                ) : (
                  'Kayıt Ol'
                )}
              </Button>
              <p className="text-sm text-center text-[var(--fg-muted)]">
                Zaten hesabınız var mı?{' '}
                <Link to="/auth/signin" className="text-[var(--color-primary)] hover:underline">
                  Giriş Yap
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
