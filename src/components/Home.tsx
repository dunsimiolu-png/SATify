import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { MockQuestion } from '../types/quiz';
import { MathText } from './MathText';
import { 
  getAttempts, 
  getStudyStreak, 
  get10DayActivityTrend, 
  getSkillStatsMap,
  getLastSession,
  getLocalDateString
} from '../utils/storage';

gsap.registerPlugin(useGSAP);

interface HomeProps {
  questions: MockQuestion[];
  onStartSkillPractice?: (skillName: string, domainName: string) => void;
  onOpenQuestionBank: () => void;
  onOpenQuestionFilter?: () => void;
  onResumePractice?: () => void;
  onStartDailyQuestion?: (subject: 'Math' | 'Reading and Writing') => void;
}

/**
 * Truncates question preview string on clean word boundaries without slicing mid-word,
 * and ensures any LaTeX math delimiters ($...$) remain balanced.
 */
function cleanTruncateSnippet(raw: string, maxLen = 130): string {
  if (!raw) return '';
  const text = raw.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLen) return text;

  let truncated = text.slice(0, maxLen);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > 40) {
    truncated = truncated.slice(0, lastSpace);
  }

  // Balance any unclosed $ delimiter
  const dollars = (truncated.match(/(?<!\\)\$/g) || []).length;
  if (dollars % 2 !== 0) {
    const nextDollar = text.indexOf('$', truncated.length);
    if (nextDollar !== -1 && nextDollar - truncated.length < 30) {
      truncated = text.slice(0, nextDollar + 1);
    } else {
      const prevDollar = truncated.lastIndexOf('$');
      if (prevDollar > 30) {
        truncated = truncated.slice(0, prevDollar).trim();
      } else {
        truncated += '$';
      }
    }
  }

  return truncated.replace(/[.,;:!\s]+$/, '') + '...';
}

export const Home: React.FC<HomeProps> = ({
  questions,
  onStartSkillPractice: _onStartSkillPractice,
  onOpenQuestionBank,
  onOpenQuestionFilter,
  onResumePractice,
  onStartDailyQuestion,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------------------------
  // 1. Live Countdown until Next Midnight ("Resets in Xh Ym Zs")
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

  // Day of the year for Daily Badge
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
  // 2. Next SAT Date (Official Digital SAT Dates & Single Selector)
  // ---------------------------------------------------------------------------
  const OFFICIAL_SAT_DATES = useMemo(() => [
    { label: 'Dec 5, 2026', value: '2026-12-05' },
    { label: 'Mar 13, 2027', value: '2027-03-13' },
    { label: 'May 1, 2027', value: '2027-05-01' },
    { label: 'Jun 5, 2027', value: '2027-06-05' },
    { label: 'Aug 21, 2027', value: '2027-08-21' },
  ], []);

  const [satDate, setSatDate] = useState<string>(() => {
    const todayStr = getLocalDateString(new Date());
    if (typeof window === 'undefined') return '2026-12-05';
    const stored = localStorage.getItem('satify_target_sat_date') || '';
    if (stored) {
      if (stored < todayStr) {
        // Stored date is in the past! Auto-advance to the next upcoming official date
        const nextDate = OFFICIAL_SAT_DATES.find(d => d.value >= todayStr)?.value || '2026-12-05';
        localStorage.setItem('satify_target_sat_date', nextDate);
        return nextDate;
      }
      return stored;
    }
    const nextDate = OFFICIAL_SAT_DATES.find(d => d.value >= todayStr)?.value || '2026-12-05';
    localStorage.setItem('satify_target_sat_date', nextDate);
    return nextDate;
  });

  const [isEditingSatDate, setIsEditingSatDate] = useState<boolean>(false);
  const [tempDateInput, setTempDateInput] = useState<string>(satDate);
  const [isCustomDate, setIsCustomDate] = useState<boolean>(false);

  const satDaysRemaining = useMemo(() => {
    if (!satDate) return null;
    const parts = satDate.split('-');
    if (parts.length !== 3) return null;
    const target = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - now.getTime();
    const days = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return days >= 0 ? days : null;
  }, [satDate]);

  const formattedSatDate = useMemo(() => {
    if (!satDate) return '';
    const parts = satDate.split('-');
    if (parts.length !== 3) return '';
    const dt = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, [satDate]);

  const handleSaveSatDate = (newDate: string) => {
    setSatDate(newDate);
    if (typeof window !== 'undefined') {
      localStorage.setItem('satify_target_sat_date', newDate);
    }
    setIsEditingSatDate(false);
    setIsCustomDate(false);
  };

  // ---------------------------------------------------------------------------
  // 3. User Statistics, Attempts & XP (Local Date Keys & Live Storage Sync)
  // ---------------------------------------------------------------------------
  const [storageVersion, setStorageVersion] = useState<number>(0);

  useEffect(() => {
    const handleUpdate = () => setStorageVersion(v => v + 1);
    window.addEventListener('satify_storage_update', handleUpdate);
    return () => window.removeEventListener('satify_storage_update', handleUpdate);
  }, []);

  const attempts = useMemo(() => getAttempts(), [storageVersion]);
  const streak = useMemo(() => getStudyStreak(), [storageVersion]);
  const activityTrend = useMemo(() => get10DayActivityTrend(), [storageVersion]);
  const skillStatsMap = useMemo(() => getSkillStatsMap(), [storageVersion]);

  // Today's attempts and XP calculation using local timezone key
  const { todayAttemptsCount, todayCorrectCount, todayXp } = useMemo(() => {
    const todayStr = getLocalDateString(new Date());
    const todayList = attempts.filter(a => {
      try {
        return getLocalDateString(new Date(a.timestamp)) === todayStr;
      } catch {
        return false;
      }
    });
    const correctCount = todayList.filter(a => a.isCorrect).length;
    // 15 XP per question attempt + 10 XP bonus per correct answer
    const calculatedXp = Math.min(500, todayList.length * 15 + correctCount * 10);
    return {
      todayAttemptsCount: todayList.length,
      todayCorrectCount: correctCount,
      todayXp: calculatedXp,
    };
  }, [attempts]);

  // Last practice session resolution
  const lastSession = useMemo(() => getLastSession(), []);
  const lastAttempt = useMemo(() => {
    if (attempts.length === 0) return null;
    return attempts[attempts.length - 1];
  }, [attempts]);

  const resumeQuestion = useMemo(() => {
    if (lastSession?.questionId) {
      const q = questions.find(item => item.id === lastSession.questionId);
      if (q) return q;
    }
    if (lastAttempt?.questionId) {
      const q = questions.find(item => item.id === lastAttempt.questionId);
      if (q) return q;
    }
    return null;
  }, [lastSession, lastAttempt, questions]);

  const activeSnippet = useMemo(() => {
    if (lastSession?.questionSnippet) {
      return cleanTruncateSnippet(lastSession.questionSnippet);
    }
    if (resumeQuestion) {
      const raw = resumeQuestion.prompt || resumeQuestion.passage || '';
      return cleanTruncateSnippet(raw);
    }
    return '';
  }, [lastSession, resumeQuestion]);

  // ---------------------------------------------------------------------------
  // 4. Dynamic Skills Calculation (Minimum 3 Attempts Threshold)
  // ---------------------------------------------------------------------------
  const { strongestSkills, weakestSkills, totalQualifiedSkills } = useMemo(() => {
    const entries = Object.entries(skillStatsMap);
    // Strict requirement: >= 3 attempts
    const qualified = entries
      .filter(([_, stat]) => stat.attempted >= 3)
      .map(([name, stat]) => ({
        name,
        domain: stat.domain || '',
        accuracy: Math.round((stat.correct / stat.attempted) * 100),
        attempted: stat.attempted,
      }));

    if (qualified.length < 3) {
      return { 
        strongestSkills: [], 
        weakestSkills: [], 
        totalQualifiedSkills: qualified.length 
      };
    }

    // STRONGEST: top 3 by highest accuracy descending, tie-breaking by most attempts
    const strongest = [...qualified]
      .sort((a, b) => b.accuracy - a.accuracy || b.attempted - a.attempted)
      .slice(0, 3);

    // WEAKEST: bottom 3 by lowest accuracy ascending, tie-breaking by most attempts
    const weakest = [...qualified]
      .sort((a, b) => a.accuracy - b.accuracy || b.attempted - a.attempted)
      .slice(0, 3);

    return { 
      strongestSkills: strongest, 
      weakestSkills: weakest, 
      totalQualifiedSkills: qualified.length 
    };
  }, [skillStatsMap]);

  // ---------------------------------------------------------------------------
  // 5. 7-Day Activity / Accuracy Chart Slice
  // ---------------------------------------------------------------------------
  const [chartMode, setChartMode] = useState<'activity' | 'accuracy'>('activity');

  const recentDays = useMemo(() => {
    return activityTrend.slice(-7);
  }, [activityTrend]);

  const maxRecentDay = useMemo(() => {
    return Math.max(...recentDays.map(d => d.total), 1);
  }, [recentDays]);

  // ---------------------------------------------------------------------------
  // 6. GSAP Motion Choreography (@gsap-react, @gsap-core, @gsap-performance)
  // ---------------------------------------------------------------------------
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // 1. Dashboard card entrance
      tl.from('.gsap-dashboard-card', {
        autoAlpha: 0,
        y: 14,
        duration: 0.45,
        stagger: 0.06,
        clearProps: 'transform',
      });

      // 2. Stat counters tweening
      const streakEl = containerRef.current?.querySelector<HTMLElement>('.gsap-stat-streak');
      if (streakEl) {
        gsap.fromTo(streakEl, { innerText: 0 }, {
          innerText: streak,
          duration: 0.6,
          ease: 'power2.out',
          snap: { innerText: 1 },
        });
      }

      const satDaysEl = containerRef.current?.querySelector<HTMLElement>('.gsap-stat-sat');
      if (satDaysEl && satDaysRemaining !== null && satDaysRemaining > 0) {
        gsap.fromTo(satDaysEl, { innerText: 0 }, {
          innerText: satDaysRemaining,
          duration: 0.6,
          ease: 'power2.out',
          snap: { innerText: 1 },
        });
      }

      const goalsEl = containerRef.current?.querySelector<HTMLElement>('.gsap-stat-goals');
      if (goalsEl) {
        gsap.fromTo(goalsEl, { innerText: 0 }, {
          innerText: todayAttemptsCount,
          duration: 0.6,
          ease: 'power2.out',
          snap: { innerText: 1 },
        });
      }

      const xpEl = containerRef.current?.querySelector<HTMLElement>('.gsap-stat-xp');
      if (xpEl) {
        gsap.fromTo(xpEl, { innerText: 0 }, {
          innerText: todayXp,
          duration: 0.6,
          ease: 'power2.out',
          snap: { innerText: 1 },
        });
      }

      // 3. Horizontal Progress bars
      tl.from('.gsap-progress-bar', {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 0.65,
        ease: 'power2.out',
        clearProps: 'transform',
      }, '-=0.2');

      // 4. 7-Day Activity columns
      tl.from('.gsap-activity-bar', {
        scaleY: 0,
        transformOrigin: 'bottom center',
        duration: 0.5,
        stagger: 0.05,
        ease: 'back.out(1.2)',
        clearProps: 'transform',
      }, '-=0.3');
    });

    return () => mm.revert();
  }, { scope: containerRef, dependencies: [streak, satDaysRemaining, todayAttemptsCount, todayXp] });

  return (
    <div ref={containerRef} className="w-full h-full overflow-y-auto overflow-x-hidden bg-neutral-50 dark:bg-[#090A0F] text-zinc-950 dark:text-[#F4F4F6] select-text">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto p-4 sm:p-6">
        
        {/* =================================================================== */}
        {/* LEFT COLUMN (lg:col-span-5 flex flex-col gap-6)                     */}
        {/* =================================================================== */}
        <div className="lg:col-span-5 flex flex-col gap-6">

          {/* (a) DAILY QUESTIONS CONTAINER CARD */}
          <div className="gsap-dashboard-card rounded-2xl border border-zinc-200/80 dark:border-[#222634] bg-white dark:bg-[#11131A] shadow-xs overflow-hidden flex flex-col">
            
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
                <span className="text-amber-300 font-semibold flex items-center gap-1 tabular-nums">
                  <Clock className="w-3.5 h-3.5" />
                  Resets in {countdown || '24h'}
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
                {/* Repositioned decorative graphic (right-12) so it never collides with chevron */}
                <div className="absolute right-12 bottom-[-8px] pointer-events-none opacity-25 dark:opacity-20 transform -rotate-12 group-hover:scale-105 transition-transform duration-200">
                  <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
                      Daily Math Challenge
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-[#8E95A5] mt-0.5 line-clamp-1">
                      Calibrated problem solving &amp; algebra reasoning drill.
                    </p>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs font-semibold text-blue-700 dark:text-blue-400">
                    <span>Start Drill →</span>
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </button>

              {/* Card 2: DAILY · Reading & Writing */}
              <button
                type="button"
                onClick={() => onStartDailyQuestion ? onStartDailyQuestion('Reading and Writing') : onOpenQuestionBank()}
                className="group relative w-full text-left p-4 rounded-xl border border-zinc-200 dark:border-[#222634] hover:border-indigo-500 dark:hover:border-indigo-500 bg-gradient-to-br from-slate-50 to-indigo-50/40 dark:from-[#141722] dark:to-[#1a1728] overflow-hidden transition-all duration-150 active:scale-[0.99] shadow-2xs hover:shadow cursor-pointer"
              >
                {/* Repositioned decorative graphic (right-12) so it never collides with chevron */}
                <div className="absolute right-12 bottom-[-8px] pointer-events-none opacity-25 dark:opacity-20 transform rotate-12 group-hover:scale-105 transition-transform duration-200">
                  <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
                      Daily Reading &amp; Writing Challenge
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-[#8E95A5] mt-0.5 line-clamp-1">
                      Context clues, rhetorical synthesis, &amp; conventions pacing.
                    </p>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                    <span>Start Drill →</span>
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </button>

            </div>
          </div>

          {/* (b) START PRACTICING CARD (Bottom-Left) */}
          <div className="gsap-dashboard-card rounded-2xl border border-zinc-200/80 dark:border-[#222634] bg-white dark:bg-[#11131A] shadow-xs overflow-hidden flex flex-col">
            
            {/* Header Bar with Leading Icon and Title Case */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 dark:from-blue-600 dark:to-indigo-700 px-4 sm:px-5 py-3.5 text-white flex items-center justify-between">
              <span className="font-bold text-sm tracking-wide flex items-center gap-2">
                <Play className="w-4 h-4 fill-current shrink-0" />
                Start Practicing
              </span>
              <span className="text-xs font-mono bg-black/25 text-white/95 px-2.5 py-0.5 rounded-full font-medium tabular-nums">
                {questions.length} Items in Bank
              </span>
            </div>

            <div className="p-4 sm:p-5 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[11px] font-mono uppercase text-zinc-400 dark:text-[#8E95A5] tracking-wider font-semibold">
                  {lastSession || lastAttempt ? 'Resume Previous Session' : 'Quick Start Practice'}
                </span>
                
                {lastSession || lastAttempt ? (
                  <div className="mt-2 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-sm text-zinc-950 dark:text-[#F4F4F6] truncate">
                        {lastSession?.skill || lastAttempt?.skill || 'Standard English Conventions'}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                        (lastSession?.difficulty || lastAttempt?.difficulty) === 'Easy'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : (lastSession?.difficulty || lastAttempt?.difficulty) === 'Hard'
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                      }`}>
                        {lastSession?.difficulty || lastAttempt?.difficulty || 'Medium'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40">
                        {lastSession?.domain || lastAttempt?.domain || 'Reading & Writing'}
                      </span>
                    </div>

                    {activeSnippet && (
                      <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#181B24] border border-zinc-200/80 dark:border-[#222634] text-xs font-serif leading-relaxed text-zinc-800 dark:text-zinc-200 shadow-2xs line-clamp-2">
                        <MathText text={activeSnippet} />
                      </div>
                    )}
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
                  onClick={onOpenQuestionFilter || onOpenQuestionBank}
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
            <div className="gsap-dashboard-card p-4 rounded-2xl border border-zinc-200/80 dark:border-[#222634] bg-white dark:bg-[#11131A] shadow-xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase font-semibold text-zinc-400 dark:text-[#8E95A5]">
                  Streak
                </span>
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-[#F4F4F6] tabular-nums">
                  <span className="gsap-stat-streak">{streak}</span>{' '}
                  <span className="text-xs font-medium text-zinc-500 dark:text-[#8E95A5]">
                    {streak === 1 ? 'day' : 'days'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-[#8E95A5] mt-0.5 truncate">
                  {todayAttemptsCount >= 1 ? 'Study streak on fire!' : 'Solve 1 question to keep your streak!'}
                </p>
              </div>
            </div>

            {/* Card 2: Next SAT (Compact Single Selector & Locked Height) */}
            <div className="gsap-dashboard-card p-4 rounded-2xl border border-zinc-200/80 dark:border-[#222634] bg-white dark:bg-[#11131A] shadow-xs flex flex-col justify-between space-y-2 min-h-[108px]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase font-semibold text-zinc-400 dark:text-[#8E95A5]">
                  Next SAT
                </span>
                {!isEditingSatDate && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingSatDate(true);
                      setTempDateInput(satDate);
                      setIsCustomDate(satDate ? !OFFICIAL_SAT_DATES.some(d => d.value === satDate) : false);
                    }}
                    className="text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer p-0.5 rounded"
                    title="Change target SAT date"
                    aria-label="Change target SAT date"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div>
                {isEditingSatDate ? (
                  <div className="space-y-1.5">
                    <select
                      value={isCustomDate ? 'custom' : tempDateInput}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setIsCustomDate(true);
                        } else {
                          setIsCustomDate(false);
                          setTempDateInput(e.target.value);
                        }
                      }}
                      className="w-full text-xs py-1 px-1.5 rounded-lg border border-zinc-300 dark:border-[#222634] bg-neutral-50 dark:bg-[#181B24] text-zinc-900 dark:text-[#F4F4F6] cursor-pointer focus:ring-1 focus:ring-blue-500 truncate"
                    >
                      {OFFICIAL_SAT_DATES.map(d => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                      <option value="custom">Custom Date...</option>
                    </select>

                    {isCustomDate && (
                      <input
                        type="date"
                        min={getLocalDateString(new Date())}
                        value={tempDateInput}
                        onChange={e => setTempDateInput(e.target.value)}
                        className="w-full text-xs py-1 px-1.5 rounded-lg border border-zinc-300 dark:border-[#222634] bg-neutral-50 dark:bg-[#181B24] text-zinc-900 dark:text-[#F4F4F6] focus:ring-1 focus:ring-blue-500"
                      />
                    )}

                    <div className="flex items-center gap-1.5 pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (tempDateInput) handleSaveSatDate(tempDateInput);
                        }}
                        disabled={!tempDateInput}
                        className="text-[10px] bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer active:scale-95"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingSatDate(false);
                          setIsCustomDate(false);
                        }}
                        className="text-[10px] text-zinc-500 hover:text-zinc-800 dark:text-[#8E95A5] dark:hover:text-zinc-200 px-2 py-1 rounded-md transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (satDaysRemaining !== null && satDaysRemaining >= 0) ? (
                  <div>
                    {satDaysRemaining === 0 ? (
                      <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                        Test Day!
                      </div>
                    ) : (
                      <div className="text-2xl font-bold tracking-tight text-blue-700 dark:text-blue-400 tabular-nums">
                        <span className="gsap-stat-sat">{satDaysRemaining}</span>{' '}
                        <span className="text-xs font-medium text-zinc-500 dark:text-[#8E95A5]">
                          {satDaysRemaining === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                    )}
                    <p className="text-[11px] text-zinc-500 dark:text-[#8E95A5] mt-0.5 truncate">
                      {formattedSatDate ? `${formattedSatDate} Test Date` : 'Target Test Date'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Set Date
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingSatDate(true);
                        setTempDateInput('');
                        setIsCustomDate(false);
                      }}
                      className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline mt-0.5 block cursor-pointer"
                    >
                      + Pick test date
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Card 3: Today's Goals */}
            <div className="gsap-dashboard-card p-4 rounded-2xl border border-zinc-200/80 dark:border-[#222634] bg-white dark:bg-[#11131A] shadow-xs flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase font-semibold text-zinc-400 dark:text-[#8E95A5]">
                  Today's Goals
                </span>
                <Compass className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-[#F4F4F6] tabular-nums">
                  <span className="gsap-stat-goals">{todayAttemptsCount}</span>{' '}
                  <span className="text-xs font-medium text-zinc-500 dark:text-[#8E95A5]">/ 15 Qs</span>
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-[#8E95A5] mt-0.5">
                  {todayCorrectCount} correct today
                </div>
                <div className="w-full bg-zinc-100 dark:bg-[#181B24] h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="gsap-progress-bar h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.round((todayAttemptsCount / 15) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* (b) DAILY XP GOAL CARD */}
          <div className="gsap-dashboard-card p-4 sm:p-5 rounded-2xl border border-zinc-200/80 dark:border-[#222634] bg-white dark:bg-[#11131A] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-2xs">
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
                  <span className="gsap-stat-xp">{todayXp}</span>
                </span>
                <span className="text-xs font-mono text-zinc-400"> / 500 XP</span>
              </div>
            </div>

            {/* Smooth Progress Bar */}
            <div className="w-full h-2.5 bg-zinc-100 dark:bg-[#181B24] rounded-full overflow-hidden">
              <div 
                className="gsap-progress-bar h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-full"
                style={{ width: `${Math.min(100, (todayXp / 500) * 100)}%` }}
              />
            </div>
          </div>

          {/* (c) YOUR PROGRESS CARD */}
          <div className="gsap-dashboard-card rounded-2xl border border-zinc-200/80 dark:border-[#222634] bg-white dark:bg-[#11131A] shadow-xs overflow-hidden flex flex-col">
            
            {/* Royal-Blue Header Bar */}
            <div className="bg-[#1e40af] dark:bg-[#1d4ed8] px-4 sm:px-5 py-3.5 text-white flex items-center justify-between flex-wrap gap-2">
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

            {/* Inner 2-Column: Left stacked chart & Right dynamic skills */}
            <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-5">
              
              {/* Left: Stacked Activity / Accuracy Chart with Hover Tooltip */}
              <div className="md:col-span-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-100 dark:border-[#181B24] pb-4 md:pb-0 md:pr-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase font-mono tracking-wider">
                      7-Day Activity
                    </span>
                  </div>

                  {/* Activity / Accuracy % Pill Toggle */}
                  <div className="inline-flex items-center rounded-lg bg-zinc-100 dark:bg-[#181B24] p-0.5 border border-zinc-200/60 dark:border-[#222634]">
                    <button
                      type="button"
                      onClick={() => setChartMode('activity')}
                      className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md transition-colors cursor-pointer ${
                        chartMode === 'activity'
                          ? 'bg-white dark:bg-[#11131A] text-zinc-900 dark:text-white shadow-2xs'
                          : 'text-zinc-500 hover:text-zinc-800 dark:text-[#8E95A5] dark:hover:text-zinc-200'
                      }`}
                    >
                      Count
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartMode('accuracy')}
                      className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md transition-colors cursor-pointer ${
                        chartMode === 'accuracy'
                          ? 'bg-white dark:bg-[#11131A] text-zinc-900 dark:text-white shadow-2xs'
                          : 'text-zinc-500 hover:text-zinc-800 dark:text-[#8E95A5] dark:hover:text-zinc-200'
                      }`}
                    >
                      Acc %
                    </button>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-zinc-400 mb-1">
                  {recentDays.reduce((acc, d) => acc + d.total, 0)} Total Solved
                </div>

                <div className="h-36 flex items-end justify-between gap-1.5 pt-4">
                  {recentDays.map((day, idx) => {
                    const accuracyPercent = day.total > 0 ? Math.round((day.correct / day.total) * 100) : 0;
                    const heightPercent = chartMode === 'activity'
                      ? (day.total > 0 ? Math.max(16, (day.total / maxRecentDay) * 100) : 0)
                      : (day.total > 0 ? Math.max(16, accuracyPercent) : 0);
                    const correctPercent = day.total > 0 ? (day.correct / day.total) * 100 : 0;
                    const wrongPercent = 100 - correctPercent;
                    
                    const tooltip = day.total > 0 
                      ? `${day.label} • ${day.correct} Correct / ${day.wrong} Incorrect (${accuracyPercent}% Accuracy)` 
                      : `${day.label} • No practice`;

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative" title={tooltip}>
                        {day.total > 0 ? (
                          <div 
                            className="gsap-activity-bar w-full max-w-[24px] rounded-t-md overflow-hidden flex flex-col justify-end transition-all duration-200 group-hover:brightness-110 shadow-2xs" 
                            style={{ height: `${heightPercent}%` }}
                          >
                            <div style={{ height: `${wrongPercent}%` }} className="w-full bg-rose-500" />
                            <div style={{ height: `${correctPercent}%` }} className="w-full bg-emerald-500" />
                          </div>
                        ) : (
                          // Subtle 2px baseline bar on 0-activity days to keep the timeline grounded
                          <div className="w-full max-w-[24px] h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-full my-auto" />
                        )}
                        <span className="text-[10px] font-mono text-zinc-500 dark:text-[#8E95A5] truncate">
                          {day.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Dynamic Strongest & Weakest Skills derived from real attempts */}
              <div className="md:col-span-6 flex flex-col justify-between space-y-4">
                
                {totalQualifiedSkills < 3 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-zinc-200 dark:border-[#222634] text-center my-auto">
                    <Compass className="w-6 h-6 text-zinc-400 dark:text-[#8E95A5] mb-2 stroke-[1.5]" />
                    <p className="text-xs text-zinc-600 dark:text-[#8E95A5] font-medium leading-relaxed max-w-[200px]">
                      Complete 3+ questions in a skill to unlock insights
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Strongest Skills */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase font-mono tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Strongest Skills
                      </span>
                      <div className="space-y-2">
                        {strongestSkills.map(sk => (
                          <div key={sk.name} className="flex items-center justify-between text-xs gap-2">
                            <span className="truncate flex-1 text-zinc-700 dark:text-[#C5CAD6]" title={sk.name}>
                              {sk.name}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="w-16 h-1.5 bg-zinc-100 dark:bg-[#181B24] rounded-full overflow-hidden">
                                <div 
                                  className="gsap-progress-bar h-full bg-emerald-500 rounded-full" 
                                  style={{ width: `${Math.max(0, Math.min(100, sk.accuracy))}%` }} 
                                />
                              </div>
                              <span className="font-mono font-bold text-[11px] text-emerald-700 dark:text-emerald-400 tabular-nums w-8 text-right">
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
                      <div className="space-y-2">
                        {weakestSkills.map(sk => (
                          <div key={sk.name} className="flex items-center justify-between text-xs gap-2">
                            <span className="truncate flex-1 text-zinc-700 dark:text-[#C5CAD6]" title={sk.name}>
                              {sk.name}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="w-16 h-1.5 bg-zinc-100 dark:bg-[#181B24] rounded-full overflow-hidden">
                                <div 
                                  className="gsap-progress-bar h-full bg-amber-500 rounded-full" 
                                  style={{ width: `${Math.max(0, Math.min(100, sk.accuracy))}%` }} 
                                />
                              </div>
                              <span className="font-mono font-bold text-[11px] text-amber-700 dark:text-amber-400 tabular-nums w-8 text-right">
                                {sk.accuracy}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Home;
