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
  Moon
} from 'lucide-react';
import { Logo } from './Logo';
import { MockQuestion } from '../types/quiz';
import { getQuestionTargetSeconds, getPacePillColor, formatSecondsToPace } from '../utils/pacingTargets';
import { useTheme } from '../utils/theme';

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
  currentQuestion?: MockQuestion;
  isAnswerChecked?: boolean;
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
  currentQuestion,
  isAnswerChecked = false,
}) => {
  const [isTimerHidden, setIsTimerHidden] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
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

  return (
    <header className="shrink-0 w-full bg-white dark:bg-[#070a10] border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white select-none z-30 pt-[max(env(safe-area-inset-top,0px),8px)]">
      <div className="px-3 py-2 sm:px-5 sm:py-2.5 flex items-center justify-between gap-2 min-h-[50px] sm:min-h-[56px]">
        {/* Left Section: SATify Logo Container & Title & Directions */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onExitToDashboard && (
            <button
              onClick={onExitToDashboard}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs font-bold transition shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
              title="Return to SATify Dashboard"
            >
              <Home className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden md:inline ml-1.5">Dashboard</span>
            </button>
          )}

          {/* Logo container: strictly non-overlapping flex container */}
          <div className="shrink-0">
            <Logo variant="header" />
          </div>

          {/* Title & Directions Container */}
          <div className="flex flex-col justify-center min-w-0">
            <span className="text-gray-900 dark:text-white font-bold text-[12px] sm:text-[14px] lg:text-[15px] tracking-tight truncate">
              <span className="hidden sm:inline">Section 1, Module {moduleNumber}: </span>Reading & Writing
            </span>
            <button
              onClick={onOpenDirections}
              className="mt-0.5 text-left text-[11px] sm:text-[12px] text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium flex items-center gap-0.5 w-fit group transition-colors cursor-pointer"
            >
              <span>Directions</span>
              <ChevronDown className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Center: Count-up Stopwatch (00:00) */}
        <div className="flex flex-col items-center shrink-0">
          {isTimerHidden ? (
            <button
              onClick={() => setIsTimerHidden(false)}
              className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full text-[11px] font-semibold text-gray-700 dark:text-slate-300 transition cursor-pointer"
              title="Show timer"
            >
              <Clock className="w-3.5 h-3.5 text-gray-600 dark:text-slate-400" />
              <span>Show</span>
            </button>
          ) : (
            <div className="flex flex-col items-center">
              <div className="text-[15px] sm:text-[20px] font-bold tracking-tight text-slate-900 dark:text-white leading-none font-mono">
                {formatStopwatch(stopwatchSeconds)}
              </div>
              <div className="hidden sm:flex items-center gap-1.5 mt-1">
                <button
                  onClick={() => setIsTimerHidden(true)}
                  className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white rounded-full text-[9px] font-medium transition cursor-pointer"
                >
                  Hide
                </button>
                {currentQuestion && (
                  <div
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold border transition-colors ${paceColor.badgeClass}`}
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

        {/* Right Section: Bluebook Tools */}
        <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
          {/* Change Topics / Filter */}
          <button
            onClick={onOpenFilter}
            className="flex flex-col items-center justify-center rounded-lg p-1.5 sm:px-2 sm:py-1 min-w-[34px] min-h-[34px] sm:min-w-0 sm:min-h-0 text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 transition group cursor-pointer"
            title="Configure English Reading & Writing Topics and Difficulty"
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline text-[10px] font-semibold text-gray-900 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">Filter</span>
          </button>

          {/* Grammar Guide: Boundaries vs Form, Structure & Sense */}
          {onOpenGrammarGuide && (
            <button
              onClick={onOpenGrammarGuide}
              className="flex flex-col items-center justify-center rounded-lg p-1.5 sm:px-2 sm:py-1 min-w-[34px] min-h-[34px] sm:min-w-0 sm:min-h-0 text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 transition group cursor-pointer"
              title="Open Boundaries vs. Form, Structure, and Sense Quick Comparison Cheat Sheet"
            >
              <Split className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline text-[10px] font-semibold text-gray-900 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">Grammar</span>
            </button>
          )}

          {/* Annotate */}
          <button
            onClick={onToggleAnnotate}
            className={`flex flex-col items-center justify-center rounded-lg p-1.5 sm:px-2 sm:py-1 min-w-[34px] min-h-[34px] sm:min-w-0 sm:min-h-0 transition cursor-pointer ${
              isAnnotateActive
                ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 ring-1 ring-amber-400'
                : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
            title="Toggle highlighter mode"
          >
            <Highlighter className="w-4 h-4" />
            <span className="hidden sm:inline text-[10px] font-medium">Annotate</span>
          </button>

          {/* Calculator & Math Reference: Hidden when practicing Reading & Writing */}
          {section !== 'Reading and Writing' && (
            <>
              {/* Calculator */}
              <button
                onClick={onOpenCalculator}
                className="flex flex-col items-center justify-center rounded px-2.5 py-1 text-gray-700 hover:bg-gray-100 transition"
                title="Open Graphing / Scientific Calculator"
              >
                <Calculator className="w-4 h-4 mb-0.5" />
                <span className="text-[11px] font-medium">Calculator</span>
              </button>

              {/* Reference */}
              <button
                onClick={onOpenReference}
                className="flex flex-col items-center justify-center rounded px-2.5 py-1 text-gray-700 hover:bg-gray-100 transition"
                title="Open SAT Geometry Reference Sheet"
              >
                <BookOpen className="w-4 h-4 mb-0.5" />
                <span className="text-[11px] font-medium">Reference</span>
              </button>
            </>
          )}

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="flex flex-col items-center justify-center rounded px-2.5 py-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Desktop Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4 mb-0.5" />
            ) : (
              <Maximize2 className="w-4 h-4 mb-0.5" />
            )}
            <span className="text-[11px] font-medium">
              {isFullscreen ? "Standard" : "Fullscreen"}
            </span>
          </button>

          {/* Theme Toggle: Sun / Moon */}
          <button
            onClick={toggleTheme}
            className="flex flex-col items-center justify-center rounded px-2.5 py-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition group"
            title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
            aria-label="Toggle dark/light theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 mb-0.5 text-amber-400 group-hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 mb-0.5 text-slate-700 dark:text-slate-300 group-hover:-rotate-12 transition-transform" />
            )}
            <span className="text-[11px] font-medium">
              {isDark ? "Light" : "Dark"}
            </span>
          </button>
        </div>
      </div>

      {/* Signature Bluebook horizontal dashed divider strip */}
      <div className="bluebook-dashed-border" />
    </header>
  );
};
