import React, { useState, useEffect, useRef } from 'react';
import { 
  Bookmark, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  ChevronUp, 
  X, 
  CheckCircle, 
  XCircle, 
  HelpCircle,
  Undo2,
  Split
} from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { MockQuestion, UserQuestionState, AnswerChoice, TextHighlight } from '../types/quiz';
import { RichText } from './RichText';
import { MathText } from './MathText';
import { MathVisual } from './MathVisual';
import { ExplanationRenderer } from './ExplanationRenderer';
import { evaluateNumericEquivalence, formatSprPreview } from '../utils/mathEvaluator';

gsap.registerPlugin(useGSAP);

interface RightPaneProps {
  question: MockQuestion;
  userState: UserQuestionState;
  onSelectChoice: (choice: 'A' | 'B' | 'C' | 'D') => void;
  onSprAnswerChange?: (value: string) => void;
  onToggleEliminate: (choice: 'A' | 'B' | 'C' | 'D') => void;
  onToggleMarkForReview: () => void;
  onCheckAnswer: (timeSpentSeconds?: number) => void;
  onToggleExplanation: () => void;
  onResetQuestion?: () => void;
  onNextQuestion?: () => void;
  isLastQuestion?: boolean;
  timeSpentSeconds?: number;
  highlights: TextHighlight[];
  onHighlightClick: (highlight: TextHighlight, rect: DOMRect) => void;
  onOpenNote?: (highlight: TextHighlight, rect: DOMRect) => void;
  onOpenGrammarGuide?: () => void;
  isSplitView?: boolean;
}

export const RightPane: React.FC<RightPaneProps> = ({
  question,
  userState,
  onSelectChoice,
  onSprAnswerChange,
  onToggleEliminate,
  onToggleMarkForReview,
  onCheckAnswer,
  onToggleExplanation,
  onResetQuestion,
  onNextQuestion,
  isLastQuestion = false,
  timeSpentSeconds,
  highlights: _highlights,
  onHighlightClick: _onHighlightClick,
  onOpenNote: _onOpenNote,
  onOpenGrammarGuide,
  isSplitView = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isAbcModeActive, setIsAbcModeActive] = useState<boolean>(false);
  const [isBlindMode, setIsBlindMode] = useState<boolean>(false);

  // GSAP: Animate question transition on question change
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      if (containerRef.current) {
        gsap.fromTo(
          containerRef.current,
          { autoAlpha: 0, y: 8 },
          { autoAlpha: 1, y: 0, duration: 0.26, ease: 'power2.out', clearProps: 'transform' }
        );
      }
    });
    return () => mm.revert();
  }, { scope: containerRef, dependencies: [question.id] });

  // GSAP: Animate post-answer action bar entrance when answer is submitted
  useGSAP(() => {
    if (!userState.isAnswerChecked) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        '.gsap-post-answer-bar',
        { autoAlpha: 0, y: 6 },
        { autoAlpha: 1, y: 0, duration: 0.24, ease: 'power2.out', clearProps: 'transform' }
      );
    });
    return () => mm.revert();
  }, { scope: containerRef, dependencies: [userState.isAnswerChecked] });

  const promptText = question.prompt || question.stem || '';
  const optionsList: AnswerChoice[] = question.options || question.choices || [];
  const isSpr = question.questionType === 'spr' || !optionsList || optionsList.length === 0;

  const isSprCorrect = isSpr && evaluateNumericEquivalence(
    userState.sprAnswer || '',
    String(question.correctAnswer),
    question.acceptedAnswers
  );
  const isSelectedCorrect = isSpr ? isSprCorrect : (userState.selectedChoice === question.correctAnswer);
  const sprPreview = formatSprPreview(userState.sprAnswer || '');

  // Keyboard shortcut: Press Enter to submit "Check Answer" when an answer is drafted
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !userState.isAnswerChecked) {
        const hasAnswer = isSpr
          ? Boolean(userState.sprAnswer && userState.sprAnswer.trim().length > 0)
          : Boolean(userState.selectedChoice);
        if (hasAnswer) {
          e.preventDefault();
          onCheckAnswer(timeSpentSeconds);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userState.isAnswerChecked, userState.selectedChoice, userState.sprAnswer, isSpr, onCheckAnswer, timeSpentSeconds]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(question.id).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleSprInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    let filtered = raw.replace(/[^0-9.\/-]/g, '');
    if (filtered.indexOf('-') > 0) {
      filtered = filtered.charAt(0) === '-' ? '-' + filtered.slice(1).replace(/-/g, '') : filtered.replace(/-/g, '');
    }
    if (filtered.length > 6) {
      filtered = filtered.slice(0, 6);
    }
    if (onSprAnswerChange) {
      onSprAnswerChange(filtered);
    }
  };

  // 3-bar difficulty indicator
  const renderDifficultyBars = () => {
    const barsCount = question.difficulty === 'Easy' ? 1 : question.difficulty === 'Medium' ? 2 : 3;
    const barColor = question.difficulty === 'Easy' 
      ? 'bg-emerald-500' 
      : question.difficulty === 'Medium' 
        ? 'bg-amber-500' 
        : 'bg-rose-500';
    const textColor = question.difficulty === 'Easy'
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
      : question.difficulty === 'Medium'
        ? 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
        : 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';

    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded border text-xs font-semibold ${textColor}`}>
        <div className="flex items-end gap-0.5 h-3">
          <span className={`w-1 h-1.5 rounded-xs ${barsCount >= 1 ? barColor : 'bg-gray-300 dark:bg-slate-700'}`} />
          <span className={`w-1 h-2.5 rounded-xs ${barsCount >= 2 ? barColor : 'bg-gray-300 dark:bg-slate-700'}`} />
          <span className={`w-1 h-3.5 rounded-xs ${barsCount >= 3 ? barColor : 'bg-gray-300 dark:bg-slate-700'}`} />
        </div>
        <span>{question.difficulty}</span>
      </div>
    );
  };

  const rationaleText = typeof question.rationale === 'string' 
    ? question.rationale 
    : question.rationale?.summary || '';

  return (
    <div 
      ref={containerRef}
      className={`px-4 sm:px-6 lg:px-10 py-5 sm:py-6 pb-24 overflow-x-hidden bg-white dark:bg-[#070a10] text-slate-900 dark:text-white select-text question-stem ${
        isSplitView
          ? 'h-full overflow-y-auto'
          : 'h-auto overflow-visible'
      }`}
    >
      {/* 1. Metadata Ribbon (Above Question Strip) */}
      <div className="mb-4 flex items-center justify-between gap-3 text-xs flex-wrap select-none">
        {/* Left Side Metadata */}
        <div className="flex items-center gap-2 flex-wrap">
          {!isBlindMode ? (
            <>
              {/* 3-bar Difficulty Indicator */}
              {renderDifficultyBars()}

              {/* Domain & Skill Breadcrumb */}
              <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium px-2.5 py-0.5 rounded tracking-tight">
                <span>{question.domain}</span>
                <span className="mx-1.5 text-slate-400">•</span>
                <span className="text-slate-900 dark:text-white font-semibold">{question.skill}</span>
              </div>

              {/* Grammar Guide Cheat Sheet Pill for Standard English Conventions */}
              {onOpenGrammarGuide && (question.domain === 'Standard English Conventions' || question.skill === 'Boundaries' || question.skill === 'Form, Structure, and Sense') && (
                <button
                  onClick={onOpenGrammarGuide}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 px-2.5 py-0.5 rounded transition cursor-pointer"
                  title="Open Boundaries vs. Form, Structure, and Sense Quick Comparison Cheat Sheet"
                >
                  <Split className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>Boundaries vs. Form Guide</span>
                </button>
              )}
            </>
          ) : (
            <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 text-[11px] px-2.5 py-0.5 rounded italic">
              Metadata hidden (Blind Practice Mode)
            </div>
          )}

          {/* Copyable Monospace Question ID Badge */}
          <button
            onClick={handleCopyId}
            className="flex items-center gap-1 font-mono text-[11px] bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded transition cursor-pointer"
            title="Click to copy question ID"
          >
            {isCopied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span>ID: {question.id}</span>
              </>
            )}
          </button>
        </div>

        {/* Right Side: Blind Mode Toggle */}
        <button
          onClick={() => setIsBlindMode(!isBlindMode)}
          className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-medium transition cursor-pointer"
        >
          {isBlindMode ? (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Show Info</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Hide Info</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Bluebook Question Header Bar */}
      <div className="w-full bg-zinc-100 dark:bg-[#181B24] border-b border-zinc-200 dark:border-[#222634] text-zinc-900 dark:text-[#F4F4F6] flex items-center justify-between pr-3 select-none rounded-t-lg">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Question Number Badge */}
          <div className="w-8 h-8 rounded-tl-lg bg-zinc-950 text-white dark:bg-blue-600 dark:text-white font-mono font-semibold text-sm flex items-center justify-center shrink-0 tabular-nums">
            {question.questionNumber}
          </div>

          {/* Mark for Review Toggle */}
          <button
            onClick={onToggleMarkForReview}
            className={`flex items-center gap-1.5 text-xs transition-colors duration-150 cursor-pointer ${
              userState.isMarkedForReview
                ? 'text-rose-600 dark:text-rose-400 font-semibold'
                : 'text-zinc-600 hover:text-zinc-950 dark:text-[#8E95A5] dark:hover:text-[#F4F4F6] font-medium'
            }`}
          >
            <Bookmark
              className={`w-3.5 h-3.5 transition-colors duration-150 ${
                userState.isMarkedForReview ? 'fill-rose-600 dark:fill-rose-400 stroke-rose-600 dark:stroke-rose-400' : 'text-zinc-500 dark:text-[#8E95A5]'
              }`}
              strokeWidth={1.75}
            />
            <span>Mark for Review</span>
          </button>
        </div>

        {/* Right: ABC Option Eliminator Button (MCQ only) */}
        {!isSpr && !userState.isAnswerChecked && (
          <button
            onClick={() => setIsAbcModeActive(!isAbcModeActive)}
            className={`text-xs px-2.5 py-1 rounded font-mono font-medium transition-colors duration-150 flex items-center gap-1 cursor-pointer ${
              isAbcModeActive
                ? 'bg-zinc-950 text-white dark:bg-blue-600 dark:text-white'
                : 'bg-white border border-zinc-200 text-zinc-800 dark:bg-[#11131A] dark:border-[#222634] dark:text-[#F4F4F6] hover:bg-zinc-50 dark:hover:bg-[#181B24]'
            }`}
            title="Toggle ABC answer elimination tool"
          >
            <span className="line-through decoration-1">ABC</span>
          </button>
        )}
      </div>

      {/* 2.5. Mathematical Visual (Coordinate Plane / Diagram / Table) */}
      {question.imageUrl && (
        <div className="w-full flex justify-center max-w-[65ch]">
          <MathVisual imageUrl={question.imageUrl} alt="Question diagram or coordinate plane" />
        </div>
      )}

      {/* 3. Question Prompt / Stem (Constrained measure, high-legibility serif) */}
      <div data-annotate-target="prompt" className="mt-5 mb-5 font-serif text-[17px] leading-relaxed max-w-[65ch] text-zinc-950 dark:text-[#F4F4F6]">
        <RichText text={promptText} />
      </div>

      {/* 4. Multiple Choice Options (A, B, C, D) OR Student-Produced Response (SPR) */}
      {isSpr ? (
        <div className="space-y-4 max-w-[65ch]">
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="spr-input" className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 font-mono flex items-center gap-1.5">
                <span>Student-Produced Response</span>
              </label>
              <span className="text-[11px] font-mono text-zinc-400 dark:text-[#8E95A5]">
                {(userState.sprAnswer || '').length} / 6 chars
              </span>
            </div>

            <div className="relative">
              <input
                id="spr-input"
                type="text"
                value={userState.sprAnswer || ''}
                onChange={handleSprInputChange}
                placeholder="e.g. 3/5 or 0.6"
                disabled={userState.isAnswerChecked}
                maxLength={6}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                className={`w-full font-mono text-2xl font-bold tracking-wider px-4 py-3.5 rounded-xl border transition-all duration-150 outline-none ${
                  userState.isAnswerChecked
                    ? isSelectedCorrect
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200'
                      : 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200'
                    : 'border-zinc-300 dark:border-[#222634] bg-zinc-50/50 dark:bg-[#181B24] text-zinc-950 dark:text-[#F4F4F6] focus:border-blue-600 focus:bg-white dark:focus:bg-[#11131A] focus:ring-3 focus:ring-blue-600/20'
                }`}
              />
              {(userState.sprAnswer || '').length > 0 && !userState.isAnswerChecked && (
                <button
                  type="button"
                  onClick={() => onSprAnswerChange && onSprAnswerChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                  title="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Live Formatted Preview Badge */}
            <div className="flex items-center justify-between text-xs pt-1 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold uppercase text-zinc-400 dark:text-[#8E95A5]">Preview:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded font-mono font-bold text-xs ${
                  sprPreview.isValid
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                    : 'bg-zinc-100 text-zinc-500 dark:bg-[#181B24] dark:text-[#8E95A5]'
                }`}>
                  {sprPreview.isValid && sprPreview.latexDisplay && sprPreview.latexDisplay !== sprPreview.display ? (
                    <MathText text={`$${sprPreview.latexDisplay}$`} />
                  ) : (
                    <span>{sprPreview.display}</span>
                  )}
                  {sprPreview.valueNum !== null && !userState.sprAnswer?.includes('.') && (
                    <span className="ml-1 opacity-75">(= {sprPreview.valueNum.toFixed(4).replace(/\.?0+$/, '')})</span>
                  )}
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 dark:text-[#8E95A5] italic">
                Accepts fractions &amp; decimals
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5 max-w-[65ch]">
          {optionsList.map((choice: AnswerChoice) => {
            const choiceId = choice.id || choice.label || 'A';
            const isSelected = userState.selectedChoice === choiceId;
            const isEliminated = userState.eliminatedChoices.includes(choiceId);
            const isChecked = userState.isAnswerChecked;
            const isCorrect = choiceId === question.correctAnswer;

            // Strict Two-Step Styling
            let cardClasses = 'border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] hover:bg-zinc-50 dark:hover:bg-[#181B24] hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-950 dark:text-[#F4F4F6] shadow-2xs';
            let badgeClasses = 'border border-zinc-300 dark:border-[#222634] bg-zinc-50 dark:bg-[#181B24] text-zinc-700 dark:text-[#8E95A5]';

            if (isChecked) {
              if (isCorrect) {
                cardClasses = 'border-2 border-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/20 text-zinc-950 dark:text-[#F4F4F6] shadow-xs';
                badgeClasses = 'bg-emerald-600 text-white border-emerald-600 font-bold';
              } else if (isSelected && !isCorrect) {
                cardClasses = 'border-2 border-rose-500 bg-rose-50/10 dark:bg-rose-950/20 text-zinc-950 dark:text-[#F4F4F6] shadow-xs';
                badgeClasses = 'bg-rose-600 text-white border-rose-600 font-bold';
              } else {
                cardClasses = 'border border-zinc-200/60 dark:border-[#222634]/60 bg-zinc-50/30 dark:bg-[#11131A]/30 text-zinc-400 dark:text-zinc-600 opacity-40';
              }
            } else if (isSelected) {
              cardClasses = 'border-2 border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-zinc-950 dark:text-white shadow-xs';
              badgeClasses = 'bg-blue-600 text-white border-blue-600 font-bold';
            }

            return (
              <div key={choiceId} className="relative flex items-center gap-2 group">
                <button
                  type="button"
                  disabled={isEliminated || isChecked}
                  onClick={(e) => {
                    onSelectChoice(choiceId as 'A' | 'B' | 'C' | 'D');
                    // Micro-interaction click pulse
                    gsap.fromTo(
                      e.currentTarget,
                      { scale: 0.985 },
                      { scale: 1, duration: 0.16, ease: 'back.out(2)', clearProps: 'transform' }
                    );
                  }}
                  className={`w-full min-h-[48px] relative text-left rounded-xl px-4 py-3.5 flex items-center justify-between gap-4 transition-all duration-150 select-none ${cardClasses} ${
                    isEliminated ? 'opacity-40 pointer-events-none' : isChecked ? 'cursor-default' : 'cursor-pointer active:scale-[0.99]'
                  }`}
                >
                  {/* Horizontal strike-through line when eliminated */}
                  {isEliminated && (
                    <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-[1px] bg-zinc-500 dark:bg-zinc-400 pointer-events-none z-10" />
                  )}

                  {/* Left: Option Letter Badge + Text/KaTeX strictly inline */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center font-mono text-xs font-semibold tabular-nums transition-transform ${badgeClasses}`}>
                      {choiceId}
                    </div>

                    <div className="option-choice-text inline font-serif text-[15px] sm:text-[16px] leading-normal text-zinc-950 dark:text-[#F4F4F6] break-words">
                      <RichText text={choice.text} />
                      {choice.imageUrl && (
                        <div className="mt-2.5 p-2 bg-white dark:bg-black border border-zinc-200 dark:border-[#222634] rounded-lg inline-flex items-center justify-center overflow-hidden">
                          <img
                            src={choice.imageUrl}
                            alt={`Option ${choiceId}`}
                            className="max-h-32 w-auto object-contain rounded select-none dark:invert"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Status badge when graded */}
                  {isChecked && (
                    <div className="ml-auto shrink-0 flex items-center">
                      {isCorrect && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Correct Answer</span>
                        </span>
                      )}
                      {isSelected && !isCorrect && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                          <X className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Your Choice</span>
                        </span>
                      )}
                    </div>
                  )}
                </button>

                {/* Cross-out / Undo button for ABC elimination mode */}
                {!isChecked && (isAbcModeActive || isEliminated) && (
                  <button
                    type="button"
                    onClick={() => onToggleEliminate(choiceId as 'A' | 'B' | 'C' | 'D')}
                    className={`shrink-0 h-9 w-9 flex items-center justify-center rounded-xl border transition-all duration-150 cursor-pointer active:scale-90 ${
                      isEliminated
                        ? 'border-zinc-300 bg-zinc-100 dark:bg-[#181B24] text-zinc-700 dark:text-[#8E95A5] hover:bg-zinc-200'
                        : 'border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] text-zinc-400 hover:text-rose-600 hover:border-rose-300 shadow-2xs'
                    }`}
                    title={isEliminated ? `Restore Option ${choiceId}` : `Eliminate Option ${choiceId}`}
                  >
                    {isEliminated ? (
                      <Undo2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                    ) : (
                      <X className="w-3.5 h-3.5" strokeWidth={1.75} />
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Two-Step Action Flow: Draft "Check Answer" OR Post-Answer Action Bar */}
      {!userState.isAnswerChecked ? (
        <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-[#222634] max-w-[65ch] flex items-center justify-between gap-4 select-none flex-wrap">
          <button
            type="button"
            onClick={() => onCheckAnswer(timeSpentSeconds)}
            disabled={isSpr ? (!userState.sprAnswer || userState.sprAnswer.trim().length === 0) : !userState.selectedChoice}
            className={`h-11 px-7 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center gap-2 ${
              (isSpr ? (userState.sprAnswer && userState.sprAnswer.trim().length > 0) : userState.selectedChoice)
                ? 'bg-blue-700 hover:bg-blue-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 shadow-xs hover:shadow active:scale-95 cursor-pointer'
                : 'bg-zinc-200 dark:bg-[#181B24] text-zinc-400 dark:text-zinc-600 cursor-not-allowed border border-transparent'
            }`}
          >
            <span>Check Answer</span>
          </button>

          <div className="text-xs text-zinc-400 dark:text-[#8E95A5] flex items-center gap-1.5 font-medium">
            <span>🔒 Explanation unlocks after checking</span>
          </div>
        </div>
      ) : (
        /* Post-Answer Action Bar (Replaces Recheck Answer) */
        <div className="gsap-post-answer-bar mt-6 pt-4 border-t border-zinc-200 dark:border-[#222634] max-w-[65ch] flex flex-wrap items-center justify-between gap-3 select-none">
          {/* Left: Status badge + Explanation toggle button */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${
                isSelectedCorrect
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-300 dark:border-rose-800/80'
              }`}
            >
              {isSelectedCorrect ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>✓ Correct</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>
                    ✕ Incorrect • Answer: {isSpr ? String(question.correctAnswer) : question.correctAnswer}
                  </span>
                </>
              )}
            </span>

            <button
              type="button"
              onClick={onToggleExplanation}
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl text-blue-700 dark:text-blue-300 bg-blue-50/80 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 border border-blue-200/80 dark:border-blue-900/50 transition-colors cursor-pointer shadow-2xs"
            >
              <span>Explanation</span>
              {userState.isExplanationOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Right: Compact "↺ Reset" + Primary "Next Question →" */}
          <div className="flex items-center gap-2 ml-auto">
            {onResetQuestion && (
              <button
                type="button"
                onClick={onResetQuestion}
                className="h-9 px-3 rounded-xl border border-zinc-200 dark:border-[#222634] hover:bg-zinc-100 dark:hover:bg-[#181B24] text-zinc-700 dark:text-[#8E95A5] text-xs font-semibold transition-colors duration-150 flex items-center gap-1 cursor-pointer shadow-2xs active:scale-95"
                title="Retry this question from scratch"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>↺ Reset</span>
              </button>
            )}

            {onNextQuestion && (
              <button
                type="button"
                onClick={onNextQuestion}
                className="h-9 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 font-semibold text-xs transition-all duration-150 active:scale-95 shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <span>{isLastQuestion ? 'Finish Practice' : 'Next Question →'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 6. Official College Board Rationale Drawer */}
      {userState.isAnswerChecked && userState.isExplanationOpen && (
        <div className="mt-5 rounded-2xl border border-zinc-200 dark:border-[#222634] bg-zinc-50/90 dark:bg-[#141620] p-5 sm:p-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200 explanation-text select-text">
          <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-zinc-200 dark:border-[#222634]">
            <HelpCircle className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            <h4 className="font-bold text-zinc-950 dark:text-[#F4F4F6] text-sm tracking-tight">
              Official College Board Rationale
            </h4>
          </div>

          <div className="mb-2">
            <div className="font-sans font-semibold text-xs text-zinc-600 dark:text-[#8E95A5] uppercase tracking-wider mb-2">
              {isSpr ? (
                <>
                  Correct Answer: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{String(question.correctAnswer)}</span>
                  {question.acceptedAnswers && question.acceptedAnswers.length > 0 && (
                    <span className="ml-2 lowercase font-normal text-zinc-500 dark:text-[#8E95A5]">(accepted: {question.acceptedAnswers.join(', ')})</span>
                  )}
                </>
              ) : (
                `Correct Answer: Option ${question.correctAnswer}`
              )}
            </div>
            <ExplanationRenderer rationale={rationaleText} />
          </div>
        </div>
      )}
    </div>
  );
};

export default RightPane;
