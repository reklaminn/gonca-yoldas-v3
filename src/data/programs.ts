export interface Program {
  id: number;
  slug: string;
  title: string;
  shortTitle: string;
  age: string;
  ageRange: string;
  description: string;
  image: string;
  price: number;
  duration: string;
  schedule: string;
  lessonsPerWeek: number;
  lessonDuration: string;
  maxStudents: number;
  features: string[];
  outcomes: string[];
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export const programs: Program[] = [
  {
    id: 1,
    slug: 'bebeğimle-evde-ingilizce',
    title: 'Bebeğimle Evde İngilizce',
    shortTitle: 'Baby English',
    age: '0-2',
    ageRange: '0-2 Yaş',
    description: 'Bebekler için özel tasarlanmış, bilimsel yöntemlerle desteklenen İngilizce edinim programı',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
    price: 2500,
    duration: '12 hafta',
    schedule: 'Haftada 2 ders, 30 dakika',
    lessonsPerWeek: 2,
    lessonDuration: '30 dakika',
    maxStudents: 6,
    features: [
      'Anne-baba katılımlı online dersler',
      'Müzik ve ritim temelli öğrenme',
      'Dijital materyal paketi',
      'Haftalık ilerleme raporları',
    ],
    outcomes: [
      'Temel İngilizce seslere aşinalık kazanır',
      'Basit kelimeleri tanır ve tepki verir',
      'Müzik ve ritim yoluyla dil gelişimi desteklenir',
      'Anne-baba ile birlikte öğrenme alışkanlığı kazanır',
      'Sosyal etkileşim becerileri gelişir',
    ],
    faqs: [
      {
        question: 'Bebeğim çok küçük, İngilizce öğrenebilir mi?',
        answer: '0-2 yaş arası bebekler dil öğrenimine en açık dönemdedir. Programımız, bebeğinizin doğal öğrenme kapasitesini destekleyecek şekilde tasarlanmıştır.',
      },
      {
        question: 'Dersler nasıl işleniyor?',
        answer: 'Online derslerimiz interaktif, oyun temelli ve müzik eşliğinde gerçekleşir. Anne-baba katılımı zorunludur ve evde uygulayabileceğiniz aktiviteler paylaşılır.',
      },
      {
        question: 'Materyaller dahil mi?',
        answer: 'Evet, tüm dijital materyaller, şarkılar ve aktivite kılavuzları programa dahildir.',
      },
    ],
  },
  {
    id: 2,
    slug: 'çocuğumla-evde-ingilizce',
    title: 'Çocuğumla Evde İngilizce',
    shortTitle: 'Toddler English',
    age: '2-5',
    ageRange: '2-5 Yaş',
    description: 'Okul öncesi çocuklar için oyun temelli, etkileşimli İngilizce öğrenme programı',
    image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800',
    price: 3200,
    duration: '16 hafta',
    schedule: 'Haftada 3 ders, 40 dakika',
    lessonsPerWeek: 3,
    lessonDuration: '40 dakika',
    maxStudents: 8,
    features: [
      'Oyun temelli öğrenme metodolojisi',
      'Hikaye anlatımı ve drama aktiviteleri',
      'Dijital ve fiziksel materyal paketi',
      'Aylık gelişim değerlendirmeleri',
    ],
    outcomes: [
      'Temel kelime dağarcığı oluşturur (100+ kelime)',
      'Basit cümleler kurar ve anlar',
      'Günlük rutinlerde İngilizce kullanır',
      'Özgüven ve iletişim becerileri gelişir',
      'Okuma-yazmaya hazırlık kazanır',
    ],
    faqs: [
      {
        question: 'Çocuğum hiç İngilizce bilmiyor, başlayabilir mi?',
        answer: 'Evet, programımız sıfırdan başlayanlar için tasarlanmıştır. Her çocuk kendi hızında ilerler.',
      },
      {
        question: 'Anne-baba katılımı gerekli mi?',
        answer: 'İlk haftalarda anne-baba desteği önerilir, ancak çocuğunuz alıştıkça bağımsız katılım sağlanır.',
      },
      {
        question: 'Hangi materyaller kullanılıyor?',
        answer: 'Dijital kitaplar, oyun kartları, şarkı ve hikaye videoları, aktivite kitapçıkları kullanılır.',
      },
    ],
  },
  {
    id: 3,
    slug: 'çocuklar-için-online-ingilizce',
    title: 'Çocuklar için Online İngilizce',
    shortTitle: 'Kids English',
    age: '5-10',
    ageRange: '5-10 Yaş',
    description: 'İlkokul çağı çocuklar için kapsamlı, müfredat destekli İngilizce programı',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
    price: 4500,
    duration: '24 hafta',
    schedule: 'Haftada 3 ders, 50 dakika',
    lessonsPerWeek: 3,
    lessonDuration: '50 dakika',
    maxStudents: 10,
    features: [
      'Müfredat destekli kapsamlı program',
      'Okuma-yazma becerileri geliştirme',
      'Proje tabanlı öğrenme',
      'Sertifikalı eğitmenler',
      'Çevrimiçi öğrenme platformu',
    ],
    outcomes: [
      'Akıcı okuma ve yazma becerileri kazanır',
      'Günlük konuşmalarda rahatça İngilizce kullanır',
      'Temel gramer yapılarını öğrenir',
      'Sunum ve proje hazırlama becerileri gelişir',
      'Uluslararası sınavlara hazırlık kazanır',
    ],
    faqs: [
      {
        question: 'Program okul müfredatına uygun mu?',
        answer: 'Evet, programımız MEB müfredatını destekler ve genişletir. Okul başarısını artırır.',
      },
      {
        question: 'Sınav hazırlığı yapılıyor mu?',
        answer: 'Cambridge YLE, Flyers gibi uluslararası sınavlara hazırlık modülleri içerir.',
      },
      {
        question: 'Ödevler var mı?',
        answer: 'Haftalık 15-20 dakikalık eğlenceli ödevler ve projeler verilir.',
      },
    ],
  },
];

export const getProgramBySlug = (slug: string): Program | undefined => {
  return programs.find((p) => p.slug === slug);
};

export const getProgramsByAge = (age: string): Program[] => {
  return programs.filter((p) => p.age === age);
};
