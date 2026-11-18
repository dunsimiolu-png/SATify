import React, { useMemo } from 'react';
import { CoordinatePlane, CoordinatePlaneProps } from './CoordinatePlane';

export interface MathVisualProps {
  imageUrl?: string;
  figureSvg?: string;
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
 * 1. For inline geometric SVGs (`figureSvg`):
 *    - Rendered inside a clean, rounded Bluebook card.
 *    - Strips blinding white SVG background rectangles (`fill="#ffffff"` -> `fill="transparent"`).
 *    - Adapts stroke and fill colors to theme (crisp white in dark mode, black/charcoal in light mode).
 *    - Hides any nested `<desc>` screen-reader tags from visual rendering.
 * 2. For external College Board monochrome SVGs (`imageUrl`):
 *    - In Light Mode: rendered inside a clean border-zinc-200 card.
 *    - In Dark Mode: rendered inside a #000000 card with border-[#222634] and `dark:invert dark:contrast-[1.1]`.
 * 3. For structured coordinate graph configs: renders the theme-adaptive <CoordinatePlane /> SVG.
 */
export const MathVisual: React.FC<MathVisualProps> = ({
  imageUrl,
  figureSvg,
  graphConfig,
  graphData,
  alt = 'Question mathematical figure',
  className = '',
}) => {
  const activeGraphData = graphConfig || graphData;

  const processedSvg = useMemo(() => {
    if (!figureSvg) return '';
    let svg = figureSvg;
    // 1. Remove opaque white background rects so SVG blends into the themed container
    svg = svg.replace(/<rect\s+([^>]*?)fill=["']#(?:fff|ffffff)["']([^>]*?)\/?>/gi, '<rect $1fill="transparent"$2/>');
    // 2. Strip screen-reader <desc> elements from rendering
    svg = svg.replace(/<desc>[\s\S]*?<\/desc>/gi, '');
    return svg;
  }, [figureSvg]);

  if (!imageUrl && !figureSvg && !activeGraphData) return null;

  if (activeGraphData) {
    return <CoordinatePlane {...activeGraphData} className={className} />;
  }

  if (figureSvg) {
    return (
      <div className={`my-4 flex justify-center w-full max-w-full overflow-x-auto ${className}`}>
        <div className="p-3.5 sm:p-5 bg-white dark:bg-black border border-zinc-200 dark:border-[#222634] rounded-2xl shadow-xs transition-colors flex items-center justify-center max-w-[500px] w-full mx-auto max-w-full overflow-x-auto">
          <div
            className="w-full flex items-center justify-center max-h-[380px] sm:max-h-[440px] overflow-hidden select-none figure-svg-wrapper text-zinc-900 dark:text-zinc-100 dark:[&_polygon]:stroke-zinc-100 dark:[&_line]:stroke-zinc-100 dark:[&_path]:stroke-zinc-100 dark:[&_text]:fill-zinc-100 [&_svg]:max-w-full [&_svg]:h-auto [&_svg]:max-h-[380px]"
            dangerouslySetInnerHTML={{ __html: processedSvg }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`my-4 flex justify-center w-full max-w-full overflow-x-auto ${className}`}>
      <div className="p-3.5 sm:p-5 bg-white dark:bg-black border border-zinc-200 dark:border-[#222634] rounded-2xl shadow-xs transition-colors flex items-center justify-center max-w-[500px] w-full mx-auto max-w-full overflow-x-auto">
        <img
          src={imageUrl}
          alt={alt}
          className="max-w-full h-auto max-h-[380px] sm:max-h-[440px] object-contain select-none transition-all dark:invert dark:contrast-[1.1] dark:brightness-[0.95]"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default MathVisual;
