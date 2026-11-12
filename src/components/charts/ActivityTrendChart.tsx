import React from 'react';
import { TrendingUp, CheckCircle2, XCircle } from 'lucide-react';
import { DayActivity } from '../../utils/storage';

interface ActivityTrendChartProps {
  activityTrend: DayActivity[];
  maxTrendDay: number;
}

export const ActivityTrendChart: React.FC<ActivityTrendChartProps> = React.memo(({
  activityTrend,
  maxTrendDay,
}) => {
  const totalCorrect = activityTrend.reduce((acc, d) => acc + d.correct, 0);
  const totalWrong = activityTrend.reduce((acc, d) => acc + d.wrong, 0);

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-base text-zinc-950 dark:text-[#F4F4F6]">
            10-Day Activity Trend
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold flex-wrap">
          <span className="text-zinc-500 dark:text-[#8E95A5] text-xs font-mono font-medium">Last 10 Days:</span>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>✓ {totalCorrect} Correct</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5" />
            <span>ⓧ {totalWrong} Wrong</span>
          </div>
        </div>
      </div>

      {/* 10-Column CSS Grid Chart */}
      <div className="h-48 w-full grid grid-cols-10 gap-2 sm:gap-3 items-end pt-6 pb-2 border-b border-zinc-100 dark:border-[#181B24]">
        {activityTrend.map((day, idx) => {
          const isToday = idx === 9;
          const dateLabel = isToday ? 'Today' : day.label;
          const accuracy = day.total > 0 ? Math.round((day.correct / day.total) * 100) : 0;
          const heightPercent = day.total > 0 ? Math.min(100, Math.max(16, (day.total / maxTrendDay) * 100)) : 0;
          const correctRatio = day.total > 0 ? (day.correct / day.total) * 100 : 0;
          const wrongRatio = 100 - correctRatio;

          return (
            <div key={day.date || idx} className="flex flex-col items-center gap-2 h-full justify-end group min-w-0 relative">
              {/* Hover tooltip */}
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 dark:bg-zinc-800 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap shadow-lg font-mono z-20 border border-zinc-700">
                {dateLabel}: {day.correct} Correct, {day.wrong} Wrong • {accuracy}%
              </div>

              {/* Full-height subtle background track */}
              <div className="w-full bg-slate-100/70 dark:bg-slate-800/40 rounded-lg h-32 flex flex-col justify-end overflow-hidden p-0.5">
                {day.total > 0 ? (
                  <div 
                    className="w-full rounded-md overflow-hidden flex flex-col justify-end activity-trend-bar origin-bottom transition-all duration-300"
                    style={{ height: `${heightPercent}%` }}
                  >
                    {day.wrong > 0 && (
                      <div 
                        style={{ height: `${wrongRatio}%` }} 
                        className="w-full bg-rose-500"
                      />
                    )}
                    {day.correct > 0 && (
                      <div 
                        style={{ height: `${correctRatio}%` }} 
                        className="w-full bg-emerald-500"
                      />
                    )}
                  </div>
                ) : (
                  <div className="w-full h-1 bg-slate-300 dark:bg-slate-700/60 rounded-full" />
                )}
              </div>

              {/* Date label at bottom */}
              <span className={`text-[11px] sm:text-xs tabular-nums truncate max-w-full text-center transition-colors ${
                isToday 
                  ? 'font-bold text-blue-600 dark:text-blue-400' 
                  : 'text-slate-400 dark:text-[#8E95A5] group-hover:text-zinc-900 dark:group-hover:text-white'
              }`}>
                {dateLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}, (prev, next) => {
  if (prev.maxTrendDay !== next.maxTrendDay) return false;
  if (prev.activityTrend.length !== next.activityTrend.length) return false;
  for (let i = 0; i < prev.activityTrend.length; i++) {
    const a = prev.activityTrend[i];
    const b = next.activityTrend[i];
    if (a.date !== b.date || a.total !== b.total || a.correct !== b.correct || a.wrong !== b.wrong) {
      return false;
    }
  }
  return true;
});

export default ActivityTrendChart;
