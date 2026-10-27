import React, { useState, useMemo, useEffect } from 'react';
import { 
  AlertTriangle, 
  RotateCcw,
  X
} from 'lucide-react';
import { MockQuestion } from '../types/quiz';
import { getAttempts, clearAllProgress } from '../utils/storage';
import { DomainAccuracyComparison } from '../components/charts/DomainAccuracyComparison';
import { DifficultyChart } from '../components/charts/DifficultyChart';
import { LowestAccuracyList } from '../components/charts/LowestAccuracyList';

interface AnalyticsViewProps {
  questions?: MockQuestion[];
  onStartSkillPractice: (skillName: string, domainName: string) => void;
}

type TimeframeFilter = 'all' | '30d' | '7d' | 'today';
type SubjectFilter = 'all' | 'rw' | 'math';

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  questions: _questions,
  onStartSkillPractice,
}) => {
  const [timeframe, setTimeframe] = useState<TimeframeFilter>('all');
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>('all');
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

  // Single O(N) reduction pass across filtered answers
  const {
    totalAttempted,
    totalCorrect,
    totalWrong,
    overallAccuracy,
    avgTimeSeconds,
    domainBreakdown,
    difficultyBreakdown,
    lowestAccuracySkills,
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
        if (!skillMap[a.skill]) skillMap[a.skill] = { attempted: 0, correct: 0 };
        skillMap[a.skill].attempted++;
        if (a.isCorrect) skillMap[a.skill].correct++;
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

    // Active skills based on subject filter
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
      { name: 'Linear equations in one variable', domain: 'Algebra' },
      { name: 'Linear equations in two variables', domain: 'Algebra' },
      { name: 'Linear inequalities in one or two variables', domain: 'Algebra' },
      { name: 'Systems of two linear equations in two variables', domain: 'Algebra' },
      { name: 'Linear functions', domain: 'Algebra' },
      { name: 'Nonlinear functions', domain: 'Advanced Math' },
      { name: 'Nonlinear equations in one variable and systems of equations in two variables', domain: 'Advanced Math' },
      { name: 'Equivalent expressions', domain: 'Advanced Math' },
      { name: 'Ratios, rates, proportional relationships, and units', domain: 'Problem-Solving and Data Analysis' },
      { name: 'Percentages', domain: 'Problem-Solving and Data Analysis' },
      { name: 'One-variable data: Distributions and measures of center and spread', domain: 'Problem-Solving and Data Analysis' },
      { name: 'Two-variable data: Models and scatterplots', domain: 'Problem-Solving and Data Analysis' },
      { name: 'Probability and conditional probability', domain: 'Problem-Solving and Data Analysis' },
      { name: 'Inference from sample statistics and margin of error', domain: 'Problem-Solving and Data Analysis' },
      { name: 'Evaluating statistical claims: Observational studies and experiments', domain: 'Problem-Solving and Data Analysis' },
      { name: 'Area and volume', domain: 'Geometry and Trigonometry' },
      { name: 'Right triangles and trigonometry', domain: 'Geometry and Trigonometry' },
      { name: 'Circles', domain: 'Geometry and Trigonometry' },
    ];

    const activeSkills = subjectFilter === 'math'
      ? mathSkills
      : subjectFilter === 'rw'
      ? rwSkills
      : [...rwSkills, ...mathSkills];

    const skillStatsItems = activeSkills.map(sk => {
      const st = skillMap[sk.name] || { attempted: 0, correct: 0 };
      return {
        ...sk,
        attempted: st.attempted,
        correct: st.correct,
        wrong: st.attempted - st.correct,
        accuracy: st.attempted > 0 ? Math.round((st.correct / st.attempted) * 100) : 0,
      };
    });

    const attemptedSkills = skillStatsItems.filter(s => s.attempted > 0).sort((a, b) => a.accuracy - b.accuracy);
    const unattemptedSkills = skillStatsItems.filter(s => s.attempted === 0);
    const lowest = [...attemptedSkills, ...unattemptedSkills].slice(0, 5);

    return {
      totalAttempted: len,
      totalCorrect: correctCount,
      totalWrong: len - correctCount,
      overallAccuracy: len > 0 ? Math.round((correctCount / len) * 100) : 0,
      avgTimeSeconds: len > 0 ? Math.round(totalTime / len) : 0,
      domainBreakdown: domainItems,
      difficultyBreakdown: diffItems,
      lowestAccuracySkills: lowest,
    };
  }, [filteredAnswers, subjectFilter]);

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-neutral-50 dark:bg-[#090A0F] text-zinc-950 dark:text-[#F4F4F6] px-4 sm:px-6 md:px-10 py-6 sm:py-8 space-y-6 sm:space-y-8 select-text">
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

          <button
            onClick={() => setIsResetModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] hover:bg-zinc-100 dark:hover:bg-[#181B24] text-zinc-600 dark:text-[#8E95A5] hover:text-rose-600 dark:hover:text-rose-400 font-medium text-xs transition-all duration-150 active:scale-95 cursor-pointer"
            title="Reset All Progress"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards (Bento grid with 1px hairline borders & tabular-nums) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] shadow-xs space-y-1 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-0.5">
          <div className="text-xs font-medium text-zinc-500 dark:text-[#8E95A5]">Attempted Questions</div>
          <div className="text-2xl sm:text-3xl font-mono font-semibold tabular-nums text-zinc-950 dark:text-[#F4F4F6]">{totalAttempted}</div>
          <div className="text-[11px] font-mono text-zinc-400 dark:text-[#8E95A5]">
            {subjectFilter === 'math' ? 'Math questions' : subjectFilter === 'rw' ? 'R&W questions' : 'Total in timeframe'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] shadow-xs space-y-1 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-0.5">
          <div className="text-xs font-medium text-zinc-500 dark:text-[#8E95A5]">Period Accuracy</div>
          <div className="text-2xl sm:text-3xl font-mono font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{overallAccuracy}%</div>
          <div className="text-[11px] font-mono text-zinc-500 dark:text-[#8E95A5]">{totalCorrect} correct • {totalWrong} wrong</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] shadow-xs space-y-1 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-0.5">
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

        <div className="p-5 rounded-2xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] shadow-xs space-y-1 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-0.5">
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
      />

      {/* Domain Breakdown & Difficulty Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DomainAccuracyComparison domainBreakdown={domainBreakdown} />
        <DifficultyChart difficultyBreakdown={difficultyBreakdown} />
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
