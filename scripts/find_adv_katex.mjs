import fs from 'fs';
import katex from 'katex';

const qs = JSON.parse(fs.readFileSync('src/data/mathQuestions.json', 'utf8'));

for (const q of qs) {
  if (q.domain === 'Advanced Math') {
    const texts = [q.prompt || '', ...(q.options || []).map(o => o.text || '')];
    for (const t of texts) {
      const withoutDisplay = t.replace(/\$\$[\s\S]+?\$\$/g, '');
      const inlineMatches = withoutDisplay.matchAll(/(?<!\\)\$([^\$\n]+?)\$/g);
      for (const m of inlineMatches) {
        try {
          katex.renderToString(m[1].trim(), { displayMode: false, throwOnError: true });
        } catch (e) {
          console.log(`[ADV MATH ERROR in ${q.id}]: "${m[1].trim()}" -> ${e.message}`);
        }
      }
    }
  }
}
