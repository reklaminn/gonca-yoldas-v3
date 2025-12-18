import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore'; // Corrected: Use Zustand store
import ThemeToggle from '@/components/theme/ThemeToggle';
import TopBanner from './TopBanner';
import { useTheme } from '@/contexts/ThemeContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const { user, loading } = useAuthStore(); // Corrected: Use Zustand store
  const navigate = useNavigate();
  const location = useLocation();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    console.log('🔵 Header: Auth state', { user: user?.email || 'none', loading });
  }, [user, loading]);

  const navigation = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'Programlar', href: '/programs' },
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
    console.log('🔵 Navigating to:', href);
    navigate(href);
    setIsMenuOpen(false);
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

            {/* Right Side Actions */}
            <div className="hidden lg:flex items-center space-x-3">
              <ThemeToggle />
              {!loading && (
                user ? (
                  <Button
                    onClick={() => handleNavigation('/dashboard')}
                    className="btn-primary"
                  >
                    Panelim
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
            <div className="flex lg:hidden items-center gap-2">
              <ThemeToggle />
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg transition-all"
                style={{
                  color: 'var(--fg)',
                  backgroundColor: isMenuOpen ? 'var(--hover-overlay)' : 'transparent',
                }}
                whileTap={{ scale: 0.95 }}
                aria-label="Menü"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden overflow-hidden"
              >
                <nav className="flex flex-col space-y-1 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
                  {navigation.map((item, index) => {
                    const isActive = isActivePage(item.href);
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('🔵 Mobile menu clicked:', item.name, item.href);
                            handleNavigation(item.href);
                          }}
                          aria-current={isActive ? 'page' : undefined}
                          className="w-full text-left px-4 py-3 rounded-lg font-nunito font-medium transition-all"
                          style={{
                            backgroundColor: isActive ? 'var(--hover-overlay)' : 'transparent',
                            color: isActive ? 'var(--color-primary)' : 'var(--fg)',
                          }}
                        >
                          {item.name}
                        </button>
                      </motion.div>
                    );
                  })}
                  {!loading && (
                    <div className="flex flex-col space-y-2 px-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                      {user ? (
                        <Button
                          onClick={() => handleNavigation('/dashboard')}
                          className="btn-primary w-full"
                        >
                          Panelim
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={() => handleNavigation('/auth/login')}
                            className="btn-secondary w-full"
                          >
                            Giriş Yap
                          </Button>
                          <Button
                            onClick={() => handleNavigation('/auth/signup')}
                            className="btn-primary w-full"
                          >
                            Kayıt Ol
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>
    </>
  );
};

export default Header;
