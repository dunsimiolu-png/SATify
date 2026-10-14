import React from 'react';
import { TrendingUp } from 'lucide-react';
import { DayActivity } from '../../utils/storage';

interface ActivityTrendChartProps {
  activityTrend: DayActivity[];
  maxTrendDay: number;
}

export const ActivityTrendChart: React.FC<ActivityTrendChartProps> = React.memo(({
  activityTrend,
  maxTrendDay,
}) => {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1522] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            10-Day Activity Trend
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-500" />
            <span>Correct</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-rose-500" />
            <span>Incorrect</span>
          </div>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="h-44 w-full flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800">
        {activityTrend.map((day, idx) => {
          const heightPercent = day.total > 0 ? Math.max(15, (day.total / maxTrendDay) * 100) : 4;
          const correctPercent = day.total > 0 ? (day.correct / day.total) * 100 : 0;
          const wrongPercent = 100 - correctPercent;

          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              {/* Count tooltip on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-slate-800 text-white text-[10px] py-0.5 px-1.5 rounded-sm pointer-events-none whitespace-nowrap shadow-xs font-mono">
                {day.total} {day.total === 1 ? 'Q' : 'Qs'} ({day.correct} ✓)
              </div>

              {/* Stacked Colored Bar */}
              <div 
                className="w-full max-w-[28px] rounded-t-md overflow-hidden flex flex-col justify-end transition-all duration-300"
                style={{ height: `${heightPercent}%` }}
              >
                {day.total > 0 ? (
                  <>
                    <div 
                      style={{ height: `${wrongPercent}%` }} 
                      className="w-full bg-rose-500 transition-all"
                      title={`${day.wrong} incorrect`}
                    />
                    <div 
                      style={{ height: `${correctPercent}%` }} 
                      className="w-full bg-emerald-500 transition-all"
                      title={`${day.correct} correct`}
                    />
                  </>
                ) : (
                  <div className="w-full h-full bg-slate-200 dark:bg-slate-800 rounded-t-md" />
                )}
              </div>

              {/* Date Label */}
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {day.label}
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
