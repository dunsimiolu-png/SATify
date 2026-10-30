import Tesseract from 'tesseract.js';
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

async function extractAll() {
  const data = new Uint8Array(fs.readFileSync('raw-pdfs/ALGEBRA.pdf'));
  const doc = await pdfjs.getDocument({ data, canvasFactory }).promise;

  const classData = JSON.parse(fs.readFileSync('scripts/empty_options_classified.json', 'utf8'));
  const vectorList = classData.vectorText;

  console.log(`Starting OCR extraction for ${vectorList.length} vector questions...`);

  const results = {};
  const scheduler = Tesseract.createScheduler();
  const worker1 = await Tesseract.createWorker('eng');
  const worker2 = await Tesseract.createWorker('eng');
  scheduler.addWorker(worker1);
  scheduler.addWorker(worker2);

  const jobs = [];
  for (let i = 0; i < vectorList.length; i++) {
    const { id, page: pageNum } = vectorList[i];
    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, viewport.width, viewport.height);
    await page.render({ canvasContext: ctx, viewport, canvasFactory }).promise;

    // Crop question area: exclude top assessment header (top 15% of page)
    const topY = Math.round(viewport.height * 0.12);
    const cropH = Math.round(viewport.height * 0.88);
    const cropCanvas = createCanvas(viewport.width, cropH);
    cropCanvas.getContext('2d').drawImage(canvas, 0, topY, viewport.width, cropH, 0, 0, viewport.width, cropH);
    const buf = cropCanvas.toBuffer('image/png');

    jobs.push({ id, pageNum, buf });
  }

  console.log(`Rendered all ${jobs.length} canvases. Now running parallel OCR...`);

  let completed = 0;
  await Promise.all(
    jobs.map(async (job) => {
      const res = await scheduler.addJob('recognize', job.buf);
      results[job.id] = {
        id: job.id,
        page: job.pageNum,
        ocrText: res.data.text,
      };
      completed++;
      if (completed % 10 === 0 || completed === jobs.length) {
        console.log(`OCR Progress: ${completed} / ${jobs.length}`);
      }
    })
  );

  await scheduler.terminate();

  fs.writeFileSync('scripts/vector_extracted_raw.json', JSON.stringify(results, null, 2));
  console.log('Saved OCR results to scripts/vector_extracted_raw.json!');
}

extractAll().catch(console.error);
