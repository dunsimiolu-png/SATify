import * as fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';

async function checkExpression() {
  const data = new Uint8Array(fs.readFileSync('raw-pdfs/EXPRESSION_OF_IDEAS.pdf'));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  
  for (let i = 1; i <= 3; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const str = content.items.map(it => it.str).join(' ');
    console.log(`\n--- PAGE ${i} ---`);
    console.log(str.substring(0, 500));
  }
}

checkExpression().catch(console.error);
