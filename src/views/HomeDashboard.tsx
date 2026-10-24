import React, { useMemo, useState, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Flame, 
  Target, 
  Play, 
  Layers, 
  RotateCcw,
  AlertTriangle,
  X,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { MockQuestion } from '../types/quiz';
import { 
  getQuestionAnalytics, 
  getSkillStatsMap, 
  get10DayActivityTrend,
  clearAllProgress
} from '../utils/storage';
import { ActivityTrendChart } from '../components/charts/ActivityTrendChart';
import { CircularGauge } from '../components/charts/CircularGauge';

interface HomeDashboardProps {
  questions: MockQuestion[];
  onStartSkillPractice: (skillName: string, domainName: string) => void;
  onOpenQuestionBank: () => void;
}

const DOMAINS_CONFIG = [
  {
    name: 'Craft and Structure',
    badgeColor: 'border-zinc-300 dark:border-[#222634] bg-zinc-100 dark:bg-[#181B24] text-zinc-800 dark:text-[#C5CAD6]',
    skills: ['Words in Context', 'Text Structure and Purpose', 'Cross-Text Connections'],
  },
  {
    name: 'Information and Ideas',
    badgeColor: 'border-zinc-300 dark:border-[#222634] bg-zinc-100 dark:bg-[#181B24] text-zinc-800 dark:text-[#C5CAD6]',
    skills: ['Central Ideas and Details', 'Command of Evidence', 'Inferences'],
  },
  {
    name: 'Expression of Ideas',
    badgeColor: 'border-zinc-300 dark:border-[#222634] bg-zinc-100 dark:bg-[#181B24] text-zinc-800 dark:text-[#C5CAD6]',
    skills: ['Rhetorical Synthesis', 'Transitions'],
  },
  {
    name: 'Standard English Conventions',
    badgeColor: 'border-zinc-300 dark:border-[#222634] bg-zinc-100 dark:bg-[#181B24] text-zinc-800 dark:text-[#C5CAD6]',
    skills: ['Boundaries', 'Form, Structure, and Sense'],
  },
];

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  questions,
  onStartSkillPractice,
  onOpenQuestionBank,
}) => {
  const [storageVersion, setStorageVersion] = useState<number>(0);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  // Storage listener for live sync
  useEffect(() => {
    const handleUpdate = () => setStorageVersion(prev => prev + 1);
    window.addEventListener('satify_storage_update', handleUpdate);
    return () => window.removeEventListener('satify_storage_update', handleUpdate);
  }, []);

  const analytics = useMemo(() => getQuestionAnalytics(), [storageVersion]);
  const skillStatsMap = useMemo(() => getSkillStatsMap(), [storageVersion]);
  const activityTrend = useMemo(() => get10DayActivityTrend(), [storageVersion]);

  // Skill question counts from extracted bank
  const skillQuestionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const q of questions) {
      counts[q.skill] = (counts[q.skill] || 0) + 1;
    }
    return counts;
  }, [questions]);

  // Overall Section stats
  const totalRWQuestions = questions.length;
  const rwSolved = analytics.attempted;
  const rwSolvedPercent = totalRWQuestions > 0 ? Math.min(100, Math.round((rwSolved / totalRWQuestions) * 100)) : 0;

  // Projected RW Score (200 - 800) based on accuracy and completion
  const projectedRWScore = useMemo(() => {
    if (analytics.attempted === 0) return 400;
    const baseScore = 200 + Math.round((analytics.accuracy / 100) * 60) * 10;
    return Math.min(800, Math.max(200, baseScore));
  }, [analytics.attempted, analytics.accuracy]);

  const maxTrendDay = Math.max(1, ...activityTrend.map(d => d.total));

  const formatTimeSpent = (totalSeconds: number) => {
    if (totalSeconds <= 0) return '0m';
    const mins = Math.round(totalSeconds / 60);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m`;
  };

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-neutral-50 dark:bg-[#090A0F] text-zinc-950 dark:text-[#F4F4F6] select-text">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-[#222634]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-semibold tracking-wider text-blue-700 dark:text-blue-400 uppercase">
                Digital SAT Academic Workspace
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 dark:text-[#F4F4F6] mt-0.5">
              Study Dashboard & Performance
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-[#8E95A5] mt-1">
              Calibrated reading stimuli, multistage pacing analytics, and targeted skill drills.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] hover:bg-zinc-100 dark:hover:bg-[#181B24] text-zinc-600 dark:text-[#8E95A5] hover:text-rose-600 dark:hover:text-rose-400 font-medium text-xs transition-colors duration-150 cursor-pointer"
              title="Reset All Progress"
            >
              <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Reset</span>
            </button>

            <button
              onClick={onOpenQuestionBank}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 font-semibold text-xs transition-colors duration-150 cursor-pointer"
            >
              <Layers className="w-4 h-4" strokeWidth={1.75} />
              <span>Question Bank Filter</span>
            </button>
          </div>
        </div>

        {/* Actionable Resume Practice Cards (Solid surfaces, high-contrast, zero AI slop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Active Reading & Writing Module Card */}
          <div className="p-6 rounded-xl border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[10px] font-mono font-semibold uppercase tracking-wider">
                  <span>Section 1 • Reading & Writing</span>
                </div>
                <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-[#F4F4F6] mt-2">
                  Official R&W Question Bank
                </h2>
                <p className="text-xs text-zinc-600 dark:text-[#8E95A5] mt-1 leading-relaxed">
                  Craft & Structure, Information & Ideas, Expression of Ideas, Standard English Conventions.
                </p>
              </div>
              <BookOpen className="w-5 h-5 text-blue-700 dark:text-blue-400 shrink-0" strokeWidth={1.75} />
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-[#181B24]">
              <div className="flex justify-between text-xs font-mono tabular-nums text-zinc-600 dark:text-[#8E95A5]">
                <span>{rwSolved} of {totalRWQuestions} questions solved</span>
                <span className="font-semibold text-zinc-950 dark:text-[#F4F4F6]">{rwSolvedPercent}% Completed</span>
              </div>
              <div className="w-full h-2 bg-zinc-100 dark:bg-[#181B24] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-700 dark:bg-blue-600 transition-all duration-500 ease-out"
                  style={{ width: `${rwSolvedPercent}%` }}
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500 dark:text-[#8E95A5] font-mono">
                  {analytics.correct} correct • {analytics.wrong} incorrect
                </span>
                <button
                  onClick={onOpenQuestionBank}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-150 cursor-pointer"
                >
                  <span>Resume Practice</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Math Card (Solid secondary surface) */}
          <div className="p-6 rounded-xl border border-zinc-200 dark:border-[#222634] bg-zinc-50/60 dark:bg-[#0e1017] shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#181B24] text-zinc-600 dark:text-[#8E95A5] text-[10px] font-mono font-semibold uppercase tracking-wider">
                  <span>Section 2 • Mathematics</span>
                  <span className="text-zinc-400 dark:text-zinc-600">|</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">Planned Q4</span>
                </div>
                <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-[#F4F4F6] mt-2">
                  Math Module (Calculator & Desmos)
                </h2>
                <p className="text-xs text-zinc-500 dark:text-[#8E95A5] mt-1 leading-relaxed">
                  Algebra, Advanced Math, Problem-Solving & Data Analysis, Geometry & Trigonometry.
                </p>
              </div>
              <Target className="w-5 h-5 text-zinc-400 dark:text-[#8E95A5] shrink-0" strokeWidth={1.75} />
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-200/60 dark:border-[#181B24]">
              <div className="flex justify-between text-xs font-mono tabular-nums text-zinc-500 dark:text-[#8E95A5]">
                <span>0 of 0 solved (0%)</span>
                <span>Module Inactive</span>
              </div>
              <div className="w-full h-2 bg-zinc-200/70 dark:bg-[#181B24] rounded-full overflow-hidden" />
              <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-400 dark:text-[#8E95A5] font-mono">
                <span>Integrated Desmos Graphing Calculator ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Metric Grid (Unified 1px hairline borders, p-5 padding, tabular-nums) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* Metric 1: Projected R&W Score */}
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] shadow-xs flex flex-col justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-[#8E95A5] flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" strokeWidth={1.75} />
              <span>Projected R&W Score</span>
            </span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums text-zinc-950 dark:text-[#F4F4F6]">
                {projectedRWScore}
              </span>
              <span className="text-xs font-mono text-zinc-400">/ 800</span>
            </div>
            <span className="mt-1 text-[11px] font-mono text-zinc-500 dark:text-[#8E95A5]">
              {analytics.attempted > 0 ? 'Official College Board Scale' : 'Initial Baseline'}
            </span>
          </div>

          {/* Metric 2: Accuracy Rate */}
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] shadow-xs flex flex-col justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-[#8E95A5] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} />
              <span>Overall Accuracy</span>
            </span>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums text-zinc-950 dark:text-[#F4F4F6]">
                {analytics.accuracy}%
              </span>
            </div>
            <span className="mt-1 text-[11px] font-mono text-zinc-500 dark:text-[#8E95A5]">
              {analytics.correct} correct of {analytics.attempted}
            </span>
          </div>

          {/* Metric 3: Questions Solved */}
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] shadow-xs flex flex-col justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-[#8E95A5] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-zinc-500 dark:text-[#8E95A5]" strokeWidth={1.75} />
              <span>Completed Questions</span>
            </span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums text-zinc-950 dark:text-[#F4F4F6]">
                {analytics.attempted}
              </span>
              <span className="text-xs font-mono text-zinc-400">/ {totalRWQuestions}</span>
            </div>
            <span className="mt-1 text-[11px] font-mono text-zinc-500 dark:text-[#8E95A5]">
              {totalRWQuestions - analytics.attempted} remaining in bank
            </span>
          </div>

          {/* Metric 4: Daily Study Streak */}
          <div className="p-5 rounded-xl border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] shadow-xs flex flex-col justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-[#8E95A5] flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.75} />
              <span>Daily Study Streak</span>
            </span>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums text-zinc-950 dark:text-[#F4F4F6]">
                {analytics.streak}
              </span>
              <span className="text-sm font-medium text-zinc-600 dark:text-[#8E95A5]">
                {analytics.streak === 1 ? 'day' : 'days'}
              </span>
            </div>
            <span className="mt-1 text-[11px] font-mono text-zinc-500 dark:text-[#8E95A5]">
              {analytics.savedCount} saved questions
            </span>
          </div>
        </div>

        {/* 10-day Activity Trend Chart */}
        <ActivityTrendChart activityTrend={activityTrend} maxTrendDay={maxTrendDay} />

        {/* Domain & Skill Mastery Breakdown */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg text-zinc-950 dark:text-[#F4F4F6] tracking-tight">
              Domain & Skill Mastery Breakdown
            </h3>
            <p className="text-xs text-zinc-600 dark:text-[#8E95A5]">
              Select specific skills to launch focused practice drills with calibrated timer pacing.
            </p>
          </div>

          <div className="space-y-4">
            {DOMAINS_CONFIG.map((domain) => (
              <div 
                key={domain.name}
                className="p-5 rounded-xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] shadow-xs space-y-4"
              >
                {/* Domain Header Pill */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-[#181B24]">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded text-xs font-semibold border ${domain.badgeColor}`}>
                      {domain.name}
                    </span>
                    <span className="text-xs font-mono text-zinc-500 dark:text-[#8E95A5] hidden sm:inline">
                      {domain.skills.length} Focused Skills
                    </span>
                  </div>
                </div>

                {/* Skills Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {domain.skills.map((skillName) => {
                    const stat = skillStatsMap[skillName] || { attempted: 0, correct: 0, wrong: 0, timeSeconds: 0 };
                    const totalInBank = skillQuestionCounts[skillName] || 0;
                    const accuracy = stat.attempted > 0 ? Math.round((stat.correct / stat.attempted) * 100) : 0;

                    return (
                      <div 
                        key={skillName}
                        className="p-4 rounded-lg border border-zinc-200 dark:border-[#222634] hover:border-zinc-300 dark:hover:border-zinc-700 bg-neutral-50/50 dark:bg-[#0E1017] transition-colors duration-150 flex flex-col justify-between space-y-3"
                      >
                        {/* Top: Donut Gauge + Skill Info */}
                        <div className="flex items-start gap-3">
                          <CircularGauge percent={accuracy} />

                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-xs sm:text-sm text-zinc-950 dark:text-[#F4F4F6] truncate leading-tight" title={skillName}>
                              {skillName}
                            </h4>

                            <div className="mt-1 flex items-center gap-1.5 text-[11px] font-mono text-zinc-500 dark:text-[#8E95A5]">
                              <span>{totalInBank} Qs</span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-3 h-3 text-zinc-400" strokeWidth={1.75} />
                                {formatTimeSpent(stat.timeSeconds)}
                              </span>
                            </div>

                            {/* Green / Red counts badge */}
                            <div className="mt-2 flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
                                <CheckCircle2 className="w-3 h-3" strokeWidth={1.75} />
                                {stat.correct}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                                <XCircle className="w-3 h-3" strokeWidth={1.75} />
                                {stat.wrong}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Practice Button */}
                        <button
                          onClick={() => onStartSkillPractice(skillName, domain.name)}
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md bg-white hover:bg-zinc-100 dark:bg-[#181B24] dark:hover:bg-[#202534] text-zinc-900 dark:text-[#F4F4F6] font-semibold text-xs border border-zinc-200 dark:border-[#222634] transition-colors duration-150 cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current text-blue-700 dark:text-blue-400" />
                          <span>Practice Skill</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Minimal Footer */}
        <footer className="pt-6 pb-4 border-t border-zinc-200 dark:border-[#222634] text-center text-xs font-mono text-zinc-500 dark:text-[#8E95A5]">
          © Oluwole Inuoluwadunsimi 2026 • Digital SAT Academic Workspace
        </footer>
      </div>

      {/* Guarded Reset Progress Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#11131A] rounded-xl max-w-md w-full p-6 shadow-xl border border-zinc-200 dark:border-[#222634] space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-zinc-950 dark:text-[#F4F4F6]">
                    Reset Practice Progress
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-[#8E95A5]">
                    This will reset your recorded answers and domain mastery.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-[#181B24] transition-colors duration-150"
              >
                <X className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>

            <p className="text-xs text-zinc-600 dark:text-[#8E95A5] leading-relaxed">
              Are you sure you want to reset your practice progress? This will permanently clear all recorded attempts, accuracy calculations, domain mastery gauges, and daily study streak. This cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100 dark:border-[#181B24]">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-[#222634] text-zinc-700 dark:text-[#8E95A5] hover:bg-zinc-100 dark:hover:bg-[#181B24] font-medium text-xs transition-colors duration-150 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAllProgress();
                  setIsResetModalOpen(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors duration-150 cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Confirm Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
