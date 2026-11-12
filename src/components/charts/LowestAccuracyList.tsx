import React from 'react';
import { AlertTriangle, Play, Target } from 'lucide-react';

export interface LowestAccuracySkill {
  name: string;
  domain: string;
  attempted: number;
  correct: number;
  wrong: number;
  accuracy: number;
}

interface LowestAccuracyListProps {
  skills: LowestAccuracySkill[];
  onStartSkillPractice: (skillName: string, domainName: string) => void;
  title?: string;
  description?: string;
}

export const LowestAccuracyList: React.FC<LowestAccuracyListProps> = React.memo(({
  skills,
  onStartSkillPractice,
  title = '5 Lowest-Accuracy Skills (Recommended Focus)',
  description = 'Prioritize these skills to maximize your Digital SAT score gains.',
}) => {
  const isBreakdownMode = title.includes('Skill Performance Breakdown');

  const getRankBadgeClasses = (sk: LowestAccuracySkill) => {
    if (sk.attempted === 0) {
      return 'bg-zinc-500/15 text-zinc-500 dark:text-zinc-400 border-zinc-500/30';
    }
    if (sk.accuracy < 60) {
      return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
    }
    if (sk.accuracy < 75) {
      return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
    }
    return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl shrink-0 ${
            isBreakdownMode
              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
          }`}>
            {isBreakdownMode ? <Target className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-semibold text-base text-zinc-950 dark:text-[#F4F4F6]">
              {title}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-[#8E95A5]">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        {skills.map((sk, idx) => {
          const barColor = sk.attempted === 0
            ? 'bg-zinc-300 dark:bg-zinc-700'
            : sk.accuracy >= 75
              ? 'bg-emerald-500'
              : sk.accuracy >= 60
                ? 'bg-amber-500'
                : 'bg-rose-500';

          return (
            <div 
              key={sk.name}
              className="analytics-skill-row p-4 rounded-xl border border-zinc-200 dark:border-[#222634] bg-zinc-50/50 dark:bg-[#151822] grid grid-cols-1 xl:grid-cols-[40px_minmax(260px,1.3fr)_115px_minmax(180px,2fr)_140px_auto] items-center gap-3 xl:gap-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition"
            >
              {/* Col 1: Rank Badge */}
              <div className="flex items-center justify-start xl:justify-center">
                <span className={`w-7 h-7 rounded-full font-mono font-bold text-xs flex items-center justify-center shrink-0 border ${getRankBadgeClasses(sk)}`}>
                  #{idx + 1}
                </span>
              </div>

              {/* Col 2: Skill Title and Domain */}
              <div className="min-w-0 pr-2">
                <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2" title={sk.name}>
                  {sk.name}
                </h4>
                <span className="text-[11px] text-zinc-500 dark:text-[#8E95A5] font-medium block truncate mt-0.5">
                  {sk.domain}
                </span>
              </div>

              {/* Col 3: Accuracy Label */}
              <div className="min-w-[115px]">
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 font-mono tabular-nums whitespace-nowrap">
                  Accuracy: {sk.attempted > 0 ? `${sk.accuracy}%` : '—'}
                </span>
              </div>

              {/* Col 4: Progress Bar */}
              <div className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${barColor} rounded-full origin-left analytics-progress-bar transition-all duration-500`}
                  style={{ width: `${sk.attempted > 0 ? sk.accuracy : 0}%` }}
                />
              </div>

              {/* Col 5: Questions Solved & Low Sample Badge */}
              <div className="flex flex-col items-start xl:items-end justify-center min-w-0">
                <span className="text-xs font-medium text-zinc-600 dark:text-[#8E95A5] text-left xl:text-right tabular-nums whitespace-nowrap">
                  {sk.attempted} {sk.attempted === 1 ? 'question' : 'questions'} solved
                </span>
                {sk.attempted > 0 && sk.attempted < 3 && (
                  <span className="inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 whitespace-nowrap">
                    Low Sample ({sk.attempted} {sk.attempted === 1 ? 'Q' : 'Qs'})
                  </span>
                )}
              </div>

              {/* Col 6: Drill Skill Button */}
              <div className="flex justify-start xl:justify-end">
                <button
                  onClick={() => onStartSkillPractice(sk.name, sk.domain)}
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition active:scale-95 shrink-0 cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Drill Skill</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}, (prev, next) => {
  if (prev.onStartSkillPractice !== next.onStartSkillPractice) return false;
  if (prev.title !== next.title) return false;
  if (prev.description !== next.description) return false;
  if (prev.skills.length !== next.skills.length) return false;
  return prev.skills.every((s, i) => {
    const n = next.skills[i];
    return s.name === n.name && s.attempted === n.attempted && s.accuracy === n.accuracy;
  });
});

export default LowestAccuracyList;
