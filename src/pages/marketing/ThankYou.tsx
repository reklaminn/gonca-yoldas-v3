import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Home, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useSearchParams } from 'react-router-dom';

const ThankYou: React.FC = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');

  const isOrder = type === 'order';

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
          {isOrder ? 'Siparişiniz Alındı!' : 'Mesajınız Alındı!'}
        </h1>
        
        <p className="text-[var(--fg-muted)] mb-8 text-lg">
          {isOrder 
            ? 'Siparişiniz başarıyla oluşturuldu. Detaylar e-posta adresinize gönderildi.' 
            : 'Bizimle iletişime geçtiğiniz için teşekkür ederiz. Mesajınız bize ulaştı, en kısa sürede size dönüş yapacağız.'}
        </p>

        <div className="space-y-3">
          {isOrder ? (
             <Link to="/dashboard">
                <Button className="w-full" size="lg">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Öğrenci Paneline Git
                </Button>
             </Link>
          ) : (
            <Link to="/blog">
              <Button variant="outline" className="w-full" size="lg">
                Blog Yazılarını Oku
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
          
          <Link to="/">
            <Button variant={isOrder ? "outline" : "default"} className="w-full" size="lg">
              <Home className="mr-2 h-4 w-4" />
              Anasayfaya Dön
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ThankYou;
