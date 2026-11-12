/**
 * Utility functions for sanitizing and normalizing LaTeX mathematical expressions.
 */

export function sanitizeMathText(input: string): string {
  if (!input) return '';

  let s = input;

  // 0. Decode numerical/HTML entities for dollar sign and ampersand
  s = s.replace(/&#36;|&amp;#36;/g, '$');

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
