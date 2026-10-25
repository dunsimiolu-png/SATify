import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Mail, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Loader2,
  KeyRound,
  LogOut,
  Settings
} from 'lucide-react';
import { Logo } from './Logo';
import { 
  authenticateWithGoogle, 
  registerWithEmail, 
  loginWithEmail, 
  resetPassword, 
  UserProfile,
  logoutUser
} from '../utils/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: UserProfile) => void;
  initialMode?: 'signin' | 'register';
  currentUser?: UserProfile | null;
}

type AuthMode = 'signin' | 'register' | 'forgot';

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'signin',
  currentUser = null,
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Google Client ID State (loaded from Vite env, local storage, or default)
  const DEFAULT_GOOGLE_CLIENT_ID = '230405444938-0ksaq5k8mlpqhsokplr8p7gvnjhnc4hh.apps.googleusercontent.com';
  const [googleClientId, setGoogleClientId] = useState<string>(() => {
    const envId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (envId && !envId.includes('YOUR_GOOGLE_CLIENT_ID')) return envId;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('satify_google_client_id');
      if (stored) return stored;
    }
    return DEFAULT_GOOGLE_CLIENT_ID;
  });
  const [showClientIdInput, setShowClientIdInput] = useState<boolean>(false);
  const [inputClientId, setInputClientId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialMode]);

  const handleSwitchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setSuccessMsg(null);
  };

  // Initialize Google Identity Services (GIS)
  useEffect(() => {
    if (!isOpen || !googleClientId) return;

    const initGIS = () => {
      const google = (window as any).google;
      if (!google?.accounts?.id) return false;

      try {
        // Initialize Google One-Tap & standard button callback
        google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            if (response.credential) {
              setIsSubmitting(true);
              try {
                const user = await authenticateWithGoogle(response.credential);
                if (onSuccess) onSuccess(user);
                onClose();
              } catch (err: any) {
                setError(err?.message || 'Google authentication failed.');
              } finally {
                setIsSubmitting(false);
              }
            }
          },
        });

        return true;
      } catch (err) {
        console.warn('Google Identity initialization notice:', err);
        return false;
      }
    };

    if (!initGIS()) {
      const interval = setInterval(() => {
        if (initGIS()) clearInterval(interval);
      }, 300);
      return () => clearInterval(interval);
    }
  }, [isOpen, googleClientId, onSuccess, onClose]);

  if (!isOpen) return null;

  // Real Google Sign-In Popup trigger via OAuth2 Token Client
  const handleRealGoogleSignIn = () => {
    setError(null);

    if (!googleClientId) {
      setShowClientIdInput(true);
      return;
    }

    const google = (window as any).google;
    if (!google?.accounts?.oauth2) {
      setError('Google Identity SDK is still initializing. Please click again in a moment.');
      return;
    }

    try {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: 'email profile openid',
        callback: async (tokenResp: any) => {
          if (tokenResp.error) {
            setError(tokenResp.error_description || tokenResp.error || 'Google Sign-In canceled.');
            return;
          }

          if (tokenResp.access_token) {
            setIsSubmitting(true);
            try {
              // Fetch verified Google Profile directly from Google APIs
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResp.access_token}` },
              });
              const googleProfile = await res.json();

              if (!googleProfile.email) {
                throw new Error('Google did not return an email address.');
              }

              const user = await authenticateWithGoogle({
                name: googleProfile.name || googleProfile.email.split('@')[0],
                email: googleProfile.email,
                picture: googleProfile.picture,
              });

              if (onSuccess) onSuccess(user);
              onClose();
            } catch (err: any) {
              setError(err?.message || 'Failed to authenticate Google user profile.');
            } finally {
              setIsSubmitting(false);
            }
          }
        },
      });

      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err: any) {
      setError(err?.message || 'Could not launch Google Sign-In popup. Please verify your Client ID.');
    }
  };

  // Save manual Google Client ID input
  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = inputClientId.trim();
    if (!cleanId) return;
    setGoogleClientId(cleanId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('satify_google_client_id', cleanId);
    }
    setShowClientIdInput(false);
    setSuccessMsg('Google Client ID connected! Initializing Google Sign-In...');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Normal Email + Password Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginWithEmail(email, password);
      if (res.success && res.user) {
        if (onSuccess) onSuccess(res.user);
        onClose();
      } else {
        setError(res.error || 'Invalid email or password.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Normal Email + Password Sign Up (Registration)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerWithEmail(name, email, password);
      if (res.success && res.user) {
        if (onSuccess) onSuccess(res.user);
        onClose();
      } else {
        setError(res.error || 'Registration failed. Please try another email.');
      }
    } catch (err: any) {
      setError(err?.message || 'Registration encountered an error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }
    if (password.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPassword(email, password);
      if (res.success) {
        setSuccessMsg('Your password has been successfully reset! You can now sign in.');
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          handleSwitchMode('signin');
        }, 1500);
      } else {
        setError(res.error || 'Could not reset password for this email.');
      }
    } catch (err: any) {
      setError(err?.message || 'Password reset failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: '', color: '', percent: 0 };
    if (pwd.length < 6) return { label: 'Too short', color: 'bg-rose-500', percent: 25 };
    const hasNum = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const score = (pwd.length >= 8 ? 1 : 0) + (hasNum ? 1 : 0) + (hasSpecial ? 1 : 0) + (hasUpper ? 1 : 0);
    if (score >= 3) return { label: 'Strong', color: 'bg-emerald-500', percent: 100 };
    if (score >= 2) return { label: 'Medium', color: 'bg-amber-500', percent: 65 };
    return { label: 'Fair', color: 'bg-yellow-500', percent: 45 };
  };

  const strength = getPasswordStrength(password);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-[#11131A] border border-zinc-200/90 dark:border-[#222634] rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 text-zinc-950 dark:text-[#F4F4F6] animate-in zoom-in-95 duration-200 relative my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#181B24] transition-all duration-150 active:scale-90 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Currently Signed In Alert */}
        {currentUser && (
          <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between gap-3 text-xs">
            <div className="min-w-0">
              <p className="font-bold text-slate-900 dark:text-white truncate">
                Signed in as {currentUser.name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {currentUser.email}
              </p>
            </div>
            <button
              onClick={() => {
                logoutUser();
                onClose();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 text-rose-600 dark:text-rose-400 font-bold text-xs shrink-0 flex items-center gap-1 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* Modal Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="flex justify-center mb-1">
            <Logo size="md" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {mode === 'signin' && 'Welcome Back to SATify'}
            {mode === 'register' && 'Create Your SATify Account'}
            {mode === 'forgot' && 'Reset Your Password'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            {mode === 'signin' && 'Sign in to sync your practice analytics, saved mistakes, and pacing data.'}
            {mode === 'register' && 'Join thousands of students practicing on official Bluebook test software specs.'}
            {mode === 'forgot' && 'Enter your registered email and a new password to recover access.'}
          </p>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* CLIENT ID CONFIGURATION PROMPT (only if requested or missing) */}
        {showClientIdInput && (
          <form onSubmit={handleSaveClientId} className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
              <Settings className="w-4 h-4 text-amber-600" />
              <span>Connect Google OAuth Client ID</span>
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-300">
              Paste your Google OAuth Client ID (from Google Cloud Console) to activate real Google Sign-In:
            </p>
            <input
              type="text"
              required
              autoFocus
              value={inputClientId}
              onChange={(e) => setInputClientId(e.target.value)}
              placeholder="e.g. 123456789-xxxxxx.apps.googleusercontent.com"
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowClientIdInput(false)}
                className="py-1.5 px-3 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                Connect Client ID
              </button>
            </div>
          </form>
        )}

        {/* REAL GOOGLE SIGN-IN SECTION */}
        {mode !== 'forgot' && (
          <div className="space-y-3">
            {/* Universal Google Trigger Button (triggers real Google account chooser popup) */}
            <button
              type="button"
              onClick={handleRealGoogleSignIn}
              disabled={isSubmitting}
              className="w-full min-h-[46px] px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 dark:bg-[#151b28] dark:hover:bg-[#1a2233] border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-3 transition active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {/* Google G Logo SVG */}
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
              <span>{isSubmitting ? 'Connecting with Google...' : 'Continue with Google'}</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center pt-1">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="bg-white dark:bg-[#0f1522] px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider absolute">
                or with email
              </span>
            </div>
          </div>
        )}

        {/* TABS: SIGN IN VS CREATE ACCOUNT */}
        {mode !== 'forgot' && (
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900/80 p-1 border border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={() => handleSwitchMode('signin')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white dark:bg-[#1a2233] text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('register')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                mode === 'register'
                  ? 'bg-white dark:bg-[#1a2233] text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* NORMAL SIGN IN FORM */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => handleSwitchMode('forgot')}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition shadow-md shadow-blue-500/20 cursor-pointer active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In with Email</span>
              )}
            </button>
          </form>
        )}

        {/* NORMAL SIGN UP FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Create Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {password && (
                <div className="mt-1.5 space-y-1">
                  <div className="h-1 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${strength.color} transition-all duration-300`} 
                      style={{ width: `${strength.percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>Password strength:</span>
                    <span className="font-semibold">{strength.label}</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className={`w-full pl-9 pr-10 py-2 bg-slate-50 dark:bg-slate-900/60 border rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                    confirmPassword && confirmPassword !== password 
                      ? 'border-rose-400 focus:ring-rose-500' 
                      : 'border-slate-300 dark:border-slate-700 focus:ring-blue-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 mt-1 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition shadow-md shadow-blue-500/20 cursor-pointer active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Account & Start Practicing</span>
              )}
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {mode === 'forgot' && (
          <form onSubmit={handleResetPassword} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleSwitchMode('signin')}
                className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition shadow-md shadow-blue-500/20 cursor-pointer active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Founder CEO Note */}
        <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-[11px] sm:text-xs text-blue-950 dark:text-blue-100">
              Personalized Founder Welcome Email
            </p>
            <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
              When you sign in, you'll receive a confirmation email from <strong>Oluwole Inuoluwadunsimi</strong> (Founder & CEO, SATify) via <strong>satifysatceo@gmail.com</strong>.
            </p>
          </div>
        </div>

        {/* Safe Non-Active Question Bank Guarantee */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>100% Non-Active Question Bank • Free & Private</span>
        </div>
      </div>
    </div>
  );
};
