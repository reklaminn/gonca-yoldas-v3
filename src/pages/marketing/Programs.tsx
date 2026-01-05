import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock, Award, ChevronRight, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { usePrograms } from '@/hooks/usePrograms';
import { useAgeGroups } from '@/hooks/useAgeGroups';

const Programs: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedAge, setSelectedAge] = useState<string>('all');
  
  const { programs, loading: programsLoading, error, refetch } = usePrograms('active');
  const { ageGroups, loading: ageGroupsLoading } = useAgeGroups();

  // URL'den gelen age parametresini kontrol et
  useEffect(() => {
    const ageParam = searchParams.get('age');
    if (ageParam) {
      setSelectedAge(ageParam);
    }
  }, [searchParams]);

  // Dinamik yaş filtrelerini oluştur
  const ageFilters = useMemo(() => {
    const filters = ageGroups.map(group => ({
      value: group.value,
      label: group.label
    }));
    
    return [
      { value: 'all', label: 'Tüm Yaşlar' },
      ...filters
    ];
  }, [ageGroups]);

  const filteredPrograms = selectedAge === 'all' 
    ? programs 
    : programs.filter(p => p.age_group === selectedAge);

  const handleProgramDetail = (slug: string) => {
    console.log('🟡 Programs: Navigating to program detail:', slug);
    navigate(`/programs/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (programsLoading || ageGroupsLoading) {
    return (
      <div className="bg-[var(--bg)] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[var(--color-primary)] mx-auto mb-4" />
          <p className="text-[var(--fg-muted)]">Programlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--bg)] min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-error" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--fg)] mb-2">Programlar yüklenirken bir hata oluştu</h2>
          <p className="text-[var(--fg-muted)] mb-6">{error}</p>
          <div className="space-y-3">
            <Button 
              onClick={refetch}
              className="bg-gradient-primary text-white font-poppins font-semibold hover:shadow-soft-lg transition-all duration-200 hover:scale-105 rounded-lg"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tekrar Dene
            </Button>
            <p className="text-sm text-[var(--fg-muted)]">
              Sorun devam ederse lütfen{' '}
              <button 
                onClick={() => navigate('/contact')}
                className="text-[var(--color-primary)] hover:underline font-semibold"
              >
                bizimle iletişime geçin
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg)] min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--fg)] mb-6">
            Eğitim{' '}
            <span 
              className="bg-gradient-primary bg-clip-text text-transparent" 
              style={{ 
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Programlarımız
            </span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--fg-muted)] max-w-3xl mx-auto">
            Her yaş grubuna özel tasarlanmış, uzman eğitmenler eşliğinde İngilizce öğrenme programları
          </p>
        </motion.div>

        {/* Age Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {ageFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedAge(filter.value)}
              className={`
                px-6 py-3 rounded-lg font-nunito font-semibold transition-all duration-200
                ${selectedAge === filter.value
                  ? 'bg-gradient-primary text-white shadow-soft-lg scale-105'
                  : 'bg-[var(--bg-card)] text-[var(--fg)] hover:bg-[var(--bg-elev)] border border-[var(--border)]'
                }
              `}
            >
              {filter.label}
            </button>
          ))}
        </motion.div>

        {/* Programs Grid */}
        {filteredPrograms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 bg-[var(--bg-card)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-[var(--fg-muted)]" />
            </div>
            <p className="text-xl text-[var(--fg-muted)] mb-4">
              Bu yaş grubu için henüz program bulunmamaktadır.
            </p>
            <Button
              onClick={() => setSelectedAge('all')}
              variant="outline"
              className="border-[var(--border)] hover:bg-[var(--bg-hover)]"
            >
              Tüm Programları Göster
            </Button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPrograms.map((program, index) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-[var(--bg-card)] rounded-2xl overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-300 border border-[var(--border)] group"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  {program.image_url ? (
                    <img
                      src={program.image_url}
                      alt={program.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                      <span className="text-white text-4xl font-bold">
                        {program.short_title}
                      </span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-gradient-primary text-white px-4 py-2 rounded-lg font-poppins font-bold">
                    {program.age_range}
                  </div>
                  {program.featured && (
                    <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-lg font-poppins font-bold text-sm">
                      Öne Çıkan
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-[var(--fg)] mb-2">
                    {program.title}
                  </h3>
                  <p className="text-[var(--fg-muted)] mb-4 line-clamp-2">
                    {program.description}
                  </p>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2 text-[var(--fg-muted)]">
                      <Clock className="h-4 w-4 text-[var(--color-primary)]" />
                      <span className="text-sm">{program.duration}</span>
                    </div>
                    {/* Student count removed here */}
                    <div className="flex items-center gap-2 text-[var(--fg-muted)]">
                      <Award className="h-4 w-4 text-[var(--color-primary)]" />
                      <span className="text-sm">{program.lessons_per_week}x hafta</span>
                    </div>
                  </div>

                  {/* Price and Button */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-3xl font-bold text-[var(--fg)]">
                        ₺{program.price.toLocaleString()}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleProgramDetail(program.slug)}
                      className="bg-gradient-primary text-white font-poppins font-semibold hover:shadow-soft-lg transition-all duration-200 hover:scale-105 rounded-lg group"
                    >
                      Detayları Gör
                      <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 bg-gradient-primary rounded-2xl p-12 text-center text-white"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Hangi Program Size Uygun?
          </h2>
          <p className="text-lg mb-8 opacity-90 text-white">
            Ücretsiz danışmanlık için bizimle iletişime geçin
          </p>
          <Button
            onClick={() => navigate('/contact')}
            className="bg-white text-[var(--color-primary)] hover:bg-gray-100 font-poppins font-semibold rounded-lg text-lg px-8 py-6 transition-all duration-200 hover:scale-105"
          >
           Email Bülten Kayıt Ol
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Programs;
