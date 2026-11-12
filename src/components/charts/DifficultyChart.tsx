import React from 'react';
import { Layers } from 'lucide-react';

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
    <div className="p-6 rounded-2xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] shadow-xs flex flex-col justify-between h-full space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-base text-zinc-950 dark:text-[#F4F4F6]">
            Difficulty Tier Performance
          </h3>
          <p className="text-xs text-zinc-500 dark:text-[#8E95A5]">
            Accuracy and volume breakdown across question difficulty levels.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 items-stretch pt-1">
        {difficultyBreakdown.map(diff => {
          const isEasy = diff.difficulty.toLowerCase() === 'easy';
          const isMed = diff.difficulty.toLowerCase() === 'medium';

          const badgeClasses = isEasy 
            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
            : isMed
            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
            : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';

          const barColor = isEasy ? 'bg-emerald-500' : isMed ? 'bg-amber-500' : 'bg-rose-500';

          return (
            <div 
              key={diff.difficulty} 
              className="analytics-difficulty-card p-4 rounded-xl border border-zinc-200 dark:border-[#222634] bg-zinc-50/50 dark:bg-[#151822] flex flex-col justify-between text-center transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 space-y-4"
            >
              <div className="space-y-3">
                <div>
                  <span className={`inline-block text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${badgeClasses}`}>
                    {diff.difficulty}
                  </span>
                </div>
                <div className="text-3xl font-mono font-bold tabular-nums text-zinc-950 dark:text-[#F4F4F6]">
                  {diff.accuracy}%
                </div>
                <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${barColor} rounded-full origin-left analytics-progress-bar transition-all duration-500`}
                    style={{ width: `${diff.accuracy}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
                <div className="text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300 tabular-nums">
                  {diff.correct} / {diff.attempted} Correct
                </div>
                <div className="text-[11px] font-mono text-zinc-500 dark:text-[#8E95A5] tabular-nums">
                  {diff.attempted} Attempted
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}, (prev, next) => {
  if (prev.difficultyBreakdown.length !== next.difficultyBreakdown.length) return false;
  return prev.difficultyBreakdown.every((d, i) => {
    const n = next.difficultyBreakdown[i];
    return d.difficulty === n.difficulty && d.attempted === n.attempted && d.accuracy === n.accuracy && d.correct === n.correct;
  });
});

export default DifficultyChart;
