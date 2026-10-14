import React, { useState, useEffect } from 'react';
import { Shield, Cookie, X, Sliders } from 'lucide-react';

export interface CookiePreferences {
  essential: boolean; // Always true
  analytics: boolean;
  functional: boolean;
  timestamp: number;
}

const COOKIE_NAME = 'satify_cookie_consent';
const ONE_YEAR_SECONDS = 31536000;

export const getStoredCookieConsent = (): CookiePreferences | null => {
  if (typeof window === 'undefined') return null;

  try {
    // 1. Check document.cookie
    const match = document.cookie.match(new RegExp('(^| )' + COOKIE_NAME + '=([^;]+)'));
    if (match && match[2]) {
      return JSON.parse(decodeURIComponent(match[2]));
    }

    // 2. Fallback to localStorage
    const local = localStorage.getItem(COOKIE_NAME);
    if (local) {
      return JSON.parse(local);
    }
  } catch (e) {
    console.warn('Failed to parse cookie consent:', e);
  }
  return null;
};

export const setStoredCookieConsent = (prefs: CookiePreferences) => {
  if (typeof window === 'undefined') return;

  const value = encodeURIComponent(JSON.stringify(prefs));
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
  try {
    localStorage.setItem(COOKIE_NAME, JSON.stringify(prefs));
  } catch (e) {
    console.warn('Failed to persist consent to localStorage:', e);
  }
};

export const CookieConsentBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState<boolean>(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: true,
    functional: true,
    timestamp: Date.now(),
  });

  useEffect(() => {
    const existing = getStoredCookieConsent();
    if (!existing) {
      // Small timeout for smooth entry animation
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for custom trigger to open preferences modal from settings or footer
  useEffect(() => {
    const handleOpenPreferences = () => {
      const current = getStoredCookieConsent() || {
        essential: true,
        analytics: true,
        functional: true,
        timestamp: Date.now(),
      };
      setPreferences(current);
      setIsCustomizeModalOpen(true);
    };

    window.addEventListener('satify_open_cookie_preferences', handleOpenPreferences);
    return () => window.removeEventListener('satify_open_cookie_preferences', handleOpenPreferences);
  }, []);

  const handleAcceptAll = () => {
    const consent: CookiePreferences = {
      essential: true,
      analytics: true,
      functional: true,
      timestamp: Date.now(),
    };
    setStoredCookieConsent(consent);
    setIsOpen(false);
    setIsCustomizeModalOpen(false);
  };

  const handleEssentialOnly = () => {
    const consent: CookiePreferences = {
      essential: true,
      analytics: false,
      functional: false,
      timestamp: Date.now(),
    };
    setStoredCookieConsent(consent);
    setIsOpen(false);
    setIsCustomizeModalOpen(false);
  };

  const handleSavePreferences = () => {
    const consent: CookiePreferences = {
      ...preferences,
      essential: true,
      timestamp: Date.now(),
    };
    setStoredCookieConsent(consent);
    setIsOpen(false);
    setIsCustomizeModalOpen(false);
  };

  if (!isOpen && !isCustomizeModalOpen) return null;

  return (
    <>
      {/* Floating Theme-Aware Cookie Banner */}
      {isOpen && !isCustomizeModalOpen && (
        <aside 
          aria-label="Cookie consent banner"
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-xl z-50 bg-white dark:bg-[#0f1522] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-300 text-slate-900 dark:text-white"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Cookie className="w-5 h-5" />
            </div>

            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Cookie & Privacy Preferences</span>
                </h4>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                  title="Dismiss banner"
                  aria-label="Dismiss banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                We use cookies and local sessions to keep you signed in, preserve your practice progress and question notes, and calibrate your Digital SAT analytics.
              </p>

              <div className="pt-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs cursor-pointer active:scale-95"
                >
                  Accept All
                </button>

                <button
                  onClick={handleEssentialOnly}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition cursor-pointer active:scale-95"
                >
                  Essential Only
                </button>

                <button
                  onClick={() => setIsCustomizeModalOpen(true)}
                  className="px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 ml-auto cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Customize</span>
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Customize Preferences Modal */}
      {isCustomizeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0f1522] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 text-slate-900 dark:text-white animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                    Customize Cookie Preferences
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Control which cookies and data stores SATify may use.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCustomizeModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cookie Categories */}
            <div className="space-y-4">
              {/* Category 1: Strictly Necessary */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Strictly Necessary Cookies</span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      Always Active
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Required for user authentication, security validation, and local session continuity across official Bluebook practice tests.
                </p>
              </div>

              {/* Category 2: Analytics & Performance */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Analytics & Performance</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Allows SATify to calculate skill mastery graphs, pacing trend analytics, and 10-day practice activity.
                </p>
              </div>

              {/* Category 3: Functional & UI Preferences */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Functional Preferences</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={(e) => setPreferences(prev => ({ ...prev, functional: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Remembers your theme preferences (Light vs. Dark Mode), stopwatch visibility, and audio sound effect toggles.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                onClick={handleEssentialOnly}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                Reject Non-Essential
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs cursor-pointer active:scale-95"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
