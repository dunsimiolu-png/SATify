import fs from 'fs';
import katex from 'katex';
import { sanitizeMathText } from '../src/utils/mathSanitizer.ts';

const questions = JSON.parse(fs.readFileSync('src/data/mathQuestions.json', 'utf8'));
console.log(`Auditing ${questions.length} math questions with KaTeX...`);

let errors = [];

for (let i = 0; i < questions.length; i++) {
  const q = questions[i];
  const fields = [
    { name: 'prompt', text: q.prompt },
    ...(q.options || []).map((o, idx) => ({ name: `opt_${o.id || o.label || idx}`, text: o.text })),
    { name: 'rationale', text: q.rationale }
  ];

  for (const f of fields) {
    if (!f.text) continue;
    const sanitized = sanitizeMathText(f.text);

    // 1. Test display math
    const displayMatches = sanitized.match(/\$\$([\s\S]+?)\$\$/g) || [];
    for (const dm of displayMatches) {
      const inner = dm.slice(2, -2).trim();
      try {
        katex.renderToString(inner, { displayMode: true, throwOnError: true });
      } catch (err) {
        errors.push({ id: q.id, field: f.name, math: inner, error: err.message });
      }
    }

    // Remove display math so $$ doesn't collide with inline regex
    const withoutDisplay = sanitized.replace(/\$\$([\s\S]+?)\$\$/g, ' ');

    // 2. Test inline math (with support for \$ inside math mode)
    const inlineMatches = withoutDisplay.match(/(?<!\\)\$((?:\\\$|[^\$\n])+?)(?<!\\)\$/g) || [];
    for (const im of inlineMatches) {
      const inner = im.slice(1, -1).trim();
      try {
        katex.renderToString(inner, { displayMode: false, throwOnError: true });
      } catch (err) {
        errors.push({ id: q.id, field: f.name, math: inner, error: err.message });
      }
    }
  }
}

console.log(`Audit complete. Errors found: ${errors.length}`);
if (errors.length > 0) {
  for (const e of errors) {
    console.log(`[${e.id} - ${e.field}] Error: ${e.error}`);
    console.log(`  Math: ${e.math.slice(0, 80)}`);
  }
}
