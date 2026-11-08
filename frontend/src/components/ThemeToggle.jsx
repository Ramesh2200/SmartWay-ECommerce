import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle = ({ compact = false, showLabel = false }) => {
  const { themeMode, resolvedTheme, setThemeMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    {
      id: 'light',
      label: 'White (Light)',
      icon: Sun,
      color: '#F59E0B',
      desc: 'Clean & high-contrast'
    },
    {
      id: 'dark',
      label: 'Dark Mode',
      icon: Moon,
      color: '#818CF8',
      desc: 'Cyber-slate & neon'
    },
    {
      id: 'auto',
      label: 'Auto (System)',
      icon: Monitor,
      color: '#06B6D4',
      desc: 'Follows OS preference'
    }
  ];

  const currentOption = options.find((opt) => opt.id === themeMode) || options[2];
  const CurrentIcon = currentOption.icon;

  return (
    <div ref={dropdownRef} className="theme-toggle-container" style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="theme-switch-btn"
        title={`Theme Mode: ${currentOption.label} (Click to change)`}
        aria-label="Toggle theme mode"
        aria-expanded={isOpen}
      >
        <CurrentIcon size={19} style={{ color: currentOption.color }} />
        {showLabel && (
          <span className="theme-btn-label desktop-only" style={{ marginLeft: '0.45rem', fontSize: '0.8125rem', fontWeight: 600 }}>
            {themeMode === 'auto' ? 'Auto' : themeMode === 'light' ? 'White' : 'Dark'}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="theme-dropdown-menu">
          <div className="theme-dropdown-header">
            <span>Theme Appearance</span>
          </div>

          {options.map((option) => {
            const Icon = option.icon;
            const isSelected = themeMode === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setThemeMode(option.id);
                  setIsOpen(false);
                }}
                className={`theme-dropdown-option ${isSelected ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: `${option.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon size={16} style={{ color: option.color }} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div className="theme-option-title">{option.label}</div>
                    <div className="theme-option-desc">{option.desc}</div>
                  </div>
                </div>

                {isSelected && <Check size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
