import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Star,
  Shield,
  BookOpen,
  PlayCircle,
  MessageCircle,
  Award,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

interface Program {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  level: string;
  features: string[];
  image_url: string;
  slug: string;
  metadata?: {
    dates?: Array<{
      id: string;
      startDate: string;
      endDate: string;
      quota: number;
      enrolled: number;
    }>;
  };
}

const ProgramDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDateId, setSelectedDateId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const { data, error } = await supabase
          .from('programs')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setProgram(data);
        
        // İlk tarihi varsayılan olarak seç
        if (data?.metadata?.dates && data.metadata.dates.length > 0) {
          // Sadece gelecekteki ve kontenjanı dolu olmayan tarihleri filtrele
          const availableDates = data.metadata.dates.filter((d: any) => {
            const isFuture = new Date(d.startDate) > new Date();
            const hasSpace = d.enrolled < d.quota;
            return isFuture && hasSpace;
          });
          
          if (availableDates.length > 0) {
            setSelectedDateId(availableDates[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching program:', error);
        toast.error('Program detayları yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProgram();
    }
  }, [slug]);

  const handleEnroll = () => {
    if (!program) return;

    if (!selectedDateId && program.metadata?.dates && program.metadata.dates.length > 0) {
      toast.error('Lütfen bir eğitim dönemi seçiniz.');
      return;
    }

    // Seçilen tarihi bul
    const selectedDate = program.metadata?.dates?.find(d => d.id === selectedDateId);

    navigate('/siparis', { 
      state: { 
        programId: program.id,
        programTitle: program.title,
        price: program.price,
        selectedDate: selectedDate
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Program Bulunamadı</h1>
        <Link to="/programs">
          <Button>Programlara Dön</Button>
        </Link>
      </div>
    );
  }

  const availableDates = program.metadata?.dates?.filter((d: any) => {
    // Geçmiş tarihleri gösterme
    return new Date(d.startDate) > new Date();
  }).sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()) || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gray-900 py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={program.image_url} 
            alt={program.title} 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-3 mb-6">
              <Badge className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm">
                {program.level === 'beginner' ? 'Başlangıç Seviye' : 
                 program.level === 'intermediate' ? 'Orta Seviye' : 'İleri Seviye'}
              </Badge>
              <Badge variant="outline" className="text-white border-white/30 px-3 py-1 text-sm">
                {program.duration}
              </Badge>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {program.title}
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              {program.description}
            </p>
            
            <div className="flex flex-wrap gap-6 text-gray-300 mb-8">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                <span>Sınırlı Kontenjan</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-400" />
                <span>Sertifikalı Program</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-400" />
                <span>{program.duration}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Features */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Program İçeriği</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {program.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum Preview */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Neler Öğreneceksiniz?</h2>
              <div className="space-y-4">
                {[
                  { icon: BookOpen, title: "Kapsamlı Eğitim Materyalleri", desc: "Her hafta yenilenen dijital kaynaklar ve çalışma kağıtları." },
                  { icon: PlayCircle, title: "Video Dersler", desc: "İstediğiniz zaman izleyebileceğiniz yüksek kaliteli video içerikler." },
                  { icon: MessageCircle, title: "Birebir Geri Bildirim", desc: "Eğitmenlerimizden düzenli gelişim raporları ve öneriler." },
                  { icon: Users, title: "Topluluk Desteği", desc: "Diğer ebeveynlerle deneyim paylaşımı yapabileceğiniz özel gruplar." }
                ].map((item, index) => (
                  <div key={index} className="flex gap-4 p-6 rounded-xl border border-gray-200 hover:border-blue-200 transition-colors">
                    <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Pricing Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-1">Program Ücreti</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(program.price)}
                    </span>
                    <span className="text-gray-500">/ toplam</span>
                  </div>
                </div>

                {/* Date Selection */}
                {availableDates.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-3 uppercase tracking-wide">Eğitim Dönemi Seçiniz</h3>
                    <div className="space-y-2">
                      {availableDates.map((date: any) => {
                        const isFull = date.enrolled >= date.quota;
                        return (
                          <div 
                            key={date.id}
                            onClick={() => !isFull && setSelectedDateId(date.id)}
                            className={`
                              relative p-3 rounded-lg border-2 cursor-pointer transition-all
                              ${selectedDateId === date.id 
                                ? 'border-blue-600 bg-blue-50' 
                                : isFull 
                                  ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed' 
                                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                              }
                            `}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`font-medium ${selectedDateId === date.id ? 'text-blue-900' : 'text-gray-900'}`}>
                                {new Date(date.startDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                              </span>
                              {isFull ? (
                                <Badge variant="secondary" className="bg-gray-200 text-gray-600">Dolu</Badge>
                              ) : (
                                <Badge variant="secondary" className={selectedDateId === date.id ? 'bg-blue-200 text-blue-800' : 'bg-green-100 text-green-800'}>
                                  {date.quota - date.enrolled} kişilik yer
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(date.startDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} - 
                              {new Date(date.endDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full h-12 text-lg font-medium" 
                  onClick={handleEnroll}
                  disabled={availableDates.length > 0 && !selectedDateId}
                >
                  Hemen Kayıt Ol
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Shield className="h-4 w-4" />
                  <span>Güvenli Ödeme Altyapısı</span>
                </div>
              </div>

              {/* Need Help? */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h3 className="font-semibold text-blue-900 mb-2">Sorularınız mı var?</h3>
                <p className="text-blue-700 text-sm mb-4">
                  Program hakkında detaylı bilgi almak için eğitim danışmanlarımızla görüşebilirsiniz.
                </p>
                <Link to="/contact">
                  <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-100">
                    İletişime Geç
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetail;
