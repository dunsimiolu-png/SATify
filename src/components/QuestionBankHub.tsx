import React, { useMemo } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { MockQuestion } from '../types/quiz';
import { allEnglishQuestions, allMathQuestions } from '../data/mockQuestions';
import { 
  getAttempts, 
  getStudyStreak, 
  getSavedQuestionIds, 
  get10DayActivityTrend, 
  getQuestionAnalytics 
} from '../utils/storage';

interface QuestionBankHubProps {
  questions?: MockQuestion[];
  onStartPracticeSection: (section: 'Reading and Writing' | 'Math') => void;
  onOpenFilterModal: (section?: 'Reading and Writing' | 'Math') => void;
  onNavigateRoute: (route: 'analytics' | 'saved' | 'rush' | 'vocab' | 'home') => void;
}

export const QuestionBankHub: React.FC<QuestionBankHubProps> = ({
  onStartPracticeSection,
  onOpenFilterModal,
  onNavigateRoute,
}) => {
  const attempts = useMemo(() => getAttempts(), []);
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
                  onClick={() => onStartPracticeSection('Reading and Writing')}
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
                  onClick={() => onStartPracticeSection('Math')}
                  className="px-5 py-2.5 rounded-full bg-white text-blue-900 hover:bg-sky-50 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
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
        {/* (b) QUESTION ANALYTICS STRIP (4-Column Connected Strip)             */}
        {/* =================================================================== */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-950 dark:text-[#F4F4F6]">
                Question Analytics
              </h2>
              <p className="text-xs text-zinc-500 dark:text-[#8E95A5]">
                Consolidated performance metrics across all practice modules.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigateRoute('analytics')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <span>View all analytics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            
            {/* Stat 1: Questions Attempted */}
            <div className="relative p-5 rounded-xl border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] shadow-xs overflow-hidden flex flex-col justify-between">
              <div className="absolute right-2 bottom-2 pointer-events-none opacity-5 dark:opacity-10 text-zinc-900 dark:text-white">
                <Layers className="w-16 h-16" />
              </div>
              <span className="text-xs font-mono uppercase text-zinc-400 dark:text-[#8E95A5] font-semibold">
                Attempted
              </span>
              <div className="mt-2">
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-zinc-950 dark:text-[#F4F4F6]">
                  {analytics.attempted}
                </div>
                <span className="text-[11px] font-mono text-zinc-500 dark:text-[#8E95A5] mt-1 block">
                  {totalAll - analytics.attempted} remaining in bank
                </span>
              </div>
            </div>

            {/* Stat 2: Current Accuracy */}
            <div className="relative p-5 rounded-xl border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] shadow-xs overflow-hidden flex flex-col justify-between">
              <div className="absolute right-2 bottom-2 pointer-events-none opacity-5 dark:opacity-10 text-zinc-900 dark:text-white">
                <Award className="w-16 h-16" />
              </div>
              <span className="text-xs font-mono uppercase text-zinc-400 dark:text-[#8E95A5] font-semibold">
                Accuracy
              </span>
              <div className="mt-2">
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-zinc-950 dark:text-[#F4F4F6]">
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
