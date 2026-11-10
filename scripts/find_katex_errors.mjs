import fs from 'fs';
import katex from 'katex';

const qs = JSON.parse(fs.readFileSync('src/data/mathQuestions.json', 'utf8'));
const errorMap = new Map();

for (const q of qs) {
  const texts = [q.prompt || '', ...(q.options || []).map(o => o.text || '')];
  for (const t of texts) {
    const withoutDisplay = t.replace(/\$\$[\s\S]+?\$\$/g, '');
    const inlineMatches = withoutDisplay.matchAll(/(?<!\\)\$([^\$\n]+?)\$/g);
    for (const m of inlineMatches) {
      try {
        katex.renderToString(m[1].trim(), { displayMode: false, throwOnError: true });
      } catch (e) {
        const key = `${m[1].trim()} -> ${e.message}`;
        if (!errorMap.has(key)) {
          errorMap.set(key, q.id);
        }
      }
    }
  }
}

console.log(`Unique error types (${errorMap.size}):`);
for (const [err, qid] of errorMap.entries()) {
  console.log(`[Q: ${qid}]: ${err}`);
}
