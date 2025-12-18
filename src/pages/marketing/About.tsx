import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Heart, Target, Users, BookOpen, Globe, Loader2, GraduationCap, Baby, School, Briefcase, MessageCircle, Instagram } from 'lucide-react';
import { usePageContent } from '@/hooks/usePageContent';
import { useNavigate } from 'react-router-dom';

const About: React.FC = () => {
  const { content, loading } = usePageContent('about');
  const navigate = useNavigate();

  // Parse JSON content safely
  const parseJSON = (key: string, fallback: any = []) => {
    try {
      return content[key] ? JSON.parse(content[key]) : fallback;
    } catch {
      return fallback;
    }
  };

  const heroTitles = parseJSON('hero_titles', ['İngilizce Öğretmeni', 'Dil Bilimci', 'Eğitmen', 'Çift Dilli Eğitim Uzmanı']);
  const credentialsAcademic = parseJSON('credentials_academic', { title: 'Akademik Eğitim', items: [] });
  const credentialsCertificates = parseJSON('credentials_certificates', { title: 'Sertifikalar', items: [] });
  const credentialsExpertise = parseJSON('credentials_expertise', { title: 'Uzmanlık Alanları', items: [] });
  const parentProgram02 = parseJSON('parent_program_0_2', {});
  const parentProgram25 = parseJSON('parent_program_2_5', {});
  const childrenCourse = parseJSON('children_course', {});
  const institutionalServices = parseJSON('institutional_services', []);
  const stats = parseJSON('stats', []);

  const credentials = [
    { icon: GraduationCap, ...credentialsAcademic },
    { icon: Award, ...credentialsCertificates },
    { icon: BookOpen, ...credentialsExpertise }
  ];

  const parentPrograms = [parentProgram02, parentProgram25].filter(p => p.title);

  const institutionalServicesWithIcons = institutionalServices.map((service: any, index: number) => ({
    ...service,
    icon: [BookOpen, Users, MessageCircle, Briefcase][index] || BookOpen
  }));

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <Loader2 className="h-12 w-12 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Hero Section */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white">
                {content.hero_name || 'Gonca Yoldaş'}
              </h1>
              <div className="flex flex-wrap justify-center gap-3 text-lg md:text-xl text-blue-100">
                {heroTitles.map((title: string, index: number) => (
                  <React.Fragment key={index}>
                    <span>{title}</span>
                    {index < heroTitles.length - 1 && <span>•</span>}
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-2xl md:text-3xl font-semibold text-yellow-300 mt-8"
            >
              "{content.hero_quote || 'Çift dilli çocuk yetiştirmek hayal değil!'}"
            </motion.p>
          </div>
        </div>
      </motion.section>

      {/* Bio Section */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-20"
      >
        <div className="max-w-4xl mx-auto">
          <Card className="border-[var(--border)] bg-[var(--bg-card)]">
            <CardContent className="pt-8">
              <div className="prose prose-lg max-w-none text-[var(--fg-muted)]">
                <p 
                  className="text-lg leading-relaxed mb-6"
                  dangerouslySetInnerHTML={{ __html: content.bio_paragraph_1 || '' }}
                />
                <p 
                  className="text-lg leading-relaxed mb-6"
                  dangerouslySetInnerHTML={{ __html: content.bio_paragraph_2 || '' }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* Credentials */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={staggerChildren}
        className="bg-[var(--bg-elev)] py-20"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[var(--fg)] mb-4">
              {content.credentials_title || 'Eğitim ve Sertifikalar'}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {credentials.map((cred, index) => {
              const Icon = cred.icon;
              return (
                <motion.div key={index} variants={fadeIn} transition={{ duration: 0.5 }}>
                  <Card className="text-center h-full border-[var(--border)] bg-[var(--bg-card)]">
                    <CardHeader>
                      <div className="mx-auto bg-gradient-to-br from-blue-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-xl text-[var(--fg)]">{cred.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-[var(--fg-muted)]">
                        {cred.items?.map((item: string, i: number) => (
                          <li key={i} className="text-sm leading-relaxed">{item}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Bilingual Education Journey */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-20"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[var(--fg)] mb-4">
              {content.bilingual_title || 'Çift Dilli Eğitim ve Ebeveyn Rehberliği'}
            </h2>
          </div>

          <Card className="border-[var(--border)] bg-[var(--bg-card)] mb-8">
            <CardContent className="pt-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-gradient-to-br from-pink-500 to-purple-500 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p 
                    className="text-lg leading-relaxed text-[var(--fg-muted)]"
                    dangerouslySetInnerHTML={{ __html: content.bilingual_paragraph_1 || '' }}
                  />
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                  <Instagram className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p 
                    className="text-lg leading-relaxed text-[var(--fg-muted)]"
                    dangerouslySetInnerHTML={{ __html: content.bilingual_paragraph_2 || '' }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      {/* Parent Programs */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={staggerChildren}
        className="bg-[var(--bg-elev)] py-20"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[var(--fg)] mb-4">
              {content.parent_programs_title || 'Ebeveynler İçin Programlar'}
            </h2>
            <p className="text-xl text-[var(--fg-muted)]">
              {content.parent_programs_subtitle || 'Evde İngilizce konuşmak isteyen ebeveynler için özel olarak geliştirilmiş çift dilli eğitimler'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {parentPrograms.map((program, index) => (
              <motion.div key={index} variants={fadeIn} transition={{ duration: 0.5 }}>
                <Card className="h-full border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${program.color}`}></div>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`bg-gradient-to-r ${program.color} px-4 py-1 rounded-full`}>
                        <span className="text-white font-semibold text-sm">{program.age}</span>
                      </div>
                    </div>
                    <CardTitle className="text-2xl text-[var(--fg)]">{program.title}</CardTitle>
                    <CardDescription className="text-base text-[var(--fg-muted)]">
                      {program.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {program.features?.map((feature: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className={`bg-gradient-to-r ${program.color} w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <span className="text-white text-xs">✓</span>
                          </div>
                          <span className="text-[var(--fg-muted)]">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Children's Course */}
      {childrenCourse.title && (
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 py-20"
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[var(--fg)] mb-4">
                {content.children_course_title || 'Çocuklar İçin Online Kurslar'}
              </h2>
            </div>

            <Card className="border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
              <div className={`h-3 bg-gradient-to-r ${childrenCourse.color}`}></div>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className={`bg-gradient-to-r ${childrenCourse.color} px-6 py-2 rounded-full`}>
                    <span className="text-white font-bold text-lg">{childrenCourse.age}</span>
                  </div>
                </div>
                <CardTitle className="text-3xl text-[var(--fg)]">{childrenCourse.title}</CardTitle>
                <CardDescription className="text-lg text-[var(--fg-muted)]">
                  {childrenCourse.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {childrenCourse.features?.map((feature: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-[var(--bg-elev)]">
                      <div className={`bg-gradient-to-r ${childrenCourse.color} w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                      <span className="text-[var(--fg)]">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.section>
      )}

      {/* Institutional Services */}
      {institutionalServicesWithIcons.length > 0 && (
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={staggerChildren}
          className="bg-[var(--bg-elev)] py-20"
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[var(--fg)] mb-4">
                {content.institutional_title || 'Okul ve Kurumlar İçin Danışmanlık'}
              </h2>
              <p className="text-xl text-[var(--fg-muted)]">
                {content.institutional_subtitle || 'Anaokulları ve ilkokullar için profesyonel destek hizmetleri'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {institutionalServicesWithIcons.map((service: any, index: number) => {
                const Icon = service.icon;
                return (
                  <motion.div key={index} variants={fadeIn} transition={{ duration: 0.5 }}>
                    <Card className="text-center h-full hover:shadow-lg transition-shadow border-[var(--border)] bg-[var(--bg-card)]">
                      <CardHeader>
                        <div className="mx-auto bg-gradient-to-br from-green-500 to-teal-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle className="text-lg text-[var(--fg)]">{service.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base text-[var(--fg-muted)]">
                          {service.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.section>
      )}

      {/* Stats */}
      {stats.length > 0 && (
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16"
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-4xl mx-auto">
              {stats.map((stat: any, index: number) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                  <div className="text-blue-100">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* CTA */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-20"
      >
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-white text-center relative overflow-hidden">
          {/* Modern Compact Image with Border */}
          <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden lg:block">
            <div className="relative w-48 h-48">
              {/* Simple Border Frame */}
              <div className="absolute inset-0 rounded-3xl border-4 border-white/40 shadow-2xl"></div>
              <img
                src="https://jlwsapdvizzriomadhxj.supabase.co/storage/v1/object/public/images/happy-learning-children.jpg"
                alt="Mutlu öğrenen çocuklar"
                className="w-full h-full object-cover rounded-3xl shadow-xl hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          <div className="relative z-10 max-w-2xl">
            <School className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-6">
              {content.cta_title || 'Bize Katılın'}
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              {content.cta_description || 'Çocuğunuzun İngilizce öğrenme yolculuğunda yanınızdayız'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary" 
                className="text-lg px-8 py-6"
                onClick={() => navigate('/programs')}
              >
                Programları İncele
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 bg-white/10 hover:bg-white/20 text-white border-white/30"
                onClick={() => navigate('/contact')}
              >
                İletişime Geç
              </Button>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default About;
