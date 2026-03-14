import { useState, useEffect, useCallback, useRef } from 'react'
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
  { id: '1', customer_name: 'Ø£Ø­ÙØ¯ ÙØ­ÙØ¯', customer_country: 'Ø§ÙØ³Ø¹ÙØ¯ÙØ©', rating: 5, content_ar: 'Ø¬ÙØ¯Ø© Ø§Ø³ØªØ«ÙØ§Ø¦ÙØ© ÙØ®Ø¯ÙØ© ÙÙØªØ§Ø²Ø©. Ø§ÙØ³Ø¬Ø§Ø¯ ÙØµÙ Ø¨Ø­Ø§ÙØ© ÙÙØªØ§Ø²Ø© ÙØ¨Ø§ÙØ¶Ø¨Ø· ÙÙØ§ ÙÙ Ø§ÙØµÙØ±.' },
  { id: '2', customer_name: 'ÙØ§Ø·ÙØ© Ø¹ÙÙ', customer_country: 'Ø§ÙØ¥ÙØ§Ø±Ø§Øª', rating: 5, content_ar: 'Ø£ÙØ¶Ù Ø³Ø¬Ø§Ø¯ Ø§Ø´ØªØ±ÙØªÙ. Ø§ÙØ£ÙÙØ§Ù Ø±Ø§Ø¦Ø¹Ø© ÙØ§ÙØ¬ÙØ¯Ø© Ø¹Ø§ÙÙØ© Ø¬Ø¯Ø§Ù.' },
  { id: '3', customer_name: 'ÙØ­ÙØ¯ Ø®Ø§ÙØ¯', customer_country: 'Ø§ÙÙÙÙØª', rating: 5, content_ar: 'ØªØ¹Ø§ÙÙ Ø±Ø§ÙÙ ÙØ£Ø³Ø¹Ø§Ø± ÙÙØ§ÙØ³Ø©. Ø£ÙØµØ­ Ø¨Ø§ÙØªØ¹Ø§ÙÙ ÙØ¹ÙÙ Ø¨Ø´Ø¯Ø©.' },
]

const defaultFaqs = [
  { id: '1', question_ar: 'ÙØ§ ÙÙ ÙØ¯Ø© Ø§ÙØ´Ø­ÙØ', answer_ar: 'Ø§ÙØ´Ø­Ù ÙØ³ØªØºØ±Ù ÙÙ 7-15 ÙÙÙ Ø¹ÙÙ Ø­Ø³Ø¨ Ø§ÙØ¯ÙÙØ©.' },
  { id: '2', question_ar: 'ÙÙ ÙÙØ¬Ø¯ Ø¶ÙØ§Ù Ø¹ÙÙ Ø§ÙÙÙØªØ¬Ø§ØªØ', answer_ar: 'ÙØ¹ÙØ Ø¬ÙÙØ¹ ÙÙØªØ¬Ø§ØªÙØ§ ÙØ¶ÙÙÙØ© ÙÙØ¯Ø© Ø³ÙØªÙÙ Ø¶Ø¯ Ø¹ÙÙØ¨ Ø§ÙØµÙØ§Ø¹Ø©.' },
  { id: '3', question_ar: 'ÙØ§ ÙÙ Ø·Ø±Ù Ø§ÙØ¯ÙØ¹ Ø§ÙÙØªØ§Ø­Ø©Ø', answer_ar: 'ÙÙØ¨Ù Ø§ÙØªØ­ÙÙÙ Ø§ÙØ¨ÙÙÙØ Ø§ÙØ¯ÙØ¹ Ø¹ÙØ¯ Ø§ÙØ§Ø³ØªÙØ§ÙØ ÙØ¨Ø·Ø§ÙØ§Øª Ø§ÙØ§Ø¦ØªÙØ§Ù.' },
  { id: '4', question_ar: 'ÙÙ ÙÙÙÙ Ø·ÙØ¨ ÙÙØ§Ø³Ø§Øª Ø®Ø§ØµØ©Ø', answer_ar: 'ÙØ¹ÙØ ÙÙÙØ± Ø®Ø¯ÙØ© Ø§ÙØªØµÙÙØ¹ Ø­Ø³Ø¨ Ø§ÙØ·ÙØ¨ Ø¨Ø§ÙÙÙØ§Ø³Ø§Øª Ø§ÙØªÙ ØªØ­ØªØ§Ø¬ÙØ§.' },
]

const defaultProducts: Product[] = [
  { id: 'p1', name_ar: 'Ø³Ø¬Ø§Ø¯ ÙÙØ§Ø³ÙÙÙ ÙØ§Ø®Ø±', name_en: 'Classic Luxury Carpet', category: 'ÙÙØ§Ø³ÙÙÙ', is_active: true, images: [{ id: 'i1', image_url: '/carpet1.jpg', is_primary: true }, { id: 'i2', image_url: '/carpet2.jpg', is_primary: false }] },
  { id: 'p2', name_ar: 'Ø³Ø¬Ø§Ø¯ Ø¹ØµØ±Ù Ø£ÙÙÙ', name_en: 'Modern Elegant Carpet', category: 'Ø¹ØµØ±Ù', is_active: true, images: [{ id: 'i3', image_url: '/carpet3.jpg', is_primary: true }, { id: 'i4', image_url: '/carpet4.jpg', is_primary: false }] },
  { id: 'p3', name_ar: 'Ø³Ø¬Ø§Ø¯ ØªØ±ÙÙ Ø£ØµÙÙ', name_en: 'Authentic Turkish Carpet', category: 'ØªØ±ÙÙ', is_active: true, images: [{ id: 'i5', image_url: '/carpet5.jpg', is_primary: true }, { id: 'i6', image_url: '/carpet6.jpg', is_primary: false }] },
  { id: 'p4', name_ar: 'Ø³Ø¬Ø§Ø¯ Ø´Ø±ÙÙ ÙØ²Ø®Ø±Ù', name_en: 'Oriental Ornate Carpet', category: 'Ø´Ø±ÙÙ', is_active: true, images: [{ id: 'i7', image_url: '/carpet7.jpg', is_primary: true }, { id: 'i8', image_url: '/carpet8.jpg', is_primary: false }] },
  { id: 'p5', name_ar: 'Ø³Ø¬Ø§Ø¯ ÙØ§Ø±Ø³Ù Ø±Ø§ÙÙ', name_en: 'Premium Persian Carpet', category: 'ÙØ§Ø±Ø³Ù', is_active: true, images: [{ id: 'i9', image_url: '/carpet9.jpg', is_primary: true }, { id: 'i10', image_url: '/carpet10.jpg', is_primary: false }] },
  { id: 'p6', name_ar: 'Ø³Ø¬Ø§Ø¯ ÙØ®ÙÙ ÙØ§Ø®Ø±', name_en: 'Luxury Velvet Carpet', category: 'ÙØ®ÙÙ', is_active: true, images: [{ id: 'i11', image_url: '/carpet11.jpg', is_primary: true }, { id: 'i12', image_url: '/carpet12.jpg', is_primary: false }] },
]
export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isNavVisible, setIsNavVisible] = useState(true)
  const lastScrollYRef = useRef(0)
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
      const currentY = window.scrollY
      // Hide navbar when scrolling down past 80px, show INSTANTLY when scrolling up even 1px
      if (currentY > lastScrollYRef.current && currentY > 80) {
        setIsNavVisible(false)
      } else if (currentY < lastScrollYRef.current) {
        setIsNavVisible(true)
      }
      lastScrollYRef.current = currentY
      setIsScrolled(currentY > 50)
      setShowScrollTop(currentY > 500)
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
    { id: 'home', label: 'Ø§ÙØ±Ø¦ÙØ³ÙØ©' },
    { id: 'about', label: 'ÙÙ ÙØ­Ù' },
    { id: 'products', label: 'ÙÙØªØ¬Ø§ØªÙØ§' },
    { id: 'gallery', label: 'Ø§ÙÙØ¹Ø±Ø¶' },
    { id: 'videos', label: 'ÙÙØ¯ÙÙÙØ§Øª' },
    { id: 'testimonials', label: 'Ø¢Ø±Ø§Ø¡ Ø§ÙØ¹ÙÙØ§Ø¡' },
    { id: 'faq', label: 'Ø§ÙØ£Ø³Ø¦ÙØ© Ø§ÙØ´Ø§Ø¦Ø¹Ø©' },
    { id: 'contact', label: 'ØªÙØ§ØµÙ ÙØ¹ÙØ§' },
  ]

  // Helper function to convert YouTube URL to embed URL
  const getYoutubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([^&\s]+)/)
    return match ? `https://www.youtube.com/embed/${match[1]}` : url
  }

  return (
    <div className="min-h-screen dark">
      {/* NAVBAR */}
      <nav className={`navbar ${isScrolled ? 'scrolled' : 'navbar-transparent'} ${isNavVisible ? 'translate-y-0' : '-translate-y-full'} transition-transform duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-11">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('home')}>
              <img src="/logo.png" alt="ÙØ§Ø±Ø¨Øª ÙÙÙ" className="h-8 w-8 rounded-full" />
              <div>
                <h1 className="text-white font-bold text-sm">ÙØ§Ø±Ø¨Øª ÙÙÙ</h1>
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
              <a href="tel:+905550200911" className="flex items-center gap-1 px-2.5 py-1 bg-gold text-navy rounded-full text-xs font-semibold hover:bg-gold-light transition-colors">
                <Phone className="w-3 h-3" />
                <span>Ø§ØªØµÙ</span>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-navy/98 backdrop-blur-xl z-[200] lg:hidden">
            <div className="flex flex-col h-full px-5 py-4">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="Logo" className="h-8 w-8 rounded-full" />
                  <div><p className="text-white font-bold text-sm">ÙØ§Ø±Ø¨Øª ÙÙÙ</p><p className="text-gold text-xs">Carpet Home</p></div>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="text-white/70 hover:text-white"><X className="w-6 h-6" /></button>
              </div>
              <div className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <button key={item.id} onClick={() => scrollToSection(item.id)} className="text-white/90 text-sm font-medium py-2 px-3 border-b border-white/10 text-right hover:text-gold hover:bg-white/5 rounded-lg transition-colors">
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="mt-auto">
                <a href="tel:+905550200911" className="flex items-center justify-center gap-2 w-full py-3 bg-gold text-navy rounded-xl font-bold text-sm">
                  <Phone className="w-4 h-4" />
                  <span>+90 555 020 09 11</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <section id="home" className="hero-section relative overflow-hidden">
        {/* Full background image for mobile */}
        <div
          className="absolute inset-0 lg:hidden"
          style={{
            backgroundImage: `url(${siteImages.hero_main})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 backdrop-blur-[2px]" />
          <div className="absolute inset-0" style={{background: 'linear-gradient(to bottom, rgba(10,20,50,0.45) 0%, rgba(10,20,50,0.2) 40%, rgba(10,20,50,0.65) 100%)'}} />
        </div>

        {/* Desktop background elements */}
        <div className="hero-bg hidden lg:block" />
        <div className="hero-pattern" />
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
        <img src={siteImages.hero_floating_1} loading="lazy" className="floating-carpet w-32 h-32 object-cover rounded-2xl top-20 right-10 hidden lg:block" style={{ animationDelay: '0s' }} />
        <img src={siteImages.hero_floating_2} loading="lazy" className="floating-carpet w-24 h-24 object-cover rounded-xl bottom-32 left-20 hidden lg:block" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 flex items-center min-h-[55vh] lg:min-h-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 sm:py-16 lg:py-20 w-full">

            {/* Mobile layout: full-screen hero with centered content */}
            <div className="flex flex-col items-center text-center lg:hidden">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="bg-black/30 backdrop-blur-sm rounded-3xl px-5 py-8 border border-white/10">
                <h1 className="text-4xl font-bold text-white leading-tight mb-4 drop-shadow-lg">
                  Ø£Ø¬ÙØ¯ Ø£ÙÙØ§Ø¹ Ø§ÙØ³Ø¬Ø§Ø¯
                </h1>
                <p className="text-base text-gray-200 mb-8 leading-relaxed drop-shadow px-2">
                  ÙÙ ÙÙØ¨ ØºØ§Ø²Ù Ø¹ÙØªØ§Ø¨Ø Ø£Ø¬ÙØ¯ Ø£ÙÙØ§Ø¹ Ø§ÙØ³Ø¬Ø§Ø¯ Ø¨Ø£ÙØ¯Ù Ø£ÙÙØ± Ø§ÙØ­Ø±ÙÙÙÙ
                </p>
                <div className="flex flex-wrap justify-center gap-3 mb-10">
                  <button onClick={() => scrollToSection('products')} className="btn-luxury">ØªØµÙØ­ Ø§ÙÙÙØªØ¬Ø§Øª</button>
                  <button onClick={() => setShowVideo(true)} className="btn-outline flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Ø´Ø§ÙØ¯ Ø§ÙÙØ¹ÙÙ
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[{ number: '+10', label: 'Ø³ÙÙØ§Øª Ø®Ø¨Ø±Ø©' }, { number: '+500', label: 'Ø¹ÙÙÙ Ø³Ø¹ÙØ¯' }, { number: '+200', label: 'ØªØµÙÙÙ ÙØ±ÙØ¯' }].map((stat, i) => (
                    <div key={i} className="text-center bg-black/30 rounded-xl py-2 px-1 backdrop-blur-sm">
                      <div className="text-2xl font-bold text-gold">{stat.number}</div>
                      <div className="text-xs text-gray-300">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Desktop layout: two-column grid */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="order-2 lg:order-1">
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white leading-tight mb-4 sm:mb-6">
                  Ø£Ø¬ÙØ¯ Ø£ÙÙØ§Ø¹ Ø§ÙØ³Ø¬Ø§Ø¯
                </h1>
                <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                  ÙÙ ÙÙØ¨ ØºØ§Ø²Ù Ø¹ÙØªØ§Ø¨Ø ÙÙØ¯Ù ÙÙÙ Ø£Ø¬ÙØ¯ Ø£ÙÙØ§Ø¹ Ø§ÙØ³Ø¬Ø§Ø¯ Ø§ÙÙØµÙÙØ¹ Ø¨Ø£ÙØ¯Ù Ø£ÙÙØ± Ø§ÙØ­Ø±ÙÙÙÙØ Ø¨ØªØµØ§ÙÙÙ ØªØ¬ÙØ¹ Ø¨ÙÙ Ø§ÙØ£ØµØ§ÙØ© ÙØ§ÙØ¹ØµØ±ÙØ©.
                </p>
                <div className="flex flex-wrap gap-3 mb-10">
                  <button onClick={() => scrollToSection('products')} className="btn-luxury">ØªØµÙØ­ Ø§ÙÙÙØªØ¬Ø§Øª</button>
                  <button onClick={() => setShowVideo(true)} className="btn-outline flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Ø´Ø§ÙØ¯ Ø§ÙÙØ¹ÙÙ
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  {[{ number: '+10', label: 'Ø³ÙÙØ§Øª Ø®Ø¨Ø±Ø©' }, { number: '+500', label: 'Ø¹ÙÙÙ Ø³Ø¹ÙØ¯' }, { number: '+200', label: 'ØªØµÙÙÙ ÙØ±ÙØ¯' }].map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="text-3xl font-bold text-gold">{stat.number}</div>
                      <div className="text-sm text-gray-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative order-1 lg:order-2">
                <img src={siteImages.hero_main} alt="Ø³Ø¬Ø§Ø¯ ÙØ§Ø®Ø±" loading="lazy" className="rounded-3xl shadow-2xl w-full lg:h-[500px] object-cover ring-2 ring-gold/40" />
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
      <section id="about" className="py-10 sm:py-20 bg-[var(--bg-main)] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              <img src={siteImages.about_main} alt="ÙØ¹ÙÙ Ø§ÙØ³Ø¬Ø§Ø¯" loading="lazy" className="rounded-3xl shadow-xl w-full h-[300px] sm:h-[400px] object-cover" />
              <div className="absolute -bottom-3 right-3 bg-gold text-navy p-2 px-3 rounded-xl shadow-xl">
                <div className="text-lg font-bold">+10</div>
                <div className="text-xs font-semibold">Ø³ÙÙØ§Øª ÙÙ Ø§ÙØªÙÙØ²</div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="mt-8 lg:mt-0">
              <div className="section-badge"><Globe className="w-4 h-4" /><span>ÙÙ ÙØ­Ù</span></div>
              <h2 className="section-title">Ø±ÙØ§Ø¯ ØµÙØ§Ø¹Ø© <span>Ø§ÙØ³Ø¬Ø§Ø¯ Ø¨ÙÙ Ø£Ø´ÙØ§ÙÙ ÙØªØµØ§ÙÙÙÙ</span></h2>
              <p className="text-[var(--text-secondary)] text-base sm:text-lg leading-relaxed mb-6">
                ÙÙØ° Ø¹Ø§Ù 2015Ø ÙÙØ­Ù ÙØµÙØ¹ Ø£Ø¬ÙØ¯ Ø£ÙÙØ§Ø¹ Ø§ÙØ³Ø¬Ø§Ø¯ ÙÙØµØ¯Ø±Ù ÙÙØ¹Ø§ÙÙ ÙÙØ±ÙÙ Ø¹ÙØ§ 
                Ø§ÙØ­ÙØ§ÙØ© ÙÙÙÙÙ Ø§ÙØªØµÙÙÙ ÙØ§ÙØ¬ÙØ¯Ø© Ø§ÙØ§Ø³Ù Ø§ÙØ°Ù ÙØ³ÙÙ Ø¨ÙØ§.
              </p>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-8">
                ÙØ¬ÙØ¹ Ø¨ÙÙ Ø§ÙØ­Ø±ÙÙØ© Ø§ÙØªÙÙÙØ¯ÙØ© ÙØ§ÙØªÙÙÙØ§Øª Ø§ÙØ­Ø¯ÙØ«Ø© ÙÙÙØ¯Ù ÙÙÙ Ø³Ø¬Ø§Ø¯Ø§Ù ÙØ¬ÙØ¹ Ø¨ÙÙ Ø§ÙØ¬ÙØ§Ù ÙØ§ÙØ¬ÙØ¯Ø© ÙØ§ÙÙØªØ§ÙØ©.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[{ icon: Shield, text: 'Ø¶ÙØ§Ù Ø§ÙØ¬ÙØ¯Ø©' }, { icon: Truck, text: 'Ø´Ø­Ù Ø¯ÙÙÙ' }].map((item, i) => (
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
      <section id="products" className="py-10 sm:py-20 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="section-badge mx-auto"><Star className="w-4 h-4" /><span>ØªØ´ÙÙÙØªÙØ§ Ø§ÙÙÙÙØ²Ø©</span></div>
            <h2 className="section-title">Ø§ÙØªØ´Ù <span>ÙÙØªØ¬Ø§ØªÙØ§</span></h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">ÙØ¬ÙÙØ¹Ø© ÙØªÙÙØ¹Ø© ÙÙ Ø£ÙØ®Ø± Ø£ÙÙØ§Ø¹ Ø§ÙØ³Ø¬Ø§Ø¯ Ø¨ØªØµØ§ÙÙÙ Ø¹ØµØ±ÙØ© ÙÙÙØ§Ø³ÙÙÙØ©</p>
          </motion.div>

          {products.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-secondary)]">Ø¬Ø§Ø±Ù ØªØ­ÙÙÙ Ø§ÙÙÙØªØ¬Ø§Øª...</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, index) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="luxury-card group cursor-pointer" onClick={() => { setSelectedProduct(product); setSelectedImageIndex(0); }}>
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
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">ÙØ§ ØªÙØ¬Ø¯ ØµÙØ±Ø©</div>
                    )}
                    {product.images && product.images.length > 1 && (
                      <div className="absolute top-3 left-3 z-10 bg-black/60 text-white text-xs px-2 py-1 rounded-full">{product.images.length} ØµÙØ±</div>
                    )}
                    <div className="product-overlay flex items-end p-6">
                      <button onClick={() => { setSelectedProduct(product); setSelectedImageIndex(0); }} className="btn-luxury w-full text-center">Ø¹Ø±Ø¶ Ø§ÙØªÙØ§ØµÙÙ</button>
                    </div>
                  </div>
                  <div className="p-6">
                    <span className="text-gold text-sm font-semibold">{product.category || 'Ø³Ø¬Ø§Ø¯'}</span>
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
              Ø§Ø·ÙØ¨ Ø§ÙØ¢Ù Ø¹Ø¨Ø± ÙØ§ØªØ³Ø§Ø¨
            </a>
          </motion.div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section id="gallery" className="py-10 sm:py-20 bg-[var(--bg-main)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="section-badge mx-auto"><Star className="w-4 h-4" /><span>ÙØ¹Ø±Ø¶ Ø§ÙØµÙØ±</span></div>
            <h2 className="section-title">Ø´Ø§ÙØ¯ <span>Ø±ÙØ§Ø¦Ø¹ÙØ§</span></h2>
          </motion.div>

          <Swiper modules={[Autoplay, Pagination, Navigation, Keyboard]} spaceBetween={20} slidesPerView={1} breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 }, 1280: { slidesPerView: 4 } }} autoplay={{ delay: 3000, pauseOnMouseEnter: true }} pagination={{ clickable: true }} navigation keyboard={{ enabled: true }} watchSlidesProgress={true} className="pb-12">
            {gallery.map((img, i) => (
              <SwiperSlide key={i}>
                <motion.div whileHover={{ scale: 1.02 }} className="cursor-pointer" onClick={() => { setSelectedProduct({ id: '0', name_ar: 'Ø§ÙÙØ¹Ø±Ø¶', name_en: 'Gallery', images: gallery.map(g => ({ image_url: g })), category: '' }); setSelectedImageIndex(i); }}>
                  <img src={img} alt={`Gallery ${i + 1}`} loading="lazy" className="w-full h-72 object-cover rounded-2xl" />
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* VIDEO SECTION */}
      <section id="videos" className="py-10 sm:py-20 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"><div className="hero-pattern" /></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="section-badge mx-auto"><Play className="w-4 h-4" /><span>Ø´Ø§ÙØ¯ ÙØ¹ÙÙÙØ§</span></div>
            <h2 className="text-4xl font-bold text-white mb-4">Ø¬ÙÙØ© ÙÙ <span className="text-gold">ÙØ¹ÙÙ Ø§ÙØ¥ÙØªØ§Ø¬</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Ø´Ø§ÙØ¯ ÙÙÙ ÙØµÙØ¹ Ø£Ø¬ÙØ¯ Ø£ÙÙØ§Ø¹ Ø§ÙØ³Ø¬Ø§Ø¯ Ø¨Ø£ÙØ¯Ù Ø£ÙÙØ± Ø§ÙØ­Ø±ÙÙÙÙ</p>
          </motion.div>
          
          {videos.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-4xl mx-auto">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-video bg-navy-light">
                <iframe src="https://www.youtube.com/embed/DSyyQwGNQ-Q" title="ÙØ¹ÙÙ Ø§ÙØ³Ø¬Ø§Ø¯" className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
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
      <section id="testimonials" className="py-10 sm:py-20 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <div className="section-badge mx-auto"><Users className="w-4 h-4" /><span>Ø¢Ø±Ø§Ø¡ Ø¹ÙÙØ§Ø¦ÙØ§</span></div>
            <h2 className="section-title">ÙØ§Ø°Ø§ ÙÙÙÙ <span>Ø¹ÙÙØ§Ø¤ÙØ§</span></h2>
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
      <section id="faq" className="py-10 sm:py-20 bg-[var(--bg-main)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 sm:mb-16">
            <div className="section-badge mx-auto"><MessageCircle className="w-4 h-4" /><span>Ø§ÙØ£Ø³Ø¦ÙØ© Ø§ÙØ´Ø§Ø¦Ø¹Ø©</span></div>
            <h2 className="section-title">Ø£Ø³Ø¦ÙØ© <span>ÙØªÙØ±Ø±Ø©</span></h2>
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
      <section id="contact" className="py-10 sm:py-20 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"><div className="hero-pattern" /></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 sm:mb-16">
            <div className="section-badge mx-auto"><Mail className="w-4 h-4" /><span>ØªÙØ§ØµÙ ÙØ¹ÙØ§</span></div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">ÙØ³Ø¹Ø¯ <span className="text-gold">Ø¨ØªÙØ§ØµÙÙÙ</span></h2>
          </motion.div>
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="space-y-4 sm:space-y-6">
                {[{ icon: MapPin, title: 'Ø§ÙØ¹ÙÙØ§Ù', text: 'BAÅPINAR (ORGANÄ°ZE) OSB MAH. O.S.B. 3.BÃLGE 83318 NOLU CAD. NO: 22 ÅEHÄ°TKAMÄ°L/ GAZÄ°ANTEP' }, { icon: Phone, title: 'Ø§ÙÙØ§ØªÙ', text: '+90 555 020 09 11', href: 'tel:+905550200911' }, { icon: Mail, title: 'Ø§ÙØ¨Ø±ÙØ¯ Ø§ÙØ¥ÙÙØªØ±ÙÙÙ', text: 'carpethome10@gmail.com', href: 'mailto:carpethome10@gmail.com' }].map((item, i) => (
                  <div key={i} className="flex gap-3 sm:gap-4 p-4 sm:p-6 glass-card rounded-2xl">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gold/20 rounded-xl flex items-center justify-center flex-shrink-0"><item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-gold" /></div>
                    <div className="min-w-0"><h3 className="font-bold text-white mb-1 text-sm sm:text-base">{item.title}</h3>{item.href ? (<a href={item.href} className="text-gray-400 hover:text-gold transition-colors text-xs sm:text-sm break-all">{item.text}</a>) : (<p className="text-gray-400 text-xs sm:text-sm break-words">{item.text}</p>)}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 sm:mt-8 rounded-2xl overflow-hidden h-48 sm:h-64">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3172.5!2d37.3358!3d37.1682!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1531e689a6e2e34f%3A0x850ed3f84c6a9ed8!2zQsWSxZ9QSU5BUiBPU0IgTWFoLiwgR2F6aWFudGVw!5e0!3m2!1str!2str!4v1710000000000" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" />
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-card p-5 sm:p-8 rounded-2xl sm:rounded-3xl">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Ø£Ø±Ø³Ù Ø±Ø³Ø§ÙØªÙ</h3>
              <form className="space-y-4 sm:space-y-5" onSubmit={(e) => { e.preventDefault(); const msg = `Ø§ÙØ§Ø³Ù: ${formData.name}\nØ§ÙØ¨Ø±ÙØ¯: ${formData.email}\nØ§ÙÙØ§ØªÙ: ${formData.phone}\nØ§ÙØ±Ø³Ø§ÙØ©: ${formData.message}`; window.open('https://wa.me/905550200911?text=' + encodeURIComponent(msg), '_blank'); }}>
                <input type="text" placeholder="Ø§ÙØ§Ø³Ù Ø§ÙÙØ§ÙÙ" className="input-luxury bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-sm sm:text-base" id="contact-name" id="contact-name" name="name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                <input type="email" placeholder="Ø§ÙØ¨Ø±ÙØ¯ Ø§ÙØ¥ÙÙØªØ±ÙÙÙ" className="input-luxury bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-sm sm:text-base" id="contact-email" name="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                <input type="tel" placeholder="Ø±ÙÙ Ø§ÙÙØ§ØªÙ" className="input-luxury bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-sm sm:text-base" id="contact-phone" name="phone" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                <textarea placeholder="Ø±Ø³Ø§ÙØªÙ..." rows={3} className="input-luxury bg-white/10 border-white/20 text-white placeholder:text-gray-400 resize-none text-sm sm:text-base" id="contact-message" name="message" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                <button type="submit" className="btn-luxury w-full flex items-center justify-center gap-2 text-sm sm:text-base"><Send className="w-4 h-4 sm:w-5 sm:h-5" />Ø¥Ø±Ø³Ø§Ù Ø§ÙØ±Ø³Ø§ÙØ©</button>
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
                <div><h3 className="text-white font-bold text-sm sm:text-base">ÙØ§Ø±Ø¨Øª ÙÙÙ</h3><p className="text-gold text-xs sm:text-sm">Carpet Home</p></div>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm">ØµÙØ§Ø¹Ø© Ø§ÙØ³Ø¬Ø§Ø¯ Ø§ÙÙØ§Ø®Ø± ÙÙØ° 2015</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">Ø±ÙØ§Ø¨Ø· Ø³Ø±ÙØ¹Ø©</h4>
              <ul className="space-y-1 sm:space-y-2">
                {navItems.slice(0, 4).map((item) => (<li key={item.id}><button onClick={() => scrollToSection(item.id)} className="text-gray-400 hover:text-gold transition-colors text-xs sm:text-sm">{item.label}</button></li>))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">ØªÙØ§ØµÙ ÙØ¹ÙØ§</h4>
              <ul className="space-y-1 sm:space-y-2 text-gray-400 text-xs sm:text-sm">
                <li className="break-all">+90 555 020 09 11</li>
                <li className="break-all">carpethome10@gmail.com</li>
                <li>ØºØ§Ø²Ù Ø¹ÙØªØ§Ø¨Ø ØªØ±ÙÙØ§</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">ØªØ§Ø¨Ø¹ÙØ§</h4>
              <div className="flex gap-2 sm:gap-3">
                {[Facebook, Instagram, Youtube].map((Icon, i) => (<a key={i} href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-gold hover:text-navy transition-all"><Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" /></a>))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 sm:pt-8 text-center text-gray-400 text-xs sm:text-sm">Â© {new Date().getFullYear()} ÙØ§Ø±Ø¨Øª ÙÙÙ. Ø¬ÙÙØ¹ Ø§ÙØ­ÙÙÙ ÙØ­ÙÙØ¸Ø©.</div>
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
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20 pointer-events-auto">
              <div className="text-white">
                <h3 className="font-bold text-xl">{selectedProduct.name_ar || selectedProduct.name}</h3>
                <p className="text-gray-400 text-sm">{selectedImageIndex + 1} / {(selectedProduct.images?.length || 0)}</p>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="text-white hover:text-gold p-2"><X className="w-8 h-8" /></button>
            </div>

            <div className="w-full h-full max-w-5xl max-h-[80vh] px-16 pointer-events-none">
              {selectedProduct.images && selectedProduct.images.length > 0 ? (
                <Swiper modules={[Navigation, Keyboard, Pagination]} spaceBetween={0} slidesPerView={1} initialSlide={selectedImageIndex} navigation={{ prevEl: '.lightbox-prev', nextEl: '.lightbox-next' }} keyboard={{ enabled: true }} pagination={{ clickable: true, dynamicBullets: true }} onSlideChange={(swiper) => setSelectedImageIndex(swiper.activeIndex)} onClick={(e: any) => { if (e && typeof e.stopPropagation === 'function') e.stopPropagation(); }} className="h-full pointer-events-auto">
                  {selectedProduct.images.map((img: any, index: number) => (
                    <SwiperSlide key={index} className="flex items-center justify-center">
                      <img src={img.image_url || img} alt={`${selectedProduct.name_ar} ${index + 1}`} loading="lazy" className="max-w-full max-h-full object-contain rounded-2xl" />
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">ÙØ§ ØªÙØ¬Ø¯ ØµÙØ±</div>
              )}
            </div>

            {selectedProduct.images && selectedProduct.images.length > 1 && (
              <>
                <button className="lightbox-prev absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-gold text-white hover:text-navy rounded-full flex items-center justify-center transition-all z-20 pointer-events-auto" onClick={(e) => e.stopPropagation()}><ChevronRight className="w-8 h-8" /></button>
                <button className="lightbox-next absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-gold text-white hover:text-navy rounded-full flex items-center justify-center transition-all z-20 pointer-events-auto" onClick={(e) => e.stopPropagation()}><ChevronLeft className="w-8 h-8" /></button>
              </>
            )}

            {selectedProduct.images && selectedProduct.images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20 pointer-events-auto">
                {selectedProduct.images.map((img: any, index: number) => (
                  <button key={index} onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(index); }} className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === index ? 'border-gold scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={img.image_url || img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="absolute bottom-6 right-6 text-gray-500 text-sm hidden md:block">Ø§Ø³ØªØ®Ø¯Ù Ø§ÙØ£Ø³ÙÙ â â ÙÙØªÙÙÙ | ESC ÙÙØ¥ØºÙØ§Ù</div>
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
