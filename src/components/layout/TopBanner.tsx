import React, { useState, useEffect } from 'react';
import { X, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePageContent } from '@/hooks/usePageContent';

const TopBanner: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { content, loading } = usePageContent('global');

  // Parse announcements from JSON
  const announcements = React.useMemo(() => {
    if (!content.announcements) return [];
    try {
      const parsed = JSON.parse(content.announcements);
      return Array.isArray(parsed) ? parsed : [content.announcements];
    } catch {
      return [content.announcements];
    }
  }, [content.announcements]);

  // Auto-rotate announcements
  useEffect(() => {
    if (announcements.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(timer);
  }, [announcements.length]);

  if (loading || announcements.length === 0 || isDismissed) return null;

  const nextAnnouncement = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  const prevAnnouncement = () => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="relative overflow-hidden bg-primary text-white"
      >
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between min-h-[24px]">
            {/* Navigation - Left (Only if multiple) */}
            <div className="flex items-center gap-1 w-20">
              {announcements.length > 1 && (
                <button 
                  onClick={prevAnnouncement}
                  className="p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Content Slider */}
            <div className="flex-1 relative overflow-hidden h-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex items-center justify-center gap-2 absolute inset-0"
                >
                  <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse shrink-0" />
                  <p className="text-sm font-medium text-center truncate px-4">
                    {announcements[currentIndex]}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Controls - Right */}
            <div className="flex items-center justify-end gap-2 w-20">
              {announcements.length > 1 && (
                <>
                  <span className="text-[10px] font-mono opacity-60">
                    {currentIndex + 1}/{announcements.length}
                  </span>
                  <button 
                    onClick={nextAnnouncement}
                    className="p-1 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </>
              )}
              <div className="w-px h-3 bg-white/20 mx-1" />
              <button
                onClick={() => setIsDismissed(true)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Kapat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress Bar (Only if multiple) */}
        {announcements.length > 1 && (
          <div className="absolute bottom-0 left-0 h-[2px] bg-white/20 w-full">
            <motion.div
              key={currentIndex}
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 5, ease: "linear" }}
              className="h-full bg-white/40"
            />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default TopBanner;
