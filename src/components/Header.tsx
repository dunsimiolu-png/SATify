import React, { useState, useEffect } from 'react';
import { 
  Highlighter, 
  Calculator, 
  BookOpen, 
  Maximize2, 
  Minimize, 
  Clock, 
  ChevronDown,
  SlidersHorizontal,
  Home,
  Split,
  Sun,
  Moon,
  Menu,
  User,
  LogOut,
  Cookie,
  MoreHorizontal,
  X,
  Columns,
  Rows,
  Check
} from 'lucide-react';
import { Logo } from './Logo';
import { MockQuestion } from '../types/quiz';
import { getQuestionTargetSeconds, getPacePillColor, formatSecondsToPace } from '../utils/pacingTargets';
import { useTheme } from '../utils/theme';
import { UserProfile, logoutUser } from '../utils/auth';

interface HeaderProps {
  section?: string;
  moduleNumber?: number;
  onOpenDirections: () => void;
  onOpenReference: () => void;
  onOpenCalculator: () => void;
  onOpenFilter: () => void;
  onOpenGrammarGuide?: () => void;
  isAnnotateActive: boolean;
  onToggleAnnotate: () => void;
  onExitToDashboard?: () => void;
  onOpenNav?: () => void;
  currentQuestion?: MockQuestion;
  isAnswerChecked?: boolean;
  user?: UserProfile | null;
  onOpenLogin?: () => void;
  onOpenAccount?: () => void;
  onToggleLayout?: () => void;
  isTwoPane?: boolean;
  isAnswered?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  section = 'Reading and Writing',
  moduleNumber = 1,
  onOpenDirections,
  onOpenReference,
  onOpenCalculator,
  onOpenFilter,
  onOpenGrammarGuide,
  isAnnotateActive,
  onToggleAnnotate,
  onExitToDashboard,
  onOpenNav,
  currentQuestion,
  isAnswerChecked = false,
  user,
  onOpenLogin,
  onOpenAccount,
  onToggleLayout,
  isTwoPane = true,
  isAnswered = false,
}) => {
  const [isTimerHidden, setIsTimerHidden] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState<boolean>(false);
  const { isDark, toggleTheme } = useTheme();

  // CookSAT Count-Up Per-Question Stopwatch starting at 00:00
  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(0);

  // Reset to 00:00 on question transition
  useEffect(() => {
    setStopwatchSeconds(0);
  }, [currentQuestion?.id]);

  // Tick stopwatch while question is active, pause when answer is checked
  useEffect(() => {
    if (isAnswerChecked) return;
    const interval = setInterval(() => {
      setStopwatchSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentQuestion?.id, isAnswerChecked]);

  const targetSeconds = currentQuestion ? getQuestionTargetSeconds(currentQuestion) : 60;
  const paceColor = getPacePillColor(stopwatchSeconds, targetSeconds, isAnswerChecked);

  const formatStopwatch = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Close mobile tools dropdown when clicking outside
  useEffect(() => {
    if (!isMobileToolsOpen) return;
    const handleClick = () => setIsMobileToolsOpen(false);
    const timer = setTimeout(() => document.addEventListener('click', handleClick), 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClick);
    };
  }, [isMobileToolsOpen]);

  // Close user profile dropdown when clicking outside
  useEffect(() => {
    if (!isUserMenuOpen) return;
    const handleClick = () => setIsUserMenuOpen(false);
    const timer = setTimeout(() => document.addEventListener('click', handleClick), 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClick);
    };
  }, [isUserMenuOpen]);

  return (
    <header className="shrink-0 w-full bg-white dark:bg-[#11131A] border-b border-zinc-200 dark:border-[#222634] text-zinc-950 dark:text-[#F4F4F6] select-none z-30 pt-[max(env(safe-area-inset-top,0px),4px)]">
      <div className="px-3 sm:px-5 flex items-center justify-between gap-2 h-14">
        {/* Left Section: Nav + Dashboard + Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-1">
          {onOpenNav && (
            <button
              onClick={onOpenNav}
              className="lg:hidden p-1.5 rounded-lg border border-zinc-200 dark:border-[#222634] bg-zinc-50 dark:bg-[#181B24] hover:bg-zinc-100 dark:hover:bg-[#202534] text-zinc-700 dark:text-[#8E95A5] transition-colors duration-150 shrink-0 h-9 w-9 flex items-center justify-center cursor-pointer"
              title="Open Navigation Menu"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-4 h-4 text-blue-700 dark:text-blue-400" strokeWidth={1.75} />
            </button>
          )}

          {onExitToDashboard && (
            <button
              onClick={onExitToDashboard}
              className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-[#222634] bg-zinc-50 dark:bg-[#181B24] hover:bg-zinc-100 dark:hover:bg-[#202534] text-zinc-700 dark:text-[#8E95A5] text-xs font-semibold transition-colors duration-150 shrink-0 flex items-center gap-1.5 cursor-pointer"
              title="Return to Dashboard"
            >
              <Home className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" strokeWidth={1.75} />
              <span className="hidden md:inline">Dashboard</span>
            </button>
          )}

          {/* Logo */}
          <div className="shrink-0">
            <Logo variant="header" inverted={isDark} />
          </div>

          {/* Title & Directions */}
          <div className="flex flex-col justify-center min-w-0 hidden sm:flex">
            <div className="flex items-center gap-2">
              <span className="text-zinc-950 dark:text-[#F4F4F6] font-semibold text-xs sm:text-sm tracking-tight truncate">
                <span className="hidden lg:inline text-zinc-500 dark:text-[#8E95A5]">Section 1, Module {moduleNumber}: </span>Reading & Writing
              </span>
              {isAnswered && (
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-semibold">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                  <span>Answered</span>
                </span>
              )}
            </div>
            <button
              onClick={onOpenDirections}
              className="mt-0.5 text-left text-[11px] text-zinc-500 hover:text-zinc-950 dark:text-[#8E95A5] dark:hover:text-[#F4F4F6] font-medium flex items-center gap-0.5 w-fit transition-colors duration-150 cursor-pointer"
            >
              <span>Directions</span>
              <ChevronDown className="w-3 h-3" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Center: Count-up Stopwatch */}
        <div className="flex flex-col items-center shrink-0">
          {isTimerHidden ? (
            <button
              onClick={() => setIsTimerHidden(false)}
              className="flex items-center gap-1 px-3 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-[#181B24] dark:hover:bg-[#202534] border border-zinc-200 dark:border-[#222634] rounded-md text-[11px] font-medium text-zinc-700 dark:text-[#8E95A5] transition-colors duration-150 cursor-pointer"
              title="Show timer"
            >
              <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Show</span>
            </button>
          ) : (
            <div className="flex flex-col items-center">
              <div className="text-base sm:text-lg font-mono font-semibold tabular-nums tracking-tight text-zinc-950 dark:text-[#F4F4F6] leading-tight">
                {formatStopwatch(stopwatchSeconds)}
              </div>
              <div className="hidden sm:flex items-center gap-1.5 mt-0.5">
                <button
                  onClick={() => setIsTimerHidden(true)}
                  className="px-1.5 py-0.2 text-zinc-400 hover:text-zinc-950 dark:text-[#8E95A5] dark:hover:text-[#F4F4F6] text-[10px] font-mono transition-colors duration-150 cursor-pointer"
                >
                  Hide
                </button>
                {currentQuestion && (
                  <div
                    className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-mono tabular-nums border transition-colors ${paceColor.badgeClass}`}
                    title={`Pacing target for ${currentQuestion.skill} (${currentQuestion.difficulty}): ${targetSeconds}s`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${paceColor.dotClass}`} />
                    <span>{formatSecondsToPace(stopwatchSeconds)} / {formatSecondsToPace(targetSeconds)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Section: Tools - Responsive */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Desktop tools */}
          <div className="hidden sm:flex items-center gap-1">
            {/* Filter */}
            <button
              onClick={onOpenFilter}
              className="h-9 px-2.5 rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-[#222634] hover:bg-zinc-100 dark:hover:bg-[#181B24] text-zinc-700 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-[#F4F4F6] text-xs font-medium transition-colors duration-150 flex items-center gap-1.5 cursor-pointer"
              title="Configure Topics and Difficulty"
            >
              <SlidersHorizontal className="w-4 h-4 text-blue-700 dark:text-blue-400" strokeWidth={1.75} />
              <span className="hidden md:inline">Filter</span>
            </button>

            {/* Grammar Guide */}
            {onOpenGrammarGuide && (
              <button
                onClick={onOpenGrammarGuide}
                className="hidden md:flex h-9 px-2.5 rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-[#222634] hover:bg-zinc-100 dark:hover:bg-[#181B24] text-zinc-700 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-[#F4F4F6] text-xs font-medium transition-colors duration-150 items-center gap-1.5 cursor-pointer"
                title="Open Grammar Comparison Cheat Sheet"
              >
                <Split className="w-4 h-4 text-blue-700 dark:text-blue-400" strokeWidth={1.75} />
                <span className="hidden lg:inline">Grammar</span>
              </button>
            )}

            {/* Annotate */}
            <button
              onClick={onToggleAnnotate}
              className={`h-9 px-2.5 rounded-lg border text-xs font-medium transition-colors duration-150 flex items-center gap-1.5 cursor-pointer ${
                isAnnotateActive
                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                  : 'border-transparent hover:border-zinc-200 dark:hover:border-[#222634] hover:bg-zinc-100 dark:hover:bg-[#181B24] text-zinc-700 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-[#F4F4F6]'
              }`}
              title="Toggle highlighter mode"
            >
              <Highlighter className="w-4 h-4" strokeWidth={1.75} />
              <span className="hidden md:inline">Annotate</span>
            </button>

            {/* View Layout Toggle (Split vs Stacked) - Tablet & Desktop only */}
            {onToggleLayout && (
              <button
                onClick={onToggleLayout}
                className="hidden md:flex h-9 px-2.5 rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-[#222634] hover:bg-zinc-100 dark:hover:bg-[#181B24] text-zinc-700 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-[#F4F4F6] text-xs font-medium transition-colors duration-150 items-center gap-1.5 cursor-pointer"
                title={isTwoPane ? "Switch to Stacked View" : "Switch to Side-by-Side Split View"}
              >
                {isTwoPane ? (
                  <Rows className="w-4 h-4 text-blue-700 dark:text-blue-400" strokeWidth={1.75} />
                ) : (
                  <Columns className="w-4 h-4 text-blue-700 dark:text-blue-400" strokeWidth={1.75} />
                )}
                <span>{isTwoPane ? "Stacked" : "Split"}</span>
              </button>
            )}

            {/* Calculator & Math Reference: Hidden when practicing Reading & Writing */}
            {section !== 'Reading and Writing' && (
              <>
                <button
                  onClick={onOpenCalculator}
                  className="h-9 px-2.5 rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-[#222634] hover:bg-zinc-100 dark:hover:bg-[#181B24] text-zinc-700 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-[#F4F4F6] text-xs font-medium transition-colors duration-150 flex items-center gap-1.5 cursor-pointer"
                  title="Open Graphing / Scientific Calculator"
                >
                  <Calculator className="w-4 h-4" strokeWidth={1.75} />
                  <span className="hidden md:inline">Calculator</span>
                </button>
                <button
                  onClick={onOpenReference}
                  className="h-9 px-2.5 rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-[#222634] hover:bg-zinc-100 dark:hover:bg-[#181B24] text-zinc-700 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-[#F4F4F6] text-xs font-medium transition-colors duration-150 flex items-center gap-1.5 cursor-pointer"
                  title="Open SAT Geometry Reference Sheet"
                >
                  <BookOpen className="w-4 h-4" strokeWidth={1.75} />
                  <span className="hidden md:inline">Reference</span>
                </button>
              </>
            )}

            {/* Fullscreen - desktop only */}
            <button
              onClick={toggleFullscreen}
              className="hidden lg:flex h-9 w-9 rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-[#222634] hover:bg-zinc-100 dark:hover:bg-[#181B24] text-zinc-700 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-[#F4F4F6] transition-colors duration-150 items-center justify-center cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Desktop Fullscreen"}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" strokeWidth={1.75} /> : <Maximize2 className="w-4 h-4" strokeWidth={1.75} />}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="h-9 w-9 rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-[#222634] hover:bg-zinc-100 dark:hover:bg-[#181B24] text-zinc-700 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-[#F4F4F6] transition-colors duration-150 flex items-center justify-center cursor-pointer"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" strokeWidth={1.75} />
              ) : (
                <Moon className="w-4 h-4 text-zinc-700" strokeWidth={1.75} />
              )}
            </button>
          </div>

          {/* Mobile-only: compact overflow menu for tools (< sm / 640px) */}
          <div className="sm:hidden relative">
            <button
              onClick={(e) => { e.stopPropagation(); setIsMobileToolsOpen(!isMobileToolsOpen); }}
              className="p-2 rounded-xl bg-zinc-100 dark:bg-[#181B24] hover:bg-zinc-200 dark:hover:bg-[#202534] text-zinc-700 dark:text-[#8E95A5] transition-all duration-150 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer active:scale-95 border border-zinc-200 dark:border-[#222634]"
              title="More Tools"
              aria-label="More Tools"
            >
              {isMobileToolsOpen ? <X className="w-4 h-4" /> : <MoreHorizontal className="w-4 h-4" />}
            </button>

            {/* Dropdown popover for mobile tools */}
            {isMobileToolsOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-white/95 dark:bg-[#11131A]/95 backdrop-blur-md border border-zinc-200/90 dark:border-[#222634] shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <button onClick={() => { onOpenFilter(); setIsMobileToolsOpen(false); }} className="w-full p-2.5 text-left rounded-xl hover:bg-zinc-100 dark:hover:bg-[#181B24] flex items-center gap-2.5 cursor-pointer transition-colors duration-150 text-xs font-semibold text-zinc-800 dark:text-[#F4F4F6] active:scale-[0.98]">
                  <SlidersHorizontal className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                  <span>Filter Topics</span>
                </button>
                {onOpenGrammarGuide && (
                  <button onClick={() => { onOpenGrammarGuide(); setIsMobileToolsOpen(false); }} className="w-full p-2.5 text-left rounded-xl hover:bg-zinc-100 dark:hover:bg-[#181B24] flex items-center gap-2.5 cursor-pointer transition-colors duration-150 text-xs font-semibold text-zinc-800 dark:text-[#F4F4F6] active:scale-[0.98]">
                    <Split className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                    <span>Grammar Guide</span>
                  </button>
                )}
                <button onClick={() => { onToggleAnnotate(); setIsMobileToolsOpen(false); }} className={`w-full p-2.5 text-left rounded-xl flex items-center gap-2.5 cursor-pointer transition-colors duration-150 text-xs font-semibold active:scale-[0.98] ${isAnnotateActive ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800' : 'hover:bg-zinc-100 dark:hover:bg-[#181B24] text-zinc-800 dark:text-[#F4F4F6]'}`}>
                  <Highlighter className="w-4 h-4" />
                  <span>{isAnnotateActive ? 'Annotate ✓' : 'Annotate'}</span>
                </button>
                <button onClick={() => { onOpenDirections(); setIsMobileToolsOpen(false); }} className="w-full p-2.5 text-left rounded-xl hover:bg-zinc-100 dark:hover:bg-[#181B24] flex items-center gap-2.5 cursor-pointer transition-colors duration-150 text-xs font-semibold text-zinc-800 dark:text-[#F4F4F6] active:scale-[0.98]">
                  <BookOpen className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                  <span>Directions</span>
                </button>
                <div className="h-px bg-zinc-200 dark:bg-[#222634] my-1" />
                <button onClick={() => { toggleTheme(); setIsMobileToolsOpen(false); }} className="w-full p-2.5 text-left rounded-xl hover:bg-zinc-100 dark:hover:bg-[#181B24] flex items-center gap-2.5 cursor-pointer transition-colors duration-150 text-xs font-semibold text-zinc-800 dark:text-[#F4F4F6] active:scale-[0.98]">
                  {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>
            )}
          </div>

          {/* User Profile Avatar / Sign In */}
          {user ? (
            <div className="relative shrink-0 ml-1">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-8 h-8 rounded-full overflow-hidden border-2 border-blue-600 focus:outline-hidden flex items-center justify-center bg-blue-600 text-white font-bold text-xs cursor-pointer shadow-xs transition-transform duration-150 hover:scale-105 active:scale-95"
                title={user.name}
              >
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{user.name.charAt(0).toUpperCase()}</span>
                )}
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl bg-white/95 dark:bg-[#11131A]/95 backdrop-blur-md border border-zinc-200/90 dark:border-[#222634] shadow-2xl p-2 text-xs text-zinc-950 dark:text-[#F4F4F6] z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2.5 border-b border-zinc-100 dark:border-[#181B24]">
                    <p className="font-bold text-zinc-950 dark:text-[#F4F4F6] truncate">{user.name}</p>
                    <p className="text-[11px] text-zinc-500 dark:text-[#8E95A5] truncate mt-0.5">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      if (onOpenAccount) onOpenAccount();
                    }}
                    className="w-full p-2 text-left rounded-xl hover:bg-zinc-100 dark:hover:bg-[#181B24] flex items-center gap-2 cursor-pointer transition-colors text-zinc-800 dark:text-[#F4F4F6] font-medium active:scale-[0.98] mt-1"
                  >
                    <User className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                    <span>Account & Email Sync</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      window.dispatchEvent(new CustomEvent('satify_open_cookie_preferences'));
                    }}
                    className="w-full p-2 text-left rounded-xl hover:bg-zinc-100 dark:hover:bg-[#181B24] flex items-center gap-2 cursor-pointer transition-colors text-zinc-800 dark:text-[#F4F4F6] active:scale-[0.98]"
                  >
                    <Cookie className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                    <span>Cookie Preferences</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logoutUser();
                    }}
                    className="w-full p-2 text-left rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2 cursor-pointer transition-colors active:scale-[0.98]"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 font-semibold text-xs flex items-center gap-1.5 transition-all duration-150 shadow-xs hover:shadow cursor-pointer active:scale-95 shrink-0 ml-1"
              title="Sign in with Google"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Signature Bluebook horizontal dashed divider strip */}
      <div className="bluebook-dashed-border" />
    </header>
  );
};
