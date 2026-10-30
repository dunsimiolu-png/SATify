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

async function findGraphs() {
  const data = new Uint8Array(fs.readFileSync('raw-pdfs/ADVANCED_MATHS.pdf'));
  const doc = await pdfjs.getDocument({ data, canvasFactory }).promise;
  const numPages = doc.numPages;

  console.log(`Analyzing ${numPages} pages of ADVANCED_MATHS.pdf for genuine graphs...`);

  const genuineGraphs = [];
  const optionGraphs = [];

  for (let p = 1; p <= numPages; p++) {
    const page = await doc.getPage(p);
    const tc = await page.getTextContent();
    const text = tc.items.map(i => i.str).join(' ');
    const idMatch = text.match(/Question\s+ID\s*:\s*([a-f0-9]{8})/i) || text.match(/ID\s*:\s*([a-f0-9]{8})/i);
    const id = idMatch ? idMatch[1] : `page_${p}`;

    const lines = [];
    for (const item of tc.items) {
      const str = item.str.trim();
      if (!str) continue;
      const y = Math.round(item.transform[5]);
      const x = Math.round(item.transform[4]);
      let line = lines.find(l => Math.abs(l.y - y) <= 4);
      if (!line) {
        line = { y, items: [] };
        lines.push(line);
      }
      line.items.push({ str, x });
    }
    lines.sort((a, b) => b.y - a.y);
    for (const l of lines) {
      l.items.sort((a, b) => a.x - b.x);
      l.text = l.items.map(i => i.str).join(' ');
    }

    const qIdx = lines.findIndex(l => l.y < 700 && /^Question\b/i.test(l.text.trim()) && !l.text.includes('ID:'));
    const ansIdx = lines.findIndex(l => /^Answer\b/i.test(l.text.trim()) || /\bAnswer\s+[A-D]\./i.test(l.text));

    if (qIdx === -1) continue;

    const qY = lines[qIdx].y;
    const ansY = ansIdx !== -1 ? lines[ansIdx].y : 0;

    // Check for option graphs: options with image boxes or large gaps
    const hasOptGraphs = /Which of the following could be the graph/i.test(text) ||
                         /Which of the following is the graph/i.test(text) ||
                         /Which graph/i.test(text);

    // Prose lines between Question and Answer
    const betweenLines = lines.filter(l => l.y < qY && (ansY === 0 || l.y > ansY));
    const proseLines = betweenLines.filter(l => l.text.length > 25 && /^[A-Z]/.test(l.text.trim()));

    let proseY = proseLines.length > 0 ? proseLines[0].y : (betweenLines.length > 0 ? betweenLines[0].y : ansY);
    const gap = qY - proseY;

    const ops = await page.getOperatorList();
    let pathCount = 0;
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjs.OPS.constructPath) pathCount++;
    }

    const isTable = /table\s+(gives|shows|above)/i.test(text) && !/gr\s*aph/i.test(text);

    if (gap > 75 && pathCount > 40 && !isTable) {
      genuineGraphs.push({ id, page: p, qY, proseY, gap, pathCount, textSnippet: text.slice(0, 100) });
    } else if (hasOptGraphs) {
      optionGraphs.push({ id, page: p, textSnippet: text.slice(0, 100) });
    }
  }

  console.log(`\nDetected ${genuineGraphs.length} genuine stimulus graphs in ADVANCED_MATHS.pdf:`);
  genuineGraphs.forEach(g => console.log(`  • [${g.id}] Page ${g.page}: gap=${g.gap}pt, paths=${g.pathCount}`));

  console.log(`\nDetected ${optionGraphs.length} option graph candidates in ADVANCED_MATHS.pdf:`);
  optionGraphs.forEach(og => console.log(`  • [${og.id}] Page ${og.page}`));

  fs.writeFileSync('scripts/adv_detected_graphs.json', JSON.stringify({
    genuineGraphs,
    optionGraphs
  }, null, 2));
}

findGraphs().catch(console.error);
