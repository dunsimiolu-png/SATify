import React from 'react';
import { BarChart3 } from 'lucide-react';

export interface DomainAccuracyItem {
  domain: string;
  attempted: number;
  correct: number;
  wrong: number;
  accuracy: number;
}

interface DomainAccuracyComparisonProps {
  domainBreakdown: DomainAccuracyItem[];
}

const RW_DOMAINS = new Set([
  'Craft and Structure',
  'Information and Ideas',
  'Expression of Ideas',
  'Standard English Conventions',
]);

export const DomainAccuracyComparison: React.FC<DomainAccuracyComparisonProps> = React.memo(({
  domainBreakdown,
}) => {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] shadow-xs flex flex-col justify-between h-full space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-base text-zinc-950 dark:text-[#F4F4F6]">
            Domain Accuracy Comparison
          </h3>
          <p className="text-xs text-zinc-500 dark:text-[#8E95A5]">
            Mastery distribution across official Digital SAT domains.
          </p>
        </div>
      </div>

      <div className="space-y-3.5 flex-1 pt-1">
        {domainBreakdown.map(d => {
          const isRW = RW_DOMAINS.has(d.domain);
          return (
            <div key={d.domain} className="analytics-domain-row space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border shrink-0 ${
                    isRW
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                      : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
                  }`}>
                    {isRW ? 'R&W' : 'Math'}
                  </span>
                  <span className="truncate" title={d.domain}>{d.domain}</span>
                </div>
                <div className="font-mono tabular-nums text-xs shrink-0 ml-2">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">{d.accuracy}%</span>{' '}
                  <span className="text-zinc-400 dark:text-zinc-500 font-normal">({d.attempted} Qs)</span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full origin-left analytics-progress-bar transition-all duration-500 ${
                    d.attempted === 0
                      ? 'bg-zinc-300 dark:bg-zinc-700'
                      : isRW
                      ? 'bg-gradient-to-r from-blue-600 to-sky-500 dark:from-blue-500 dark:to-sky-400'
                      : 'bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-500 dark:to-violet-400'
                  }`}
                  style={{ width: `${d.accuracy}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}, (prev, next) => {
  if (prev.domainBreakdown.length !== next.domainBreakdown.length) return false;
  return prev.domainBreakdown.every((d, i) => {
    const n = next.domainBreakdown[i];
    return d.domain === n.domain && d.attempted === n.attempted && d.accuracy === n.accuracy;
  });
});

export default DomainAccuracyComparison;
