import React, { useState, useEffect } from 'react';
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
  Split,
  Clock
} from 'lucide-react';
import { MockQuestion, UserQuestionState, AnswerChoice, TextHighlight } from '../types/quiz';
import { RichText } from './RichText';
import { ExplanationRenderer } from './ExplanationRenderer';
import { getQuestionTargetSeconds, getPacePillColor, formatSecondsToPace } from '../utils/pacingTargets';
import { isQuestionAnswered } from '../utils/storage';
import { evaluateNumericEquivalence, formatSprPreview } from '../utils/mathEvaluator';

interface RightPaneProps {
  question: MockQuestion;
  userState: UserQuestionState;
  onSelectChoice: (choice: 'A' | 'B' | 'C' | 'D') => void;
  onSprAnswerChange?: (value: string) => void;
  onToggleEliminate: (choice: 'A' | 'B' | 'C' | 'D') => void;
  onToggleMarkForReview: () => void;
  onCheckAnswer: (timeSpentSeconds?: number) => void;
  onToggleExplanation: () => void;
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
  highlights: _highlights,
  onHighlightClick: _onHighlightClick,
  onOpenNote: _onOpenNote,
  onOpenGrammarGuide,
  isSplitView = true,
}) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isAbcModeActive, setIsAbcModeActive] = useState<boolean>(false);
  const [isBlindMode, setIsBlindMode] = useState<boolean>(false);

  // Live per-question elapsed timer calibrated to pacingTargets
  const [questionElapsed, setQuestionElapsed] = useState<number>(0);

  // Reset elapsed time on question transition
  useEffect(() => {
    setQuestionElapsed(0);
  }, [question.id]);

  // Pause timer when answer is checked
  useEffect(() => {
    if (userState.isAnswerChecked) return;
    const interval = setInterval(() => {
      setQuestionElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [question.id, userState.isAnswerChecked]);

  const targetSeconds = getQuestionTargetSeconds(question);
  const paceColor = getPacePillColor(questionElapsed, targetSeconds, userState.isAnswerChecked);

  const handleCopyId = () => {
    navigator.clipboard.writeText(question.id).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const promptText = question.prompt || question.stem || '';
  const optionsList: AnswerChoice[] = question.options || question.choices || [];

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

  const isSpr = question.questionType === 'spr' || !optionsList || optionsList.length === 0;

  const isAnswered = isSpr
    ? Boolean((userState.sprAnswer && userState.sprAnswer.trim().length > 0) || userState.isAnswerChecked || isQuestionAnswered(question.id))
    : Boolean(userState.selectedChoice !== null || userState.isAnswerChecked || isQuestionAnswered(question.id));
  const isSprCorrect = isSpr && evaluateNumericEquivalence(
    userState.sprAnswer || '',
    String(question.correctAnswer),
    question.acceptedAnswers
  );
  const isSelectedCorrect = isSpr ? isSprCorrect : (userState.selectedChoice === question.correctAnswer);
  const sprPreview = formatSprPreview(userState.sprAnswer || '');

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
  const rationaleText = typeof question.rationale === 'string' 
    ? question.rationale 
    : question.rationale?.summary || '';

  return (
    <div className={`px-4 sm:px-6 lg:px-10 py-5 sm:py-6 overflow-x-hidden bg-white dark:bg-[#070a10] text-slate-900 dark:text-white select-text question-stem ${
      isSplitView
        ? 'h-full overflow-y-auto pb-24'
        : 'h-auto overflow-visible pb-20'
    }`}>
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

          {/* Answered Status Pill in Metadata Strip */}
          {isAnswered && (
            <div
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-2xs animate-in fade-in"
              title={`Question is answered${isSpr && userState.sprAnswer ? ` (${userState.sprAnswer})` : userState.selectedChoice ? ` with Choice ${userState.selectedChoice}` : ''}`}
            >
              <Check className="w-3 h-3 stroke-[2.5]" />
              <span>Answered{isSpr && userState.sprAnswer ? ` (${userState.sprAnswer})` : userState.selectedChoice ? ` (${userState.selectedChoice})` : ''}</span>
            </div>
          )}

          {/* Live Per-Question Pace Pill */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border transition-colors ${paceColor.badgeClass}`}
            title={`Pacing target for ${question.skill} (${question.difficulty}): ${targetSeconds}s`}
          >
            <Clock className="w-3 h-3" />
            <span>{formatSecondsToPace(questionElapsed)} / {formatSecondsToPace(targetSeconds)} target</span>
          </div>
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

          {/* Answered Indicator Badge */}
          {isAnswered && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-600 text-white">
              <Check className="w-3 h-3 stroke-[2.5]" />
              <span>Answered</span>
            </span>
          )}

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
        {!isSpr && (
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
        )}      </div>

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
                <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                  sprPreview.isValid
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                    : 'bg-zinc-100 text-zinc-500 dark:bg-[#181B24] dark:text-[#8E95A5]'
                }`}>
                  {sprPreview.display}
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

          // Compute card styling with clean hairline borders & active rings
          let cardStyleClass = 'border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] hover:bg-zinc-50 hover:border-zinc-300 dark:hover:bg-[#181B24] dark:hover:border-zinc-700 text-zinc-950 dark:text-[#F4F4F6] shadow-2xs';
          let badgeStyleClass = 'border border-zinc-300 dark:border-[#222634] bg-zinc-50 dark:bg-[#181B24] text-zinc-700 dark:text-[#8E95A5]';

          if (isChecked) {
            if (isCorrect) {
              cardStyleClass = 'ring-2 ring-emerald-600 border-transparent bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100 shadow-xs';
              badgeStyleClass = 'bg-emerald-600 text-white border-emerald-600 font-bold';
            } else if (isSelected && !isCorrect) {
              cardStyleClass = 'ring-2 ring-rose-600 border-transparent bg-rose-50/70 dark:bg-rose-950/30 text-rose-950 dark:text-rose-100 shadow-xs';
              badgeStyleClass = 'bg-rose-600 text-white border-rose-600 font-bold';
            } else {
              cardStyleClass = 'border border-zinc-200/60 dark:border-[#222634]/60 bg-zinc-50/30 dark:bg-[#11131A]/30 text-zinc-400 dark:text-zinc-600 opacity-50';
            }
          } else if (isSelected) {
            cardStyleClass = 'ring-2 ring-blue-600 dark:ring-blue-500 border-transparent bg-blue-50/60 dark:bg-blue-950/20 text-zinc-950 dark:text-white shadow-xs';
            badgeStyleClass = 'bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500 font-bold';
          }

          return (
            <div key={choiceId} className="relative flex items-center gap-2 group">
              <button
                disabled={isEliminated}
                onClick={() => onSelectChoice(choiceId as 'A' | 'B' | 'C' | 'D')}
                className={`w-full min-h-[48px] relative text-left rounded-xl px-4 py-3 flex items-start gap-3 transition-all duration-150 ease-spring select-none ${cardStyleClass} ${
                  isEliminated ? 'opacity-40 pointer-events-none' : 'cursor-pointer active:scale-[0.99]'
                }`}
              >
                {/* Horizontal Strike-through line when eliminated */}
                {isEliminated && (
                  <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-[1px] bg-zinc-500 dark:bg-zinc-400 pointer-events-none z-10" />
                )}

                {/* Bordered Letter Badge (A, B, C, D) */}
                <div
                  className={`w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center font-mono text-xs font-semibold tabular-nums transition-all duration-150 group-hover:scale-105 ${badgeStyleClass}`}
                >
                  {isChecked && isCorrect ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : isChecked && isSelected && !isCorrect ? (
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    choiceId
                  )}
                </div>

                {/* Choice Text */}
                <div className="flex-1 pt-0.5 font-serif text-[15px] sm:text-[16px] leading-relaxed text-zinc-950 dark:text-[#F4F4F6]">
                  <RichText text={choice.text} />
                  {choice.imageUrl && (
                    <div className="mt-2.5 p-2 bg-white dark:bg-[#141620] border border-zinc-200 dark:border-[#222634] rounded-lg inline-block">
                      <img src={choice.imageUrl} alt={`Option ${choiceId}`} className="max-h-28 object-contain rounded" loading="lazy" />
                    </div>
                  )}
                </div>
              </button>

              {/* Cross-out / Undo button for ABC elimination mode */}
              {(isAbcModeActive || isEliminated) && (
                <button
                  onClick={() => onToggleEliminate(choiceId as 'A' | 'B' | 'C' | 'D')}
                  className={`flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-xl border transition-all duration-150 cursor-pointer active:scale-90 ${
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

      {/* 5. Inline "Check Answer" & Explanation Controls */}
      <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-[#222634] max-w-[65ch] flex items-center justify-between gap-4 select-none flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => onCheckAnswer(questionElapsed)}
            disabled={isSpr ? (!userState.sprAnswer || userState.sprAnswer.trim().length === 0) : !userState.selectedChoice}
            className={`min-h-[44px] px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 shadow-xs flex items-center gap-2 ${
              (isSpr ? (userState.sprAnswer && userState.sprAnswer.trim().length > 0) : userState.selectedChoice)
                ? 'bg-blue-700 hover:bg-blue-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 hover:shadow active:scale-95 cursor-pointer'
                : 'bg-zinc-200 dark:bg-[#181B24] text-zinc-400 dark:text-zinc-600 cursor-not-allowed border border-transparent'
            }`}
          >
            <span>{userState.isAnswerChecked ? 'Recheck Answer' : 'Check Answer'}</span>
          </button>

          {isAnswered && !userState.isAnswerChecked && (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 flex items-center gap-1.5 border border-blue-200 dark:border-blue-800 animate-in fade-in duration-150">
              <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 stroke-[2.5]" />
              <span>{isSpr ? `Answered (${userState.sprAnswer})` : `Answered (Option ${userState.selectedChoice})`}</span>
            </span>
          )}

          {userState.isAnswerChecked && (
            <>
              <span
                className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-in fade-in duration-150 ${
                  isSelectedCorrect
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
                }`}
              >
                {isSelectedCorrect ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Answered • Correct
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" /> Answered • Incorrect {isSpr ? `(Correct: ${String(question.correctAnswer)}${question.acceptedAnswers && question.acceptedAnswers.length > 0 ? ` or ${question.acceptedAnswers.join(', ')}` : ''})` : `(Answer: Option ${question.correctAnswer})`}
                  </>
                )}
              </span>

              {/* Recorded Pace Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-mono font-bold border transition-colors ${paceColor.badgeClass}`}
                title={`Target: ${targetSeconds}s`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{questionElapsed}s (target: {targetSeconds}s)</span>
              </span>
            </>
          )}
        </div>

        {/* Explanation Toggle Drawer Button */}
        <button
          disabled={!userState.isAnswerChecked}
          onClick={onToggleExplanation}
          className={`flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-all duration-150 px-4 py-2 rounded-xl active:scale-95 ${
            !userState.isAnswerChecked
              ? 'text-zinc-400 bg-zinc-100 dark:bg-[#181B24] border border-zinc-200 dark:border-[#222634] cursor-not-allowed select-none opacity-80'
              : 'text-blue-700 dark:text-blue-300 bg-blue-50/80 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 border border-blue-200/80 dark:border-blue-900/50 cursor-pointer shadow-2xs'
          }`}
          title={
            !userState.isAnswerChecked
              ? 'Select an option and click Check Answer first to unlock the explanation'
              : 'Toggle explanation'
          }
        >
          {!userState.isAnswerChecked ? (
            <span>🔒 Explanation — Answer first</span>
          ) : (
            <>
              <span>Explanation</span>
              {userState.isExplanationOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </>
          )}
        </button>
      </div>

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
