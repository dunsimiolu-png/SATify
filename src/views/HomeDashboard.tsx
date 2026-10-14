import React, { useMemo, useState, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Flame, 
  Bookmark, 
  Target, 
  Play, 
  Layers, 
  RotateCcw,
  AlertTriangle,
  X
} from 'lucide-react';
import { MockQuestion } from '../types/quiz';
import { 
  getQuestionAnalytics, 
  getSkillStatsMap, 
  get10DayActivityTrend,
  clearAllProgress
} from '../utils/storage';
import { Logo } from '../components/Logo';
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
    badgeColor: 'border-amber-200 bg-amber-50 text-amber-800',
    skills: ['Words in Context', 'Text Structure and Purpose', 'Cross-Text Connections'],
  },
  {
    name: 'Information and Ideas',
    badgeColor: 'border-sky-200 bg-sky-50 text-sky-800',
    skills: ['Central Ideas and Details', 'Command of Evidence', 'Inferences'],
  },
  {
    name: 'Expression of Ideas',
    badgeColor: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    skills: ['Rhetorical Synthesis', 'Transitions'],
  },
  {
    name: 'Standard English Conventions',
    badgeColor: 'border-blue-200 bg-blue-50 text-blue-800',
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

  // Live storage update listener for real-time sync
  useEffect(() => {
    const handleUpdate = () => setStorageVersion(prev => prev + 1);
    window.addEventListener('satify_storage_update', handleUpdate);
    return () => window.removeEventListener('satify_storage_update', handleUpdate);
  }, []);

  const analytics = useMemo(() => getQuestionAnalytics(), [storageVersion]);
  const skillStatsMap = useMemo(() => getSkillStatsMap(), [storageVersion]);
  const activityTrend = useMemo(() => get10DayActivityTrend(), [storageVersion]);

  // Compute skill question counts from extracted bank
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

  // Max count for activity trend chart height calculation
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
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-[#f8fafc] text-gray-900 select-text">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <Logo size="md" variant="full" inverted={false} />
            <div className="h-8 w-px bg-gray-200 hidden sm:block" />
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                Digital SAT Study Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Master Reading & Writing with authentic question types, live analytics, and targeted skill drills.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-200 hover:border-rose-300 hover:bg-rose-50 text-gray-600 hover:text-rose-600 font-bold text-xs shadow-2xs transition active:scale-95 cursor-pointer"
              title="Reset All Progress"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Progress</span>
            </button>

            <button
              onClick={onOpenQuestionBank}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0050d8] hover:bg-[#003da6] text-white font-bold text-sm shadow-md hover:shadow-lg transition active:scale-95 cursor-pointer w-fit"
            >
              <Layers className="w-4 h-4" />
              <span>Custom Question Bank</span>
            </button>
          </div>
        </div>

        {/* 1. Section Progress Cards: Blue RW & Blue Math Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Blue Reading & Writing Progress Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white shadow-md shadow-blue-500/20">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-xs text-xs font-bold uppercase tracking-wider">
                  Section 1
                </span>
                <h2 className="text-xl font-extrabold text-white">Reading & Writing</h2>
                <p className="text-xs text-blue-100">
                  Craft, Information, Expression & Standard English Conventions
                </p>
              </div>
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs font-bold text-blue-100">
                <span>{rwSolved} of {totalRWQuestions} solved</span>
                <span>{rwSolvedPercent}% Completed</span>
              </div>
              <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${rwSolvedPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Blue Math Card: Showing "0 of 0 solved (0%)" since Math is not added yet */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0050d8] to-[#003087] p-6 text-white shadow-md shadow-blue-500/20">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-xs text-xs font-bold uppercase tracking-wider">
                    Section 2
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-400 text-amber-950 text-[10px] font-extrabold uppercase tracking-wider">
                    Coming Soon
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-white">Math</h2>
                <p className="text-xs text-blue-100">
                  Algebra, Advanced Math, Problem-Solving & Geometry
                </p>
              </div>
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs font-bold text-blue-100">
                <span>0 of 0 solved (0%)</span>
                <span>Module Inactive</span>
              </div>
              <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-white/30 rounded-full"
                  style={{ width: `0%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. The 4 Question Analytics Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stat 1: Questions Attempted */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-blue-50 text-[#0050d8]">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900 leading-none">
                {analytics.attempted}
              </div>
              <div className="text-xs font-medium text-gray-500 mt-1">
                Questions Attempted
              </div>
            </div>
          </div>

          {/* Stat 2: Current Accuracy % */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900 leading-none">
                {analytics.accuracy}%
              </div>
              <div className="text-xs font-medium text-gray-500 mt-1">
                Current Accuracy
              </div>
            </div>
          </div>

          {/* Stat 3: Saved Questions */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-amber-50 text-amber-600">
              <Bookmark className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900 leading-none">
                {analytics.savedCount}
              </div>
              <div className="text-xs font-medium text-gray-500 mt-1">
                Saved Questions
              </div>
            </div>
          </div>

          {/* Stat 4: Daily Study Streak */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-rose-50 text-rose-500">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900 leading-none">
                {analytics.streak} {analytics.streak === 1 ? 'Day' : 'Days'}
              </div>
              <div className="text-xs font-medium text-gray-500 mt-1">
                Daily Study Streak
              </div>
            </div>
          </div>
        </div>

        {/* 3. The 10-day Activity Trend Green/Red Bar Chart (Memoized) */}
        <ActivityTrendChart activityTrend={activityTrend} maxTrendDay={maxTrendDay} />

        {/* 4. Domain & Skill Breakdown Containers with Donut Gauges */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-xl text-gray-900 tracking-tight">
                Domain & Skill Mastery Breakdown
              </h3>
              <p className="text-xs text-gray-500">
                Target specific skills directly with instant gauge analytics and single-click practice.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {DOMAINS_CONFIG.map((domain) => (
              <div 
                key={domain.name}
                className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-4"
              >
                {/* Domain Header Pill */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${domain.badgeColor}`}>
                      {domain.name}
                    </span>
                    <span className="text-xs text-gray-400 font-medium hidden sm:inline">
                      {domain.skills.length} Focused Skills
                    </span>
                  </div>
                </div>

                {/* Skills Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {domain.skills.map((skillName) => {
                    const stat = skillStatsMap[skillName] || { attempted: 0, correct: 0, wrong: 0, timeSeconds: 0 };
                    const totalInBank = skillQuestionCounts[skillName] || 0;
                    const accuracy = stat.attempted > 0 ? Math.round((stat.correct / stat.attempted) * 100) : 0;

                    return (
                      <div 
                        key={skillName}
                        className="p-4 rounded-xl border border-gray-200/70 hover:border-blue-400 bg-white hover:shadow-sm transition-all flex flex-col justify-between space-y-4 group"
                      >
                        {/* Top: Donut Gauge + Skill Info */}
                        <div className="flex items-start gap-3.5">
                          <CircularGauge percent={accuracy} />

                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-gray-900 leading-snug truncate group-hover:text-[#0050d8] transition-colors" title={skillName}>
                              {skillName}
                            </h4>

                            <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500">
                              <span>{totalInBank} questions</span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-3 h-3 text-gray-400" />
                                {formatTimeSpent(stat.timeSeconds)}
                              </span>
                            </div>

                            {/* Green / Red counts badge */}
                            <div className="mt-2 flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                {stat.correct}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                <XCircle className="w-3 h-3 text-rose-500" />
                                {stat.wrong}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Practice Button */}
                        <button
                          onClick={() => onStartSkillPractice(skillName, domain.name)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-gray-50 hover:bg-[#0050d8] text-gray-700 hover:text-white font-extrabold text-xs uppercase tracking-wider transition-all border border-gray-200 hover:border-[#0050d8] active:scale-98 cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Practice</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-8 pb-4 border-t border-gray-200 dark:border-slate-800 text-center text-xs text-gray-500 dark:text-slate-400 font-medium">
          © Oluwole Inuoluwadunsimi 2026
        </footer>
      </div>

      {/* Guarded Reset Progress Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-gray-900">
                    Reset All Progress?
                  </h3>
                  <p className="text-xs text-gray-500">
                    This action will reset your stats to zero.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to reset your practice progress? This will permanently clear all recorded attempts, accuracy calculations, domain mastery gauges, and daily study streak. This cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAllProgress();
                  setIsResetModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition cursor-pointer active:scale-95 flex items-center gap-1.5"
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
