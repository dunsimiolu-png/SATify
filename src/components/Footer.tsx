import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface FooterProps {
  currentIndex: number;
  totalQuestions: number;
  isGridOpen: boolean;
  onToggleGrid: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  currentIndex,
  totalQuestions,
  isGridOpen,
  onToggleGrid,
  onPrev,
  onNext,
}) => {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;

  return (
    <footer className="relative shrink-0 w-full bg-white dark:bg-[#070a10] border-t border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white select-none z-30 pb-[max(env(safe-area-inset-bottom,14px),12px)]">
      {/* Signature Bluebook horizontal dashed divider strip */}
      <div className="bluebook-dashed-border" />

      {/* 3-Column Balanced Layout: mathematically impossible for center widget to collide with left or right */}
      <div className="min-h-[52px] sm:min-h-[58px] px-3 sm:px-6 py-2 grid grid-cols-3 items-center gap-2 w-full">
        {/* Column 1 (Left): Clean Minimal Branding & Copyright */}
        <div className="flex items-center justify-start min-w-0">
          <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm tracking-tight truncate">
            SATify Practice
          </span>
          <span className="text-slate-400 dark:text-slate-500 text-xs hidden md:inline ml-2 truncate font-medium">
            • © 2026
          </span>
        </div>

        {/* Column 2 (Center): Bluebook Black Pill Question Navigator */}
        <div className="flex items-center justify-center shrink-0">
          <button
            type="button"
            onClick={onToggleGrid}
            className="min-h-[40px] sm:min-h-[44px] bg-[#1e1e1e] hover:bg-black dark:bg-[#151a24] dark:hover:bg-[#1a2130] text-white font-semibold text-xs sm:text-sm px-3 sm:px-5 py-2 rounded-md flex items-center gap-1.5 sm:gap-2 shadow-xs transition active:scale-95 border border-slate-700 cursor-pointer whitespace-nowrap"
            title="Open Bluebook Question Overview Grid"
          >
            {/* Compact text on small phones, full text on tablets/desktop */}
            <span className="sm:hidden font-mono font-bold">
              Q {currentIndex + 1} of {totalQuestions}
            </span>
            <span className="hidden sm:inline font-sans">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            {isGridOpen ? (
              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-300 shrink-0" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-300 shrink-0" />
            )}
          </button>
        </div>

        {/* Column 3 (Right): Navigation Buttons (< Back / Next >) */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onPrev}
            disabled={isFirst}
            className={`min-h-[38px] sm:min-h-[44px] font-semibold px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm transition flex items-center gap-1 shadow-xs shrink-0 ${
              isFirst
                ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95 cursor-pointer'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={isLast}
            className={`min-h-[38px] sm:min-h-[44px] font-semibold px-3.5 sm:px-6 py-2 rounded-full text-xs sm:text-sm transition flex items-center gap-1 shadow-xs shrink-0 ${
              isLast
                ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95 cursor-pointer'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          </button>
        </div>
      </div>
    </footer>
  );
};
