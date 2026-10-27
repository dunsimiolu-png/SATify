import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export interface MathTextProps {
  text: string;
  className?: string;
  as?: 'span' | 'div' | 'p';
}

/**
 * Renders text containing LaTeX math ($...$ or $$...$$), HTML tables,
 * and inline math images with crisp KaTeX and theme-adaptive rendering.
 */
export const MathText: React.FC<MathTextProps> = ({
  text,
  className = '',
  as: Component = 'span',
}) => {
  const renderedHtml = useMemo(() => {
    if (!text) return '';

    // Check if there is any LaTeX math ($) or HTML tags (<)
    const hasMath = text.includes('$');
    const hasHtml = text.includes('<') && text.includes('>');

    if (!hasMath && !hasHtml) {
      return null;
    }

    let processed = text;

    // 1. Process display math $$...$$
    processed = processed.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
      try {
        return `<div class="katex-display-wrapper my-2 overflow-x-auto py-1 text-center">${katex.renderToString(
          math.trim(),
          { displayMode: true, throwOnError: false }
        )}</div>`;
      } catch {
        return `$$${math}$$`;
      }
    });

    // 2. Process inline math $...$ (ignore escaped \$)
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
    return <Component className={className}>{text}</Component>;
  }

  return (
    <Component
      className={`math-rendered-content ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
