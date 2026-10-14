import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  School, 
  RotateCcw, 
  SlidersHorizontal 
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
        // Routed to Harder Module 2: raw = 800 - (27 - m1) * 13.5 - (27 - m2) * 11
        raw = 800 - (27 - rwM1) * 13.5 - (27 - rwM2) * 11;
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
        // Routed to Harder Module 2: raw = 800 - (22 - m1) * 16 - (22 - m2) * 13
        raw = 800 - (22 - mathM1) * 16 - (22 - mathM2) * 13;
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
    <div className="w-full h-full overflow-y-auto bg-slate-50 text-slate-900 dark:bg-[#0b0e14] dark:text-white px-6 py-8 md:px-10 space-y-8 select-text">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Digital SAT Score Calculator
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0050d8] dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 text-xs font-bold border border-blue-200">
              Albert.io Calibrated Curve
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Simulate official multistage adaptive routing and calculate your predicted SAT section and total scores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Adaptive Weighting Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none px-3.5 py-2 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/40 text-xs font-bold text-[#0050d8] dark:text-blue-300 transition hover:bg-blue-100 dark:hover:bg-blue-900/40 shadow-2xs">
            <input
              type="checkbox"
              checked={isAdaptive}
              onChange={(e) => setIsAdaptive(e.target.checked)}
              className="w-4 h-4 text-[#0050d8] rounded focus:ring-0 cursor-pointer"
            />
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Adaptive Weighting</span>
          </label>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#151a24] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1e2535] text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Scores</span>
          </button>
        </div>
      </div>

      {/* Main Total Score Banner Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0b0e14] via-[#101726] to-[#0050d8] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-blue-900/40">
        <div className="space-y-3 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Estimated Digital SAT Total</span>
          </div>
          <div className="text-6xl md:text-7xl font-black text-white tracking-tight flex items-baseline justify-center md:justify-start gap-3">
            <span>{totalScore}</span>
            <span className="text-xl md:text-2xl font-bold text-gray-400">/ 1600</span>
          </div>
          <p className="text-xs text-blue-200/80 font-medium">
            National Percentile: <strong className="text-white font-bold">{percentile} Percentile</strong> • Score Range: {Math.max(400, totalScore - 30)} - {Math.min(1600, totalScore + 30)}
          </p>
          <p className="text-[11px] text-blue-300/70 italic">
            * Note: Section scores strictly scale in increments of 10 (200–800) and total scores (400–1600) always end in 0. Adaptive weighting incorporates Albert.io official routing curves.
          </p>
        </div>

        {/* Section Score Breakdown Pills */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-center">
          {/* Reading & Writing Section Box */}
          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[145px] space-y-1">
            <span className="text-[11px] font-extrabold text-blue-200 uppercase tracking-wider block">
              Reading &amp; Writing
            </span>
            <div className="text-3xl font-black text-white">
              {rwScore}
            </div>
            <span className="text-[10px] text-blue-200/80 font-mono">
              / 800 ({rwM1 + rwM2}/54 correct)
            </span>
          </div>

          {/* Math Section Box */}
          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[145px] space-y-1">
            <span className="text-[11px] font-extrabold text-sky-300 uppercase tracking-wider block">
              Math
            </span>
            <div className="text-3xl font-black text-white">
              {mathScore}
            </div>
            <span className="text-[10px] text-sky-200/80 font-mono">
              / 800 ({mathM1 + mathM2}/44 correct)
            </span>
          </div>
        </div>
      </div>

      {/* Sliders Grid: RW Modules & Math Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 1: Reading & Writing Modules */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1522] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600" />
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                Reading &amp; Writing (54 Qs)
              </h3>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800 px-2.5 py-1 rounded-full border border-blue-200">
              Subscore: {rwScore}
            </span>
          </div>

          {/* RW Module 1 */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Module 1 (Routing Base)</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={27}
                  value={rwM1}
                  onChange={(e) => setRwM1(Math.min(27, Math.max(0, Number(e.target.value) || 0)))}
                  className="w-14 px-2 py-1 text-center font-mono font-bold text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-slate-400 font-mono text-xs">/ 27</span>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={27}
              value={rwM1}
              onChange={(e) => setRwM1(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>0 correct</span>
              <span>18 cutoff (Hard routing)</span>
              <span>27 correct</span>
            </div>
          </div>

          {/* Adaptive Routing Status Pill */}
          <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
            !isAdaptive
              ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              : isRWHardModule
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
          }`}>
            <span>Module 2 Adaptive Path:</span>
            <span>
              {!isAdaptive
                ? 'Adaptive Off (Standard Linear Scale)'
                : isRWHardModule 
                  ? 'Routed to Harder Module 2 (Max 800)' 
                  : 'Routed to Easier Module 2 (Max 580)'}
            </span>
          </div>

          {/* RW Module 2 */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Module 2 ({isAdaptive ? (isRWHardModule ? 'Harder' : 'Easier') : 'Standard'})</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={27}
                  value={rwM2}
                  onChange={(e) => setRwM2(Math.min(27, Math.max(0, Number(e.target.value) || 0)))}
                  className="w-14 px-2 py-1 text-center font-mono font-bold text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-slate-400 font-mono text-xs">/ 27</span>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={27}
              value={rwM2}
              onChange={(e) => setRwM2(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>0 correct</span>
              <span>27 correct</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: Math Modules */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1522] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#0050d8]" />
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                Math (44 Qs)
              </h3>
            </div>
            <span className="text-xs font-bold text-[#0050d8] dark:text-sky-300 bg-blue-50 dark:bg-blue-950/50 dark:border-blue-800 px-2.5 py-1 rounded-full border border-blue-200">
              Subscore: {mathScore}
            </span>
          </div>

          {/* Math Module 1 */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Module 1 (Routing Base)</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={22}
                  value={mathM1}
                  onChange={(e) => setMathM1(Math.min(22, Math.max(0, Number(e.target.value) || 0)))}
                  className="w-14 px-2 py-1 text-center font-mono font-bold text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-[#0050d8] dark:text-sky-400 focus:outline-none focus:ring-1 focus:ring-[#0050d8]"
                />
                <span className="text-slate-400 font-mono text-xs">/ 22</span>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={22}
              value={mathM1}
              onChange={(e) => setMathM1(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0050d8]"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>0 correct</span>
              <span>15 cutoff (Hard routing)</span>
              <span>22 correct</span>
            </div>
          </div>

          {/* Adaptive Routing Status Pill */}
          <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
            !isAdaptive
              ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              : isMathHardModule
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
          }`}>
            <span>Module 2 Adaptive Path:</span>
            <span>
              {!isAdaptive
                ? 'Adaptive Off (Standard Linear Scale)'
                : isMathHardModule 
                  ? 'Routed to Harder Module 2 (Max 800)' 
                  : 'Routed to Easier Module 2 (Max 570)'}
            </span>
          </div>

          {/* Math Module 2 */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Module 2 ({isAdaptive ? (isMathHardModule ? 'Harder' : 'Easier') : 'Standard'})</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={22}
                  value={mathM2}
                  onChange={(e) => setMathM2(Math.min(22, Math.max(0, Number(e.target.value) || 0)))}
                  className="w-14 px-2 py-1 text-center font-mono font-bold text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-[#0050d8] dark:text-sky-400 focus:outline-none focus:ring-1 focus:ring-[#0050d8]"
                />
                <span className="text-slate-400 font-mono text-xs">/ 22</span>
              </div>
            </div>
            <input
              type="range"
              min={0}
              max={22}
              value={mathM2}
              onChange={(e) => setMathM2(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0050d8]"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>0 correct</span>
              <span>22 correct</span>
            </div>
          </div>
        </div>
      </div>

      {/* College Target Comparison Tiers */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <School className="w-5 h-5 text-[#0050d8] dark:text-sky-400" />
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            Target University Score Benchmarks
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { tier: 'Ivy League / MIT / Stanford', range: '1500 - 1580', desc: 'Highly Competitive (Top 1%)' },
            { tier: 'Top 25 National Universities', range: '1420 - 1510', desc: 'Very Competitive (Top 5%)' },
            { tier: 'Top 50 / Major Flagships', range: '1300 - 1410', desc: 'Competitive (Top 15%)' },
            { tier: 'National Average', range: '1050', desc: '50th Percentile' },
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#151a24] space-y-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                {item.tier}
              </span>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {item.range}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
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
