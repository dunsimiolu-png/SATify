import React from 'react';
import { CoordinatePlane, CoordinatePlaneProps } from './CoordinatePlane';

export interface MathVisualProps {
  imageUrl?: string;
  graphConfig?: CoordinatePlaneProps;
  graphData?: CoordinatePlaneProps;
  alt?: string;
  className?: string;
}

/**
 * MathVisual Component
 * 
 * Renders mathematical graphs, figures, and diagrams with authentic Digital SAT Bluebook styling
 * and seamless dark mode support:
 * 1. For official College Board monochrome SVGs (black ink on white canvas):
 *    - In Light Mode: rendered inside a clean border-zinc-200 card.
 *    - In Dark Mode: rendered inside a #000000 card with border-[#222634].
 *      Applying `dark:invert dark:contrast-[1.1]` transforms:
 *        - #000000 (black axes, gridlines, arrows, function lines, tick labels) -> crisp off-white #f8fafc!
 *        - #ffffff (canvas and tick label background cutouts) -> #000000, blending 100% seamlessly!
 * 2. For structured coordinate graph configs: renders the theme-adaptive <CoordinatePlane /> SVG.
 */
export const MathVisual: React.FC<MathVisualProps> = ({
  imageUrl,
  graphConfig,
  graphData,
  alt = 'Question mathematical figure',
  className = '',
}) => {
  const activeGraphData = graphConfig || graphData;

  if (!imageUrl && !activeGraphData) return null;

  if (activeGraphData) {
    return <CoordinatePlane {...activeGraphData} className={className} />;
  }

  return (
    <div className={`my-4 flex justify-center w-full ${className}`}>
      <div className="p-3 sm:p-4 bg-white dark:bg-black border border-zinc-200 dark:border-[#222634] rounded-2xl shadow-xs transition-colors flex items-center justify-center max-w-[420px]">
        <img
          src={imageUrl}
          alt={alt}
          className="max-w-full h-auto max-h-[300px] object-contain select-none transition-all dark:invert dark:contrast-[1.1] dark:brightness-[0.95]"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default MathVisual;
