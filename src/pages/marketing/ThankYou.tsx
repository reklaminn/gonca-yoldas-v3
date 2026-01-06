import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ThankYou: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 text-center shadow-2xl"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-[var(--fg)] mb-4">
          Mesajınız Alındı!
        </h1>
        
        <p className="text-[var(--fg-muted)] mb-8 text-lg">
          Bizimle iletişime geçtiğiniz için teşekkür ederiz. Mesajınız bize ulaştı, en kısa sürede size dönüş yapacağız.
        </p>

        <div className="space-y-3">
          <Link to="/">
            <Button className="w-full" size="lg">
              <Home className="mr-2 h-4 w-4" />
              Anasayfaya Dön
            </Button>
          </Link>
          
          <Link to="/blog">
            <Button variant="outline" className="w-full" size="lg">
              Blog Yazılarını Oku
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ThankYou;
