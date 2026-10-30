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
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

async function cropAllGraphs() {
  console.log('Loading ALGEBRA.pdf to crop all stimulus and option graphs...');
  const data = new Uint8Array(fs.readFileSync('raw-pdfs/ALGEBRA.pdf'));
  const doc = await pdfjs.getDocument({ data, canvasFactory }).promise;

  const stimulusGraphs = [];
  const optionGraphs = [];

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const items = content.items.filter(it => it.str.trim());
    const text = items.map(it => it.str).join(' ');

    const qMatch = text.match(/Question\s+ID\s*:\s*([a-f0-9]{8})/i);
    if (!qMatch) continue;
    const id = qMatch[1];

    // Check if Option Graph question:
    const isOptionGraph = id === 'a8e6bd75' || id === '6e6a3241' || id === '0b46bad5';
    if (isOptionGraph) {
      optionGraphs.push({ id, page: p });
      continue;
    }

    const qHeader = items.find(it => /^Question\b/i.test(it.str.trim()) && it.transform[5] < 700);
    const ansHeader = items.find(it => /^Answer\b/i.test(it.str.trim()) || /Correct\s+Answer/i.test(it.str));

    const betweenItems = items.filter(it => it.transform[5] < (qHeader ? qHeader.transform[5] : 700) && it.transform[5] > (ansHeader ? ansHeader.transform[5] : 0));
    betweenItems.sort((a, b) => b.transform[5] - a.transform[5]);

    const lines = [];
    let curY = null;
    let curLine = [];
    for (const it of betweenItems) {
      if (curY === null || Math.abs(curY - it.transform[5]) <= 3.5) {
        curLine.push(it);
        curY = it.transform[5];
      } else {
        lines.push({ y: curY, text: curLine.map(i => i.str).join(' ') });
        curLine = [it];
        curY = it.transform[5];
      }
    }
    if (curLine.length) lines.push({ y: curY, text: curLine.map(i => i.str).join(' ') });

    const proseLine = lines.find(l => /\b(The|In|Which|If|What|For|A|When|Line|At|Some|Ellen|Oxygen|Sam|Terry|One)\b/.test(l.text) && l.text.split(' ').length > 3);
    const qY = qHeader ? qHeader.transform[5] : 656;
    const proseY = proseLine ? proseLine.y : qY;
    const gap = qY - proseY;

    // Check operator path count in stimulus region
    const ops = await page.getOperatorList();
    let pathCount = 0;
    for (let i = 0; i < ops.fnArray.length; i++) {
      if (ops.fnArray[i] === pdfjs.OPS.constructPath) pathCount++;
    }

    // Don't crop if it's a table passage (tables are rendered with HTML sat-table)
    const isTableQuestion = /table\s+(gives|shows|above)/i.test(text) && !/gr\s*aph/i.test(text);

    if (gap > 70 && pathCount > 40 && !isTableQuestion) {
      stimulusGraphs.push({ id, page: p, qY, proseY, gap });
    }
  }

  console.log(`Found ${stimulusGraphs.length} stimulus graphs to crop!`);
  console.log(`Found ${optionGraphs.length} option graph questions to crop!`);

  // Crop stimulus graphs
  for (const g of stimulusGraphs) {
    const page = await doc.getPage(g.page);
    const scale = 2.0;
    const viewport = page.getViewport({ scale });
    const pageCanvas = createCanvas(viewport.width, viewport.height);
    const ctx = pageCanvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, viewport.width, viewport.height);
    await page.render({ canvasContext: ctx, viewport, canvasFactory }).promise;

    const pageHeightPt = page.view[3] || 792;
    const sourceTopY = Math.max(0, Math.round((pageHeightPt - (g.qY - 2)) * scale));
    const sourceBottomY = Math.min(viewport.height, Math.round((pageHeightPt - (g.proseY + 18)) * scale));
    const sourceH = sourceBottomY - sourceTopY;
    const cropW = Math.round(viewport.width - 40);
    const cropX = 20;

    const cropCanvas = createCanvas(cropW, sourceH);
    const cropCtx = cropCanvas.getContext('2d');
    cropCtx.fillStyle = '#ffffff';
    cropCtx.fillRect(0, 0, cropW, sourceH);
    cropCtx.drawImage(pageCanvas, cropX, sourceTopY, cropW, sourceH, 0, 0, cropW, sourceH);

    const outPath = path.join(IMAGES_DIR, `${g.id}.png`);
    fs.writeFileSync(outPath, cropCanvas.toBuffer('image/png'));
    console.log(`  Cropped stimulus graph [${g.id}] -> ${outPath}`);
  }

  // Crop option graphs
  // For 6e6a3241, 0b46bad5, a8e6bd75:
  for (const og of optionGraphs) {
    const page = await doc.getPage(og.page);
    const scale = 2.0;
    const viewport = page.getViewport({ scale });
    const pageCanvas = createCanvas(viewport.width, viewport.height);
    const ctx = pageCanvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, viewport.width, viewport.height);
    await page.render({ canvasContext: ctx, viewport, canvasFactory }).promise;

    // Use paintImageXObject locations if available
    const ops = await page.getOperatorList();
    let ctm = [1, 0, 0, 1, 0, 0];
    const ctmStack = [];
    const imgBoxes = [];

    for (let i = 0; i < ops.fnArray.length; i++) {
      const fn = ops.fnArray[i];
      const args = ops.argsArray[i];
      if (fn === pdfjs.OPS.save) ctmStack.push([...ctm]);
      else if (fn === pdfjs.OPS.restore) { if (ctmStack.length) ctm = ctmStack.pop(); }
      else if (fn === pdfjs.OPS.transform) {
        ctm = [
          ctm[0] * args[0] + ctm[2] * args[1],
          ctm[1] * args[0] + ctm[3] * args[1],
          ctm[0] * args[2] + ctm[2] * args[3],
          ctm[1] * args[2] + ctm[3] * args[3],
          ctm[0] * args[4] + ctm[2] * args[5] + ctm[4],
          ctm[1] * args[4] + ctm[3] * args[5] + ctm[5],
        ];
      } else if (fn === pdfjs.OPS.paintImageXObject) {
        const x = ctm[4];
        const y = ctm[5];
        const w = Math.abs(ctm[0]);
        const h = Math.abs(ctm[3]);
        if (w >= 40 && h >= 40) {
          imgBoxes.push({ x, y, w, h });
        }
      }
    }

    console.log(`  Option graph [${og.id}] found ${imgBoxes.length} image boxes on page ${og.page}`);
    // If 4 image boxes found (or on next page for a8e6bd75)
    imgBoxes.sort((a, b) => b.y - a.y); // top to bottom: A, B, C, D
    const letters = ['A', 'B', 'C', 'D'];
    const pageHeightPt = page.view[3] || 792;

    for (let idx = 0; idx < Math.min(imgBoxes.length, 4); idx++) {
      const b = imgBoxes[idx];
      const optLetter = letters[idx];
      const cx = Math.max(0, Math.round(b.x * scale));
      const cy = Math.max(0, Math.round((pageHeightPt - (b.y + b.h)) * scale));
      const cw = Math.round(b.w * scale);
      const ch = Math.round(b.h * scale);

      const optCanvas = createCanvas(cw + 10, ch + 10);
      const optCtx = optCanvas.getContext('2d');
      optCtx.fillStyle = '#ffffff';
      optCtx.fillRect(0, 0, cw + 10, ch + 10);
      optCtx.drawImage(pageCanvas, cx - 5, cy - 5, cw + 10, ch + 10, 0, 0, cw + 10, ch + 10);

      const outOpt = path.join(IMAGES_DIR, `${og.id}_opt_${optLetter}.png`);
      fs.writeFileSync(outOpt, optCanvas.toBuffer('image/png'));
      console.log(`    Cropped option ${optLetter} -> ${outOpt}`);
    }

    // If a8e6bd75, option D is on page 309
    if (og.id === 'a8e6bd75' && imgBoxes.length === 3) {
      const p309 = await doc.getPage(309);
      const p309Canvas = createCanvas(viewport.width, viewport.height);
      const p309Ctx = p309Canvas.getContext('2d');
      p309Ctx.fillStyle = '#ffffff';
      p309Ctx.fillRect(0, 0, viewport.width, viewport.height);
      await p309.render({ canvasContext: p309Ctx, viewport, canvasFactory }).promise;

      const p309Ops = await p309.getOperatorList();
      let ctm309 = [1, 0, 0, 1, 0, 0];
      const stack309 = [];
      let boxD = null;
      for (let i = 0; i < p309Ops.fnArray.length; i++) {
        const fn = p309Ops.fnArray[i];
        const args = p309Ops.argsArray[i];
        if (fn === pdfjs.OPS.save) stack309.push([...ctm309]);
        else if (fn === pdfjs.OPS.restore) { if (stack309.length) ctm309 = stack309.pop(); }
        else if (fn === pdfjs.OPS.transform) {
          ctm309 = [
            ctm309[0] * args[0] + ctm309[2] * args[1],
            ctm309[1] * args[0] + ctm309[3] * args[1],
            ctm309[0] * args[2] + ctm309[2] * args[3],
            ctm309[1] * args[2] + ctm309[3] * args[3],
            ctm309[0] * args[4] + ctm309[2] * args[5] + ctm309[4],
            ctm309[1] * args[4] + ctm309[3] * args[5] + ctm309[5],
          ];
        } else if (fn === pdfjs.OPS.paintImageXObject) {
          boxD = { x: ctm309[4], y: ctm309[5], w: Math.abs(ctm309[0]), h: Math.abs(ctm309[3]) };
          break;
        }
      }
      if (boxD) {
        const cx = Math.max(0, Math.round(boxD.x * scale));
        const cy = Math.max(0, Math.round((pageHeightPt - (boxD.y + boxD.h)) * scale));
        const cw = Math.round(boxD.w * scale);
        const ch = Math.round(boxD.h * scale);
        const optCanvas = createCanvas(cw + 10, ch + 10);
        const optCtx = optCanvas.getContext('2d');
        optCtx.fillStyle = '#ffffff';
        optCtx.fillRect(0, 0, cw + 10, ch + 10);
        optCtx.drawImage(p309Canvas, cx - 5, cy - 5, cw + 10, ch + 10, 0, 0, cw + 10, ch + 10);
        const outOptD = path.join(IMAGES_DIR, `${og.id}_opt_D.png`);
        fs.writeFileSync(outOptD, optCanvas.toBuffer('image/png'));
        console.log(`    Cropped option D from page 309 -> ${outOptD}`);
      }
    }
  }

  // Save the list of all stimulus graph IDs
  const graphIds = stimulusGraphs.map(g => g.id);
  fs.writeFileSync('scripts/detected_stimulus_graphs.json', JSON.stringify(graphIds, null, 2));
  console.log(`\nDone! Saved ${graphIds.length} stimulus graphs and ${optionGraphs.length} option graph sets.`);
}

cropAllGraphs().catch(console.error);
