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
    <footer 
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
      className="relative shrink-0 w-full bg-white dark:bg-[#070a10] border-t border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white select-none z-30"
    >
      {/* Signature Bluebook horizontal dashed divider strip */}
      <div className="bluebook-dashed-border" />

      <div className="h-[54px] sm:h-[60px] px-3 sm:px-6 flex items-center justify-between relative w-full">
        {/* Left: Branding & Copyright (Hidden on mobile phones so question nav has full room) */}
        <div className="hidden sm:flex items-center gap-2 min-w-0">
          <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm tracking-tight truncate">
            SATify Practice
          </span>
          <span className="text-slate-300 dark:text-slate-700 hidden lg:inline">|</span>
          <span className="text-slate-500 dark:text-slate-400 text-xs font-medium hidden md:inline truncate">
            © Oluwole Inuoluwadunsimi 2026
          </span>
        </div>

        {/* Center on tablet/desktop, Left on mobile: Bluebook Black Pill Question Navigator */}
        <div className="sm:absolute sm:left-1/2 sm:-translate-x-1/2 flex items-center">
          <button
            type="button"
            onClick={onToggleGrid}
            className="min-h-[38px] sm:min-h-[42px] bg-[#1e1e1e] hover:bg-black dark:bg-[#151a24] dark:hover:bg-[#1a2130] text-white font-semibold text-xs sm:text-sm px-3 sm:px-5 py-2 rounded-md flex items-center gap-2 shadow-xs transition active:scale-95 border border-slate-700 cursor-pointer whitespace-nowrap"
            title="Open Bluebook Question Overview Grid"
          >
            <span className="font-sans font-medium">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            {isGridOpen ? (
              <ChevronDown className="w-4 h-4 text-gray-300 shrink-0" />
            ) : (
              <ChevronUp className="w-4 h-4 text-gray-300 shrink-0" />
            )}
          </button>
        </div>

        {/* Right: Blue Pill Navigation Buttons (< Back / Next >) */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 ml-auto">
          <button
            type="button"
            onClick={onPrev}
            disabled={isFirst}
            className={`min-h-[36px] sm:min-h-[42px] font-semibold px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm transition flex items-center gap-1 shadow-xs shrink-0 ${
              isFirst
                ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95 cursor-pointer'
            }`}
          >
            <ChevronLeft className="w-4 h-4 shrink-0" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={isLast}
            className={`min-h-[36px] sm:min-h-[42px] font-semibold px-3.5 sm:px-6 py-2 rounded-full text-xs sm:text-sm transition flex items-center gap-1 shadow-xs shrink-0 ${
              isLast
                ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95 cursor-pointer'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>
    </footer>
  );
};
