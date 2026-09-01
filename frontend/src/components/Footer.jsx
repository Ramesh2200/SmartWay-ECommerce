import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Mail, Phone, MapPin, Heart, Send, CheckCircle2, Truck, CreditCard, Headphones } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const { showToast } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      showToast('Thank you for subscribing to SmartWay newsletter! 🎉', 'success');
      setEmail('');
    } else {
      showToast('Please enter a valid email address', 'warning');
    }
  };

  return (
    <footer style={{ background: '#080C14', borderTop: '1px solid var(--border-subtle)', marginTop: 'auto', paddingTop: '4rem', paddingBottom: '2rem' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '3rem', marginBottom: '3.5rem' }}>
          {/* Col 1: Brand Info */}
          <div>
            <Link to="/" className="brand-logo" style={{ marginBottom: '1.25rem' }}>
              <div className="brand-icon-box">
                <ShoppingBag size={22} />
              </div>
              <div className="brand-text">
                <span className="brand-title">Smart<span className="gradient-text">Way</span></span>
              </div>
            </Link>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Your trusted destination for flagship electronics, audio gear, laptops, and smart lifestyle products with fast and secure doorstep delivery.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span className="hero-badge-pill" style={{ margin: 0, padding: '0.35rem 0.75rem', fontSize: '0.75rem', color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                <ShieldCheck size={12} /> 100% Genuine
              </span>
              <span className="hero-badge-pill" style={{ margin: 0, padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderColor: 'var(--border-subtle)', color: '#fff' }}>
                <Truck size={12} /> Fast Delivery
              </span>
            </div>
          </div>

          {/* Col 2: Shop Categories */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.25rem' }}>Shop</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: 'var(--text-sm)' }}>
              <li><Link to="/products?category=Smartphones" style={{ color: 'var(--text-muted)' }}>Smartphones</Link></li>
              <li><Link to="/products?category=Audio" style={{ color: 'var(--text-muted)' }}>Audio & Headphones</Link></li>
              <li><Link to="/products?category=Laptops" style={{ color: 'var(--text-muted)' }}>Laptops & Computers</Link></li>
              <li><Link to="/products?category=Wearables" style={{ color: 'var(--text-muted)' }}>Smartwatches & Wearables</Link></li>
              <li><Link to="/products?category=Accessories" style={{ color: 'var(--text-muted)' }}>Tech Accessories</Link></li>
              <li><Link to="/products?deals=true" style={{ color: '#F97316', fontWeight: 700 }}>Special Deals 🔥</Link></li>
            </ul>
          </div>

          {/* Col 3: Customer Service & Help */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.25rem' }}>Customer Service</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: 'var(--text-sm)' }}>
              <li><Link to="/orders" style={{ color: 'var(--text-muted)' }}>Track My Order</Link></li>
              <li><Link to="/wishlist" style={{ color: 'var(--text-muted)' }}>My Wishlist</Link></li>
              <li><Link to="/cart" style={{ color: 'var(--text-muted)' }}>Shopping Cart</Link></li>
              <li><Link to="/profile" style={{ color: 'var(--text-muted)' }}>Account Settings</Link></li>
              <li><span style={{ color: 'var(--text-muted)' }}>Shipping & Delivery</span></li>
              <li><span style={{ color: 'var(--text-muted)' }}>Returns & Refunds</span></li>
            </ul>
          </div>

          {/* Col 4: Newsletter & Stay Connected */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.85rem' }}>Stay in the Loop</h4>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Subscribe to receive exclusive deals, new product launches, and seasonal discounts.
            </p>
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="email"
                placeholder="Enter your email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  flex: 1,
                  height: '46px',
                  padding: '0 1rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  fontSize: 'var(--text-sm)'
                }}
                required
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0 1.15rem' }}>
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          <div>&copy; {new Date().getFullYear()} SmartWay. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <span>Privacy Policy</span>
            <span>Terms & Conditions</span>
            <span>Customer Protection</span>
            <span>Security Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
