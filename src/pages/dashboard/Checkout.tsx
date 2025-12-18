import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { CreditCard, Lock, ArrowLeft, Loader2 } from 'lucide-react';

interface Program {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  age_range: string;
}

export default function Checkout() {
  const { programId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (programId) {
      fetchProgram();
    }
  }, [programId]);

  const fetchProgram = async () => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('id', programId)
        .single();

      if (error) throw error;
      setProgram(data);
    } catch (error) {
      console.error('Error fetching program:', error);
      toast.error('Program bilgileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !program) return;

    setProcessing(true);
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          program_id: program.id,
          program_name: program.title,
          amount: program.price,
          status: 'completed'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create enrollment
      const { error: enrollmentError } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          program_id: program.id,
          status: 'active'
        });

      if (enrollmentError) throw enrollmentError;

      toast.success('Ödeme başarılı! Programa kaydınız tamamlandı.');
      navigate('/dashboard/programs');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Ödeme işlemi sırasında bir hata oluştu');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Program bulunamadı</p>
        <Button onClick={() => navigate('/programs')}>
          Programlara Dön
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Geri Dön
      </Button>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Sipariş Özeti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <img
                src={program.image_url || 'https://images.pexels.com/photos/1648387/pexels-photo-1648387.jpeg?auto=compress&cs=tinysrgb&w=200'}
                alt={program.title}
                className="w-24 h-24 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-semibold">{program.title}</h3>
                <p className="text-sm text-muted-foreground">{program.age_range}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Program Ücreti</span>
                <span className="font-medium">₺{program.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">KDV (%18)</span>
                <span className="font-medium">₺{(program.price * 0.18).toFixed(2)}</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between text-lg font-bold">
              <span>Toplam</span>
              <span>₺{(program.price * 1.18).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Ödeme Bilgileri</CardTitle>
            <CardDescription>
              Güvenli ödeme için kart bilgilerinizi girin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCheckout} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardName">Kart Üzerindeki İsim</Label>
                <Input
                  id="cardName"
                  placeholder="AD SOYAD"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Kart Numarası</Label>
                <div className="relative">
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                  <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Son Kullanma</Label>
                  <Input
                    id="expiry"
                    placeholder="AA/YY"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    maxLength={3}
                    required
                  />
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Ödeme bilgileriniz SSL sertifikası ile şifrelenir ve güvenli bir şekilde işlenir.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    İşleniyor...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Güvenli Ödeme Yap
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
