import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, AlertCircle, RefreshCw, ShoppingBag, Eye, EyeOff, ShieldCheck, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();

  const queryParams = new URLSearchParams(location.search);
  const redirectTarget = queryParams.get('redirect') || '/products';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      return setError('Please enter both your email address and password');
    }

    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        showToast('Welcome back to SmartWay!', 'success');
        navigate(redirectTarget);
      } else {
        setError(res.message || 'Invalid email or password credentials. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.5rem',
        position: 'relative',
        background: 'radial-gradient(ellipse at top, #1E1B4B 0%, #0B0F19 60%, #030712 100%)',
        overflow: 'hidden'
      }}
    >
      {/* Subtle Background Pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.6,
          pointerEvents: 'none'
        }}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          maxWidth: '1000px',
          width: '100%',
          borderRadius: 'var(--radius-2xl)',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          zIndex: 1
        }}
      >
        {/* LEFT: BRAND & MARKETING SHOWCASE */}
        <div
          style={{
            position: 'relative',
            padding: '3.5rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.4) 0%, rgba(147, 51, 234, 0.2) 100%), url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=85) center/cover no-repeat',
            minHeight: '480px'
          }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)' }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
                }}
              >
                <ShoppingBag size={22} color="#fff" />
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#fff' }}>
                Smart<span style={{ color: 'var(--primary-light)' }}>Way</span>
              </span>
            </div>

            <span className="hero-badge-pill" style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem', marginBottom: '1rem' }}>
              <Sparkles size={14} /> OFFICIAL STORE
            </span>

            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.35rem)', color: '#fff', fontWeight: 900, lineHeight: 1.2, marginTop: '0.75rem' }}>
              Welcome Back
            </h2>
            <p style={{ color: '#E2E8F0', fontSize: '1rem', lineHeight: 1.6, marginTop: '0.5rem' }}>
              Your shopping journey continues here. Sign in to access your curated orders, saved wishlist, and exclusive member discounts.
            </p>
          </div>

          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#CBD5E1', fontSize: '0.9rem' }}>
              <CheckCircle2 size={18} color="var(--success)" />
              <span>100% Secure authentication</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#CBD5E1', fontSize: '0.9rem' }}>
              <CheckCircle2 size={18} color="var(--success)" />
              <span>Instant order tracking & wishlist sync</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#CBD5E1', fontSize: '0.9rem' }}>
              <CheckCircle2 size={18} color="var(--success)" />
              <span>Official 1-Year warranty coverage</span>
            </div>
          </div>
        </div>

        {/* RIGHT: LOGIN FORM CARD */}
        <div style={{ padding: '3.5rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.6rem', color: '#fff', fontWeight: 800, margin: 0 }}>Sign In</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.35rem' }}>
              Enter your credentials to continue
            </p>
          </div>

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid var(--danger)',
                borderRadius: 'var(--radius-md)',
                color: '#FCA5A5',
                fontSize: '0.88rem',
                marginBottom: '1.5rem'
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label htmlFor="loginEmail" style={{ fontSize: '0.88rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '0.4rem', display: 'block' }}>
                Email Address
              </label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  id="loginEmail"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ height: '46px', fontSize: '0.95rem' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label htmlFor="loginPassword" style={{ fontSize: '0.88rem', fontWeight: 700, color: '#E2E8F0', margin: 0 }}>
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  style={{ fontSize: '0.82rem', color: 'var(--primary-light)', fontWeight: 700, textDecoration: 'none' }}
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <Lock size={18} className="input-icon" />
                <input
                  id="loginPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ height: '46px', fontSize: '0.95rem', paddingRight: '2.75rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem', height: '48px', fontSize: '1rem', fontWeight: 700 }}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="spin-animation" /> Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* QUICK 1-CLICK DEMO LOGIN BUTTON */}
            <button
              type="button"
              onClick={async () => {
                setEmail('demo@smartway.com');
                setPassword('password123');
                setLoading(true);
                setError('');
                try {
                  const res = await login('demo@smartway.com', 'password123');
                  if (res.success) {
                    showToast('Welcome to SmartWay E-Commerce!', 'success');
                    navigate(redirectTarget);
                  }
                } catch {
                  showToast('Welcome to SmartWay E-Commerce!', 'success');
                  navigate(redirectTarget);
                } finally {
                  setLoading(false);
                }
              }}
              className="btn btn-secondary"
              style={{
                width: '100%',
                height: '42px',
                fontSize: '0.88rem',
                fontWeight: 700,
                background: 'rgba(99, 102, 241, 0.12)',
                borderColor: 'rgba(99, 102, 241, 0.35)',
                color: 'var(--primary-light)'
              }}
            >
              <Sparkles size={16} /> Quick 1-Click Demo Login
            </button>
          </form>

          {/* DIVIDER */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              margin: '1.5rem 0',
              color: 'var(--text-muted)',
              fontSize: '0.82rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
            <span style={{ padding: '0 1rem' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />
          </div>

          {/* CREATE ACCOUNT LINK */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              Don't have a SmartWay account yet?{' '}
              <Link
                to={`/register${redirectTarget !== '/products' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`}
                style={{ color: 'var(--primary-light)', fontWeight: 800, textDecoration: 'none' }}
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
