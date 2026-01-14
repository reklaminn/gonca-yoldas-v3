import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Facebook, Instagram, Youtube, ExternalLink, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import ThemeToggle from '@/components/theme/ThemeToggle';
import TopBanner from './TopBanner';
import { useTheme } from '@/contexts/ThemeContext';
import { getGeneralSettings } from '@/services/generalSettings';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [coursesUrl, setCoursesUrl] = useState<string>('');
  const { user, loading, profile } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { resolvedTheme } = useTheme();

  // Social Media Links
  const socialLinks = [
    { icon: Facebook, href: 'https://www.facebook.com/goncayoldas', label: 'Facebook' },
    { icon: Instagram, href: 'https://www.instagram.com/goncayoldas', label: 'Instagram' },
    { icon: Youtube, href: 'https://www.youtube.com/@goncayoldas', label: 'YouTube' },
  ];

  // Fetch courses external URL from settings
  useEffect(() => {
    const fetchCoursesUrl = async () => {
      try {
        const settings = await getGeneralSettings();
        if (settings?.courses_external_url) {
          setCoursesUrl(settings.courses_external_url);
        }
      } catch (error) {
        console.error('❌ [Header] Failed to fetch courses URL:', error);
      }
    };

    fetchCoursesUrl();
  }, []);

  // Sayfa değiştiğinde menüyü otomatik kapat
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Menü açıkken scroll'u engelle
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const navigation = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'Eğitimler', href: '/programs' },
    { name: 'Öğrenme Platformu', href: '/learning-platform' },
    { name: 'Blog', href: '/blog' },
    { name: 'Hakkımızda', href: '/about' },
    { name: 'İletişim', href: '/contact' },
  ];

  const isActivePage = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const handleNavigation = (href: string) => {
    setIsMenuOpen(false);
    setTimeout(() => {
      navigate(href);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleCoursesNavigation = () => {
    setIsMenuOpen(false);
    
    if (!coursesUrl) {
      return;
    }
    
    // Open external URL in new tab
    window.open(coursesUrl, '_blank', 'noopener,noreferrer');
  };

  // Kullanıcı yetkisine göre dashboard yönlendirmesi
  const handleUserIconClick = () => {
    setIsMenuOpen(false);
    if (profile?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const logoUrl = "https://www.goncayoldas.com/contents/img/logogoncayoldas2.png";

  return (
    <>
      <TopBanner />
      <motion.header 
        className="sticky top-0 z-50 border-b shadow-[var(--shadow-sm)]"
        style={{
          backgroundColor: 'var(--bg)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderColor: 'var(--border)',
        }}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 relative z-50">
            {/* Logo */}
            <button 
              onClick={() => handleNavigation('/')}
              className="flex items-center group cursor-pointer flex-shrink-0 mr-4"
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
                    className="h-8 lg:h-10 w-auto object-contain"
                    onError={() => setLogoError(true)}
                    loading="eager"
                    style={{
                      filter: resolvedTheme === 'dark' ? 'brightness(0) invert(1) contrast(1.05)' : 'none',
                      transition: 'filter var(--transition-base)'
                    }}
                  />
                </motion.div>
              ) : (
                <motion.span 
                  className="text-xl lg:text-2xl font-poppins font-bold bg-gradient-primary bg-clip-text text-transparent whitespace-nowrap"
                >
                  Gonca Yoldaş
                </motion.span>
              )}
            </button>

            {/* Desktop Navigation - Optimized for single line */}
            <nav className="hidden lg:flex items-center space-x-1 flex-nowrap overflow-x-auto scrollbar-hide">
              {navigation.map((item) => {
                const isActive = isActivePage(item.href);
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className="px-2 xl:px-4 py-2 rounded-lg font-nunito font-medium relative group transition-all whitespace-nowrap text-sm xl:text-base"
                    style={{
                      color: isActive ? 'var(--color-primary)' : 'var(--fg)',
                    }}
                  >
                    {item.name}
                    <motion.span 
                      className="absolute bottom-0 left-2 right-2 xl:left-4 xl:right-4 h-0.5 bg-gradient-primary"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: isActive ? 1 : 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </button>
                );
              })}
            </nav>

            {/* Right Side Actions (Desktop) */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-3 flex-shrink-0 ml-2">
              
              {/* Social Icons - Separator Removed */}
              <div className="flex items-center gap-1 xl:gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--fg-muted)] hover:text-[var(--color-primary)] transition-colors hover:scale-110 transform duration-200 p-1.5 rounded-full hover:bg-[var(--bg-surface)]"
                    aria-label={social.label}
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>

              <ThemeToggle />
              
              {/* User Profile Icon (Logged In Only) */}
              {!loading && user && (
                <motion.button
                  onClick={handleUserIconClick}
                  className="p-2 rounded-full transition-all duration-200 border border-transparent hover:border-[var(--border)] hover:bg-[var(--bg-surface)]"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Hesabım"
                >
                  <UserIcon className="h-5 w-5 text-[var(--fg)]" />
                </motion.button>
              )}

              {/* Eğitim Giriş Button (External Link) - Moved to the VERY END */}
              {coursesUrl && (
                <Button
                  onClick={handleCoursesNavigation}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300 border-0 ml-1 whitespace-nowrap text-sm xl:text-base px-3 xl:px-4"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Eğitim Giriş
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center gap-2">
              <ThemeToggle />
              
              {/* Mobile User Icon (Visible on top bar if logged in) */}
              {!loading && user && (
                <button
                  onClick={handleUserIconClick}
                  className="p-2 rounded-lg text-[var(--fg)]"
                  aria-label="Hesabım"
                >
                  <UserIcon className="h-5 w-5" />
                </button>
              )}

              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg transition-all relative z-50"
                style={{
                  color: 'var(--fg)',
                  backgroundColor: isMenuOpen ? 'var(--hover-overlay)' : 'transparent',
                }}
                whileTap={{ scale: 0.95 }}
                aria-label={isMenuOpen ? "Menüyü Kapat" : "Menüyü Aç"}
              >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: '100vh' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden fixed inset-0 top-16 z-40 bg-background/95 backdrop-blur-xl border-t overflow-y-auto"
              style={{ 
                borderColor: 'var(--border)',
                backgroundColor: 'var(--bg)',
              }}
            >
              <nav className="flex flex-col p-6 space-y-2">
                {navigation.map((item, index) => {
                  const isActive = isActivePage(item.href);
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <button
                        onClick={() => handleNavigation(item.href)}
                        className="w-full text-left px-4 py-4 rounded-xl font-nunito font-bold text-lg transition-all flex items-center justify-between"
                        style={{
                          backgroundColor: isActive ? 'var(--hover-overlay)' : 'transparent',
                          color: isActive ? 'var(--color-primary)' : 'var(--fg)',
                        }}
                      >
                        {item.name}
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="w-2 h-2 rounded-full bg-primary"
                          />
                        )}
                      </button>
                    </motion.div>
                  );
                })}

                {/* Mobile Profile Link (Extra visibility in menu) */}
                {!loading && user && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navigation.length * 0.05 }}
                  >
                    <button
                      onClick={handleUserIconClick}
                      className="w-full text-left px-4 py-4 rounded-xl font-nunito font-bold text-lg transition-all flex items-center justify-between"
                      style={{
                        color: 'var(--fg)',
                      }}
                    >
                      Hesabım
                      <UserIcon className="h-5 w-5" />
                    </button>
                  </motion.div>
                )}

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="pt-6 mt-4 border-t border-border space-y-4"
                >
                  {/* Mobile Social Icons */}
                  <div className="flex justify-center gap-6 pb-4">
                    {socialLinks.map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--fg-muted)] hover:text-[var(--color-primary)] transition-colors p-2"
                      >
                        <social.icon className="h-6 w-6" />
                      </a>
                    ))}
                  </div>

                  {/* Mobile Action Buttons */}
                  {coursesUrl && (
                    <Button
                      onClick={handleCoursesNavigation}
                      className="w-full h-12 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0"
                    >
                      <ExternalLink className="h-5 w-5 mr-2" />
                      Eğitim Giriş
                    </Button>
                  )}
                </motion.div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
};

export default Header;
