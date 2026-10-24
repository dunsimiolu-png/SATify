import React, { useState, useEffect, useRef } from 'react';
import { Lock, Moon, Sun, ShieldAlert } from 'lucide-react';
import { useTheme } from '../utils/theme';
import { Logo } from './Logo';

interface PasscodeLockProps {
  onUnlock: () => void;
}

export const PasscodeLock: React.FC<PasscodeLockProps> = ({ onUnlock }) => {
  const { isDark, toggleTheme } = useTheme();
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Master passcode from environment variable with fallback to 2016
  const envPasscode = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_APP_PASSCODE;
  const correctPasscode = (envPasscode || '2016').trim();

  // Focus automatically on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleVerify = (enteredPin: string) => {
    if (enteredPin === correctPasscode) {
      setError(null);
      setIsSuccess(true);
      if (rememberMe) {
        localStorage.setItem('satify_auth_status', 'unlocked');
      } else {
        sessionStorage.setItem('satify_auth_status', 'unlocked');
      }
      setTimeout(() => {
        onUnlock();
      }, 350);
    } else {
      setError('Incorrect passcode. Please try again.');
      setIsShaking(true);
      setPin('');
      setTimeout(() => {
        setIsShaking(false);
      }, 400);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (pin.length > 0) {
        handleVerify(pin);
      }
    }
  };

  const handleDigitClick = (digit: string) => {
    if (pin.length < 8) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(null);
      if (nextPin.length === correctPasscode.length) {
        handleVerify(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPin('');
    setError(null);
  };

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 bg-neutral-50 dark:bg-[#090A0F] text-zinc-950 dark:text-[#F4F4F6] transition-opacity duration-300 ${
      isSuccess ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100 scale-100'
    }`}>
      {/* Top utility cluster */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="h-9 w-9 rounded-lg border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] text-zinc-600 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-[#F4F4F6] flex items-center justify-center transition-colors duration-150 cursor-pointer"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" strokeWidth={1.75} /> : <Moon className="w-4 h-4 text-zinc-700" strokeWidth={1.75} />}
        </button>
      </div>

      {/* Access Vault Card */}
      <div className={`w-full max-w-[380px] rounded-2xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] shadow-xs p-7 sm:p-8 flex flex-col items-center text-center transition-all duration-150 ${
        isShaking ? 'animate-[shake_0.35s_ease-in-out]' : ''
      }`}>
        {/* Crisp Header: Wordmark & Workspace Badge */}
        <div className="flex flex-col items-center mb-6">
          <Logo size="md" variant="full" inverted={isDark} />
          
          <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-[#222634] bg-zinc-100 dark:bg-[#181B24] text-[11px] font-mono font-semibold tracking-wider text-zinc-600 dark:text-[#8E95A5] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-500" />
            <span>Digital SAT Workspace</span>
          </div>
        </div>

        <h1 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-[#F4F4F6] mb-1">
          Private Access Vault
        </h1>
        <p className="text-xs text-zinc-600 dark:text-[#8E95A5] mb-6 leading-relaxed">
          Enter 4-digit passcode to resume your practice sessions and analytical metrics.
        </p>

        {/* Hidden native input for physical desktop keyboards */}
        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          autoFocus
          maxLength={correctPasscode.length}
          value={pin}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '');
            setPin(val);
            setError(null);
            if (val.length === correctPasscode.length) {
              handleVerify(val);
            }
          }}
          onKeyDown={handleKeyDown}
          className="opacity-0 absolute -z-10 pointer-events-none"
          aria-label="Passcode input"
        />

        {/* Segmented PIN input boxes */}
        <div 
          onClick={() => inputRef.current?.focus()}
          className="flex items-center justify-center gap-2.5 mb-5 cursor-pointer select-none"
        >
          {Array.from({ length: correctPasscode.length }).map((_, idx) => {
            const isFilled = idx < pin.length;
            const isFocused = idx === pin.length;
            return (
              <div
                key={idx}
                className={`w-12 h-14 rounded-lg border flex items-center justify-center font-mono text-xl font-semibold tabular-nums transition-colors duration-150 ${
                  isSuccess
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                    : error
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/20 text-rose-600'
                    : isFilled
                    ? 'border-blue-600 dark:border-blue-500 bg-zinc-50 dark:bg-[#181B24] text-zinc-950 dark:text-[#F4F4F6]'
                    : isFocused
                    ? 'border-zinc-400 dark:border-zinc-500 bg-zinc-50 dark:bg-[#181B24]'
                    : 'border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] text-zinc-400'
                }`}
              >
                {isFilled ? '•' : ''}
              </div>
            );
          })}
        </div>

        {/* Error Notification */}
        {error && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 mb-4 animate-in fade-in duration-150">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
            <span>{error}</span>
          </div>
        )}

        {/* Tactile Keypad */}
        <div className="grid grid-cols-3 gap-1.5 w-full max-w-[270px] mb-5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigitClick(digit)}
              className="h-11 rounded-lg border border-zinc-200 dark:border-[#222634] bg-zinc-50 hover:bg-zinc-100 dark:bg-[#181B24] dark:hover:bg-[#202534] text-zinc-950 dark:text-[#F4F4F6] font-mono text-base font-semibold tabular-nums transition-colors duration-150 cursor-pointer"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-11 rounded-lg border border-zinc-200 dark:border-[#222634] bg-zinc-50 hover:bg-zinc-100 dark:bg-[#181B24] dark:hover:bg-[#202534] text-zinc-500 dark:text-[#8E95A5] text-xs font-medium transition-colors duration-150 cursor-pointer"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigitClick('0')}
            className="h-11 rounded-lg border border-zinc-200 dark:border-[#222634] bg-zinc-50 hover:bg-zinc-100 dark:bg-[#181B24] dark:hover:bg-[#202534] text-zinc-950 dark:text-[#F4F4F6] font-mono text-base font-semibold tabular-nums transition-colors duration-150 cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-11 rounded-lg border border-zinc-200 dark:border-[#222634] bg-zinc-50 hover:bg-zinc-100 dark:bg-[#181B24] dark:hover:bg-[#202534] text-zinc-600 dark:text-[#8E95A5] text-xs font-medium transition-colors duration-150 cursor-pointer flex items-center justify-center"
            aria-label="Backspace"
          >
            ⌫
          </button>
        </div>

        {/* Remember device checkbox */}
        <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-[#8E95A5] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-3.5 h-3.5 rounded border-zinc-300 dark:border-[#222634] text-blue-600 focus:ring-0 dark:bg-[#181B24] cursor-pointer"
          />
          <span>Remember on this device</span>
        </label>
      </div>

      {/* Minimal Footer Stamp */}
      <div className="mt-6 flex items-center gap-1.5 text-[11px] font-mono text-zinc-500 dark:text-[#8E95A5]">
        <Lock className="w-3 h-3" strokeWidth={1.75} />
        <span>Satify • Official 2026 Academic Specification</span>
      </div>
    </div>
  );
};
