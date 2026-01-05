import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Calendar, Clock, Facebook, Twitter, Linkedin, 
  Loader2, AlertCircle, ChevronRight, Link as LinkIcon,
  BookOpen
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';

// --- Types ---
interface BlogPostDetail {
  id: string;
  title: string;
  slug: string;
  content: string;
  image_url: string;
  created_at: string;
  read_time: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface TocItem {
  id: string;
  text: string;
}

// --- Helper: Generate TOC & Inject IDs ---
const processContent = (htmlContent: string): { processedContent: string; toc: TocItem[] } => {
  const toc: TocItem[] = [];
  const processedContent = htmlContent.replace(/<h2(.*?)>(.*?)<\/h2>/g, (match, attrs, text) => {
    const cleanText = text.replace(/<[^>]*>/g, '');
    const id = cleanText
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    toc.push({ id, text: cleanText });
    return `<h2 id="${id}"${attrs}>${text}</h2>`;
  });

  return { processedContent, toc };
};

const BlogPost: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeSection, setActiveSection] = useState<string>('');

  // Scroll spy for TOC
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -60% 0px' }
    );

    const headings = document.querySelectorAll('h2');
    headings.forEach((h) => observer.observe(h));

    return () => observer.disconnect();
  }, [post]);

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
    }
  }, [slug]);

  const fetchPost = async (slug: string) => {
    setLoading(true);
    setError(null);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    };

    try {
      const query = `select=id,title,slug,content,image_url,created_at,category_id,blog_categories(id,name,slug)&slug=eq.${slug}&is_published=eq.true`;
      const response = await fetch(`${supabaseUrl}/rest/v1/blog_posts?${query}`, { headers });
      
      if (!response.ok) throw new Error('Yazı yüklenemedi');
      
      const data = await response.json();
      if (!data || data.length === 0) throw new Error('Yazı bulunamadı');
      
      const postData = data[0];

      const { processedContent, toc } = processContent(postData.content);
      setToc(toc);

      const formattedPost: BlogPostDetail = {
        ...postData,
        content: processedContent,
        read_time: `${Math.ceil(postData.content.length / 1500)} dk okuma`,
        category: postData.blog_categories || { id: '', name: 'Genel', slug: 'genel' }
      };

      setPost(formattedPost);

      if (postData.category_id) {
        const relatedQuery = `select=id,title,slug,image_url,created_at&category_id=eq.${postData.category_id}&is_published=eq.true&id=neq.${postData.id}&limit=3`;
        const relatedRes = await fetch(`${supabaseUrl}/rest/v1/blog_posts?${relatedQuery}`, { headers });
        if (relatedRes.ok) {
          setRelatedPosts(await relatedRes.json());
        }
      }

    } catch (err: any) {
      console.error('Yazı yüklenemedi:', err);
      setError('Yazı bulunamadı.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link kopyalandı!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Bir Hata Oluştu</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={() => navigate('/blog')}>Blog Listesine Dön</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-indigo-600 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Header Section (Matching Blog List Style) */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="px-3 py-1 rounded-full bg-white/20 text-white border border-white/30 text-sm font-medium backdrop-blur-sm">
                {post.category.name}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight tracking-tight font-serif">
              {post.title}
            </h1>

            <div className="flex items-center justify-center gap-4 text-blue-100 text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(post.created_at), 'd MMMM yyyy', { locale: tr })}
              </span>
              <span className="w-1 h-1 rounded-full bg-blue-300" />
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {post.read_time}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto mb-8 flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-indigo-600 transition-colors">Anasayfa</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/blog" className="hover:text-indigo-600 transition-colors">Blog</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{post.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
          
          {/* Left Sidebar (Share & TOC) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-8">
              {/* Table of Contents */}
              {toc.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    İçindekiler
                  </h3>
                  <nav className="space-y-1">
                    {toc.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`block text-sm py-1.5 px-2 rounded-md transition-all duration-200 border-l-2 ${
                          activeSection === item.id
                            ? 'border-indigo-600 text-indigo-700 bg-indigo-50 font-medium'
                            : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                          setActiveSection(item.id);
                        }}
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Share Buttons */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Paylaş</h3>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" className="justify-start hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-colors group">
                    <Facebook className="w-4 h-4 mr-2 group-hover:text-white text-[#1877F2]" />
                    Facebook
                  </Button>
                  <Button variant="outline" className="justify-start hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2] transition-colors group">
                    <Twitter className="w-4 h-4 mr-2 group-hover:text-white text-[#1DA1F2]" />
                    Twitter
                  </Button>
                  <Button variant="outline" className="justify-start hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-colors group">
                    <Linkedin className="w-4 h-4 mr-2 group-hover:text-white text-[#0A66C2]" />
                    LinkedIn
                  </Button>
                  <Button variant="outline" onClick={copyToClipboard} className="justify-start hover:bg-gray-800 hover:text-white hover:border-gray-800 transition-colors group">
                    <LinkIcon className="w-4 h-4 mr-2 group-hover:text-white text-gray-600" />
                    Linki Kopyala
                  </Button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-9">
            {/* Featured Image */}
            <div className="mb-10 rounded-2xl overflow-hidden shadow-lg border border-gray-100">
              <img
                src={post.image_url || 'https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg'}
                alt={post.title}
                className="w-full h-auto object-cover max-h-[500px]"
              />
            </div>

            <motion.article
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="prose prose-lg max-w-none 
                prose-headings:font-serif prose-headings:font-bold prose-headings:text-gray-900 
                prose-p:text-gray-600 prose-p:leading-relaxed
                prose-a:text-indigo-600 prose-a:no-underline prose-a:border-b prose-a:border-indigo-200 hover:prose-a:border-indigo-600 hover:prose-a:bg-indigo-50 prose-a:transition-all
                prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-8
                prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-gray-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:font-medium prose-blockquote:text-gray-800
                prose-li:text-gray-600 prose-li:marker:text-indigo-500"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Mobile Share (Visible only on mobile) */}
            <div className="lg:hidden mt-8 pt-8 border-t border-gray-100">
              <h3 className="font-semibold mb-4">Bu yazıyı paylaş</h3>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" className="rounded-full"><Facebook className="w-4 h-4" /></Button>
                <Button size="icon" variant="outline" className="rounded-full"><Twitter className="w-4 h-4" /></Button>
                <Button size="icon" variant="outline" className="rounded-full"><Linkedin className="w-4 h-4" /></Button>
                <Button size="icon" variant="outline" className="rounded-full" onClick={copyToClipboard}><LinkIcon className="w-4 h-4" /></Button>
              </div>
            </div>
          </main>

        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-24 pt-12 border-t border-gray-100 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 font-serif">İlginizi Çekebilir</h2>
              <Link to="/blog" className="text-indigo-600 font-medium hover:underline flex items-center">
                Tüm Yazılar <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.id} to={`/blog/${relatedPost.slug}`} className="group">
                  <article className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    <div className="h-48 overflow-hidden relative">
                      <img
                        src={relatedPost.image_url || 'https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg'}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="text-xs text-gray-500 mb-2">
                        {format(new Date(relatedPost.created_at), 'd MMMM yyyy', { locale: tr })}
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <div className="mt-auto pt-4 flex items-center text-indigo-600 text-sm font-medium">
                        Devamını Oku <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPost;
