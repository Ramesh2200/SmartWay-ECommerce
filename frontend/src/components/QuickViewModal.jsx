import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Star, Heart, ShoppingCart, Zap, CheckCircle2, Truck, ShieldCheck, Eye, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

import { ProductImage } from './ProductImage';

export const QuickViewModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const inWishlist = isInWishlist(product.id);
  const originalPrice = Math.round(product.price * 1.25);
  const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  const handleBuyNow = () => {
    addToCart(product, quantity);
    onClose();
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      showToast('Please sign in to proceed to checkout', 'info');
      navigate('/login?redirect=/checkout');
    }
  };

  return (
    <div className="mobile-drawer-overlay" onClick={onClose} style={{ zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div
        className="auth-card"
        style={{ maxWidth: '850px', width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
          {/* Product Image */}
          <div style={{ position: 'relative', width: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
            <ProductImage
              src={product.image || product.imageUrl}
              alt={product.name}
              category={product.category}
              gallery={product.images || []}
              objectFit="contain"
            />
            {discountPercent > 0 && (
              <span className="badge-discount-tag" style={{ top: '12px', left: '12px' }}>
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Product Info */}
          <div>
            <span className="product-category-text">{product.category}</span>
            <h2 style={{ fontSize: '1.5rem', color: '#fff', margin: '0.35rem 0 0.75rem' }}>{product.name}</h2>

            {/* Rating */}
            <div className="product-rating-row" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < Math.floor(product.rating || 4.5) ? '#FBBF24' : 'none'}
                    color="#FBBF24"
                  />
                ))}
              </div>
              <span>{Number(product.rating || 4.5).toFixed(1)}</span>
              <span className="text-muted">({Math.floor((product.rating || 4.5) * 48)} reviews)</span>
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', margin: '1rem 0 1.25rem' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff' }}>
                ₹{Number(product.price).toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {product.description || 'Premium genuine product with official manufacturer warranty and fast doorstep shipping.'}
            </p>

            {/* Stock indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)', fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: '1.5rem' }}>
              <CheckCircle2 size={16} /> In Stock ({product.stock || 25} available)
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <div className="quantity-control-group" style={{ height: '46px' }}>
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="btn-qty" style={{ width: '38px' }}>-</button>
                <span className="qty-val-display" style={{ width: '38px' }}>{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)} className="btn-qty" style={{ width: '38px' }}>+</button>
              </div>

              <button
                onClick={() => { addToCart(product, quantity); onClose(); }}
                className="btn btn-primary"
                style={{ flex: 1, minWidth: '140px' }}
              >
                <ShoppingCart size={18} /> Add to Cart
              </button>

              <button
                onClick={handleBuyNow}
                className="btn btn-hot"
                style={{ flex: 1, minWidth: '120px' }}
              >
                <Zap size={18} /> Buy Now
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`btn-wishlist-heart ${inWishlist ? 'active' : ''}`}
                style={{ position: 'static', width: '46px', height: '46px' }}
                title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>

            <Link
              to={`/products/${product.id}`}
              onClick={onClose}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-light)', fontSize: 'var(--text-sm)', fontWeight: 700 }}
            >
              View Full Product Details <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
