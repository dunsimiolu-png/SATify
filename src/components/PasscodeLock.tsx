import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, ShieldAlert, CheckCircle2, Moon, Sun } from 'lucide-react';
import { useTheme } from '../utils/theme';

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

  // Keep input focused automatically
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
      }, 400);
    } else {
      setError('Incorrect passcode. Please try again.');
      setIsShaking(true);
      setPin('');
      setTimeout(() => {
        setIsShaking(false);
      }, 500);
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
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 bg-slate-900/95 dark:bg-[#07090e]/98 backdrop-blur-xl transition-colors">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-full bg-slate-800/80 dark:bg-[#151a24] hover:bg-slate-700 dark:hover:bg-[#202738] text-slate-300 dark:text-gray-300 transition border border-slate-700/60 dark:border-[#222b3d]"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
        </button>
      </div>

      <div className={`w-full max-w-sm rounded-2xl bg-white dark:bg-[#0f141d] border border-slate-200 dark:border-[#1e2638] shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center transition-all ${
        isShaking ? 'animate-[shake_0.4s_ease-in-out]' : ''
      }`}>
        {/* Brand Icon & Status */}
        <div className="mb-4 relative">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/10 dark:bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-inner">
            {isSuccess ? (
              <Unlock className="w-8 h-8 text-emerald-500 animate-bounce" />
            ) : (
              <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            )}
          </div>
          {isSuccess && (
            <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
          SATify Private Access
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400 mb-6">
          Enter your personal passcode to unlock your practice sessions and question bank.
        </p>

        {/* Hidden actual input for standard desktop keyboards */}
        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          autoFocus
          maxLength={8}
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

        {/* Visual PIN dots / boxes */}
        <div 
          onClick={() => inputRef.current?.focus()}
          className="flex items-center justify-center gap-3 mb-6 cursor-pointer"
        >
          {Array.from({ length: correctPasscode.length }).map((_, idx) => {
            const isFilled = idx < pin.length;
            return (
              <div
                key={idx}
                className={`w-11 h-13 sm:w-12 sm:h-14 rounded-xl border-2 flex items-center justify-center font-mono text-xl sm:text-2xl font-bold transition-all select-none ${
                  isSuccess
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600'
                    : error
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-500'
                    : isFilled
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 shadow-sm scale-105'
                    : 'border-slate-200 dark:border-[#222b3d] bg-slate-50 dark:bg-[#151a24] text-slate-400'
                }`}
              >
                {isFilled ? '●' : ''}
              </div>
            );
          })}
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-rose-500 mb-4 animate-fade-in">
            <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Numeric keypad for touch / mobile convenience */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-[260px] mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigitClick(digit)}
              className="h-11 sm:h-12 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#171f2e] dark:hover:bg-[#202b3f] text-slate-800 dark:text-gray-200 font-semibold text-lg transition active:scale-95 shadow-sm"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-11 sm:h-12 rounded-xl bg-slate-100 hover:bg-rose-100 dark:bg-[#171f2e] dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 dark:text-gray-400 text-xs font-semibold transition active:scale-95"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigitClick('0')}
            className="h-11 sm:h-12 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#171f2e] dark:hover:bg-[#202b3f] text-slate-800 dark:text-gray-200 font-semibold text-lg transition active:scale-95 shadow-sm"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-11 sm:h-12 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#171f2e] dark:hover:bg-[#202b3f] text-slate-600 dark:text-gray-300 text-sm font-semibold transition active:scale-95"
            aria-label="Backspace"
          >
            ⌫
          </button>
        </div>

        {/* Remember device checkbox */}
        <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-gray-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-800"
          />
          <span>Remember on this browser</span>
        </label>
      </div>

      <p className="mt-6 text-[11px] text-slate-400 dark:text-gray-500 font-medium">
        SATify Digital SAT Practice • Private Personal Edition
      </p>
    </div>
  );
};
