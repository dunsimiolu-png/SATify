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
  const data = new Uint8Array(fs.readFileSync('raw-pdfs/ADVANCED_MATHS.pdf'));
  const doc = await pdfjs.getDocument({ data, canvasFactory }).promise;

  const emptyList = JSON.parse(fs.readFileSync('scripts/adv_empty_options.json', 'utf8'));

  console.log(`Starting OCR extraction for ${emptyList.length} vector questions in ADVANCED_MATHS.pdf...`);

  const results = {};
  const scheduler = Tesseract.createScheduler();
  const worker1 = await Tesseract.createWorker('eng');
  const worker2 = await Tesseract.createWorker('eng');
  scheduler.addWorker(worker1);
  scheduler.addWorker(worker2);

  const jobs = [];
  for (let i = 0; i < emptyList.length; i++) {
    const { id, page: pageNum } = emptyList[i];
    if (!pageNum) continue;
    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, viewport.width, viewport.height);
    await page.render({ canvasContext: ctx, viewport, canvasFactory }).promise;

    // Crop question area: exclude top assessment header (top 12% of page)
    const topY = Math.round(viewport.height * 0.12);
    const cropH = Math.round(viewport.height * 0.88);
    const cropCanvas = createCanvas(viewport.width, cropH);
    cropCanvas.getContext('2d').drawImage(canvas, 0, topY, viewport.width, cropH, 0, 0, viewport.width, cropH);
    const buf = cropCanvas.toBuffer('image/png');

    jobs.push({ id, pageNum, buf });
  }

  console.log(`Rendered ${jobs.length} canvases. Running OCR jobs in parallel...`);

  const startTime = Date.now();
  await Promise.all(jobs.map(async (job, idx) => {
    const res = await scheduler.addJob('recognize', job.buf);
    results[job.id] = {
      page: job.pageNum,
      ocrText: res.data.text,
      confidence: res.data.confidence,
    };
    if ((idx + 1) % 10 === 0 || idx === jobs.length - 1) {
      console.log(`  Processed ${idx + 1}/${jobs.length} (${Math.round((Date.now() - startTime) / 1000)}s)`);
    }
  }));

  await scheduler.terminate();

  fs.writeFileSync('scripts/adv_vector_extracted_raw.json', JSON.stringify(results, null, 2));
  console.log(`OCR complete! Saved ${Object.keys(results).length} items to scripts/adv_vector_extracted_raw.json`);
}

extractAll().catch(console.error);
