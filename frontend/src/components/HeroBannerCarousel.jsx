import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Zap,
  Flame,
  ShoppingBag
} from 'lucide-react';
import heroTech from '../assets/banners/hero-tech.jpg';
import heroShowcase from '../assets/banners/hero-showcase.jpg';
import { IMAGES } from '../assets/images';

export const HeroBannerCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const slides = [
    {
      id: 'tech',
      bg: heroTech,
      badge: 'AI GENERATED TECH COLLECTION',
      badgeIcon: Sparkles,
      badgeColor: '#38BDF8',
      titleHighlight: 'Amazing Prices',
      titlePrefix: 'Shop the Latest Flagship Products at ',
      subtitle:
        'Explore top-tier laptops, wireless audio, smartphones, and smart wearables with guaranteed authenticity and lightning fast delivery to your doorstep.',
      primaryBtnText: 'Shop Tech Deals',
      primaryBtnLink: '/products?category=Electronics',
      secondaryBtnText: 'Explore Categories',
      secondaryBtnLink: '/products',
      tag: 'FLAGSHIP GADGETS'
    },
    {
      id: 'showcase',
      bg: heroShowcase,
      badge: 'OFFICIAL SMARTWAY SHOWCASE',
      badgeIcon: Zap,
      badgeColor: '#F43F5E',
      titleHighlight: 'Master Catalog',
      titlePrefix: 'Explore 101+ Products Across Our ',
      subtitle:
        'Full-stack customer e-commerce platform with instant email OTP verification, smart cart management, and seamless live order tracking.',
      primaryBtnText: 'Explore Catalog',
      primaryBtnLink: '/products',
      secondaryBtnText: 'Shop Laptops',
      secondaryBtnLink: '/products?category=Laptops',
      tag: 'MASTER CATALOG'
    },
    {
      id: 'fashion',
      bg: IMAGES.categories?.Fashion?.banner || IMAGES.heroBanner,
      badge: 'TRENDING FASHION & LIFESTYLE',
      badgeIcon: Flame,
      badgeColor: '#EC4899',
      titleHighlight: 'Designer Apparel',
      titlePrefix: 'Elevate Your Everyday Style With ',
      subtitle:
        'Discover the season’s hottest sneakers, designer accessories, chronographs, and curated wardrobe essentials at special launch discounts.',
      primaryBtnText: 'Shop Fashion',
      primaryBtnLink: '/products?category=Fashion',
      secondaryBtnText: 'Accessories',
      secondaryBtnLink: '/products?category=Accessories',
      tag: 'LIFESTYLE'
    }
  ];

  const totalSlides = slides.length;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => {
      nextSlide();
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentSlide, isPaused]);

  const slide = slides[currentSlide];
  const BadgeIcon = slide.badgeIcon;

  return (
    <section className="container" style={{ padding: '1rem 1.5rem 0' }}>
      <div
        className="hero-section"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{
          backgroundImage: `url(${slide.bg})`,
          transition: 'background-image 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative'
        }}
      >
        {/* Dark Cinematic Gradient Overlay */}
        <div className="hero-overlay-bg" />

        {/* Floating Left/Right Arrow Navigation */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous Slide"
          style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          className="hover:scale-110"
        >
          <ChevronLeft size={22} />
        </button>

        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next Slide"
          style={{
            position: 'absolute',
            right: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          className="hover:scale-110"
        >
          <ChevronRight size={22} />
        </button>

        {/* Main Content Grid */}
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-grid">
            <div className="hero-text-content">
              {/* Badge Pill */}
              <div
                className="hero-badge-pill"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  borderColor: `${slide.badgeColor}40`,
                  background: `${slide.badgeColor}15`,
                  color: slide.badgeColor
                }}
              >
                <BadgeIcon size={16} /> {slide.badge}
              </div>

              {/* Title */}
              <h1 className="hero-title" style={{ transition: 'all 0.3s ease' }}>
                {slide.titlePrefix}
                <span className="gradient-text">{slide.titleHighlight}</span>
              </h1>

              {/* Subtitle */}
              <p className="hero-subtitle">
                {slide.subtitle}
              </p>

              {/* CTA Buttons */}
              <div className="hero-cta-group">
                <Link to={slide.primaryBtnLink} className="btn btn-primary btn-lg">
                  {slide.primaryBtnText} <ArrowRight size={18} />
                </Link>
                <Link to={slide.secondaryBtnLink} className="btn btn-secondary btn-lg">
                  {slide.secondaryBtnText}
                </Link>
              </div>
            </div>

            {/* Customer Guarantee Card */}
            <div className="hero-visual-card desktop-only">
              <div className="hero-sec-card-header">
                <div className="hero-sec-icon-wrap">
                  <ShieldCheck size={30} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.2rem' }}>
                    Shop with Confidence
                  </h3>
                  <span style={{ color: 'var(--success)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
                    100% Genuine Products Guarantee
                  </span>
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(0,0,0,0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div className="hero-feature-checklist">
                  <div className="hero-checklist-item">
                    <CheckCircle2 size={16} /> Official manufacturer warranty on all items
                  </div>
                  <div className="hero-checklist-item">
                    <CheckCircle2 size={16} /> Fast and insured express shipping
                  </div>
                  <div className="hero-checklist-item">
                    <CheckCircle2 size={16} /> 7-Day hassle-free return & replacement
                  </div>
                  <div className="hero-checklist-item">
                    <CheckCircle2 size={16} /> Secure and encrypted checkout protection
                  </div>
                </div>
              </div>

              {/* Slide Counter / Status Badge */}
              <div
                style={{
                  marginTop: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.6)'
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShoppingBag size={14} style={{ color: slide.badgeColor }} />
                  Featured Banner: <strong style={{ color: '#fff' }}>{slide.tag}</strong>
                </span>
                <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
                  0{currentSlide + 1} / 0{totalSlides}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Carousel Dot Indicators */}
        <div
          style={{
            position: 'absolute',
            bottom: '1.25rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}
        >
          {slides.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              style={{
                width: currentSlide === idx ? '32px' : '9px',
                height: '9px',
                borderRadius: '9999px',
                background: currentSlide === idx ? '#38BDF8' : 'rgba(255, 255, 255, 0.35)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                padding: 0
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
