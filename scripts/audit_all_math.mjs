import fs from 'fs';
import katex from 'katex';

const qs = JSON.parse(fs.readFileSync('src/data/mathQuestions.json', 'utf8'));
const byDomain = {};

for (const q of qs) {
  const dom = q.domain || 'Unknown';
  if (!byDomain[dom]) {
    byDomain[dom] = {
      total: 0,
      mcq: 0,
      spr: 0,
      emptyMcq: 0,
      withImage: 0,
      withTable: 0,
      katexErrors: 0
    };
  }
  const d = byDomain[dom];
  d.total++;
  if (q.questionType === 'spr') {
    d.spr++;
  } else {
    d.mcq++;
    const emptyOpts = (q.options || []).filter(o => (!o.text || o.text.trim() === '') && !o.imageUrl);
    if (emptyOpts.length > 0) d.emptyMcq++;
  }
  if (q.imageUrl) d.withImage++;
  if (q.passage && q.passage.includes('<table')) d.withTable++;

  // Test KaTeX
  const texts = [q.prompt || '', ...(q.options || []).map(o => o.text || '')];
  for (const t of texts) {
    const withoutDisplay = t.replace(/\$\$[\s\S]+?\$\$/g, '');
    const inlineMatches = withoutDisplay.matchAll(/(?<!\\)\$([^\$\n]+?)\$/g);
    for (const m of inlineMatches) {
      try {
        katex.renderToString(m[1].trim(), { displayMode: false, throwOnError: true });
      } catch (e) {
        d.katexErrors++;
      }
    }
  }
}

console.log('Math Questions Audit by Domain:');
console.table(byDomain);
