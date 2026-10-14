import React from 'react';

export interface DifficultyItem {
  difficulty: string;
  attempted: number;
  correct: number;
  accuracy: number;
}

interface DifficultyChartProps {
  difficultyBreakdown: DifficultyItem[];
}

export const DifficultyChart: React.FC<DifficultyChartProps> = React.memo(({
  difficultyBreakdown,
}) => {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1522] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
        Difficulty Tier Performance
      </h3>
      <div className="grid grid-cols-3 gap-3 pt-2">
        {difficultyBreakdown.map(diff => (
          <div key={diff.difficulty} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-2 bg-slate-50/50 dark:bg-[#151a24]">
            <span className={`text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${
              diff.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' :
              diff.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
              'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
            }`}>
              {diff.difficulty}
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {diff.accuracy}%
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {diff.attempted} Attempted
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}, (prev, next) => {
  if (prev.difficultyBreakdown.length !== next.difficultyBreakdown.length) return false;
  return prev.difficultyBreakdown.every((d, i) => {
    const n = next.difficultyBreakdown[i];
    return d.difficulty === n.difficulty && d.attempted === n.attempted && d.accuracy === n.accuracy;
  });
});

export default DifficultyChart;
