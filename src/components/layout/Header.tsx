import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import ThemeToggle from '@/components/theme/ThemeToggle';
import TopBanner from './TopBanner';
import { useTheme } from '@/contexts/ThemeContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const { user, profile, loading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { resolvedTheme } = useTheme();

  const isAdmin = profile?.role === 'admin';

  // ✅ DÜZELTME 1: Sayfa değiştiğinde menüyü otomatik kapat
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Body scroll kilitleme (Menü açıkken arka plan kaymasın)
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
    navigate(href);
    // setIsMenuOpen(false); // useEffect zaten bunu hallediyor ama güvenlik için kalsın
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const logoUrl = "https://www.goncayoldas.com/contents/img/logogoncayoldas2.png";

  return (
    <>
      <TopBanner />
      <motion.header 
        className="sticky top-0 z-40 border-b shadow-[var(--shadow-sm)]"
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
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button 
              onClick={() => handleNavigation('/')}
              className="flex items-center group cursor-pointer z-50" // Logo da üstte kalsın
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
                </motion.div>
              ) : (
                <motion.span 
                  className="text-2xl font-poppins font-bold bg-gradient-primary bg-clip-text text-transparent"
                >
                  Gonca Yoldaş
                </motion.span>
              )}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => {
                const isActive = isActivePage(item.href);
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    aria-current={isActive ? 'page' : undefined}
                    className="px-4 py-2 rounded-lg font-nunito font-medium relative group transition-all"
                    style={{
                      color: isActive ? 'var(--color-primary)' : 'var(--fg)',
                      transitionDuration: 'var(--transition-fast)',
                    }}
                  >
                    {item.name}
                    <motion.span 
                      className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-primary"
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
            <div className="hidden lg:flex items-center space-x-3">
              <ThemeToggle />
              {!loading && (
                user ? (
                  <Button
                    onClick={() => handleNavigation(isAdmin ? '/admin' : '/dashboard')}
                    className="btn-primary"
                  >
                    {isAdmin ? 'Admin Panel' : 'Panelim'}
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => handleNavigation('/auth/login')}
                      className="btn-ghost"
                    >
                      Giriş Yap
                    </Button>
                    <Button
                      onClick={() => handleNavigation('/auth/signup')}
                      className="btn-primary"
                    >
                      Kayıt Ol
                    </Button>
                  </>
                )
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center gap-2 z-50 relative">
              <ThemeToggle />
              <motion.button
                onClick={(e) => {
                  e.stopPropagation(); // Tıklama olayının karışmasını engelle
                  setIsMenuOpen(!isMenuOpen);
                }}
                className="p-2 rounded-lg transition-all relative z-50" // z-50 önemli
                style={{
                  color: 'var(--fg)',
                  backgroundColor: isMenuOpen ? 'var(--hover-overlay)' : 'transparent',
                }}
                whileTap={{ scale: 0.95 }}
                aria-label={isMenuOpen ? "Menüyü Kapat" : "Menüyü Aç"}
              >
                {/* İkon değişimini key ile zorla */}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={isMenuOpen ? 'close' : 'menu'}
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                  </motion.div>
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
              animate={{ opacity: 1, height: '100vh' }} // Tüm ekranı kaplasın
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden fixed inset-0 top-16 z-40 bg-[var(--bg)] overflow-y-auto border-t border-[var(--border)]"
            >
              <nav className="flex flex-col p-4 space-y-2 pb-24">
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
                        aria-current={isActive ? 'page' : undefined}
                        className="w-full text-left px-4 py-4 rounded-xl font-nunito font-medium text-lg transition-all flex items-center justify-between group"
                        style={{
                          backgroundColor: isActive ? 'var(--hover-overlay)' : 'transparent',
                          color: isActive ? 'var(--color-primary)' : 'var(--fg)',
                        }}
                      >
                        {item.name}
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="w-2 h-2 rounded-full bg-[var(--color-primary)]"
                          />
                        )}
                      </button>
                    </motion.div>
                  );
                })}
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="pt-6 mt-6 border-t border-[var(--border)] space-y-3"
                >
                  {!loading && (
                    user ? (
                      <Button
                        onClick={() => handleNavigation(isAdmin ? '/admin' : '/dashboard')}
                        className="btn-primary w-full h-12 text-lg"
                      >
                        {isAdmin ? 'Admin Panel' : 'Panelim'}
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={() => handleNavigation('/auth/login')}
                          className="btn-secondary w-full h-12 text-lg"
                        >
                          Giriş Yap
                        </Button>
                        <Button
                          onClick={() => handleNavigation('/auth/signup')}
                          className="btn-primary w-full h-12 text-lg"
                        >
                          Kayıt Ol
                        </Button>
                      </>
                    )
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
