import React from 'react';

interface CircularGaugeProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
}

export const CircularGauge: React.FC<CircularGaugeProps> = React.memo(({
  percent,
  size = 68,
  strokeWidth = 7,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  const strokeColor = percent >= 80 
    ? '#10b981' // emerald
    : percent >= 50 
      ? '#2563eb' // royal blue
      : percent > 0 
        ? '#f59e0b' // amber
        : '#e2e8f0'; // slate-200

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
          className="dark:stroke-slate-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
        <span className="text-xs font-black text-slate-800 dark:text-white leading-none">
          {percent}%
        </span>
      </div>
    </div>
  );
}, (prev, next) => prev.percent === next.percent && prev.size === next.size && prev.strokeWidth === next.strokeWidth);

export default CircularGauge;
