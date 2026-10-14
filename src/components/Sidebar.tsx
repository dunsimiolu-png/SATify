import React from 'react';
import { 
  Home, 
  BarChart3, 
  Bookmark, 
  BookOpen, 
  Calculator, 
  Layers, 
  Lock,
  ChevronRight,
  Sparkles,
  Zap,
  Sun,
  Moon,
  X
} from 'lucide-react';
import { Logo } from './Logo';
import { useTheme } from '../utils/theme';

export type AppRoute = 
  | 'home' 
  | 'analytics' 
  | 'saved' 
  | 'question-bank' 
  | 'rush'
  | 'vocab' 
  | 'calculator';

interface SidebarProps {
  currentRoute: AppRoute;
  onRouteChange: (route: AppRoute) => void;
  savedCount?: number;
  className?: string;
  onCloseMobile?: () => void;
  onLock?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onRouteChange,
  savedCount = 0,
  className = '',
  onCloseMobile,
  onLock,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const navItems: { id: AppRoute; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { 
      id: 'saved', 
      label: 'Saved & Mistakes', 
      icon: <Bookmark className="w-4 h-4" />, 
      badge: savedCount > 0 ? savedCount : undefined 
    },
    { id: 'question-bank', label: 'Question Bank', icon: <Layers className="w-4 h-4" /> },
    { id: 'rush', label: '⚡ Question Rush', icon: <Zap className="w-4 h-4 text-amber-500" /> },
    { id: 'vocab', label: 'Vocab', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'calculator', label: 'Score Calculator', icon: <Calculator className="w-4 h-4" /> },
  ];

  return (
    <aside className={`w-64 h-full bg-white dark:bg-[#070a10] border-r border-slate-200 dark:border-[#1a1f2c] flex flex-col justify-between text-slate-700 dark:text-gray-300 select-none z-30 shrink-0 ${className}`}>
      {/* Top Header: SATIFY Logo & Locked SAT Badge */}
      <div className="p-5 border-b border-slate-100 dark:border-[#1a1f2c]/80 space-y-4">
        {/* Brand Logo & Mobile Close */}
        <div className="flex items-center justify-between">
          <Logo size="sm" variant="full" inverted={isDark} />
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Locked SAT Badge */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#141a24] border border-slate-200 dark:border-[#222b3d] shadow-inner">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-900 dark:text-white text-xs tracking-wider">SAT DIGITAL</span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white dark:bg-[#0b0e14] text-[10px] text-slate-500 dark:text-gray-400 font-medium border border-slate-200 dark:border-gray-800">
            <Lock className="w-3 h-3 text-amber-500" />
            <span>LOCKED</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">
          Navigation
        </div>

        {navItems.map((item) => {
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onRouteChange(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all group cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold'
                  : 'text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#151a24]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-white' : 'text-slate-400 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined ? (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white text-blue-600' : 'bg-slate-100 dark:bg-[#222b3d] text-slate-700 dark:text-gray-300'
                }`}>
                  {item.badge}
                </span>
              ) : isActive ? (
                <ChevronRight className="w-3.5 h-3.5 text-white/70" />
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Footer Copyright & Theme Toggle */}
      <div className="p-4 border-t border-slate-100 dark:border-[#1a1f2c] bg-slate-50 dark:bg-[#080a0f] flex items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-600 dark:text-gray-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold">SATify Suite 2026</span>
          </div>
          <div className="text-[10px] text-slate-400 dark:text-gray-500 font-medium">
            © Oluwole Inuoluwadunsimi 2026
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Lock App button */}
          {onLock && (
            <button
              onClick={onLock}
              className="p-2 rounded-lg bg-white dark:bg-[#151a24] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 hover:text-rose-600 dark:text-gray-300 dark:hover:text-rose-400 transition group border border-slate-200 dark:border-[#222b3d] cursor-pointer"
              title="Lock App (Private Mode)"
              aria-label="Lock App"
            >
              <Lock className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          )}

          {/* Theme toggle button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white dark:bg-[#151a24] hover:bg-slate-100 dark:hover:bg-[#202738] text-slate-700 dark:text-gray-300 transition group border border-slate-200 dark:border-[#222b3d] cursor-pointer"
            title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
            aria-label="Toggle dark/light theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 group-hover:-rotate-12 transition-transform" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
