import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Percent, Zap } from 'lucide-react';
import { IMAGES } from '../assets/images';

export const PromotionalBanners = () => {
  const banners = [
    {
      bg: IMAGES.promos.megaSale.bg,
      badge: 'MEGA DEAL • UP TO 40% OFF',
      title: 'Next-Gen Laptops & Pro Displays',
      subtitle: 'Experience extreme performance with Apple M3 & UltraSharp displays.',
      link: '/products?category=Laptops',
      cta: 'Shop Laptops'
    },
    {
      bg: IMAGES.promos.audioSeason.bg,
      badge: 'STUDIO SOUND • SAVE ₹5,000',
      title: 'Flagship Noise Cancelling Audio',
      subtitle: 'Immerse in pure acoustic depth with Sony & Bose premium sound.',
      link: '/products?category=Audio',
      cta: 'Explore Audio'
    }
  ];

  return (
    <section className="promo-banner-grid">
      {banners.map((b, idx) => (
        <div
          key={idx}
          className="promo-banner-card"
          style={{ backgroundImage: `url(${b.bg})` }}
        >
          <div className="promo-card-overlay" />
          <div className="promo-card-content">
            <span className="hero-badge-pill" style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
              <Zap size={13} /> {b.badge}
            </span>
            <h3 style={{ fontSize: '1.75rem', color: '#fff', marginBottom: '0.5rem', lineHeight: 1.25 }}>
              {b.title}
            </h3>
            <p style={{ color: '#CBD5E1', fontSize: 'var(--text-sm)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {b.subtitle}
            </p>
            <Link to={b.link} className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}>
              {b.cta} <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      ))}
    </section>
  );
};
