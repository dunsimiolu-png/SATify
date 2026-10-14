import React, { useState, useMemo, useEffect } from 'react';
import { 
  AlertTriangle, 
  Play,
  RotateCcw,
  X
} from 'lucide-react';
import { MockQuestion } from '../types/quiz';
import { getAttempts, clearAllProgress } from '../utils/storage';

interface AnalyticsViewProps {
  questions?: MockQuestion[];
  onStartSkillPractice: (skillName: string, domainName: string) => void;
}

type TimeframeFilter = 'all' | '30d' | '7d' | 'today';

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  questions: _questions,
  onStartSkillPractice,
}) => {
  const [timeframe, setTimeframe] = useState<TimeframeFilter>('all');
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
  const filteredAnswers = useMemo(() => {
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

  // Overall stats for timeframe
  const totalAttempted = filteredAnswers.length;
  const totalCorrect = filteredAnswers.filter(a => a.isCorrect).length;
  const totalWrong = totalAttempted - totalCorrect;
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  const avgTimeSeconds = totalAttempted > 0
    ? Math.round(filteredAnswers.reduce((acc, a) => acc + (a.timeSpentSeconds || 35), 0) / totalAttempted)
    : 0;

  // Domain accuracy breakdown
  const domainBreakdown = useMemo(() => {
    const domains = [
      'Craft and Structure',
      'Information and Ideas',
      'Expression of Ideas',
      'Standard English Conventions',
    ];

    return domains.map(dName => {
      const dAnswers = filteredAnswers.filter(a => a.domain === dName);
      const attempted = dAnswers.length;
      const correct = dAnswers.filter(a => a.isCorrect).length;
      const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
      return {
        domain: dName,
        attempted,
        correct,
        wrong: attempted - correct,
        accuracy,
      };
    });
  }, [filteredAnswers]);

  // Difficulty accuracy breakdown
  const difficultyBreakdown = useMemo(() => {
    const diffs = ['Easy', 'Medium', 'Hard'];
    return diffs.map(diff => {
      const dAnswers = filteredAnswers.filter(a => a.difficulty === diff);
      const attempted = dAnswers.length;
      const correct = dAnswers.filter(a => a.isCorrect).length;
      const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
      return {
        difficulty: diff,
        attempted,
        correct,
        accuracy,
      };
    });
  }, [filteredAnswers]);

  // All 10 skills with statistics
  const skillStats = useMemo(() => {
    const allSkills = [
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

    return allSkills.map(sk => {
      const skAnswers = filteredAnswers.filter(a => a.skill === sk.name);
      const attempted = skAnswers.length;
      const correct = skAnswers.filter(a => a.isCorrect).length;
      const wrong = attempted - correct;
      const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
      return {
        ...sk,
        attempted,
        correct,
        wrong,
        accuracy,
      };
    });
  }, [filteredAnswers]);

  // "5 lowest-accuracy skills" ranked list
  const lowestAccuracySkills = useMemo(() => {
    // Skills with attempts sorted ascending by accuracy; unattempted skills are placed next
    const attemptedSkills = skillStats.filter(s => s.attempted > 0).sort((a, b) => a.accuracy - b.accuracy);
    const unattemptedSkills = skillStats.filter(s => s.attempted === 0);
    return [...attemptedSkills, ...unattemptedSkills].slice(0, 5);
  }, [skillStats]);

  return (
    <div className="w-full h-full overflow-y-auto bg-[#f8fafc] text-gray-900 px-6 py-8 md:px-10 space-y-8 select-text">
      {/* Header & Timeframe Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Performance & Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track historical accuracy, uncover weaknesses, and drill into your 5 lowest-accuracy skills.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 hover:border-rose-300 hover:bg-rose-50 text-gray-600 hover:text-rose-600 font-bold text-xs shadow-2xs transition active:scale-95 cursor-pointer"
            title="Reset All Progress"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Progress</span>
          </button>

          {/* Timeframe Filter Buttons */}
          <div className="inline-flex items-center p-1 bg-white border border-gray-200 rounded-xl shadow-xs">
            {[
              { id: 'all', label: 'All Time' },
              { id: '30d', label: 'Last 30 Days' },
              { id: '7d', label: 'Last 7 Days' },
              { id: 'today', label: 'Today' },
            ].map(btn => (
              <button
                key={btn.id}
                onClick={() => setTimeframe(btn.id as TimeframeFilter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeframe === btn.id
                    ? 'bg-[#0050d8] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-gray-500">Attempted Questions</div>
          <div className="text-2xl font-black text-gray-900">{totalAttempted}</div>
          <div className="text-[11px] text-gray-400">Total answered in period</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-gray-500">Period Accuracy</div>
          <div className="text-2xl font-black text-emerald-600">{overallAccuracy}%</div>
          <div className="text-[11px] text-emerald-700 font-medium">{totalCorrect} correct • {totalWrong} wrong</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-gray-500">Avg Pace / Question</div>
          <div className="text-2xl font-black text-[#0050d8]">{avgTimeSeconds}s</div>
          <div className="text-[11px] text-blue-600 font-medium">College Board benchmark: 71s</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-gray-500">Mastery Level</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {overallAccuracy >= 85 ? 'Advanced' : overallAccuracy >= 65 ? 'Proficient' : 'Developing'}
          </div>
          <div className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">Digital SAT calibrated</div>
        </div>
      </div>

      {/* 5 Lowest-Accuracy Skills Ranked List (Requirement 10) */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900">
                5 Lowest-Accuracy Skills (Recommended Focus)
              </h3>
              <p className="text-xs text-gray-500">
                Prioritize these skills to maximize your Digital SAT Reading & Writing score gains.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {lowestAccuracySkills.map((sk, idx) => {
            const barColor = sk.attempted === 0
              ? 'bg-gray-300'
              : sk.accuracy >= 75
                ? 'bg-emerald-500'
                : sk.accuracy >= 50
                  ? 'bg-amber-500'
                  : 'bg-rose-500';

            return (
              <div 
                key={sk.name}
                className="p-4 rounded-xl border border-gray-200 bg-[#fafafa] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-gray-300 transition"
              >
                {/* Rank & Skill Name */}
                <div className="flex items-center gap-3 min-w-[240px]">
                  <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 leading-tight">
                      {sk.name}
                    </h4>
                    <span className="text-[11px] text-gray-500 font-medium">
                      {sk.domain}
                    </span>
                  </div>
                </div>

                {/* Accuracy Progress Bar */}
                <div className="flex-1 max-w-md space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-gray-600">
                    <span>Accuracy: {sk.attempted > 0 ? `${sk.accuracy}%` : 'Not attempted'}</span>
                    <span>{sk.attempted} questions solved</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${sk.attempted > 0 ? sk.accuracy : 0}%` }}
                    />
                  </div>
                </div>

                {/* Drill Practice Button */}
                <button
                  onClick={() => onStartSkillPractice(sk.name, sk.domain)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#0050d8] hover:bg-[#003da6] text-white font-bold text-xs uppercase tracking-wider transition active:scale-95 shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Drill Skill</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Domain Breakdown & Difficulty Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Breakdown */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-gray-900">
            Domain Accuracy Comparison
          </h3>
          <div className="space-y-4">
            {domainBreakdown.map(d => (
              <div key={d.domain} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-gray-800">
                  <span>{d.domain}</span>
                  <span className="text-[#0050d8]">{d.accuracy}% ({d.attempted} Qs)</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#0050d8] rounded-full transition-all duration-500"
                    style={{ width: `${d.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-gray-900">
            Difficulty Tier Performance
          </h3>
          <div className="grid grid-cols-3 gap-3 pt-2">
            {difficultyBreakdown.map(diff => (
              <div key={diff.difficulty} className="p-4 rounded-xl border border-gray-200 text-center space-y-2 bg-[#fbfbfb]">
                <span className={`text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${
                  diff.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800' :
                  diff.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {diff.difficulty}
                </span>
                <div className="text-2xl font-black text-gray-900">
                  {diff.accuracy}%
                </div>
                <div className="text-[11px] text-gray-500 font-medium">
                  {diff.attempted} Attempted
                </div>
              </div>
            ))}
          </div>
        </div>
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
                    Reset All Analytics & Progress?
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
              Are you sure you want to reset your practice progress? This will permanently clear all recorded attempts, accuracy calculations, domain mastery breakdowns, and daily study streak. This cannot be undone.
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
