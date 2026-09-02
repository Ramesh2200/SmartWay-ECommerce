import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Heart,
  ArrowRight,
  ShieldCheck,
  Truck,
  Percent,
  Tag,
  ShoppingBag,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useCart, FREE_SHIPPING_THRESHOLD } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Breadcrumb } from '../components/Breadcrumb';
import { EmptyState } from '../components/EmptyState';
import { ProductImage } from '../components/ProductImage';

export const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    totalItems,
    isFreeShipping,
    shippingFee,
    amountNeededForFreeShipping,
    freeShippingProgress,
    discountAmount,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    estimatedTax,
    grandTotal
  } = useCart();

  const { toggleWishlist } = useWishlist();
  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (applyPromoCode(couponInput)) {
      setCouponInput('');
    }
  };

  const handleMoveToWishlist = (item) => {
    toggleWishlist(item);
    removeFromCart(item.id);
  };

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '2rem 0 4rem' }}>
        <Breadcrumb items={[{ label: 'Shopping Cart' }]} />
        <EmptyState
          icon={ShoppingBag}
          title="Your Shopping Cart is Empty"
          subtitle="Explore our top rated electronics and start adding your favorites!"
          actionText="Start Shopping"
          actionLink="/products"
        />
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <Breadcrumb items={[{ label: 'Shopping Cart' }]} />

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '0.5rem 0 1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)' }}>Shopping Cart</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            You have <strong>{totalItems}</strong> items in your cart
          </p>
        </div>
        <button onClick={clearCart} className="btn-clear-filter" style={{ color: 'var(--danger)' }}>
          Clear All Items
        </button>
      </div>

      <div className="cart-page-layout">
        {/* LEFT: ITEMS LIST */}
        <div>
          {/* FREE SHIPPING PROGRESS METER */}
          <div className="shipping-meter-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--text-sm)', fontWeight: 700 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isFreeShipping ? 'var(--success)' : '#fff' }}>
                <Truck size={18} /> {isFreeShipping ? 'You unlocked FREE Express Shipping! 🎉' : `Add ₹${amountNeededForFreeShipping.toLocaleString('en-IN')} more for FREE shipping`}
              </span>
              <span style={{ color: 'var(--primary-light)' }}>{freeShippingProgress}%</span>
            </div>
            <div className="shipping-meter-track" style={{ marginTop: '0.75rem' }}>
              <div className="shipping-meter-fill" style={{ width: `${freeShippingProgress}%` }} />
            </div>
          </div>

          {/* ITEM CARDS */}
          <div className="cart-items-list">
            {cart.map((item) => (
              <div key={item.id} className="cart-item-card">
                <div style={{ width: '90px', height: '90px', flexShrink: 0, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <ProductImage
                    src={item.image || item.imageUrl}
                    alt={item.name}
                    category={item.category}
                    gallery={item.images || []}
                    objectFit="contain"
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--primary-light)', fontWeight: 700 }}>
                    {item.category || 'Gear'}
                  </span>
                  <Link to={`/products/${item.id}`} style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem' }}>
                    {item.name}
                  </Link>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                    ₹{Number(item.price).toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.85rem' }}>
                  <div className="quantity-control-group" style={{ height: '42px' }}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="btn-qty" style={{ width: '36px' }}>
                      -
                    </button>
                    <span className="qty-val-display" style={{ width: '36px', fontSize: '0.95rem' }}>
                      {item.quantity}
                    </span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="btn-qty" style={{ width: '36px' }}>
                      +
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={() => handleMoveToWishlist(item)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: 'var(--text-xs)' }}
                      title="Move to Wishlist"
                    >
                      <Heart size={14} /> Save for later
                    </button>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: 'var(--text-xs)' }}
                      title="Remove item"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: ORDER SUMMARY */}
        <div className="cart-summary-card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: '#fff' }}>Order Summary</h3>

          {/* Coupon Code Input */}
          <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Tag size={16} style={{ position: 'absolute', left: '10px', top: '13px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Promo code (e.g. NEXUS10)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 0.75rem 0 2rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  fontSize: 'var(--text-sm)'
                }}
              />
            </div>
            <button type="submit" className="btn btn-secondary btn-sm" style={{ padding: '0 1rem' }}>
              Apply
            </button>
          </form>

          {appliedPromo && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid var(--success)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: 'var(--text-xs)', color: 'var(--success)' }}>
              <span>Coupon <strong>{appliedPromo.code}</strong> Applied ({appliedPromo.discountPercent}%)</span>
              <button onClick={removePromoCode} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontWeight: 700 }}>
                Remove
              </button>
            </div>
          )}

          <div className="summary-row">
            <span>Subtotal ({totalItems} items)</span>
            <span style={{ fontWeight: 700, color: '#fff' }}>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>

          {discountAmount > 0 && (
            <div className="summary-row" style={{ color: 'var(--success)' }}>
              <span>Discount ({appliedPromo?.code})</span>
              <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className="summary-row">
            <span>Delivery Fee</span>
            <span style={{ color: 'var(--success)', fontWeight: 700 }}>
              FREE
            </span>
          </div>

          <div className="summary-row" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>Includes GST (18%)</span>
            <span>₹{estimatedTax.toLocaleString('en-IN')}</span>
          </div>

          <div className="summary-total-row">
            <span>Grand Total</span>
            <span style={{ color: 'var(--primary-light)' }}>₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>

          <button
            onClick={() => {
              if (isAuthenticated) {
                navigate('/checkout');
              } else {
                showToast('Please sign in to proceed to checkout', 'info');
                navigate('/login?redirect=/checkout');
              }
            }}
            className="btn btn-primary btn-block btn-lg"
          >
            Proceed to Checkout <ArrowRight size={18} />
          </button>

          <Link
            to="/products"
            style={{ display: 'block', textAlign: 'center', marginTop: '1rem', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}
          >
            ← Continue Shopping
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1.5rem', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            <ShieldCheck size={14} style={{ color: 'var(--success)' }} />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};
