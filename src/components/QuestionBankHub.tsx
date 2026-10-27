import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Calculator, 
  Layers, 
  Award, 
  Bookmark, 
  Flame, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  SlidersHorizontal, 
  ChevronRight, 
  Compass, 
  PenTool, 
  ArrowRight,
  ArrowLeft,
  Play
} from 'lucide-react';
import { MockQuestion } from '../types/quiz';
import { allEnglishQuestions, allMathQuestions } from '../data/mockQuestions';
import { 
  getAttempts, 
  getStudyStreak, 
  getSavedQuestionIds, 
  get10DayActivityTrend, 
  getQuestionAnalytics,
  getLatestAttemptsMap 
} from '../utils/storage';

interface QuestionBankHubProps {
  questions?: MockQuestion[];
  onStartPracticeSection: (section: 'Reading and Writing' | 'Math') => void;
  onOpenFilterModal: (section?: 'Reading and Writing' | 'Math') => void;
  onNavigateRoute: (route: 'analytics' | 'saved' | 'rush' | 'vocab' | 'home' | 'question-filter') => void;
  onStartSkillPractice?: (skillName: string, domainName: string) => void;
  initialSection?: 'Reading and Writing' | 'Math' | null;
}

interface DomainConfig {
  name: string;
  weight: string;
  skills: string[];
}

const MATH_SECTION_DOMAINS: DomainConfig[] = [
  {
    name: 'Advanced Math',
    weight: '35% of Math',
    skills: [
      'Equivalent expressions',
      'Nonlinear equations in one variable and systems of equations in two variables',
      'Nonlinear functions',
    ],
  },
  {
    name: 'Algebra',
    weight: '33% of Math',
    skills: [
      'Linear equations in one variable',
      'Linear equations in two variables',
      'Linear functions',
      'Systems of two linear equations in two variables',
      'Linear inequalities in one or two variables',
    ],
  },
  {
    name: 'Problem-Solving and Data Analysis',
    weight: '15% of Math',
    skills: [
      'Ratios, rates, proportional relationships, and units',
      'Percentages',
      'One-variable data: Distributions and measures of center and spread',
      'Two-variable data: Models and scatterplots',
      'Probability and conditional probability',
      'Inference from sample statistics and margin of error',
      'Evaluating statistical claims: Observational studies and experiments',
    ],
  },
  {
    name: 'Geometry and Trigonometry',
    weight: '15% of Math',
    skills: [
      'Area and volume',
      'Lines, angles, and triangles',
      'Right triangles and trigonometry',
      'Circles',
    ],
  },
];

const RW_SECTION_DOMAINS: DomainConfig[] = [
  {
    name: 'Craft and Structure',
    weight: '28% of R&W',
    skills: [
      'Words in Context',
      'Text Structure and Purpose',
      'Cross-Text Connections',
    ],
  },
  {
    name: 'Information and Ideas',
    weight: '26% of R&W',
    skills: [
      'Command of Evidence',
      'Central Ideas and Details',
      'Inferences',
    ],
  },
  {
    name: 'Standard English Conventions',
    weight: '26% of R&W',
    skills: [
      'Boundaries',
      'Form, Structure, and Sense',
    ],
  },
  {
    name: 'Expression of Ideas',
    weight: '20% of R&W',
    skills: [
      'Rhetorical Synthesis',
      'Transitions',
    ],
  },
];

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m < 60) {
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }
  const h = Math.floor(m / 60);
  const remM = m % 60;
  return remM > 0 ? `${h}h ${remM}m` : `${h}h`;
}

/**
 * Dual-tone circular SVG donut gauge for skill accuracy
 */
const DualToneDonutGauge: React.FC<{
  correct: number;
  wrong: number;
  attempted: number;
  accuracy: number;
}> = ({ correct, attempted, accuracy }) => {
  const r = 21;
  const c = 2 * Math.PI * r; // ~131.95
  const correctLen = attempted > 0 ? (correct / attempted) * c : 0;
  const wrongLen = attempted > 0 ? ((attempted - correct) / attempted) * c : 0;

  return (
    <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
        {/* Background track */}
        <circle
          cx="28"
          cy="28"
          r={r}
          className="stroke-slate-200 dark:stroke-[#232b3e]"
          strokeWidth="4.5"
          fill="none"
        />
        {attempted > 0 && correctLen > 0 && (
          <circle
            cx="28"
            cy="28"
            r={r}
            stroke="#22c55e"
            strokeWidth="4.5"
            fill="none"
            strokeDasharray={`${correctLen} ${c}`}
            strokeDashoffset="0"
            strokeLinecap="butt"
          />
        )}
        {attempted > 0 && wrongLen > 0 && (
          <circle
            cx="28"
            cy="28"
            r={r}
            stroke="#ef4444"
            strokeWidth="4.5"
            fill="none"
            strokeDasharray={`${wrongLen} ${c}`}
            strokeDashoffset={-correctLen}
            strokeLinecap="butt"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-[11px] font-bold font-mono text-slate-800 dark:text-slate-100">
          {attempted > 0 ? `${accuracy}%` : '0%'}
        </span>
      </div>
    </div>
  );
};

export const QuestionBankHub: React.FC<QuestionBankHubProps> = ({
  questions: _questions,
  onStartPracticeSection,
  onOpenFilterModal,
  onNavigateRoute,
  onStartSkillPractice,
  initialSection = null,
}) => {
  const [selectedSection, setSelectedSection] = useState<'Reading and Writing' | 'Math' | null>(initialSection);

  const attempts = useMemo(() => getAttempts(), []);
  const latestAttemptsMap = useMemo(() => getLatestAttemptsMap(), []);
  const streak = useMemo(() => getStudyStreak(), []);
  const savedCount = useMemo(() => getSavedQuestionIds().length, []);
  const analytics = useMemo(() => getQuestionAnalytics(), []);
  const activityTrend = useMemo(() => get10DayActivityTrend(), []);

  // Section Calculations
  const totalRW = allEnglishQuestions.length; // 753
  const totalMath = allMathQuestions.length; // 993
  const totalAll = totalRW + totalMath; // 1,746

  const mathDomains = ['Algebra', 'Advanced Math', 'Problem-Solving and Data Analysis', 'Geometry and Trigonometry'];
  const rwAttempts = useMemo(() => attempts.filter(a => !mathDomains.includes(a.domain)), [attempts]);
  const mathAttempts = useMemo(() => attempts.filter(a => mathDomains.includes(a.domain)), [attempts]);

  const rwSolved = rwAttempts.length;
  const rwPercent = totalRW > 0 ? Math.min(100, Math.round((rwSolved / totalRW) * 100)) : 0;

  const mathSolved = mathAttempts.length;
  const mathPercent = totalMath > 0 ? Math.min(100, Math.round((mathSolved / totalMath) * 100)) : 0;

  // 10-day activity trend calculations
  const totalPast10Days = useMemo(() => {
    return activityTrend.reduce((acc, d) => acc + d.total, 0);
  }, [activityTrend]);

  const totalPast10Correct = useMemo(() => {
    return activityTrend.reduce((acc, d) => acc + d.correct, 0);
  }, [activityTrend]);

  const totalPast10Wrong = useMemo(() => {
    return activityTrend.reduce((acc, d) => acc + d.wrong, 0);
  }, [activityTrend]);

  const avgPerDay = useMemo(() => {
    return (totalPast10Days / 10).toFixed(1);
  }, [totalPast10Days]);

  const maxTrendDay = useMemo(() => {
    return Math.max(...activityTrend.map(d => d.total), 1);
  }, [activityTrend]);

  // If a section is selected, render the CookSAT Section Breakdown View
  if (selectedSection) {
    const isMath = selectedSection === 'Math';
    const sectionDomains = isMath ? MATH_SECTION_DOMAINS : RW_SECTION_DOMAINS;
    const allSectionQuestions = isMath ? allMathQuestions : allEnglishQuestions;

    return (
      <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-neutral-50 dark:bg-[#090A0F] text-zinc-950 dark:text-[#F4F4F6] p-4 sm:p-6 md:p-8 select-text">
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
          
          {/* Top Bar: Back button, subject title, Open Question Filter, Practice All */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedSection(null)}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white dark:bg-[#121722] border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-[#1a2233] text-slate-700 dark:text-[#8E95A5] hover:text-slate-950 dark:hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-2xs active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.25]" />
                <span className="hidden sm:inline">Back to Question Bank</span>
                <span className="sm:hidden">Back</span>
              </button>

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-[#F4F4F6] tracking-tight">
                  {isMath ? 'Math' : 'Reading & Writing'}
                </h1>
                <p className="text-xs text-slate-500 dark:text-[#8E95A5]">
                  CookSAT Domain &amp; Skill Breakdown • {allSectionQuestions.length} Questions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => onOpenFilterModal(selectedSection)}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#121722] border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-[#1a2233] text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Open Question Filter</span>
              </button>

              <button
                type="button"
                onClick={() => onStartPracticeSection(selectedSection)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Practice All</span>
              </button>
            </div>
          </div>

          {/* Domain Container Cards */}
          <div className="space-y-6">
            {sectionDomains.map((domain) => {
              const domainQuestions = allSectionQuestions.filter(q => q.domain === domain.name);
              const domainTotal = domainQuestions.length;
              const domainAttempted = domainQuestions.filter(q => latestAttemptsMap[q.id]);
              const domainSolved = domainAttempted.length;
              const domainCorrect = domainAttempted.filter(q => latestAttemptsMap[q.id]?.isCorrect).length;
              const domainAccuracy = domainSolved > 0 ? Math.round((domainCorrect / domainSolved) * 100) : null;

              return (
                <div
                  key={domain.name}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0b0f17] p-5 sm:p-6 space-y-5 shadow-xs"
                >
                  {/* Domain Header */}
                  <div className="flex items-center justify-between gap-3 pb-1 border-b border-slate-100 dark:border-slate-800/60">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Square Mastery Score Badge */}
                      {domainAccuracy !== null ? (
                        <div className="w-10 h-10 rounded-xl font-bold bg-lime-500 text-slate-950 flex items-center justify-center text-sm shadow-xs font-mono shrink-0">
                          {domainAccuracy}
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl font-bold bg-slate-100 dark:bg-[#161c28] text-slate-400 flex items-center justify-center text-base shrink-0">
                          —
                        </div>
                      )}

                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-[#F4F4F6] truncate">
                          {domain.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-[#8E95A5]">
                          {domain.weight}
                        </p>
                      </div>
                    </div>

                    {/* Solved / Total Pill Badge */}
                    <div className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-[#181f2e] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 tabular-nums shrink-0">
                      {domainSolved}/{domainTotal}
                    </div>
                  </div>

                  {/* 3-Column Grid of Split-Layout Skill Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {domain.skills.map((skill) => {
                      const skillQuestions = domainQuestions.filter(q => q.skill === skill);
                      const totalQs = skillQuestions.length;
                      const attemptedInSkill = skillQuestions.filter(q => latestAttemptsMap[q.id]);
                      const attempted = attemptedInSkill.length;
                      const correct = attemptedInSkill.filter(q => latestAttemptsMap[q.id]?.isCorrect).length;
                      const wrong = attempted - correct;
                      const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
                      const unseenCount = Math.max(0, totalQs - attempted);

                      const timeSpentSeconds = attempts
                        .filter(a => a.skill === skill)
                        .reduce((acc, a) => acc + (a.timeSpentSeconds || 0), 0);

                      const percentOfDomain = domainTotal > 0 ? Math.round((totalQs / domainTotal) * 100) : 0;

                      return (
                        <div
                          key={skill}
                          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#121722] flex overflow-hidden shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                        >
                          {/* (a) Left Side */}
                          <div className="flex-1 p-4 flex flex-col justify-between relative overflow-hidden space-y-3">
                            {/* Subtle angled watermark SVG */}
                            <div className="absolute -right-3 -bottom-3 pointer-events-none opacity-5 dark:opacity-10 rotate-12">
                              {isMath ? (
                                <Calculator className="w-24 h-24 text-slate-900 dark:text-white" strokeWidth={1.5} />
                              ) : (
                                <BookOpen className="w-24 h-24 text-slate-900 dark:text-white" strokeWidth={1.5} />
                              )}
                            </div>

                            <div className="relative z-10 space-y-2">
                              <div className="flex items-start gap-2.5">
                                {/* Small Square Skill Score Badge */}
                                {attempted > 0 ? (
                                  <div className="w-7 h-7 rounded-lg font-bold bg-lime-500 text-slate-950 flex items-center justify-center text-xs shadow-2xs font-mono shrink-0">
                                    {accuracy}
                                  </div>
                                ) : (
                                  <div className="w-7 h-7 rounded-lg font-bold bg-slate-200 dark:bg-[#1a2233] text-slate-400 dark:text-slate-500 flex items-center justify-center text-xs shrink-0">
                                    —
                                  </div>
                                )}

                                <div className="min-w-0 flex-1">
                                  <h4 
                                    className="font-bold text-xs sm:text-sm text-slate-900 dark:text-[#F4F4F6] leading-snug line-clamp-2"
                                    title={skill}
                                  >
                                    {skill}
                                  </h4>
                                  <span className="text-[11px] text-slate-500 dark:text-[#8E95A5] block mt-0.5">
                                    {percentOfDomain}% of {domain.name}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Bottom row: total Qs + new pill badge, total time spent */}
                            <div className="relative z-10 flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                              <div className="flex items-center gap-1.5 font-mono text-slate-600 dark:text-slate-300">
                                <span>{totalQs} Qs</span>
                                {unseenCount > 0 && (
                                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80">
                                    {unseenCount} new
                                  </span>
                                )}
                              </div>

                              <span 
                                className="text-[11px] font-mono text-slate-500 dark:text-slate-400"
                                title="Total time spent on this skill"
                              >
                                ⏱ {formatDuration(timeSpentSeconds)}
                              </span>
                            </div>
                          </div>

                          {/* (b) Right Side */}
                          <div className="w-[140px] shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#181f2e] p-3 flex flex-col items-center justify-between space-y-2">
                            {/* Circular Dual-Tone Donut Gauge */}
                            <DualToneDonutGauge
                              correct={correct}
                              wrong={wrong}
                              attempted={attempted}
                              accuracy={accuracy}
                            />

                            {/* Correct and Wrong Counts */}
                            <div className="flex items-center gap-2 text-[11px] font-mono tabular-nums">
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                                ✔ {correct}
                              </span>
                              <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-0.5">
                                ✖ {wrong}
                              </span>
                            </div>

                            {/* Divider with Attempted / Total */}
                            <div className="w-full text-center border-t border-slate-200 dark:border-slate-800 pt-1 text-[10px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                              {attempted}/{totalQs}
                            </div>

                            {/* Full-width > PRACTICE button */}
                            <button
                              type="button"
                              onClick={() => {
                                if (onStartSkillPractice) {
                                  onStartSkillPractice(skill, domain.name);
                                } else {
                                  onStartPracticeSection(selectedSection);
                                }
                              }}
                              className="w-full py-1.5 rounded-lg bg-slate-200 hover:bg-blue-600 hover:text-white dark:bg-[#2b3548] dark:hover:bg-blue-600 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition cursor-pointer active:scale-95 text-slate-800 dark:text-slate-200 shadow-2xs"
                            >
                              <span>&gt; PRACTICE</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    );
  }

  // Otherwise, render the Overview Hub
  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-neutral-50 dark:bg-[#090A0F] text-zinc-950 dark:text-[#F4F4F6] p-4 sm:p-6 md:p-8 select-text">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
        
        {/* =================================================================== */}
        {/* (a) QUESTION BANK SECTION WITH 2 HORIZONTAL GRADIENT HERO CARDS     */}
        {/* =================================================================== */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-[#F4F4F6]">
                Question Bank
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-[#8E95A5] mt-1">
                Official Digital SAT practice questions mapped to College Board test specifications.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* 1. READING & WRITING HERO CARD (Blue-to-Indigo Gradient) */}
            <div className="relative rounded-2xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white p-6 sm:p-7 shadow-lg overflow-hidden flex flex-col justify-between space-y-6">
              
              {/* Subtle Background Watermark Illustration */}
              <div className="absolute right-[-15px] bottom-[-15px] pointer-events-none opacity-10">
                <BookOpen className="w-48 h-48" strokeWidth={1} />
              </div>

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-white/15 text-blue-100 border border-white/20 backdrop-blur-xs">
                    <PenTool className="w-3 h-3" />
                    Section 1 • Verbal
                  </span>
                  <span className="text-xs font-mono text-blue-200">
                    {totalRW} Questions
                  </span>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    Reading &amp; Writing
                  </h2>
                  <p className="text-xs text-blue-100/80 mt-1.5 leading-relaxed max-w-md">
                    Craft &amp; Structure, Information &amp; Ideas, Expression of Ideas, Standard English Conventions.
                  </p>
                </div>

                {/* Progress Stats */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-mono tabular-nums text-blue-100">
                    <span>{rwSolved} of {totalRW} solved</span>
                    <span className="font-bold text-white">{rwPercent}%</span>
                  </div>

                  {/* Progress Bar with White Circular Indicator Dot */}
                  <div className="relative w-full h-2.5 bg-black/25 rounded-full overflow-visible">
                    <div 
                      className="relative h-full bg-gradient-to-r from-blue-300 to-white rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.max(4, rwPercent)}%` }}
                    >
                      <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md border-2 border-blue-800" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Open > & Filter Topics */}
              <div className="relative z-10 flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSection('Reading and Writing')}
                  className="px-5 py-2.5 rounded-full bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <span>Open</span>
                  <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenFilterModal('Reading and Writing')}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs flex items-center gap-1.5 backdrop-blur-xs transition-all active:scale-95 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filter Topics</span>
                </button>
              </div>

            </div>

            {/* 2. MATH HERO CARD (Sky-to-Blue Gradient) */}
            <div className="relative rounded-2xl bg-gradient-to-br from-sky-600 via-blue-700 to-blue-900 text-white p-6 sm:p-7 shadow-lg overflow-hidden flex flex-col justify-between space-y-6">
              
              {/* Subtle Background Watermark Illustration */}
              <div className="absolute right-[-15px] bottom-[-15px] pointer-events-none opacity-10">
                <Compass className="w-48 h-48" strokeWidth={1} />
              </div>

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-white/15 text-sky-100 border border-white/20 backdrop-blur-xs">
                    <Calculator className="w-3 h-3" />
                    Section 2 • Quantitative
                  </span>
                  <span className="text-xs font-mono text-sky-200">
                    {totalMath} Questions
                  </span>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    Math
                  </h2>
                  <p className="text-xs text-sky-100/80 mt-1.5 leading-relaxed max-w-md">
                    Algebra, Advanced Math, Problem-Solving &amp; Data Analysis, Geometry &amp; Trigonometry.
                  </p>
                </div>

                {/* Progress Stats */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-mono tabular-nums text-sky-100">
                    <span>{mathSolved} of {totalMath} solved</span>
                    <span className="font-bold text-white">{mathPercent}%</span>
                  </div>

                  {/* Progress Bar with White Circular Indicator Dot */}
                  <div className="relative w-full h-2.5 bg-black/25 rounded-full overflow-visible">
                    <div 
                      className="relative h-full bg-gradient-to-r from-sky-200 to-white rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.max(4, mathPercent)}%` }}
                    >
                      <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md border-2 border-sky-800" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Open > & Filter Topics */}
              <div className="relative z-10 flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSection('Math')}
                  className="px-5 py-2.5 rounded-full bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <span>Open</span>
                  <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenFilterModal('Math')}
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs flex items-center gap-1.5 backdrop-blur-xs transition-all active:scale-95 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filter Topics</span>
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* =================================================================== */}
        {/* (b) 4 STAT CARDS ROW                                                */}
        {/* =================================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-[#8E95A5]">
              Overview &amp; Diagnostics
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Stat 1: Questions Solved */}
            <div className="relative p-5 rounded-xl border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] shadow-xs overflow-hidden flex flex-col justify-between">
              <div className="absolute right-2 bottom-2 pointer-events-none opacity-5 dark:opacity-10 text-zinc-900 dark:text-white">
                <Layers className="w-16 h-16" />
              </div>
              <span className="text-xs font-mono uppercase text-zinc-400 dark:text-[#8E95A5] font-semibold">
                Questions Solved
              </span>
              <div className="mt-2">
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-zinc-950 dark:text-[#F4F4F6]">
                  {analytics.attempted} <span className="text-xs font-mono text-zinc-400">/ {totalAll}</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-500 dark:text-[#8E95A5] mt-1 block">
                  {totalAll > 0 ? Math.round((analytics.attempted / totalAll) * 100) : 0}% of Question Bank
                </span>
              </div>
            </div>

            {/* Stat 2: Accuracy */}
            <div className="relative p-5 rounded-xl border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] shadow-xs overflow-hidden flex flex-col justify-between">
              <div className="absolute right-2 bottom-2 pointer-events-none opacity-5 dark:opacity-10 text-zinc-900 dark:text-white">
                <Award className="w-16 h-16" />
              </div>
              <span className="text-xs font-mono uppercase text-zinc-400 dark:text-[#8E95A5] font-semibold">
                Overall Accuracy
              </span>
              <div className="mt-2">
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-emerald-600 dark:text-emerald-400">
                  {analytics.accuracy}%
                </div>
                <span className="text-[11px] font-mono text-zinc-500 dark:text-[#8E95A5] mt-1 block">
                  {analytics.correct} correct • {analytics.wrong} incorrect
                </span>
              </div>
            </div>

            {/* Stat 3: Saved Questions */}
            <div className="relative p-5 rounded-xl border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] shadow-xs overflow-hidden flex flex-col justify-between">
              <div className="absolute right-2 bottom-2 pointer-events-none opacity-5 dark:opacity-10 text-zinc-900 dark:text-white">
                <Bookmark className="w-16 h-16" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-zinc-400 dark:text-[#8E95A5] font-semibold">
                  Saved
                </span>
                <button
                  type="button"
                  onClick={() => onNavigateRoute('saved')}
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  View
                </button>
              </div>
              <div className="mt-2">
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-zinc-950 dark:text-[#F4F4F6]">
                  {savedCount}
                </div>
                <span className="text-[11px] font-mono text-zinc-500 dark:text-[#8E95A5] mt-1 block">
                  Bookmarked for review
                </span>
              </div>
            </div>

            {/* Stat 4: Study Streak */}
            <div className="relative p-5 rounded-xl border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] shadow-xs overflow-hidden flex flex-col justify-between">
              <div className="absolute right-2 bottom-2 pointer-events-none opacity-5 dark:opacity-10 text-zinc-900 dark:text-white">
                <Flame className="w-16 h-16" />
              </div>
              <span className="text-xs font-mono uppercase text-zinc-400 dark:text-[#8E95A5] font-semibold">
                Study Streak
              </span>
              <div className="mt-2">
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-amber-600 dark:text-amber-400">
                  {streak} <span className="text-xs font-semibold text-zinc-500 dark:text-[#8E95A5]">Days</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-500 dark:text-[#8E95A5] mt-1 block">
                  Consecutive practice
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* =================================================================== */}
        {/* (c) ACTIVITY TREND STACKED DIFFICULTY BAR CHART CARD                */}
        {/* =================================================================== */}
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="font-bold text-base text-zinc-950 dark:text-[#F4F4F6]">
                  Activity Trend
                </h3>
                <p className="text-xs text-zinc-500 dark:text-[#8E95A5]">
                  Daily performance breakdown for the past 10 days
                </p>
              </div>
            </div>

            {/* Correct & Wrong Counters + Legend */}
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{totalPast10Correct} Correct</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                <XCircle className="w-3.5 h-3.5" />
                <span>{totalPast10Wrong} Wrong</span>
              </div>
            </div>
          </div>

          {/* Chart View with Average Dashed Line */}
          <div className="relative pt-6 pb-2 border-b border-zinc-100 dark:border-[#181B24]">
            
            {/* Dashed Average Line Indicator */}
            {parseFloat(avgPerDay) > 0 && (
              <div 
                className="absolute inset-x-0 border-b border-dashed border-blue-400 dark:border-blue-600 z-10 pointer-events-none"
                style={{ bottom: `${Math.min(85, Math.max(15, (parseFloat(avgPerDay) / maxTrendDay) * 100))}%` }}
              >
                <span className="absolute right-0 -top-4 text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold bg-white dark:bg-[#11131A] px-1 rounded">
                  Average {avgPerDay} / day
                </span>
              </div>
            )}

            {/* Bars */}
            <div className="h-44 w-full flex items-end justify-between gap-1.5 sm:gap-3 px-1 sm:px-2">
              {activityTrend.map((day, idx) => {
                const heightPercent = day.total > 0 ? Math.max(16, (day.total / maxTrendDay) * 100) : 6;
                const correctPercent = day.total > 0 ? (day.correct / day.total) * 100 : 0;
                const wrongPercent = 100 - correctPercent;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group min-w-0">
                    {/* Hover tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 dark:bg-zinc-800 text-white text-[10px] py-0.5 px-1.5 rounded-sm pointer-events-none whitespace-nowrap shadow-xs font-mono">
                      {day.total} Qs ({day.correct} ✓)
                    </div>

                    {/* Stacked Colored Bar */}
                    <div 
                      className="w-full max-w-[28px] rounded-t-md overflow-hidden flex flex-col justify-end transition-all duration-300"
                      style={{ height: `${heightPercent}%` }}
                    >
                      {day.total > 0 ? (
                        <>
                          <div 
                            style={{ height: `${wrongPercent}%` }} 
                            className="w-full bg-rose-500 transition-all"
                            title={`${day.wrong} incorrect`}
                          />
                          <div 
                            style={{ height: `${correctPercent}%` }} 
                            className="w-full bg-emerald-500 transition-all"
                            title={`${day.correct} correct`}
                          />
                        </>
                      ) : (
                        <div className="w-full h-full bg-zinc-200 dark:bg-[#181B24] rounded-t-md" />
                      )}
                    </div>

                    {/* Day label */}
                    <span className="text-[10px] font-bold text-zinc-500 dark:text-[#8E95A5] group-hover:text-zinc-900 dark:group-hover:text-white transition-colors truncate max-w-full text-center">
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-[#8E95A5] pt-1">
            <span>Showing past 10 active days</span>
            <button
              type="button"
              onClick={() => onNavigateRoute('analytics')}
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Full Analytics Dashboard</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuestionBankHub;