/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';
import { SpiritualGuide } from './components/SpiritualGuide';
import { MoonPhase } from './components/MoonPhase';
import { ThemeToggle } from './components/ThemeToggle';
import { AdminPanel } from './components/AdminPanel';
import { supabase } from './lib/supabase';
import { WHATSAPP_LINK, WHATSAPP_NUMBER_E164 } from './constants/contact';
import { 
  Flame, 
  MapPin, 
  Phone, 
  MessageSquare,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Quote,
  Plus,
  Minus,
  Clock,
  Globe,
  ShieldCheck
} from 'lucide-react';

export default function App() {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [singleLightQty, setSingleLightQty] = useState(1);
  const [lampType, setLampType] = useState('Clay');
  const [dedicationType, setDedicationType] = useState('General Peace');
  const [donationStatus, setDonationStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [donationType, setDonationType] = useState('sanctuary');
  const [donationAmount, setDonationAmount] = useState<number | 'custom'>(10);
  const [customAmount, setCustomAmount] = useState('');
  const { scrollY, scrollYProgress } = useScroll();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isThemeLight, setIsThemeLight] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [realTimeMedia, setRealTimeMedia] = useState<any[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [swipeStartX, setSwipeStartX] = useState<number | null>(null);
  const [swipeCurrentX, setSwipeCurrentX] = useState<number | null>(null);
  
  // New state for form pre-filling
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [formMessage, setFormMessage] = useState<string>('');
  const contactRef = React.useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const { data, error } = await (supabase
          .from('media') as any)
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          setRealTimeMedia(data);
        }
      } catch (err) {
        console.warn("Supabase initialization skipped: Credentials missing.");
      }
    };

    fetchMedia();

    // Subscribe to real-time updates
    try {
      const channel = supabase
        .channel('media_gallery')
        .on(
          'postgres_changes',
          { event: '*', table: 'media', schema: 'public' },
          () => {
            fetchMedia();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn("Supabase real-time subscription skipped: Credentials missing.");
    }
  }, []);

  useEffect(() => {
    const checkTheme = () => {
      setIsThemeLight(document.documentElement.classList.contains('light'));
    };
    checkTheme();
    
    // Create an observer to watch for theme class changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const progressBar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸', currency: 'USD', locale: 'en-US' },
    { code: 'ne', name: 'नेपाली', flag: '🇳🇵', currency: 'NPR', locale: 'ne-NP' },
    { code: 'zh', name: '简体中文', flag: '🇨🇳', currency: 'CNY', locale: 'zh-CN' },
  ];

  const handleSelectPackage = (pkg: 'single' | 'multiple') => {
    triggerHaptic();
    const packageName = pkg === 'single' ? t('offerings.single.title') : t('offerings.multiple.title');
    setSelectedPackage(packageName);
    
    let intentMessage = '';
    if (pkg === 'single') {
      intentMessage = `I would like to inquire about offering ${singleLightQty} ${lampType} lamp(s).`;
    } else {
      intentMessage = `I am interested in the 108 Lights offering for ${dedicationType}.`;
    }
    setFormMessage(intentMessage);
    
    // Scroll to contact form
    contactRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  // Professional Currency Formatter using Intl API
  const formatCurrency = (amount: number, type: 'single' | 'multiple') => {
    let basePrice = 0;
    if (type === 'single') {
      if (currentLang.code === 'en') basePrice = 0.25;
      else if (currentLang.code === 'ne') basePrice = 30;
      else if (currentLang.code === 'zh') basePrice = 2;
    } else {
      if (currentLang.code === 'en') basePrice = 40;
      else if (currentLang.code === 'ne') basePrice = 5400;
      else if (currentLang.code === 'zh') basePrice = 285;
    }

    const total = basePrice * (type === 'single' ? amount : 1);

    return new Intl.NumberFormat(currentLang.locale, {
      style: 'currency',
      currency: currentLang.currency,
      minimumFractionDigits: currentLang.code === 'ne' ? 0 : 2
    }).format(total);
  };

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsLangOpen(false);
  };

  // Browser Language Detection & DOM Sync
  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    if (languages.some(l => l.code === browserLang) && !localStorage.getItem('i18nextLng')) {
      i18n.changeLanguage(browserLang);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);
  
  const headerOpacity = useTransform(scrollY, [0, 100], [0, 1]);
  const headerBlur = useTransform(scrollY, [0, 100], [0, 20]);
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.2]);

  const navLinks = [
    { name: 'Sanctuary', href: '#about' },
    { name: 'Chronicles', href: '#history' },
    { name: 'Wisdom', href: '#wisdom' },
    { name: 'Offerings', href: '#packages' },
    { name: 'Visions', href: '#gallery' },
    { name: 'Echoes', href: '#testimonials' },
    { name: 'Connect', href: '#contact' },
  ];

  const fallbackGallery = [
    {
      url: '/assets/images/gallery-maya-devi.jpg',
      title: 'Maya Devi Temple, Lumbini',
      alt: 'Maya Devi Temple in Lumbini, Nepal',
      caption: 'The sacred birthplace temple complex at the heart of Lumbini.',
      location: 'Lumbini, Nepal',
    },
    {
      url: '/assets/images/gallery-ashoka-pillar.jpg',
      title: 'Ashoka Pillar',
      alt: 'Ashoka Pillar in the Lumbini sacred garden',
      caption: 'Historic pillar marking the ancient pilgrimage site.',
      location: 'Sacred Garden, Lumbini',
    },
    {
      url: '/assets/images/gallery-peace-pagoda.jpg',
      title: 'World Peace Pagoda',
      alt: 'World Peace Pagoda in Lumbini',
      caption: 'A landmark of global harmony and Buddhist devotion.',
      location: 'Lumbini Monastic Zone',
    },
    {
      url: '/assets/images/gallery-monastic-zone.jpg',
      title: 'Monastic Zone',
      alt: 'Lumbini Peace Pagoda and monastic zone, Nepal',
      caption: 'Monasteries and contemplative spaces across the peace park.',
      location: 'Lumbini Monastic Zone',
    },
  ];

  const galleryItems = realTimeMedia.length > 0
    ? realTimeMedia.map((item) => ({
        url: item.url as string,
        title: (item.title || item.name || 'Sacred Moment') as string,
        alt: (item.title || item.name || 'Sacred Moment') as string,
        caption: (item.caption || '') as string,
        location: (item.location || '') as string,
        type: (item.type === 'video' ? 'video' : 'image') as 'image' | 'video',
      }))
    : fallbackGallery.map((item) => ({
        ...item,
        type: 'image' as const,
      }));

  const activeLightboxItem = lightboxIndex !== null ? galleryItems[lightboxIndex] : null;

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const goNext = () => {
    if (galleryItems.length === 0) return;
    setLightboxIndex((prev) => (prev === null ? 0 : (prev + 1) % galleryItems.length));
  };
  const goPrevious = () => {
    if (galleryItems.length === 0) return;
    setLightboxIndex((prev) => (prev === null ? 0 : (prev - 1 + galleryItems.length) % galleryItems.length));
  };

  const handleLightboxTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const x = e.touches[0]?.clientX;
    if (typeof x === 'number') {
      setSwipeStartX(x);
      setSwipeCurrentX(x);
    }
  };

  const handleLightboxTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (swipeStartX === null) return;
    const x = e.touches[0]?.clientX;
    if (typeof x === 'number') {
      setSwipeCurrentX(x);
    }
  };

  const handleLightboxTouchEnd = () => {
    if (swipeStartX === null || swipeCurrentX === null) {
      setSwipeStartX(null);
      setSwipeCurrentX(null);
      return;
    }

    const delta = swipeCurrentX - swipeStartX;
    const minSwipeDistance = 50;

    if (Math.abs(delta) >= minSwipeDistance) {
      if (delta < 0) goNext();
      else goPrevious();
    }

    setSwipeStartX(null);
    setSwipeCurrentX(null);
  };

  useEffect(() => {
    if (lightboxIndex === null) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrevious();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIndex, galleryItems.length]);

  useEffect(() => {
    if (lightboxIndex !== null && lightboxIndex >= galleryItems.length) {
      setLightboxIndex(null);
    }
  }, [lightboxIndex, galleryItems.length]);

  const playSingingBowl = () => {
    // Symbolic meditation bell / singing bowl sound
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1070/1070-preview.mp3'); 
    audio.volume = 0.3;
    audio.play().catch(() => {}); // Catch if browser blocks audio
  };

  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const name = formData.get('full-name') as string;
    const message = formData.get('message') as string;
    
    const errors: Record<string, string> = {};

    // Name validation
    if (!name || name.trim().length === 0) {
      errors.name = t('system.err_name_required');
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || email.trim().length === 0) {
      errors.email = t('contact.form.errors.invalid_email');
    } else if (!emailRegex.test(email)) {
      errors.email = t('contact.form.errors.invalid_email');
    }
    
    // Message length validation
    if (!message || message.trim().length < 10) {
      errors.message = t('contact.form.errors.message_short');
    } else if (message.length > 500) {
      errors.message = t('contact.form.errors.message_long');
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setFormErrors({});
    setFormStatus('submitting');
    
    // Construct WhatsApp message
    const whatsappNumber = WHATSAPP_NUMBER_E164;
    const selectedPkg = (e.target as HTMLFormElement).package?.value || selectedPackage || t('offerings.single.title');
    const contactMethodInput = (e.target as HTMLFormElement)['contact-method'];
    const contactMethod = contactMethodInput ? contactMethodInput.value : 'WhatsApp';
    
    const text = `*New Inquiry from Lumbini Lamp House Website*\n\n` +
                 `*Name:* ${name}\n` +
                 `*Email:* ${email}\n` +
                 `*Package:* ${selectedPkg}\n` +
                 `*Preferred Contact:* ${contactMethod}\n` +
                 `*Spiritual Intent:* ${message}`;
                 
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;
    
    setTimeout(() => {
      setFormStatus('success');
      playSingingBowl();
      window.open(whatsappUrl, '_blank');
    }, 1000);
  };

  const handleDonation = () => {
    triggerHaptic();
    setDonationStatus('submitting');
    
    const whatsappNumber = WHATSAPP_NUMBER_E164;
    const text = `*Sacred Support/Donation Inquiry*\n\n` +
                 `*Type:* ${t(`donation.options.${donationType}`)}\n` +
                 `*Amount:* ${donationAmount === 'custom' ? customAmount : donationAmount} ${currentLang.currency}\n\n` +
                 `I would like to support the sanctuary preservation at Lumbini.`;
    
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;

    setTimeout(() => {
      setDonationStatus('success');
      playSingingBowl();
      window.open(whatsappUrl, '_blank');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-saffron selection:text-midnight">
      {/* Sacred Cursor Aura */}
      <motion.div
        className="fixed top-0 left-0 w-[600px] h-[600px] bg-saffron/5 rounded-full pointer-events-none z-[1] blur-[120px]"
        animate={{
          x: mousePos.x - 300,
          y: mousePos.y - 300,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
      />

      {/* Burning Wick Progress */}
      <motion.div 
        style={{ scaleX: scrollYProgress }}
        className="fixed top-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-saffron to-transparent w-full z-[100] origin-left shadow-[0_0_10px_#FFD700]"
      />

      {/* Floating Contact Bar */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4" role="complementary" aria-label="Quick Contact">
        <motion.a
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact us on WhatsApp"
          className="bg-green-500/20 backdrop-blur-md border border-green-500/30 text-green-400 p-4 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.2)] flex items-center justify-center hover:bg-green-500/30 transition-all focus:ring-2 focus:ring-green-400 outline-none"
        >
          <Phone className="w-6 h-6" aria-hidden="true" />
        </motion.a>
        <motion.button
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Contact us on WeChat"
          className="bg-blue-500/20 backdrop-blur-md border border-blue-500/30 text-blue-400 p-4 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.2)] flex items-center justify-center hover:bg-blue-500/30 transition-all cursor-pointer focus:ring-2 focus:ring-blue-400 outline-none"
          onClick={() => alert("WeChat ID: LumbiniLightings")}
        >
          <MessageSquare className="w-6 h-6" aria-hidden="true" />
        </motion.button>
      </div>

      {/* Header */}
      <motion.header 
        style={{ 
          backgroundColor: isThemeLight 
            ? `rgba(253, 252, 240, ${headerOpacity.get()})` 
            : `rgba(10, 10, 10, ${headerOpacity.get()})`, 
          backdropFilter: `blur(${headerBlur.get()}px)` 
        }}
        className="fixed top-0 w-full z-50 border-b border-theme-border transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center gap-3">
              <div className="relative" aria-hidden="true">
                <Flame className="w-8 h-8 text-saffron glow-text animate-pulse" />
                <div className="absolute inset-0 bg-saffron/20 blur-xl rounded-full"></div>
              </div>
              <span className="text-2xl font-serif font-bold tracking-widest text-theme-heading uppercase">
                LUMBINI LAMP HOUSE
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <MoonPhase />
              <ThemeToggle />
              <div className="w-px h-6 bg-theme-border mx-2"></div>
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400 hover:text-saffron transition-all"
                >
                  {t(`nav.${link.name.toLowerCase()}`)}
                </a>
              ))}
              
              {/* Language Switcher */}
              <div className="relative">
                <button 
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-theme-border text-theme-text text-[10px] uppercase tracking-widest hover:border-saffron/30 transition-all"
                  aria-label="Change Language"
                >
                  <Globe className="w-3 link-h-3 text-saffron" />
                  <span>{currentLang.name}</span>
                </button>
                <AnimatePresence>
                  {isLangOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-4 w-48 glass-card border-saffron/20 overflow-hidden"
                    >
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => changeLanguage(lang.code)}
                          className={`w-full px-6 py-4 flex items-center justify-between text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all ${currentLang.code === lang.code ? 'text-saffron font-bold' : 'text-stone-400'}`}
                        >
                          <span>{lang.name}</span>
                          <span>{lang.flag}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <a
                href="#contact"
                className="px-8 py-3 rounded-full border border-saffron/30 text-saffron text-[10px] font-bold uppercase tracking-widest hover:bg-saffron hover:text-midnight transition-all shadow-[0_0_15px_rgba(255,215,0,0.1)]"
              >
                {t('nav.inquire')}
              </a>
            </nav>

            <div className="md:hidden flex items-center gap-4">
              <ThemeToggle />
              <button 
                className="p-2 text-stone-400 focus:ring-2 focus:ring-saffron outline-none rounded-lg"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-theme-border bg-theme-bg overflow-hidden"
            >
              <nav className="flex flex-col p-6 gap-6">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-xs font-medium uppercase tracking-[0.2em] text-stone-400 hover:text-saffron transition-all"
                  >
                    {t(`nav.${link.name.toLowerCase()}`)}
                  </a>
                ))}
                <a
                  href="#contact"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full py-4 text-center rounded-full border border-saffron/30 text-saffron text-[10px] font-bold uppercase tracking-widest hover:bg-saffron hover:text-midnight transition-all"
                >
                  {t('nav.inquire')}
                </a>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <main className="flex-grow">
        {/* Hero Section - Immersive Cinematic */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <motion.img 
              style={{ y: heroY, scale: heroScale }}
              src="/assets/images/hero-lumbini.jpg" 
              alt="The sacred grounds of Lumbini, Nepal, birthplace of Lord Buddha"
              className="w-full h-full object-cover opacity-40 translate-z-0"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-theme-bg via-transparent to-theme-bg"></div>
            <div className="absolute inset-0 bg-radial-gradient(circle at 50% 50%, transparent 0%, rgba(10,10,10,0.8) 100%)"></div>
          </div>
          
          {/* Sacred Brass Lamp — background centred behind the text */}
          <motion.div
            style={{ y: useTransform(scrollY, [0, 500], [0, 80]) }}
            className="absolute inset-0 z-[1] flex items-center justify-center pointer-events-none"
          >
            {/* Outer glow halo */}
            <div className="absolute w-[520px] h-[520px] rounded-full bg-saffron/10 blur-[100px]" />
            {/* Lamp image with radial mask so edges fade naturally */}
            <img
              src="/assets/brass-lamp.png"
              alt="Sacred brass oil lamp"
              className="relative w-[480px] max-w-[80vw] opacity-25 select-none"
              style={{
                maskImage: 'radial-gradient(ellipse 70% 80% at 50% 50%, black 40%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(ellipse 70% 80% at 50% 50%, black 40%, transparent 100%)',
                filter: 'sepia(30%) brightness(1.1)',
              }}
              draggable={false}
            />
          </motion.div>

          <div className="relative z-10 text-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex justify-center items-center gap-3 mb-8" aria-hidden="true">
                <div className="h-px w-12 bg-saffron/30"></div>
                <span className="text-xs font-medium uppercase tracking-[0.4em] text-saffron glow-text">{t('hero.sacred_flame')}</span>
                <div className="h-px w-12 bg-saffron/30"></div>
              </div>
              <h1 className="text-6xl md:text-9xl font-serif font-bold text-theme-heading mb-8 tracking-tight leading-[0.9]">
                {t('hero.title_main')} <br />
                <span className="italic font-light text-stone-400">{t('hero.title_sub')}</span>
              </h1>
              
              <div className="max-w-3xl mx-auto space-y-6 mb-12">
                <p className="text-theme-text text-lg md:text-xl font-light tracking-wide leading-relaxed">
                  {t('hero.description')}
                </p>
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="hidden md:block space-y-4 pt-12 border-t border-theme-border"
                >
                  <p className="text-stone-500 text-sm italic font-light leading-relaxed max-w-xl mx-auto">
                    {t('hero.p1')}
                  </p>
                  <p className="text-stone-500 text-sm italic font-light leading-relaxed max-w-xl mx-auto">
                    {t('hero.p2')}
                  </p>
                </motion.div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <motion.a 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="#packages" 
                  className="px-12 py-5 bg-white text-midnight font-bold rounded-full uppercase text-xs tracking-[0.2em] shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                >
                  {t('hero.cta_primary')}
                </motion.a>
                <motion.a 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="#about" 
                  className="px-12 py-5 border border-theme-border text-theme-heading font-bold rounded-full uppercase text-xs tracking-[0.2em] backdrop-blur-sm"
                >
                  {t('hero.cta_secondary')}
                </motion.a>
              </div>
            </motion.div>
          </div>

          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 text-stone-500"
          >
            <div className="w-px h-16 bg-gradient-to-b from-stone-500 to-transparent mx-auto"></div>
          </motion.div>
        </section>

        {/* About Section - Minimalist & Refined */}
        <section id="about" className="py-32 bg-theme-bg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-theme-border to-transparent"></div>
          
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-24 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1 }}
                className="relative group"
              >
                <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-theme-border">
                  <img 
                    src="/assets/images/about-lumbini.jpg"
                    alt="Sacred Bodhi tree and pilgrims at the Maya Devi Temple, Lumbini"
                    className="w-full h-full object-cover transition-all duration-1000"
                  />
                </div>
                <div className="absolute -inset-4 border border-saffron/20 rounded-2xl -z-10 group-hover:inset-0 transition-all duration-700"></div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1 }}
                className={currentLang.code === 'ne' ? 'leading-[1.8]' : ''}
              >
                <span className="text-saffron text-xs font-bold uppercase tracking-[0.3em] mb-6 block">{t('about.label')}</span>
                <h2 className="text-5xl md:text-6xl font-serif font-bold mb-10 leading-tight">
                  {t('about.title_main')} <br /><span className="italic text-stone-500">{t('about.title_sub')}</span>
                </h2>
                <div className="space-y-8 text-stone-400 text-lg font-light leading-relaxed">
                  <p>{t('about.p1')}</p>
                  <p>{t('about.p2')}</p>
                  <div className="grid grid-cols-2 gap-12 pt-8">
                    <div>
                      <h4 className="text-theme-heading font-serif text-2xl mb-2 italic">108</h4>
                      <p className="text-xs uppercase tracking-widest text-stone-500">{t('about.stat1_label')}</p>
                    </div>
                    <div>
                      <h4 className="text-theme-heading font-serif text-2xl mb-2 italic">∞</h4>
                      <p className="text-xs uppercase tracking-widest text-stone-500">{t('about.stat2_label')}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Chronicles - Historical Heritage */}
        <section id="history" className="py-32 bg-theme-bg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-saffron/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2 }}
                className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl"
              >
                <img 
                  src="/assets/images/chronicles-monks.jpg" 
                  alt="Buddhist monks walking through sacred temple grounds"
                  className="w-full h-full object-cover transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-theme-bg via-transparent to-transparent"></div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                <span className="text-saffron text-xs font-bold uppercase tracking-[0.3em] mb-6 block">{t('history.label')}</span>
                <h2 className="text-5xl font-serif font-bold mb-10 leading-tight">
                  {t('history.title')}
                </h2>
                <div className="space-y-8">
                  <p className="text-stone-400 text-lg font-light leading-relaxed">
                    {t('history.p1')}
                  </p>
                  <p className="text-stone-400 text-lg font-light leading-relaxed">
                    {t('history.p2')}
                  </p>
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="p-8 border-l-2 border-saffron/30 bg-theme-surface/50 backdrop-blur-sm rounded-r-2xl"
                  >
                    <p className="text-theme-heading font-light italic leading-relaxed">
                      {t('history.p3')}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Wisdom - Spiritual Significance */}
        <section id="wisdom" className="py-32 bg-theme-surface relative">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="max-w-7xl mx-auto px-6 lg:px-12 text-center mb-24"
          >
            <span className="text-saffron text-xs font-bold uppercase tracking-[0.3em] mb-6 block">{t('significance.label')}</span>
            <h2 className="text-5xl font-serif font-bold mb-8 italic">{t('significance.title')}</h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-theme-text text-xl font-light leading-relaxed mb-12 opacity-80">
                {t('significance.p1')}
              </p>
              <p className="text-theme-text text-lg font-light leading-relaxed opacity-60">
                {t('significance.p2')}
              </p>
            </div>
          </motion.div>

          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {(t('significance.quotes', { returnObjects: true }) as string[]).map((quote, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 glass-card border-theme-border hover:border-saffron/20 transition-all group"
                >
                  <Quote className="w-6 h-6 text-saffron/20 group-hover:text-saffron transition-colors mb-6" />
                  <p className="text-stone-400 text-sm font-light leading-relaxed italic">
                    "{quote}"
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Packages - Glassmorphism */}
        <section id="packages" className="py-32 bg-theme-surface relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8"
            >
              <div>
                <span className="text-saffron text-xs font-bold uppercase tracking-[0.3em] mb-4 block">{t('offerings.label')}</span>
                <h2 className="text-5xl font-serif font-bold">{t('offerings.title')}</h2>
              </div>
              <p className="text-stone-500 max-w-xs text-sm font-light leading-relaxed">
                {t('offerings.description')}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Package 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                whileHover={{ y: -10 }}
                className="glass-card p-12 group hover:border-saffron/30 transition-all duration-500 flex flex-col"
              >
                <div className="flex justify-between items-start mb-8">
                  <h3 className="text-3xl font-serif font-bold">{t('offerings.single.title')}</h3>
                </div>

                <div className="space-y-8 mb-12 flex-grow">
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-stone-400 block">{t('offerings.single.material')}</label>
                    <div className="flex flex-wrap gap-3">
                      {['Clay', 'Terracotta', 'Stone', 'Brass'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setLampType(type)}
                          className={`px-5 py-2 rounded-full text-[10px] uppercase tracking-widest transition-all ${
                            lampType === type 
                              ? 'bg-saffron text-midnight font-bold' 
                              : 'border border-theme-border text-stone-500 hover:border-theme-border/50'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-stone-400 block">{t('offerings.single.quantity')}</label>
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => setSingleLightQty(Math.max(1, singleLightQty - 1))}
                        className="w-10 h-10 rounded-full border border-theme-border flex items-center justify-center text-theme-heading hover:border-saffron hover:text-saffron transition-all"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-xl font-serif text-theme-heading w-8 text-center">{singleLightQty}</span>
                      <button 
                        onClick={() => setSingleLightQty(singleLightQty + 1)}
                        className="w-10 h-10 rounded-full border border-theme-border flex items-center justify-center text-theme-heading hover:border-saffron hover:text-saffron transition-all"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <ul className="space-y-4 pt-4 border-t border-theme-border">
                    <li className="flex items-center gap-4 text-stone-400 text-sm font-light">
                      <Clock className="w-4 h-4 text-saffron/50" />
                      {lampType === 'Clay' ? t('offerings.single.features.clay') : 
                       lampType === 'Terracotta' ? t('offerings.single.features.terracotta') : 
                       lampType === 'Stone' ? t('offerings.single.features.stone') : 
                       t('offerings.single.features.brass')}
                    </li>
                    <li className="flex items-center gap-4 text-stone-400 text-sm font-light">
                      <Sparkles className="w-4 h-4 text-saffron/50" />
                      {t('offerings.single.features.oil')}
                    </li>
                  </ul>
                </div>

                <button 
                  onClick={() => handleSelectPackage('single')}
                  className="w-full py-5 rounded-full border border-theme-border text-theme-heading text-[10px] font-bold uppercase tracking-[0.2em] group-hover:bg-theme-heading group-hover:text-theme-bg transition-all focus:ring-2 focus:ring-saffron outline-none active:scale-95"
                  aria-label={`Select ${singleLightQty} Single Light offering(s)`}
                >
                  {t('offerings.single.confirm')}
                </button>
              </motion.div>

              {/* Package 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                whileHover={{ y: -10 }}
                className="glass-card p-12 border-saffron/20 relative overflow-hidden group hover:border-saffron/50 transition-all duration-500 flex flex-col"
              >
                <div className="absolute top-0 right-0 bg-saffron text-midnight px-8 py-2 rounded-bl-2xl text-[10px] font-bold uppercase tracking-[0.2em]">
                  {t('offerings.multiple.tag')}
                </div>
                <div className="flex justify-between items-start mb-8">
                  <h3 className="text-3xl font-serif font-bold">{t('offerings.multiple.title')}</h3>
                </div>

                <div className="space-y-8 mb-12 flex-grow">
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-stone-400 block">{t('offerings.multiple.intent_label')}</label>
                    <select 
                      value={dedicationType}
                      onChange={(e) => setDedicationType(e.target.value)}
                      className="w-full bg-transparent border-b border-theme-border py-2 focus:border-saffron outline-none transition-all text-theme-text text-sm font-light appearance-none italic cursor-pointer"
                    >
                      <option className="bg-theme-surface" value="General Peace">{t('offerings.multiple.intents.general')}</option>
                      <option className="bg-theme-surface" value="Ancestral Blessing">{t('offerings.multiple.intents.ancestral')}</option>
                      <option className="bg-theme-surface" value="Healing Ritual">{t('offerings.multiple.intents.healing')}</option>
                      <option className="bg-theme-surface" value="Success Dedication">{t('offerings.multiple.intents.success')}</option>
                    </select>
                  </div>

                  <ul className="space-y-4 pt-4 border-t border-theme-border">
                    <li className="flex items-center gap-4 text-stone-400 text-sm font-light">
                      <div className="w-1.5 h-1.5 rounded-full bg-saffron"></div>
                      {t('offerings.multiple.title')} in sacred geometry
                    </li>
                    <li className="flex items-center gap-4 text-stone-400 text-sm font-light">
                      <div className="w-1.5 h-1.5 rounded-full bg-saffron"></div>
                      Exclusive Monk prayer dedication
                    </li>
                    <li className="flex items-center gap-4 text-stone-500 text-xs italic">
                      {t('offerings.multiple.current_intent')} "{dedicationType}"
                    </li>
                  </ul>
                  
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase font-bold tracking-widest text-stone-400 block">{t('offerings.multiple.request_label')}</label>
                    <textarea 
                      placeholder={t('offerings.multiple.request_placeholder')}
                      className="w-full bg-transparent border border-theme-border rounded-xl p-4 focus:border-saffron outline-none transition-all text-theme-text text-xs font-light resize-none"
                      rows={2}
                    ></textarea>
                  </div>

                  <div className="bg-saffron/5 border border-saffron/10 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-saffron text-[10px] font-bold uppercase tracking-widest">{t('offerings.multiple.keepsake.title')}</span>
                      <span className="text-theme-heading text-xs font-bold">{t('offerings.multiple.keepsake.status')}</span>
                    </div>
                    <p className="text-stone-500 text-[11px] font-light leading-relaxed">
                      {t('offerings.multiple.keepsake.description')}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => handleSelectPackage('multiple')}
                  className="w-full py-5 rounded-full bg-saffron text-midnight text-[10px] font-bold uppercase tracking-[0.2em] hover:scale-[1.02] transition-transform focus:ring-2 focus:ring-saffron outline-none active:scale-95"
                  aria-label={`Select ${t('offerings.multiple.title')} offering`}
                >
                  {t('offerings.multiple.cta')}
                </button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* World Peace Mission Banner */}
        <section className="py-24 bg-saffron overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 flex items-center justify-center">
            <h2 className="text-[20vw] font-serif font-black whitespace-nowrap select-none">{t('peace_mission.title')}</h2>
          </div>
          <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-midnight mb-6">
                {t('peace_mission.title')}
              </h2>
              <p className="text-midnight/80 text-lg font-light max-w-2xl mx-auto leading-relaxed italic">
                {t('peace_mission.p1')}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Gallery - Artistic Grid */}
        <section id="gallery" className="py-32 bg-theme-bg">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-24"
            >
              <span className="text-saffron text-xs font-bold uppercase tracking-[0.3em] mb-4 block">{t('nav.visions')}</span>
              <h2 className="text-5xl font-serif font-bold">{t('gallery_info.title')}</h2>
              <p className="text-stone-500 text-sm mt-4 tracking-[0.2em] uppercase">{t('gallery_info.subtitle')}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[600px] h-auto" role="list" aria-label="Gallery of sacred moments">
              <AnimatePresence>
                {galleryItems.map((item, i) => (
                  <motion.div 
                    key={`${item.url}-${i}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: (i % 4) * 0.1 }}
                    role="listitem" 
                    whileHover={{ scale: 0.98 }} 
                    className={`rounded-3xl overflow-hidden border border-theme-border relative group cursor-zoom-in
                      ${i % 5 === 0 ? 'md:col-span-8 aspect-video' : 'md:col-span-4 aspect-square'}`}
                    onClick={() => openLightbox(i)}
                  >
                    {item.type === 'video' ? (
                      <video 
                        src={item.url} 
                        className="w-full h-full object-cover transition-all duration-700"
                        muted 
                        loop 
                        playsInline
                        onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                        onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                      />
                    ) : (
                      <img 
                        src={item.url} 
                        alt={item.alt} 
                        className="w-full h-full object-cover transition-all duration-700"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-theme-bg/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-8 flex items-end">
                      <div>
                        <p className="text-theme-heading font-serif text-lg italic">{item.title}</p>
                        {item.location && (
                          <p className="text-stone-300 text-xs mt-1 uppercase tracking-wider">{item.location}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>

        <AnimatePresence>
          {activeLightboxItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-md p-4 md:p-10"
              role="dialog"
              aria-modal="true"
              aria-label="Expanded gallery media"
              onClick={closeLightbox}
            >
              <button
                onClick={closeLightbox}
                className="absolute top-5 right-5 p-3 rounded-full border border-white/20 text-white hover:border-saffron hover:text-saffron transition-colors"
                aria-label="Close media viewer"
              >
                <X className="w-6 h-6" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goPrevious();
                }}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full border border-white/20 text-white hover:border-saffron hover:text-saffron transition-colors"
                aria-label="View previous media"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full border border-white/20 text-white hover:border-saffron hover:text-saffron transition-colors"
                aria-label="View next media"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div
                className="w-full h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
                onTouchStart={handleLightboxTouchStart}
                onTouchMove={handleLightboxTouchMove}
                onTouchEnd={handleLightboxTouchEnd}
              >
                {activeLightboxItem.type === 'video' ? (
                  <video
                    src={activeLightboxItem.url}
                    className="max-h-[85vh] max-w-[92vw] rounded-2xl border border-white/10"
                    controls
                    autoPlay
                    playsInline
                  />
                ) : (
                  <img
                    src={activeLightboxItem.url}
                    alt={activeLightboxItem.alt}
                    className="max-h-[85vh] max-w-[92vw] object-contain rounded-2xl border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center px-4">
                <p className="text-white font-serif text-lg italic">{activeLightboxItem.title}</p>
                {activeLightboxItem.caption && (
                  <p className="text-white/80 text-sm mt-1 max-w-2xl">{activeLightboxItem.caption}</p>
                )}
                {activeLightboxItem.location && (
                  <p className="text-white/60 text-xs mt-1 uppercase tracking-widest">{activeLightboxItem.location}</p>
                )}
                <p className="text-white/60 text-xs mt-1">
                  {lightboxIndex! + 1} / {galleryItems.length}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* Testimonials - Echoes of Light */}
        <section id="testimonials" className="py-32 bg-theme-bg relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-theme-border to-transparent"></div>
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-24"
            >
              <span className="text-saffron text-xs font-bold uppercase tracking-[0.3em] mb-4 block">{t('nav.echoes')}</span>
              <h2 className="text-5xl font-serif font-bold">Voices of the Sanctuary</h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  quote: "A truly transformative experience. The 108 lights felt like a bridge to another world, bringing a profound sense of clarity.",
                  author: "Sarah J.",
                  location: "United Kingdom"
                },
                {
                  quote: "The attention to detail and the sacred atmosphere created by the team is unmatched. It's more than a service; it's a ritual.",
                  author: "David L.",
                  location: "Singapore"
                },
                {
                  quote: "Lighting a lamp in Lumbini through this sanctuary brought me a sense of peace I hadn't felt in years. Truly beautiful.",
                  author: "Maria K.",
                  location: "Germany"
                }
              ].map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="glass-card p-10 flex flex-col justify-between"
                >
                  <div>
                    <Quote className="w-8 h-8 text-saffron/30 mb-6" aria-hidden="true" />
                    <p className="text-theme-text font-light italic leading-relaxed mb-8">
                      "{t.quote}"
                    </p>
                  </div>
                  <div>
                    <p className="text-theme-heading font-serif text-lg">{t.author}</p>
                    <p className="text-stone-500 text-[10px] uppercase tracking-widest">{t.location}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact - Dark & Intimate */}
        <section id="contact" ref={contactRef} className="py-32 bg-theme-surface">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-24">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1 }}
              >
                <span className="text-saffron text-xs font-bold uppercase tracking-[0.3em] mb-6 block">{t('contact.label')}</span>
                <h2 className="text-5xl md:text-6xl font-serif font-bold mb-10">{t('contact.title_main')} <br /><span className="italic text-stone-500">{t('contact.title_sub')}</span></h2>
                <p className="text-theme-text text-lg font-light leading-relaxed mb-16 opacity-80">
                  {t('contact.description')}
                </p>
                
                <div className="space-y-12">
                  <div className="flex items-center gap-8 group">
                    <div className="w-16 h-16 rounded-full border border-theme-border flex items-center justify-center group-hover:border-saffron transition-colors">
                      <MapPin className="w-6 h-6 text-saffron" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-stone-500 mb-1">{t('contact.location_label')}</p>
                      <p className="text-theme-heading font-medium">{t('contact.location_value')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 group">
                    <a 
                      href={WHATSAPP_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-16 h-16 rounded-full border border-theme-border flex items-center justify-center group-hover:border-saffron transition-colors"
                    >
                      <Phone className="w-6 h-6 text-saffron" />
                    </a>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-stone-500 mb-1">{t('contact.whatsapp_label')}</p>
                      <a 
                        href={WHATSAPP_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-theme-heading font-medium hover:text-saffron transition-colors"
                      >
                        {t('contact.whatsapp_number')}
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, delay: 0.2 }}
                className="glass-card p-12" 
                aria-live="polite"
              >
                {formStatus === 'success' ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center py-12"
                  >
                    <Sparkles className="w-16 h-16 text-saffron mb-6 animate-pulse" aria-hidden="true" />
                    <h3 className="text-3xl font-serif font-bold mb-4">{t('contact.form.success_title')}</h3>
                    <p className="text-stone-500 font-light">{t('contact.form.success_p')}</p>
                    <button onClick={() => setFormStatus('idle')} className="mt-12 text-saffron text-xs font-bold uppercase tracking-widest hover:underline focus:ring-2 focus:ring-saffron outline-none">{t('contact.form.send_another')}</button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate className="space-y-8">
                    <div className="space-y-2">
                      <label htmlFor="full-name" className="text-[10px] uppercase tracking-[0.2em] text-stone-500">{t('contact.form.name')}</label>
                      <input 
                        id="full-name" 
                        name="full-name" 
                        required 
                        type="text" 
                        className={`w-full bg-transparent border-b py-4 focus:border-saffron outline-none transition-all text-theme-heading font-light ${formErrors.name ? 'border-crimson' : 'border-theme-border'}`} 
                        placeholder={t('contact.form.name')} 
                      />
                      {formErrors.name && <p className="text-[10px] text-crimson uppercase tracking-widest">{formErrors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] text-stone-500">{t('contact.form.email')}</label>
                      <input 
                        id="email" 
                        name="email"
                        required 
                        type="email" 
                        className={`w-full bg-transparent border-b py-4 focus:border-saffron outline-none transition-all text-theme-heading font-light ${formErrors.email ? 'border-crimson' : 'border-theme-border'}`} 
                        placeholder="email@example.com" 
                      />
                      {formErrors.email && <p className="text-[10px] text-crimson uppercase tracking-widest">{formErrors.email}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label htmlFor="package" className="text-[10px] uppercase tracking-[0.2em] text-stone-500">{t('contact.form.package')}</label>
                        <select 
                          id="package" 
                          name="package"
                          value={selectedPackage}
                          onChange={(e) => setSelectedPackage(e.target.value)}
                          className="w-full bg-transparent border-b border-theme-border py-4 focus:border-saffron outline-none transition-all text-theme-heading font-light appearance-none"
                        >
                          <option className="bg-theme-surface" value="">{t('offerings.single.title')}</option>
                          <option className="bg-theme-surface" value={t('offerings.single.title')}>{t('offerings.single.title')}</option>
                          <option className="bg-theme-surface" value={t('offerings.multiple.title')}>{t('offerings.multiple.title')}</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="contact-method" className="text-[10px] uppercase tracking-[0.2em] text-stone-500">{t('contact.form.contact_method')}</label>
                        <select id="contact-method" className="w-full bg-transparent border-b border-theme-border py-4 focus:border-saffron outline-none transition-all text-theme-heading font-light appearance-none">
                          <option className="bg-theme-surface">WhatsApp</option>
                          <option className="bg-theme-surface">{currentLang.code === 'zh' ? 'WeChat (微信)' : 'WeChat'}</option>
                          <option className="bg-theme-surface">Email</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-[10px] uppercase tracking-[0.2em] text-stone-500">{t('contact.form.message')}</label>
                      <textarea 
                        id="message" 
                        name="message"
                        required 
                        rows={3} 
                        value={formMessage}
                        onChange={(e) => setFormMessage(e.target.value)}
                        className={`w-full bg-transparent border-b py-4 focus:border-saffron outline-none transition-all text-theme-heading font-light resize-none ${formErrors.message ? 'border-crimson' : 'border-theme-border'}`} 
                        placeholder={t('contact.form.placeholder_intent')}
                      ></textarea>
                      {formErrors.message && <p className="text-[10px] text-crimson uppercase tracking-widest">{formErrors.message}</p>}
                    </div>
                    <button className="w-full py-6 bg-theme-heading text-theme-bg font-bold uppercase text-[10px] tracking-[0.3em] hover:bg-saffron hover:text-midnight transition-all focus:ring-2 focus:ring-saffron outline-none">
                      {formStatus === 'submitting' ? t('contact.form.sending') : t('contact.form.send')}
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-theme-bg py-20 border-t border-theme-border transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <div className="flex justify-center items-center gap-3 mb-12">
            <Flame className="w-6 h-6 text-saffron" aria-hidden="true" />
            <span className="text-xl font-serif font-bold tracking-[0.3em] text-theme-heading uppercase">LUMBINI LAMP HOUSE</span>
          </div>
          <div className="flex flex-wrap justify-center gap-12 mb-12">
            {navLinks.map(link => (
              <a key={link.name} href={link.href} className="text-[10px] uppercase tracking-[0.2em] text-stone-500 hover:text-theme-heading transition-colors">
                {t(`nav.${link.name.toLowerCase()}`)}
              </a>
            ))}
          </div>
          <div className="flex flex-col items-center gap-6 mb-12">
            <p className="text-stone-700 text-[10px] uppercase tracking-[0.2em]">
              {t('footer.copy', { year: new Date().getFullYear() })}
            </p>
            <div className="flex items-center gap-8">
              <a 
                href={WHATSAPP_LINK} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] uppercase tracking-[0.3em] text-stone-500 hover:text-saffron transition-colors flex items-center gap-2"
              >
                <Phone className="w-3 h-3" /> WhatsApp: {t('contact.whatsapp_number')}
              </a>
              <button 
                onClick={() => setIsAdminPanelOpen(true)}
                className="text-[8px] uppercase tracking-[0.3em] text-stone-800 hover:text-saffron transition-colors flex items-center gap-2"
              >
                <ShieldCheck className="w-3 h-3" /> Sanctuary Registry
              </button>
            </div>
          </div>
        </div>
      </footer>

      <SpiritualGuide />

      <AnimatePresence>
        {isAdminPanelOpen && (
          <AdminPanel onClose={() => setIsAdminPanelOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
