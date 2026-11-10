import katex from 'katex';

const tests = [
  "15",
  "\\$15",
  "\\text{\\$}15",
  "\\text{$}15",
  "\\text{%}",
  "\\text{\\%}",
  "4\\%",
  "4%",
  "\\triangle",
  "\\overline{AB}"
];

for (const t of tests) {
  try {
    katex.renderToString(t, { throwOnError: true });
    console.log(`[PASS] "${t}"`);
  } catch (e) {
    console.log(`[FAIL] "${t}" -> ${e.message}`);
  }
}
