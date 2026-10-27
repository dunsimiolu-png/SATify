import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Home, 
  ChevronDown, 
  SlidersHorizontal, 
  Highlighter, 
  Rows, 
  Columns, 
  Maximize2, 
  Minimize, 
  Sun, 
  Moon, 
  Calculator, 
  BookOpen, 
  Split, 
  Check, 
  MoreHorizontal,
  X,
  User,
  LogOut
} from 'lucide-react';
import { Logo } from './Logo';
import { useTheme } from '../utils/theme';
import { MockQuestion } from '../types/quiz';
import { getQuestionTargetSeconds, getPacePillColor, formatSecondsToPace } from '../utils/pacingTargets';
import { UserProfile, logoutUser } from '../utils/auth';

interface HeaderProps {
  section: string;
  moduleNumber: number;
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
  isAnswered?: boolean;
  user?: UserProfile | null;
  onOpenLogin?: () => void;
  onOpenAccount?: () => void;
  onToggleLayout?: () => void;
  isTwoPane?: boolean;
  isMathSingleColumn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  section,
  moduleNumber,
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
  isAnswered = false,
  user,
  onOpenLogin,
  onOpenAccount,
  onToggleLayout,
  isTwoPane = true,
  isMathSingleColumn = false,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(0);
  const [isTimerHidden, setIsTimerHidden] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);

  // Math detection
  const isMath = currentQuestion?.section === 'Math' || section === 'Math' || ['Algebra', 'Advanced Math', 'Problem-Solving and Data Analysis', 'Geometry and Trigonometry'].includes(currentQuestion?.domain || '');

  // Reset stopwatch on question change
  useEffect(() => {
    setStopwatchSeconds(0);
  }, [currentQuestion?.id]);

  // Per-question count-up timer
  useEffect(() => {
    if (isAnswerChecked) return;
    const interval = setInterval(() => {
      setStopwatchSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isAnswerChecked, currentQuestion?.id]);

  // Format stopwatch as M:SS
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Pacing calibration
  const targetSeconds = currentQuestion ? getQuestionTargetSeconds(currentQuestion) : 60;
  const paceColor = getPacePillColor(stopwatchSeconds, targetSeconds, isAnswerChecked);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Close mobile tools dropdown on escape or outside click
  useEffect(() => {
    if (!isMobileToolsOpen) return;
    const handleClose = () => setIsMobileToolsOpen(false);
    const timer = setTimeout(() => document.addEventListener('click', handleClose), 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClose);
    };
  }, [isMobileToolsOpen]);

  // Close user profile dropdown on escape or outside click
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
                <span className="hidden lg:inline text-zinc-500 dark:text-[#8E95A5]">
                  {isMath ? 'Section 2, Module 1: ' : `Section 1, Module ${moduleNumber}: `}
                </span>
                {isMath ? 'Math' : 'Reading & Writing'}
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
              className="px-2.5 py-1 rounded-md border border-zinc-200 dark:border-[#222634] bg-zinc-50 dark:bg-[#181B24] hover:bg-zinc-100 dark:hover:bg-[#202534] text-xs font-mono text-zinc-600 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-[#F4F4F6] transition-colors duration-150 cursor-pointer"
            >
              Show Timer
            </button>
          ) : (
            <div className="flex flex-col items-center">
              <span className="font-mono text-base sm:text-lg font-bold tracking-tight text-zinc-950 dark:text-[#F4F4F6] tabular-nums leading-none">
                {formatTime(stopwatchSeconds)}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
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
              className="h-9 px-2.5 rounded-lg border border-transparent hover:border-zinc-200 dark:border-[#222634] hover:bg-zinc-100 dark:hover:bg-[#181B24] text-zinc-700 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-[#F4F4F6] text-xs font-medium transition-colors duration-150 flex items-center gap-1.5 cursor-pointer"
              title="Configure Topics and Difficulty"
            >
              <SlidersHorizontal className="w-4 h-4 text-blue-700 dark:text-blue-400" strokeWidth={1.75} />
              <span className="hidden md:inline">Filter</span>
            </button>

            {/* Grammar Guide: Hidden in Math */}
            {onOpenGrammarGuide && !isMath && (
              <button
                onClick={onOpenGrammarGuide}
                className="hidden md:flex h-9 px-2.5 rounded-lg border border-transparent hover:border-zinc-200 dark:border-[#222634] hover:bg-zinc-100 dark:hover:bg-[#181B24] text-zinc-700 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-[#F4F4F6] text-xs font-medium transition-colors duration-150 items-center gap-1.5 cursor-pointer"
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
                  : 'border-transparent hover:border-zinc-200 dark:border-[#222634] hover:bg-zinc-100 dark:hover:bg-[#181B24] text-zinc-700 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-[#F4F4F6]'
              }`}
              title="Toggle highlighter mode"
            >
              <Highlighter className="w-4 h-4" strokeWidth={1.75} />
              <span className="hidden md:inline">Annotate</span>
            </button>

            {/* View Layout Toggle (Split vs Stacked) - Tablet & Desktop only */}
            {onToggleLayout && !isMathSingleColumn && (
              <button
                onClick={onToggleLayout}
                className="hidden md:flex h-9 px-2.5 rounded-lg border border-transparent hover:border-zinc-200 dark:border-[#222634] hover:bg-zinc-100 dark:hover:bg-[#181B24] text-zinc-700 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-[#F4F4F6] text-xs font-medium transition-colors duration-150 items-center gap-1.5 cursor-pointer"
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

            {/* Calculator & Math Reference: Rendered when practicing Math */}
            {isMath && (
              <>
                <button
                  onClick={onOpenCalculator}
                  className="h-9 px-2.5 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-800 dark:text-blue-300 text-xs font-semibold transition-colors duration-150 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Open Graphing / Scientific Calculator (Keyboard shortcut: C)"
                >
                  <Calculator className="w-4 h-4 text-blue-700 dark:text-blue-400" strokeWidth={2} />
                  <span className="hidden md:inline">Calculator</span>
                  <kbd className="hidden lg:inline-block px-1.5 py-0.2 text-[10px] font-mono font-bold bg-white dark:bg-[#11131A] border border-blue-200 dark:border-blue-800/80 rounded text-blue-700 dark:text-blue-300">
                    C
                  </kbd>
                </button>
                <button
                  onClick={onOpenReference}
                  className="h-9 px-2.5 rounded-lg border border-zinc-200 dark:border-[#222634] hover:bg-zinc-100 dark:hover:bg-[#181B24] text-zinc-700 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-[#F4F4F6] text-xs font-medium transition-colors duration-150 flex items-center gap-1.5 cursor-pointer"
                  title="Open Official Digital SAT Math Reference Sheet"
                >
                  <BookOpen className="w-4 h-4 text-blue-700 dark:text-blue-400" strokeWidth={1.75} />
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

          {/* Mobile quick calculator button */}
          {isMath && (
            <button
              onClick={onOpenCalculator}
              className="sm:hidden p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-400 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer active:scale-95 shadow-2xs"
              title="Open Calculator (C)"
              aria-label="Open Calculator"
            >
              <Calculator className="w-4 h-4" />
            </button>
          )}

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
                {isMath && (
                  <>
                    <button onClick={() => { onOpenCalculator(); setIsMobileToolsOpen(false); }} className="w-full p-2.5 text-left rounded-xl hover:bg-zinc-100 dark:hover:bg-[#181B24] flex items-center gap-2.5 cursor-pointer transition-colors duration-150 text-xs font-semibold text-blue-700 dark:text-blue-400 active:scale-[0.98]">
                      <Calculator className="w-4 h-4" />
                      <span>Calculator (C)</span>
                    </button>
                    <button onClick={() => { onOpenReference(); setIsMobileToolsOpen(false); }} className="w-full p-2.5 text-left rounded-xl hover:bg-zinc-100 dark:hover:bg-[#181B24] flex items-center gap-2.5 cursor-pointer transition-colors duration-150 text-xs font-semibold text-zinc-800 dark:text-[#F4F4F6] active:scale-[0.98]">
                      <BookOpen className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                      <span>Reference Sheet</span>
                    </button>
                  </>
                )}
                <button onClick={() => { onOpenFilter(); setIsMobileToolsOpen(false); }} className="w-full p-2.5 text-left rounded-xl hover:bg-zinc-100 dark:hover:bg-[#181B24] flex items-center gap-2.5 cursor-pointer transition-colors duration-150 text-xs font-semibold text-zinc-800 dark:text-[#F4F4F6] active:scale-[0.98]">
                  <SlidersHorizontal className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                  <span>Filter Topics</span>
                </button>
                {onOpenGrammarGuide && !isMath && (
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

          {/* User Profile / Auth Pill */}
          <div className="relative pl-1">
            {user ? (
              <div>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsUserMenuOpen(!isUserMenuOpen); }}
                  className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-xl border border-zinc-200 dark:border-[#222634] bg-zinc-50 dark:bg-[#181B24] hover:bg-zinc-100 dark:hover:bg-[#202534] transition-colors duration-150 cursor-pointer text-xs font-medium"
                  title="User Profile Menu"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline text-zinc-800 dark:text-[#F4F4F6] max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3 h-3 text-zinc-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-zinc-100 dark:border-[#181B24]">
                      <div className="font-semibold text-xs text-zinc-950 dark:text-[#F4F4F6] truncate">{user.name}</div>
                      <div className="text-[10px] text-zinc-500 dark:text-[#8E95A5] truncate">{user.email}</div>
                    </div>
                    {onOpenAccount && (
                      <button
                        onClick={() => { onOpenAccount(); setIsUserMenuOpen(false); }}
                        className="w-full px-3 py-2 text-left rounded-xl hover:bg-zinc-100 dark:hover:bg-[#181B24] text-xs font-medium flex items-center gap-2 text-zinc-700 dark:text-[#C5CAD6] cursor-pointer mt-1"
                      >
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        <span>Account Settings</span>
                      </button>
                    )}
                    <button
                      onClick={() => { logoutUser(); setIsUserMenuOpen(false); window.location.reload(); }}
                      className="w-full px-3 py-2 text-left rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium flex items-center gap-2 text-rose-600 dark:text-rose-400 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              onOpenLogin && (
                <button
                  onClick={onOpenLogin}
                  className="px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 font-semibold text-xs transition-colors duration-150 cursor-pointer active:scale-95 shadow-2xs"
                >
                  Sign In
                </button>
              )
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
