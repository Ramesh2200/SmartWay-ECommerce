import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Theme mode can be 'auto', 'dark', or 'light'
  const [themeMode, setThemeModeState] = useState(() => {
    try {
      const saved = localStorage.getItem('smartway_theme_mode');
      if (saved === 'dark' || saved === 'light' || saved === 'auto') {
        return saved;
      }
    } catch (e) {
      // In case localStorage is blocked or restricted
    }
    return 'auto';
  });

  const [systemIsDark, setSystemIsDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true; // default dark for cyber tech aesthetic
  });

  // Listen to OS theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setSystemIsDark(e.matches);
    };

    // Modern API with fallback
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // Determine actual rendered theme
  const resolvedTheme = useMemo(() => {
    if (themeMode === 'auto') {
      return systemIsDark ? 'dark' : 'light';
    }
    return themeMode;
  }, [themeMode, systemIsDark]);

  // Synchronize document attribute and class whenever resolvedTheme changes
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', resolvedTheme);
    root.classList.remove('theme-dark', 'theme-light');
    root.classList.add(`theme-${resolvedTheme}`);
  }, [resolvedTheme]);

  const setThemeMode = useCallback((mode) => {
    if (mode === 'dark' || mode === 'light' || mode === 'auto') {
      setThemeModeState(mode);
      try {
        localStorage.setItem('smartway_theme_mode', mode);
      } catch (e) {
        console.warn('Unable to persist theme to localStorage', e);
      }
    }
  }, []);

  // Cycle through Auto -> Light -> Dark -> Auto
  const cycleTheme = useCallback(() => {
    setThemeModeState((prev) => {
      let nextMode;
      if (prev === 'auto') nextMode = 'light';
      else if (prev === 'light') nextMode = 'dark';
      else nextMode = 'auto';

      try {
        localStorage.setItem('smartway_theme_mode', nextMode);
      } catch (e) {
        // ignore
      }
      return nextMode;
    });
  }, []);

  const value = useMemo(() => ({
    themeMode, // 'auto' | 'dark' | 'light'
    resolvedTheme, // 'dark' | 'light'
    setThemeMode,
    cycleTheme,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    isAuto: themeMode === 'auto'
  }), [themeMode, resolvedTheme, setThemeMode, cycleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
