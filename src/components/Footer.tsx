import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface FooterProps {
  currentIndex: number;
  totalQuestions: number;
  isGridOpen: boolean;
  onToggleGrid: () => void;
  onPrev: () => void;
  onNext: () => void;
  isAnswered?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  currentIndex,
  totalQuestions,
  isGridOpen,
  onToggleGrid,
  onPrev,
  onNext,
  isAnswered = false,
}) => {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;

  return (
    <footer 
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 6px)' }}
      className="relative shrink-0 w-full bg-white dark:bg-[#11131A] border-t border-zinc-200 dark:border-[#222634] text-zinc-950 dark:text-[#F4F4F6] select-none z-30"
    >
      {/* Signature Bluebook horizontal dashed divider strip */}
      <div className="bluebook-dashed-border" />

      <div className="h-14 px-3 sm:px-6 flex items-center justify-between relative w-full">
        {/* Left: Branding & Academic Identifier */}
        <div className="hidden sm:flex items-center gap-2 min-w-0">
          <span className="font-semibold text-zinc-950 dark:text-[#F4F4F6] text-xs sm:text-sm tracking-tight truncate">
            SATify Workspace
          </span>
          <span className="text-zinc-300 dark:text-[#222634] hidden lg:inline">|</span>
          <span className="text-zinc-500 dark:text-[#8E95A5] text-xs font-mono hidden md:inline truncate">
            © Oluwole Inuoluwadunsimi 2026
          </span>
        </div>

        {/* Center on tablet/desktop, Left on mobile: Bluebook Question Navigator Pill */}
        <div className="sm:absolute sm:left-1/2 sm:-translate-x-1/2 flex items-center">
          <button
            type="button"
            onClick={onToggleGrid}
            className="h-9 bg-zinc-950 hover:bg-zinc-900 dark:bg-[#181B24] dark:hover:bg-[#202534] text-white font-mono text-xs sm:text-sm px-3.5 sm:px-4 py-1.5 rounded-xl flex items-center gap-2 border border-zinc-800 dark:border-[#222634] shadow-xs hover:shadow transition-all duration-150 cursor-pointer active:scale-95 whitespace-nowrap"
            title="Open Question Navigator Popover"
          >
            <span className="tabular-nums font-sans font-medium">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            {isAnswered && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-600 text-white leading-none">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
                <span>Answered</span>
              </span>
            )}
            {isGridOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform duration-150" strokeWidth={1.75} />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform duration-150" strokeWidth={1.75} />
            )}
          </button>
        </div>

        {/* Right: Navigation Buttons (Back / Next) */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <button
            type="button"
            onClick={onPrev}
            disabled={isFirst}
            className={`h-9 px-3.5 sm:px-4 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center gap-1 shrink-0 ${
              isFirst
                ? 'border border-zinc-200 dark:border-[#222634] bg-zinc-50 dark:bg-[#181B24] text-zinc-400 dark:text-zinc-600 cursor-not-allowed opacity-40'
                : 'border border-zinc-200 dark:border-[#222634] bg-white hover:bg-zinc-100 dark:bg-[#181B24] dark:hover:bg-[#202534] text-zinc-900 dark:text-[#F4F4F6] cursor-pointer active:scale-95 shadow-2xs'
            }`}
          >
            <ChevronLeft className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={onNext}
            disabled={isLast}
            className={`h-9 px-4 sm:px-5 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center gap-1 shrink-0 shadow-xs hover:shadow ${
              isLast
                ? 'bg-zinc-200 dark:bg-[#222634] text-zinc-400 dark:text-zinc-600 cursor-not-allowed opacity-40'
                : 'bg-blue-700 hover:bg-blue-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 cursor-pointer active:scale-95'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </footer>
  );
};
