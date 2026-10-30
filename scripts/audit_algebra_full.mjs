import * as fs from 'fs';
import katex from 'katex';

const questions = JSON.parse(fs.readFileSync('src/data/mathQuestions.json', 'utf8'));
const algebra = questions.filter(q => q.domain === 'Algebra');

console.log(`Total Algebra questions in JSON: ${algebra.length}`);

// 1. Missing / Empty options
const emptyOptionsList = [];
for (const q of algebra) {
  if (q.questionType === 'mcq') {
    const emptyOpts = q.options.filter(o => (!o.text || o.text.trim() === '') && !o.imageUrl);
    if (emptyOpts.length > 0) {
      emptyOptionsList.push({ id: q.id, emptyCount: emptyOpts.length, prompt: q.prompt.slice(0, 60) });
    }
  }
}
console.log(`\n1. MCQ with EMPTY options: ${emptyOptionsList.length}`);
emptyOptionsList.forEach(e => console.log(`   [${e.id}] emptyOpts=${e.emptyCount} | "${e.prompt}..."`));

// 2. Suspicious missing math in prompt (phrases like "fee of for", "is equal to .", "value of is .", "of and ", "divided by yields .")
const missingTokensInPrompt = [];
const missingPatterns = [
  /\bfee of for\b/i,
  /\bvalue of is\b/i,
  /\bis equal to \./i,
  /\byields \./i,
  /\bgreater than Adam's total charge if, or\./i,
  /\bline has a slope of and\b/i,
  /\bpasses through the point \(\s*,\s*\)/i,
  /\bIf represents the\b/i,
  /\bFor hours spent\b/i,
  /\bcharges a fee of and\b/i,
];

for (const q of algebra) {
  for (const pat of missingPatterns) {
    if (pat.test(q.prompt)) {
      missingTokensInPrompt.push({ id: q.id, match: pat.toString(), prompt: q.prompt });
      break;
    }
  }
}
console.log(`\n2. Prompts with obviously missing math tokens: ${missingTokensInPrompt.length}`);
missingTokensInPrompt.forEach(m => console.log(`   [${m.id}] (${m.match}): ${m.prompt.slice(0, 90)}...`));

// 3. KaTeX test: test all LaTeX formulas in prompt, options, and rationale
let katexErrors = 0;
const katexErrorList = [];

function testKatex(str, id, field) {
  if (!str) return;
  // inline math
  const regex = /(?<!\\)\$([^\$\n]+?)\$/g;
  let match;
  while ((match = regex.exec(str)) !== null) {
    const formula = match[1];
    try {
      katex.renderToString(formula.trim(), { throwOnError: true });
    } catch (err) {
      katexErrors++;
      katexErrorList.push({ id, field, formula, error: err.message });
    }
  }
}

for (const q of algebra) {
  testKatex(q.prompt, q.id, 'prompt');
  for (const opt of q.options || []) {
    testKatex(opt.text, q.id, `opt_${opt.id}`);
  }
}
console.log(`\n3. KaTeX syntax errors in prompt/options: ${katexErrors}`);
katexErrorList.slice(0, 10).forEach(e => console.log(`   [${e.id} in ${e.field}] "${e.formula}": ${e.error}`));

// 4. Questions with table in prompt or passage
const tableInPassage = algebra.filter(q => q.passage && q.passage.includes('<table'));
const tableWordInPrompt = algebra.filter(q => /\btable\b/i.test(q.prompt));
console.log(`\n4. Tables:`);
console.log(`   - Questions with HTML table in passage: ${tableInPassage.length}`);
console.log(`   - Questions mentioning "table" in prompt: ${tableWordInPrompt.length}`);
const tableMentionedNoHtml = tableWordInPrompt.filter(q => !q.passage || !q.passage.includes('<table'));
console.log(`   - Mention "table" but NO HTML table: ${tableMentionedNoHtml.length}`);
tableMentionedNoHtml.forEach(q => console.log(`     * [${q.id}] hasImg=${!!q.imageUrl}: ${q.prompt.slice(0, 80)}...`));

// 5. Questions mentioning "graph", "figure", "xy-plane", "scatterplot"
const visualMentions = algebra.filter(q => /\b(graph|figure|scatterplot|shown in the|plane)\b/i.test(q.prompt));
console.log(`\n5. Visual mentions in prompt: ${visualMentions.length}`);
const visualWithoutImg = visualMentions.filter(q => !q.imageUrl);
console.log(`   - Mention visual but NO imageUrl: ${visualWithoutImg.length}`);
console.log(`   - Mention visual and HAS imageUrl: ${visualMentions.filter(q => q.imageUrl).length}`);
visualWithoutImg.slice(0, 10).forEach(q => console.log(`     * [${q.id}] ${q.prompt.slice(0, 80)}...`));
