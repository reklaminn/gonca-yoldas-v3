// Schema.org JSON-LD generators

export const generateOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'Gonca Yoldaş - Çocuk Gelişimi ve Eğitim',
  description: '0-10 yaş arası çocuklar için bilimsel temelli İngilizce edinim programları',
  url: 'https://www.goncayoldas.com',
  logo: 'https://www.goncayoldas.com/contents/img/logogoncayoldas2.png',
  image: 'https://www.goncayoldas.com/contents/img/logogoncayoldas2.png',
  telephone: '+90-XXX-XXX-XXXX',
  email: 'info@goncayoldas.com',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'TR',
    addressLocality: 'İstanbul',
  },
  sameAs: [
    'https://www.instagram.com/goncayoldas',
    'https://www.youtube.com/@goncayoldas',
    'https://www.tiktok.com/@goncayoldas',
  ],
  founder: {
    '@type': 'Person',
    name: 'Gonca Yoldaş',
    jobTitle: 'Çocuk Gelişimi Uzmanı',
  },
});

export const generateCourseSchema = (program: {
  title: string;
  description: string;
  price: number;
  duration: string;
  ageRange: string;
  slug: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: program.title,
  description: program.description,
  provider: {
    '@type': 'EducationalOrganization',
    name: 'Gonca Yoldaş - Çocuk Gelişimi ve Eğitim',
    url: 'https://www.goncayoldas.com',
  },
  offers: {
    '@type': 'Offer',
    price: program.price,
    priceCurrency: 'TRY',
    availability: 'https://schema.org/InStock',
    url: `https://www.goncayoldas.com/programs/${program.slug}`,
  },
  educationalLevel: program.ageRange,
  timeRequired: program.duration,
  inLanguage: 'tr',
  courseMode: 'online',
  url: `https://www.goncayoldas.com/programs/${program.slug}`,
});

export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

export const generateArticleSchema = (article: {
  title: string;
  description: string;
  publishedDate: string;
  modifiedDate?: string;
  author: string;
  image?: string;
  slug: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: article.title,
  description: article.description,
  image: article.image || 'https://www.goncayoldas.com/contents/img/logogoncayoldas2.png',
  datePublished: article.publishedDate,
  dateModified: article.modifiedDate || article.publishedDate,
  author: {
    '@type': 'Person',
    name: article.author,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Gonca Yoldaş - Çocuk Gelişimi ve Eğitim',
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.goncayoldas.com/contents/img/logogoncayoldas2.png',
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `https://www.goncayoldas.com/blog/${article.slug}`,
  },
});

export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `https://www.goncayoldas.com${item.url}`,
  })),
});
