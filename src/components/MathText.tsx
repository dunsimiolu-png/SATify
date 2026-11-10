import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { sanitizeMathText } from '../utils/mathSanitizer';

export interface MathTextProps {
  text: string;
  className?: string;
  as?: 'span' | 'div' | 'p';
}

/**
 * Renders text containing LaTeX math ($...$ or $$...$$), HTML tables,
 * and currency with crisp KaTeX and theme-adaptive rendering.
 */
export const MathText: React.FC<MathTextProps> = ({
  text,
  className = '',
  as: Component = 'span',
}) => {
  const renderedHtml = useMemo(() => {
    if (!text) return '';

    // Sanitize LaTeX delimiters and protect currency amounts ($14, $406)
    const sanitized = sanitizeMathText(text);

    // Check if there is any LaTeX math ($), HTML tags (<), or HTML entities (&)
    const hasMath = sanitized.includes('$');
    const hasHtml = sanitized.includes('<') && sanitized.includes('>');
    const hasEntities = sanitized.includes('&#');

    if (!hasMath && !hasHtml && !hasEntities) {
      return null;
    }

    let processed = sanitized;

    // 1. Process display math $$...$$
    processed = processed.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
      try {
        return `<div class="katex-display-wrapper my-2.5 overflow-x-auto py-1 text-center select-text">${katex.renderToString(
          math.trim(),
          { displayMode: true, throwOnError: false }
        )}</div>`;
      } catch {
        return `$$${math}$$`;
      }
    });

    // 2. Process inline math $...$
    processed = processed.replace(/(?<!\\)\$([^\$\n]+?)\$/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), {
          displayMode: false,
          throwOnError: false,
        });
      } catch {
        return `$${math}$`;
      }
    });

    return processed;
  }, [text]);

  if (!text) return null;

  // Pure text fast-path
  if (renderedHtml === null) {
    const cleanText = sanitizeMathText(text).replace(/&#36;/g, '$');
    return <Component className={className}>{cleanText}</Component>;
  }

  return (
    <Component
      className={`math-rendered-content ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};

export default MathText;
