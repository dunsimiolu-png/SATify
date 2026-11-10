import React from 'react';
import { RichText } from './RichText';
import { MathText } from './MathText';
import { formatExplanationSegments } from '../utils/formatExplanation';

export interface ExplanationRendererProps {
  rationale?: string | { summary?: string };
  className?: string;
}

/**
 * Helper to render inline text with markdown bold (**text**) and KaTeX math ($...$)
 */
function renderInlineWithBoldAndMath(text: string) {
  const parts = text.split(/(\*\*[^*]+?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      return (
        <strong key={i} className="font-bold text-slate-900 dark:text-white">
          <MathText text={inner} />
        </strong>
      );
    }
    return <MathText key={i} text={part} />;
  });
}

/**
 * ExplanationRenderer Component
 *
 * Renders SAT question explanations with:
 * 1. Missing space fix ("Choice Bis" -> "Choice B is")
 * 2. Distinct paragraphs for each choice explanation or markdown structured section
 * 3. Bold emphasis on "Choice A", "Choice B", "Choice C", "Choice D" or "**Section:**" headers
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

  // If text contains markdown bold headers (e.g. **Core Concept:**) or multiple paragraphs
  if (text.includes('**') || text.includes('\n\n')) {
    const paragraphs = text
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    return (
      <div
        style={{ lineHeight: 1.65 }}
        className={`font-serif text-[15px] sm:text-[15.5px] leading-[1.65] text-slate-800 dark:text-[#E5E7EB] space-y-3 ${className}`}
      >
        {paragraphs.map((p, idx) => {
          // If paragraph starts with a header like **Core Concept:**, give it subtle emphasis
          const isSectionHeader = /^\*\*(Core Concept|Method 1|Method 2|Common Trap)[\s\S]*?\*\*/i.test(p);
          return (
            <div 
              key={idx} 
              className={isSectionHeader ? "p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/70 dark:border-zinc-700/60" : ""}
            >
              <p>{renderInlineWithBoldAndMath(p)}</p>
            </div>
          );
        })}
      </div>
    );
  }

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
