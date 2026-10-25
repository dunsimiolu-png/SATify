import React from 'react';
import { RichText } from './RichText';
import { formatExplanationSegments } from '../utils/formatExplanation';

export interface ExplanationRendererProps {
  rationale?: string | { summary?: string };
  className?: string;
}

/**
 * ExplanationRenderer Component
 *
 * Renders SAT question explanations with:
 * 1. Missing space fix ("Choice Bis" -> "Choice B is")
 * 2. Distinct paragraphs for each choice explanation
 * 3. Bold emphasis on "Choice A", "Choice B", "Choice C", "Choice D" at the start of each segment
 * 4. High-readability typography:
 *    - line-height: 1.65 (leading-[1.65])
 *    - soft off-white text color: #E5E7EB on dark backgrounds (dark:text-[#E5E7EB])
 *    - margin-bottom: 0.75rem between paragraphs (mb-3 last:mb-0)
 */
export const ExplanationRenderer: React.FC<ExplanationRendererProps> = ({
  rationale,
  className = '',
}) => {
  const text = typeof rationale === 'string' ? rationale : rationale?.summary || '';
  if (!text) return null;

  const segments = formatExplanationSegments(text);

  return (
    <div
      style={{ lineHeight: 1.65 }}
      className={`font-serif text-[15px] sm:text-[15.5px] leading-[1.65] text-slate-800 dark:text-[#E5E7EB] ${className}`}
    >
      {segments.map((seg) => (
        <p key={seg.id} className="mb-3 last:mb-0">
          {seg.label ? (
            <>
              <strong className="font-bold text-slate-900 dark:text-white">
                {seg.label}
              </strong>
              <RichText text={seg.body} />
            </>
          ) : (
            <RichText text={seg.body} />
          )}
        </p>
      ))}
    </div>
  );
};

export default ExplanationRenderer;
