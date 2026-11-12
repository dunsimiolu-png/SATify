import fs from 'fs';
import katex from 'katex';

const raw = fs.readFileSync('src/data/mathQuestions.json', 'utf8');
const questions = JSON.parse(raw);
const algebra = questions.filter(q => q.domain === 'Algebra');

console.log(`Auditing all ${algebra.length} Algebra questions...`);

const report = {
  htmlEntities: [],
  unescapedDollars: [],
  unbalancedDollars: [],
  rawSlashesInPrompt: [],
  rawSlashesInOptions: [],
  rawSlashesInRationale: [],
  textGraphDescriptions: [],
  emptyOptions: [],
  missingRationale: [],
  katexPromptErrors: [],
  katexOptionErrors: [],
  katexRationaleErrors: [],
  multiLineGluedOptions: []
};

function checkKaTeX(str, id, field) {
  if (!str) return;
  // Match display math
  const displayMatches = str.match(/\$\$([\s\S]+?)\$\$/g) || [];
  displayMatches.forEach(m => {
    const inner = m.slice(2, -2).trim();
    try {
      katex.renderToString(inner, { displayMode: true, throwOnError: true });
    } catch (e) {
      report[`katex${field}Errors`].push({ id, error: e.message, snippet: inner.slice(0, 60) });
    }
  });

  // Match inline math
  const cleanForInline = str.replace(/\$\$([\s\S]+?)\$\$/g, ' ');
  const inlineMatches = cleanForInline.match(/(?<!\\)\$((?:\\\$|[^\$\n])+?)(?<!\\)\$/g) || [];
  inlineMatches.forEach(m => {
    const inner = m.slice(1, -1).trim();
    try {
      katex.renderToString(inner, { displayMode: false, throwOnError: true });
    } catch (e) {
      report[`katex${field}Errors`].push({ id, error: e.message, snippet: inner.slice(0, 60) });
    }
  });
}

algebra.forEach(q => {
  const jsonStr = JSON.stringify(q);

  // 1. HTML entities
  if (jsonStr.includes('&#36;') || jsonStr.includes('&#x24;') || jsonStr.includes('&amp;#36;')) {
    report.htmlEntities.push(q.id);
  }

  // 2. Unbalanced dollar signs in prompt
  const prompt = q.prompt || '';
  const dollarCount = (prompt.match(/(?<!\\)\$/g) || []).length;
  if (dollarCount % 2 !== 0) {
    report.unbalancedDollars.push({ id: q.id, count: dollarCount, prompt: prompt.slice(0, 80) });
  }

  // 3. Literal backslash dollars leaking before digits outside math
  if (prompt.includes('\\$')) {
    report.rawSlashesInPrompt.push(q.id);
  }

  // 4. Text graph descriptions in prompt
  if (prompt.includes('slants') || prompt.includes('passes through the following')) {
    report.textGraphDescriptions.push({ id: q.id, field: 'prompt' });
  }

  // 5. Options audit
  const options = q.options || [];
  if (q.questionType === 'mcq' && options.length === 0) {
    report.emptyOptions.push(q.id);
  }
  options.forEach(opt => {
    if (!opt.text && !opt.imageUrl) {
      report.emptyOptions.push({ id: q.id, opt: opt.label });
    }
    if (opt.text && (opt.text.includes('slants') || opt.text.includes('passes through the following'))) {
      report.textGraphDescriptions.push({ id: q.id, opt: opt.label, field: 'option' });
    }
    if (opt.text && opt.text.includes('\\$')) {
      report.rawSlashesInOptions.push({ id: q.id, opt: opt.label });
    }
    checkKaTeX(opt.text, q.id, 'Option');
  });

  // 6. Rationale audit
  if (!q.rationale || q.rationale.trim() === '') {
    report.missingRationale.push(q.id);
  } else {
    checkKaTeX(q.rationale, q.id, 'Rationale');
  }

  // 7. Check KaTeX in prompt
  checkKaTeX(prompt, q.id, 'Prompt');
});

console.log('\n=== AUDIT RESULTS ===');
console.log('HTML entities (&#36;):', report.htmlEntities.length);
console.log('Unbalanced dollar signs:', report.unbalancedDollars.length);
console.log('Raw \\$ in prompts:', report.rawSlashesInPrompt.length);
console.log('Raw \\$ in options:', report.rawSlashesInOptions.length);
console.log('Text graph descriptions:', report.textGraphDescriptions.length);
console.log('Empty options:', report.emptyOptions.length);
console.log('Missing rationale:', report.missingRationale.length);
console.log('KaTeX prompt errors:', report.katexPromptErrors.length);
console.log('KaTeX option errors:', report.katexOptionErrors.length);
console.log('KaTeX rationale errors:', report.katexRationaleErrors.length);

if (report.unbalancedDollars.length > 0) {
  console.log('\nUnbalanced dollars detail:');
  console.log(report.unbalancedDollars);
}
if (report.rawSlashesInPrompt.length > 0) {
  console.log('\nRaw slashes detail:');
  console.log(report.rawSlashesInPrompt);
}
if (report.katexPromptErrors.length > 0) {
  console.log('\nKaTeX prompt errors detail:');
  console.log(report.katexPromptErrors.slice(0, 5));
}
if (report.katexOptionErrors.length > 0) {
  console.log('\nKaTeX option errors detail:');
  console.log(report.katexOptionErrors.slice(0, 5));
}
if (report.katexRationaleErrors.length > 0) {
  console.log('\nKaTeX rationale errors detail:');
  console.log(report.katexRationaleErrors.slice(0, 5));
}
