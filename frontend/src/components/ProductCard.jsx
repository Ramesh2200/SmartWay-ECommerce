import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { QuickViewModal } from './QuickViewModal';
import { ProductImage } from './ProductImage';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  if (!product) return null;

  const inWishlist = isInWishlist(product.id);
  const originalPrice = Math.round(product.price * 1.25);
  const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  return (
    <>
      <div className="product-card">
        {/* Image Wrap */}
        <div className="product-image-container">
          <Link to={`/products/${product.id}`} className="product-img-link" style={{ display: 'block', width: '100%' }}>
            <ProductImage
              src={product.image || product.imageUrl}
              alt={product.name}
              category={product.category}
              gallery={product.images || []}
              className="product-img"
              objectFit="contain"
            />
          </Link>

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <span className="badge-discount-tag">{discountPercent}% OFF</span>
          )}

          {/* Wishlist Heart Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product);
            }}
            className={`btn-wishlist-heart ${inWishlist ? 'active' : ''}`}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
          </button>

          {/* Quick View Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setQuickViewOpen(true);
            }}
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(14, 20, 36, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--radius-full)',
              padding: '0.4rem 0.85rem',
              color: '#fff',
              fontSize: 'var(--text-xs)',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              cursor: 'pointer',
              zIndex: 2,
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s ease'
            }}
            title="Quick View"
          >
            <Eye size={14} /> Quick View
          </button>
        </div>

        {/* Product Details */}
        <div className="product-body">
          <span className="product-category-text">{product.category || 'Gear'}</span>

          <h3 className="product-title-link">
            <Link to={`/products/${product.id}`}>{product.name}</Link>
          </h3>

          {/* Star Rating */}
          <div className="product-rating-row">
            <Star size={15} fill="#FBBF24" color="#FBBF24" />
            <span>{Number(product.rating || 4.5).toFixed(1)}</span>
            <span className="text-muted">({Math.floor((product.rating || 4.5) * 45)})</span>
          </div>

          {/* Price Row */}
          <div className="product-price-row">
            <span className="price-current">₹{Number(product.price).toLocaleString('en-IN')}</span>
            <span className="price-original">₹{originalPrice.toLocaleString('en-IN')}</span>
          </div>

          {/* Action Button */}
          <button
            onClick={() => addToCart(product, 1)}
            className="btn-add-cart-card"
          >
            <ShoppingCart size={16} /> Add to Cart
          </button>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
};
