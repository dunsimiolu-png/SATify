/**
 * Utility functions for sanitizing and normalizing LaTeX mathematical expressions.
 */

export function sanitizeMathText(input: string): string {
  if (!input) return '';

  let s = input;

  // 1. Normalize LaTeX display delimiters: \[...\] -> $$...$$
  s = s.replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$');

  // 2. Normalize LaTeX inline delimiters: \(...\) -> $...$
  s = s.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');

  // 3. Fix unescaped % inside math mode: e.g. $10%$ -> $10\%$
  // Inside $...$, replace % not preceded by \ with \% so it doesn't comment out the closing $
  s = s.replace(/(?<!\\)\$([^\$\n]+?)(?<!\\)\$/g, (_, math) => {
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
