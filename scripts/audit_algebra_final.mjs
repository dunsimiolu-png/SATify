import * as fs from 'fs';
import katex from 'katex';

const questions = JSON.parse(fs.readFileSync('src/data/mathQuestions.json', 'utf8'));
const algebra = questions.filter(q => q.domain === 'Algebra');

console.log(`Auditing ${algebra.length} Algebra questions from src/data/mathQuestions.json...`);

let inlineImgCount = 0;
let emptyOptCount = 0;
let katexErrorCount = 0;
let stimulusGraphCount = 0;
let tableCount = 0;

function checkMath(text, id, ctx) {
  if (!text) return;
  
  if (text.includes('/eq_p')) {
    console.error(`[LINGERING EQ_P IMAGE] in ${id} (${ctx}): ${text.slice(0, 100)}`);
    inlineImgCount++;
  }

  // Display math
  const displayRegex = /\$\$([\s\S]*?)\$\$/g;
  let m;
  while ((m = displayRegex.exec(text)) !== null) {
    try {
      katex.renderToString(m[1].trim(), { displayMode: true, throwOnError: true });
    } catch (e) {
      console.error(`[KATEX ERROR] in ${id} (${ctx}) display: ${m[1].trim()} -> ${e.message}`);
      katexErrorCount++;
    }
  }

  // Inline math (negative lookbehind for escaped dollar)
  const noDisplay = text.replace(displayRegex, '');
  const inlineRegex = /(?<!\\)\$([^\$\n]+?)\$/g;
  while ((m = inlineRegex.exec(noDisplay)) !== null) {
    try {
      katex.renderToString(m[1].trim(), { displayMode: false, throwOnError: true });
    } catch (e) {
      console.error(`[KATEX ERROR] in ${id} (${ctx}) inline: ${m[1].trim()} -> ${e.message}`);
      katexErrorCount++;
    }
  }
}

for (const q of algebra) {
  if (q.imageUrl) stimulusGraphCount++;
  if (q.passage && q.passage.includes('<table')) tableCount++;

  checkMath(q.prompt, q.id, 'prompt');
  if (q.passage) checkMath(q.passage, q.id, 'passage');

  if (q.questionType === 'mcq') {
    if (!q.options || q.options.length !== 4) {
      console.error(`[MCQ OPTION COUNT ERROR] in ${q.id}: has ${q.options?.length} options`);
      emptyOptCount++;
    } else {
      q.options.forEach((opt, idx) => {
        if (!opt.text && !opt.imageUrl) {
          console.error(`[EMPTY OPTION ERROR] in ${q.id} option ${opt.label}`);
          emptyOptCount++;
        }
        checkMath(opt.text, q.id, `opt ${opt.label}`);
      });
    }
  }
}

console.log('\n================ ALGEBRA FINAL AUDIT REPORT ================');
console.log(`Total Algebra Questions: ${algebra.length}`);
console.log(`Lingering eq_p images: ${inlineImgCount} (was 94)`);
console.log(`Empty MCQ options: ${emptyOptCount}`);
console.log(`KaTeX Parse Errors: ${katexErrorCount}`);
console.log(`Genuine Stimulus Coordinate Graphs: ${stimulusGraphCount}`);
console.log(`Structured Tables: ${tableCount}`);
console.log('===========================================================');

if (inlineImgCount === 0 && emptyOptCount === 0 && katexErrorCount === 0) {
  console.log('ALL SUCCESS CRITERIA MET FOR ALGEBRA DOMAIN!');
} else {
  process.exit(1);
}
