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
    <footer className="relative w-full bg-white dark:bg-[#070a10] border-t border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white select-none z-30">
      {/* Signature Bluebook horizontal dashed divider strip */}
      <div className="bluebook-dashed-border" />

      <div className="h-[58px] px-3 sm:px-6 flex items-center justify-between">
        {/* Left: Branded Label, Copyright & Keyboard Shortcuts */}
        <div className="flex items-center gap-3">
          <span className="font-bold text-gray-900 dark:text-white text-sm tracking-tight hidden lg:inline">
            SATify Practice
          </span>
          <span className="text-gray-300 dark:text-slate-700 hidden lg:inline">|</span>
          <span className="text-[11px] text-gray-500 dark:text-slate-400 font-medium hidden md:inline">
            © Oluwole Inuoluwadunsimi 2026
          </span>
          <span className="text-gray-300 dark:text-slate-700 hidden md:inline">|</span>
          <div className="text-[11px] text-gray-500 dark:text-slate-400 font-mono hidden xl:flex items-center gap-1.5">
            <span className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-1.5 py-0.5 rounded border border-gray-200 dark:border-slate-700">
              Keys: A-D
            </span>
            <span className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-1.5 py-0.5 rounded border border-gray-200 dark:border-slate-700">
              Enter to Check
            </span>
            <span className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-1.5 py-0.5 rounded border border-gray-200 dark:border-slate-700">
              ← / →
            </span>
          </div>
        </div>

        {/* Center: Black Pill Question Navigator Button */}
        <div className="sm:absolute sm:left-1/2 sm:-translate-x-1/2">
          <button
            onClick={onToggleGrid}
            className="bg-[#1e1e1e] hover:bg-black dark:bg-[#151a24] dark:hover:bg-[#1a2130] text-white font-semibold text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-md flex items-center gap-1.5 sm:gap-2 shadow-xs transition active:scale-95 border border-slate-700"
            title="Open Bluebook Question Overview Grid"
          >
            <span>Question {currentIndex + 1} of {totalQuestions}</span>
            {isGridOpen ? (
              <ChevronDown className="w-4 h-4 text-gray-300" />
            ) : (
              <ChevronUp className="w-4 h-4 text-gray-300" />
            )}
          </button>
        </div>

        {/* Right: Blue Pill Navigation Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <button
            onClick={onPrev}
            disabled={isFirst}
            className={`font-semibold px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm transition flex items-center gap-1 shadow-xs ${
              isFirst
                ? 'bg-gray-100 dark:bg-slate-800/80 text-gray-400 dark:text-slate-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            onClick={onNext}
            disabled={isLast}
            className={`font-semibold px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm transition flex items-center gap-1 shadow-xs ${
              isLast
                ? 'bg-gray-100 dark:bg-slate-800/80 text-gray-400 dark:text-slate-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
