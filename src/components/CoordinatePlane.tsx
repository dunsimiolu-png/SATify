import React from 'react';

export interface Point {
  x: number;
  y: number;
}

export interface PlottedLine {
  slope?: number;
  intercept?: number; // y-intercept
  points?: [Point, Point]; // Two points defining the line
  color?: string; // High-visibility cyan #38bdf8 or amber #fbbf24
  label?: string;
  dashed?: boolean;
}

export interface PlottedPoint {
  x: number;
  y: number;
  label?: string;
  color?: string;
}

export interface CoordinatePlaneProps {
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  xStep?: number;
  yStep?: number;
  lines?: PlottedLine[];
  points?: PlottedPoint[];
  shadedInequality?: {
    slope: number;
    intercept: number;
    operator: '<' | '<=' | '>' | '>=';
    color?: string;
  };
  title?: string;
  xLabel?: string;
  yLabel?: string;
  className?: string;
}

/**
 * Reusable, theme-aware SVG Coordinate Plane component matching Digital SAT specifications.
 * 
 * Features:
 * - Theme adaptive (Dark Mode: #18181b background, #334155 border, rgba(255,255,255,0.12) gridlines,
 *   #f8fafc primary axes and arrowheads, #cbd5e1 tick labels, #38bdf8 high-visibility cyan plotted lines).
 * - Origin 'O' label.
 * - Arrowheads on both ends of X and Y axes and plotted lines.
 */
export const CoordinatePlane: React.FC<CoordinatePlaneProps> = ({
  xMin = -10,
  xMax = 10,
  yMin = -10,
  yMax = 10,
  xStep = 2,
  yStep = 2,
  lines = [],
  points = [],
  shadedInequality,
  title,
  xLabel = 'x',
  yLabel = 'y',
  className = '',
}) => {
  // SVG Canvas geometry
  const width = 360;
  const height = 360;
  const padding = 36;
  const plotWidth = width - 2 * padding;
  const plotHeight = height - 2 * padding;

  // Coordinate transforms
  const toSvgX = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * plotWidth;
  const toSvgY = (y: number) => padding + ((yMax - y) / (yMax - yMin)) * plotHeight;

  // Origin location
  const originX = toSvgX(0);
  const originY = toSvgY(0);

  // Generate ticks
  const xTicks: number[] = [];
  for (let x = xMin; x <= xMax; x += xStep) {
    if (x !== 0) xTicks.push(x);
  }

  const yTicks: number[] = [];
  for (let y = yMin; y <= yMax; y += yStep) {
    if (y !== 0) yTicks.push(y);
  }

  return (
    <div className={`my-4 flex flex-col items-center select-none ${className}`}>
      {title && (
        <span className="text-xs font-serif font-bold text-slate-800 dark:text-slate-200 mb-2">
          {title}
        </span>
      )}
      <div className="p-3 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-[#334155] rounded-2xl shadow-xs transition-colors">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-[280px] sm:w-[320px] h-[280px] sm:h-[320px] overflow-visible"
        >
          <defs>
            {/* Dark Mode Axis Arrowhead */}
            <marker
              id="axis-arrow"
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 10 5 L 0 8.5 z" className="fill-slate-900 dark:fill-[#f8fafc]" />
            </marker>

            {/* Line Arrowhead */}
            <marker
              id="line-arrow-cyan"
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#38bdf8" />
            </marker>
          </defs>

          {/* Shaded Inequality Region */}
          {shadedInequality && (() => {
            const yAtXMin = shadedInequality.slope * xMin + shadedInequality.intercept;
            const yAtXMax = shadedInequality.slope * xMax + shadedInequality.intercept;
            const isGreater = shadedInequality.operator.startsWith('>');
            const boundaryY = isGreater ? padding : height - padding;
            const pointsStr = `${toSvgX(xMin)},${toSvgY(yAtXMin)} ${toSvgX(xMax)},${toSvgY(yAtXMax)} ${toSvgX(xMax)},${boundaryY} ${toSvgX(xMin)},${boundaryY}`;
            return (
              <g>
                <polygon
                  points={pointsStr}
                  fill={shadedInequality.color || 'rgba(56, 189, 248, 0.2)'}
                />
                <line
                  x1={toSvgX(xMin)}
                  y1={toSvgY(yAtXMin)}
                  x2={toSvgX(xMax)}
                  y2={toSvgY(yAtXMax)}
                  stroke={shadedInequality.color || '#38bdf8'}
                  strokeWidth="2.5"
                  strokeDasharray={shadedInequality.operator.includes('=') ? undefined : '5,5'}
                />
              </g>
            );
          })()}

          {/* 1. Subtle Gridlines */}
          <g className="stroke-slate-200 dark:stroke-white/10" strokeWidth="1">
            {xTicks.map((x) => (
              <line
                key={`grid-x-${x}`}
                x1={toSvgX(x)}
                y1={padding}
                x2={toSvgX(x)}
                y2={height - padding}
              />
            ))}
            {yTicks.map((y) => (
              <line
                key={`grid-y-${y}`}
                x1={padding}
                y1={toSvgY(y)}
                x2={width - padding}
                y2={toSvgY(y)}
              />
            ))}
          </g>

          {/* 2. Primary X and Y Axes with Arrowheads */}
          <g className="stroke-slate-900 dark:stroke-[#f8fafc]" strokeWidth="2">
            {/* X-Axis */}
            <line
              x1={padding - 12}
              y1={originY}
              x2={width - padding + 12}
              y2={originY}
              markerStart="url(#axis-arrow)"
              markerEnd="url(#axis-arrow)"
            />
            {/* Y-Axis */}
            <line
              x1={originX}
              y1={height - padding + 12}
              x2={originX}
              y2={padding - 12}
              markerStart="url(#axis-arrow)"
              markerEnd="url(#axis-arrow)"
            />
          </g>

          {/* 3. Axis Labels & Origin 'O' */}
          <text
            x={width - padding + 18}
            y={originY + 4}
            className="text-[13px] font-serif italic font-bold fill-slate-900 dark:fill-[#f8fafc]"
            textAnchor="start"
          >
            {xLabel}
          </text>
          <text
            x={originX}
            y={padding - 18}
            className="text-[13px] font-serif italic font-bold fill-slate-900 dark:fill-[#f8fafc]"
            textAnchor="middle"
          >
            {yLabel}
          </text>
          <text
            x={originX - 10}
            y={originY + 14}
            className="text-[11px] font-serif font-bold fill-slate-600 dark:fill-[#cbd5e1]"
            textAnchor="end"
          >
            O
          </text>

          {/* 4. Tick Labels */}
          <g className="fill-slate-600 dark:fill-[#cbd5e1] text-[10px] font-mono font-medium">
            {xTicks.map((x) => (
              <text
                key={`tick-x-${x}`}
                x={toSvgX(x)}
                y={originY + 14}
                textAnchor="middle"
              >
                {x}
              </text>
            ))}
            {yTicks.map((y) => (
              <text
                key={`tick-y-${y}`}
                x={originX - 6}
                y={toSvgY(y) + 3}
                textAnchor="end"
              >
                {y}
              </text>
            ))}
          </g>

          {/* 5. Plotted Lines */}
          {lines.map((l, idx) => {
            let x1 = xMin;
            let y1 = 0;
            let x2 = xMax;
            let y2 = 0;

            if (l.points) {
              const [p1, p2] = l.points;
              const slope = (p2.y - p1.y) / (p2.x - p1.x);
              const b = p1.y - slope * p1.x;
              x1 = xMin;
              y1 = slope * xMin + b;
              x2 = xMax;
              y2 = slope * xMax + b;
            } else if (typeof l.slope === 'number' && typeof l.intercept === 'number') {
              x1 = xMin;
              y1 = l.slope * xMin + l.intercept;
              x2 = xMax;
              y2 = l.slope * xMax + l.intercept;
            }

            return (
              <g key={`plotted-line-${idx}`}>
                <line
                  x1={toSvgX(x1)}
                  y1={toSvgY(y1)}
                  x2={toSvgX(x2)}
                  y2={toSvgY(y2)}
                  stroke={l.color || '#38bdf8'}
                  strokeWidth="2.5"
                  strokeDasharray={l.dashed ? '5,5' : undefined}
                  markerStart="url(#line-arrow-cyan)"
                  markerEnd="url(#line-arrow-cyan)"
                />
              </g>
            );
          })}

          {/* 6. Plotted Points */}
          {points.map((p, idx) => (
            <g key={`plotted-point-${idx}`}>
              <circle
                cx={toSvgX(p.x)}
                cy={toSvgY(p.y)}
                r="4.5"
                fill={p.color || '#fbbf24'}
                className="stroke-slate-900 dark:stroke-[#18181b]"
                strokeWidth="1.5"
              />
              {p.label && (
                <text
                  x={toSvgX(p.x) + 7}
                  y={toSvgY(p.y) - 6}
                  className="text-[11px] font-mono font-bold fill-slate-900 dark:fill-white"
                >
                  {p.label}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default CoordinatePlane;
