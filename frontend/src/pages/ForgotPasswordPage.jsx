import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, CheckCircle2, AlertCircle, RefreshCw, KeyRound, ArrowRight, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react';
import { OtpInput } from '../components/OtpInput';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [cooldownSeconds, setCooldownSeconds] = useState(60);

  useEffect(() => {
    let interval = null;
    if (step === 2 && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timerSeconds]);

  useEffect(() => {
    let interval = null;
    if (step === 2 && cooldownSeconds > 0) {
      interval = setInterval(() => setCooldownSeconds((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, cooldownSeconds]);

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      return setError('Please enter a valid registered email address');
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.sendForgotPasswordOtp(email);
      if (res.success) {
        showToast(`Verification code sent to ${email}`, 'info');
        setSuccess(`Verification code dispatched to ${email}. Code valid for 5 minutes.`);
        setStep(2);
        setTimerSeconds(300);
        setCooldownSeconds(60);
      } else {
        setError(res.message || 'Failed to send verification code');
      }
    } catch (err) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (otp.length !== 6) return setError('Please enter the full 6-digit verification code');
    setError('');
    setLoading(true);
    try {
      const res = await api.verifyForgotPasswordOtp(email, otp);
      if (res.success) {
        showToast('Code verified! Please create your new password.', 'success');
        setSuccess('Identity verified! Set your new password.');
        setStep(3);
      } else {
        setError(res.message || 'Invalid or expired verification code');
      }
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return setError('New password must be at least 6 characters long');
    if (newPassword !== confirmPassword) return setError('Passwords do not match');

    setError('');
    setLoading(true);
    try {
      const res = await api.resetPassword(email, newPassword);
      if (res.success) {
        setStep(4);
        showToast('Password updated securely! 🎉', 'success');
      } else {
        setError(res.message || 'Password update failed');
      }
    } catch (err) {
      setError(err.message || 'Password reset failed');
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
          maxWidth: '960px',
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
        {/* LEFT: BRAND SHOWCASE */}
        <div
          style={{
            position: 'relative',
            padding: '3.5rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.4) 0%, rgba(147, 51, 234, 0.2) 100%), url(https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=85) center/cover no-repeat',
            minHeight: '440px'
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
              <Sparkles size={14} /> SECURITY RECOVERY
            </span>

            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', color: '#fff', fontWeight: 900, lineHeight: 1.2, marginTop: '0.75rem' }}>
              Account Recovery
            </h2>
            <p style={{ color: '#E2E8F0', fontSize: '0.98rem', lineHeight: 1.6, marginTop: '0.5rem' }}>
              Reset your password securely via real email verification. Enter your registered email to receive your 6-digit code.
            </p>
          </div>

          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#CBD5E1', fontSize: '0.88rem' }}>
              <CheckCircle2 size={16} color="var(--success)" />
              <span>Direct verification code sent to Gmail</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#CBD5E1', fontSize: '0.88rem' }}>
              <CheckCircle2 size={16} color="var(--success)" />
              <span>Zero data loss for cart & saved wishlist</span>
            </div>
          </div>
        </div>

        {/* RIGHT: 4-STEP WIZARD CARD */}
        <div style={{ padding: '3.5rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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

          {/* STEP 1: ENTER EMAIL */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom: '1.75rem' }}>
                <h3 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 800, margin: 0 }}>
                  Reset Password
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
                  Enter your email address to receive your 6-digit reset code
                </p>
              </div>

              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label htmlFor="fpEmail" style={{ fontSize: '0.88rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '0.4rem', display: 'block' }}>
                    Email Address
                  </label>
                  <div className="input-with-icon">
                    <Mail size={18} className="input-icon" />
                    <input
                      id="fpEmail"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ height: '46px', fontSize: '0.95rem' }}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', height: '48px', fontSize: '1rem', fontWeight: 700 }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={18} className="spin-animation" /> Sending Code...
                    </>
                  ) : (
                    <>
                      Send Verification Code <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
                  <Link to="/login" style={{ color: 'var(--primary-light)', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none' }}>
                    ← Back to Sign In
                  </Link>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: ENTER OTP */}
          {step === 2 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                    color: 'var(--primary-light)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.75rem'
                  }}
                >
                  <ShieldCheck size={28} />
                </div>
                <h3 style={{ fontSize: '1.45rem', color: '#fff', fontWeight: 800, margin: 0 }}>
                  Enter Verification Code
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.35rem' }}>
                  We sent a 6-digit code to <strong style={{ color: '#fff' }}>{email}</strong>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <OtpInput length={6} value={otp} onChange={setOtp} disabled={loading} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: timerSeconds > 0 ? 'var(--text-muted)' : 'var(--danger)', fontWeight: 600 }}>
                    {timerSeconds > 0 ? `Expires in: ${formatCountdown(timerSeconds)}` : 'Code expired'}
                  </span>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={cooldownSeconds > 0 || loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: cooldownSeconds > 0 ? 'var(--text-muted)' : 'var(--primary-light)',
                      fontWeight: 700,
                      cursor: cooldownSeconds > 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {cooldownSeconds > 0 ? `Resend (${cooldownSeconds}s)` : 'Resend Code'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', height: '48px', fontSize: '1rem', fontWeight: 700 }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={18} className="spin-animation" /> Verifying...
                    </>
                  ) : (
                    <>
                      Verify Code <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep(1); setOtp(''); setError(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'center' }}
                >
                  ← Change email address
                </button>
              </form>
            </div>
          )}

          {/* STEP 3: SET NEW PASSWORD */}
          {step === 3 && (
            <div>
              <div style={{ marginBottom: '1.75rem' }}>
                <h3 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 800, margin: 0 }}>
                  Create New Password
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
                  Choose a secure password for your SmartWay account
                </p>
              </div>

              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label htmlFor="newPass" style={{ fontSize: '0.88rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '0.4rem', display: 'block' }}>
                    New Password
                  </label>
                  <div className="input-with-icon">
                    <Lock size={18} className="input-icon" />
                    <input
                      id="newPass"
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{ height: '46px', fontSize: '0.95rem' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPass" style={{ fontSize: '0.88rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '0.4rem', display: 'block' }}>
                    Confirm New Password
                  </label>
                  <div className="input-with-icon">
                    <Lock size={18} className="input-icon" />
                    <input
                      id="confirmPass"
                      type="password"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{ height: '46px', fontSize: '0.95rem' }}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', height: '48px', fontSize: '1rem', fontWeight: 700 }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={18} className="spin-animation" /> Updating Password...
                    </>
                  ) : (
                    <>
                      Update Password <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid var(--success)',
                  color: 'var(--success)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '1.6rem', color: '#fff', fontWeight: 800, margin: '0 0 0.5rem' }}>
                Password Updated!
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Your password has been changed successfully. You can now sign in with your new credentials.
              </p>

              <button
                onClick={() => navigate('/login')}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', height: '48px', fontSize: '1rem', fontWeight: 700 }}
              >
                Sign In to SmartWay <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
