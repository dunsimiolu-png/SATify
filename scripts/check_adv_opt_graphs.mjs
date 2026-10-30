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

async function checkOptionGraphs() {
  const data = new Uint8Array(fs.readFileSync('raw-pdfs/ADVANCED_MATHS.pdf'));
  const doc = await pdfjs.getDocument({ data, canvasFactory }).promise;

  const found = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const tc = await page.getTextContent();
    const text = tc.items.map(i => i.str).join(' ');
    const idMatch = text.match(/Question\s+ID\s*:\s*([a-f0-9]{8})/i) || text.match(/ID\s*:\s*([a-f0-9]{8})/i);
    const id = idMatch ? idMatch[1] : '';

    const ansItem = tc.items.find(i => /^Answer\b/i.test(i.str.trim()) || /\bAnswer\s+[A-D]\./i.test(i.str));
    const corrItem = tc.items.find(i => /Correct\s+Answer/i.test(i.str));

    if (!ansItem || !corrItem) continue;

    const ansY = ansItem.transform[5];
    const corrY = corrItem.transform[5];

    // Check if the gap between Answer and Correct Answer is large (> 100 pt)
    const optGap = ansY - corrY;

    const ops = await page.getOperatorList();
    let optPathCount = 0;
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjs.OPS.constructPath) {
        // We can check path position if possible, or just optGap
        optPathCount++;
      }
    }

    if (optGap > 120 && optPathCount > 50) {
      found.push({ id, page: p, optGap, optPathCount });
      console.log(`Option graph candidate: [${id}] on page ${p}, gap=${optGap}pt, paths=${optPathCount}`);
    }
  }

  console.log(`Total option graph candidates in ADVANCED_MATHS: ${found.length}`);
}

checkOptionGraphs().catch(console.error);
