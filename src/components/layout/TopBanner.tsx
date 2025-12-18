import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TopBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: 'white',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 justify-center">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <p className="text-sm font-medium">
                🎉 Yeni programlarımız yayında! İlk kayıt olanlara %20 indirim
              </p>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Kapat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TopBanner;
