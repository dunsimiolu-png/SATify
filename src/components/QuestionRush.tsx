import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Zap, 
  Flame, 
  Clock, 
  Compass, 
  Calculator, 
  Award, 
  ChevronRight, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  BookOpen
} from 'lucide-react';
import { MockQuestion } from '../types/quiz';
import { 
  RushMode, 
  getQuestionTargetSeconds, 
  calculateRushStars, 
  formatSecondsToPace
} from '../utils/pacingTargets';
import { allEnglishQuestions, allMathQuestions } from '../data/mockQuestions';
import { DesmosCalculator } from './DesmosCalculator';
import { ReferenceModal } from './ReferenceModal';
import { evaluateNumericEquivalence, formatSprPreview } from '../utils/mathEvaluator';
import { RichText } from './RichText';
import { BulletPassage, isBulletPassage } from './BulletPassage';
import { PairedPassage, isPairedPassage } from './PairedPassage';
import { ExplanationRenderer } from './ExplanationRenderer';
import { recordAnswer, saveQuestion } from '../utils/storage';

interface QuestionRushProps {
  questions: MockQuestion[];
  onOpenQuestionBank?: () => void;
}

interface QuestionResult {
  question: MockQuestion;
  selectedChoice: 'A' | 'B' | 'C' | 'D' | string | null;
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
  const [activeRushSection, setActiveRushSection] = useState<'Reading and Writing' | 'Math'>('Reading and Writing');

  // Active Game state
  const [rushQueue, setRushQueue] = useState<MockQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedChoice, setSelectedChoice] = useState<'A' | 'B' | 'C' | 'D' | string | null>(null);
  const [sprInput, setSprInput] = useState<string>('');
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [showRationale, setShowRationale] = useState<boolean>(false);
  const [mobileRushTab, setMobileRushTab] = useState<'both' | 'passage' | 'question'>('both');

  // Calculator and Reference modal states for Math Rush
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [isReferenceOpen, setIsReferenceOpen] = useState<boolean>(false);

  // Timer state
  const [targetSeconds, setTargetSeconds] = useState<number>(45);
  const [timeRemaining, setTimeRemaining] = useState<number>(45);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQuestion = rushQueue[currentIndex];

  const mathDomains = ['Algebra', 'Advanced Math', 'Problem-Solving and Data Analysis', 'Geometry and Trigonometry'];
  const englishQuestions = useMemo(() => {
    const fromProps = questions.filter(q => q.section === 'Reading and Writing' || (!q.section && !mathDomains.includes(q.domain)));
    return fromProps.length > 0 ? fromProps : allEnglishQuestions;
  }, [questions]);

  const mathQuestions = useMemo(() => {
    const fromProps = questions.filter(q => q.section === 'Math' || mathDomains.includes(q.domain));
    return fromProps.length > 0 ? fromProps : allMathQuestions;
  }, [questions]);

  // Start a new rush session
  const handleStartRush = (section: 'Reading and Writing' | 'Math' = 'Reading and Writing') => {
    const pool = section === 'Math' ? mathQuestions : englishQuestions;
    if (pool.length === 0) return;

    // Shuffle and pick session questions
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, sessionSize);

    setActiveRushSection(section);
    setRushQueue(selected);
    setCurrentIndex(0);
    setResults([]);
    setSelectedChoice(null);
    setSprInput('');
    setIsAnswerRevealed(false);
    setShowRationale(false);
    setViewState('playing');
  };

  // Keyboard shortcut C to toggle calculator during Math Rush
  useEffect(() => {
    if (viewState !== 'playing' || !currentQuestion) return;
    const isMath = currentQuestion.section === 'Math' || activeRushSection === 'Math';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key.toLowerCase() === 'c' && isMath) {
        setIsCalculatorOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewState, currentQuestion, activeRushSection]);

  // Preload next 2 questions' math graph/figure images in memory so diagrams appear instantaneously
  useEffect(() => {
    if (typeof window === 'undefined' || viewState !== 'playing' || !rushQueue || rushQueue.length === 0) return;
    const nextQuestions = rushQueue.slice(currentIndex + 1, currentIndex + 3);
    for (const q of nextQuestions) {
      if (q.imageUrl) {
        const img = new Image();
        img.src = q.imageUrl;
      }
      if (q.options) {
        for (const opt of q.options) {
          if (opt.imageUrl) {
            const optImg = new Image();
            optImg.src = opt.imageUrl;
          }
        }
      }
    }
  }, [currentIndex, rushQueue, viewState]);

  // Set up timer whenever currentIndex changes
  useEffect(() => {
    if (viewState !== 'playing' || !currentQuestion) return;

    const target = getQuestionTargetSeconds(currentQuestion, selectedMode);
    setTargetSeconds(target);
    setTimeRemaining(target);
    setElapsedTime(0);
    setSelectedChoice(null);
    setSprInput('');
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

  // Handle user choice selection for MCQ
  const handleSelectChoice = (choiceId: 'A' | 'B' | 'C' | 'D') => {
    if (isAnswerRevealed) return;

    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedChoice(choiceId);
    setIsAnswerRevealed(true);

    const isCorrect = choiceId === currentQuestion.correctAnswer;
    const stars = calculateRushStars(isCorrect, elapsedTime, targetSeconds, currentQuestion.skill);

    const resultEntry: QuestionResult = {
      question: currentQuestion,
      selectedChoice: choiceId,
      isCorrect,
      timeSpent: elapsedTime,
      targetTime: targetSeconds,
      starsEarned: stars,
    };

    setResults(prev => [...prev, resultEntry]);

    // Record to storage
    recordAnswer(
      currentQuestion.id,
      choiceId,
      isCorrect,
      currentQuestion.domain,
      currentQuestion.skill,
      currentQuestion.difficulty,
      elapsedTime
    );
    saveQuestion(currentQuestion.id);
  };

  // Handle Student-Produced Response submit for Math
  const handleSprSubmit = () => {
    if (isAnswerRevealed || !sprInput.trim()) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const cleanAns = sprInput.trim();
    const isCorrect = evaluateNumericEquivalence(
      cleanAns,
      String(currentQuestion.correctAnswer),
      currentQuestion.acceptedAnswers
    );
    const stars = calculateRushStars(isCorrect, elapsedTime, targetSeconds, currentQuestion.skill);

    setSelectedChoice(cleanAns);
    setIsAnswerRevealed(true);

    const resultEntry: QuestionResult = {
      question: currentQuestion,
      selectedChoice: cleanAns,
      isCorrect,
      timeSpent: elapsedTime,
      targetTime: targetSeconds,
      starsEarned: stars,
    };

    setResults(prev => [...prev, resultEntry]);

    // Record to storage
    recordAnswer(
      currentQuestion.id,
      cleanAns,
      isCorrect,
      currentQuestion.domain,
      currentQuestion.skill,
      currentQuestion.difficulty,
      elapsedTime
    );
    saveQuestion(currentQuestion.id);
  };

  // Move to next question or complete session
  const handleNextQuestion = () => {
    if (currentIndex + 1 < rushQueue.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setViewState('summary');
    }
  };

  // Exit back to Rush Hub
  const handleExitRush = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setViewState('hub');
  };

  // Calculate live streak from current results
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

    const isMath = currentQuestion.section === 'Math' || activeRushSection === 'Math' || mathDomains.includes(currentQuestion.domain || '');
    const isSpr = currentQuestion.questionType === 'spr' || !currentQuestion.options || currentQuestion.options.length === 0;

    const sprPreview = formatSprPreview(sprInput);

    const isSelectedCorrect = isSpr
      ? evaluateNumericEquivalence(String(selectedChoice || ''), String(currentQuestion.correctAnswer), currentQuestion.acceptedAnswers)
      : selectedChoice === currentQuestion.correctAnswer;

    return (
      <div className="w-full h-full flex flex-col bg-neutral-50 text-zinc-950 dark:bg-[#090A0F] dark:text-[#F4F4F6] select-none overflow-hidden">
        {/* Top Rush Game Bar */}
        <div className="px-3.5 sm:px-6 py-2.5 sm:py-3.5 bg-white/95 dark:bg-[#11131A]/95 backdrop-blur-md border-b border-zinc-200 dark:border-[#222634] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 shrink-0">
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-4">
            <button
              onClick={handleExitRush}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-[#222634] hover:bg-zinc-100 dark:hover:bg-[#181B24] text-xs font-semibold text-zinc-700 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-white active:scale-95 transition-all duration-150 cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs font-bold text-zinc-950 dark:text-[#F4F4F6]">
                Q {currentIndex + 1}
              </span>
              <span className="text-xs text-zinc-400 dark:text-[#8E95A5]">
                / {rushQueue.length}
              </span>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-blue-50/90 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60 shadow-2xs">
              ⚡ {selectedMode.toUpperCase()}
            </span>

            {/* Math Tools in Rush Bar */}
            {isMath && (
              <div className="flex items-center gap-1.5 ml-1">
                <button
                  type="button"
                  onClick={() => setIsCalculatorOpen(prev => !prev)}
                  className="px-2.5 py-1 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-100 text-xs font-semibold text-blue-700 dark:text-blue-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Toggle Desmos Calculator (C)"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Calculator</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsReferenceOpen(true)}
                  className="px-2.5 py-1 rounded-xl border border-zinc-200 dark:border-[#222634] hover:bg-zinc-100 dark:hover:bg-[#181B24] text-xs font-medium text-zinc-700 dark:text-[#8E95A5] transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Open Math Reference Sheet"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reference</span>
                </button>
              </div>
            )}

            {/* Mobile-only Stars & Streak in top row */}
            <div className="sm:hidden flex items-center gap-1.5 ml-auto">
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-[#181B24] px-2.5 py-1 rounded-xl border border-zinc-200 dark:border-[#222634] text-xs font-semibold text-amber-500">
                <span>⭐</span>
                <span>{totalStarsEarned}</span>
              </div>
              {currentStreak > 1 && (
                <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-xl border border-amber-200 dark:border-amber-800 text-xs font-semibold">
                  <Flame className="w-3 h-3 text-amber-500" />
                  <span>{currentStreak}x</span>
                </div>
              )}
            </div>
          </div>

          {/* Central Countdown Clock */}
          <div className="flex items-center justify-between sm:justify-center gap-3">
            <div className="flex items-center sm:flex-col sm:items-center justify-between w-full sm:w-auto gap-2">
              <div className={`flex items-center gap-1.5 text-sm sm:text-base md:text-lg font-bold font-mono tracking-tight ${
                isTimeExpired ? 'text-rose-500' : isTimeLow ? 'text-rose-400 animate-pulse' : timerRatio < 0.3 ? 'text-amber-500' : 'text-emerald-500'
              }`}>
                <Clock className="w-4 h-4" />
                <span>{formatSecondsToPace(timeRemaining)}</span>
                <span className="text-[11px] sm:text-xs text-zinc-400 dark:text-[#8E95A5] font-sans font-medium">
                  / {formatSecondsToPace(targetSeconds)}
                </span>
              </div>
              <div className="flex-1 sm:w-44 h-1.5 bg-zinc-200 dark:bg-[#181B24] rounded-full overflow-hidden">
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
            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-[#181B24] px-3 py-1 rounded-xl border border-zinc-200 dark:border-[#222634] shadow-2xs">
              <span className="text-sm">⭐</span>
              <span className="text-xs font-semibold text-amber-500 dark:text-amber-400">
                {totalStarsEarned}
              </span>
            </div>

            {currentStreak > 1 && (
              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-800 text-xs font-semibold shadow-2xs">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>{currentStreak}x</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile View Switcher (< lg) */}
        <div className="lg:hidden px-3.5 pt-2.5 pb-1 flex items-center justify-center shrink-0 bg-neutral-50 dark:bg-[#090A0F]">
          <div className="inline-flex p-1 bg-zinc-200/80 dark:bg-[#181B24] rounded-xl border border-zinc-300/80 dark:border-[#222634] text-xs font-medium w-full max-w-sm">
            <button
              type="button"
              onClick={() => setMobileRushTab('both')}
              className={`flex-1 py-1.5 rounded-lg transition-all duration-150 active:scale-95 ${
                mobileRushTab === 'both' ? 'bg-white dark:bg-[#11131A] text-blue-700 dark:text-blue-400 shadow-2xs font-semibold' : 'text-zinc-600 dark:text-[#8E95A5]'
              }`}
            >
              Both
            </button>
            <button
              type="button"
              onClick={() => setMobileRushTab('passage')}
              className={`flex-1 py-1.5 rounded-lg transition-all duration-150 active:scale-95 ${
                mobileRushTab === 'passage' ? 'bg-white dark:bg-[#11131A] text-blue-700 dark:text-blue-400 shadow-2xs font-semibold' : 'text-zinc-600 dark:text-[#8E95A5]'
              }`}
            >
              Passage
            </button>
            <button
              type="button"
              onClick={() => setMobileRushTab('question')}
              className={`flex-1 py-1.5 rounded-lg transition-all duration-150 active:scale-95 ${
                mobileRushTab === 'question' ? 'bg-white dark:bg-[#11131A] text-blue-700 dark:text-blue-400 shadow-2xs font-semibold' : 'text-zinc-600 dark:text-[#8E95A5]'
              }`}
            >
              Question
            </button>
          </div>
        </div>

        {/* Workspace Split (Passage Left, Question Right) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-[#222634]">
          {/* Left Column: Passage / Stimulus */}
          <div className={`p-4 sm:p-6 lg:p-8 overflow-y-auto bg-white dark:bg-[#11131A] ${
            mobileRushTab === 'question' ? 'hidden lg:block' : 'block'
          }`}>
            {/* Domain & Skill Badge */}
            <div className="mb-4 flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-zinc-100 text-zinc-700 dark:bg-[#181B24] dark:text-[#8E95A5] border border-zinc-200 dark:border-[#222634]">
                {currentQuestion.domain}
              </span>
              <span className="text-zinc-400 dark:text-zinc-600">•</span>
              <span className="text-xs text-zinc-500 dark:text-[#8E95A5] font-medium">
                {currentQuestion.skill}
              </span>
            </div>

            {/* Visual Figure / Diagram if present */}
            {currentQuestion.imageUrl && (
              <div className="mb-4 p-3 bg-zinc-50 dark:bg-[#181B24] border border-zinc-200 dark:border-[#222634] rounded-xl flex items-center justify-center">
                <img src={currentQuestion.imageUrl} alt="Question figure" className="max-w-full max-h-64 object-contain rounded" />
              </div>
            )}

            {/* Stimulus Passage Content */}
            <div className="font-serif text-sm sm:text-base leading-relaxed text-zinc-950 dark:text-[#F4F4F6] whitespace-pre-line">
              {isBulletPassage(currentQuestion.passage) ? (
                <BulletPassage text={currentQuestion.passage} target="passage" highlights={[]} onHighlightClick={() => {}} />
              ) : isPairedPassage(currentQuestion.passage, currentQuestion.skill) ? (
                <PairedPassage text={currentQuestion.passage} target="passage" highlights={[]} onHighlightClick={() => {}} />
              ) : (
                <RichText text={currentQuestion.passage || 'Solve the question presented.'} />
              )}
            </div>
          </div>

          {/* Right Column: Prompt & Choices or SPR Input */}
          <div className={`p-4 sm:p-6 lg:p-8 overflow-y-auto bg-neutral-50/50 dark:bg-[#090A0F]/50 flex flex-col justify-between space-y-6 ${
            mobileRushTab === 'passage' ? 'hidden lg:flex' : 'flex'
          }`}>
            <div className="space-y-5">
              {/* Question Prompt */}
              <div className="font-serif font-medium text-sm sm:text-base leading-relaxed text-zinc-950 dark:text-[#F4F4F6]">
                <RichText text={currentQuestion.prompt} />
              </div>

              {/* Choices: SPR Input or Multiple Choice Options */}
              {isSpr ? (
                <div className="space-y-3 max-w-xl">
                  <div className="p-4 rounded-xl border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 font-mono">
                        Student-Produced Response
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400 dark:text-[#8E95A5]">
                        {sprInput.length} / 6 chars
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={sprInput}
                        onChange={(e) => {
                          let filtered = e.target.value.replace(/[^0-9.\/-]/g, '');
                          if (filtered.indexOf('-') > 0) {
                            filtered = filtered.charAt(0) === '-' ? '-' + filtered.slice(1).replace(/-/g, '') : filtered.replace(/-/g, '');
                          }
                          if (filtered.length > 6) filtered = filtered.slice(0, 6);
                          setSprInput(filtered);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !isAnswerRevealed && sprInput.trim()) {
                            handleSprSubmit();
                          }
                        }}
                        placeholder="e.g. 3/5 or 0.6"
                        disabled={isAnswerRevealed}
                        maxLength={6}
                        autoFocus
                        className="flex-1 font-mono text-xl font-bold px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-[#222634] bg-zinc-50 dark:bg-[#181B24] text-zinc-950 dark:text-[#F4F4F6] focus:border-blue-600 focus:outline-none"
                      />
                      {!isAnswerRevealed && (
                        <button
                          type="button"
                          onClick={handleSprSubmit}
                          disabled={!sprInput.trim()}
                          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            sprInput.trim()
                              ? 'bg-blue-700 hover:bg-blue-800 text-white shadow-xs cursor-pointer active:scale-95'
                              : 'bg-zinc-200 dark:bg-[#181B24] text-zinc-400 cursor-not-allowed'
                          }`}
                        >
                          Submit
                        </button>
                      )}
                    </div>

                    {sprInput.length > 0 && (
                      <div className="flex items-center gap-2 pt-1 text-xs">
                        <span className="font-mono text-[11px] font-bold text-zinc-400">Preview:</span>
                        <span className="px-2 py-0.5 rounded font-mono font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-xs border border-blue-200 dark:border-blue-800">
                          {sprPreview.display}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(currentQuestion.options || currentQuestion.choices || []).map((opt) => {
                    const isSelected = selectedChoice === opt.id;
                    const isCorrectAnswer = opt.id === currentQuestion.correctAnswer;

                    let buttonStyles = "border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#141620] hover:bg-zinc-50 dark:hover:bg-[#1a1d2a] hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-900 dark:text-zinc-200";

                    if (isAnswerRevealed) {
                      if (isCorrectAnswer) {
                        buttonStyles = "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/50";
                      } else if (isSelected && !isCorrectAnswer) {
                        buttonStyles = "border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 ring-2 ring-rose-500/50";
                      } else {
                        buttonStyles = "border-zinc-200/60 dark:border-[#181B24] bg-zinc-50/50 dark:bg-[#090A0F]/50 text-zinc-400 dark:text-zinc-600 opacity-60";
                      }
                    } else if (isSelected) {
                      buttonStyles = "border-blue-600 bg-blue-50/80 dark:bg-blue-950/50 text-blue-950 dark:text-white ring-2 ring-blue-600";
                    }

                    return (
                      <button
                        key={opt.id}
                        disabled={isAnswerRevealed}
                        onClick={() => handleSelectChoice(opt.id as 'A' | 'B' | 'C' | 'D')}
                        className={`w-full min-h-[48px] text-left p-3.5 rounded-xl border transition-all duration-150 ease-spring active:scale-[0.99] shadow-2xs flex items-start gap-3 cursor-pointer disabled:cursor-default ${buttonStyles}`}
                      >
                        <span className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 border transition-transform duration-150 ${
                          isAnswerRevealed && isCorrectAnswer
                            ? 'bg-emerald-500 text-white border-emerald-400'
                            : isAnswerRevealed && isSelected && !isCorrectAnswer
                            ? 'bg-rose-500 text-white border-rose-400'
                            : isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-zinc-100 dark:bg-[#181B24] text-zinc-700 dark:text-[#8E95A5] border-zinc-300 dark:border-[#222634]'
                        }`}>
                          {opt.id}
                        </span>
                        <div className="text-xs sm:text-sm font-medium leading-relaxed pt-0.5 flex-1">
                          <RichText text={opt.text} />
                          {opt.imageUrl && (
                            <div className="mt-2 p-1.5 bg-zinc-50 dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] rounded inline-block">
                              <img src={opt.imageUrl} alt={`Option ${opt.id}`} className="max-h-24 object-contain rounded" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Immediate Result Banner & Controls */}
            {isAnswerRevealed && (
              <div className="pt-4 border-t border-zinc-200 dark:border-[#222634] space-y-4 animate-in fade-in duration-200">
                <div className={`p-4 rounded-xl flex items-center justify-between ${
                  isSelectedCorrect
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/40 text-emerald-950 dark:text-emerald-300'
                    : 'bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/40 text-rose-950 dark:text-rose-300'
                }`}>
                  <div className="flex items-center gap-3">
                    {isSelectedCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                    )}
                    <div>
                      <div className="font-bold text-sm">
                        {isSelectedCorrect ? 'Correct!' : 'Incorrect'}
                      </div>
                      <div className="text-xs opacity-80">
                        {isSelectedCorrect
                          ? `Answered in ${elapsedTime}s (Target: ${targetSeconds}s)`
                          : isSpr
                          ? `Correct answer was ${currentQuestion.correctAnswer}${currentQuestion.acceptedAnswers && currentQuestion.acceptedAnswers.length > 0 ? ` or ${currentQuestion.acceptedAnswers.join(', ')}` : ''}`
                          : `Correct answer was option ${currentQuestion.correctAnswer}`}
                      </div>
                    </div>
                  </div>

                  {/* Stars for this question */}
                  {isSelectedCorrect && (
                    <div className="flex items-center gap-1 text-base animate-in zoom-in-75 duration-200">
                      {'⭐'.repeat(calculateRushStars(true, elapsedTime, targetSeconds, currentQuestion.skill))}
                    </div>
                  )}
                </div>

                {/* Explanation Toggle & Next Question Button */}
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => setShowRationale(prev => !prev)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-white px-3 py-2 rounded-lg border border-zinc-200 dark:border-[#222634] transition-all cursor-pointer"
                  >
                    <span>{showRationale ? 'Hide Explanation' : 'View Explanation'}</span>
                    {showRationale ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 text-white font-semibold text-xs transition-all active:scale-95 shadow-xs flex items-center gap-1.5 cursor-pointer ml-auto"
                  >
                    <span>{currentIndex + 1 < rushQueue.length ? 'Next Question' : 'View Summary'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Rationale Drawer */}
                {showRationale && (
                  <div className="p-4 rounded-xl bg-zinc-100 dark:bg-[#181B24] border border-zinc-200 dark:border-[#222634] text-xs text-zinc-800 dark:text-zinc-300 space-y-2 animate-in fade-in duration-150">
                    <span className="font-bold block text-zinc-950 dark:text-white">Official Rationale:</span>
                    <ExplanationRenderer rationale={typeof currentQuestion.rationale === 'string' ? currentQuestion.rationale : currentQuestion.rationale.summary} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Floating Desmos & Reference for Rush */}
        <DesmosCalculator isOpen={isCalculatorOpen} onClose={() => setIsCalculatorOpen(false)} />
        <ReferenceModal isOpen={isReferenceOpen} onClose={() => setIsReferenceOpen(false)} />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: Session Summary Screen
  // ---------------------------------------------------------------------------
  if (viewState === 'summary') {
    return (
      <div className="w-full h-full overflow-y-auto bg-neutral-50 text-zinc-950 dark:bg-[#090A0F] dark:text-[#F4F4F6] p-6 sm:p-10 select-none">
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Rush Completed ({activeRushSection})</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-950 dark:text-[#F4F4F6] tracking-tight">
              Session Results
            </h1>
            <p className="text-sm text-zinc-600 dark:text-[#8E95A5]">
              Here is your accuracy and speed performance across {results.length} questions.
            </p>
          </div>

          {/* Key Stat Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] text-center space-y-1 shadow-xs transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-0.5">
              <span className="text-xs font-semibold text-zinc-500 dark:text-[#8E95A5] uppercase tracking-wider">Score</span>
              <div className="text-2xl font-bold text-zinc-950 dark:text-[#F4F4F6]">
                {totalCorrect} <span className="text-sm text-zinc-400 dark:text-zinc-600">/ {results.length}</span>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {accuracyPercent}% Accuracy
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] text-center space-y-1 shadow-xs transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-0.5">
              <span className="text-xs font-semibold text-zinc-500 dark:text-[#8E95A5] uppercase tracking-wider">Total Stars</span>
              <div className="text-2xl font-bold text-amber-500 dark:text-amber-400">
                ⭐ {totalStarsEarned}
              </div>
              <span className="text-xs text-zinc-400 dark:text-[#8E95A5]">
                Max {results.length * 3}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] text-center space-y-1 shadow-xs transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-0.5">
              <span className="text-xs font-semibold text-zinc-500 dark:text-[#8E95A5] uppercase tracking-wider">Avg Time</span>
              <div className="text-2xl font-mono font-bold text-zinc-950 dark:text-[#F4F4F6]">
                {formatSecondsToPace(avgTimeSpent)}
              </div>
              <span className="text-xs text-zinc-400 dark:text-[#8E95A5]">
                per question
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] text-center space-y-1 shadow-xs transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-0.5">
              <span className="text-xs font-semibold text-zinc-500 dark:text-[#8E95A5] uppercase tracking-wider">Target Pace</span>
              <div className="text-2xl font-mono font-bold text-blue-700 dark:text-blue-400">
                {formatSecondsToPace(avgTargetTime)}
              </div>
              <span className="text-xs text-zinc-500 dark:text-[#8E95A5]">
                {avgTimeSpent <= avgTargetTime ? '✓ On Target' : '⚠️ Slower than target'}
              </span>
            </div>
          </div>

          {/* Breakdown Review of Each Question */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#8E95A5]">
              Question Breakdown
            </h3>

            <div className="space-y-2">
              {results.map((res, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] flex items-center justify-between gap-4 text-xs shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-150"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-[#181B24] text-zinc-700 dark:text-zinc-300 font-bold flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-semibold text-zinc-950 dark:text-[#F4F4F6] block sm:inline">
                        {res.question.skill}
                      </span>
                      <span className="text-zinc-400 dark:text-zinc-600 hidden sm:inline"> • </span>
                      <span className="text-zinc-500 dark:text-[#8E95A5]">
                        {res.question.difficulty}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`font-mono font-semibold px-2 py-0.5 rounded-lg text-xs ${
                      res.timeSpent <= res.targetTime 
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                    }`}>
                      {res.timeSpent}s / {res.targetTime}s
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full font-semibold uppercase text-[10px] ${
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
              className="px-6 py-2.5 rounded-xl border border-zinc-200 dark:border-[#222634] hover:bg-zinc-100 dark:hover:bg-[#181B24] text-zinc-700 dark:text-zinc-300 font-semibold text-xs uppercase tracking-wider transition-all duration-150 active:scale-95 cursor-pointer flex items-center gap-2 shadow-2xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Back to Hub</span>
            </button>

            <button
              onClick={() => handleStartRush(activeRushSection)}
              className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 text-white font-semibold text-xs uppercase tracking-wider shadow-xs hover:shadow transition-all duration-150 active:scale-95 cursor-pointer flex items-center gap-2"
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
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-neutral-50 dark:bg-[#090A0F] text-zinc-950 dark:text-[#F4F4F6] select-text">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-200">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-[#222634]">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-zinc-950 dark:bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                <Zap className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-[#F4F4F6] tracking-tight">
                Question Rush
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-[#8E95A5]">
              High-intensity SAT pacing trainer. Race against per-question target countdowns and build test-day stamina.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] text-xs font-medium shadow-2xs">
              <span className="text-amber-500">⚡</span>
              <span>Target Pacing</span>
            </div>
            {onOpenQuestionBank && (
              <button
                onClick={onOpenQuestionBank}
                className="px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-[#222634] hover:bg-zinc-100 dark:hover:bg-[#181B24] text-xs font-semibold text-zinc-700 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-white transition-all duration-150 active:scale-95 cursor-pointer shadow-2xs"
              >
                Question Bank
              </button>
            )}
          </div>
        </div>

        {/* 1. Feature Callout Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] flex items-center gap-3 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              ⚡
            </div>
            <div>
              <h4 className="font-semibold text-xs text-zinc-950 dark:text-[#F4F4F6]">Dynamic Pacing</h4>
              <p className="text-[11px] text-zinc-500 dark:text-[#8E95A5]">Calibrated to real SAT timing</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] flex items-center gap-3 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              🔥
            </div>
            <div>
              <h4 className="font-semibold text-xs text-zinc-950 dark:text-[#F4F4F6]">Streak Multipliers</h4>
              <p className="text-[11px] text-zinc-500 dark:text-[#8E95A5]">Chain correct answers for stars</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] flex items-center gap-3 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              ⭐
            </div>
            <div>
              <h4 className="font-semibold text-xs text-zinc-950 dark:text-[#F4F4F6]">Star Ratings</h4>
              <p className="text-[11px] text-zinc-500 dark:text-[#8E95A5]">Earn up to 3 stars per speed</p>
            </div>
          </div>
        </div>

        {/* 2. Two Interactive Workspace Cards: Reading & Writing and Math */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Hero Card 1: Reading & Writing */}
          <div className="rounded-2xl bg-white dark:bg-[#11131A] text-zinc-950 dark:text-[#F4F4F6] border border-zinc-200 dark:border-[#222634] p-5 sm:p-6 flex flex-col justify-between space-y-5 shadow-xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 shadow-2xs">
                  Section 1 • Verbal
                </span>
                <span className="text-xs font-mono text-zinc-500 dark:text-[#8E95A5] tabular-nums">
                  {englishQuestions.length} questions
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
                      className={`p-2 rounded-xl border text-center transition-all duration-150 active:scale-95 cursor-pointer ${
                        selectedMode === mode.id
                          ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-600 shadow-2xs'
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
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all duration-150 active:scale-95 cursor-pointer tabular-nums ${
                        sessionSize === sz
                          ? 'bg-zinc-950 dark:bg-blue-600 text-white shadow-2xs'
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
              type="button"
              onClick={() => handleStartRush('Reading and Writing')}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-xs transition-all duration-150 active:scale-95 shadow-xs hover:shadow flex items-center justify-between cursor-pointer"
            >
              <span>Start Timed Rush</span>
              <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>

          {/* Hero Card 2: Math Rush */}
          <div className="relative rounded-2xl bg-white dark:bg-[#11131A] text-zinc-950 dark:text-[#F4F4F6] border border-zinc-200 dark:border-[#222634] p-5 sm:p-6 flex flex-col justify-between space-y-5 shadow-xs overflow-hidden">
            <div className="absolute right-[-15px] bottom-[-15px] pointer-events-none opacity-5 dark:opacity-10 transform -rotate-12">
              <Calculator className="w-36 h-36" strokeWidth={1} />
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800 shadow-2xs">
                  Section 2 • Quantitative
                </span>
                <span className="text-xs font-mono text-zinc-500 dark:text-[#8E95A5] tabular-nums">
                  {mathQuestions.length} questions
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                    <Calculator className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-950 dark:text-[#F4F4F6] tracking-tight">
                    Math Rush
                  </h3>
                </div>
                <p className="text-xs text-zinc-600 dark:text-[#8E95A5] mt-1 leading-relaxed">
                  Fast-paced drills across Algebra, Advanced Math, Problem-Solving &amp; Data Analysis, and Geometry &amp; Trigonometry.
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
                      className={`p-2 rounded-xl border text-center transition-all duration-150 active:scale-95 cursor-pointer ${
                        selectedMode === mode.id
                          ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-600 shadow-2xs'
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
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all duration-150 active:scale-95 cursor-pointer tabular-nums ${
                        sessionSize === sz
                          ? 'bg-zinc-950 dark:bg-blue-600 text-white shadow-2xs'
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
              type="button"
              onClick={() => handleStartRush('Math')}
              className="relative z-10 w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-xs transition-all duration-150 active:scale-95 shadow-xs hover:shadow flex items-center justify-between cursor-pointer"
            >
              <span>Start Math Rush</span>
              <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* 3. 3-Column "How It Works" Section */}
        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-zinc-950 dark:text-[#F4F4F6] tracking-tight">
              How It Works
            </h3>
            <p className="text-xs text-zinc-500 dark:text-[#8E95A5]">
              Master speed strategy without sacrificing accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] text-zinc-950 dark:text-[#F4F4F6] shadow-xs space-y-3 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-sm text-zinc-950 dark:text-[#F4F4F6]">
                Pick Your Focus
              </h4>
              <p className="text-xs text-zinc-600 dark:text-[#8E95A5] leading-relaxed">
                Choose Reading &amp; Writing or Math and set your speed intensity: Blitz (0.8x), Normal (1.0x), or Relaxed (1.25x) to challenge your limits.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] text-zinc-950 dark:text-[#F4F4F6] shadow-xs space-y-3 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-sky-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-sm text-zinc-950 dark:text-[#F4F4F6]">
                Race the Clock
              </h4>
              <p className="text-xs text-zinc-600 dark:text-[#8E95A5] leading-relaxed">
                Each question features a live countdown clock based on its Skill &amp; Difficulty (25s-120s for R&amp;W, 75s-120s for Math + 10s for graphs).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] text-zinc-950 dark:text-[#F4F4F6] shadow-xs space-y-3 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-0.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Flame className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-sm text-zinc-950 dark:text-[#F4F4F6]">
                Build Your Streak
              </h4>
              <p className="text-xs text-zinc-600 dark:text-[#8E95A5] leading-relaxed">
                Chain correct answers together to earn up to 3 stars per question and unlock your maximum Digital SAT speed rating.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuestionRush;
