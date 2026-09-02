import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingCart,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Share2,
  Package,
  Layers,
  ArrowRight,
  Sparkles,
  Lock,
  X,
  Plus,
  Minus
} from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Breadcrumb } from '../components/Breadcrumb';
import { ProductCard } from '../components/ProductCard';
import { DetailsSkeleton } from '../components/SkeletonLoader';
import { ProductImage } from '../components/ProductImage';

export const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, buyNow } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [prodRes, allRes] = await Promise.all([
          api.getProductById(id),
          api.getProducts({ limit: 120 })
        ]);

        if (prodRes && prodRes.success && prodRes.data) {
          setProduct(prodRes.data);
          setSelectedImage(prodRes.data.image || prodRes.data.imageUrl);
        } else {
          setProduct(null);
        }

        if (allRes && allRes.success && Array.isArray(allRes.data)) {
          setAllProducts(allRes.data);
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return <DetailsSkeleton />;
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#fff' }}>Product Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          The item you are looking for does not exist or has been removed.
        </p>
        <Link to="/products" className="btn btn-primary btn-lg">
          Explore Product Catalog <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const originalPrice = product.originalPrice || Math.round(product.price * 1.25);
  const discountPercent = product.discount || product.discount_percentage || Math.round(((originalPrice - product.price) / originalPrice) * 100);
  const savings = originalPrice - product.price;
  const relatedProducts = allProducts.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);

  const galleryImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image || product.imageUrl];

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    buyNow(product, quantity);
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      setLoginModalOpen(true);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard! 🔗', 'info');
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      <Breadcrumb
        items={[
          { label: 'Shop', link: '/products' },
          { label: product.category, link: `/products?category=${encodeURIComponent(product.category)}` },
          { label: product.name }
        ]}
      />

      <div className="product-details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '3.5rem', alignItems: 'start', marginTop: '1.5rem' }}>
        
        {/* LEFT: IMAGE GALLERY */}
        <div className="details-gallery-wrap" style={{ position: 'sticky', top: '120px' }}>
          <div
            className="main-image-display"
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1/1',
              borderRadius: 'var(--radius-2xl)',
              overflow: 'hidden',
              border: '1px solid var(--border-subtle)',
              background: 'radial-gradient(circle at 50% 50%, #172033 0%, #0D1424 100%)',
              boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6)'
            }}
          >
            <ProductImage
              src={selectedImage || product.image || product.imageUrl}
              alt={product.name}
              category={product.category}
              gallery={galleryImages}
              objectFit="contain"
            />
            {discountPercent > 0 && (
              <span className="badge-discount-tag" style={{ top: '16px', left: '16px', fontSize: '0.9rem', padding: '0.35rem 0.85rem' }}>
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnail Strip */}
          {galleryImages.length > 1 && (
            <div style={{ display: 'flex', gap: '0.85rem', marginTop: '1.25rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {galleryImages.map((imgUrl, idx) => {
                const isActive = (selectedImage === imgUrl) || (!selectedImage && idx === 0);
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(imgUrl)}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: 'var(--radius-lg)',
                      overflow: 'hidden',
                      border: isActive ? '2px solid var(--primary-light)' : '1px solid var(--border-subtle)',
                      background: '#0D1424',
                      cursor: 'pointer',
                      flexShrink: 0,
                      padding: '4px',
                      transform: isActive ? 'scale(1.05)' : 'scale(1)',
                      transition: 'all 0.25s ease',
                      boxShadow: isActive ? '0 0 15px rgba(99, 102, 241, 0.4)' : 'none'
                    }}
                    aria-label={`View gallery image ${idx + 1}`}
                  >
                    <img src={imgUrl} alt={`${product.name} thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: PRODUCT INFO & PURCHASE PANEL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* CATEGORY & BRAND BADGES */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link
              to={`/products?category=${encodeURIComponent(product.category)}`}
              className="badge-category"
              style={{ fontSize: '0.85rem', padding: '0.3rem 0.85rem', textDecoration: 'none', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-light)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: 'var(--radius-full)', fontWeight: 700 }}
            >
              {product.category.toUpperCase()}
            </Link>
            {product.brand && (
              <Link
                to={`/products?brand=${encodeURIComponent(product.brand)}`}
                style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 700 }}
              >
                • {product.brand}
              </Link>
            )}
            {product.sku && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                SKU: {product.sku}
              </span>
            )}
          </div>

          {/* PRODUCT NAME */}
          <h1 style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.6rem)', color: '#fff', fontWeight: 900, lineHeight: 1.2, margin: 0 }}>
            {product.name}
          </h1>

          {/* RATING & REVIEWS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(251, 191, 36, 0.15)', border: '1px solid rgba(251, 191, 36, 0.3)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < Math.floor(product.rating || 4.8) ? '#FBBF24' : 'none'}
                    color="#FBBF24"
                  />
                ))}
              </div>
              <span style={{ fontWeight: 800, color: '#FBBF24', fontSize: '0.95rem' }}>
                {Number(product.rating || 4.8).toFixed(1)}
              </span>
            </div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              <strong>{product.reviewCount || 320}</strong> verified customer reviews
            </span>
          </div>

          {/* PRICE & SAVINGS */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                <span style={{ fontSize: 'clamp(2rem, 3vw, 2.5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
                  ₹{Number(product.price).toLocaleString('en-IN')}
                </span>
                {originalPrice > product.price && (
                  <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)', textDecoration: 'line-through', fontWeight: 600 }}>
                    ₹{originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <span style={{ color: 'var(--success)', fontSize: '0.88rem', fontWeight: 700, marginTop: '0.3rem', display: 'block' }}>
                  You Save: ₹{savings.toLocaleString('en-IN')} ({discountPercent}% discount)
                </span>
              )}
            </div>

            {/* STOCK INDICATOR */}
            <div style={{ textAlign: 'right' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--success)',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  background: 'rgba(16, 185, 129, 0.12)',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}
              >
                <CheckCircle2 size={16} /> In Stock
              </span>
              <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {product.stock || product.stockQuantity || 45} units available
              </span>
            </div>
          </div>

          {/* DESCRIPTION */}
          <p style={{ color: '#CBD5E1', fontSize: '1.05rem', lineHeight: 1.7, margin: 0 }}>
            {product.description || 'Experience cutting-edge performance with genuine manufacturing quality, official warranty, and lightning-fast doorstep shipping.'}
          </p>

          {/* QUANTITY + CTA ACTION BUTTONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#E2E8F0' }}>Quantity:</span>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  height: '46px',
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ width: '42px', height: '100%', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>
                <span style={{ width: '46px', textAlign: 'center', fontWeight: 800, color: '#fff', fontSize: '1.05rem' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ width: '42px', height: '100%', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Wishlist & Share Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginLeft: 'auto' }}>
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`btn btn-secondary ${inWishlist ? 'active' : ''}`}
                  style={{ height: '46px', padding: '0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Heart size={18} fill={inWishlist ? '#EC4899' : 'none'} color={inWishlist ? '#EC4899' : 'currentColor'} />
                  <span>{inWishlist ? 'Saved' : 'Wishlist'}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="btn btn-secondary"
                  style={{ height: '46px', padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Share product"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
              <button
                onClick={handleAddToCart}
                className="btn btn-secondary btn-lg"
                style={{ height: '52px', fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}
              >
                <ShoppingCart size={20} /> Add to Cart
              </button>

              <button
                onClick={handleBuyNow}
                className="btn btn-primary btn-lg"
                style={{
                  height: '52px',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.6rem',
                  background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
                  boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)'
                }}
              >
                <Zap size={20} /> Buy Now
              </button>
            </div>
          </div>

          {/* TRUST INDICATOR CARDS */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '0.85rem',
              marginTop: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#E2E8F0', fontSize: '0.88rem', fontWeight: 600 }}>
              <Truck size={20} color="var(--primary-light)" />
              <span>Fast Express Delivery</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#E2E8F0', fontSize: '0.88rem', fontWeight: 600 }}>
              <RotateCcw size={20} color="var(--primary-light)" />
              <span>7-Day Easy Returns</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#E2E8F0', fontSize: '0.88rem', fontWeight: 600 }}>
              <ShieldCheck size={20} color="var(--primary-light)" />
              <span>100% Genuine Product</span>
            </div>
          </div>

        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <div style={{ marginTop: '5rem', paddingTop: '3rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <span className="hero-badge-pill" style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                <Sparkles size={14} /> RECOMMENDATIONS
              </span>
              <h2 style={{ fontSize: '1.75rem', color: '#fff', fontWeight: 800, margin: 0 }}>
                Customers Also Viewed
              </h2>
            </div>
            <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="btn btn-secondary btn-sm">
              View All {product.category} →
            </Link>
          </div>

          <div className="products-grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* LOGIN REQUIRED MODAL (FOR BUY NOW AS GUEST) */}
      {loginModalOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setLoginModalOpen(false)} style={{ zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div
            className="auth-card"
            style={{ maxWidth: '480px', width: '100%', padding: '2.5rem', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLoginModalOpen(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  color: 'var(--primary-light)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}
              >
                <Lock size={28} />
              </div>
              <h3 style={{ fontSize: '1.6rem', color: '#fff', fontWeight: 800, margin: '0 0 0.5rem' }}>
                Sign In to Continue
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Please sign in or create an account to complete your purchase of <strong style={{ color: '#fff' }}>"{product.name}"</strong>.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => navigate('/login?redirect=/checkout')}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', height: '48px', fontSize: '1rem', fontWeight: 700 }}
              >
                Sign In <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate('/register?redirect=/checkout')}
                className="btn btn-secondary btn-lg"
                style={{ width: '100%', height: '48px', fontSize: '1rem', fontWeight: 700 }}
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
