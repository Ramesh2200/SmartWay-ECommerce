import React, { useRef, useEffect } from 'react';

/**
 * Modern 6-digit OTP Input Box Component.
 * Supports auto-focus, arrow/backspace navigation, paste handling, and numeric validation.
 * Accepts either (otp, setOtp) or (value, onChange).
 */
export const OtpInput = ({
  otp,
  setOtp,
  value,
  onChange,
  length = 6,
  disabled = false
}) => {
  const currentOtp = (value !== undefined ? value : (otp || '')) + '';
  const updateOtp = onChange || setOtp || (() => {});
  const inputRefs = useRef([]);

  useEffect(() => {
    // Auto-focus first input on load
    if (inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [disabled]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return; // Only allow digits

    const otpArray = (currentOtp || '').split('');
    otpArray[index] = val.slice(-1); // Take last digit if multiple
    const newOtp = otpArray.join('').slice(0, length);
    updateOtp(newOtp);

    // Auto move to next input if digit entered
    if (val && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!currentOtp[index] && index > 0 && inputRefs.current[index - 1]) {
        // Move to previous box if current is empty
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (new RegExp(`^\\d{${length}}$`).test(pastedData)) {
      updateOtp(pastedData);
      if (inputRefs.current[length - 1]) {
        inputRefs.current[length - 1].focus();
      }
    }
  };

  const indices = Array.from({ length }, (_, i) => i);

  return (
    <div className="otp-input-container" onPaste={handlePaste} style={{ display: 'flex', gap: '0.65rem', justifyContent: 'center' }}>
      {indices.map((index) => {
        const digit = currentOtp[index] || '';
        return (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            disabled={disabled}
            className={`otp-digit-box ${digit ? 'filled' : ''}`}
            aria-label={`Digit ${index + 1} of ${length}`}
            style={{
              width: '46px',
              height: '52px',
              fontSize: '1.4rem',
              fontWeight: 800,
              textAlign: 'center',
              borderRadius: 'var(--radius-md)',
              border: digit ? '2px solid var(--primary-light)' : '1px solid var(--border-subtle)',
              background: digit ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              color: '#fff',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
          />
        );
      })}
    </div>
  );
};
