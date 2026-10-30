import * as fs from 'fs';
import { createCanvas, DOMMatrix, Path2D } from '@napi-rs/canvas';
globalThis.DOMMatrix = DOMMatrix;
globalThis.Path2D = Path2D;
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.js';

async function catalog() {
  const data = new Uint8Array(fs.readFileSync('raw-pdfs/ALGEBRA.pdf'));
  const doc = await pdfjs.getDocument({ data }).promise;

  const questions = [];

  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const text = content.items.map(it => it.str).join(' ');
    const qMatch = text.match(/Question\s+ID\s*:\s*([a-f0-9]{8})/i);

    if (qMatch) {
      const id = qMatch[1];
      const ops = await page.getOperatorList();
      let pathCount = 0;
      let imgCount = 0;
      for (let i = 0; i < ops.fnArray.length; i++) {
        if (ops.fnArray[i] === pdfjs.OPS.constructPath) pathCount++;
        if (ops.fnArray[i] === pdfjs.OPS.paintImageXObject) imgCount++;
      }

      // Check MCQ vs SPR
      const isSpr = !text.includes('Answer\n') && !text.includes('Answer \n') && !/Answer\s+[A-D]\./i.test(text) && !/A\s*\.\s*[\s\S]*?B\s*\./i.test(text);

      // Check difficulty
      let diff = 'Medium';
      if (/Difficulty\s*Easy/i.test(text)) diff = 'Easy';
      else if (/Difficulty\s*Hard/i.test(text)) diff = 'Hard';

      // Check skill
      let skill = 'Linear equations';
      if (/Systems of two linear/i.test(text)) skill = 'Systems of two linear equations in two variables';
      else if (/Linear inequalities/i.test(text)) skill = 'Linear inequalities in one or two variables';
      else if (/Linear functions/i.test(text)) skill = 'Linear functions';
      else if (/two variables/i.test(text)) skill = 'Linear equations in two variables';
      else if (/one variable/i.test(text)) skill = 'Linear equations in one variable';

      questions.push({
        id,
        pageNum: p,
        diff,
        skill,
        pathCount,
        imgCount,
        isSpr,
        hasTable: /table/i.test(text),
        hasGraphMention: /\b(graph|figure|scatterplot|xy-plane)\b/i.test(text),
      });
    }
  }

  console.log(`Total questions detected in ALGEBRA.pdf: ${questions.length}`);
  const sprCount = questions.filter(q => q.isSpr).length;
  const mcqCount = questions.filter(q => !q.isSpr).length;
  console.log(`MCQ: ${mcqCount}, SPR: ${sprCount}`);

  // High path count indicates either a coordinate graph or extensive vector math
  const highPaths = questions.filter(q => q.pathCount > 100);
  console.log(`Questions with >100 vector paths: ${highPaths.length}`);

  // Questions with images (image XObjects)
  const withImgs = questions.filter(q => q.imgCount > 0);
  console.log(`Questions with image XObjects: ${withImgs.length}`);
  withImgs.forEach(q => console.log(`  [${q.id}] page ${q.pageNum}: images=${q.imgCount}, paths=${q.pathCount}`));

  // Questions mentioning table
  const withTable = questions.filter(q => q.hasTable);
  console.log(`Questions mentioning table: ${withTable.length}`);

  // Questions mentioning graph/figure/xy-plane
  const withGraph = questions.filter(q => q.hasGraphMention);
  console.log(`Questions mentioning graph/xy-plane: ${withGraph.length}`);
}

catalog().catch(console.error);
