import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Award, TrendingUp, ArrowRight, Loader2, Star } from 'lucide-react';
import { usePrograms } from '@/hooks/usePrograms';
import { useTestimonials } from '@/hooks/useTestimonials';
import SEO from '@/components/SEO';
import { generateOrganizationSchema } from '@/utils/schema';
import { usePageContent } from '@/hooks/usePageContent';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

// Icon mapping for dynamic icons from JSON
const iconMap: Record<string, React.ReactNode> = {
  BookOpen: <BookOpen className="h-8 w-8" />,
  Users: <Users className="h-8 w-8" />,
  Award: <Award className="h-8 w-8" />,
  TrendingUp: <TrendingUp className="h-8 w-8" />,
};

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { content, loading: contentLoading } = usePageContent('home');
  
  // Fetch active programs from database
  const { programs, loading: programsLoading } = usePrograms('active');
  
  // Fetch active testimonials from database
  const { testimonials, loading: testimonialsLoading } = useTestimonials(true);

  const handleSignUpClick = () => {
    console.log('🔵 Sign Up button clicked');
    navigate('/auth/signup');
  };

  // Parse JSON content safely
  const features = useMemo(() => {
    try {
      if (content.features_list) {
        return JSON.parse(content.features_list) as FeatureItem[];
      }
    } catch (e) {
      console.error('Error parsing features_list:', e);
    }
    return [];
  }, [content.features_list]);

  // Get featured testimonials (10 from Kids Online English program)
  const featuredTestimonials = useMemo(() => {
    return testimonials
      .filter(t => t.program_slug === 'cocuklar-icin-online-ingilizce' && t.is_featured)
      .sort((a, b) => a.display_order - b.display_order)
      .slice(0, 10);
  }, [testimonials]);

  const ageGroups = [
    { label: '0-2 Yaş', value: '0-2' },
    { label: '2-5 Yaş', value: '2-5' },
    { label: '5-10 Yaş', value: '5-10' },
  ];

  if (contentLoading || programsLoading || testimonialsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <Loader2 className="h-12 w-12 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title={content.hero_title || "Anasayfa"}
        description={content.hero_description || "0-10 yaş arası çocuklar için bilimsel temelli İngilizce edinim programları."}
        canonical="/"
        schema={generateOrganizationSchema()}
      />

      <div className="bg-[var(--bg)]">
        {/* Hero Section */}
        {(content.hero_title || content.hero_description) && (
          <section className="relative overflow-hidden py-20 lg:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {content.hero_title && (
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--fg)] mb-6">
                      {content.hero_title}{' '}
                      <span 
                        className="bg-gradient-primary bg-clip-text text-transparent" 
                        style={{ 
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}
                      >
                        {content.hero_subtitle}
                      </span>
                    </h1>
                  )}
                  
                  {content.hero_description && (
                    <p className="text-lg md:text-xl text-[var(--fg-muted)] mb-8">
                      {content.hero_description}
                    </p>
                  )}

                  {/* Age Filter Buttons */}
                  <div className="flex flex-wrap gap-3 mb-8">
                    {ageGroups.map((group) => (
                      <Button
                        key={group.value}
                        onClick={() => navigate(`/programs?age=${group.value}`)}
                        className="btn-secondary"
                      >
                        {group.label}
                      </Button>
                    ))}
                  </div>

                  <Button
                    onClick={() => navigate('/programs')}
                    className="bg-gradient-primary text-white font-poppins font-semibold hover:shadow-soft-lg transition-all duration-200 hover:scale-105 rounded-lg text-lg px-8 py-6"
                  >
                    Programları Keşfet
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="relative"
                >
                  <div className="aspect-square rounded-2xl bg-gradient-primary p-1">
                    <div className="w-full h-full rounded-xl bg-[var(--bg-card)] flex items-center justify-center overflow-hidden">
                      <img
                        src={content.hero_image || "https://images.pexels.com/photos/8535214/pexels-photo-8535214.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
                        alt="Mutlu öğrenen çocuklar"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        )}

        {/* Programs Section */}
        {content.programs_title && programs.length > 0 && (
          <section className="py-20 bg-[var(--bg-elev)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--fg)] mb-4">
                  {content.programs_title}
                </h2>
                <p className="text-lg text-[var(--fg-muted)] max-w-2xl mx-auto">
                  {content.programs_description}
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {programs.slice(0, 3).map((program, index) => (
                  <motion.div
                    key={program.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="card h-full hover:shadow-soft-lg transition-all duration-200 flex flex-col">
                      <div className="relative h-48 overflow-hidden rounded-t-xl">
                        {program.image_url ? (
                          <img
                            src={program.image_url}
                            alt={program.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                            <span className="text-white text-2xl font-bold px-4 text-center">
                              {program.short_title}
                            </span>
                          </div>
                        )}
                        {program.featured && (
                          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
                            Öne Çıkan
                          </div>
                        )}
                      </div>
                      
                      <CardHeader>
                        <div className="text-sm font-semibold mb-2" style={{ color: 'var(--color-accent)' }}>
                          {program.age_range}
                        </div>
                        <CardTitle style={{ color: 'var(--fg)' }} className="line-clamp-1">{program.title}</CardTitle>
                        <CardDescription style={{ color: 'var(--fg-muted)' }} className="line-clamp-2">
                          {program.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="mt-auto">
                        <div className="space-y-2 mb-4 text-sm" style={{ color: 'var(--fg-muted)' }}>
                          <p>📅 {program.schedule}</p>
                          <p>💰 ₺{program.price.toLocaleString('tr-TR')}</p>
                        </div>
                        <Button
                          onClick={() => navigate(`/programs/${program.slug}`)}
                          className="btn-primary w-full"
                        >
                          Detaylı Bilgi
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              
              {programs.length > 3 && (
                <div className="text-center mt-12">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/programs')}
                    className="border-[var(--border)] text-[var(--fg)] hover:bg-[var(--bg-hover)]"
                  >
                    Tüm Programları Gör
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Features Section */}
        {content.features_title && features.length > 0 && (
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--fg)] mb-4">
                  {content.features_title}
                </h2>
                <p className="text-lg text-[var(--fg-muted)] max-w-2xl mx-auto">
                  {content.features_description}
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-[var(--bg-card)] p-6 rounded-xl shadow-soft hover:shadow-soft-lg transition-all duration-200 border border-[var(--border)]"
                  >
                    <div className="text-[var(--color-primary)] mb-4">
                      {iconMap[feature.icon] || <BookOpen className="h-8 w-8" />}
                    </div>
                    <h3 className="text-xl font-bold text-[var(--fg)] mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-[var(--fg-muted)]">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Testimonials Section - CAROUSEL */}
        {featuredTestimonials.length > 0 && (
          <section className="py-20 bg-[var(--bg-elev)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--fg)] mb-4">
                  Velilerimiz Ne Diyor?
                </h2>
                <p className="text-lg text-[var(--fg-muted)] max-w-2xl mx-auto">
                  Çocuklar İçin Online İngilizce programımıza katılan velilerimizin deneyimleri
                </p>
              </motion.div>

              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {featuredTestimonials.map((testimonial, index) => (
                    <CarouselItem key={testimonial.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: index * 0.05 }}
                        className="h-full"
                      >
                        <Card className="card h-full flex flex-col">
                          <CardContent className="pt-6 flex-1 flex flex-col">
                            {/* Star Rating */}
                            <div className="flex mb-4">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                            
                            {/* Testimonial Text */}
                            <p className="mb-6 flex-1 text-sm leading-relaxed" style={{ color: 'var(--fg)', opacity: 0.9 }}>
                              "{testimonial.testimonial_text}"
                            </p>
                            
                            {/* Parent Info */}
                            <div className="flex items-center gap-3 mt-auto pt-4 border-t border-[var(--border)]">
                              {testimonial.image_url && (
                                <img
                                  src={testimonial.image_url}
                                  alt={testimonial.parent_name}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                />
                              )}
                              <div>
                                <p className="font-semibold text-sm" style={{ color: 'var(--fg)' }}>
                                  {testimonial.parent_name}
                                </p>
                                <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                                  {testimonial.student_info}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex" />
                <CarouselNext className="hidden md:flex" />
              </Carousel>

              {/* Mobile Swipe Hint */}
              <div className="text-center mt-8 md:hidden">
                <p className="text-sm text-[var(--fg-muted)]">
                  ← Kaydırarak diğer yorumları görün →
                </p>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        {content.cta_title && (
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-primary rounded-2xl p-12 text-center text-white"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  {content.cta_title}
                </h2>
                <p className="text-lg mb-8 opacity-90">
                  {content.cta_description}
                </p>
                <Button
                  onClick={handleSignUpClick}
                  className="bg-white text-[var(--color-primary)] hover:bg-gray-100 font-poppins font-semibold rounded-lg text-lg px-8 py-6 transition-all duration-200 hover:scale-105"
                >
                  Ücretsiz Kayıt Ol
                </Button>
              </motion.div>
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default Home;
