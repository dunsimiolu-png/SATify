import React from 'react';

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

export const DomainAccuracyComparison: React.FC<DomainAccuracyComparisonProps> = React.memo(({
  domainBreakdown,
}) => {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1522] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
        Domain Accuracy Comparison
      </h3>
      <div className="space-y-4">
        {domainBreakdown.map(d => (
          <div key={d.domain} className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <span>{d.domain}</span>
              <span className="text-blue-600 dark:text-blue-400">{d.accuracy}% ({d.attempted} Qs)</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${d.accuracy}%` }}
              />
            </div>
          </div>
        ))}
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
