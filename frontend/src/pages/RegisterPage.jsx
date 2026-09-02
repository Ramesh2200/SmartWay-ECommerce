import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User, CheckCircle2, AlertCircle, RefreshCw, ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';
import { OtpInput } from '../components/OtpInput';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  const { showToast } = useToast();

  const queryParams = new URLSearchParams(location.search);
  const redirectTarget = queryParams.get('redirect') || '/products';

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // OTP State
  const [otpStep, setOtpStep] = useState(false);
  const [alreadyAuthenticated, setAlreadyAuthenticated] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Timers
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 minutes
  const [cooldownSeconds, setCooldownSeconds] = useState(60); // 60s cooldown

  useEffect(() => {
    let interval = null;
    if (otpStep && timerSeconds > 0 && !emailVerified) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpStep, timerSeconds, emailVerified]);

  useEffect(() => {
    let interval = null;
    if (otpStep && cooldownSeconds > 0 && !emailVerified) {
      interval = setInterval(() => {
        setCooldownSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpStep, cooldownSeconds, emailVerified]);

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setAlreadyAuthenticated(false);
  };

  // Password strength calculation
  const getPasswordStrength = () => {
    const p = formData.password;
    if (!p) return { score: 0, text: '', color: '' };
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    if (score <= 1) return { score: 25, text: 'Weak', color: '#EF4444' };
    if (score === 2) return { score: 50, text: 'Fair', color: '#F59E0B' };
    if (score === 3) return { score: 75, text: 'Good', color: '#3B82F6' };
    return { score: 100, text: 'Strong', color: '#10B981' };
  };

  const handleSendVerificationCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setAlreadyAuthenticated(false);

    if (!formData.fullName.trim()) return setError('Please enter your full name');
    if (!formData.email.trim() || !formData.email.includes('@')) {
      return setError('Please enter a valid email address');
    }
    if (formData.password.length < 6) return setError('Password must be at least 6 characters long');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');

    setLoading(true);
    try {
      const response = await api.sendEmailOtp(formData.email, true);
      if (response.success) {
        showToast(`Verification code sent to ${formData.email}`, 'info');
        setSuccess(`Verification code dispatched to ${formData.email}. Code is valid for 5 minutes.`);
        setOtpStep(true);
        setTimerSeconds(300);
        setCooldownSeconds(60);
      } else if (response.alreadyAuthenticated || (response.message && response.message.includes('already'))) {
        setAlreadyAuthenticated(true);
        setError('This email is already registered. Please sign in to continue.');
      } else {
        setError(response.message || 'Failed to send verification code to email');
      }
    } catch (err) {
      if (err.data && (err.data.alreadyAuthenticated || err.message?.includes('already'))) {
        setAlreadyAuthenticated(true);
        setError('This email is already registered. Please sign in to continue.');
      } else {
        setError(err.message || 'Error communicating with authentication service');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldownSeconds > 0) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const response = await api.sendEmailOtp(formData.email, true);
      if (response.success) {
        setSuccess(`A fresh verification code has been dispatched to ${formData.email}.`);
        showToast('Fresh verification code sent!', 'info');
        setTimerSeconds(300);
        setCooldownSeconds(60);
      } else {
        setError(response.message || 'Failed to resend verification code');
      }
    } catch (err) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return setError('Please enter the full 6-digit verification code');

    setError('');
    setLoading(true);
    try {
      const verifyRes = await api.verifyEmailOtp(formData.email, otp);
      if (!verifyRes.success) {
        setError(verifyRes.message || 'Invalid or expired verification code');
        setLoading(false);
        return;
      }

      setEmailVerified(true);
      setSuccess('Email successfully verified! Creating your SmartWay account...');

      const registerRes = await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      });

      if (registerRes.success) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}

        showToast('Account Created! Please Sign In 🔐', 'success');
        setSuccess('Account created successfully! Redirecting to Sign In page...');
        setTimeout(() => {
          navigate(`/login?email=${encodeURIComponent(formData.email)}${redirectTarget !== '/products' ? `&redirect=${encodeURIComponent(redirectTarget)}` : ''}`);
        }, 1200);
      } else {
        setError(registerRes.message || 'Account registration failed');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength();

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
      {/* Subtle background dots */}
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
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.4) 0%, rgba(147, 51, 234, 0.2) 100%), url(https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=85) center/cover no-repeat',
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
              <Sparkles size={14} /> NEW MEMBER PERKS
            </span>

            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.35rem)', color: '#fff', fontWeight: 900, lineHeight: 1.2, marginTop: '0.75rem' }}>
              Create Your Account
            </h2>
            <p style={{ color: '#E2E8F0', fontSize: '1rem', lineHeight: 1.6, marginTop: '0.5rem' }}>
              Join us and discover 100+ curated products you'll love with express delivery, 7-day hassle-free returns, and verified customer reviews.
            </p>
          </div>

          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#CBD5E1', fontSize: '0.9rem' }}>
              <CheckCircle2 size={18} color="var(--success)" />
              <span>Real email OTP verification for instant security</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#CBD5E1', fontSize: '0.9rem' }}>
              <CheckCircle2 size={18} color="var(--success)" />
              <span>Exclusive early access to sales & offers</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#CBD5E1', fontSize: '0.9rem' }}>
              <CheckCircle2 size={18} color="var(--success)" />
              <span>Free express shipping on all orders over ₹999</span>
            </div>
          </div>
        </div>

        {/* RIGHT: REGISTRATION / OTP CARD */}
        <div style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {!otpStep ? (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 800, margin: 0 }}>
                  Customer Registration
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
                  Enter your details to receive your email verification code
                </p>
              </div>

              {error && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid var(--danger)',
                    borderRadius: 'var(--radius-md)',
                    color: '#FCA5A5',
                    fontSize: '0.88rem',
                    marginBottom: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                  </div>
                  {alreadyAuthenticated && (
                    <Link
                      to={`/login${redirectTarget !== '/products' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                    >
                      Sign In Now
                    </Link>
                  )}
                </div>
              )}

              <form onSubmit={handleSendVerificationCode} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="regName" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '0.35rem', display: 'block' }}>
                    Full Name
                  </label>
                  <div className="input-with-icon">
                    <User size={18} className="input-icon" />
                    <input
                      id="regName"
                      name="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      style={{ height: '44px', fontSize: '0.92rem' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="regEmail" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '0.35rem', display: 'block' }}>
                    Email Address
                  </label>
                  <div className="input-with-icon">
                    <Mail size={18} className="input-icon" />
                    <input
                      id="regEmail"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      style={{ height: '44px', fontSize: '0.92rem' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="regPass" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '0.35rem', display: 'block' }}>
                    Password
                  </label>
                  <div className="input-with-icon">
                    <Lock size={18} className="input-icon" />
                    <input
                      id="regPass"
                      name="password"
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={handleInputChange}
                      style={{ height: '44px', fontSize: '0.92rem' }}
                      required
                    />
                  </div>
                  {formData.password && (
                    <div style={{ marginTop: '0.4rem' }}>
                      <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${strength.score}%`, background: strength.color, transition: 'all 0.3s ease' }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: strength.color, fontWeight: 700, marginTop: '0.2rem', display: 'block' }}>
                        Strength: {strength.text}
                      </span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="regConfirm" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '0.35rem', display: 'block' }}>
                    Confirm Password
                  </label>
                  <div className="input-with-icon">
                    <Lock size={18} className="input-icon" />
                    <input
                      id="regConfirm"
                      name="confirmPassword"
                      type="password"
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      style={{ height: '44px', fontSize: '0.92rem' }}
                      required
                    />
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
                      <RefreshCw size={18} className="spin-animation" /> Sending verification code...
                    </>
                  ) : (
                    <>
                      Send Verification Code <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Already have an account?{' '}
                  <Link
                    to={`/login${redirectTarget !== '/products' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`}
                    style={{ color: 'var(--primary-light)', fontWeight: 800, textDecoration: 'none' }}
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            /* STEP 2: 6-BOX OTP VERIFICATION */
            <div>
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
                  <ShieldCheck size={32} />
                </div>
                <h3 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 800, margin: 0 }}>
                  Verify Your Email
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
                  We've sent a 6-digit verification code to <strong style={{ color: '#fff' }}>{formData.email}</strong>
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
                    marginBottom: '1.25rem'
                  }}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid var(--success)',
                    borderRadius: 'var(--radius-md)',
                    color: '#6EE7B7',
                    fontSize: '0.88rem',
                    marginBottom: '1.25rem'
                  }}
                >
                  <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleVerifyAndRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <OtpInput length={6} value={otp} onChange={setOtp} disabled={loading || emailVerified} />

                {/* Countdown & Resend */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: timerSeconds > 0 ? 'var(--text-muted)' : 'var(--danger)', fontWeight: 600 }}>
                    {timerSeconds > 0 ? `Code expires in: ${formatCountdown(timerSeconds)}` : 'Code expired'}
                  </span>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={cooldownSeconds > 0 || loading || emailVerified}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: cooldownSeconds > 0 ? 'var(--text-muted)' : 'var(--primary-light)',
                      fontWeight: 700,
                      cursor: cooldownSeconds > 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {cooldownSeconds > 0 ? `Resend Code (${cooldownSeconds}s)` : 'Resend Code'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6 || emailVerified}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', height: '48px', fontSize: '1rem', fontWeight: 700 }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={18} className="spin-animation" /> Verifying & Registering...
                    </>
                  ) : (
                    <>
                      Verify & Complete Registration <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setOtpStep(false); setOtp(''); setError(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'center' }}
                >
                  ← Edit registration details
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
