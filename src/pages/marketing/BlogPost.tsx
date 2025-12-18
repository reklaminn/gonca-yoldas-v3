import React from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Share2, Facebook, Twitter, Linkedin, ArrowLeft } from 'lucide-react';

const BlogPost: React.FC = () => {
  const { slug } = useParams();

  // Mock data - will be replaced with Supabase query
  const post = {
    id: 1,
    title: 'Çocuklara İngilizce Öğretmenin 5 Altın Kuralı',
    slug: 'cocuklara-ingilizce-ogretmenin-5-altin-kurali',
    image: 'https://images.pexels.com/photos/8535214/pexels-photo-8535214.jpeg?auto=compress&cs=tinysrgb&w=1200',
    category: 'Eğitim',
    author: {
      name: 'Gonca Yoldaş',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
      bio: 'Kurucu & Baş Eğitmen - 15+ yıllık erken çocukluk eğitimi deneyimi',
    },
    date: '15 Ocak 2025',
    readTime: '8 dakika',
    content: `
      <p>Erken yaşta dil öğrenimi, çocukların bilişsel gelişimi için kritik öneme sahiptir. Araştırmalar, 0-10 yaş arasındaki çocukların dil öğrenme kapasitelerinin yetişkinlere göre çok daha yüksek olduğunu göstermektedir.</p>

      <h2>1. Doğal ve Eğlenceli Bir Ortam Yaratın</h2>
      <p>Çocuklar oyun oynayarak en iyi şekilde öğrenirler. İngilizce öğretimini günlük aktivitelere entegre edin:</p>
      <ul>
        <li>Şarkılar ve tekerlemeler kullanın</li>
        <li>İngilizce çizgi filmler izleyin</li>
        <li>Oyunlar oynayın</li>
        <li>Hikaye kitapları okuyun</li>
      </ul>

      <h2>2. Tutarlı Olun</h2>
      <p>Dil öğrenimi düzenli pratik gerektirir. Her gün en az 15-20 dakika İngilizce maruz kalma sağlayın. Tutarlılık, başarının anahtarıdır.</p>

      <h2>3. Pozitif Pekiştirme Kullanın</h2>
      <p>Çocuğunuzun her başarısını kutlayın. Hatalarını düzeltmek yerine, doğru kullanımları övün. Bu, özgüvenlerini artırır ve öğrenme motivasyonunu yüksek tutar.</p>

      <h2>4. Görsel ve İşitsel Materyaller Kullanın</h2>
      <p>Çocuklar görsel ve işitsel uyaranlarla daha iyi öğrenirler:</p>
      <ul>
        <li>Renkli flashcardlar</li>
        <li>Eğitici videolar</li>
        <li>İnteraktif uygulamalar</li>
        <li>Müzik ve şarkılar</li>
      </ul>

      <h2>5. Sabırlı Olun ve Beklentilerinizi Gerçekçi Tutun</h2>
      <p>Her çocuk kendi hızında öğrenir. Karşılaştırma yapmaktan kaçının ve çocuğunuzun bireysel gelişim sürecine saygı gösterin.</p>

      <h2>Sonuç</h2>
      <p>İngilizce öğretimi, çocuğunuzla kaliteli zaman geçirmenin ve onun gelecekteki başarısına yatırım yapmanın harika bir yoludur. Bu 5 altın kuralı uygulayarak, çocuğunuzun dil öğrenme yolculuğunu keyifli ve etkili hale getirebilirsiniz.</p>
    `,
  };

  const relatedPosts = [
    {
      id: 2,
      title: 'Oyun Temelli Öğrenme Nedir?',
      image: 'https://images.pexels.com/photos/3662667/pexels-photo-3662667.jpeg?auto=compress&cs=tinysrgb&w=400',
      slug: 'oyun-temelli-ogrenme-nedir',
    },
    {
      id: 3,
      title: 'İki Dilli Çocuk Yetiştirmenin Avantajları',
      image: 'https://images.pexels.com/photos/8363104/pexels-photo-8363104.jpeg?auto=compress&cs=tinysrgb&w=400',
      slug: 'iki-dilli-cocuk-yetistirmenin-avantajlari',
    },
    {
      id: 4,
      title: '0-2 Yaş Arası Bebeklerde Dil Gelişimi',
      image: 'https://images.pexels.com/photos/3662632/pexels-photo-3662632.jpeg?auto=compress&cs=tinysrgb&w=400',
      slug: '0-2-yas-arasi-bebeklerde-dil-gelisimi',
    },
  ];

  // Animasyon varyantları
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

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Hero Image */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.6 }}
        className="relative h-96 bg-gray-900"
      >
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center text-white">
              <div className="inline-block bg-[var(--color-primary)] px-3 py-1 rounded-full text-sm font-semibold mb-4">
                {post.category}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button variant="ghost" className="mb-6 text-[var(--fg)] hover:bg-[var(--hover-overlay)]" asChild>
              <Link to="/blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Blog'a Dön
              </Link>
            </Button>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <motion.article 
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-3"
            >
              <Card className="border-[var(--border)] bg-[var(--bg-card)]">
                <CardHeader>
                  {/* Author Info */}
                  <div className="flex items-center gap-4 mb-6">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-16 h-16 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-lg text-[var(--fg)]">{post.author.name}</h3>
                      <p className="text-sm text-[var(--fg-muted)]">{post.author.bio}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Content */}
                  <div 
                    className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-[var(--fg)] prose-p:text-[var(--fg-muted)] prose-li:text-[var(--fg-muted)] prose-strong:text-[var(--fg)]"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />

                  {/* Share Buttons */}
                  <div className="mt-12 pt-8 border-t border-[var(--border)]">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--fg)]">
                      <Share2 className="h-5 w-5" />
                      Bu yazıyı paylaş
                    </h3>
                    <div className="flex gap-3">
                      <Button variant="outline" size="sm" className="border-[var(--border)] text-[var(--fg)] hover:bg-[var(--hover-overlay)]">
                        <Facebook className="h-4 w-4 mr-2" />
                        Facebook
                      </Button>
                      <Button variant="outline" size="sm" className="border-[var(--border)] text-[var(--fg)] hover:bg-[var(--hover-overlay)]">
                        <Twitter className="h-4 w-4 mr-2" />
                        Twitter
                      </Button>
                      <Button variant="outline" size="sm" className="border-[var(--border)] text-[var(--fg)] hover:bg-[var(--hover-overlay)]">
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Posts */}
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-12"
              >
                <h2 className="text-2xl font-bold mb-6 text-[var(--fg)]">İlgili Yazılar</h2>
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={staggerChildren}
                  className="grid md:grid-cols-3 gap-6"
                >
                  {relatedPosts.map((relatedPost, index) => (
                    <motion.div key={relatedPost.id} variants={fadeIn} transition={{ duration: 0.5 }}>
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow border-[var(--border)] bg-[var(--bg-card)]">
                        <img
                          src={relatedPost.image}
                          alt={relatedPost.title}
                          className="w-full h-40 object-cover"
                        />
                        <CardHeader>
                          <CardTitle className="text-base text-[var(--fg)]">
                            <Link to={`/blog/${relatedPost.slug}`} className="hover:text-[var(--color-primary)] transition-colors">
                              {relatedPost.title}
                            </Link>
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </motion.article>

            {/* Sidebar */}
            <motion.aside 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:col-span-1"
            >
              <Card className="sticky top-8 border-[var(--border)] bg-[var(--bg-card)]">
                <CardHeader>
                  <CardTitle className="text-[var(--fg)]">İçindekiler</CardTitle>
                </CardHeader>
                <CardContent>
                  <nav className="space-y-2 text-sm">
                    <a href="#" className="block text-[var(--color-primary)] hover:underline">1. Doğal ve Eğlenceli Bir Ortam</a>
                    <a href="#" className="block text-[var(--fg-muted)] hover:text-[var(--color-primary)] hover:underline">2. Tutarlı Olun</a>
                    <a href="#" className="block text-[var(--fg-muted)] hover:text-[var(--color-primary)] hover:underline">3. Pozitif Pekiştirme</a>
                    <a href="#" className="block text-[var(--fg-muted)] hover:text-[var(--color-primary)] hover:underline">4. Görsel ve İşitsel Materyaller</a>
                    <a href="#" className="block text-[var(--fg-muted)] hover:text-[var(--color-primary)] hover:underline">5. Sabırlı Olun</a>
                    <a href="#" className="block text-[var(--fg-muted)] hover:text-[var(--color-primary)] hover:underline">Sonuç</a>
                  </nav>
                </CardContent>
              </Card>
            </motion.aside>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-[var(--color-primary)] text-white py-16"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Çocuğunuzun İngilizce yolculuğuna başlamaya hazır mısınız?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Ücretsiz deneme dersimize katılın ve farkı görün
          </p>
          <Button size="lg" variant="secondary">
            Ücretsiz Deneme Dersi Al
          </Button>
        </div>
      </motion.section>
    </div>
  );
};

export default BlogPost;
