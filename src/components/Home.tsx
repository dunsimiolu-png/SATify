import React, { useState, useEffect, useMemo } from 'react';
import { 
  Flame, 
  Clock, 
  Compass, 
  Zap, 
  Filter, 
  Play, 
  CheckCircle2, 
  TrendingUp, 
  BookOpen, 
  Calculator, 
  Sparkles, 
  ChevronRight, 
  Edit2 
} from 'lucide-react';
import { MockQuestion } from '../types/quiz';
import { 
  getAttempts, 
  getStudyStreak, 
  get10DayActivityTrend, 
  getSkillStatsMap 
} from '../utils/storage';

interface HomeProps {
  questions: MockQuestion[];
  onStartSkillPractice?: (skillName: string, domainName: string) => void;
  onOpenQuestionBank: () => void;
  onResumePractice?: () => void;
  onStartDailyQuestion?: (subject: 'Math' | 'Reading and Writing') => void;
}

export const Home: React.FC<HomeProps> = ({
  questions,
  onStartSkillPractice: _onStartSkillPractice,
  onOpenQuestionBank,
  onResumePractice,
  onStartDailyQuestion,
}) => {
  // ---------------------------------------------------------------------------
  // 1. Live Countdown until Next Midnight ("Reveals in Xh Ym Zs")
  // ---------------------------------------------------------------------------
  const [countdown, setCountdown] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      const diffSeconds = Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
      const hours = Math.floor(diffSeconds / 3600);
      const minutes = Math.floor((diffSeconds % 3600) / 60);
      const seconds = diffSeconds % 60;
      setCountdown(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Day of the year for Daily Badge #268
  const { dayOfYear, formattedDate } = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return { dayOfYear: day, formattedDate: dateStr };
  }, []);

  // ---------------------------------------------------------------------------
  // 2. Next SAT Date (localStorage)
  // ---------------------------------------------------------------------------
  const [satDate, setSatDate] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('satify_target_sat_date') || '';
  });
  const [isEditingSatDate, setIsEditingSatDate] = useState<boolean>(false);
  const [tempDateInput, setTempDateInput] = useState<string>(satDate);

  const satDaysRemaining = useMemo(() => {
    if (!satDate) return null;
    const target = new Date(satDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [satDate]);

  const handleSaveSatDate = (newDate: string) => {
    setSatDate(newDate);
    if (typeof window !== 'undefined') {
      localStorage.setItem('satify_target_sat_date', newDate);
    }
    setIsEditingSatDate(false);
  };

  // ---------------------------------------------------------------------------
  // 3. User Statistics, XP & Activity Trend
  // ---------------------------------------------------------------------------
  const attempts = useMemo(() => getAttempts(), []);
  const streak = useMemo(() => getStudyStreak(), []);
  const activityTrend = useMemo(() => get10DayActivityTrend(), []);
  const skillStatsMap = useMemo(() => getSkillStatsMap(), []);

  // Today's attempts and XP calculation
  const { todayAttemptsCount, todayCorrectCount, todayXp } = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayList = attempts.filter(a => {
      try {
        return new Date(a.timestamp).toISOString().slice(0, 10) === todayStr;
      } catch {
        return false;
      }
    });
    const correctCount = todayList.filter(a => a.isCorrect).length;
    // 15 XP per question + 10 XP bonus per correct answer
    const calculatedXp = Math.min(500, todayList.length * 15 + correctCount * 10);
    return {
      todayAttemptsCount: todayList.length,
      todayCorrectCount: correctCount,
      todayXp: calculatedXp,
    };
  }, [attempts]);

  // Last attempt for the "START PRACTICING" card description
  const lastAttempt = useMemo(() => {
    if (attempts.length === 0) return null;
    return attempts[attempts.length - 1];
  }, [attempts]);

  // Strongest and Weakest skills calculation
  const { strongestSkills, weakestSkills } = useMemo(() => {
    const defaultRWSkills = [
      { name: 'Words in Context', domain: 'Craft and Structure' },
      { name: 'Transitions', domain: 'Expression of Ideas' },
      { name: 'Command of Evidence', domain: 'Information and Ideas' },
      { name: 'Boundaries', domain: 'Standard English Conventions' },
      { name: 'Central Ideas and Details', domain: 'Information and Ideas' },
      { name: 'Inferences', domain: 'Information and Ideas' },
    ];

    const mapped = defaultRWSkills.map(sk => {
      const stat = skillStatsMap[sk.name];
      if (stat && stat.attempted > 0) {
        const acc = Math.round((stat.correct / stat.attempted) * 100);
        return { name: sk.name, domain: sk.domain, accuracy: acc, attempted: stat.attempted };
      }
      return { name: sk.name, domain: sk.domain, accuracy: 75, attempted: 0 };
    });

    // Sort descending for strongest, ascending for weakest
    const sorted = [...mapped].sort((a, b) => b.accuracy - a.accuracy);
    const strongest = sorted.slice(0, 3);
    const weakest = [...mapped].sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);

    return { strongestSkills: strongest, weakestSkills: weakest };
  }, [skillStatsMap]);

  // 7-day activity slice for Your Progress stacked chart
  const recentDays = useMemo(() => {
    return activityTrend.slice(-7);
  }, [activityTrend]);

  const maxRecentDay = useMemo(() => {
    return Math.max(...recentDays.map(d => d.total), 1);
  }, [recentDays]);

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-neutral-50 dark:bg-[#090A0F] text-zinc-950 dark:text-[#F4F4F6] select-text">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto p-4 sm:p-6 animate-in fade-in duration-200">
        
        {/* =================================================================== */}
        {/* LEFT COLUMN (lg:col-span-5 flex flex-col gap-6)                     */}
        {/* =================================================================== */}
        <div className="lg:col-span-5 flex flex-col gap-6">

          {/* (a) DAILY QUESTIONS CONTAINER CARD */}
          <div className="rounded-2xl border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] shadow-xs overflow-hidden flex flex-col">
            
            {/* Royal-Blue Header Bar */}
            <div className="bg-[#1e40af] dark:bg-[#1d4ed8] px-4 sm:px-5 py-3.5 text-white flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="font-bold text-sm tracking-tight">Daily Questions</span>
                <span className="bg-blue-900/60 text-blue-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-blue-400/30">
                  #{dayOfYear || 268}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-blue-100">
                <span>{formattedDate}</span>
                <span className="text-blue-300">•</span>
                <span className="text-amber-300 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Reveals in {countdown || '24h'}
                </span>
              </div>
            </div>

            {/* Inner Content: Two Sleek Interactive Adaptive Cards */}
            <div className="p-4 sm:p-5 flex flex-col gap-3.5">
              
              {/* Card 1: DAILY · Math */}
              <button
                type="button"
                onClick={() => onStartDailyQuestion ? onStartDailyQuestion('Math') : onOpenQuestionBank()}
                className="group relative w-full text-left p-4 rounded-xl border border-zinc-200 dark:border-[#222634] hover:border-blue-500 dark:hover:border-blue-500 bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-[#141722] dark:to-[#171c2b] overflow-hidden transition-all duration-150 active:scale-[0.99] shadow-2xs hover:shadow cursor-pointer"
              >
                {/* Angled Calculator Vector Watermark */}
                <div className="absolute right-[-10px] bottom-[-10px] pointer-events-none opacity-10 dark:opacity-15 transform -rotate-12 group-hover:scale-105 transition-transform duration-200">
                  <svg width="110" height="110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="4" y="2" width="16" height="20" rx="3" />
                    <line x1="8" y1="6" x2="16" y2="6" />
                    <line x1="8" y1="10" x2="10" y2="10" />
                    <line x1="14" y1="10" x2="16" y2="10" />
                    <line x1="8" y1="14" x2="10" y2="14" />
                    <line x1="14" y1="14" x2="16" y2="14" />
                    <line x1="8" y1="18" x2="10" y2="18" />
                    <line x1="14" y1="18" x2="16" y2="18" />
                  </svg>
                </div>

                <div className="relative z-10 flex flex-col justify-between h-full space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      <Calculator className="w-3 h-3" />
                      DAILY · Math
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500 dark:text-[#8E95A5]">1 Question</span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-zinc-950 dark:text-[#F4F4F6] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Daily Quantitative Challenge
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-[#8E95A5] mt-0.5 line-clamp-1">
                      Calibrated problem solving &amp; algebra reasoning drill.
                    </p>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs font-semibold text-blue-700 dark:text-blue-400">
                    <span>Click for more</span>
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>

              {/* Card 2: DAILY · Reading & Writing */}
              <button
                type="button"
                onClick={() => onStartDailyQuestion ? onStartDailyQuestion('Reading and Writing') : onOpenQuestionBank()}
                className="group relative w-full text-left p-4 rounded-xl border border-zinc-200 dark:border-[#222634] hover:border-indigo-500 dark:hover:border-indigo-500 bg-gradient-to-br from-slate-50 to-indigo-50/40 dark:from-[#141722] dark:to-[#1a1728] overflow-hidden transition-all duration-150 active:scale-[0.99] shadow-2xs hover:shadow cursor-pointer"
              >
                {/* Angled Passage-Lines Vector Watermark */}
                <div className="absolute right-[-10px] bottom-[-10px] pointer-events-none opacity-10 dark:opacity-15 transform 12deg group-hover:scale-105 transition-transform duration-200">
                  <svg width="110" height="110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    <line x1="8" y1="7" x2="16" y2="7" />
                    <line x1="8" y1="11" x2="16" y2="11" />
                    <line x1="8" y1="15" x2="13" y2="15" />
                  </svg>
                </div>

                <div className="relative z-10 flex flex-col justify-between h-full space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      <BookOpen className="w-3 h-3" />
                      DAILY · Reading &amp; Writing
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500 dark:text-[#8E95A5]">1 Question</span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-zinc-950 dark:text-[#F4F4F6] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Daily Verbal Reasoning
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-[#8E95A5] mt-0.5 line-clamp-1">
                      Context clues, rhetorical synthesis, &amp; conventions pacing.
                    </p>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                    <span>Click for more</span>
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>

            </div>
          </div>

          {/* (b) START PRACTICING CARD (Bottom-Left) */}
          <div className="rounded-2xl border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] shadow-xs overflow-hidden flex flex-col">
            
            {/* Blue/Emerald Header Bar */}
            <div className="bg-gradient-to-r from-blue-700 to-emerald-600 dark:from-blue-600 dark:to-emerald-500 px-4 sm:px-5 py-3.5 text-white flex items-center justify-between">
              <span className="font-bold text-sm tracking-wider uppercase">START PRACTICING</span>
              <span className="text-xs font-mono bg-black/20 text-white/90 px-2 py-0.5 rounded-full font-medium">
                {questions.length} Items in Bank
              </span>
            </div>

            <div className="p-4 sm:p-5 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[11px] font-mono uppercase text-zinc-400 dark:text-[#8E95A5] tracking-wider font-semibold">
                  {lastAttempt ? 'Resume Previous Session' : 'Quick Start Practice'}
                </span>
                
                {lastAttempt ? (
                  <div className="mt-1">
                    <h4 className="font-semibold text-sm text-zinc-950 dark:text-[#F4F4F6]">
                      {lastAttempt.skill || 'Standard English Conventions'}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-[#8E95A5] mt-0.5 line-clamp-2">
                      Domain: {lastAttempt.domain || 'Reading & Writing'} • Difficulty: {lastAttempt.difficulty || 'Medium'}
                    </p>
                  </div>
                ) : (
                  <div className="mt-1">
                    <h4 className="font-semibold text-sm text-zinc-950 dark:text-[#F4F4F6]">
                      Full Digital SAT Question Pool
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-[#8E95A5] mt-0.5">
                      Launch calibrated practice with live Bluebook layout and timer pacing.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons: Filter Bank & BEGIN */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onOpenQuestionBank}
                  className="flex-1 py-2.5 px-3.5 rounded-xl border border-zinc-200 dark:border-[#222634] hover:bg-zinc-100 dark:hover:bg-[#181B24] text-zinc-700 dark:text-[#8E95A5] font-semibold text-xs transition-all duration-150 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Filter className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>Filter Bank</span>
                </button>

                <button
                  type="button"
                  onClick={onResumePractice || onOpenQuestionBank}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all duration-150 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>BEGIN</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* =================================================================== */}
        {/* RIGHT COLUMN (lg:col-span-7 flex flex-col gap-6)                    */}
        {/* =================================================================== */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* (a) 3-CARD TOP ROW (grid-cols-1 sm:grid-cols-3 gap-4) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Card 1: Day Streak */}
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] shadow-xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase font-semibold text-zinc-400 dark:text-[#8E95A5]">
                  Streak
                </span>
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-[#F4F4F6] tabular-nums">
                  {streak} <span className="text-xs font-medium text-zinc-500 dark:text-[#8E95A5]">days</span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-[#8E95A5] mt-0.5">
                  {streak > 0 ? 'Study streak on fire!' : 'Solve 1 Q to begin streak'}
                </p>
              </div>
            </div>

            {/* Card 2: Next SAT */}
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] shadow-xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase font-semibold text-zinc-400 dark:text-[#8E95A5]">
                  Next SAT
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingSatDate(!isEditingSatDate)}
                  className="text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                  title="Change target SAT date"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                {isEditingSatDate ? (
                  <div className="space-y-1.5">
                    <input
                      type="date"
                      value={tempDateInput}
                      onChange={e => setTempDateInput(e.target.value)}
                      className="w-full text-xs p-1 rounded border border-zinc-300 dark:border-[#222634] bg-neutral-50 dark:bg-[#181B24] text-zinc-900 dark:text-[#F4F4F6]"
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSaveSatDate(tempDateInput)}
                        className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-semibold cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingSatDate(false)}
                        className="text-[10px] text-zinc-500 dark:text-[#8E95A5] px-1 py-0.5 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : satDaysRemaining !== null ? (
                  <div>
                    <div className="text-2xl font-bold tracking-tight text-blue-700 dark:text-blue-400 tabular-nums">
                      {satDaysRemaining} <span className="text-xs font-medium text-zinc-500 dark:text-[#8E95A5]">days</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-[#8E95A5] mt-0.5 truncate">
                      {new Date(satDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} Test Date
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      No SAT set
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditingSatDate(true)}
                      className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline mt-0.5 block cursor-pointer"
                    >
                      + Pick test date
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Card 3: Today's Goals */}
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] shadow-xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase font-semibold text-zinc-400 dark:text-[#8E95A5]">
                  Today's Goals
                </span>
                <Compass className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-[#F4F4F6] tabular-nums">
                  {todayAttemptsCount} <span className="text-xs font-medium text-zinc-500 dark:text-[#8E95A5]">/ 15 Qs</span>
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-[#8E95A5] mt-0.5">
                  {todayCorrectCount} correct today
                </div>
                <div className="w-full bg-zinc-100 dark:bg-[#181B24] h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round((todayAttemptsCount / 15) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* (b) DAILY XP GOAL CARD */}
          <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-950 dark:text-[#F4F4F6]">
                    Daily XP Goal
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-[#8E95A5]">
                    +15 XP per question attempt • +10 XP correct bonus
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <span className="font-mono font-bold text-base text-zinc-950 dark:text-[#F4F4F6] tabular-nums">
                  {todayXp}
                </span>
                <span className="text-xs font-mono text-zinc-400"> / 500 XP</span>
              </div>
            </div>

            {/* Smooth Progress Bar */}
            <div className="w-full h-2.5 bg-zinc-100 dark:bg-[#181B24] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, (todayXp / 500) * 100)}%` }}
              />
            </div>
          </div>

          {/* (c) YOUR PROGRESS CARD */}
          <div className="rounded-2xl border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] shadow-xs overflow-hidden flex flex-col">
            
            {/* Royal-Blue Header Bar */}
            <div className="bg-[#1e40af] dark:bg-[#1d4ed8] px-4 sm:px-5 py-3.5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="font-bold text-sm tracking-tight">Your Progress</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Correct
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Incorrect
                </span>
              </div>
            </div>

            {/* Inner 2-Column: Left stacked chart & Right skills list */}
            <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-5">
              
              {/* Left: Stacked Green/Red Daily Performance Chart */}
              <div className="md:col-span-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-100 dark:border-[#181B24] pb-4 md:pb-0 md:pr-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase font-mono tracking-wider">
                    7-Day Accuracy
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {recentDays.reduce((acc, d) => acc + d.total, 0)} Total Solved
                  </span>
                </div>

                <div className="h-36 flex items-end justify-between gap-1.5 pt-4">
                  {recentDays.map((day, idx) => {
                    const heightPercent = day.total > 0 ? Math.max(16, (day.total / maxRecentDay) * 100) : 6;
                    const correctPercent = day.total > 0 ? (day.correct / day.total) * 100 : 0;
                    const wrongPercent = 100 - correctPercent;

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                        <div className="w-full max-w-[24px] rounded-t-md overflow-hidden flex flex-col justify-end transition-all duration-200" style={{ height: `${heightPercent}%` }}>
                          {day.total > 0 ? (
                            <>
                              <div style={{ height: `${wrongPercent}%` }} className="w-full bg-rose-500" title={`${day.wrong} incorrect`} />
                              <div style={{ height: `${correctPercent}%` }} className="w-full bg-emerald-500" title={`${day.correct} correct`} />
                            </>
                          ) : (
                            <div className="w-full h-full bg-zinc-200 dark:bg-[#181B24] rounded-t-md" />
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 dark:text-[#8E95A5] truncate">
                          {day.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Strongest Skills & Weakest Skills */}
              <div className="md:col-span-6 flex flex-col justify-between space-y-4">
                
                {/* Strongest Skills */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase font-mono tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Strongest Skills
                  </span>
                  <div className="space-y-1.5">
                    {strongestSkills.map(sk => (
                      <div key={sk.name} className="flex items-center justify-between text-xs">
                        <span className="truncate max-w-[170px] text-zinc-700 dark:text-[#C5CAD6]" title={sk.name}>
                          {sk.name}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="w-16 h-1.5 bg-zinc-100 dark:bg-[#181B24] rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${sk.accuracy}%` }} />
                          </div>
                          <span className="font-mono font-bold text-[11px] text-emerald-700 dark:text-emerald-400 tabular-nums">
                            {sk.accuracy}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weakest Skills */}
                <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-[#181B24]">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase font-mono tracking-wider flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5" />
                    Weakest Skills
                  </span>
                  <div className="space-y-1.5">
                    {weakestSkills.map(sk => (
                      <div key={sk.name} className="flex items-center justify-between text-xs">
                        <span className="truncate max-w-[170px] text-zinc-700 dark:text-[#C5CAD6]" title={sk.name}>
                          {sk.name}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="w-16 h-1.5 bg-zinc-100 dark:bg-[#181B24] rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${sk.accuracy}%` }} />
                          </div>
                          <span className="font-mono font-bold text-[11px] text-amber-700 dark:text-amber-400 tabular-nums">
                            {sk.accuracy}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Home;
