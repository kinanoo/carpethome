import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, X, Phone, Mail, MapPin, 
  ChevronDown, Play, Star, Award, Users, Globe,
  MessageCircle, Send, Shield, Truck, CheckCircle, 
  Facebook, Instagram, Youtube, ChevronUp, ChevronLeft, ChevronRight
} from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation, Keyboard } from 'swiper/modules'
import { supabase } from '../lib/supabase'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

interface Product {
  id: string
  name_ar: string
  name_en: string
  category: string
  is_active: boolean
  images?: { id: string; image_url: string; is_primary: boolean }[]
}

interface GalleryItem {
  id: string
  title_ar: string
  image_url: string
}

interface Testimonial {
  id: string
  customer_name: string
  customer_country: string
  content_ar: string
  rating: number
}

interface FAQ {
  id: string
  question_ar: string
  answer_ar: string
}

interface VideoItem {
  id: string
  title_ar: string
  url: string
}

// Default fallback data
const defaultGallery = ['/carpet1.jpg', '/carpet2.jpg', '/carpet3.jpg', '/carpet4.jpg', '/carpet5.jpg', '/carpet6.jpg', '/carpet7.jpg', '/carpet8.jpg', '/carpet9.jpg', '/carpet10.jpg', '/carpet11.jpg', '/carpet12.jpg']

const defaultTestimonials = [
  { id: '1', customer_name: 'أحمد محمد', customer_country: 'السعودية', rating: 5, content_ar: 'جودة استثنائية وخدمة ممتازة. السجاد وصل بحالة ممتازة وبالضبط كما في الصور.' },
  { id: '2', customer_name: 'فاطمة علي', customer_country: 'الإمارات', rating: 5, content_ar: 'أفضل سجاد اشتريته. الألوان رائعة والجودة عالية جداً.' },
  { id: '3', customer_name: 'محمد خالد', customer_country: 'الكويت', rating: 5, content_ar: 'تعامل راقي وأسعار منافسة. أنصح بالتعامل معهم بشدة.' },
]

const defaultFaqs = [
  { id: '1', question_ar: 'ما هي مدة الشحن؟', answer_ar: 'الشحن يستغرق من 7-15 يوم عمل حسب الدولة.' },
  { id: '2', question_ar: 'هل يوجد ضمان على المنتجات؟', answer_ar: 'نعم، جميع منتجاتنا مضمونة لمدة سنتين ضد عيوب الصناعة.' },
  { id: '3', question_ar: 'ما هي طرق الدفع المتاحة؟', answer_ar: 'نقبل التحويل البنكي، الدفع عند الاستلام، وبطاقات الائتمان.' },
  { id: '4', question_ar: 'هل يمكن طلب مقاسات خاصة؟', answer_ar: 'نعم، نوفر خدمة التصنيع حسب الطلب بالمقاسات التي تحتاجها.' },
]

const defaultProducts: Product[] = [
  { id: 'p1', name_ar: 'سجاد كلاسيكي فاخر', name_en: 'Classic Luxury Carpet', category: 'كلاسيكي', is_active: true, images: [{ id: 'i1', image_url: '/carpet1.jpg', is_primary: true }, { id: 'i2', image_url: '/carpet2.jpg', is_primary: false }] },
  { id: 'p2', name_ar: 'سجاد عصري أنيق', name_en: 'Modern Elegant Carpet', category: 'عصري', is_active: true, images: [{ id: 'i3', image_url: '/carpet3.jpg', is_primary: true }, { id: 'i4', image_url: '/carpet4.jpg', is_primary: false }] },
  { id: 'p3', name_ar: 'سجاد تركي أصيل', name_en: 'Authentic Turkish Carpet', category: 'تركي', is_active: true, images: [{ id: 'i5', image_url: '/carpet5.jpg', is_primary: true }, { id: 'i6', image_url: '/carpet6.jpg', is_primary: false }] },
  { id: 'p4', name_ar: 'سجاد شرقي مزخرف', name_en: 'Oriental Ornate Carpet', category: 'شرقي', is_active: true, images: [{ id: 'i7', image_url: '/carpet7.jpg', is_primary: true }, { id: 'i8', image_url: '/carpet8.jpg', is_primary: false }] },
  { id: 'p5', name_ar: 'سجاد فارسي راقي', name_en: 'Premium Persian Carpet', category: 'فارسي', is_active: true, images: [{ id: 'i9', image_url: '/carpet9.jpg', is_primary: true }, { id: 'i10', image_url: '/carpet10.jpg', is_primary: false }] },
  { id: 'p6', name_ar: 'سجاد مخمل فاخر', name_en: 'Luxury Velvet Carpet', category: 'مخمل', is_active: true, images: [{ id: 'i11', image_url: '/carpet11.jpg', is_primary: true }, { id: 'i12', image_url: '/carpet12.jpg', is_primary: false }] },
]
export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showVideo, setShowVideo] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' })
  
  // Data from Supabase
  const [products, setProducts] = useState<Product[]>(defaultProducts)
  const [gallery, setGallery] = useState<string[]>(defaultGallery)
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials)
  const [faqs, setFaqs] = useState<FAQ[]>(defaultFaqs)
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [siteImages, setSiteImages] = useState<{[key: string]: string}>({
    hero_main: '/carpet11.jpg',
    hero_floating_1: '/carpet11.jpg',
    hero_floating_2: '/carpet12.jpg',
    about_main: '/carpet8.jpg'
  })

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      // Fetch products with images
      const { data: productsData } = await supabase
        .from('products')
        .select('*, images:product_images(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      if (productsData && productsData.length > 0) {
        setProducts(productsData)
      }

      // Fetch gallery
      const { data: galleryData } = await supabase
        .from('gallery')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      if (galleryData && galleryData.length > 0) {
        setGallery(galleryData.map(g => g.image_url))
      }

      // Fetch testimonials
      const { data: testimonialsData } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      if (testimonialsData && testimonialsData.length > 0) {
        setTestimonials(testimonialsData)
      }

      // Fetch FAQ
      const { data: faqData } = await supabase
        .from('faq')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
      
      if (faqData && faqData.length > 0) {
        setFaqs(faqData)
      }

      // Fetch Videos
      const { data: videosData } = await supabase
        .from('videos')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      if (videosData && videosData.length > 0) {
        setVideos(videosData)
      }

      // Fetch Site Images
      const { data: siteImagesData } = await supabase
        .from('site_settings')
        .select('*')
        .in('key', ['hero_main', 'hero_floating_1', 'hero_floating_2', 'about_main'])
      
      if (siteImagesData && siteImagesData.length > 0) {
        const imgs: {[key: string]: string} = {
          hero_main: '/carpet11.jpg',
          hero_floating_1: '/carpet11.jpg',
          hero_floating_2: '/carpet12.jpg',
          about_main: '/carpet8.jpg'
        }
        siteImagesData.forEach(item => { 
          if (item.value) imgs[item.key] = item.value 
        })
        setSiteImages(imgs)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
      setShowScrollTop(window.scrollY > 500)
      const sections = ['home', 'about', 'products', 'gallery', 'videos', 'testimonials', 'faq', 'contact']
      for (const section of sections) {
        const el = document.getElementById(section)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section)
            break
          }
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!selectedProduct || !selectedProduct.images) return
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const direction = e.key === 'ArrowRight' ? -1 : 1
      setSelectedImageIndex(prev => {
        const newIndex = prev + direction
        if (newIndex < 0) return selectedProduct.images.length - 1
        if (newIndex >= selectedProduct.images.length) return 0
        return newIndex
      })
    } else if (e.key === 'Escape') {
      setSelectedProduct(null)
    }
  }, [selectedProduct])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Always dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      setIsMenuOpen(false)
    }
  }

  const navItems = [
    { id: 'home', label: 'الرئيسية' },
    { id: 'about', label: 'من نحن' },
    { id: 'products', label: 'منتجاتنا' },
    { id: 'gallery', label: 'المعرض' },
    { id: 'videos', label: 'فيديوهات' },
    { id: 'testimonials', label: 'آراء العملاء' },
    { id: 'faq', label: 'الأسئلة الشائعة' },
    { id: 'contact', label: 'تواصل معنا' },
  ]

  // Helper function to convert YouTube URL to embed URL
  const getYoutubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([^&\s]+)/)
    return match ? `https://www.youtube.com/embed/${match[1]}` : url
  }

  return (
    <div className="min-h-screen dark">
      {/* NAVBAR */}
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('home')}>
              <img src="/logo.png" alt="كاربت هوم" className="h-12 w-12 rounded-full" />
              <div className="hidden sm:block">
                <h1 className="text-white font-bold text-lg">كاربت هوم</h1>
                <p className="text-gold text-xs">Carpet Home</p>
              </div>
            </motion.div>

            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <button key={item.id} onClick={() => scrollToSection(item.id)} className={`nav-link ${activeSection === item.id ? 'text-gold' : ''}`}>
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <a href="tel:+905550200911" className="flex items-center gap-2 px-4 py-2 bg-gold text-navy rounded-full font-semibold hover:bg-gold-light transition-colors">
                <Phone className="w-4 h-4" />
                <span>اتصل الآن</span>
              </a>
              <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2 text-white">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-navy/95 backdrop-blur-lg z-50 lg:hidden">
            <div className="flex flex-col h-full p-6">
              <div className="flex justify-between items-center mb-10">
                <img src="/logo.png" alt="Logo" className="h-12 w-12 rounded-full" />
                <button onClick={() => setIsMenuOpen(false)} className="text-white"><X className="w-8 h-8" /></button>
              </div>
              <div className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <button key={item.id} onClick={() => scrollToSection(item.id)} className="text-white text-xl font-semibold py-3 border-b border-white/10 text-right hover:text-gold transition-colors">
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="mt-auto">
                <a href="tel:+905550200911" className="flex items-center justify-center gap-2 w-full py-4 bg-gold text-navy rounded-xl font-bold text-lg">
                  <Phone className="w-5 h-5" />
                  <span>+90 555 020 09 11</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <section id="home" className="hero-section">
        <div className="hero-bg" />
        <div className="hero-pattern" />
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
        <img src={siteImages.hero_floating_1} loading="lazy" className="floating-carpet w-32 h-32 object-cover rounded-2xl top-20 right-10 hidden lg:block" style={{ animationDelay: '0s' }} />
        <img src={siteImages.hero_floating_2} loading="lazy" className="floating-carpet w-24 h-24 object-cover rounded-xl bottom-32 left-20 hidden lg:block" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="order-2 lg:order-1">
                <div className="section-badge hidden sm:flex">
                  <Award className="w-4 h-4" />
                  <span>صناعة السجاد على الطلب والذوق</span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white leading-tight mb-4 sm:mb-6">
                  اكتشف روعة
                  <span className="block mt-2 bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
                    أجود أنواع السجاد لدينا
                  </span>
                </h1>
                
                <p className="hidden sm:block text-lg text-gray-300 mb-8 leading-relaxed">
                  من قلب غازي عنتاب، نقدم لكم أجود أنواع السجاد المصنوع 
                  بأيدي أمهر الحرفيين، بتصاميم تجمع بين الأصالة والعصرية.
                </p>

                <div className="flex flex-wrap gap-3 mb-6 sm:mb-10">
                  <button onClick={() => scrollToSection('products')} className="btn-luxury">تصفح المنتجات</button>
                  <button onClick={() => setShowVideo(true)} className="btn-outline flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    شاهد المعمل
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {[{ number: '+10', label: 'سنوات خبرة' }, { number: '+500', label: 'عميل سعيد' }, { number: '+200', label: 'تصميم فريد' }].map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="text-xl sm:text-3xl font-bold text-gold">{stat.number}</div>
                      <div className="text-xs sm:text-sm text-gray-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative block order-1 lg:order-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-gold/20 to-primary/20 rounded-3xl blur-3xl" />
                  <img src={siteImages.hero_main} alt="سجاد فاخر" loading="lazy" className="relative rounded-2xl lg:rounded-3xl shadow-2xl w-full h-[260px] sm:h-[360px] lg:h-[500px] object-cover ring-2 ring-gold/40" />
                  <div className="absolute -bottom-6 -right-6 glass-card p-4 flex items-center gap-3">
                    <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-navy" />
                    </div>
                    <div>
                      <div className="text-white font-bold">جودة مضمونة</div>
                      <div className="text-gray-400 text-sm">ضمان سنتين</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-white/50">
            <ChevronDown className="w-8 h-8" />
          </motion.div>
        </motion.div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-16 sm:py-24 bg-[var(--bg-main)] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              <img src={siteImages.about_main} alt="معمل السجاد" loading="lazy" className="rounded-3xl shadow-xl w-full h-[300px] sm:h-[400px] object-cover" />
              <div className="absolute -bottom-4 right-4 sm:-bottom-8 sm:-left-8 bg-gold text-navy p-4 sm:p-6 rounded-2xl shadow-xl">
                <div className="text-2xl sm:text-4xl font-bold">+10</div>
                <div className="text-sm sm:text-base font-semibold">سنوات من التميز</div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="mt-8 lg:mt-0">
              <div className="section-badge"><Globe className="w-4 h-4" /><span>من نحن</span></div>
              <h2 className="section-title">رواد صناعة <span>السجاد بكل أشكاله وتصاميمه</span></h2>
              <p className="text-[var(--text-secondary)] text-base sm:text-lg leading-relaxed mb-6">
                منذ عام 2015، ونحن نصنع أجود أنواع السجاد ونصدره للعالم ليروي عنا 
                الحكاية ويكون التصميم والجودة الاسم الذي يسمو بنا.
              </p>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-8">
                نجمع بين الحرفية التقليدية والتقنيات الحديثة لنقدم لكم سجاداً يجمع بين الجمال والجودة والمتانة.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[{ icon: Shield, text: 'ضمان الجودة' }, { icon: Truck, text: 'شحن دولي' }].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-[var(--bg-secondary)] rounded-xl">
                    <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-gold flex-shrink-0" />
                    <span className="font-semibold text-sm sm:text-base text-[var(--text-main)]">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PRODUCTS SECTION */}
      <section id="products" className="py-24 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="section-badge mx-auto"><Star className="w-4 h-4" /><span>تشكيلتنا المميزة</span></div>
            <h2 className="section-title">اكتشف <span>منتجاتنا</span></h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">مجموعة متنوعة من أفخر أنواع السجاد بتصاميم عصرية وكلاسيكية</p>
          </motion.div>

          {products.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-secondary)]">جاري تحميل المنتجات...</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, index) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="luxury-card group">
                  <div className="product-image-wrapper h-64 relative">
                    {product.images && product.images.length > 0 ? (
                      <Swiper modules={[Autoplay, Pagination]} spaceBetween={0} slidesPerView={1} pagination={{ clickable: true }} autoplay={{ delay: 4000, disableOnInteraction: false }} className="h-full">
                        {product.images.map((img, imgIndex) => (
                          <SwiperSlide key={imgIndex}>
                            <img src={img.image_url} alt={`${product.name_ar} ${imgIndex + 1}`} loading="lazy" className="w-full h-full object-cover" />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">لا توجد صورة</div>
                    )}
                    {product.images && product.images.length > 1 && (
                      <div className="absolute top-3 left-3 z-10 bg-black/60 text-white text-xs px-2 py-1 rounded-full">{product.images.length} صور</div>
                    )}
                    <div className="product-overlay flex items-end p-6">
                      <button onClick={() => { setSelectedProduct(product); setSelectedImageIndex(0); }} className="btn-luxury w-full text-center">عرض التفاصيل</button>
                    </div>
                  </div>
                  <div className="p-6">
                    <span className="text-gold text-sm font-semibold">{product.category || 'سجاد'}</span>
                    <h3 className="text-xl font-bold text-[var(--text-main)] mt-1">{product.name_ar}</h3>
                    <p className="text-[var(--text-muted)] text-sm mt-1">{product.name_en}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-12">
            <a href="https://wa.me/905550200911" target="_blank" rel="noopener noreferrer" className="btn-luxury inline-flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              اطلب الآن عبر واتساب
            </a>
          </motion.div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section id="gallery" className="py-24 bg-[var(--bg-main)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="section-badge mx-auto"><Star className="w-4 h-4" /><span>معرض الصور</span></div>
            <h2 className="section-title">شاهد <span>روائعنا</span></h2>
          </motion.div>

          <Swiper modules={[Autoplay, Pagination, Navigation, Keyboard]} spaceBetween={20} slidesPerView={1} breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 }, 1280: { slidesPerView: 4 } }} autoplay={{ delay: 3000, pauseOnMouseEnter: true }} pagination={{ clickable: true }} navigation keyboard={{ enabled: true }} watchSlidesProgress={true} className="pb-12">
            {gallery.map((img, i) => (
              <SwiperSlide key={i}>
                <motion.div whileHover={{ scale: 1.02 }} className="cursor-pointer" onClick={() => { setSelectedProduct({ id: '0', name_ar: 'المعرض', name_en: 'Gallery', images: gallery.map(g => ({ image_url: g })), category: '' }); setSelectedImageIndex(i); }}>
                  <img src={img} alt={`Gallery ${i + 1}`} loading="lazy" className="w-full h-72 object-cover rounded-2xl" />
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* VIDEO SECTION */}
      <section id="videos" className="py-24 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"><div className="hero-pattern" /></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="section-badge mx-auto"><Play className="w-4 h-4" /><span>شاهد معملنا</span></div>
            <h2 className="text-4xl font-bold text-white mb-4">جولة في <span className="text-gold">معمل الإنتاج</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">شاهد كيف نصنع أجود أنواع السجاد بأيدي أمهر الحرفيين</p>
          </motion.div>
          
          {videos.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-4xl mx-auto">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-video bg-navy-light">
                <iframe src="https://www.youtube.com/embed/DSyyQwGNQ-Q" title="معمل السجاد" className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
            </motion.div>
          ) : videos.length === 1 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-4xl mx-auto">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-video bg-navy-light">
                <iframe src={getYoutubeEmbedUrl(videos[0].url)} title={videos[0].title_ar} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
              <p className="text-center text-white mt-4 font-semibold">{videos[0].title_ar}</p>
            </motion.div>
          ) : (
            <Swiper modules={[Autoplay, Pagination, Navigation]} spaceBetween={30} slidesPerView={1} breakpoints={{ 768: { slidesPerView: 2 } }} pagination={{ clickable: true }} navigation className="pb-12">
              {videos.map((video, i) => (
                <SwiperSlide key={video.id}>
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video bg-navy-light">
                      <iframe src={getYoutubeEmbedUrl(video.url)} title={video.title_ar} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    </div>
                    <p className="text-center text-white mt-4 font-semibold">{video.title_ar}</p>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-24 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="section-badge mx-auto"><Users className="w-4 h-4" /><span>آراء عملائنا</span></div>
            <h2 className="section-title">ماذا يقول <span>عملاؤنا</span></h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="testimonial-card">
                <div className="flex gap-1 mb-4">{[...Array(t.rating)].map((_, j) => (<Star key={j} className="w-5 h-5 fill-gold text-gold" />))}</div>
                <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">"{t.content_ar}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center"><span className="text-gold font-bold">{t.customer_name[0]}</span></div>
                  <div><div className="font-bold text-[var(--text-main)]">{t.customer_name}</div><div className="text-sm text-[var(--text-muted)]">{t.customer_country}</div></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-16 sm:py-24 bg-[var(--bg-main)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 sm:mb-16">
            <div className="section-badge mx-auto"><MessageCircle className="w-4 h-4" /><span>الأسئلة الشائعة</span></div>
            <h2 className="section-title">أسئلة <span>متكررة</span></h2>
          </motion.div>
          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, i) => (
              <motion.div key={faq.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-[var(--bg-card)] rounded-xl sm:rounded-2xl border border-[var(--border)] overflow-hidden">
                <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 sm:p-6 text-right">
                  <span className="font-semibold text-[var(--text-main)] text-sm sm:text-base pr-2">{faq.question_ar}</span>
                  <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-gold transition-transform flex-shrink-0 ${expandedFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expandedFaq === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <p className="px-4 sm:px-6 pb-4 sm:pb-6 text-[var(--text-secondary)] text-sm sm:text-base">{faq.answer_ar}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-16 sm:py-24 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"><div className="hero-pattern" /></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 sm:mb-16">
            <div className="section-badge mx-auto"><Mail className="w-4 h-4" /><span>تواصل معنا</span></div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">نسعد <span className="text-gold">بتواصلكم</span></h2>
          </motion.div>
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="space-y-4 sm:space-y-6">
                {[{ icon: MapPin, title: 'العنوان', text: 'BAŞPINAR (ORGANİZE) OSB MAH. O.S.B. 3.BÖLGE 83318 NOLU CAD. NO: 22 ŞEHİTKAMİL/ GAZİANTEP' }, { icon: Phone, title: 'الهاتف', text: '+90 555 020 09 11', href: 'tel:+905550200911' }, { icon: Mail, title: 'البريد الإلكتروني', text: 'carpethome10@gmail.com', href: 'mailto:carpethome10@gmail.com' }].map((item, i) => (
                  <div key={i} className="flex gap-3 sm:gap-4 p-4 sm:p-6 glass-card rounded-2xl">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gold/20 rounded-xl flex items-center justify-center flex-shrink-0"><item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-gold" /></div>
                    <div className="min-w-0"><h3 className="font-bold text-white mb-1 text-sm sm:text-base">{item.title}</h3>{item.href ? (<a href={item.href} className="text-gray-400 hover:text-gold transition-colors text-xs sm:text-sm break-all">{item.text}</a>) : (<p className="text-gray-400 text-xs sm:text-sm break-words">{item.text}</p>)}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 sm:mt-8 rounded-2xl overflow-hidden h-48 sm:h-64">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3172.5!2d37.336!3d37.168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDEwJzA2LjAiTiAzN8KwMjAnMTAuMyJF!5e0!3m2!1sen!2str!4v1234567890" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-card p-5 sm:p-8 rounded-2xl sm:rounded-3xl">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">أرسل رسالتك</h3>
              <form className="space-y-4 sm:space-y-5" onSubmit={(e) => { e.preventDefault(); const msg = `الاسم: ${formData.name}\nالبريد: ${formData.email}\nالهاتف: ${formData.phone}\nالرسالة: ${formData.message}`; window.open('https://wa.me/905550200911?text=' + encodeURIComponent(msg), '_blank'); }}>
                <input type="text" placeholder="الاسم الكامل" className="input-luxury bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-sm sm:text-base" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                <input type="email" placeholder="البريد الإلكتروني" className="input-luxury bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-sm sm:text-base" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                <input type="tel" placeholder="رقم الهاتف" className="input-luxury bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-sm sm:text-base" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                <textarea placeholder="رسالتك..." rows={3} className="input-luxury bg-white/10 border-white/20 text-white placeholder:text-gray-400 resize-none text-sm sm:text-base" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                <button type="submit" className="btn-luxury w-full flex items-center justify-center gap-2 text-sm sm:text-base"><Send className="w-4 h-4 sm:w-5 sm:h-5" />إرسال الرسالة</button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-navy-light py-8 sm:py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="Logo" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full" />
                <div><h3 className="text-white font-bold text-sm sm:text-base">كاربت هوم</h3><p className="text-gold text-xs sm:text-sm">Carpet Home</p></div>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm">صناعة السجاد الفاخر منذ 2015</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">روابط سريعة</h4>
              <ul className="space-y-1 sm:space-y-2">
                {navItems.slice(0, 4).map((item) => (<li key={item.id}><button onClick={() => scrollToSection(item.id)} className="text-gray-400 hover:text-gold transition-colors text-xs sm:text-sm">{item.label}</button></li>))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">تواصل معنا</h4>
              <ul className="space-y-1 sm:space-y-2 text-gray-400 text-xs sm:text-sm">
                <li className="break-all">+90 555 020 09 11</li>
                <li className="break-all">carpethome10@gmail.com</li>
                <li>غازي عنتاب، تركيا</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">تابعنا</h4>
              <div className="flex gap-2 sm:gap-3">
                {[Facebook, Instagram, Youtube].map((Icon, i) => (<a key={i} href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-gold hover:text-navy transition-all"><Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" /></a>))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 sm:pt-8 text-center text-gray-400 text-xs sm:text-sm">© {new Date().getFullYear()} كاربت هوم. جميع الحقوق محفوظة.</div>
        </div>
      </footer>

      

      {/* SCROLL TO TOP */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-8 right-8 w-12 h-12 bg-gold text-navy rounded-full flex items-center justify-center shadow-lg hover:bg-gold-light transition-colors z-50">
            <ChevronUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ADVANCED IMAGE LIGHTBOX */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center" onClick={() => setSelectedProduct(null)}>
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
              <div className="text-white">
                <h3 className="font-bold text-xl">{selectedProduct.name_ar || selectedProduct.name}</h3>
                <p className="text-gray-400 text-sm">{selectedImageIndex + 1} / {(selectedProduct.images?.length || 0)}</p>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="text-white hover:text-gold p-2"><X className="w-8 h-8" /></button>
            </div>

            <div className="w-full h-full max-w-5xl max-h-[80vh] px-16" onClick={(e) => e.stopPropagation()}>
              {selectedProduct.images && selectedProduct.images.length > 0 ? (
                <Swiper modules={[Navigation, Keyboard, Pagination]} spaceBetween={0} slidesPerView={1} initialSlide={selectedImageIndex} navigation={{ prevEl: '.lightbox-prev', nextEl: '.lightbox-next' }} keyboard={{ enabled: true }} pagination={{ clickable: true, dynamicBullets: true }} onSlideChange={(swiper) => setSelectedImageIndex(swiper.activeIndex)} className="h-full">
                  {selectedProduct.images.map((img: any, index: number) => (
                    <SwiperSlide key={index} className="flex items-center justify-center">
                      <img src={img.image_url || img} alt={`${selectedProduct.name_ar} ${index + 1}`} loading="lazy" className="max-w-full max-h-full object-contain rounded-2xl" />
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">لا توجد صور</div>
              )}
            </div>

            {selectedProduct.images && selectedProduct.images.length > 1 && (
              <>
                <button className="lightbox-prev absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-gold text-white hover:text-navy rounded-full flex items-center justify-center transition-all z-20" onClick={(e) => e.stopPropagation()}><ChevronRight className="w-8 h-8" /></button>
                <button className="lightbox-next absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-gold text-white hover:text-navy rounded-full flex items-center justify-center transition-all z-20" onClick={(e) => e.stopPropagation()}><ChevronLeft className="w-8 h-8" /></button>
              </>
            )}

            {selectedProduct.images && selectedProduct.images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {selectedProduct.images.map((img: any, index: number) => (
                  <button key={index} onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(index); }} className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === index ? 'border-gold scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={img.image_url || img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="absolute bottom-6 right-6 text-gray-500 text-sm hidden md:block">استخدم الأسهم ← → للتنقل | ESC للإغلاق</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIDEO MODAL */}
      <AnimatePresence>
        {showVideo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowVideo(false)} className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-4xl aspect-video">
              <iframe src="https://www.youtube.com/embed/DSyyQwGNQ-Q?autoplay=1" className="w-full h-full rounded-2xl" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </motion.div>
            <button onClick={() => setShowVideo(false)} className="absolute top-6 right-6 text-white hover:text-gold"><X className="w-10 h-10" /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
