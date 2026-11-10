/**
 * Utility functions for sanitizing and normalizing LaTeX mathematical expressions
 * and protecting currency symbols ($14, $406) from colliding with KaTeX delimiters.
 */

export function sanitizeMathText(input: string): string {
  if (!input) return '';

  let s = input;

  // 1. Literal escaped dollar signs (\$14 or \$ or \\$14) are definitely currency/symbols, not math!
  // Replace with HTML entity &#36; to prevent KaTeX from attempting to parse as math delimiter
  s = s.replace(/\\+\$/g, '&#36;');

  // 2. Unescaped currency amounts: $14, $406, $1,500, $3.50 (NOT math expressions like $x$ or $2x + 1$)
  // A currency amount has a dollar sign, digits, but NO closing $ before whitespace or punctuation
  s = s.replace(/\$(\d+(?:,\d+)*(?:\.\d+)?)(?=\s|[.,;!?)']|$)/g, '&#36;$1');

  // 3. Normalize LaTeX display delimiters: \[...\] -> $$...$$
  s = s.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => `$$${math}$$`);

  // 4. Normalize LaTeX inline delimiters: \(...\) -> $...$
  s = s.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => `$${math}$`);

  // 5. Remove stray backslashes before plain punctuation (e.g., \% -> %, \# -> #)
  s = s.replace(/\\([%#&_])/g, '$1');

  // 6. Fix double-escaped backslashes in LaTeX commands (\\frac -> \frac, \\sqrt -> \sqrt, etc.)
  s = s.replace(/\\\\([a-zA-Z]+)/g, '\\$1');

  // 7. Clean up stray double backslashes before symbols (\\le -> \le, \\ge -> \ge)
  s = s.replace(/\\\\([{}()[\],.])/g, '\\$1');

  return s;
}

/**
 * Normalizes plain question stems: strips raw backslashes and currency escapes.
 */
export function sanitizePlainStem(input: string): string {
  if (!input) return '';
  return input
    .replace(/\\+\$(\d+)/g, '$$$1')
    .replace(/\\([$])/g, '$')
    .replace(/\\([%#&_])/g, '$1');
}
