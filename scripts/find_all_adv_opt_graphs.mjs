import * as fs from 'fs';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.js';

const doc = await pdfjs.getDocument('raw-pdfs/ADVANCED_MATHS.pdf').promise;
const optGraphQuestions = [];

for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const tc = await page.getTextContent();
  const text = tc.items.map(i => i.str).join(' ');
  const idMatch = text.match(/Question\s+ID\s*:\s*([a-f0-9]{8})/i) || text.match(/ID\s*:\s*([a-f0-9]{8})/i);
  const id = idMatch ? idMatch[1] : '';

  // Look for prompt indicating graph options
  if (/Which\s+(of\s+the\s+following\s+)?(could\s+be\s+the\s+|is\s+the\s+)?gr\s*aph/i.test(text) ||
      /Which\s+gr\s*aph/i.test(text)) {
    // Check if options themselves are graphs (or if prompt is "Which of the following is an equation of the graph shown")
    if (!/equation\s+of\s+the\s+gr\s*aph\s+shown/i.test(text)) {
      optGraphQuestions.push({ id, page: p, text: text.slice(0, 150) });
      console.log(`Option graph question [${id}] on page ${p}`);
    }
  }
}

console.log(`Total option graph questions found: ${optGraphQuestions.length}`);
fs.writeFileSync('scripts/adv_option_graph_questions.json', JSON.stringify(optGraphQuestions, null, 2));
