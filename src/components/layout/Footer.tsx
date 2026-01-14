import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone, MapPin, Shield, Youtube, Lock, ShieldCheck, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/store/authStore';
import { usePrograms } from '@/hooks/usePrograms';
import { getGeneralSettings, type GeneralSettings } from '@/services/generalSettings';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const [logoError, setLogoError] = useState(false);
  const { resolvedTheme } = useTheme();
  const { user, profile, loading } = useAuthStore();
  
  const { programs, loading: programsLoading } = usePrograms('active');
  const [settings, setSettings] = useState<GeneralSettings | null>(null);

  useEffect(() => {
    getGeneralSettings().then(setSettings);
  }, []);

  const isAdmin = profile?.role === 'admin';
  const logoUrl = "https://www.goncayoldas.com/contents/img/logogoncayoldas2.png";

  const handleNavigation = (href: string) => {
    navigate(href);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerLinks = {
    company: [
      { name: 'Hakkımızda', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'İletişim', href: '/contact' },
    ],
    legal: [
      { name: 'Gizlilik Politikası', href: '/privacy' },
      { name: 'Kullanım Koşulları', href: '/terms' },
      { name: 'Çerez Politikası', href: '/cookies' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Youtube, href: 'https://youtube.com', label: 'Youtube' },
  ];

  // Security badge icon mapping
  const securityBadgeIcons = {
    ssl: Shield,
    '3d_secure': ShieldCheck,
    pci_dss: Lock
  };

  return (
    <footer 
      className="mt-auto border-t"
      style={{
        backgroundColor: 'var(--surface-1)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <button 
              onClick={() => handleNavigation('/')}
              className="flex items-center group cursor-pointer"
              aria-label="Ana sayfaya git"
            >
              {!logoError ? (
                <motion.div
                  className={`relative ${resolvedTheme === 'dark' ? 'logo-dark-mode' : ''}`}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <img
                    src={logoUrl}
                    alt="Gonca Yoldaş - Çocuk Gelişimi ve Eğitim"
                    className="h-10 w-auto object-contain"
                    onError={() => setLogoError(true)}
                    loading="eager"
                    style={{
                      filter: resolvedTheme === 'dark' ? 'brightness(0) invert(1) contrast(1.05)' : 'none',
                      transition: 'filter var(--transition-base)'
                    }}
                  />
                  {resolvedTheme === 'dark' && (
                    <div 
                      className="absolute inset-0 bg-[var(--bg-dark)] mix-blend-color"
                      style={{ opacity: 0.1 }}
                    />
                  )}
                </motion.div>
              ) : (
                <motion.span 
                  className="text-2xl font-poppins font-bold bg-gradient-primary bg-clip-text text-transparent"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  Gonca Yoldaş
                </motion.span>
              )}
            </button>

            <p className="text-sm mb-4" style={{ color: 'var(--fg-muted)' }}>
              {settings?.site_description || 'Çocukların dil gelişimini destekleyen, bilimsel yöntemlerle tasarlanmış eğitim programları.'}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg transition-all"
                  style={{
                    backgroundColor: 'var(--hover-overlay)',
                    color: 'var(--fg)',
                  }}
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Programs - DYNAMIC */}
          <div>
            <h4 className="font-poppins font-semibold mb-4" style={{ color: 'var(--fg)' }}>
              Eğitimler
            </h4>
            <ul className="space-y-2">
              {programsLoading ? (
                <>
                  <li className="h-4 w-32 bg-[var(--bg-elev)] animate-pulse rounded"></li>
                  <li className="h-4 w-24 bg-[var(--bg-elev)] animate-pulse rounded"></li>
                  <li className="h-4 w-28 bg-[var(--bg-elev)] animate-pulse rounded"></li>
                </>
              ) : programs.length > 0 ? (
                programs.map((program) => (
                  <li key={program.id}>
                    <button
                      onClick={() => handleNavigation(`/programs/${program.slug}`)}
                      className="text-sm transition-colors hover:text-[var(--color-primary)] text-left"
                      style={{ color: 'var(--fg-muted)' }}
                    >
                      {program.title_tr || program.title}
                    </button>
                  </li>
                ))
              ) : (
                <li className="text-sm text-[var(--fg-muted)]">Program bulunamadı</li>
              )}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-poppins font-semibold mb-4" style={{ color: 'var(--fg)' }}>
              Kurumsal
            </h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => handleNavigation(link.href)}
                    className="text-sm transition-colors hover:text-[var(--color-primary)]"
                    style={{ color: 'var(--fg-muted)' }}
                  >
                    {link.name}
                  </button>
                </li>
              ))}
              
              {/* Login Button (Moved from Header) */}
              {!loading && !user && (
                <li>
                  <button
                    onClick={() => handleNavigation('/auth/login')}
                    className="text-sm transition-colors hover:text-[var(--color-primary)] flex items-center gap-2"
                    style={{ color: 'var(--fg-muted)' }}
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Giriş Yap</span>
                  </button>
                </li>
              )}

              {/* Admin Panel Link */}
              {isAdmin && (
                <li>
                  <button
                    onClick={() => handleNavigation('/admin')}
                    className="text-sm transition-colors hover:text-[var(--color-primary)] flex items-center gap-2"
                    style={{ color: 'var(--fg-muted)' }}
                  >
                    <Shield className="h-4 w-4" style={{ color: 'var(--color-accent)' }} />
                    <span>Admin Panel</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Contact - DYNAMIC */}
          <div>
            <h4 className="font-poppins font-semibold mb-4" style={{ color: 'var(--fg)' }}>
              İletişim
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm" style={{ color: 'var(--fg-muted)' }}>
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
                <span>{settings?.contact_email || 'info@goncayoldas.com'}</span>
              </li>
              <li className="flex items-start gap-2 text-sm" style={{ color: 'var(--fg-muted)' }}>
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
                <span>{settings?.phone || '+90 (555) 123 45 67'}</span>
              </li>
              <li className="flex items-start gap-2 text-sm" style={{ color: 'var(--fg-muted)' }}>
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
                <span className="whitespace-pre-line">{settings?.address || 'İstanbul, Türkiye'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 🎨 IMPROVED: Payment Security Section - Aesthetic Design */}
        <div className="py-8 border-t border-b border-[var(--border)]">
          <div className="flex flex-col items-center justify-center gap-6">
            {/* Güvenlik Mesajı */}
            <div className="flex items-center gap-3 text-[var(--fg-muted)]">
              <Lock className="h-5 w-5 text-[var(--color-primary)]" />
              <p className="text-sm text-center">
                {settings?.footer_payment_message || 'Ödeme bilgileriniz 256-bit SSL sertifikası ile şifrelenir ve güvenli bir şekilde işlenir.'}
              </p>
            </div>

            {/* 🎨 İyzico Badge - Aesthetic Container with White BG + Opacity */}
            {settings?.footer_payment_badge_url && (
              <div className="flex items-center justify-center">
                <div 
                  className="px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <img 
                    src={settings.footer_payment_badge_url}
                    alt="Güvenli ödeme" 
                    className="h-10 object-contain"
                    style={{
                      filter: 'none',
                      mixBlendMode: 'normal'
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            {/* Ek Güvenlik İkonları */}
            {settings?.footer_security_badges && settings.footer_security_badges.some(b => b.enabled) && (
              <div className="flex flex-wrap items-center justify-center gap-6 text-[var(--fg-muted)]">
                {settings.footer_security_badges
                  .filter(badge => badge.enabled)
                  .map((badge) => {
                    const IconComponent = securityBadgeIcons[badge.id as keyof typeof securityBadgeIcons] || Shield;
                    return (
                      <div key={badge.id} className="flex items-center gap-2 transition-colors hover:text-[var(--color-primary)]">
                        <IconComponent className="h-4 w-4" />
                        <span className="text-xs font-medium">{badge.label}</span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div 
          className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
            © {new Date().getFullYear()} {settings?.site_name || 'Gonca Yoldaş'}. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavigation(link.href)}
                className="text-sm transition-colors hover:text-[var(--color-primary)]"
                style={{ color: 'var(--fg-muted)' }}
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
