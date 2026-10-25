import React, { useState, useEffect, useRef } from 'react';
import { Bookmark, MapPin, X, Check } from 'lucide-react';
import { MockQuestion, UserQuestionState } from '../types/quiz';
import { isQuestionAnswered } from '../utils/storage';

interface QuestionNavModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: MockQuestion[];
  currentIndex: number;
  userStates: Record<number, UserQuestionState>;
  onSelectQuestion: (index: number) => void;
  sectionTitle?: string;
}

type FilterTab = 'all' | 'answered' | 'unanswered' | 'for_review' | 'incorrect';

export const QuestionNavModal: React.FC<QuestionNavModalProps> = ({
  isOpen,
  onClose,
  questions,
  currentIndex,
  userStates,
  onSelectQuestion,
  sectionTitle = 'Section 1: Reading and Writing',
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [jumpValue, setJumpValue] = useState<string>('');
  const activeQuestionRef = useRef<HTMLButtonElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to active question when popover opens
  useEffect(() => {
    if (isOpen) {
      setJumpValue('');
      const timer = setTimeout(() => {
        if (activeQuestionRef.current) {
          activeQuestionRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentIndex]);

  // Handle Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter questions according to active tab
  const filteredQuestions = questions.map((q, idx) => ({ q, idx })).filter(({ q, idx }) => {
    const state = userStates[idx] || {
      selectedChoice: null,
      eliminatedChoices: [],
      isMarkedForReview: false,
      isAnswerChecked: false,
      isExplanationOpen: false,
    };
    const isAnswered = state.selectedChoice !== null || isQuestionAnswered(q.id);
    const isMarked = state.isMarkedForReview;
    const isIncorrect = state.isAnswerChecked && state.selectedChoice !== null && state.selectedChoice !== q.correctAnswer;

    if (activeFilter === 'answered') return isAnswered;
    if (activeFilter === 'unanswered') return !isAnswered;
    if (activeFilter === 'for_review') return isMarked;
    if (activeFilter === 'incorrect') return isIncorrect;
    return true;
  });

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(jumpValue, 10);
    if (!isNaN(num) && num >= 1 && num <= questions.length) {
      onSelectQuestion(num - 1);
      onClose();
    }
  };

  // Counts for tabs
  let answeredCount = 0;
  let unansweredCount = 0;
  let forReviewCount = 0;
  let incorrectCount = 0;
  questions.forEach((q, idx) => {
    const state = userStates[idx];
    const isAns = (state && state.selectedChoice !== null) || isQuestionAnswered(q.id);
    if (isAns) {
      answeredCount++;
    } else {
      unansweredCount++;
    }
    if (state?.isMarkedForReview) forReviewCount++;
    if (state?.isAnswerChecked && state.selectedChoice !== null && state.selectedChoice !== q.correctAnswer) {
      incorrectCount++;
    }
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center pb-20 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 w-[490px] max-w-[94vw] max-h-[70vh] flex flex-col bg-white dark:bg-[#11131A] rounded-2xl shadow-2xl border border-zinc-200/90 dark:border-[#222634] overflow-hidden animate-in slide-in-from-bottom-3 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Top Header */}
        <div className="shrink-0 px-5 py-3 border-b border-zinc-200 dark:border-[#222634] bg-neutral-50/80 dark:bg-[#181B24]/80 backdrop-blur-xs flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-950 dark:text-[#F4F4F6] text-xs sm:text-sm tracking-tight">
                {sectionTitle}
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] text-zinc-600 dark:text-[#8E95A5]">
                {questions.length} Questions
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-950 dark:hover:text-[#F4F4F6] hover:bg-zinc-100 dark:hover:bg-[#181B24] transition-all duration-150 active:scale-90 cursor-pointer"
              aria-label="Close question navigator"
            >
              <X className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>

          {/* Jump to # & Filter Tabs */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-[#090A0F] p-0.5 rounded-xl text-xs font-medium flex-wrap border border-zinc-200 dark:border-[#222634]">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all duration-150 cursor-pointer active:scale-95 ${
                  activeFilter === 'all'
                    ? 'bg-white dark:bg-[#181B24] text-zinc-950 dark:text-[#F4F4F6] shadow-2xs font-semibold'
                    : 'text-zinc-600 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('answered')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all duration-150 cursor-pointer active:scale-95 ${
                  activeFilter === 'answered'
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-800'
                }`}
              >
                Answered ({answeredCount})
              </button>
              <button
                onClick={() => setActiveFilter('unanswered')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all duration-150 cursor-pointer active:scale-95 ${
                  activeFilter === 'unanswered'
                    ? 'bg-white dark:bg-[#181B24] text-zinc-950 dark:text-[#F4F4F6] shadow-2xs font-semibold'
                    : 'text-zinc-600 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                Unanswered ({unansweredCount})
              </button>
              <button
                onClick={() => setActiveFilter('for_review')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all duration-150 cursor-pointer active:scale-95 ${
                  activeFilter === 'for_review'
                    ? 'bg-white dark:bg-[#181B24] text-zinc-950 dark:text-[#F4F4F6] shadow-2xs font-semibold'
                    : 'text-zinc-600 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                Review ({forReviewCount})
              </button>
              {incorrectCount > 0 && (
                <button
                  onClick={() => setActiveFilter('incorrect')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all duration-150 cursor-pointer active:scale-95 ${
                    activeFilter === 'incorrect'
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold shadow-2xs'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  Mistakes ({incorrectCount})
                </button>
              )}
            </div>

            {/* Jump To # Input */}
            <form onSubmit={handleJumpSubmit} className="flex items-center gap-1">
              <input
                type="number"
                min="1"
                max={questions.length}
                placeholder="Jump #"
                value={jumpValue}
                onChange={e => setJumpValue(e.target.value)}
                className="w-16 h-7 px-2 text-xs font-mono font-semibold text-center rounded border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] text-zinc-950 dark:text-[#F4F4F6] focus:outline-hidden focus:border-blue-600 tabular-nums"
              />
              <button
                type="submit"
                disabled={!jumpValue}
                className="h-7 px-2 text-xs font-mono font-semibold rounded bg-zinc-950 hover:bg-zinc-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white disabled:opacity-35 transition-colors duration-150"
              >
                Go
              </button>
            </form>
          </div>

          {/* Authentic Legend */}
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-[#8E95A5] pt-1 select-none border-t border-zinc-200/60 dark:border-[#222634]">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400" />
              <span>Current</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 bg-zinc-950 dark:bg-blue-600 text-white rounded-xs flex items-center justify-center text-[9px] font-bold">✓</div>
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 border-2 border-dashed border-zinc-400 dark:border-zinc-600 rounded-xs bg-white dark:bg-[#11131A]" />
              <span>Unanswered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 fill-rose-500 stroke-rose-500" />
              <span>Review</span>
            </div>
          </div>
        </div>

        {/* Dedicated Scrollable Middle Container */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 grid grid-cols-6 gap-2.5 overscroll-contain">
          {filteredQuestions.map(({ q, idx }) => {
            const state = userStates[idx] || {
              selectedChoice: null,
              eliminatedChoices: [],
              isMarkedForReview: false,
              isAnswerChecked: false,
              isExplanationOpen: false,
            };
            const isCurrent = idx === currentIndex;
            const isAnswered = state.selectedChoice !== null || isQuestionAnswered(q.id);
            const isMarked = state.isMarkedForReview;
            const isChecked = state.isAnswerChecked;
            const isCorrect = isChecked && state.selectedChoice === q.correctAnswer;
            const isIncorrect = isChecked && state.selectedChoice !== null && state.selectedChoice !== q.correctAnswer;

            return (
              <div key={q.id} className="flex flex-col items-center">
                {/* Location Pin Indicator */}
                <div className="h-3 flex items-center justify-center">
                  {isCurrent && (
                    <MapPin className="w-3 h-3 text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400" />
                  )}
                </div>

                {/* Question Tile Button */}
                <button
                  ref={isCurrent ? activeQuestionRef : null}
                  onClick={() => {
                    onSelectQuestion(idx);
                    onClose();
                  }}
                  title={`Question ${q.questionNumber || idx + 1}: ${isAnswered ? 'Answered' : 'Unanswered'}${state.selectedChoice ? ` (Choice ${state.selectedChoice})` : ''}`}
                  className={`relative w-10 h-10 rounded-xl flex items-center justify-center font-mono font-semibold text-xs transition-all duration-150 hover:scale-105 active:scale-90 tabular-nums select-none cursor-pointer shadow-2xs ${
                    isCurrent
                      ? 'ring-2 ring-blue-600 dark:ring-blue-500 ring-offset-2 dark:ring-offset-[#11131A] scale-105'
                      : ''
                  } ${
                    isIncorrect
                      ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-500 text-rose-700 dark:text-rose-300'
                      : isCorrect
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500 text-emerald-700 dark:text-emerald-300'
                      : isAnswered
                      ? 'bg-zinc-950 dark:bg-blue-600 text-white border-transparent'
                      : 'bg-white dark:bg-[#11131A] border-2 border-dashed border-zinc-300 dark:border-[#222634] text-zinc-700 dark:text-[#8E95A5] hover:border-zinc-400'
                  }`}
                >
                  {/* Marked for Review Bookmark Badge */}
                  {isMarked && (
                    <div className="absolute -top-1 -right-1 z-10">
                      <Bookmark className="w-3 h-3 fill-rose-600 stroke-rose-600" />
                    </div>
                  )}
                  {/* Answered Indicator Checkmark */}
                  {isAnswered && !isCorrect && !isIncorrect && (
                    <div className="absolute -bottom-0.5 -right-0.5 z-10 w-3 h-3 bg-emerald-600 text-white rounded-full flex items-center justify-center">
                      <Check className="w-2 h-2 stroke-[3]" />
                    </div>
                  )}
                  <span>{q.questionNumber || idx + 1}</span>
                </button>
              </div>
            );
          })}

          {filteredQuestions.length === 0 && (
            <div className="col-span-6 py-8 text-center text-xs font-mono text-zinc-500 dark:text-[#8E95A5]">
              No questions found in this filter.
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="shrink-0 px-5 py-3 border-t border-zinc-200 dark:border-[#222634] bg-neutral-50/90 dark:bg-[#181B24]/90 backdrop-blur-xs flex justify-between items-center text-xs font-mono text-zinc-500 dark:text-[#8E95A5]">
          <span>Click any question to jump</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-white hover:bg-zinc-100 dark:bg-[#11131A] dark:hover:bg-[#202534] border border-zinc-200 dark:border-[#222634] text-zinc-800 dark:text-[#F4F4F6] font-semibold rounded-lg transition-all duration-150 cursor-pointer active:scale-95 shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
