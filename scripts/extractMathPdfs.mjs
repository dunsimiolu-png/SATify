import * as fs from 'fs';
import * as path from 'path';
import { createCanvas, DOMMatrix, Path2D } from '@napi-rs/canvas';

// Polyfill canvas classes for pdfjs-dist
globalThis.DOMMatrix = DOMMatrix;
globalThis.Path2D = Path2D;

// Custom canvas factory backed by @napi-rs/canvas for pdfjs-dist rendering
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

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';

// Ensure public math images directory exists
const IMAGES_DIR = path.join('public', 'question-images', 'math');
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

const OUTPUT_PATH = path.join('src', 'data', 'mathQuestions.json');

// -----------------------------------------------------------------------------
// Canonical Official Digital SAT Math Domains & 19 Subtopics
// -----------------------------------------------------------------------------
const MATH_DOMAIN_TO_SKILLS = {
  'Algebra': [
    'Linear equations in one variable',
    'Linear equations in two variables',
    'Linear functions',
    'Systems of two linear equations in two variables',
    'Linear inequalities in one or two variables',
  ],
  'Advanced Math': [
    'Equivalent expressions',
    'Nonlinear equations in one variable and systems of equations in two variables',
    'Nonlinear functions',
  ],
  'Problem-Solving and Data Analysis': [
    'Ratios, rates, proportional relationships, and units',
    'Percentages',
    'One-variable data: Distributions and measures of center and spread',
    'Two-variable data: Models and scatterplots',
    'Probability and conditional probability',
    'Inference from sample statistics and margin of error',
    'Evaluating statistical claims: Observational studies and experiments',
  ],
  'Geometry and Trigonometry': [
    'Area and volume',
    'Lines, angles, and triangles',
    'Right triangles and trigonometry',
    'Circles',
  ],
};

const SKILL_TO_DOMAIN = {};
for (const [dom, skills] of Object.entries(MATH_DOMAIN_TO_SKILLS)) {
  for (const sk of skills) {
    SKILL_TO_DOMAIN[sk] = dom;
  }
}

// -----------------------------------------------------------------------------
// Math Text & Ligature Cleaning Engine
// -----------------------------------------------------------------------------
function cleanMathText(text) {
  if (!text) return '';
  let res = text;

  // Unicode minus, dashes & mathematical hyphens
  res = res
    .replace(/[\u2212\u2013\u2014]/g, '-')
    .replace(/\b([A-Za-z0-9]+)\s*-\s*([A-Za-z0-9]+)\b/g, '$1-$2');

  // Math terms and kerning pairs common in College Board PDFs
  const replacements = [
    [/\bAlgebr\s+a\b/gi, 'Algebra'],
    [/\bT\s+rigonometry\b/gi, 'Trigonometry'],
    [/\br\s+ates,?\s+propor\s+tional\b/gi, 'rates, proportional'],
    [/\br\s+ates?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bpropor\s+tional\b/gi, 'proportional'],
    [/\bpropor\s+tion(s)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bT\s+wo-variable\b/gi, 'Two-variable'],
    [/\bOne-variable\b/gi, 'One-variable'],
    [/\bdistr\s+ibution(s)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bdistr\s+ibutive\b/gi, 'distributive'],
    [/\bmeasur\s+e(s)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\btr\s+iangle(s)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bCir\s+cle(s)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bCir\s+cles\b/gi, 'Circles'],
    [/\bquadr\s+atic\b/gi, 'quadratic'],
    [/\bquadr\s+ilateral(s)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bper\s+pendicular\b/gi, 'perpendicular'],
    [/\bcoor\s+dinate(s)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bpar\s+abola(s)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bpar\s+allel\b/gi, 'parallel'],
    [/\bline\s+ar\b/gi, 'linear'],
    [/\bequ\s+ation(s)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\binequ\s+alit(y|ies)\b/gi, m => m.replace(/\s+/g, '')],
    [/\bco\s+efficient(s)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bcoeffi\s+cient(s)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bcon\s+stant(s)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\binter\s+sect(s|ed|ing|ion|ions)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\binter\s+cept(s|ed|ing)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bprob\s+abilit(y|ies)\b/gi, m => m.replace(/\s+/g, '')],
    [/\bper\s+cent(age|ages)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bexper\s+iment(s|al)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bstatis\s+tic(s|al)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bproper\s+ty\b/gi, 'property'],
    [/\bproper\s+ties\b/gi, 'properties'],
    [/\bsubtr\s+act(ing|ion|ed|s)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bmultip\s+ly(ing)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bdivi\s+d(e|ed|ing|ion)\b/gi, m => m.replace(/\s+/g, '')],
    [/\bxy\s*-\s*plane\b/gi, 'xy-plane'],
    [/\bx\s*-\s*axis\b/gi, 'x-axis'],
    [/\by\s*-\s*axis\b/gi, 'y-axis'],
    [/\bx\s*-\s*intercept\b/gi, 'x-intercept'],
    [/\by\s*-\s*intercept\b/gi, 'y-intercept'],
    [/\bx\s*-\s*coordinate\b/gi, 'x-coordinate'],
    [/\by\s*-\s*coordinate\b/gi, 'y-coordinate'],
    [/\bNO\s+T\b/g, 'NOT'],
    [/\bChoice\s*([A-D])\s*is\b/g, 'Choice $1 is'],
    [/\bChoice\s*([A-D])\b/g, 'Choice $1'],
    [/\bf\s*\(\s*x\s*\)/g, 'f(x)'],
    [/\bg\s*\(\s*x\s*\)/g, 'g(x)'],
    [/\bh\s*\(\s*x\s*\)/g, 'h(x)'],
    [/\bp\s*\(\s*x\s*\)/g, 'p(x)'],
    [/\bq\s*\(\s*x\s*\)/g, 'q(x)'],
    [/\bSA\s+T\b/g, 'SAT'],
  ];

  for (const [pattern, rep] of replacements) {
    res = res.replace(pattern, rep);
  }

  // Punctuation spacing
  res = res
    .replace(/\s+([’'.,;?!:])/g, '$1')
    .replace(/([“‘])\s+/g, '$1')
    .replace(/\b([A-D])\s+\./g, '$1.')
    .replace(/([,;?!])([A-Za-z])/g, '$1 $2');

  // Collapse consecutive horizontal whitespace
  res = res.replace(/[ \t]+/g, ' ').replace(/[ \t]*\n[ \t]*/g, '\n').trim();
  return res;
}

// -----------------------------------------------------------------------------
// Official Digital SAT Math Skill Extraction
// -----------------------------------------------------------------------------
function getMathSkill(normalizedHeader, defaultDomain) {
  const h = normalizedHeader.toLowerCase();

  if (defaultDomain === 'Algebra') {
    if (h.includes('system')) return 'Systems of two linear equations in two variables';
    if (h.includes('inequalit')) return 'Linear inequalities in one or two variables';
    if (h.includes('linear function')) return 'Linear functions';
    if (h.includes('one') && h.includes('variable')) return 'Linear equations in one variable';
    if (h.includes('two') && h.includes('variable')) return 'Linear equations in two variables';
    return 'Linear equations in one variable';
  }

  if (defaultDomain === 'Advanced Math') {
    if (h.includes('equivalent')) return 'Equivalent expressions';
    if (h.includes('nonlinear function')) return 'Nonlinear functions';
    if (h.includes('nonlinear') || h.includes('system')) return 'Nonlinear equations in one variable and systems of equations in two variables';
    return 'Nonlinear functions';
  }

  if (defaultDomain === 'Problem-Solving and Data Analysis') {
    if (h.includes('evaluating') || h.includes('observational') || h.includes('experiment')) {
      return 'Evaluating statistical claims: Observational studies and experiments';
    }
    if (h.includes('inference') || h.includes('margin of error') || h.includes('sample statistic')) {
      return 'Inference from sample statistics and margin of error';
    }
    if (h.includes('ratio') || h.includes('rate') || h.includes('proport')) {
      return 'Ratios, rates, proportional relationships, and units';
    }
    if (h.includes('percent')) {
      return 'Percentages';
    }
    if (h.includes('one') && (h.includes('variable') || h.includes('distribution') || h.includes('spread') || h.includes('center'))) {
      return 'One-variable data: Distributions and measures of center and spread';
    }
    if (h.includes('two') && (h.includes('variable') || h.includes('scatter') || h.includes('model'))) {
      return 'Two-variable data: Models and scatterplots';
    }
    if (h.includes('probabilit')) {
      return 'Probability and conditional probability';
    }
    return 'Ratios, rates, proportional relationships, and units';
  }

  if (defaultDomain === 'Geometry and Trigonometry') {
    if (h.includes('area') || h.includes('volume')) return 'Area and volume';
    if (h.includes('circle')) return 'Circles';
    if (h.includes('right') || h.includes('trigonometr')) return 'Right triangles and trigonometry';
    if (h.includes('line') || h.includes('angle') || h.includes('triangle')) return 'Lines, angles, and triangles';
    return 'Lines, angles, and triangles';
  }

  return 'Linear equations in one variable';
}

// -----------------------------------------------------------------------------
// Official Accepted Answers Generator for Student-Produced Responses (SPR)
// -----------------------------------------------------------------------------
function generateAcceptedAnswers(rawStr) {
  const set = new Set();
  if (!rawStr) return [];
  // Split on comma, semicolon, "or", "and"
  const parts = rawStr.split(/[,;]|\bor\b|\band\b/i).map(s => s.trim()).filter(Boolean);
  for (const part of parts) {
    const p = cleanMathText(part).replace(/[^\d\.\/\-]/g, '');
    if (!p) continue;
    set.add(p);
    // Fraction case: calculate decimal equivalents
    if (p.includes('/')) {
      const [numStr, denStr] = p.split('/');
      const num = parseFloat(numStr);
      const den = parseFloat(denStr);
      if (!isNaN(num) && !isNaN(den) && den !== 0) {
        const dec = num / den;
        set.add(String(dec));
        set.add(dec.toFixed(3));
        set.add(dec.toFixed(4));
        const decStr = String(dec);
        if (decStr.startsWith('0.')) {
          set.add(decStr.slice(1)); // e.g. .6
        } else if (decStr.startsWith('-0.')) {
          set.add('-' + decStr.slice(3));
        }
      }
    } else {
      const num = parseFloat(p);
      if (!isNaN(num)) {
        if (p.startsWith('.')) {
          set.add('0' + p);
        } else if (p.startsWith('0.')) {
          set.add(p.slice(1));
        } else if (p.startsWith('-.')) {
          set.add('-0.' + p.slice(2));
        } else if (p.startsWith('-0.')) {
          set.add('-.' + p.slice(3));
        }
      }
    }
  }
  return Array.from(set);
}

// -----------------------------------------------------------------------------
// Matrix Helper for Operator Stream Transform Tracking
// -----------------------------------------------------------------------------
function multiplyMatrix(m1, m2) {
  return [
    m1[0] * m2[0] + m1[2] * m2[1],
    m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3],
    m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
  ];
}

// -----------------------------------------------------------------------------
// Check if a Canvas Has Non-White Visual Drawing Content
// -----------------------------------------------------------------------------
function hasVisualContent(canvas, threshold = 60) {
  const ctx = canvas.getContext('2d');
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  let nonWhiteCount = 0;
  for (let i = 0; i < data.length; i += 16) { // sample every 4th pixel
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a > 20 && (r < 240 || g < 240 || b < 240)) {
      nonWhiteCount++;
      if (nonWhiteCount >= threshold) return true;
    }
  }
  return false;
}

// -----------------------------------------------------------------------------
// Assemble Text Lines from PDF Page
// -----------------------------------------------------------------------------
function assemblePageLines(content) {
  const items = (content.items || []).filter(it => it.str);
  if (items.length === 0) return [];

  // Sort baseline items top-to-bottom (Y desc), then left-to-right (X asc)
  const sorted = [...items].sort((a, b) => b.transform[5] - a.transform[5] || a.transform[4] - b.transform[4]);

  const lineGroups = [];
  let curGroup = [];
  let curY = null;

  for (const it of sorted) {
    const y = it.transform[5];
    if (curY === null || Math.abs(curY - y) <= 3.2) {
      curGroup.push(it);
      if (curY === null) curY = y;
    } else {
      lineGroups.push({ y: curY, items: curGroup });
      curGroup = [it];
      curY = y;
    }
  }
  if (curGroup.length) lineGroups.push({ y: curY, items: curGroup });

  return lineGroups.map(({ y, items: lineItems }) => {
    lineItems.sort((a, b) => a.transform[4] - b.transform[4]);
    let text = '';
    const minX = lineItems[0].transform[4];
    const maxX = lineItems[lineItems.length - 1].transform[4] + lineItems[lineItems.length - 1].width;
    const width = maxX - minX;

    for (let i = 0; i < lineItems.length; i++) {
      const it = lineItems[i];
      if (i === 0) {
        text += it.str;
      } else {
        const prev = lineItems[i - 1];
        const prevEnd = prev.transform[4] + prev.width;
        const dx = it.transform[4] - prevEnd;
        if (dx > 2.0 && !text.endsWith(' ') && !it.str.startsWith(' ')) {
          text += ' ';
        }
        text += it.str;
      }
    }

    return {
      y,
      minX,
      width,
      text: cleanMathText(text),
      rawItems: lineItems,
    };
  });
}

// -----------------------------------------------------------------------------
// Extract Vector Paths and Images per Page
// -----------------------------------------------------------------------------
async function extractPageVisualElements(page) {
  const ops = await page.getOperatorList();
  let ctm = [1, 0, 0, 1, 0, 0];
  const ctmStack = [];
  const paths = [];
  const images = [];

  for (let i = 0; i < ops.fnArray.length; i++) {
    const fn = ops.fnArray[i];
    const args = ops.argsArray[i];
    if (fn === pdfjsLib.OPS.save) {
      ctmStack.push([...ctm]);
    } else if (fn === pdfjsLib.OPS.restore) {
      if (ctmStack.length) ctm = ctmStack.pop();
    } else if (fn === pdfjsLib.OPS.transform) {
      ctm = multiplyMatrix(ctm, args);
    } else if (fn === pdfjsLib.OPS.constructPath) {
      const pArgs = args[1];
      if (pArgs && pArgs.length >= 2) {
        let minY = Infinity, maxY = -Infinity;
        for (let j = 0; j < pArgs.length; j += 2) {
          const y = ctm[1] * pArgs[j] + ctm[3] * pArgs[j + 1] + ctm[5];
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
        paths.push({ minY, maxY });
      }
    } else if (fn === pdfjsLib.OPS.paintImageXObject) {
      images.push({ y: ctm[5], h: Math.abs(ctm[3]) });
    }
  }
  return { paths, images };
}

// -----------------------------------------------------------------------------
// Main Extraction Pipeline
// -----------------------------------------------------------------------------
async function extractMathPdfs() {
  console.log('========================================================================');
  console.log('           SATify: Dedicated Digital SAT Math Extraction Pipeline       ');
  console.log('========================================================================\n');

  const mathPdfs = [
    { file: 'ALGEBRA.pdf', defaultDomain: 'Algebra' },
    { file: 'ADVANCED_MATHS.pdf', defaultDomain: 'Advanced Math' },
    { file: 'PROBLEM_SOLVING_AND_DATA_ANALYSIS.pdf', defaultDomain: 'Problem-Solving and Data Analysis' },
    { file: 'GEOMETRY_AND_TRIGONOMETRY.pdf', defaultDomain: 'Geometry and Trigonometry' },
  ];

  const allQuestions = [];
  const domainStats = {};
  const skillStats = {};
  const diffStats = { Easy: 0, Medium: 0, Hard: 0 };
  let totalFiguresCropped = 0;
  let totalOptionGraphsCropped = 0;
  let totalSpr = 0;
  let totalMcq = 0;

  for (const { file, defaultDomain } of mathPdfs) {
    const filePath = path.join('raw-pdfs', file);
    if (!fs.existsSync(filePath)) {
      console.warn(`[WARN] File not found: ${filePath}`);
      continue;
    }

    process.stdout.write(`Processing ${file.padEnd(38)} ... `);
    const data = new Uint8Array(fs.readFileSync(filePath));
    const doc = await pdfjsLib.getDocument({ data, canvasFactory }).promise;
    console.log(`(${doc.numPages} pages)`);

    // Preload all pages and lines
    const pagesInfo = [];
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      const lines = assemblePageLines(content);
      const { paths, images } = await extractPageVisualElements(page);
      const fullText = lines.map(l => l.text).join(' ');
      pagesInfo.push({ p, page, content, lines, paths, images, fullText });
    }

    // Locate question start indices
    const questionStartPages = [];
    for (let i = 0; i < pagesInfo.length; i++) {
      const m = pagesInfo[i].fullText.match(/Question\s+ID\s*:\s*([a-f0-9]{8})/i);
      if (m) {
        questionStartPages.push({ pageIdx: i, id: m[1] });
      }
    }

    let fileExtracted = 0;
    let fileSpr = 0;
    let fileMcq = 0;

    for (let qIdx = 0; qIdx < questionStartPages.length; qIdx++) {
      const startEntry = questionStartPages[qIdx];
      const nextEntry = questionStartPages[qIdx + 1];
      const startPageIdx = startEntry.pageIdx;
      const endPageIdx = nextEntry ? nextEntry.pageIdx : pagesInfo.length;

      const id = startEntry.id;
      const firstPageObj = pagesInfo[startPageIdx];
      const firstLines = firstPageObj.lines;

      // Identify question header on first page
      const qHeaderIdx = firstLines.findIndex(l => l.text.startsWith('Question') && l.y < 700);
      if (qHeaderIdx === -1) continue;

      const rawHeaderText = firstLines.slice(0, qHeaderIdx).map(l => l.text).join(' ');
      const normalizedHeader = cleanMathText(rawHeaderText).replace(/&/g, 'and');

      // Difficulty
      let difficulty = 'Medium';
      if (/\bDifficulty\s+Easy\b/i.test(normalizedHeader) || /\bEasy\b/i.test(normalizedHeader)) {
        difficulty = 'Easy';
      } else if (/\bDifficulty\s+Hard\b/i.test(normalizedHeader) || /\bHard\b/i.test(normalizedHeader)) {
        difficulty = 'Hard';
      }

      // Canonical Domain & Skill
      const canonicalSkill = getMathSkill(normalizedHeader, defaultDomain);
      const domain = SKILL_TO_DOMAIN[canonicalSkill] || defaultDomain;

      // Locate Answer / Correct Answer markers
      const ansHeaderIdx = firstLines.findIndex(l => l.text.trim() === 'Answer' || l.text.startsWith('Answer '));
      const corrAnsIdx = firstLines.findIndex(l => /Correct\s+Answer/i.test(l.text));
      const isSPR = ansHeaderIdx === -1;
      const questionType = isSPR ? 'spr' : 'mcq';

      const qEndLineIdx = ansHeaderIdx !== -1 ? ansHeaderIdx : (corrAnsIdx !== -1 ? corrAnsIdx : firstLines.length);
      const betweenLines = firstLines.slice(qHeaderIdx + 1, qEndLineIdx);
      const betweenText = betweenLines.map(l => l.text).join(' ');

      // -----------------------------------------------------------------------
      // Detect Visual Figure / Equation / Diagram on First Page
      // -----------------------------------------------------------------------
      const qHeaderY = firstLines[qHeaderIdx].y;
      const ansY = ansHeaderIdx !== -1 ? firstLines[ansHeaderIdx].y : (corrAnsIdx !== -1 ? firstLines[corrAnsIdx].y : 0);

      let firstProseLineY = null;
      let lastProseLineY = null;
      if (betweenLines.length > 0) {
        firstProseLineY = betweenLines[0].y;
        lastProseLineY = betweenLines[betweenLines.length - 1].y;
      }

      const promptCandidateText = betweenText.toLowerCase();
      const promptMentionsVisual = /\b(graph|table|chart|figure|scatterplot|diagram|plane|line\s+[a-z]|triangle|circle|polygon|rectangle|cylinder|sphere|cone|pyramid|shown|above)\b/i.test(promptCandidateText);

      // Check for vector paths or images in question region
      const pathsInRegion = (firstPageObj.paths || []).filter(p => p.minY >= (ansY > 0 ? ansY - 10 : 0) && p.maxY <= qHeaderY + 5);
      const imagesInRegion = (firstPageObj.images || []).filter(img => img.y >= (ansY > 0 ? ansY - 10 : 0) && img.y <= qHeaderY + 5);
      const hasDrawingsInRegion = pathsInRegion.length >= 2 || imagesInRegion.length >= 1;

      const isTopGap = firstProseLineY !== null && (qHeaderY - firstProseLineY >= 30);
      const isBottomGap = lastProseLineY !== null && ansY > 0 && (lastProseLineY - ansY >= 35);
      const isEntireRegionFigure = betweenLines.length === 0 && ansY > 0 && (qHeaderY - ansY >= 40);

      let imageUrl = undefined;

      if (promptMentionsVisual || hasDrawingsInRegion || isTopGap || isBottomGap || isEntireRegionFigure) {
        const imageFileName = `${id}.png`;
        const imagePath = path.join(IMAGES_DIR, imageFileName);
        if (fs.existsSync(imagePath)) {
          imageUrl = `/question-images/math/${imageFileName}`;
          totalFiguresCropped++;
        } else {
          try {
            let topCropPt = qHeaderY - 4;
            let bottomCropPt = ansY > 0 ? ansY + 6 : 0;

            if (isTopGap && !isBottomGap && !promptMentionsVisual) {
              topCropPt = qHeaderY - 4;
              bottomCropPt = firstProseLineY + 6;
            } else if (isBottomGap && !isTopGap && !promptMentionsVisual) {
              topCropPt = lastProseLineY - 4;
              bottomCropPt = ansY + 6;
            }

            const gapPt = topCropPt - bottomCropPt;
            if (gapPt >= 25) {
              const viewport = firstPageObj.page.getViewport({ scale: 2.0 });
              const pageCanvas = createCanvas(viewport.width, viewport.height);
              const ctx = pageCanvas.getContext('2d');
              await firstPageObj.page.render({ canvasContext: ctx, viewport, canvasFactory }).promise;

              const pageHeightPt = firstPageObj.page.view[3] || 792;
              const sourceTopY = Math.max(0, Math.round((pageHeightPt - topCropPt) * 2));
              const sourceBottomY = Math.min(viewport.height, Math.round((pageHeightPt - bottomCropPt) * 2));
              const sourceH = Math.max(30, sourceBottomY - sourceTopY);
              const cropW = Math.round(viewport.width - 40);
              const cropX = 20;

              const cropCanvas = createCanvas(cropW, sourceH + 14);
              const cropCtx = cropCanvas.getContext('2d');
              cropCtx.fillStyle = '#ffffff';
              cropCtx.fillRect(0, 0, cropW, sourceH + 14);
              cropCtx.drawImage(pageCanvas, cropX, sourceTopY, cropW, sourceH, 0, 7, cropW, sourceH);

              if (hasVisualContent(cropCanvas, 40)) {
                fs.writeFileSync(imagePath, cropCanvas.toBuffer('image/png'));
                imageUrl = `/question-images/math/${imageFileName}`;
                totalFiguresCropped++;
              }
            }
          } catch (err) {
            console.warn(`[WARN] Failed to crop figure on question ${id}:`, err.message);
          }
        }
      }

      // -----------------------------------------------------------------------
      // Build Passage vs Prompt
      // -----------------------------------------------------------------------
      let passage = '';
      if (isSPR) {
        passage = "Student-produced response directions\n• If you find more than one correct solution, enter only one.\n• You can enter up to 5 characters for a positive result and up to 6 characters (including the negative sign) for a negative result.\n• If your answer is a fraction that doesn't fit in the provided space, enter the decimal equivalent.\n• If your answer is a decimal that doesn't fit in the provided space, truncate or round it at the fourth digit.\n• If your answer is a mixed number (such as 3 1/2), enter it as an improper fraction (7/2) or its decimal equivalent (3.5).\n• Don't enter symbols such as a percent sign, comma, or dollar sign.";
      }

      let prompt = cleanMathText(betweenLines.map(l => l.text).join(' '));
      if (!prompt && imageUrl) {
        prompt = "Refer to the figure or equation above to answer the question.";
      }

      // -----------------------------------------------------------------------
      // Parse Options, Accepted Answers & Rationale Across All Pages
      // -----------------------------------------------------------------------
      let allAnswerPartLines = [];
      if (ansHeaderIdx !== -1) {
        allAnswerPartLines.push(...firstLines.slice(ansHeaderIdx + 1));
      } else if (corrAnsIdx !== -1) {
        allAnswerPartLines.push(...firstLines.slice(corrAnsIdx));
      }
      for (let pIdx = startPageIdx + 1; pIdx < endPageIdx; pIdx++) {
        allAnswerPartLines.push(...pagesInfo[pIdx].lines);
      }

      const fullAnswerText = allAnswerPartLines.map(l => l.text).join(' ');

      let correctAnswer = 'A';
      let acceptedAnswers = undefined;
      let options = [];

      if (isSPR) {
        const corrMatch = fullAnswerText.match(/Correct\s+Answer\s*:\s*([^Rationale]+?)(?=\s*Rationale|$)/i);
        const rawAns = corrMatch ? corrMatch[1].trim() : '';
        correctAnswer = cleanMathText(rawAns);
        acceptedAnswers = generateAcceptedAnswers(rawAns);
        options = [];
        fileSpr++;
        totalSpr++;
      } else {
        const correctSplit = fullAnswerText.split(/Correct\s+Answer\s*:\s*([A-D])/i);
        const optionsText = correctSplit[0] || '';

        if (correctSplit.length > 1) {
          correctAnswer = correctSplit[1].trim().toUpperCase();
        }

        // Extract options A-D from optionsText
        const cleanOptText = optionsText.replace(/([A-D])\s+\./g, '$1.').trim();
        const matchAll = cleanOptText.match(/^A\s*\.\s*([\s\S]*?)\s*\bB\s*\.\s*([\s\S]*?)\s*\bC\s*\.\s*([\s\S]*?)\s*\bD\s*\.\s*([\s\S]*?)$/i);

        if (matchAll) {
          options = [
            { id: 'A', label: 'A', text: cleanMathText(matchAll[1]) },
            { id: 'B', label: 'B', text: cleanMathText(matchAll[2]) },
            { id: 'C', label: 'C', text: cleanMathText(matchAll[3]) },
            { id: 'D', label: 'D', text: cleanMathText(matchAll[4]) },
          ];
        } else {
          const optA = optionsText.match(/(?:^|\s+)A\s*\.\s*([\s\S]+?)(?=(?:^|\s+)B\s*\.|$)/i);
          const optB = optionsText.match(/(?:^|\s+)B\s*\.\s*([\s\S]+?)(?=(?:^|\s+)C\s*\.|$)/i);
          const optC = optionsText.match(/(?:^|\s+)C\s*\.\s*([\s\S]+?)(?=(?:^|\s+)D\s*\.|$)/i);
          const optD = optionsText.match(/(?:^|\s+)D\s*\.\s*([\s\S]+?)$/i);
          if (optA && optB && optC && optD) {
            options = [
              { id: 'A', label: 'A', text: cleanMathText(optA[1]) },
              { id: 'B', label: 'B', text: cleanMathText(optB[1]) },
              { id: 'C', label: 'C', text: cleanMathText(optC[1]) },
              { id: 'D', label: 'D', text: cleanMathText(optD[1]) },
            ];
          }
        }

        // Check if options are graphical choices across ALL pages of this question (e.g. a8e6bd75)
        const isPotentialGraphicalOptions = options.length === 4 && options.every(o => o.text.trim() === '');

        if (isPotentialGraphicalOptions) {
          try {
            // Find all letter markers A, B, C, D across pagesInfo from startPageIdx to endPageIdx
            const optLetterMarkers = [];
            for (let pIdx = startPageIdx; pIdx < endPageIdx; pIdx++) {
              const pObj = pagesInfo[pIdx];
              for (const it of (pObj.content.items || [])) {
                const s = it.str.trim();
                if (/^[A-D]\.?$/.test(s)) {
                  optLetterMarkers.push({
                    letter: s[0],
                    pIdx,
                    y: it.transform[5],
                    pageObj: pObj,
                  });
                }
              }
            }

            // Deduplicate to keep the first occurrence of each letter
            const uniqueMarkers = {};
            for (const m of optLetterMarkers) {
              if (!uniqueMarkers[m.letter]) {
                uniqueMarkers[m.letter] = m;
              }
            }

            if (uniqueMarkers['A'] && uniqueMarkers['B'] && uniqueMarkers['C'] && uniqueMarkers['D']) {
              const letters = ['A', 'B', 'C', 'D'];
              const graphicalOptions = [];

              for (let li = 0; li < letters.length; li++) {
                const curL = letters[li];
                const curMarker = uniqueMarkers[curL];
                const nextMarker = li < 3 ? uniqueMarkers[letters[li + 1]] : null;

                let curPageObj = curMarker.pageObj;
                let topCropPt = curMarker.y;
                let bottomCropPt = 15; // default near bottom of page

                if (nextMarker && nextMarker.pIdx === curMarker.pIdx) {
                  bottomCropPt = nextMarker.y + 10;
                } else if (li === 3) {
                  // Option D: look for Correct Answer line on same page
                  const corrLine = curPageObj.lines.find(l => /Correct\s+Answer/i.test(l.text));
                  if (corrLine) {
                    bottomCropPt = corrLine.y + 10;
                  } else if (curMarker.pIdx + 1 < endPageIdx) {
                    // Graph for Option D is on the next page
                    const nextP = pagesInfo[curMarker.pIdx + 1];
                    const corrOnNext = nextP.lines.find(l => /Correct\s+Answer/i.test(l.text));
                    if (corrOnNext) {
                      curPageObj = nextP;
                      const pageH = nextP.page.view[3] || 792;
                      topCropPt = pageH - 25;
                      bottomCropPt = corrOnNext.y + 12;
                    }
                  }
                }

                const optFileName = `${id}_opt_${curL}.png`;
                const optPath = path.join(IMAGES_DIR, optFileName);

                const viewport = curPageObj.page.getViewport({ scale: 2.0 });
                const pageCanvas = createCanvas(viewport.width, viewport.height);
                const ctx = pageCanvas.getContext('2d');
                await curPageObj.page.render({ canvasContext: ctx, viewport, canvasFactory }).promise;

                const pageHeightPt = curPageObj.page.view[3] || 792;
                const sTopY = Math.max(0, Math.round((pageHeightPt - topCropPt) * 2));
                const sBottomY = Math.min(viewport.height, Math.round((pageHeightPt - bottomCropPt) * 2));
                const sH = Math.max(40, sBottomY - sTopY);
                const cW = Math.min(480, Math.round(viewport.width - 50));

                const cCanvas = createCanvas(cW, sH + 12);
                const cCtx = cCanvas.getContext('2d');
                cCtx.fillStyle = '#ffffff';
                cCtx.fillRect(0, 0, cW, sH + 12);
                cCtx.drawImage(pageCanvas, 25, sTopY, cW, sH, 0, 6, cW, sH);

                fs.writeFileSync(optPath, cCanvas.toBuffer('image/png'));
                totalOptionGraphsCropped++;

                graphicalOptions.push({
                  id: curL,
                  label: curL,
                  text: '',
                  imageUrl: `/question-images/math/${optFileName}`,
                });
              }

              if (graphicalOptions.length === 4) {
                options = graphicalOptions;
                // If question options are graphs, and there are no paths in question stem, don't set bogus imageUrl on question
                if (pathsInRegion.length === 0 && imagesInRegion.length === 0) {
                  imageUrl = undefined;
                }
              }
            }
          } catch (err) {
            console.warn(`[WARN] Failed to crop option graphs on question ${id}:`, err.message);
          }
        }

        if (options.length < 4) continue;
        fileMcq++;
        totalMcq++;
      }

      // Extract Rationale
      let rationale = '';
      const ratIdx = fullAnswerText.indexOf('Rationale');
      if (ratIdx !== -1) {
        rationale = cleanMathText(fullAnswerText.substring(ratIdx + 9));
      }

      if (!prompt) continue;

      const questionObj = {
        id,
        section: 'Math',
        domain,
        skill: canonicalSkill,
        difficulty,
        questionType,
        passage,
        prompt,
        options,
        correctAnswer,
        rationale,
      };

      if (acceptedAnswers && acceptedAnswers.length > 0) {
        questionObj.acceptedAnswers = acceptedAnswers;
      }

      if (imageUrl) {
        questionObj.imageUrl = imageUrl;
      }

      allQuestions.push(questionObj);
      fileExtracted++;
      domainStats[domain] = (domainStats[domain] || 0) + 1;
      skillStats[canonicalSkill] = (skillStats[canonicalSkill] || 0) + 1;
      diffStats[difficulty] = (diffStats[difficulty] || 0) + 1;
    }

    console.log(`  -> Extracted ${fileExtracted} questions from ${file} (${fileMcq} MCQ, ${fileSpr} SPR)`);
  }

  // ---------------------------------------------------------------------------
  // Save Output JSON
  // ---------------------------------------------------------------------------
  console.log(`\nWriting ${allQuestions.length} Math questions to ${OUTPUT_PATH}...`);
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allQuestions, null, 2), 'utf-8');
  const sizeMb = (fs.statSync(OUTPUT_PATH).size / (1024 * 1024)).toFixed(2);
  console.log(`[SUCCESS] File saved successfully (${sizeMb} MB)!\n`);

  // ---------------------------------------------------------------------------
  // Full Audit Log
  // ---------------------------------------------------------------------------
  console.log('========================================================================');
  console.log('                 DIGITAL SAT MATH EXTRACTION AUDIT                      ');
  console.log('========================================================================');
  console.log(`TOTAL MATH QUESTIONS EXTRACTED:   ${allQuestions.length}`);
  console.log(`  • Multiple Choice (MCQ)       : ${totalMcq}`);
  console.log(`  • Student-Produced (SPR)      : ${totalSpr}`);
  console.log(`  • High-DPI Visual Figures     : ${totalFiguresCropped}`);
  console.log(`  • Graphical Choice Options    : ${totalOptionGraphsCropped}`);
  console.log('------------------------------------------------------------------------');
  console.log('BY DOMAIN:');
  for (const [dom, count] of Object.entries(domainStats)) {
    console.log(`  • ${dom.padEnd(36)}: ${count}`);
  }
  console.log('------------------------------------------------------------------------');
  console.log('BY DIFFICULTY:');
  for (const [diff, count] of Object.entries(diffStats)) {
    console.log(`  • ${diff.padEnd(16)}: ${count}`);
  }
  console.log('------------------------------------------------------------------------');
  console.log('BY OFFICIAL SUBTOPIC:');
  for (const [sk, count] of Object.entries(skillStats)) {
    console.log(`  • ${sk.padEnd(46)}: ${count}`);
  }
  console.log('========================================================================\n');

  // Verification of targets
  console.log('=== TARGET QUESTIONS VERIFICATION ===');
  const targets = ['ac472881', '002dba45', 'f224df07', 'e10d8313', '1adb39f0', 'a8e6bd75', '512bd5b4'];
  for (const tid of targets) {
    const q = allQuestions.find(x => x.id === tid);
    if (q) {
      console.log(`[PASS] ID: ${q.id} | Domain: ${q.domain} | Skill: ${q.skill} | Diff: ${q.difficulty} | Type: ${q.questionType}`);
      if (q.imageUrl) console.log(`       Figure Image : ${q.imageUrl}`);
      if (q.questionType === 'spr') {
        console.log(`       SPR Answer   : ${q.correctAnswer} (Accepted: ${JSON.stringify(q.acceptedAnswers)})`);
      } else {
        console.log(`       MCQ Options  : ${q.options.map(o => o.id + (o.imageUrl ? '[img]' : `:"${o.text.slice(0, 15)}"`)).join(', ')} | Ans: ${q.correctAnswer}`);
      }
    } else {
      console.warn(`[FAIL] Target ${tid} not found!`);
    }
  }
  console.log('========================================================================\n');
}

extractMathPdfs().catch(err => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
