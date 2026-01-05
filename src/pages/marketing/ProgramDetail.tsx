import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useProgramDetails } from '@/hooks/usePrograms';
import { useTestimonials } from '@/hooks/useTestimonials';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Clock,
  Users,
  Calendar,
  Award,
  CheckCircle,
  ChevronRight,
  Loader2,
  AlertCircle,
  BookOpen,
  Video,
  MessageCircle,
  CreditCard,
  Star,
  ArrowLeft,
  ShoppingCart,
  Check,
  Quote,
  Phone,
  Mail
} from 'lucide-react';

const ProgramDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { program, loading, error } = useProgramDetails(slug || '');
  const { testimonials, loading: testimonialsLoading } = useTestimonials(true);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // --- Hero Animation Logic ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth spring animation for mouse movement
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  // Transform mouse position to rotation values
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXFromCenter = e.clientX - rect.left - width / 2;
    const mouseYFromCenter = e.clientY - rect.top - height / 2;
    
    x.set(mouseXFromCenter / width);
    y.set(mouseYFromCenter / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  // ---------------------------

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // Set default selected option if pricing options exist
  useEffect(() => {
    if (program?.metadata?.pricing_options && program.metadata.pricing_options.length > 0) {
      setSelectedOptionId(program.metadata.pricing_options[0].id);
    }
  }, [program]);

  // Filter testimonials based on program
  const displayTestimonials = useMemo(() => {
    if (!program || !testimonials.length) return [];

    // 1. Try to find testimonials specifically for this program
    const programSpecific = testimonials.filter(t => t.program_slug === program.slug);
    
    if (programSpecific.length > 0) {
      return programSpecific.sort((a, b) => a.display_order - b.display_order);
    }

    // 2. Fallback: Show featured testimonials (mixed)
    return testimonials
      .filter(t => t.is_featured)
      .sort((a, b) => a.display_order - b.display_order)
      .slice(0, 5); // Limit to 5 for fallback
  }, [program, testimonials]);

  if (loading) {
    return (
      <div className="bg-[var(--bg)] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[var(--color-primary)] mx-auto mb-4" />
          <p className="text-[var(--fg-muted)]">Program yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="bg-[var(--bg)] min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-error" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--fg)] mb-2">Program bulunamadı</h2>
          <p className="text-[var(--fg-muted)] mb-6">
            {error || 'Aradığınız program mevcut değil veya kaldırılmış olabilir.'}
          </p>
          <Button
            onClick={() => navigate('/programs')}
            className="bg-gradient-primary text-white font-poppins font-semibold hover:shadow-soft-lg transition-all duration-200 hover:scale-105 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Programlara Dön
          </Button>
        </div>
      </div>
    );
  }

  const metadata = program.metadata || {};
  const installments = metadata.installments || [];
  const pricingOptions = metadata.pricing_options || [];

  // Determine current price and title based on selection
  const selectedOption = pricingOptions.find((opt: any) => opt.id === selectedOptionId);
  const currentPrice = selectedOption ? selectedOption.price : program.price;
  const currentTitle = selectedOption ? selectedOption.title : program.title;

  const handleEnrollClick = () => {
    const checkoutUrl = `/siparis?program=${program.slug}${selectedOptionId ? `&option=${selectedOptionId}` : ''}`;
    navigate(checkoutUrl);
  };

  return (
    <div className="bg-[var(--bg)] min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-rose-400 to-orange-300 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQgNC0xLjc5IDQtLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] animate-pulse"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Button
            variant="ghost"
            onClick={() => navigate('/programs')}
            className="text-white hover:bg-white/10 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Programlara Dön
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <Badge className="bg-white/20 text-white border-white/30 mb-4">
                {program.age_range}
              </Badge>
              {metadata.limited_capacity && (
                <Badge className="bg-yellow-500 text-white border-yellow-600 mb-4 ml-2">
                  <Star className="h-3 w-3 mr-1" />
                  Sınırlı Kontenjan
                </Badge>
              )}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white">
                {program.title}
              </h1>
            
              <p className="text-lg text-white/90 mb-8 whitespace-pre-line">{program.description}</p>

              <div className="flex flex-wrap gap-4 mb-8">
                {metadata.instructor && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <Award className="h-5 w-5" />
                    <span className="font-semibold">{metadata.instructor}</span>
                  </div>
                )}
                {metadata.start_date && (
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <Calendar className="h-5 w-5" />
                    <span>
                      {new Date(metadata.start_date).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="bg-white text-[var(--color-primary)] px-6 py-4 rounded-lg">
                  <div className="text-sm text-[var(--color-primary)]/80 font-medium mb-1">
                    {selectedOption ? selectedOption.title : 'Katılım Ücreti'}
                  </div>
                  <div className="text-3xl font-bold">₺{currentPrice.toLocaleString()}</div>
                </div>
                <Button
                  size="lg"
                  onClick={handleEnrollClick}
                  className="bg-white text-[var(--color-primary)] hover:bg-gray-100 font-poppins font-semibold rounded-lg text-lg px-8 transition-all duration-200 hover:scale-105 h-auto"
                >
                  <div className="flex flex-col items-start text-left">
                    <div className="flex items-center">
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Hemen Kayıt Ol
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </div>
                    {pricingOptions.length > 0 && (
                      <span className="text-xs font-normal mt-1 opacity-80">
                        Seçili Paket: {selectedOption?.title}
                      </span>
                    )}
                  </div>
                </Button>
              </div>
            </div>

            {/* Interactive Hero Image Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative perspective-1000"
              style={{ perspective: 1000 }}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <motion.div
                style={{
                  rotateX: rotateX,
                  rotateY: rotateY,
                  transformStyle: "preserve-3d",
                }}
                className="relative z-10 transition-shadow duration-300"
              >
                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-white/30 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 transform translate-y-4" />

                {program.image_url ? (
                  <img
                    src={program.image_url}
                    alt={program.title}
                    className="rounded-2xl shadow-2xl w-full transform scale-[1.01]"
                  />
                ) : (
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl w-full aspect-video flex items-center justify-center border border-white/20">
                    <BookOpen className="h-24 w-24 text-white/50" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/10 pointer-events-none rounded-2xl" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-grow">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Program Details */}
            <Card className="border-[var(--border)] bg-[var(--bg-card)]">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-[var(--fg)] mb-6">Program Detayları</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--fg)] mb-1">Süre</div>
                      <div className="text-[var(--fg-muted)]">{program.duration}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--fg)] mb-1">Program</div>
                      <div className="text-[var(--fg-muted)]">{program.schedule}</div>
                    </div>
                  </div>


                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-5 w-5 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--fg)] mb-1">Ders Süresi</div>
                      <div className="text-[var(--fg-muted)]">{program.lesson_duration}</div>
                    </div>
                  </div>


                  {metadata.recording_access && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                        <Video className="h-5 w-5 text-[var(--color-primary)]" />
                      </div>
                      <div>
                        <div className="font-semibold text-[var(--fg)] mb-1">Kayıt Erişimi</div>
                        <div className="text-[var(--fg-muted)]">{metadata.recording_access}</div>
                      </div>
                    </div>
                  )}
                </div>

                {metadata.parent_only && (
                  <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                          Önemli Not
                        </div>
                        <div className="text-sm text-yellow-800 dark:text-yellow-200">
                          Bu program sadece ebeveynler içindir. Çocuklu katılım yoktur.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            {program.features && program.features.length > 0 && (
              <Card className="border-[var(--border)] bg-[var(--bg-card)]">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-[var(--fg)] mb-6">Program İçeriği</h2>
                  <div className="space-y-4">
                    {program.features.map((feature, index) => (
                      <motion.div
                        key={feature.id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle className="h-5 w-5 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
                        <span className="text-[var(--fg-muted)]">{feature.feature_text}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Outcomes */}
            {program.outcomes && program.outcomes.length > 0 && (
              <Card className="border-[var(--border)] bg-[var(--bg-card)]">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-[var(--fg)] mb-6">Neden Bu Program?</h2>
                  <div className="space-y-4">
                    {program.outcomes.map((outcome, index) => (
                      <motion.div
                        key={outcome.id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <Award className="h-5 w-5 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
                        <span className="text-[var(--fg-muted)]">{outcome.feature_text}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* FAQs */}
            {program.faqs && program.faqs.length > 0 && (
              <Card className="border-[var(--border)] bg-[var(--bg-card)]">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-[var(--fg)] mb-6">
                    Sıkça Sorulan Sorular
                  </h2>
                  <div className="space-y-6">
                    {program.faqs.map((faq, index) => (
                      <motion.div
                        key={faq.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                      >
                        <h3 className="font-semibold text-[var(--fg)] mb-2">{faq.question}</h3>
                        <p className="text-[var(--fg-muted)]">{faq.answer}</p>
                        {index < program.faqs.length - 1 && (
                          <Separator className="mt-6 bg-[var(--border)]" />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Testimonials Section */}
            {displayTestimonials.length > 0 && (
              <Card className="border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
                      <Quote className="h-6 w-6 text-[var(--color-primary)]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--fg)]">
                      Velilerimiz Ne Diyor?
                    </h2>
                  </div>
                  
                  <Carousel
                    opts={{
                      align: "start",
                      loop: true,
                    }}
                    className="w-full"
                  >
                    <CarouselContent>
                      {displayTestimonials.map((testimonial, index) => (
                        <CarouselItem key={testimonial.id} className="md:basis-1/2">
                          <div className="h-full p-1">
                            <div className="bg-[var(--bg-elev)] p-6 rounded-xl h-full flex flex-col border border-[var(--border)]">
                              <div className="flex mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                                ))}
                              </div>
                              <p className="text-[var(--fg)] text-sm leading-relaxed mb-6 flex-1 italic">
                                "{testimonial.testimonial_text}"
                              </p>
                              <div className="flex items-center gap-3 mt-auto">
                                {testimonial.image_url ? (
                                  <img
                                    src={testimonial.image_url}
                                    alt={testimonial.parent_name}
                                    className="w-10 h-10 rounded-full object-cover border border-[var(--border)]"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] font-bold text-sm">
                                    {testimonial.parent_name.charAt(0)}
                                  </div>
                                )}
                                <div>
                                  <div className="font-semibold text-sm text-[var(--fg)]">
                                    {testimonial.parent_name}
                                  </div>
                                  <div className="text-xs text-[var(--fg-muted)]">
                                    {testimonial.student_info}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <div className="flex justify-end gap-2 mt-4">
                      <CarouselPrevious className="static translate-y-0" />
                      <CarouselNext className="static translate-y-0" />
                    </div>
                  </Carousel>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card - Sticky */}
            <Card className="border-[var(--border)] bg-[var(--bg-card)] sticky top-24 z-30 shadow-sm">
              <CardContent className="p-6">
                
                {/* Pricing Options Selection */}
                {pricingOptions.length > 0 ? (
                  <div className="mb-6 space-y-3">
                    <h3 className="font-semibold text-[var(--fg)] mb-2">Paket Seçimi</h3>
                    {pricingOptions.map((option: any) => (
                      <div
                        key={option.id}
                        onClick={() => setSelectedOptionId(option.id)}
                        className={`
                          relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                          ${selectedOptionId === option.id 
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' 
                            : 'border-[var(--border)] hover:border-[var(--color-primary)]/50'}
                        `}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-[var(--fg)]">{option.title}</span>
                          {selectedOptionId === option.id && (
                            <div className="h-5 w-5 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="text-2xl font-bold text-[var(--color-primary)] mb-2">
                          ₺{option.price.toLocaleString()}
                        </div>
                        <div className="text-sm text-[var(--fg-muted)]">
                          {option.description}
                        </div>
                        {option.details && (
                          <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-1">
                            {option.details.map((detail: string, idx: number) => (
                              <div key={idx} className="text-xs text-[var(--fg-muted)] flex items-center gap-1.5">
                                <div className="w-1 h-1 rounded-full bg-[var(--color-primary)]" />
                                {detail}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-[var(--fg)] mb-2">
                      ₺{program.price.toLocaleString()}
                    </div>
                    <div className="text-[var(--fg-muted)]">{program.duration}</div>
                  </div>
                )}

                {installments.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard className="h-4 w-4 text-[var(--color-primary)]" />
                      <span className="font-semibold text-[var(--fg)]">Taksit Seçenekleri</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {installments.map((months: number) => (
                        <div
                          key={months}
                          className="px-3 py-1.5 bg-[var(--bg-elev)] rounded-lg text-sm font-medium text-[var(--fg)] border border-[var(--border)]"
                        >
                          {months} Taksit
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  size="lg"
                  onClick={handleEnrollClick}
                  className="w-full bg-gradient-primary text-white font-poppins font-semibold hover:shadow-soft-lg transition-all duration-200 hover:scale-105 rounded-lg"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Hemen Kayıt Ol
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>

                {metadata.whatsapp_group && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Dersleri Online Takip Edebilirsiniz.</span>
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-[var(--border)]">
                  <div className="space-y-3 text-sm text-[var(--fg-muted)]">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-[var(--color-primary)]" />
                      <span>Uzman eğitmen desteği</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-[var(--color-primary)]" />
                      <span>Tüm materyaller dahil</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-[var(--color-primary)]" />
                      <span>Sertifika</span>
                    </div>
                    {metadata.recording_access && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-[var(--color-primary)]" />
                        <span>{metadata.recording_access}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Contact Section - Full Width */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
        <Card className="bg-gradient-primary text-white border-none overflow-hidden relative shadow-xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQgNC0xLjc5IDQtLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
          <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-4 max-w-2xl text-center md:text-left">
              <h2 className="text-3xl font-bold text-white">Sorularınız mı var?</h2>
              <p className="text-white/90 text-lg">
                Program hakkında detaylı bilgi almak, aklınıza takılanları sormak için bizimle iletişime geçin.
                Ekibimiz size yardımcı olmaktan mutluluk duyacaktır.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm font-medium">0532 123 45 67</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm font-medium">bilgi@goncayoldas.com</span>
                </div>
              </div>
            </div>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/contact')}
              className="bg-white text-[var(--color-primary)] hover:bg-gray-100 whitespace-nowrap px-8 py-6 text-lg shadow-lg font-semibold transition-transform hover:scale-105"
            >
              Hemen İletişime Geç
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgramDetail;
