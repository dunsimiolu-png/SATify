import React from 'react';
import { 
  Home, 
  BarChart3, 
  Bookmark, 
  BookOpen, 
  Calculator, 
  Layers, 
  Zap,
  Sun,
  Moon,
  X,
  User,
  LogOut
} from 'lucide-react';
import { Logo } from './Logo';
import { useTheme } from '../utils/theme';
import { UserProfile, logoutUser } from '../utils/auth';

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
  user?: UserProfile | null;
  onOpenLogin?: () => void;
  onOpenAccount?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onRouteChange,
  savedCount = 0,
  className = '',
  onCloseMobile,
  user,
  onOpenLogin,
  onOpenAccount,
}) => {
  const { isDark, toggleTheme } = useTheme();

  const navItems: { id: AppRoute; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'home', label: 'Dashboard', icon: <Home className="w-4 h-4" strokeWidth={1.75} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" strokeWidth={1.75} /> },
    { 
      id: 'saved', 
      label: 'Saved & Review', 
      icon: <Bookmark className="w-4 h-4" strokeWidth={1.75} />, 
      badge: savedCount > 0 ? savedCount : undefined 
    },
    { id: 'question-bank', label: 'Question Bank', icon: <Layers className="w-4 h-4" strokeWidth={1.75} /> },
    { id: 'rush', label: 'Question Rush', icon: <Zap className="w-4 h-4 text-amber-500" strokeWidth={1.75} /> },
    { id: 'vocab', label: 'Vocab SRS', icon: <BookOpen className="w-4 h-4" strokeWidth={1.75} /> },
    { id: 'calculator', label: 'Score Calculator', icon: <Calculator className="w-4 h-4" strokeWidth={1.75} /> },
  ];

  return (
    <aside className={`w-60 h-full bg-white dark:bg-[#11131A] border-r border-zinc-200 dark:border-[#222634] flex flex-col justify-between text-zinc-950 dark:text-[#F4F4F6] select-none z-30 shrink-0 ${className}`}>
      {/* Top Header: SATIFY Logo */}
      <div className="p-4 border-b border-zinc-200 dark:border-[#222634]">
        <div className="flex items-center justify-between">
          <Logo size="sm" variant="full" inverted={isDark} />
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-md text-zinc-500 hover:text-zinc-950 dark:text-[#8E95A5] dark:hover:text-[#F4F4F6] hover:bg-zinc-100 dark:hover:bg-[#181B24] transition-colors duration-150 cursor-pointer"
              title="Close menu"
            >
              <X className="w-4 h-4" strokeWidth={1.75} />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        <div className="px-2.5 pb-1.5 text-[10px] font-mono font-semibold text-zinc-400 dark:text-[#8E95A5] uppercase tracking-wider">
          Workspace
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
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all duration-150 ease-spring group cursor-pointer active:scale-[0.98] ${
                isActive
                  ? 'bg-blue-50/90 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200/80 dark:border-blue-900/60 shadow-2xs'
                  : 'text-zinc-600 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-[#F4F4F6] hover:bg-zinc-100/70 dark:hover:bg-[#181B24]/80 hover:translate-x-0.5 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                  isActive ? 'text-blue-700 dark:text-blue-400' : 'text-zinc-500 dark:text-[#8E95A5] group-hover:text-zinc-950 dark:group-hover:text-[#F4F4F6]'
                }`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold tabular-nums transition-colors ml-2 shrink-0 ${
                  isActive 
                    ? 'bg-blue-700 text-white dark:bg-blue-600 shadow-xs' 
                    : 'bg-zinc-200/80 dark:bg-[#222634] text-zinc-700 dark:text-[#8E95A5]'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile / Sign In */}
      <div className="p-3 border-t border-zinc-200 dark:border-[#222634] bg-neutral-50/50 dark:bg-[#090A0F]/50">
        {user ? (
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
            <button
              type="button"
              onClick={onOpenAccount}
              className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer hover:opacity-90 transition-opacity active:scale-[0.98]"
              title="Account settings"
            >
              <div className="w-7 h-7 rounded-lg overflow-hidden border border-zinc-300 dark:border-[#222634] shrink-0 bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-zinc-950 dark:text-[#F4F4F6] truncate leading-tight">
                  {user.name}
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-[#8E95A5] truncate leading-tight mt-0.5">
                  {user.email}
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                logoutUser();
                if (onCloseMobile) onCloseMobile();
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors duration-150 shrink-0 cursor-pointer active:scale-95"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className="w-full py-2 px-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 font-semibold text-xs shadow-xs hover:shadow transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
          >
            <User className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>Sign In</span>
          </button>
        )}
      </div>

      {/* Footer Utility Cluster */}
      <div className="p-3 border-t border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] flex items-center justify-between text-zinc-500 dark:text-[#8E95A5]">
        <div className="text-[10px] font-mono tracking-tight">
          © SATify 2026
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-[#181B24] hover:text-zinc-950 dark:hover:text-[#F4F4F6] border border-transparent hover:border-zinc-200 dark:hover:border-[#222634] transition-all duration-150 cursor-pointer active:scale-90"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5 text-amber-400 hover:rotate-12 transition-transform duration-200" strokeWidth={1.75} />
            ) : (
              <Moon className="w-3.5 h-3.5 text-zinc-700 hover:-rotate-12 transition-transform duration-200" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
