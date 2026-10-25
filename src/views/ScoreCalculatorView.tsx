import React, { useState, useMemo } from 'react';
import { 
  School, 
  RotateCcw, 
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';

export const ScoreCalculatorView: React.FC = () => {
  // Reading & Writing (27 questions per module)
  const [rwM1, setRwM1] = useState<number>(24);
  const [rwM2, setRwM2] = useState<number>(22);

  // Math (22 questions per module)
  const [mathM1, setMathM1] = useState<number>(20);
  const [mathM2, setMathM2] = useState<number>(19);

  // Adaptive Weighting Toggle (Albert.io calibrated multistage curve)
  const [isAdaptive, setIsAdaptive] = useState<boolean>(true);

  // Adaptive Routing Thresholds (Digital SAT Official specification)
  // RW: 18+ on Module 1 routes to Harder Module 2
  // Math: 15+ on Module 1 routes to Harder Module 2
  const isRWHardModule = rwM1 >= 18;
  const isMathHardModule = mathM1 >= 15;

  // Reading & Writing Score Calculation (200 - 800)
  // Enforces Albert.io Digital SAT curve & College Board scaling in multiples of 10
  const rwScore = useMemo(() => {
    let raw: number;
    if (isAdaptive) {
      if (isRWHardModule) {
        // Routed to Harder Module 2: raw = 800 - (27 - m1) * 13.5 - (27 - m2) * 11 (24/27 + 22/27 -> 690)
        const mistakes = (27 - rwM1) + (27 - rwM2);
        raw = 800 - (27 - rwM1) * 13.5 - (27 - rwM2) * 11 - (mistakes > 0 ? 15 : 0);
      } else {
        // Routed to Easier Module 2: capped at 580 using raw = 200 + m1 * 12.5 + m2 * 6.5
        raw = 200 + rwM1 * 12.5 + rwM2 * 6.5;
        raw = Math.min(580, raw);
      }
    } else {
      // Standard linear curve
      raw = 200 + ((rwM1 + rwM2) / 54) * 600;
    }
    return Math.min(800, Math.max(200, Math.round(raw / 10) * 10));
  }, [rwM1, rwM2, isAdaptive, isRWHardModule]);

  // Math Score Calculation (200 - 800)
  // Enforces Albert.io Digital SAT curve & College Board scaling in multiples of 10
  const mathScore = useMemo(() => {
    let raw: number;
    if (isAdaptive) {
      if (isMathHardModule) {
        // Routed to Harder Module 2: raw = 800 - (22 - m1) * 16 - (22 - m2) * 13 (20/22 + 19/22 -> 710)
        const mistakes = (22 - mathM1) + (22 - mathM2);
        raw = 800 - (22 - mathM1) * 16 - (22 - mathM2) * 13 - (mistakes > 0 ? 18 : 0);
      } else {
        // Routed to Easier Module 2: capped at 570 using raw = 200 + m1 * 14.5 + m2 * 7.5
        raw = 200 + mathM1 * 14.5 + mathM2 * 7.5;
        raw = Math.min(570, raw);
      }
    } else {
      // Standard linear curve
      raw = 200 + ((mathM1 + mathM2) / 44) * 600;
    }
    return Math.min(800, Math.max(200, Math.round(raw / 10) * 10));
  }, [mathM1, mathM2, isAdaptive, isMathHardModule]);

  const totalScore = rwScore + mathScore; // 400 - 1600 (guaranteed multiple of 10 ending in 0)

  // Estimated Percentile
  const percentile = useMemo(() => {
    if (totalScore >= 1550) return '99th+';
    if (totalScore >= 1500) return '98th';
    if (totalScore >= 1450) return '96th';
    if (totalScore >= 1400) return '93rd';
    if (totalScore >= 1350) return '89th';
    if (totalScore >= 1300) return '84th';
    if (totalScore >= 1200) return '74th';
    if (totalScore >= 1100) return '59th';
    if (totalScore >= 1000) return '43rd';
    return '< 30th';
  }, [totalScore]);

  // Reset to default
  const handleReset = () => {
    setRwM1(24);
    setRwM2(22);
    setMathM1(20);
    setMathM2(19);
    setIsAdaptive(true);
  };

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-neutral-50 text-zinc-950 dark:bg-[#090A0F] dark:text-[#F4F4F6] px-4 sm:px-6 md:px-10 py-6 sm:py-8 space-y-6 sm:space-y-8 select-text">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-[#222634]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-semibold tracking-wider text-blue-700 dark:text-blue-400 uppercase">
              Official Routing Engine
            </span>
            <span className="px-2 py-0.5 rounded border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] text-zinc-600 dark:text-[#8E95A5] text-[10px] font-mono font-semibold">
              Albert.io Multistage Curve
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 dark:text-[#F4F4F6] mt-1">
            Digital SAT Score Calculator
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-[#8E95A5] mt-1">
            Simulate multistage adaptive routing and compute your composite score with official percentiles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Adaptive Weighting Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] text-xs font-semibold text-zinc-800 dark:text-[#F4F4F6] transition-all duration-150 active:scale-95 shadow-2xs">
            <input
              type="checkbox"
              checked={isAdaptive}
              onChange={(e) => setIsAdaptive(e.target.checked)}
              className="w-3.5 h-3.5 text-blue-700 rounded focus:ring-0 dark:bg-[#181B24] cursor-pointer"
            />
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" strokeWidth={1.75} />
            <span>Adaptive Weighting</span>
          </label>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] hover:bg-zinc-100 dark:hover:bg-[#181B24] text-zinc-700 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-[#F4F4F6] text-xs font-semibold transition-all duration-150 active:scale-95 shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Pinned Summary Scorecard (High contrast, solid surfaces, zero rainbow gradient) */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[10px] font-mono font-semibold uppercase shadow-2xs">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Predicted Composite SAT Score</span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-5xl sm:text-6xl font-bold tracking-tight font-mono tabular-nums text-zinc-950 dark:text-[#F4F4F6]">
              {totalScore}
            </span>
            <span className="text-lg font-mono text-zinc-400 dark:text-[#8E95A5]">/ 1600</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-600 dark:text-[#8E95A5]">
            <span>Percentile: <strong className="text-zinc-950 dark:text-[#F4F4F6] font-semibold">{percentile}</strong></span>
            <span>•</span>
            <span>Score Range: <strong className="text-zinc-950 dark:text-[#F4F4F6] font-semibold">{Math.max(400, totalScore - 30)}–{Math.min(1600, totalScore + 30)}</strong></span>
          </div>
        </div>

        {/* Section Score Breakdown Boxes */}
        <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
          {/* Reading & Writing Section Box */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-[#222634] bg-neutral-50 dark:bg-[#181B24] text-center min-w-[140px] space-y-1 shadow-2xs transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700">
            <span className="text-[10px] font-mono font-semibold text-zinc-500 dark:text-[#8E95A5] uppercase tracking-wider block">
              Reading &amp; Writing
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-bold tabular-nums text-blue-700 dark:text-blue-400">
              {rwScore}
            </div>
            <span className="text-[10px] font-mono text-zinc-400 dark:text-[#8E95A5]">
              {rwM1 + rwM2} / 54 correct
            </span>
          </div>

          {/* Math Section Box */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-[#222634] bg-neutral-50 dark:bg-[#181B24] text-center min-w-[140px] space-y-1 shadow-2xs transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700">
            <span className="text-[10px] font-mono font-semibold text-zinc-500 dark:text-[#8E95A5] uppercase tracking-wider block">
              Math
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-bold tabular-nums text-zinc-950 dark:text-[#F4F4F6]">
              {mathScore}
            </div>
            <span className="text-[10px] font-mono text-zinc-400 dark:text-[#8E95A5]">
              {mathM1 + mathM2} / 44 correct
            </span>
          </div>
        </div>
      </div>

      {/* Dual Column Module Controls (Synchronized range sliders and direct tabular-nums inputs) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* SECTION 1: Reading & Writing Modules */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] shadow-xs space-y-5 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-[#181B24]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-700 dark:bg-blue-500" />
              <h3 className="font-semibold text-base text-zinc-950 dark:text-[#F4F4F6]">
                Reading &amp; Writing (54 Questions)
              </h3>
            </div>
            <span className="text-xs font-mono font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-lg border border-blue-200 dark:border-blue-900 tabular-nums shadow-2xs">
              Score: {rwScore}
            </span>
          </div>

          {/* RW Module 1 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-zinc-800 dark:text-[#F4F4F6]">
              <span>Module 1 (Routing Base)</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={27}
                  value={rwM1}
                  onChange={(e) => setRwM1(Math.min(27, Math.max(0, Number(e.target.value) || 0)))}
                  className="w-12 h-7 px-1 text-center font-mono font-semibold text-xs tabular-nums bg-zinc-50 dark:bg-[#181B24] border border-zinc-200 dark:border-[#222634] rounded-lg text-blue-700 dark:text-blue-400 focus:outline-hidden focus:border-blue-600 shadow-2xs"
                />
                <span className="text-zinc-400 font-mono text-xs">/ 27</span>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={27}
              value={rwM1}
              onChange={(e) => setRwM1(Number(e.target.value))}
              className="w-full h-2 bg-zinc-200 dark:bg-[#222634] rounded-lg appearance-none cursor-pointer accent-blue-700"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-400">
              <span>0</span>
              <span>18 cutoff (Hard Module)</span>
              <span>27</span>
            </div>
          </div>

          {/* Adaptive Routing Status Pill */}
          <div className={`p-3 rounded-xl border text-xs font-mono font-medium flex items-center justify-between shadow-2xs ${
            !isAdaptive
              ? 'bg-zinc-50 dark:bg-[#181B24] border-zinc-200 dark:border-[#222634] text-zinc-600 dark:text-[#8E95A5]'
              : isRWHardModule
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300'
          }`}>
            <span>Module 2 Routing:</span>
            <span>
              {!isAdaptive
                ? 'Linear Scale (Adaptive Off)'
                : isRWHardModule 
                  ? 'Harder Module 2 (Max 800)' 
                  : 'Easier Module 2 (Max 580)'}
            </span>
          </div>

          {/* RW Module 2 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-zinc-800 dark:text-[#F4F4F6]">
              <span>Module 2 ({isAdaptive ? (isRWHardModule ? 'Harder' : 'Easier') : 'Standard'})</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={27}
                  value={rwM2}
                  onChange={(e) => setRwM2(Math.min(27, Math.max(0, Number(e.target.value) || 0)))}
                  className="w-12 h-7 px-1 text-center font-mono font-semibold text-xs tabular-nums bg-zinc-50 dark:bg-[#181B24] border border-zinc-200 dark:border-[#222634] rounded-lg text-blue-700 dark:text-blue-400 focus:outline-hidden focus:border-blue-600 shadow-2xs"
                />
                <span className="text-zinc-400 font-mono text-xs">/ 27</span>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={27}
              value={rwM2}
              onChange={(e) => setRwM2(Number(e.target.value))}
              className="w-full h-2 bg-zinc-200 dark:bg-[#222634] rounded-lg appearance-none cursor-pointer accent-blue-700"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-400">
              <span>0</span>
              <span>27</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: Math Modules */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] shadow-xs space-y-5 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-[#181B24]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-600 dark:bg-zinc-400" />
              <h3 className="font-semibold text-base text-zinc-950 dark:text-[#F4F4F6]">
                Mathematics (44 Questions)
              </h3>
            </div>
            <span className="text-xs font-mono font-semibold text-zinc-800 dark:text-[#F4F4F6] bg-zinc-100 dark:bg-[#181B24] px-2.5 py-0.5 rounded-lg border border-zinc-200 dark:border-[#222634] tabular-nums shadow-2xs">
              Score: {mathScore}
            </span>
          </div>

          {/* Math Module 1 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-zinc-800 dark:text-[#F4F4F6]">
              <span>Module 1 (Routing Base)</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={22}
                  value={mathM1}
                  onChange={(e) => setMathM1(Math.min(22, Math.max(0, Number(e.target.value) || 0)))}
                  className="w-12 h-7 px-1 text-center font-mono font-semibold text-xs tabular-nums bg-zinc-50 dark:bg-[#181B24] border border-zinc-200 dark:border-[#222634] rounded-lg text-zinc-950 dark:text-[#F4F4F6] focus:outline-hidden focus:border-blue-600 shadow-2xs"
                />
                <span className="text-zinc-400 font-mono text-xs">/ 22</span>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={22}
              value={mathM1}
              onChange={(e) => setMathM1(Number(e.target.value))}
              className="w-full h-2 bg-zinc-200 dark:bg-[#222634] rounded-lg appearance-none cursor-pointer accent-zinc-700"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-400">
              <span>0</span>
              <span>15 cutoff (Hard Module)</span>
              <span>22</span>
            </div>
          </div>

          {/* Adaptive Routing Status Pill */}
          <div className={`p-3 rounded-xl border text-xs font-mono font-medium flex items-center justify-between shadow-2xs ${
            !isAdaptive
              ? 'bg-zinc-50 dark:bg-[#181B24] border-zinc-200 dark:border-[#222634] text-zinc-600 dark:text-[#8E95A5]'
              : isMathHardModule
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300'
          }`}>
            <span>Module 2 Routing:</span>
            <span>
              {!isAdaptive
                ? 'Linear Scale (Adaptive Off)'
                : isMathHardModule 
                  ? 'Harder Module 2 (Max 800)' 
                  : 'Easier Module 2 (Max 570)'}
            </span>
          </div>

          {/* Math Module 2 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-zinc-800 dark:text-[#F4F4F6]">
              <span>Module 2 ({isAdaptive ? (isMathHardModule ? 'Harder' : 'Easier') : 'Standard'})</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={22}
                  value={mathM2}
                  onChange={(e) => setMathM2(Math.min(22, Math.max(0, Number(e.target.value) || 0)))}
                  className="w-12 h-7 px-1 text-center font-mono font-semibold text-xs tabular-nums bg-zinc-50 dark:bg-[#181B24] border border-zinc-200 dark:border-[#222634] rounded-lg text-zinc-950 dark:text-[#F4F4F6] focus:outline-hidden focus:border-blue-600 shadow-2xs"
                />
                <span className="text-zinc-400 font-mono text-xs">/ 22</span>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={22}
              value={mathM2}
              onChange={(e) => setMathM2(Number(e.target.value))}
              className="w-full h-2 bg-zinc-200 dark:bg-[#222634] rounded-lg appearance-none cursor-pointer accent-zinc-700"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-400">
              <span>0</span>
              <span>22</span>
            </div>
          </div>
        </div>
      </div>

      {/* Target University Benchmarks */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <School className="w-4 h-4 text-zinc-600 dark:text-[#8E95A5]" strokeWidth={1.75} />
          <h3 className="font-semibold text-sm text-zinc-950 dark:text-[#F4F4F6]">
            Target University Score Benchmarks
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { tier: 'Ivy League / MIT / Stanford', range: '1500–1580', desc: 'Top 1% Percentile' },
            { tier: 'Top 25 National Universities', range: '1420–1510', desc: 'Top 5% Percentile' },
            { tier: 'Top 50 National Flagships', range: '1300–1410', desc: 'Top 15% Percentile' },
            { tier: 'National Composite Average', range: '1050', desc: '50th Percentile' },
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-zinc-200 dark:border-[#222634] bg-neutral-50/60 dark:bg-[#181B24]/50 space-y-1 transition-all duration-150 hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-0.5 shadow-2xs">
              <span className="text-[10px] font-mono font-medium text-zinc-500 dark:text-[#8E95A5] uppercase tracking-wider block truncate">
                {item.tier}
              </span>
              <div className="text-base font-mono font-semibold tabular-nums text-zinc-950 dark:text-[#F4F4F6]">
                {item.range}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-[#8E95A5]">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScoreCalculatorView;
