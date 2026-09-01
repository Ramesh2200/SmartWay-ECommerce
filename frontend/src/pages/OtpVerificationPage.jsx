import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { OtpInput } from '../components/OtpInput';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

export const OtpVerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialEmail = queryParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [cooldownSeconds, setCooldownSeconds] = useState(60);

  useEffect(() => {
    let interval = null;
    if (timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerSeconds]);

  useEffect(() => {
    let interval = null;
    if (cooldownSeconds > 0) {
      interval = setInterval(() => setCooldownSeconds((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      return setError('Please enter a valid email address');
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await api.sendEmailOtp(email);
      if (res.success) {
        setSuccess(`Verification code sent to ${email}`);
        setTimerSeconds(300);
        setCooldownSeconds(60);
      } else {
        setError(res.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!email) return setError('Please enter your email');
    if (otp.length !== 6) return setError('Please enter the 6-digit OTP');

    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await api.verifyEmailOtp(email, otp);
      if (res.success) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setSuccess('Email verified successfully ✓');
        setTimeout(() => {
          navigate('/register');
        }, 1500);
      } else {
        setError(res.message || 'Verification failed');
      }
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-badge">
            <Mail size={32} className="text-primary" />
          </div>
          <h2>Verify Your Email</h2>
          <p className="auth-subtitle">We've sent a 6-digit verification code to your email.</p>
        </div>

        {error && (
          <div className="alert-box alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="alert-box alert-success">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleVerifyOtp} className="auth-form">
          <div className="form-group">
            <label htmlFor="emailInput">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="emailInput"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="otp-box-section">
            <label className="otp-label">6-Digit Code</label>
            <OtpInput otp={otp} setOtp={setOtp} disabled={loading} />
          </div>

          <div className="otp-status-meta">
            <div className="timer-badge">
              <span>Expiry: </span>
              <strong>{Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}</strong>
            </div>
            <div className="resend-action">
              {cooldownSeconds > 0 ? (
                <span>00:{cooldownSeconds.toString().padStart(2, '0')}</span>
              ) : (
                <button type="button" onClick={handleSendOtp} className="btn-link-resend">
                  <RefreshCw size={14} /> Resend OTP
                </button>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary btn-block btn-lg"
            disabled={loading || otp.length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/register" className="auth-link">← Return to Registration</Link>
        </div>
      </div>
    </div>
  );
};
