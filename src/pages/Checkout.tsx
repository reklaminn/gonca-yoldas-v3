import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Building2, CheckCircle2, AlertCircle, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { createOrder } from '@/services/orders';
import { programs } from '@/data/programs';

interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  district: string;
  customerType: 'individual' | 'corporate';
  tcNo: string;
  taxOffice: string;
  taxNumber: string;
  companyName: string;
  billingAddress: string;
  cardName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  installment: number;
}

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const programSlug = searchParams.get('program');

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'bank_transfer'>('credit_card');
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    district: '',
    customerType: 'individual',
    tcNo: '',
    taxOffice: '',
    taxNumber: '',
    companyName: '',
    billingAddress: '',
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    installment: 1,
  });

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setFormData(prev => ({
            ...prev,
            fullName: profile.full_name || '',
            email: profile.email || session.user.email || '',
            phone: profile.phone || '',
            city: profile.city || '',
            district: profile.district || '',
            customerType: profile.billing_type || 'individual',
            tcNo: profile.tc_number || '',
            taxOffice: profile.tax_office || '',
            taxNumber: profile.tax_number || '',
            companyName: profile.company_name || '',
            billingAddress: profile.full_address || '',
          }));
        }
      }
    };
    loadUserData();
  }, []);

  if (!programSlug) return null;
  const program = programs.find(p => p.slug === programSlug);
  if (!program) return null;

  const TAX_RATE = 0.20;
  const subtotal = program.price;
  const taxAmount = subtotal * TAX_RATE;
  const total = subtotal + taxAmount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderId = await createOrder({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        district: formData.district,
        customerType: formData.customerType,
        tcNo: formData.tcNo,
        taxOffice: formData.taxOffice,
        taxNumber: formData.taxNumber,
        billingAddress: formData.billingAddress,
        programId: program.id.toString(),
        programSlug: program.slug,
        programTitle: program.title,
        programPrice: program.price,
        subtotal: subtotal,
        discountPercentage: 0,
        discountAmount: 0,
        taxRate: 20,
        taxAmount: taxAmount,
        totalAmount: total,
        paymentMethod: paymentMethod,
        installment: formData.installment,
        paymentStatus: 'completed',
        cardName: formData.cardName,
        cardLastFour: formData.cardNumber.slice(-4),
        sendpulseSent: false,
      });

      if (orderId) {
        toast.success('Ödeme başarılı!');
        navigate(`/success?order=${orderId}`);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Fatura Bilgileri</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup 
                value={formData.customerType} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, customerType: val as 'individual' | 'corporate' }))}
                className="flex gap-4 mb-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="individual" id="ind" />
                  <Label htmlFor="ind">Bireysel</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="corporate" id="corp" />
                  <Label htmlFor="corp">Kurumsal</Label>
                </div>
              </RadioGroup>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ad Soyad</Label>
                  <Input name="fullName" value={formData.fullName} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label>E-posta</Label>
                  <Input name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                </div>
              </div>

              {formData.customerType === 'individual' ? (
                <div className="space-y-2">
                  <Label>T.C. Kimlik No</Label>
                  <Input name="tcNo" value={formData.tcNo} onChange={handleInputChange} maxLength={11} />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Şirket Ünvanı</Label>
                    <Input name="companyName" value={formData.companyName} onChange={handleInputChange} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Vergi Dairesi</Label>
                      <Input name="taxOffice" value={formData.taxOffice} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label>Vergi Numarası</Label>
                      <Input name="taxNumber" value={formData.taxNumber} onChange={handleInputChange} />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Ödeme</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Input name="cardName" placeholder="Kart Üzerindeki İsim" value={formData.cardName} onChange={handleInputChange} required />
              <Input name="cardNumber" placeholder="Kart Numarası" value={formData.cardNumber} onChange={handleInputChange} required />
              <div className="grid grid-cols-2 gap-4">
                <Input name="expiryDate" placeholder="AA/YY" value={formData.expiryDate} onChange={handleInputChange} required />
                <Input name="cvv" placeholder="CVV" value={formData.cvv} onChange={handleInputChange} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : 'Ödemeyi Tamamla'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader><CardTitle>Sipariş Özeti</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Toplam</span>
                <span>{total.toLocaleString('tr-TR')} ₺</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
