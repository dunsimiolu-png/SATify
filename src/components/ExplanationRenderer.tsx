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
 * Renders authentic Digital SAT College Board explanations with:
 * 1. Missing space repair and bold labels ("Choice A is correct", "Choice B is incorrect")
 * 2. Distinct paragraphs for each choice explanation
 * 3. High-readability serif typography and crisp KaTeX math
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
      className={`font-serif text-[15px] sm:text-[15.5px] leading-[1.65] text-slate-800 dark:text-[#E5E7EB] space-y-3.5 ${className}`}
    >
      {segments.map((seg) => (
        <div key={seg.id} className="leading-relaxed">
          {seg.label ? (
            <p>
              <strong className="font-bold text-slate-900 dark:text-white mr-1.5">
                {seg.label}
              </strong>
              <RichText text={seg.body} />
            </p>
          ) : (
            <p>
              <RichText text={seg.body} />
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ExplanationRenderer;
