import React from 'react';
import { Target, Play } from 'lucide-react';
import { CircularGauge } from './CircularGauge';

export interface DomainConfig {
  name: string;
  badgeColor: string;
  skills: string[];
}

interface DomainMasteryBreakdownProps {
  domains: DomainConfig[];
  skillStatsMap: Record<string, { attempted: number; correct: number; wrong: number; timeSeconds: number }>;
  onStartSkillPractice: (skillName: string, domainName: string) => void;
}

export const DomainMasteryBreakdown: React.FC<DomainMasteryBreakdownProps> = React.memo(({
  domains,
  skillStatsMap,
  onStartSkillPractice,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
          Domain Mastery Breakdown
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {domains.map((dom) => {
          let domAttempted = 0;
          let domCorrect = 0;
          dom.skills.forEach(sk => {
            const stat = skillStatsMap[sk];
            if (stat) {
              domAttempted += stat.attempted;
              domCorrect += stat.correct;
            }
          });
          const domPercent = domAttempted > 0 ? Math.round((domCorrect / domAttempted) * 100) : 0;

          return (
            <div 
              key={dom.name}
              className="p-5 rounded-2xl bg-white dark:bg-[#0f1522] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${dom.badgeColor}`}>
                    {dom.name}
                  </span>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1.5">
                    {domAttempted} Questions attempted
                  </div>
                </div>
                <CircularGauge percent={domPercent} size={54} strokeWidth={6} />
              </div>

              {/* Skills List inside Domain */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                {dom.skills.map((sk) => {
                  const s = skillStatsMap[sk] || { attempted: 0, correct: 0, wrong: 0 };
                  const acc = s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : 0;

                  return (
                    <div 
                      key={sk} 
                      className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition group cursor-pointer"
                      onClick={() => onStartSkillPractice(sk, dom.name)}
                    >
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {sk}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold ${
                          acc >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                          acc >= 50 ? 'text-blue-600 dark:text-blue-400' :
                          s.attempted > 0 ? 'text-amber-600 dark:text-amber-400' :
                          'text-slate-400 dark:text-slate-500'
                        }`}>
                          {s.attempted > 0 ? `${acc}%` : '—'}
                        </span>
                        <Play className="w-3 h-3 text-slate-300 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}, (prev, next) => {
  if (prev.onStartSkillPractice !== next.onStartSkillPractice) return false;
  if (prev.domains.length !== next.domains.length) return false;
  // Compare skill stats map keys
  const prevKeys = Object.keys(prev.skillStatsMap);
  const nextKeys = Object.keys(next.skillStatsMap);
  if (prevKeys.length !== nextKeys.length) return false;
  for (const k of prevKeys) {
    const a = prev.skillStatsMap[k];
    const b = next.skillStatsMap[k];
    if (!b || a.attempted !== b.attempted || a.correct !== b.correct || a.wrong !== b.wrong) {
      return false;
    }
  }
  return true;
});

export default DomainMasteryBreakdown;
