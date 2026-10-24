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
      className="fixed inset-0 z-50 flex items-end justify-center pb-20 bg-slate-950/40 backdrop-blur-2xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 w-[480px] max-w-[92vw] max-h-[68vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-4 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Top Header */}
        <div className="shrink-0 px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">
                {sectionTitle}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                {questions.length} Questions
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              aria-label="Close question navigator"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Jump to # & Filter Tabs */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-900/70 p-0.5 rounded-lg text-xs font-medium flex-wrap">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-2 py-1 rounded-md transition-all ${
                  activeFilter === 'all'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('answered')}
                className={`px-2 py-1 rounded-md transition-all ${
                  activeFilter === 'answered'
                    ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                    : 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300'
                }`}
              >
                Answered ({answeredCount})
              </button>
              <button
                onClick={() => setActiveFilter('unanswered')}
                className={`px-2 py-1 rounded-md transition-all ${
                  activeFilter === 'unanswered'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Unanswered ({unansweredCount})
              </button>
              <button
                onClick={() => setActiveFilter('for_review')}
                className={`px-2 py-1 rounded-md transition-all ${
                  activeFilter === 'for_review'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Review ({forReviewCount})
              </button>
              {incorrectCount > 0 && (
                <button
                  onClick={() => setActiveFilter('incorrect')}
                  className={`px-2 py-1 rounded-md transition-all ${
                    activeFilter === 'incorrect'
                      ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 shadow-2xs font-semibold'
                      : 'text-rose-600 dark:text-rose-400 hover:text-rose-700'
                  }`}
                >
                  Mistakes ({incorrectCount})
                </button>
              )}
            </div>

            {/* Jump To # Input */}
            <form onSubmit={handleJumpSubmit} className="flex items-center gap-1">
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="1"
                  max={questions.length}
                  placeholder="Jump #"
                  value={jumpValue}
                  onChange={e => setJumpValue(e.target.value)}
                  className="w-16 h-7 px-2 text-xs font-semibold text-center rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <button
                type="submit"
                disabled={!jumpValue}
                className="h-7 px-2 text-xs font-semibold rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white disabled:opacity-40 transition"
              >
                Go
              </button>
            </form>
          </div>

          {/* Authentic Legend */}
          <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-1 select-none border-t border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 fill-sky-600 dark:fill-sky-400" />
              <span>Current</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 bg-slate-900 dark:bg-sky-600 text-white rounded-xs flex items-center justify-center text-[9px] font-bold">✓</div>
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 border-2 border-dashed border-slate-400 dark:border-slate-500 rounded-xs bg-white dark:bg-slate-900" />
              <span>Unanswered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 fill-rose-500 stroke-rose-500" />
              <span>For Review</span>
            </div>
          </div>
        </div>

        {/* Dedicated Scrollable Middle Container */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 grid grid-cols-6 gap-2.5 overscroll-contain">
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
                {/* Location Pin Indicator Above Current Question */}
                <div className="h-3.5 flex items-center justify-center">
                  {isCurrent && (
                    <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 fill-sky-600 dark:fill-sky-400 animate-bounce" />
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
                  className={`relative w-11 h-11 rounded-lg flex items-center justify-center font-bold text-xs transition-all shadow-2xs select-none ${
                    isCurrent
                      ? 'ring-2 ring-sky-500 dark:ring-sky-400 ring-offset-2 dark:ring-offset-slate-900 scale-105'
                      : 'hover:scale-105'
                  } ${
                    isIncorrect
                      ? 'bg-rose-100 dark:bg-rose-950/80 border-2 border-rose-500 text-rose-800 dark:text-rose-200'
                      : isCorrect
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                      : isAnswered
                      ? 'bg-slate-900 dark:bg-sky-600 text-white'
                      : 'bg-white dark:bg-slate-800 border-2 border-dashed border-slate-400 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-slate-600 dark:hover:border-slate-400'
                  }`}
                >
                  {/* Marked for Review Bookmark Badge */}
                  {isMarked && (
                    <div className="absolute -top-1.5 -right-1.5 z-10">
                      <Bookmark className="w-3.5 h-3.5 fill-rose-600 stroke-rose-600" />
                    </div>
                  )}
                  {/* Answered Indicator Checkmark */}
                  {isAnswered && !isCorrect && !isIncorrect && (
                    <div className="absolute -bottom-1 -right-1 z-10 w-3.5 h-3.5 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                  <span>{q.questionNumber || idx + 1}</span>
                </button>
              </div>
            );
          })}

          {filteredQuestions.length === 0 && (
            <div className="col-span-6 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No questions found in this filter.
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="shrink-0 px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
          <span>Click any question to jump directly</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-semibold rounded-lg transition"
          >
            Close Grid
          </button>
        </div>
      </div>
    </div>
  );
};
