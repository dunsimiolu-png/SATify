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

async function auditAllVisuals() {
  const data = new Uint8Array(fs.readFileSync('raw-pdfs/ADVANCED_MATHS.pdf'));
  const doc = await pdfjs.getDocument({ data, canvasFactory }).promise;

  const foundGraphs = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const tc = await page.getTextContent();
    const text = tc.items.map(i => i.str).join(' ');
    const idMatch = text.match(/Question\s+ID\s*:\s*([a-f0-9]{8})/i) || text.match(/ID\s*:\s*([a-f0-9]{8})/i);
    const id = idMatch ? idMatch[1] : '';

    const ops = await page.getOperatorList();
    let pathCount = 0;
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjs.OPS.constructPath) pathCount++;
    }

    const mentionsVisual = /\b(graph\s+shown|graph\s+above|graphed\s+above|shown\s+in\s+the\s+xy-plane|shown\s+above)\b/i.test(text);
    if (mentionsVisual && pathCount > 20) {
      foundGraphs.push({ id, page: p, pathCount, textSnippet: text.slice(0, 150) });
      console.log(`Visual page ${p} [${id}]: paths=${pathCount}`);
    }
  }

  console.log(`Total visual graph mentions with paths: ${foundGraphs.length}`);
  fs.writeFileSync('scripts/adv_visual_audit.json', JSON.stringify(foundGraphs, null, 2));
}

auditAllVisuals().catch(console.error);
