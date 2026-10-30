import * as fs from 'fs';
import { createCanvas, DOMMatrix, Path2D } from '@napi-rs/canvas';
globalThis.DOMMatrix = DOMMatrix;
globalThis.Path2D = Path2D;
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.js';

const canvasFactory = {
  create: (w, h) => {
    const canvas = createCanvas(w, h);
    return { canvas, context: canvas.getContext('2d') };
  },
  reset: (c, w, h) => {
    c.canvas.width = w;
    c.canvas.height = h;
  },
  destroy: (c) => {
    c.canvas.width = 0;
    c.canvas.height = 0;
    c.canvas = null;
    c.context = null;
  }
};

async function catalog() {
  const data = new Uint8Array(fs.readFileSync('raw-pdfs/ADVANCED_MATHS.pdf'));
  const doc = await pdfjs.getDocument({ data, canvasFactory }).promise;
  const numPages = doc.numPages;
  console.log(`ADVANCED_MATHS.pdf has ${numPages} pages.`);

  const mathQuestions = JSON.parse(fs.readFileSync('src/data/mathQuestions.json', 'utf8'));
  const advQuestions = mathQuestions.filter(q => q.domain === 'Advanced Math');
  console.log(`Existing Advanced Math questions in JSON: ${advQuestions.length}`);

  // Find the empty option questions
  const emptyMcq = advQuestions.filter(q => q.questionType === 'mcq' && q.options.some(o => (!o.text || !o.text.trim()) && !o.imageUrl));
  console.log(`Questions with empty options: ${emptyMcq.length}`);

  // Map each question ID to its page number in ADVANCED_MATHS.pdf
  const idToPage = {};
  for (let p = 1; p <= numPages; p++) {
    const page = await doc.getPage(p);
    const tc = await page.getTextContent();
    const text = tc.items.map(i => i.str).join(' ');
    const idMatch = text.match(/Question\s+ID\s*:\s*([a-f0-9]{8})/i) || text.match(/ID\s*:\s*([a-f0-9]{8})/i);
    if (idMatch) {
      idToPage[idMatch[1]] = p;
    }
  }

  console.log(`Mapped ${Object.keys(idToPage).length} question IDs to pages in ADVANCED_MATHS.pdf.`);

  // Analyze the empty option questions
  const catalogList = [];
  for (const q of emptyMcq) {
    const pageNum = idToPage[q.id];
    catalogList.push({
      id: q.id,
      page: pageNum,
      skill: q.skill,
      difficulty: q.difficulty,
      prompt: q.prompt ? q.prompt.slice(0, 100) : '',
      hasExistingImage: !!q.imageUrl,
    });
  }

  fs.writeFileSync('scripts/adv_empty_options.json', JSON.stringify(catalogList, null, 2));
  console.log(`Saved ${catalogList.length} empty MCQ details to scripts/adv_empty_options.json`);

  // Detect which pages have graphs vs vector formulas
  // Let's inspect vector paths vs text items on each empty page
  const vectorTextPages = [];
  const graphCandidatePages = [];

  for (const item of catalogList) {
    if (!item.page) continue;
    const page = await doc.getPage(item.page);
    const ops = await page.getOperatorList();
    let pathCount = 0;
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjs.OPS.constructPath) pathCount++;
    }

    const tc = await page.getTextContent();
    const text = tc.items.map(i => i.str).join(' ');
    const mentionsGraph = /\b(graph|figure|scatterplot|xy-plane|parabola|vertex)\b/i.test(text);

    if (mentionsGraph && pathCount > 40) {
      graphCandidatePages.push({ id: item.id, page: item.page, pathCount });
    } else {
      vectorTextPages.push({ id: item.id, page: item.page, pathCount });
    }
  }

  console.log(`\nClassification of ${catalogList.length} empty-option questions:`);
  console.log(`  • Graph Candidates: ${graphCandidatePages.length}`);
  console.log(`  • Vector Outlined Text/Formulas: ${vectorTextPages.length}`);

  fs.writeFileSync('scripts/adv_classification.json', JSON.stringify({
    graphCandidatePages,
    vectorTextPages,
  }, null, 2));
}

catalog().catch(console.error);
