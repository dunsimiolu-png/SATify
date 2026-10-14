import { useState, useEffect } from 'react';

export type Theme = 'dark' | 'light';

const THEME_STORAGE_KEY = 'satify_theme';

export function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // fallback
  }
  return 'dark'; // Dark is SATify's signature premium theme
}

export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const body = document.body;
  if (theme === 'dark') {
    root.classList.add('dark');
    if (body) body.classList.add('dark');
  } else {
    root.classList.remove('dark');
    if (body) body.classList.remove('dark');
  }
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent('satify-theme-change', { detail: { theme } }));
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    // Initial sync
    applyTheme(theme);

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: Theme }>;
      if (customEvent.detail?.theme) {
        setThemeState(customEvent.detail.theme);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && (e.newValue === 'light' || e.newValue === 'dark')) {
        setThemeState(e.newValue);
        applyTheme(e.newValue);
      }
    };

    window.addEventListener('satify-theme-change', handleThemeChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('satify-theme-change', handleThemeChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setThemeState(nextTheme);
    applyTheme(nextTheme);
  };

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme: (newTheme: Theme) => {
      setThemeState(newTheme);
      applyTheme(newTheme);
    },
  };
}
