import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Smartphone,
  Headphones,
  Laptop,
  Watch,
  Grid,
  Flame,
  CheckCircle2,
  Send,
  Truck,
  RotateCcw,
  CreditCard
} from 'lucide-react';
import { api } from '../services/api';
import { IMAGES } from '../assets/images';
import { ProductCard } from '../components/ProductCard';
import { CategoryCard } from '../components/CategoryCard';
import { FlashSaleSection } from '../components/FlashSaleSection';
import { PromotionalBanners } from '../components/PromotionalBanners';
import { BenefitsStrip } from '../components/BenefitsStrip';
import { ProductSkeletonGrid } from '../components/SkeletonLoader';
import { useToast } from '../context/ToastContext';

export const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.getProducts();
        if (res.success && res.data) {
          setProducts(res.data);
        }
      } catch (err) {
        console.error('Error fetching home products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail && newsletterEmail.includes('@')) {
      showToast('Thank you for subscribing to SmartWay newsletter! 🎉', 'success');
      setNewsletterEmail('');
    } else {
      showToast('Please enter a valid email address', 'warning');
    }
  };

  const categories = [
    { name: 'Electronics', icon: Smartphone, image: IMAGES.categories.Electronics.image, desc: 'Flagship 5G & MacBooks', path: '/products?category=Electronics' },
    { name: 'Fashion', icon: Sparkles, image: IMAGES.categories.Fashion.image, desc: 'Designer Apparel & Sneakers', path: '/products?category=Fashion' },
    { name: 'Home & Living', icon: Grid, image: IMAGES.categories['Home & Living'].image, desc: 'Furniture & Smart Living', path: '/products?category=Home%20%26%20Living' },
    { name: 'Beauty & Personal Care', icon: Sparkles, image: IMAGES.categories['Beauty & Personal Care'].image, desc: 'Luxury Skincare & Perfumes', path: '/products?category=Beauty%20%26%20Personal%20Care' },
    { name: 'Sports & Outdoors', icon: Flame, image: IMAGES.categories['Sports & Outdoors'].image, desc: 'Marathon Shoes & Fitness', path: '/products?category=Sports%20%26%20Outdoors' },
    { name: 'Accessories', icon: Watch, image: IMAGES.categories.Accessories.image, desc: 'Watches, Jewelry & Leather', path: '/products?category=Accessories' }
  ];

  const featuredProducts = products.slice(0, 4);
  const trendingProducts = products.slice(15, 19).length ? products.slice(15, 19) : products.slice(4, 8);
  const bestSellers = products.slice(30, 34).length ? products.slice(30, 34) : products.slice(0, 4);

  return (
    <div className="home-page-container">
      {/* 1. HERO SECTION */}
      <section className="container" style={{ padding: '1rem 1.5rem 0' }}>
        <div className="hero-section" style={{ backgroundImage: `url(${IMAGES.heroTech})` }}>
          <div className="hero-overlay-bg" />
          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
            <div className="hero-grid">
              <div className="hero-text-content">
                <div className="hero-badge-pill">
                  <Sparkles size={16} /> Discover Something You'll Love
                </div>
                <h1 className="hero-title">
                  Shop the Latest Products at <span className="gradient-text">Amazing Prices</span>
                </h1>
                <p className="hero-subtitle">
                  Explore top-tier laptops, wireless audio, smartphones, and smart wearables with guaranteed authenticity and lightning fast delivery to your doorstep.
                </p>
                <div className="hero-cta-group">
                  <Link to="/products" className="btn btn-primary btn-lg">
                    Shop Now <ArrowRight size={18} />
                  </Link>
                  <Link to="/products?category=Smartphones" className="btn btn-secondary btn-lg">
                    Explore Categories
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

                <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border-subtle)' }}>
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
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES GRID */}
      <section className="section-block">
        <div className="container">
          <div className="section-header-wrap">
            <div>
              <div className="section-tag">POPULAR COLLECTIONS</div>
              <h2 className="section-heading">Browse by Category</h2>
            </div>
            <Link to="/products" className="btn btn-secondary btn-sm">
              All Categories <ArrowRight size={14} />
            </Link>
          </div>

          <div className="categories-grid">
            {categories.map((cat, idx) => (
              <CategoryCard key={idx} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* 3. FLASH SALE SECTION */}
      <section className="section-block" style={{ padding: '0.5rem 0' }}>
        <div className="container">
          {loading ? (
            <ProductSkeletonGrid count={4} />
          ) : (
            <FlashSaleSection products={products} />
          )}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS */}
      <section className="section-block">
        <div className="container">
          <div className="section-header-wrap">
            <div>
              <div className="section-tag">HANDPICKED DEALS</div>
              <h2 className="section-heading">Featured Products</h2>
            </div>
            <Link to="/products" className="btn btn-secondary btn-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <ProductSkeletonGrid count={4} />
          ) : (
            <div className="products-grid">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. MULTIPLE COLORFUL PROMOTIONAL BANNERS */}
      <div className="container">
        <PromotionalBanners />
      </div>

      {/* 6. TRENDING PRODUCTS */}
      <section className="section-block">
        <div className="container">
          <div className="section-header-wrap">
            <div>
              <div className="section-tag">HOT RIGHT NOW</div>
              <h2 className="section-heading">
                Trending Electronics <Flame size={24} style={{ color: '#F97316', display: 'inline', verticalAlign: 'middle' }} />
              </h2>
            </div>
            <Link to="/products?category=Audio" className="btn btn-secondary btn-sm">
              Explore Trending <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <ProductSkeletonGrid count={4} />
          ) : (
            <div className="products-grid">
              {trendingProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. BEST SELLERS */}
      <section className="section-block">
        <div className="container">
          <div className="section-header-wrap">
            <div>
              <div className="section-tag">TOP CUSTOMER PICKS</div>
              <h2 className="section-heading">Best Sellers</h2>
            </div>
            <Link to="/products" className="btn btn-secondary btn-sm">
              See Best Sellers <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <ProductSkeletonGrid count={4} />
          ) : (
            <div className="products-grid">
              {bestSellers.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 8. CUSTOMER BENEFITS STRIP */}
      <div className="container">
        <BenefitsStrip />
      </div>

      {/* 9. NEWSLETTER SECTION */}
      <div className="container">
        <section className="newsletter-section" style={{ backgroundImage: `url(${IMAGES.newsletterBg})` }}>
          <div className="newsletter-overlay" />
          <div className="newsletter-inner">
            <span className="hero-badge-pill" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}>
              <Sparkles size={14} /> EXCLUSIVE PRIVILEGES
            </span>
            <h2 className="newsletter-title">Stay in the Loop</h2>
            <p className="newsletter-sub">
              Get exclusive offers, new arrival announcements, and special discount codes delivered straight to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email address..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="newsletter-input"
                required
              />
              <button type="submit" className="btn btn-primary btn-lg">
                Subscribe <Send size={16} />
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};
