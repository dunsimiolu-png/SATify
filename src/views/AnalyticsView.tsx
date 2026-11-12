import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  AlertTriangle, 
  RotateCcw,
  X
} from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { MockQuestion } from '../types/quiz';
import { getAttempts, clearAllProgress, getUniqueSolvedQuestions } from '../utils/storage';
import { DomainAccuracyComparison } from '../components/charts/DomainAccuracyComparison';
import { DifficultyChart } from '../components/charts/DifficultyChart';
import { LowestAccuracyList, LowestAccuracySkill } from '../components/charts/LowestAccuracyList';

gsap.registerPlugin(useGSAP);

interface AnalyticsViewProps {
  questions?: MockQuestion[];
  onStartSkillPractice: (skillName: string, domainName: string) => void;
  initialSubject?: SubjectFilter;
}

type TimeframeFilter = 'all' | '30d' | '7d' | 'today';
export type SubjectFilter = 'all' | 'rw' | 'math';

export const normalizeSkillName = (name: string): string => {
  const map: Record<string, string> = {
    'linear equations in one variable': 'Linear Equations in One Variable',
    'linear equations in two variables': 'Linear Equations in Two Variables',
    'linear inequalities in one or two variables': 'Linear Inequalities in One or Two Variables',
    'systems of two linear equations in two variables': 'Systems of Two Linear Equations in Two Variables',
    'linear functions': 'Linear Functions',
    'nonlinear functions': 'Nonlinear Functions',
    'nonlinear equations in one variable and systems of equations in two variables': 'Nonlinear Equations in One Variable and Systems of Equations in Two Variables',
    'equivalent expressions': 'Equivalent Expressions',
    'ratios, rates, proportional relationships, and units': 'Ratios, Rates, Proportional Relationships, and Units',
    'percentages': 'Percentages',
    'one-variable data: distributions and measures of center and spread': 'One-Variable Data: Distributions and Measures of Center and Spread',
    'two-variable data: models and scatterplots': 'Two-Variable Data: Models and Scatterplots',
    'probability and conditional probability': 'Probability and Conditional Probability',
    'inference from sample statistics and margin of error': 'Inference from Sample Statistics and Margin of Error',
    'evaluating statistical claims: observational studies and experiments': 'Evaluating Statistical Claims: Observational Studies and Experiments',
    'area and volume': 'Area and Volume',
    'right triangles and trigonometry': 'Right Triangles and Trigonometry',
    'circles': 'Circles',
    'words in context': 'Words in Context',
    'text structure and purpose': 'Text Structure and Purpose',
    'cross-text connections': 'Cross-Text Connections',
    'central ideas and details': 'Central Ideas and Details',
    'command of evidence': 'Command of Evidence',
    'inferences': 'Inferences',
    'rhetorical synthesis': 'Rhetorical Synthesis',
    'transitions': 'Transitions',
    'boundaries': 'Boundaries',
    'form, structure, and sense': 'Form, Structure, and Sense',
  };
  const key = name.toLowerCase().trim();
  return map[key] || name;
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  questions: _questions,
  onStartSkillPractice,
  initialSubject,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [timeframe, setTimeframe] = useState<TimeframeFilter>('all');
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>(initialSubject || 'all');

  useEffect(() => {
    if (initialSubject) {
      setSubjectFilter(initialSubject);
    }
  }, [initialSubject]);

  const [storageVersion, setStorageVersion] = useState<number>(0);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  // Live storage update listener for real-time analytics updates
  useEffect(() => {
    const handleUpdate = () => setStorageVersion(prev => prev + 1);
    window.addEventListener('satify_storage_update', handleUpdate);
    return () => window.removeEventListener('satify_storage_update', handleUpdate);
  }, []);

  const allAnswers = useMemo(() => getAttempts(), [storageVersion]);

  // Filter answers by timeframe
  const timeframeAnswers = useMemo(() => {
    const now = Date.now();
    if (timeframe === 'today') {
      const todayStr = new Date().toISOString().slice(0, 10);
      return allAnswers.filter(a => new Date(a.timestamp).toISOString().slice(0, 10) === todayStr);
    } else if (timeframe === '7d') {
      const cutoff = now - 7 * 86400000;
      return allAnswers.filter(a => a.timestamp >= cutoff);
    } else if (timeframe === '30d') {
      const cutoff = now - 30 * 86400000;
      return allAnswers.filter(a => a.timestamp >= cutoff);
    }
    return allAnswers;
  }, [allAnswers, timeframe]);

  const mathDomains = ['Algebra', 'Advanced Math', 'Problem-Solving and Data Analysis', 'Geometry and Trigonometry'];

  // Filter answers by subject
  const filteredAnswers = useMemo(() => {
    if (subjectFilter === 'math') {
      return timeframeAnswers.filter(a => mathDomains.includes(a.domain));
    } else if (subjectFilter === 'rw') {
      return timeframeAnswers.filter(a => !mathDomains.includes(a.domain));
    }
    return timeframeAnswers;
  }, [timeframeAnswers, subjectFilter]);

  // Single reduction pass across filtered answers
  const {
    totalAttempted,
    totalCorrect,
    totalWrong,
    overallAccuracy,
    avgTimeSeconds,
    domainBreakdown,
    difficultyBreakdown,
    lowestAccuracySkills,
    skillsListTitle,
    skillsListDescription,
  } = useMemo(() => {
    let correctCount = 0;
    let totalTime = 0;
    const domainMap: Record<string, { attempted: number; correct: number }> = {};
    const diffMap: Record<string, { attempted: number; correct: number }> = {};
    const skillMap: Record<string, { attempted: number; correct: number }> = {};

    const len = filteredAnswers.length;
    for (let i = 0; i < len; i++) {
      const a = filteredAnswers[i];
      if (a.isCorrect) correctCount++;
      totalTime += a.timeSpentSeconds || (mathDomains.includes(a.domain) ? 45 : 35);

      if (a.domain) {
        if (!domainMap[a.domain]) domainMap[a.domain] = { attempted: 0, correct: 0 };
        domainMap[a.domain].attempted++;
        if (a.isCorrect) domainMap[a.domain].correct++;
      }
      if (a.difficulty) {
        if (!diffMap[a.difficulty]) diffMap[a.difficulty] = { attempted: 0, correct: 0 };
        diffMap[a.difficulty].attempted++;
        if (a.isCorrect) diffMap[a.difficulty].correct++;
      }
      if (a.skill) {
        const canonSkill = normalizeSkillName(a.skill);
        if (!skillMap[canonSkill]) skillMap[canonSkill] = { attempted: 0, correct: 0 };
        skillMap[canonSkill].attempted++;
        if (a.isCorrect) skillMap[canonSkill].correct++;
      }
    }

    // Active domains based on subject filter
    const rwDomains = [
      'Craft and Structure',
      'Information and Ideas',
      'Expression of Ideas',
      'Standard English Conventions',
    ];
    const officialMathDomains = [
      'Algebra',
      'Advanced Math',
      'Problem-Solving and Data Analysis',
      'Geometry and Trigonometry',
    ];

    const activeDomains = subjectFilter === 'math'
      ? officialMathDomains
      : subjectFilter === 'rw'
      ? rwDomains
      : [...rwDomains, ...officialMathDomains];

    const domainItems = activeDomains.map(dName => {
      const st = domainMap[dName] || { attempted: 0, correct: 0 };
      return {
        domain: dName,
        attempted: st.attempted,
        correct: st.correct,
        wrong: st.attempted - st.correct,
        accuracy: st.attempted > 0 ? Math.round((st.correct / st.attempted) * 100) : 0,
      };
    });

    const diffs = ['Easy', 'Medium', 'Hard'];
    const diffItems = diffs.map(dName => {
      const st = diffMap[dName] || { attempted: 0, correct: 0 };
      return {
        difficulty: dName,
        attempted: st.attempted,
        correct: st.correct,
        accuracy: st.attempted > 0 ? Math.round((st.correct / st.attempted) * 100) : 0,
      };
    });

    // Active skills based on subject filter (normalized to Title Case)
    const rwSkills = [
      { name: 'Words in Context', domain: 'Craft and Structure' },
      { name: 'Text Structure and Purpose', domain: 'Craft and Structure' },
      { name: 'Cross-Text Connections', domain: 'Craft and Structure' },
      { name: 'Central Ideas and Details', domain: 'Information and Ideas' },
      { name: 'Command of Evidence', domain: 'Information and Ideas' },
      { name: 'Inferences', domain: 'Information and Ideas' },
      { name: 'Rhetorical Synthesis', domain: 'Expression of Ideas' },
      { name: 'Transitions', domain: 'Expression of Ideas' },
      { name: 'Boundaries', domain: 'Standard English Conventions' },
      { name: 'Form, Structure, and Sense', domain: 'Standard English Conventions' },
    ];

    const mathSkills = [
      { name: 'Linear Equations in One Variable', domain: 'Algebra' },
      { name: 'Linear Equations in Two Variables', domain: 'Algebra' },
      { name: 'Linear Inequalities in One or Two Variables', domain: 'Algebra' },
      { name: 'Systems of Two Linear Equations in Two Variables', domain: 'Algebra' },
      { name: 'Linear Functions', domain: 'Algebra' },
      { name: 'Nonlinear Functions', domain: 'Advanced Math' },
      { name: 'Nonlinear Equations in One Variable and Systems of Equations in Two Variables', domain: 'Advanced Math' },
      { name: 'Equivalent Expressions', domain: 'Advanced Math' },
      { name: 'Ratios, Rates, Proportional Relationships, and Units', domain: 'Problem-Solving and Data Analysis' },
      { name: 'Percentages', domain: 'Problem-Solving and Data Analysis' },
      { name: 'One-Variable Data: Distributions and Measures of Center and Spread', domain: 'Problem-Solving and Data Analysis' },
      { name: 'Two-Variable Data: Models and Scatterplots', domain: 'Problem-Solving and Data Analysis' },
      { name: 'Probability and Conditional Probability', domain: 'Problem-Solving and Data Analysis' },
      { name: 'Inference from Sample Statistics and Margin of Error', domain: 'Problem-Solving and Data Analysis' },
      { name: 'Evaluating Statistical Claims: Observational Studies and Experiments', domain: 'Problem-Solving and Data Analysis' },
      { name: 'Area and Volume', domain: 'Geometry and Trigonometry' },
      { name: 'Right Triangles and Trigonometry', domain: 'Geometry and Trigonometry' },
      { name: 'Circles', domain: 'Geometry and Trigonometry' },
    ];

    const activeSkills = subjectFilter === 'math'
      ? mathSkills
      : subjectFilter === 'rw'
      ? rwSkills
      : [...rwSkills, ...mathSkills];

    const skillStatsItems: LowestAccuracySkill[] = activeSkills.map(sk => {
      const canonSkill = normalizeSkillName(sk.name);
      const st = skillMap[canonSkill] || { attempted: 0, correct: 0 };
      return {
        ...sk,
        name: canonSkill,
        attempted: st.attempted,
        correct: st.correct,
        wrong: st.attempted - st.correct,
        accuracy: st.attempted > 0 ? Math.round((st.correct / st.attempted) * 100) : 0,
      };
    });

    // Ranking algorithm:
    // 1. Separate attempted skills from unattempted skills
    const attemptedSkills = skillStatsItems.filter(s => s.attempted >= 1);
    const unattemptedSkills = skillStatsItems.filter(s => s.attempted === 0);

    // 2. Prioritize skills with < 80% accuracy over >= 80% accuracy
    const weakAttempted = attemptedSkills
      .filter(s => s.accuracy < 80)
      .sort((a, b) => a.accuracy - b.accuracy || b.attempted - a.attempted);

    const strongAttempted = attemptedSkills
      .filter(s => s.accuracy >= 80)
      .sort((a, b) => a.accuracy - b.accuracy || b.attempted - a.attempted);

    // 3. Pool top candidates, padding with unattempted skills if fewer than 5 attempted
    const prioritizedPool = [...weakAttempted, ...strongAttempted];
    const top5Candidates = [...prioritizedPool, ...unattemptedSkills].slice(0, 5);

    // 4. Strict final sort: Attempted first (strictly accuracy ASC, tie-break attempted DESC), unattempted last
    const lowest = top5Candidates.sort((a, b) => {
      if (a.attempted > 0 && b.attempted === 0) return -1;
      if (a.attempted === 0 && b.attempted > 0) return 1;
      if (a.attempted === 0 && b.attempted === 0) return 0;
      if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
      return b.attempted - a.attempted;
    });

    // 5. Dynamic header condition: if all attempted have >= 80% or if slots #4/#5 have >= 80%
    const hasHighAccuracyInTop = 
      lowest.some((s, idx) => s.attempted > 0 && s.accuracy >= 80 && idx >= 3) ||
      (lowest.filter(s => s.attempted > 0).length > 0 && lowest.filter(s => s.attempted > 0).every(s => s.accuracy >= 80));

    const title = hasHighAccuracyInTop
      ? 'Skill Performance Breakdown (Recommended Focus)'
      : '5 Lowest-Accuracy Skills (Recommended Focus)';

    const description = hasHighAccuracyInTop
      ? 'Review your skill mastery and focus areas to maximize your Digital SAT score.'
      : 'Prioritize these skills to maximize your Digital SAT score gains.';

    const uniqueSolvedCount = _questions ? getUniqueSolvedQuestions(_questions).length : len;
    const finalAttempted = (timeframe === 'all' && subjectFilter === 'all') ? uniqueSolvedCount : len;

    return {
      totalAttempted: finalAttempted,
      totalCorrect: correctCount,
      totalWrong: Math.max(0, finalAttempted - correctCount),
      overallAccuracy: finalAttempted > 0 ? Math.round((correctCount / finalAttempted) * 100) : 0,
      avgTimeSeconds: len > 0 ? Math.round(totalTime / len) : 0,
      domainBreakdown: domainItems,
      difficultyBreakdown: diffItems,
      lowestAccuracySkills: lowest,
      skillsListTitle: title,
      skillsListDescription: description,
    };
  }, [filteredAnswers, subjectFilter, _questions, timeframe]);

  // GSAP Choreography (@gsap-react, @gsap-core, @gsap-performance)
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // 1. Entrance / Filter Switch Choreography
      gsap.fromTo(
        '.analytics-kpi-card, .analytics-skill-row, .analytics-domain-row, .analytics-difficulty-card',
        { autoAlpha: 0, y: 10 },
        {
          autoAlpha: 1,
          y: 0,
          stagger: 0.04,
          duration: 0.35,
          ease: 'power2.out',
          clearProps: 'transform',
        }
      );

      // 2. Animated Progress Bars
      gsap.fromTo(
        '.analytics-progress-bar',
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: 0.55, ease: 'power3.out' }
      );
    });
  }, { dependencies: [subjectFilter, timeframe, lowestAccuracySkills], scope: containerRef });

  const hasActiveFilters = subjectFilter !== 'all' || timeframe !== 'all';

  return (
    <div 
      ref={containerRef}
      className="w-full h-full overflow-y-auto overflow-x-hidden bg-neutral-50 dark:bg-[#090A0F] text-zinc-950 dark:text-[#F4F4F6] px-4 sm:px-6 md:px-10 py-6 sm:py-8 space-y-6 sm:space-y-8 select-text"
    >
      {/* Header & Subject / Timeframe Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-[#222634]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-semibold tracking-wider text-blue-700 dark:text-blue-400 uppercase">
              Performance Analytics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 dark:text-[#F4F4F6] mt-1">
            Historical Accuracy & Pacing
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-[#8E95A5] mt-1">
            Evaluate skill distribution, review pacing benchmarks, and target your lowest-accuracy skills.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Subject Filter Toggle */}
          <div className="inline-flex items-center p-0.5 bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] rounded-xl shadow-2xs">
            {[
              { id: 'all', label: 'All Subjects' },
              { id: 'rw', label: 'Reading & Writing' },
              { id: 'math', label: 'Math' },
            ].map(btn => (
              <button
                key={btn.id}
                onClick={() => setSubjectFilter(btn.id as SubjectFilter)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all duration-150 active:scale-95 cursor-pointer ${
                  subjectFilter === btn.id
                    ? 'bg-blue-700 text-white dark:bg-blue-600 font-semibold shadow-2xs'
                    : 'text-zinc-600 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Timeframe Filter Buttons */}
          <div className="inline-flex items-center p-0.5 bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] rounded-xl shadow-2xs">
            {[
              { id: 'all', label: 'All Time' },
              { id: '30d', label: '30D' },
              { id: '7d', label: '7D' },
              { id: 'today', label: 'Today' },
            ].map(btn => (
              <button
                key={btn.id}
                onClick={() => setTimeframe(btn.id as TimeframeFilter)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all duration-150 active:scale-95 cursor-pointer ${
                  timeframe === btn.id
                    ? 'bg-blue-700 text-white dark:bg-blue-600 font-semibold shadow-2xs'
                    : 'text-zinc-600 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Contextual Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSubjectFilter('all');
                setTimeframe('all');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-400 font-medium text-xs transition-all duration-150 active:scale-95 cursor-pointer shadow-2xs"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Overview Stat Cards (Bento grid with 1px hairline borders & tabular-nums) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="analytics-kpi-card p-5 rounded-2xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] shadow-xs space-y-1 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-0.5">
          <div className="text-xs font-medium text-zinc-500 dark:text-[#8E95A5]">Attempted Questions</div>
          <div className="text-2xl sm:text-3xl font-mono font-semibold tabular-nums text-zinc-950 dark:text-[#F4F4F6]">{totalAttempted}</div>
          <div className="text-[11px] font-mono text-zinc-400 dark:text-[#8E95A5]">
            {subjectFilter === 'math' ? 'Math questions' : subjectFilter === 'rw' ? 'R&W questions' : 'Total in timeframe'}
          </div>
        </div>

        <div className="analytics-kpi-card p-5 rounded-2xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] shadow-xs space-y-1 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-0.5">
          <div className="text-xs font-medium text-zinc-500 dark:text-[#8E95A5]">Period Accuracy</div>
          <div className="text-2xl sm:text-3xl font-mono font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{overallAccuracy}%</div>
          <div className="text-[11px] font-mono text-zinc-500 dark:text-[#8E95A5]">{totalCorrect} correct • {totalWrong} wrong</div>
        </div>

        <div className="analytics-kpi-card p-5 rounded-2xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] shadow-xs space-y-1 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-0.5">
          <div className="text-xs font-medium text-zinc-500 dark:text-[#8E95A5]">Average Question Pace</div>
          <div className="text-2xl sm:text-3xl font-mono font-semibold tabular-nums text-blue-700 dark:text-blue-400">{avgTimeSeconds}s</div>
          <div className="text-[11px] font-mono text-zinc-500 dark:text-[#8E95A5]">
            {subjectFilter === 'math'
              ? 'Benchmark: 95s / question'
              : subjectFilter === 'rw'
              ? 'Benchmark: 71s / question'
              : 'Benchmark: 71s (R&W) • 95s (Math)'}
          </div>
        </div>

        <div className="analytics-kpi-card p-5 rounded-2xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] shadow-xs space-y-1 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-0.5">
          <div className="text-xs font-medium text-zinc-500 dark:text-[#8E95A5]">Mastery Level</div>
          <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 dark:text-[#F4F4F6]">
            {overallAccuracy >= 85 ? 'Advanced' : overallAccuracy >= 65 ? 'Proficient' : 'Developing'}
          </div>
          <div className="text-[11px] font-mono text-blue-700 dark:text-blue-400">Digital SAT calibrated</div>
        </div>
      </div>

      {/* 5 Lowest-Accuracy Skills Ranked List */}
      <LowestAccuracyList 
        skills={lowestAccuracySkills} 
        onStartSkillPractice={onStartSkillPractice}
        title={skillsListTitle}
        description={skillsListDescription}
      />

      {/* Domain Breakdown & Difficulty Breakdown (Full Height & Balanced) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <DomainAccuracyComparison domainBreakdown={domainBreakdown} />
        <DifficultyChart difficultyBreakdown={difficultyBreakdown} />
      </div>

      {/* Footer Notes & Discreet Reset Data Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-6 border-t border-zinc-200 dark:border-[#222634] text-xs text-zinc-500 dark:text-[#8E95A5]">
        <span>Performance metrics and skill distribution update automatically after every completed practice question.</span>
        <button
          onClick={() => setIsResetModalOpen(true)}
          className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear All Analytics History</span>
        </button>
      </div>

      {/* Guarded Reset Progress Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#11131A] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200/90 dark:border-[#222634] space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-zinc-950 dark:text-[#F4F4F6]">
                    Reset All Analytics & Progress?
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-[#8E95A5]">
                    This action will reset your stats to zero.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#181B24] transition-colors active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-600 dark:text-[#8E95A5] leading-relaxed">
              Are you sure you want to reset your practice progress? This will permanently clear all recorded attempts, accuracy calculations, domain mastery breakdowns, and daily study streak. This cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-[#222634] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-[#181B24] font-medium text-xs transition-all active:scale-95 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAllProgress();
                  setIsResetModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Everything</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsView;
