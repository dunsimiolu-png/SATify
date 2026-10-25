import React, { useState } from 'react';
import { 
  X, 
  LogOut, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  UserCheck, 
  Send, 
  Loader2, 
  ExternalLink,
  Smartphone,
  Laptop,
  Copy,
  Check,
  RefreshCw,
  ArrowRightLeft,
  Cloud,
  CheckCircle2
} from 'lucide-react';
import { UserProfile, triggerLoginEmail, showAuthToast } from '../utils/auth';
import { 
  pullCloudProgress, 
  pushCloudProgress, 
  exportUserData, 
  importUserData 
} from '../utils/storage';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onSignOut: () => void;
  onSwitchAccount: () => void;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  user,
  onSignOut,
  onSwitchAccount,
}) => {
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [emailSuccess, setEmailSuccess] = useState<boolean>(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [showManualTransfer, setShowManualTransfer] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [importCode, setImportCode] = useState<string>('');
  const [importFeedback, setImportFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen || !user) return null;

  const handleCloudSync = async () => {
    setIsSyncingCloud(true);
    setSyncFeedback(null);
    try {
      const pullRes = await pullCloudProgress();
      await pushCloudProgress();
      const count = pullRes?.count;
      const msg = count !== undefined ? `✓ Synced! (${count} questions tracked)` : '✓ Synced across your devices!';
      setSyncFeedback(msg);
      showAuthToast(msg);
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch (e) {
      showAuthToast('Local progress saved.');
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const handleCopySyncCode = () => {
    try {
      const code = exportUserData();
      navigator.clipboard.writeText(code);
      setIsCopied(true);
      showAuthToast('✓ Offline backup code copied!');
      setTimeout(() => setIsCopied(false), 3000);
    } catch (e) {
      showAuthToast('Failed to copy to clipboard.');
    }
  };

  const handleImportSyncCode = () => {
    const res = importUserData(importCode);
    setImportFeedback(res);
    if (res.success) {
      showAuthToast(`✓ ${res.message}`);
      setImportCode('');
      pushCloudProgress().catch(() => {});
      setTimeout(() => {
        setImportFeedback(null);
      }, 3000);
    }
  };

  const handleSendTestEmail = async () => {
    setIsSendingEmail(true);
    setEmailSuccess(false);
    try {
      await triggerLoginEmail(user, 'Manual Request from Account Menu');
      setEmailSuccess(true);
      setTimeout(() => setEmailSuccess(false), 4000);
    } catch (e) {
      showAuthToast('Failed to send email. Check your connection.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'October 2026';

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-[#11131A] border border-zinc-200/90 dark:border-[#222634] rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4 text-zinc-950 dark:text-[#F4F4F6] animate-in zoom-in-95 duration-200 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#181B24] transition-all duration-150 active:scale-90 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Profile Header Card */}
        <div className="flex items-center gap-4 pt-1">
          <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-blue-600 bg-blue-600 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-md">
            {user.picture ? (
              <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span>{user.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h2 className="text-lg font-black text-slate-900 dark:text-white truncate">
                {user.name}
              </h2>
              <span className="p-0.5 text-blue-600 dark:text-blue-400" title="Verified Profile">
                <UserCheck className="w-4 h-4" />
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono">
              {user.email}
            </p>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                Joined {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Active Student</span>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-semibold text-[11px] truncate">Non-Active Bank</span>
          </div>
        </div>

        {/* Send Login Email Button */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              Login Confirmation Email
            </span>
            <span className="text-[10px] text-slate-400">Sent on every login</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Need a fresh email with your Bluebook pacing targets and founder tips? Send a copy directly to <strong>{user.email}</strong>.
          </p>
          <button
            onClick={handleSendTestEmail}
            disabled={isSendingEmail}
            className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
              emailSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
            }`}
          >
            {isSendingEmail ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Sending Email...</span>
              </>
            ) : emailSuccess ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Email Sent! Check your inbox</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Send Login Email to {user.email}</span>
              </>
            )}
          </button>
        </div>

        {/* Automatic Account Cloud Sync Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/90 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/20 border border-blue-200/80 dark:border-blue-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  Automatic Account Sync
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Linked to <span className="font-semibold text-slate-800 dark:text-slate-200">{user.email}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-semibold bg-white/80 dark:bg-slate-900/60 px-2 py-1 rounded-lg border border-blue-100 dark:border-blue-900/40">
              <Laptop className="w-3.5 h-3.5" />
              <ArrowRightLeft className="w-3 h-3" />
              <Smartphone className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5 bg-white/70 dark:bg-slate-900/50 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Study streak & daily practice sync automatically</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Questions answered & accuracy tracked across all devices</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Sign in with this email on iPad or mobile to continue</span>
            </div>
          </div>

          <button
            onClick={handleCloudSync}
            disabled={isSyncingCloud}
            className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin' : ''}`} />
            <span>{isSyncingCloud ? 'Syncing with Cloud...' : syncFeedback || 'Sync Now'}</span>
          </button>

          {/* Collapsible offline backup tools for emergency offline transfers */}
          <div className="pt-1 text-center">
            <button
              onClick={() => setShowManualTransfer(!showManualTransfer)}
              className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline cursor-pointer"
            >
              {showManualTransfer ? 'Hide manual backup code' : 'Offline transfer code (optional)'}
            </button>
          </div>

          {showManualTransfer && (
            <div className="pt-2 space-y-2 border-t border-blue-200/50 dark:border-blue-900/40 animate-in fade-in duration-150">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCopySyncCode}
                  className="py-1.5 px-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{isCopied ? 'Copied!' : 'Copy Code'}</span>
                </button>
                <button
                  onClick={() => {
                    if (importCode.trim()) {
                      handleImportSyncCode();
                    }
                  }}
                  disabled={!importCode.trim()}
                  className="py-1.5 px-2 rounded-lg bg-emerald-600 disabled:opacity-40 text-white font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Check className="w-3 h-3" />
                  <span>Import</span>
                </button>
              </div>
              <input
                type="text"
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                placeholder="Paste backup code..."
                className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono"
              />
              {importFeedback && (
                <p className={`text-[10px] ${importFeedback.success ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {importFeedback.message}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => {
              onClose();
              onSwitchAccount();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Switch Account / Sign In with Another Email</span>
          </button>

          <button
            onClick={() => {
              onSignOut();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out of SATify</span>
          </button>
        </div>
      </div>
    </div>
  );
};
