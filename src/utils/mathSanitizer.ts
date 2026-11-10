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
    const fixedMath = math.replace(/(?<!\\)%/g, '\\%');
    return `$${fixedMath}$`;
  });

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
