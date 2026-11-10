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
 * and currency ($14, $406) with crisp KaTeX and theme-adaptive rendering.
 */
export const MathText: React.FC<MathTextProps> = ({
  text,
  className = '',
  as: Component = 'span',
}) => {
  const renderedHtml = useMemo(() => {
    if (!text) return '';

    // Check if there are any math delimiters ($), brackets, currency escapes (\$), or HTML tags (<)
    const hasMath = text.includes('$') || text.includes('\\(') || text.includes('\\[');
    const hasHtml = text.includes('<') && text.includes('>');

    if (!hasMath && !hasHtml) {
      return null;
    }

    // Sanitize LaTeX delimiters and fix unescaped % inside math
    const sanitized = sanitizeMathText(text);
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
    // The lookbehind (?<!\\) ensures that escaped currency (\$14, \$406) is NOT matched as math!
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

    // 3. AFTER KaTeX has parsed all math, unescape currency: \$ -> $
    processed = processed.replace(/\\+\$/g, '$');
    // Also unescape \% in plain text: \% -> %
    processed = processed.replace(/\\+%/g, '%');

    return processed;
  }, [text]);

  if (!text) return null;

  // Pure text fast-path: unescape any stray currency \$ -> $
  if (renderedHtml === null) {
    const cleanText = text.replace(/\\+\$/g, '$').replace(/\\+%/g, '%');
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
