import * as fs from 'fs';
import { createCanvas, DOMMatrix, Path2D } from '@napi-rs/canvas';
globalThis.DOMMatrix = DOMMatrix;
globalThis.Path2D = Path2D;
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.js';

async function findGraphs() {
  const data = new Uint8Array(fs.readFileSync('raw-pdfs/ALGEBRA.pdf'));
  const doc = await pdfjs.getDocument({ data }).promise;

  const graphQuestions = [];
  const optionGraphQuestions = [];

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const text = content.items.map(it => it.str).join(' ');
    const qm = text.match(/Question\s+ID\s*:\s*([a-f0-9]{8})/i);
    if (!qm) continue;
    const id = qm[1];

    const ops = await page.getOperatorList();
    let paths = 0;
    let images = 0;
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjs.OPS.constructPath) paths++;
      if (ops.fnArray[i] === pdfjs.OPS.paintImageXObject) images++;
    }

    // Check for option graphs
    const isOptionGraph = /Which of the following is the gr\s*aph of/i.test(text) || (images >= 4 && /A\s*\.\s*B\s*\.\s*C\s*\.\s*D/i.test(text));
    if (isOptionGraph) {
      optionGraphQuestions.push({ id, page: p, images, paths, text: text.slice(0, 150) });
      continue;
    }

    // Check for stimulus graph:
    // Either mentions graph of line / system of linear equations shown / xy-plane with drawing / high path count
    const mentionsGraph = /gr\s*aph of (?:line|a system|function|the linear)/i.test(text) ||
                          /The gr\s*aph (?:shows|models|in the)/i.test(text) ||
                          /gr\s*aph shown/i.test(text) ||
                          /line graphed/i.test(text) ||
                          /equation of the gr\s*aph/i.test(text);

    if (mentionsGraph && (paths > 50 || images > 0)) {
      graphQuestions.push({ id, page: p, paths, images, text: text.slice(0, 160) });
    }
  }

  console.log(`=== STIMULUS GRAPH QUESTIONS IN ALGEBRA.pdf: ${graphQuestions.length} ===`);
  graphQuestions.forEach(g => console.log(`[${g.id}] page ${g.page} | paths=${g.paths}, imgs=${g.images} | ${g.text.replace(/\s+/g, ' ').slice(0, 100)}`));

  console.log(`\n=== OPTION GRAPH QUESTIONS IN ALGEBRA.pdf: ${optionGraphQuestions.length} ===`);
  optionGraphQuestions.forEach(g => console.log(`[${g.id}] page ${g.page} | paths=${g.paths}, imgs=${g.images} | ${g.text.replace(/\s+/g, ' ').slice(0, 100)}`));
}

findGraphs().catch(console.error);
