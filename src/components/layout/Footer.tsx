import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/store/authStore';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const [logoError, setLogoError] = useState(false);
  const { resolvedTheme } = useTheme();
  const { user, profile } = useAuthStore();

  // ✅ FIX: Correct role check using profile from Zustand
  const isAdmin = profile?.role === 'admin';

  const logoUrl = "https://www.goncayoldas.com/contents/img/logogoncayoldas2.png";

  const handleNavigation = (href: string) => {
    navigate(href);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerLinks = {
    programs: [
      { name: 'Baby English (0-2 Yaş)', href: '/programs/baby-english' },
      { name: 'Toddler English (2-4 Yaş)', href: '/programs/toddler-english' },
      { name: 'Kids English (4-6 Yaş)', href: '/programs/kids-english' },
      { name: 'Junior English (6-12 Yaş)', href: '/programs/junior-english' },
    ],
    company: [
      { name: 'Hakkımızda', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'İletişim', href: '/contact' },
      { name: 'Kariyer', href: '/careers' },
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
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  ];

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
              Çocukların dil gelişimini destekleyen, bilimsel yöntemlerle tasarlanmış eğitim programları.
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

          {/* Programs */}
          <div>
            <h4 className="font-poppins font-semibold mb-4" style={{ color: 'var(--fg)' }}>
              Eğitimler
            </h4>
            <ul className="space-y-2">
              {footerLinks.programs.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => navigate(link.href)}
                    className="text-sm transition-colors hover:text-[var(--color-primary)]"
                    style={{ color: 'var(--fg-muted)' }}
                  >
                    {link.name}
                  </button>
                </li>
              ))}
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
                    onClick={() => navigate(link.href)}
                    className="text-sm transition-colors hover:text-[var(--color-primary)]"
                    style={{ color: 'var(--fg-muted)' }}
                  >
                    {link.name}
                  </button>
                </li>
              ))}
              {/* ✅ FIX: Admin Panel Link - Only visible to admins */}
              {isAdmin && (
                <li>
                  <button
                    onClick={() => navigate('/admin')}
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

          {/* Contact */}
          <div>
            <h4 className="font-poppins font-semibold mb-4" style={{ color: 'var(--fg)' }}>
              İletişim
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm" style={{ color: 'var(--fg-muted)' }}>
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
                <span>info@goncayoldas.com</span>
              </li>
              <li className="flex items-start gap-2 text-sm" style={{ color: 'var(--fg-muted)' }}>
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
                <span>+90 (555) 123 45 67</span>
              </li>
              <li className="flex items-start gap-2 text-sm" style={{ color: 'var(--fg-muted)' }}>
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
                <span>İstanbul, Türkiye</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div 
          className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderColor: 'var(--border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
            © {new Date().getFullYear()} Gonca Yoldaş. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <button
                key={link.name}
                onClick={() => navigate(link.href)}
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
