import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Mail, User, Sparkles } from 'lucide-react';
import { Logo } from './Logo';
import { authenticateWithGoogle, UserProfile } from '../utils/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: UserProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [customName, setCustomName] = useState<string>('');
  const [customEmail, setCustomEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showManualForm, setShowManualForm] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    // Check if Google Identity Services script is loaded
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com', // placeholder
          callback: async (response: any) => {
            if (response.credential) {
              setIsSubmitting(true);
              const user = await authenticateWithGoogle(response.credential);
              setIsSubmitting(false);
              if (onSuccess) onSuccess(user);
              onClose();
            }
          },
        });
      } catch (err) {
        console.warn('Google Identity initialization notice:', err);
      }
    }
  }, [isOpen, onClose, onSuccess]);

  if (!isOpen) return null;

  const handleQuickGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      const demoEmail = customEmail.trim() || 'dunsimiolu@gmail.com';
      const demoName = customName.trim() || 'Oluwole Dunsimi';
      
      const user = await authenticateWithGoogle({
        name: demoName,
        email: demoEmail,
        picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=160',
      });
      if (onSuccess) onSuccess(user);
      onClose();
    } catch (err) {
      console.error('Google Sign-in failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;

    setIsSubmitting(true);
    try {
      const user = await authenticateWithGoogle({
        name: customName.trim() || customEmail.split('@')[0],
        email: customEmail.trim(),
      });
      if (onSuccess) onSuccess(user);
      onClose();
    } catch (err) {
      console.error('Sign-in error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0f1522] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 text-slate-900 dark:text-white animate-in zoom-in-95 duration-150 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="flex justify-center mb-1">
            <Logo size="lg" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Sign in to SATify
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Track your Digital SAT pacing, bookmark mistakes, and sync your vocabulary mastery.
          </p>
        </div>

        {/* Google One-Tap Action Button */}
        <div className="space-y-3">
          <button
            onClick={handleQuickGoogleSignIn}
            disabled={isSubmitting}
            className="w-full min-h-[48px] px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 dark:bg-[#151b28] dark:hover:bg-[#1a2233] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-sm shadow-xs flex items-center justify-center gap-3 transition active:scale-98 cursor-pointer disabled:opacity-50"
          >
            {/* Official Google G Logo */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.98 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{isSubmitting ? 'Signing in...' : 'Continue with Google'}</span>
          </button>

          {!showManualForm ? (
            <button
              onClick={() => setShowManualForm(true)}
              className="w-full text-center text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
            >
              Or sign in with email address
            </button>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Oluwole Dunsimi"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="dunsimiolu@gmail.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In & Receive Founder Welcome'}
              </button>
            </form>
          )}
        </div>

        {/* Founder & Security Note */}
        <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-[11px] sm:text-xs text-blue-950 dark:text-blue-100">
              Automated Founder Welcome Email
            </p>
            <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
              When you sign in, you'll receive a welcome email directly from <strong>Oluwole Inuoluwadunsimi</strong> (Founder & CEO) with top pacing strategies.
            </p>
          </div>
        </div>

        {/* Safe Non-Active Question Bank Guarantee */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>100% Non-Active Question Bank • Free & Private</span>
        </div>
      </div>
    </div>
  );
};
