import * as fs from 'fs';
import * as path from 'path';
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

const IMAGES_DIR = path.join('public', 'question-images', 'math');

const GRAPHS = [
  { id: '6abec9a8', page: 19 },
  { id: '252a3b3a', page: 46 },
  { id: '4ca30186', page: 58 },
  { id: 'b5c43226', page: 79 },
  { id: '97e50fa2', page: 101 },
  { id: 'df71424b', page: 105 },
  { id: '5f10c095', page: 111 },
  { id: 'f123e039', page: 134 },
  { id: 'cef0eada', page: 143 },
  { id: '5e63b9cf', page: 144 },
  { id: 'd0e8e8f5', page: 153 },
  { id: 'ebe4bde0', page: 172 },
  { id: 'd45572cc', page: 226 },
  { id: '50418728', page: 233 },
];

async function cropAll() {
  const data = new Uint8Array(fs.readFileSync('raw-pdfs/ADVANCED_MATHS.pdf'));
  const doc = await pdfjs.getDocument({ data, canvasFactory }).promise;

  for (const g of GRAPHS) {
    const page = await doc.getPage(g.page);
    const tc = await page.getTextContent();

    const qItem = tc.items.find(i => i.str.trim() === 'Question' && i.transform[5] < 700);
    const ansItem = tc.items.find(i => /^Answer\b/i.test(i.str.trim()) || /\bAnswer\s+[A-D]\./i.test(i.str));
    const ratItem = tc.items.find(i => /^Rationale\b/i.test(i.str.trim()));

    const qY = qItem ? Math.round(qItem.transform[5]) : 658;
    const ansY = ansItem ? Math.round(ansItem.transform[5]) : (ratItem ? Math.round(ratItem.transform[5]) : 200);

    // Find prose line below qY and above ansY
    const proseItems = tc.items.filter(i => i.transform[5] < qY - 10 && (ansY === 0 || i.transform[5] > ansY));
    const linesMap = {};
    for (const item of proseItems) {
      const y = Math.round(item.transform[5]);
      linesMap[y] = (linesMap[y] || '') + ' ' + item.str;
    }
    const sortedYs = Object.keys(linesMap).map(Number).sort((a, b) => b - a);
    let firstProseY = ansY + 50;
    for (const y of sortedYs) {
      const lText = linesMap[y].trim();
      if (lText.length > 20 && /^[A-Z]/.test(lText)) {
        firstProseY = y;
        break;
      }
    }

    const scale = 2.0;
    const viewport = page.getViewport({ scale });
    const pageCanvas = createCanvas(viewport.width, viewport.height);
    const ctx = pageCanvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, viewport.width, viewport.height);
    await page.render({ canvasContext: ctx, viewport, canvasFactory }).promise;

    const pageHeightPt = page.view[3] || 792;
    const sourceTopY = Math.max(0, Math.round((pageHeightPt - (qY - 2)) * scale));
    const sourceBottomY = Math.min(viewport.height, Math.round((pageHeightPt - (firstProseY + 18)) * scale));
    const sourceH = Math.max(50, sourceBottomY - sourceTopY);
    const cropW = Math.round(viewport.width - 40);
    const cropX = 20;

    const cropCanvas = createCanvas(cropW, sourceH);
    const cropCtx = cropCanvas.getContext('2d');
    cropCtx.fillStyle = '#ffffff';
    cropCtx.fillRect(0, 0, cropW, sourceH);
    cropCtx.drawImage(pageCanvas, cropX, sourceTopY, cropW, sourceH, 0, 0, cropW, sourceH);

    const outPath = path.join(IMAGES_DIR, `${g.id}.png`);
    fs.writeFileSync(outPath, cropCanvas.toBuffer('image/png'));
    console.log(`Cropped [${g.id}] (Page ${g.page}) -> ${outPath}`);
  }
}

cropAll().catch(console.error);
