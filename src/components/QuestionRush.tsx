import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Zap, 
  Flame, 
  Clock, 
  Target, 
  Award, 
  ChevronRight, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { MockQuestion, AnswerChoice } from '../types/quiz';
import { 
  RushMode, 
  getQuestionTargetSeconds, 
  calculateRushStars, 
  formatSecondsToPace
} from '../utils/pacingTargets';
import { RichText } from './RichText';
import { BulletPassage, isBulletPassage } from './BulletPassage';
import { PairedPassage, isPairedPassage } from './PairedPassage';
import { recordAnswer, saveQuestion } from '../utils/storage';

interface QuestionRushProps {
  questions: MockQuestion[];
  onOpenQuestionBank?: () => void;
}

interface QuestionResult {
  question: MockQuestion;
  selectedChoice: 'A' | 'B' | 'C' | 'D' | null;
  isCorrect: boolean;
  timeSpent: number;
  targetTime: number;
  starsEarned: number;
}

export const QuestionRush: React.FC<QuestionRushProps> = ({
  questions,
  onOpenQuestionBank,
}) => {
  // Navigation / View state
  const [viewState, setViewState] = useState<'hub' | 'playing' | 'summary'>('hub');

  // Configuration state
  const [selectedMode, setSelectedMode] = useState<RushMode>('normal');
  const [sessionSize, setSessionSize] = useState<number>(10);

  // Active Game state
  const [rushQueue, setRushQueue] = useState<MockQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedChoice, setSelectedChoice] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [showRationale, setShowRationale] = useState<boolean>(false);
  const [mobileRushTab, setMobileRushTab] = useState<'both' | 'passage' | 'question'>('both');

  // Timer state
  const [targetSeconds, setTargetSeconds] = useState<number>(45);
  const [timeRemaining, setTimeRemaining] = useState<number>(45);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQuestion = rushQueue[currentIndex];

  // Start a new rush session
  const handleStartRush = () => {
    if (questions.length === 0) return;

    // Shuffle and pick session questions
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, sessionSize);

    setRushQueue(selected);
    setCurrentIndex(0);
    setResults([]);
    setSelectedChoice(null);
    setIsAnswerRevealed(false);
    setShowRationale(false);
    setViewState('playing');
  };

  // Set up timer whenever currentIndex changes
  useEffect(() => {
    if (viewState !== 'playing' || !currentQuestion) return;

    const target = getQuestionTargetSeconds(currentQuestion, selectedMode);
    setTargetSeconds(target);
    setTimeRemaining(target);
    setElapsedTime(0);
    setSelectedChoice(null);
    setIsAnswerRevealed(false);
    setShowRationale(false);
    setMobileRushTab('both');

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [viewState, currentIndex, currentQuestion, selectedMode]);

  // Handle user choice selection
  const handleSelectChoice = (choiceId: 'A' | 'B' | 'C' | 'D') => {
    if (isAnswerRevealed) return;

    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedChoice(choiceId);
    setIsAnswerRevealed(true);

    const isCorrect = choiceId === currentQuestion.correctAnswer;
    const stars = calculateRushStars(isCorrect, elapsedTime, targetSeconds);

    const resultEntry: QuestionResult = {
      question: currentQuestion,
      selectedChoice: choiceId,
      isCorrect,
      timeSpent: elapsedTime,
      targetTime: targetSeconds,
      starsEarned: stars,
    };

    setResults(prev => [...prev, resultEntry]);

    // Save answered question and record stats
    recordAnswer(
      currentQuestion.id,
      choiceId,
      isCorrect,
      currentQuestion.domain,
      currentQuestion.skill,
      currentQuestion.difficulty,
      elapsedTime || 15
    );
    saveQuestion(currentQuestion.id);
  };

  // Advance to next question or show summary
  const handleNextQuestion = () => {
    if (currentIndex + 1 < rushQueue.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setViewState('summary');
    }
  };

  // Exit back to Hub
  const handleExitRush = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setViewState('hub');
  };

  // Calculate live streak
  const currentStreak = useMemo(() => {
    let streak = 0;
    for (let i = results.length - 1; i >= 0; i--) {
      if (results[i].isCorrect) streak++;
      else break;
    }
    return streak;
  }, [results]);

  // Aggregate stats for summary
  const totalCorrect = results.filter(r => r.isCorrect).length;
  const accuracyPercent = results.length > 0 ? Math.round((totalCorrect / results.length) * 100) : 0;
  const totalStarsEarned = results.reduce((acc, r) => acc + r.starsEarned, 0);
  const avgTimeSpent = results.length > 0 ? Math.round(results.reduce((acc, r) => acc + r.timeSpent, 0) / results.length) : 0;
  const avgTargetTime = results.length > 0 ? Math.round(results.reduce((acc, r) => acc + r.targetTime, 0) / results.length) : 0;

  // ---------------------------------------------------------------------------
  // RENDER: Active Playing Screen
  // ---------------------------------------------------------------------------
  if (viewState === 'playing' && currentQuestion) {
    const timerRatio = targetSeconds > 0 ? timeRemaining / targetSeconds : 0;
    const isTimeLow = timeRemaining <= 10 && timeRemaining > 0;
    const isTimeExpired = timeRemaining === 0;

    return (
      <div className="w-full h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-[#070a10] dark:text-white select-none overflow-hidden">
        {/* Top Rush Game Bar */}
        <div className="px-3.5 sm:px-6 py-2.5 sm:py-3.5 bg-white dark:bg-[#0f1522] border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 shrink-0">
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-4">
            <button
              onClick={handleExitRush}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                Q {currentIndex + 1}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                / {rushQueue.length}
              </span>
            </div>

            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              ⚡ {selectedMode.toUpperCase()}
            </span>

            {/* Mobile-only Stars & Streak in top row */}
            <div className="sm:hidden flex items-center gap-1.5 ml-auto">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-amber-500">
                <span>⭐</span>
                <span>{totalStarsEarned}</span>
              </div>
              {currentStreak > 1 && (
                <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800 text-xs font-bold">
                  <Flame className="w-3 h-3 text-amber-500" />
                  <span>{currentStreak}x</span>
                </div>
              )}
            </div>
          </div>

          {/* Central Countdown Clock */}
          <div className="flex items-center justify-between sm:justify-center gap-3">
            <div className="flex items-center sm:flex-col sm:items-center justify-between w-full sm:w-auto gap-2">
              <div className={`flex items-center gap-1.5 text-sm sm:text-base md:text-lg font-black font-mono tracking-tight ${
                isTimeExpired ? 'text-rose-500' : isTimeLow ? 'text-rose-400 animate-pulse' : timerRatio < 0.3 ? 'text-amber-500' : 'text-emerald-500'
              }`}>
                <Clock className="w-4 h-4" />
                <span>{formatSecondsToPace(timeRemaining)}</span>
                <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-sans font-medium">
                  / {formatSecondsToPace(targetSeconds)}
                </span>
              </div>
              <div className="flex-1 sm:w-44 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 rounded-full ${
                    isTimeExpired ? 'bg-rose-500' : isTimeLow ? 'bg-rose-400' : timerRatio < 0.3 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, timerRatio * 100))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Desktop Star & Streak Tally */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-sm">⭐</span>
              <span className="text-xs font-bold text-amber-500 dark:text-amber-400">
                {totalStarsEarned}
              </span>
            </div>

            {currentStreak > 1 && (
              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-800 text-xs font-bold">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>{currentStreak}x</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile View Switcher (< lg) */}
        <div className="lg:hidden px-3.5 pt-2.5 pb-1 flex items-center justify-center shrink-0 bg-slate-50 dark:bg-[#070a10]">
          <div className="inline-flex p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold w-full max-w-sm">
            <button
              type="button"
              onClick={() => setMobileRushTab('both')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                mobileRushTab === 'both' ? 'bg-white dark:bg-[#0f1522] text-blue-600 dark:text-blue-400 shadow-2xs font-extrabold' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setMobileRushTab('passage')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                mobileRushTab === 'passage' ? 'bg-white dark:bg-[#0f1522] text-blue-600 dark:text-blue-400 shadow-2xs font-extrabold' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Passage
            </button>
            <button
              type="button"
              onClick={() => setMobileRushTab('question')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                mobileRushTab === 'question' ? 'bg-white dark:bg-[#0f1522] text-blue-600 dark:text-blue-400 shadow-2xs font-extrabold' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Choices
            </button>
          </div>
        </div>

        {/* Question Content Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 max-w-7xl mx-auto w-full pb-36 lg:pb-8">
          {/* Left Pane: Passage or Media */}
          {(!mobileRushTab || mobileRushTab === 'both' || mobileRushTab === 'passage') && (
            <div className="bg-white dark:bg-[#0f1522] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col justify-between overflow-y-visible lg:overflow-y-auto max-h-none lg:max-h-[75vh] shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Reading Passage
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {currentQuestion.domain}
                  </span>
                </div>

                {/* Optional Graph/Table Image */}
                {currentQuestion.imageUrl && (
                  <div className="my-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white p-2">
                    <img
                      src={currentQuestion.imageUrl}
                      alt="Question Graphic"
                      className="max-h-56 mx-auto object-contain"
                    />
                  </div>
                )}

                {/* Passage Text: Formats Standard, Bullet (Rhetorical Synthesis), and Paired Passages */}
                <div className="text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 space-y-3 font-serif">
                  {isBulletPassage(currentQuestion.passage) ? (
                    <BulletPassage text={currentQuestion.passage} />
                  ) : isPairedPassage(currentQuestion.passage, currentQuestion.skill) ? (
                    <PairedPassage text={currentQuestion.passage} showTabsOnMobile={true} />
                  ) : (
                    <RichText text={currentQuestion.passage} />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Right Pane: Prompt, Choices & Immediate Feedback */}
          {(!mobileRushTab || mobileRushTab === 'both' || mobileRushTab === 'question') && (
            <div className="bg-white dark:bg-[#0f1522] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-col justify-between overflow-y-visible lg:overflow-y-auto max-h-none lg:max-h-[75vh] space-y-5 shadow-sm">
            <div className="space-y-4">
              {/* Skill & Difficulty Pills */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 rounded-full">
                    {currentQuestion.skill}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    currentQuestion.difficulty === 'Hard'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                      : currentQuestion.difficulty === 'Medium'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  }`}>
                    {currentQuestion.difficulty}
                  </span>
                </div>

                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Target: {formatSecondsToPace(targetSeconds)}
                </span>
              </div>

              {/* Prompt Text */}
              <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                <RichText text={currentQuestion.prompt} />
              </div>

              {/* Choices A-D */}
              <div className="space-y-2.5 pt-2">
                {currentQuestion.options.map((opt: AnswerChoice) => {
                  const isSelected = selectedChoice === opt.id;
                  const isCorrectAnswer = opt.id === currentQuestion.correctAnswer;

                  let buttonStyles = "border-slate-300 dark:border-slate-700 bg-white dark:bg-[#141a24] hover:bg-slate-50 dark:hover:bg-[#1a2233] text-slate-800 dark:text-slate-200";

                  if (isAnswerRevealed) {
                    if (isCorrectAnswer) {
                      buttonStyles = "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/50";
                    } else if (isSelected && !isCorrectAnswer) {
                      buttonStyles = "border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/50";
                    } else {
                      buttonStyles = "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#070a10]/50 text-slate-400 dark:text-slate-600 opacity-60";
                    }
                  } else if (isSelected) {
                    buttonStyles = "border-blue-600 bg-blue-50/80 dark:bg-blue-950/50 text-blue-950 dark:text-white ring-2 ring-blue-600";
                  }

                  return (
                    <button
                      key={opt.id}
                      disabled={isAnswerRevealed}
                      onClick={() => handleSelectChoice(opt.id)}
                      className={`w-full min-h-[48px] text-left p-3.5 rounded-xl border transition-all duration-150 flex items-start gap-3 cursor-pointer disabled:cursor-default ${buttonStyles}`}
                    >
                      <span className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 border ${
                        isAnswerRevealed && isCorrectAnswer
                          ? 'bg-emerald-500 text-white border-emerald-400'
                          : isAnswerRevealed && isSelected && !isCorrectAnswer
                          ? 'bg-rose-500 text-white border-rose-400'
                          : isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}>
                        {opt.id}
                      </span>
                      <div className="text-xs sm:text-sm font-medium leading-relaxed pt-0.5">
                        <RichText text={opt.text} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Immediate Result Banner & Controls */}
            {isAnswerRevealed && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in duration-200">
                <div className={`p-4 rounded-xl flex items-center justify-between ${
                  selectedChoice === currentQuestion.correctAnswer
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/40 text-rose-800 dark:text-rose-300'
                }`}>
                  <div className="flex items-center gap-3">
                    {selectedChoice === currentQuestion.correctAnswer ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                    <div>
                      <div className="font-black text-sm">
                        {selectedChoice === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect'}
                      </div>
                      <div className="text-xs opacity-80">
                        {selectedChoice === currentQuestion.correctAnswer
                          ? `Answered in ${elapsedTime}s (Target: ${targetSeconds}s)`
                          : `Correct answer was option ${currentQuestion.correctAnswer}`}
                      </div>
                    </div>
                  </div>

                  {/* Stars for this question */}
                  <div className="text-right">
                    <span className="text-base">
                      {'⭐'.repeat(calculateRushStars(selectedChoice === currentQuestion.correctAnswer, elapsedTime, targetSeconds))}
                      {'☆'.repeat(3 - calculateRushStars(selectedChoice === currentQuestion.correctAnswer, elapsedTime, targetSeconds))}
                    </span>
                    <span className="block text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      {calculateRushStars(selectedChoice === currentQuestion.correctAnswer, elapsedTime, targetSeconds)} Stars
                    </span>
                  </div>
                </div>

                {/* Explanation Toggle */}
                {currentQuestion.rationale && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowRationale(!showRationale)}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{showRationale ? 'Hide Rationale' : 'View Explanation'}</span>
                      {showRationale ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {showRationale && (
                      <div className="mt-2.5 p-4 rounded-xl bg-slate-50 dark:bg-[#070a10] border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif animate-in fade-in">
                        <RichText text={typeof currentQuestion.rationale === 'string' ? currentQuestion.rationale : currentQuestion.rationale?.summary || ''} />
                      </div>
                    )}
                  </div>
                )}

                {/* Next Question Button */}
                <button
                  onClick={handleNextQuestion}
                  className="w-full py-3 rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-xs transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{currentIndex + 1 < rushQueue.length ? 'Next Question →' : 'View Session Results →'}</span>
                </button>
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: Session Summary Screen
  // ---------------------------------------------------------------------------
  if (viewState === 'summary') {
    return (
      <div className="w-full h-full overflow-y-auto bg-slate-50 text-slate-900 dark:bg-[#070a10] dark:text-white p-6 sm:p-10 select-none">
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Rush Completed</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Session Results
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Here is your accuracy and speed performance across {results.length} questions.
            </p>
          </div>

          {/* Key Stat Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1522] border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-sm">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Score</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {totalCorrect} <span className="text-sm text-slate-400">/ {results.length}</span>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {accuracyPercent}% Accuracy
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1522] border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-sm">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Stars</span>
              <div className="text-2xl font-black text-amber-500 dark:text-amber-400">
                ⭐ {totalStarsEarned}
              </div>
              <span className="text-xs text-slate-400">
                Max {results.length * 3}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1522] border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-sm">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg Time</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {formatSecondsToPace(avgTimeSpent)}
              </div>
              <span className="text-xs text-slate-400">
                per question
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1522] border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-sm">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Target Pace</span>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {formatSecondsToPace(avgTargetTime)}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {avgTimeSpent <= avgTargetTime ? '✓ On Target' : '⚠️ Slower than target'}
              </span>
            </div>
          </div>

          {/* Breakdown Review of Each Question */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Question Breakdown
            </h3>

            <div className="space-y-2">
              {results.map((res, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white dark:bg-[#0f1522] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 text-xs shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block sm:inline">
                        {res.question.skill}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 hidden sm:inline"> • </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {res.question.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                      res.timeSpent <= res.targetTime 
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                    }`}>
                      {res.timeSpent}s / {res.targetTime}s
                    </span>

                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      res.isCorrect ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}>
                      {res.isCorrect ? 'Correct' : 'Missed'}
                    </span>

                    <span className="text-sm">
                      {'⭐'.repeat(res.starsEarned)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={handleExitRush}
              className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Back to Hub</span>
            </button>

            <button
              onClick={handleStartRush}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Rush Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: Question Rush Hub Screen
  // ---------------------------------------------------------------------------
  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-[#070a10] text-slate-900 dark:text-white select-text">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-200">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-[#222634]">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-950 dark:bg-blue-600 flex items-center justify-center text-white shrink-0">
                <Zap className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-[#F4F4F6] tracking-tight">
                Question Rush
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-200 dark:bg-[#181B24] dark:text-[#8E95A5] dark:border-[#222634]">
                Timed Mode
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-[#8E95A5]">
              High-intensity SAT pacing trainer. Race against dynamic question timers calibrated by skill and difficulty.
            </p>
          </div>

          {onOpenQuestionBank && (
            <button
              type="button"
              onClick={onOpenQuestionBank}
              className="px-3.5 py-1.5 rounded-lg border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] hover:bg-zinc-100 dark:hover:bg-[#181B24] text-xs font-semibold text-zinc-900 dark:text-[#F4F4F6] transition-colors duration-150 flex items-center gap-2 cursor-pointer self-start sm:self-center"
            >
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={1.75} />
              <span>Filter Question Bank</span>
            </button>
          )}
        </div>

        {/* 1. "What is Question Rush?" Banner Card */}
        <div className="rounded-xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] text-zinc-950 dark:text-[#F4F4F6] p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60">
              ⚡ Target Pacing
            </span>
            <span className="text-xs font-mono text-zinc-500 dark:text-[#8E95A5]">
              Official Digital SAT Timed Practice
            </span>
          </div>

          <div className="max-w-3xl space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-zinc-950 dark:text-[#F4F4F6] tracking-tight flex items-center gap-2">
              <span>What is Question Rush?</span>
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={1.75} />
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-[#8E95A5] leading-relaxed">
              Question Rush trains speed, precision, and intuition under pressure. Every question is dynamically calibrated to its official College Board <span className="text-blue-700 dark:text-blue-400 font-semibold">Skill × Difficulty</span> target time (25 seconds for grammar up to 120 seconds for cross-text inferences). Beat the target countdown to rack up 3-Star Mastery and lock in your test-day pacing rhythm.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs font-medium text-zinc-700 dark:text-[#8E95A5]">
            <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-[#181B24] px-2.5 py-1 rounded-md border border-zinc-200 dark:border-[#222634]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} />
              <span>100% Non-Active Questions</span>
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-[#181B24] px-2.5 py-1 rounded-md border border-zinc-200 dark:border-[#222634]">
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" strokeWidth={1.75} />
              <span>Dynamic Skill Clocks</span>
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-[#181B24] px-2.5 py-1 rounded-md border border-zinc-200 dark:border-[#222634]">
              <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" strokeWidth={1.75} />
              <span>3-Star Speed Ratings</span>
            </div>
          </div>
        </div>

        {/* 2. Two Workspace Cards: Reading & Writing and Math */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Hero Card 1: Reading & Writing */}
          <div className="rounded-xl bg-white dark:bg-[#11131A] text-zinc-950 dark:text-[#F4F4F6] border border-zinc-200 dark:border-[#222634] p-5 sm:p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                  Ready to Practice
                </span>
                <span className="text-xs font-mono text-zinc-500 dark:text-[#8E95A5] tabular-nums">
                  {questions.length} questions
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-zinc-950 dark:text-[#F4F4F6] tracking-tight">
                  Reading &amp; Writing Rush
                </h3>
                <p className="text-xs text-zinc-600 dark:text-[#8E95A5] mt-1 leading-relaxed">
                  Fast-paced drills across Craft &amp; Structure, Information &amp; Ideas, Expression of Ideas, and Standard English Conventions.
                </p>
              </div>

              {/* Speed Mode Selector */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-[11px] font-mono font-semibold text-zinc-500 dark:text-[#8E95A5] uppercase tracking-wider">
                  Pacing Multiplier
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'blitz', label: 'Blitz', sub: '0.8x Target' },
                    { id: 'normal', label: 'Normal', sub: '1.0x Target' },
                    { id: 'relaxed', label: 'Relaxed', sub: '1.25x Target' },
                  ].map(mode => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setSelectedMode(mode.id as RushMode)}
                      className={`p-2 rounded-lg border text-center transition-colors duration-150 cursor-pointer ${
                        selectedMode === mode.id
                          ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-600'
                          : 'border-zinc-200 dark:border-[#222634] bg-zinc-50 dark:bg-[#181B24] text-zinc-700 dark:text-[#8E95A5] hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="text-xs font-semibold">{mode.label}</div>
                      <div className="text-[10px] font-mono text-zinc-500 dark:text-[#8E95A5] mt-0.5">{mode.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sprint Length Selector */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-zinc-600 dark:text-[#8E95A5] font-mono text-[11px]">Sprint Length:</span>
                <div className="flex items-center gap-1.5">
                  {[5, 10, 15, 20].map(sz => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSessionSize(sz)}
                      className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-colors duration-150 cursor-pointer tabular-nums ${
                        sessionSize === sz
                          ? 'bg-zinc-950 dark:bg-blue-600 text-white'
                          : 'bg-zinc-100 dark:bg-[#181B24] text-zinc-700 dark:text-[#8E95A5] border border-zinc-200 dark:border-[#222634] hover:bg-zinc-200 dark:hover:bg-[#202534]'
                      }`}
                    >
                      {sz} Qs
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <button
              onClick={handleStartRush}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-xs transition-colors duration-150 flex items-center justify-between cursor-pointer"
            >
              <span>Start Timed Rush</span>
              <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>

          {/* Hero Card 2: Math (Coming Soon) */}
          <div className="relative rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-sm dark:bg-[#0f1522] dark:border-slate-800 dark:text-white p-6 sm:p-7 flex flex-col justify-between space-y-6 opacity-85">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                  Coming Soon
                </span>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                  0 questions
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Math Rush
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Fast-paced drills across Algebra, Advanced Math, Problem-Solving &amp; Data Analysis, and Geometry &amp; Trigonometry.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#070a10] border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">Digital SAT Math Timing:</span>
                <span>Calibrated to 95 seconds per problem with built-in Desmos scientific graphing workflows.</span>
              </div>
            </div>

            <button
              disabled
              className="w-full py-3.5 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-wider border border-slate-200 dark:border-slate-700 cursor-not-allowed flex items-center justify-between"
            >
              <span>Math Rush (Coming Soon)</span>
              <span className="text-xs">🔒</span>
            </button>
          </div>
        </div>

        {/* 3. 3-Column "How It Works" Section */}
        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              How It Works
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Master speed strategy without sacrificing accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column 1: Pick Your Focus */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-sm dark:bg-[#0f1522] dark:border-slate-800 dark:text-white space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Target className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Pick Your Focus
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Choose Reading &amp; Writing and set your speed intensity: Blitz (0.8x), Normal (1.0x), or Relaxed (1.25x) to challenge your limits.
              </p>
            </div>

            {/* Column 2: Race the Clock */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-sm dark:bg-[#0f1522] dark:border-slate-800 dark:text-white space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-sky-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Race the Clock
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Each question features a live countdown clock based on its Skill &amp; Difficulty (25s for grammar up to 120s for inferences + 10s for graphs).
              </p>
            </div>

            {/* Column 3: Track Your Progress */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 text-slate-900 shadow-sm dark:bg-[#0f1522] dark:border-slate-800 dark:text-white space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Track Your Progress
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Score ⭐⭐⭐ for beating target time by 25–30%, ⭐⭐ for hitting target pace, and review your full timing breakdown after every rush.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
          © Oluwole Inuoluwadunsimi 2026 • SATify Question Rush
        </div>
      </div>
    </div>
  );
};

export default QuestionRush;
