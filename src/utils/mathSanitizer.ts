/**
 * Utility functions for sanitizing and normalizing LaTeX mathematical expressions.
 */

export function sanitizeMathText(input: string): string {
  if (!input) return '';

  let s = input;

  // 0. Decode numerical/HTML entities for dollar sign and ampersand
  s = s.replace(/&#36;|&amp;#36;/g, '$');

  // 0.5. Protect standalone currency amounts outside math mode: e.g. $14, $406, $112, $12.50
  // Matches $ followed by a number that is followed by whitespace + word or punctuation (not math delimiters or LaTeX macros)
  // Ensures $90.0$ and $127,882\text{...}$ are preserved as valid math while $14 for each tablet is protected
  s = s.replace(/(?<![\$\\])\$(?!\$)(\d+(?:,\d+)*(?:\.\d+)?)(?=\s+[a-zA-Z]|[.,;!?)](?:\s|$))/g, '\\$$$1');

  // 1. Normalize LaTeX display delimiters: \[...\] -> $$...$$
  s = s.replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$');

  // 2. Normalize LaTeX inline delimiters: \(...\) -> $...$
  s = s.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');

  // 2.5. Separate glued equations like $eq1$$eq2$ into stacked display equations
  s = s.replace(/(?<!\$)\$([^\$\n]+)\$\$(?!\$)([^\$\n]+)\$/g, '$$$$$1$$$$\n\n$$$$$2$$$$');

  // 2.6. Merge adjacent \text{} tags into a single spaced tag: \text{A}\text{B} -> \text{A B}
  let prevS = '';
  while (prevS !== s && /\\text\{([^}]+)\}\\text\{([^}]+)\}/.test(s)) {
    prevS = s;
    s = s.replace(/\\text\{([^}]+)\}\\text\{([^}]+)\}/g, '\\text{$1 $2}');
  }

  // 2.7. Fix numbers glued directly to text tags: 160\text{miles} -> 160\text{ miles} (except ordinals 1st, 2nd, etc.)
  s = s.replace(/(\d+)\\text\{(?!st|nd|rd|th)([a-zA-Z]+)/g, '$1\\text{ $2');

  // 2.8. Fix unit exponents: {in}^{2} or {in}^2 -> \text{in}^2
  s = s.replace(/(?<!\\text)\{in\}\^\{?2\}?/g, '\\text{in}^2');

  // 3. Fix unescaped % inside math mode: e.g. $10%$ -> $10\%$
  // Inside $...$, replace % not preceded by \ with \% so it doesn't comment out the closing $
  s = s.replace(/(?<!\\)\$((?:\\\$|[^\$\n])+?)(?<!\\)\$/g, (_, math) => {
    let fixedMath = math.replace(/(?<!\\)%/g, '\\%');
    // Fix unicode script l \u{1D4C1} -> \ell
    fixedMath = fixedMath.replace(/\u{1D4C1}|𝓁/gu, '\\ell ');
    // Fix unicode delta \u2206 -> \Delta
    fixedMath = fixedMath.replace(/∆|\u2206/g, '\\Delta ');
    // Fix invisible times \u2062
    fixedMath = fixedMath.replace(/\u2062/g, ' ');
    // Fix \pir -> \pi r
    fixedMath = fixedMath.replace(/\\pir\b/g, '\\pi r');
    return `$${fixedMath}$`;
  });

  // 3.5. Fix stray \text{\$} or \text{$} before numbers
  s = s.replace(/\\text\{\\?\$?\}/g, '\\$');

  // 4. Double backslashes in LaTeX commands (\\frac -> \frac, \\sqrt -> \sqrt, etc.)
  s = s.replace(/\\\\([a-zA-Z]+)/g, '\\$1');

  // 5. Stray double backslashes before symbols (\\le -> \le, \\ge -> \ge, \\cdot -> \cdot)
  s = s.replace(/\\\\([{}()[\],.])/g, '\\$1');

  return s;
}

/**
 * Normalizes plain question stems: strips raw backslashes and currency escapes.
 */
export function sanitizePlainStem(input: string): string {
  if (!input) return '';
  return input
    .replace(/\\+\$/g, '$')
    .replace(/\\+%/g, '%');
}

/**
 * Cleans up College Board TTS (text-to-speech) screen-reader artifacts from question text.
 * - Replaces repeated "upper [A-Z]" sequences (e.g. "Triangle upper W upper X upper Q" -> "Triangle WXQ")
 * - Replaces single "upper [A-Z]" -> "[A-Z]" (e.g. "angle upper W" -> "angle W", "point upper Q" -> "point Q")
 * - Replaces single "lower [a-z]" -> "[a-z]"
 * - Replaces "script l" -> "$\ell$"
 */
export function cleanScreenReaderText(input: string): string {
  if (!input) return '';
  let s = input;

  // 1. Replace repeated "upper [A-Z]" sequences (2 or more) with joined letters (e.g. "upper W upper X upper Q" -> "WXQ")
  s = s.replace(/\bupper\s+([A-Za-z])(?:\s+upper\s+([A-Za-z]))+/gi, (match) => {
    return match.replace(/upper\s+/gi, '').replace(/\s+/g, '');
  });

  // 2. Replace single "upper [A-Z]" with just the letter
  s = s.replace(/\bupper\s+([A-Za-z])\b/gi, '$1');

  // 3. Replace single "lower [a-z]" with just the letter
  s = s.replace(/\blower\s+([a-z])\b/gi, '$1');

  // 4. Replace "script l" with LaTeX $\ell$
  s = s.replace(/\bscript\s+l\b/gi, '$\\ell$');

  // 5. Clean any awkward spacing before punctuation created by stripping TTS tokens
  s = s.replace(/\s+([.,;:?!])/g, '$1');

  return s.trim();
}

/**
 * Standard regex to locate the College Board figure-description divider note
 */
export const FIGURE_NOT_DRAWN_DIVIDER_REGEX =
  /(?:A\s+note\s+indicates\s+the\s+figures?\s+(?:is|are)\s+not\s+drawn\s+to\s+scale\.?|Note:\s*Figures?\s+not\s+drawn\s+to\s+scale\.?)/i;

export interface ExtractedFigureResult {
  figureDescription: string | null;
  cleanPrompt: string;
}

/**
 * Preprocesses a question prompt to separate baked-in College Board screen-reader figure descriptions
 * from the actual question text.
 *
 * - If a visual diagram (SVG or image) is present:
 *   The screen-reader description is redundant and is stripped out completely, leaving only
 *   the clean, natural question prompt.
 *
 * - If NO visual diagram is present:
 *   The screen-reader description is cleaned of TTS artifacts and extracted into `figureDescription`,
 *   so the UI can render it inside a distinct, subtly styled "Figure Description" callout box
 *   instead of a garbled run-on sentence.
 */
export function extractFigureDescription(prompt: string, hasVisual: boolean): ExtractedFigureResult {
  if (!prompt) {
    return { figureDescription: null, cleanPrompt: '' };
  }

  const match = prompt.match(FIGURE_NOT_DRAWN_DIVIDER_REGEX);

  if (match && typeof match.index === 'number') {
    const rawDesc = prompt.slice(0, match.index + match[0].length).trim();
    const rawQuestion = prompt.slice(match.index + match[0].length).trim();

    if (hasVisual) {
      // With visual diagram present: discard the redundant screen-reader description
      return {
        figureDescription: null,
        cleanPrompt: cleanScreenReaderText(rawQuestion || prompt),
      };
    }

    // Fallback: visual diagram missing -> separate into callout box + clean question prompt
    return {
      figureDescription: cleanScreenReaderText(rawDesc),
      cleanPrompt: cleanScreenReaderText(rawQuestion || prompt),
    };
  }

  // Handle leading stray screen-reader labels (e.g. "upper M\nupper N\nupper P\n\nPoints M, N, and P...")
  if (/^\s*(?:upper\s+[A-Za-z]\s*)+(?:\n+|$)/i.test(prompt)) {
    const labelMatch = prompt.match(/^(\s*(?:upper\s+[A-Za-z]\s*)+(?:\n+|$))([\s\S]*)$/i);
    if (labelMatch) {
      const rest = labelMatch[2].trim();
      return {
        figureDescription: null,
        cleanPrompt: cleanScreenReaderText(rest),
      };
    }
  }

  // Pure question prompt without figure description prefix
  return {
    figureDescription: null,
    cleanPrompt: cleanScreenReaderText(prompt),
  };
}
