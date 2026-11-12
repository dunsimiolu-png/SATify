import React from 'react';
import { AlertTriangle, Play } from 'lucide-react';

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
}

export const LowestAccuracyList: React.FC<LowestAccuracyListProps> = React.memo(({
  skills,
  onStartSkillPractice,
}) => {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1522] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              5 Lowest-Accuracy Skills (Recommended Focus)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Prioritize these skills to maximize your Digital SAT score gains.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        {skills.map((sk, idx) => {
          const barColor = sk.attempted === 0
            ? 'bg-slate-300 dark:bg-slate-700'
            : sk.accuracy >= 75
              ? 'bg-emerald-500'
              : sk.accuracy >= 50
                ? 'bg-amber-500'
                : 'bg-rose-500';

          return (
            <div 
              key={sk.name}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#151a24] grid grid-cols-1 md:grid-cols-[260px_1fr_130px] items-center gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              {/* Col 1: Rank & Skill Name */}
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 font-extrabold text-xs flex items-center justify-center shrink-0">
                  #{idx + 1}
                </span>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight truncate" title={sk.name}>
                    {sk.name}
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block truncate">
                    {sk.domain}
                  </span>
                </div>
              </div>

              {/* Col 2: Synchronized Horizontal Alignment (Accuracy Label, Bar, Questions Solved) */}
              <div className="grid grid-cols-[90px_1fr_120px] items-center gap-3">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono tabular-nums">
                  Accuracy: {sk.attempted > 0 ? `${sk.accuracy}%` : '—'}
                </span>

                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${barColor} rounded-full transition-all duration-500`}
                    style={{ width: `${sk.attempted > 0 ? sk.accuracy : 0}%` }}
                  />
                </div>

                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 text-right tabular-nums">
                  {sk.attempted} {sk.attempted === 1 ? 'question' : 'questions'} solved
                </span>
              </div>

              {/* Col 3: Drill Practice Button */}
              <button
                onClick={() => onStartSkillPractice(sk.name, sk.domain)}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition active:scale-95 shrink-0 cursor-pointer shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Drill Skill</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}, (prev, next) => {
  if (prev.onStartSkillPractice !== next.onStartSkillPractice) return false;
  if (prev.skills.length !== next.skills.length) return false;
  return prev.skills.every((s, i) => {
    const n = next.skills[i];
    return s.name === n.name && s.attempted === n.attempted && s.accuracy === n.accuracy;
  });
});

export default LowestAccuracyList;
