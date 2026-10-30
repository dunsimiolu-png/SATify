import * as fs from 'fs';
import * as path from 'path';
import { createCanvas, DOMMatrix, Path2D } from '@napi-rs/canvas';

// Polyfill canvas classes for pdfjs-dist
globalThis.DOMMatrix = DOMMatrix;
globalThis.Path2D = Path2D;

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
import { ALGEBRA_GRAPH_IDS, ALGEBRA_CORRECTIONS } from './algebraCorrections.mjs';

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
// Matrix Multiplication for CTM Transform Tracking
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
// Clean Math Text, Ligatures & Normalize Glyphs
// -----------------------------------------------------------------------------
function cleanMathText(text) {
  if (!text) return '';
  let res = text;

  // Normalize Unicode math glyphs to clean standard text or LaTeX
  res = res
    .replace(/[\u2212\u2013\u2014]/g, '-')
    .replace(/\u2264/g, ' \\le ')
    .replace(/\u2265/g, ' \\ge ')
    .replace(/\u00d7/g, ' \\times ')
    .replace(/\u00f7/g, ' \\div ')
    .replace(/\u03c0/g, ' \\pi ')
    .replace(/\u221a/g, ' \\sqrt ')
    .replace(/\u2260/g, ' \\ne ')
    .replace(/\u00b1/g, ' \\pm ')
    .replace(/\u221e/g, ' \\infty ')
    .replace(/\u2248/g, ' \\approx ');

  // Typographic cleanup & kerning fixes common in College Board PDFs
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
    [/\bper\s+pendicular\b/gi, 'perpendicular'],
    [/\bcoor\s+dinate(s)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bpar\s+abola(s)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bpar\s+allel\b/gi, 'parallel'],
    [/\bline\s+ar\b/gi, 'linear'],
    [/\bequ\s+ation(s)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\binequ\s+alit(y|ies)\b/gi, m => m.replace(/\s+/g, '')],
    [/\binter\s+sect(s|ed|ing|ion|ions)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\binter\s+cept(s|ed|ing)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bxy\s*-\s*plane\b/gi, 'xy-plane'],
    [/\bx\s*-\s*axis\b/gi, 'x-axis'],
    [/\by\s*-\s*axis\b/gi, 'y-axis'],
    [/\bx\s*-\s*intercept\b/gi, 'x-intercept'],
    [/\by\s*-\s*intercept\b/gi, 'y-intercept'],
    [/\bx\s*-\s*coordinate\b/gi, 'x-coordinate'],
    [/\by\s*-\s*coordinate\b/gi, 'y-coordinate'],
    [/\bChoice\s*([A-D])\s*is\b/g, 'Choice $1 is'],
    [/\bChoice\s*([A-D])\b/g, 'Choice $1'],
    [/\bSA\s+T\b/g, 'SAT'],
    [/\b([A-D])\s+\./g, '$1.'],
    [/\bpoint\s*\(\s*,\s*\)/gi, 'point $(x, y)$'],
    [/\bthe\s*-\s*plane\b/gi, 'the xy-plane'],
    [/\bthe\s*-\s*axis\b/gi, 'the x-axis'],
    [/\bthe\s*-\s*intercept\b/gi, 'the x-intercept'],
  ];

  for (const [pattern, rep] of replacements) {
    res = res.replace(pattern, rep);
  }

  // Spacing cleanup
  res = res
    .replace(/\s+([’'.,;?!:])/g, '$1')
    .replace(/([“‘])\s+/g, '$1')
    .replace(/([,;?!])([A-Za-z])/g, '$1 $2');

  return res.replace(/[ \t]+/g, ' ').replace(/[ \t]*\n[ \t]*/g, '\n').trim();
}

// -----------------------------------------------------------------------------
// Official Math Skill Classifier
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
// Check Visual Content in Canvas
// -----------------------------------------------------------------------------
function hasVisualContent(canvas, threshold = 60) {
  const ctx = canvas.getContext('2d');
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  let nonWhiteCount = 0;
  for (let i = 0; i < data.length; i += 16) {
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
// Extract Page Visual Elements (Paths, Image XObjects & Composite Inline Bitmaps)
// -----------------------------------------------------------------------------
async function extractPageVisualElements(page, pageNum) {
  const ops = await page.getOperatorList();
  let ctm = [1, 0, 0, 1, 0, 0];
  const ctmStack = [];
  const paths = [];
  const images = [];
  const inlineImages = [];

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
        let minY = Infinity, maxY = -Infinity, minX = Infinity, maxX = -Infinity;
        for (let j = 0; j < pArgs.length; j += 2) {
          const x = ctm[0] * pArgs[j] + ctm[2] * pArgs[j + 1] + ctm[4];
          const y = ctm[1] * pArgs[j] + ctm[3] * pArgs[j + 1] + ctm[5];
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
        }
        paths.push({ minX, maxX, minY, maxY });
      }
    } else if (fn === pdfjsLib.OPS.paintImageXObject) {
      const imgName = args[0];
      const imgX = ctm[4];
      const imgY = ctm[5];
      const imgW = Math.abs(ctm[0]);
      const imgH = Math.abs(ctm[3]);
      images.push({ name: imgName, x: imgX, y: imgY, w: imgW, h: imgH });

      // If it is an inline or small equation bitmap (Type-B)
      if (imgH <= 65 && imgW <= 220) {
        try {
          const obj = page.objs.get(imgName);
          if (obj && obj.data && obj.width > 0 && obj.height > 0) {
            const eqFileName = `eq_p${pageNum}_${i}.png`;
            const eqFilePath = path.join(IMAGES_DIR, eqFileName);

            if (!fs.existsSync(eqFilePath)) {
              const canvas = createCanvas(obj.width, obj.height);
              const ctx = canvas.getContext('2d');
              const imgData = ctx.createImageData(obj.width, obj.height);

              // Composite alpha mask onto crisp white #FFFFFF
              for (let j = 0; j < obj.data.length; j += 4) {
                const r = obj.data[j];
                const g = obj.data[j + 1];
                const b = obj.data[j + 2];
                const a = obj.data[j + 3];
                const alpha = a / 255;
                imgData.data[j] = Math.round(r * alpha + 255 * (1 - alpha));
                imgData.data[j + 1] = Math.round(g * alpha + 255 * (1 - alpha));
                imgData.data[j + 2] = Math.round(b * alpha + 255 * (1 - alpha));
                imgData.data[j + 3] = 255;
              }
              ctx.putImageData(imgData, 0, 0);
              fs.writeFileSync(eqFilePath, canvas.toBuffer('image/png'));
            }

            inlineImages.push({
              src: `/question-images/math/${eqFileName}`,
              x: imgX,
              y: imgY,
              w: imgW,
              h: imgH,
            });
          }
        } catch {
          // ignore individual obj extraction errors
        }
      }
    }
  }
  return { paths, images, inlineImages };
}

// -----------------------------------------------------------------------------
// Check if a token is a genuine math token suitable for fraction numerator/denominator
// -----------------------------------------------------------------------------
function isMathFractionToken(str) {
  const t = str.trim();
  if (!t || t.length > 8) return false;
  // Disallow English headers and common words
  if (/^(Question|Rationale|Answer|Correct|Assessment|Test|Domain|Skill|Difficulty|SAT|Math|Line|Lines|Choice|Which|What|When|Where|There|Since|Given|Table|Figure)$/i.test(t)) return false;
  if (/^(the|and|for|that|this|with|from|have|into|also|only|each|some|both|than|more|less|same|side|form|point|plane|value|shown)$/i.test(t)) return false;
  // Allow mathematical numbers, variables, expressions
  return /^[0-9a-zA-Z\+\-\.\(\)]+$/.test(t);
}

// -----------------------------------------------------------------------------
// Coordinate-Aware Line Assembly with 2D Fraction Reconstruction (Type-A)
// and Inline Equation Image Integration (Type-B)
// -----------------------------------------------------------------------------
function assemblePageLines(content, visualElements, figureBBox = null) {
  let rawItems = (content.items || []).filter(it => it.str).map(it => ({
    str: it.str,
    x: it.transform[4],
    y: it.transform[5],
    width: it.width,
    height: it.height || Math.abs(it.transform[0]),
  }));

  // Strip Graph Axis Text Garbage: filter out numbers/ticks inside figure bounding box
  if (figureBBox) {
    const { minX, minY, maxX, maxY } = figureBBox;
    rawItems = rawItems.filter(it => {
      const insideX = it.x >= minX - 8 && (it.x + it.width) <= maxX + 8;
      const insideY = it.y >= minY - 8 && (it.y + it.height) <= maxY + 8;
      if (insideX && insideY) {
        if (/^-?\d{1,3}$/.test(it.str.trim()) || /^[xyO]$/i.test(it.str.trim())) {
          return false;
        }
      }
      return true;
    });
  }

  // Insert Type-B inline image tokens at exact (x, y) coordinates
  const inlineImages = (visualElements?.inlineImages || []);
  for (const img of inlineImages) {
    rawItems.push({
      str: `<img src="${img.src}" class="inline-math-img" alt="math" />`,
      x: img.x,
      y: img.y,
      width: img.w,
      height: img.h,
      isInlineImage: true,
    });
  }

  if (rawItems.length === 0) return [];

  // Reconstruct 2D Stacked Fractions (Type-A) BEFORE line-sorting
  const used = new Set();
  const mergedItems = [];

  rawItems.sort((a, b) => a.x - b.x || b.y - a.y);

  for (let i = 0; i < rawItems.length; i++) {
    if (used.has(i)) continue;
    const itA = rawItems[i];

    // Must be a genuine math expression (never an English word)
    const isNum = !itA.isInlineImage && isMathFractionToken(itA.str);

    let mergedFraction = false;
    if (isNum) {
      for (let j = i + 1; j < rawItems.length; j++) {
        if (used.has(j)) continue;
        const itB = rawItems[j];

        const dy = itA.y - itB.y;
        // Tight vertical distance for fractions (prose lines are 14pt+)
        if (dy > 2.0 && dy <= 12.5) {
          const centerA = itA.x + itA.width / 2;
          const centerB = itB.x + itB.width / 2;
          const dx = Math.abs(centerA - centerB);
          const overlap = Math.min(itA.x + itA.width, itB.x + itB.width) - Math.max(itA.x, itB.x);

          if (dx <= 8.0 || overlap >= Math.min(itA.width, itB.width) * 0.7) {
            const isDen = !itB.isInlineImage && isMathFractionToken(itB.str);
            if (isDen) {
              const numStr = itA.str.trim();
              const denStr = itB.str.trim();
              mergedItems.push({
                str: `$\\frac{${numStr}}{${denStr}}$`,
                x: Math.min(itA.x, itB.x),
                y: (itA.y + itB.y) / 2,
                width: Math.max(itA.width, itB.width),
                height: dy,
                isFraction: true,
              });
              used.add(i);
              used.add(j);
              mergedFraction = true;
              break;
            }
          }
        }
      }
    }

    if (!mergedFraction) {
      mergedItems.push(itA);
      used.add(i);
    }
  }

  // Group items into lines by Y baseline
  mergedItems.sort((a, b) => b.y - a.y || a.x - b.x);

  const lineGroups = [];
  let curGroup = [];
  let curY = null;

  for (const it of mergedItems) {
    if (curY === null || Math.abs(curY - it.y) <= 3.8) {
      curGroup.push(it);
      if (curY === null) curY = it.y;
    } else {
      lineGroups.push({ y: curY, items: curGroup });
      curGroup = [it];
      curY = it.y;
    }
  }
  if (curGroup.length) lineGroups.push({ y: curY, items: curGroup });

  return lineGroups.map(({ y, items: lineItems }) => {
    lineItems.sort((a, b) => a.x - b.x);
    let text = '';
    const minX = lineItems[0].x;
    const maxX = lineItems[lineItems.length - 1].x + lineItems[lineItems.length - 1].width;
    const width = maxX - minX;

    for (let i = 0; i < lineItems.length; i++) {
      const it = lineItems[i];
      if (i === 0) {
        text += it.str;
      } else {
        const prev = lineItems[i - 1];
        const prevEnd = prev.x + prev.width;
        const dx = it.x - prevEnd;
        if (dx > 2.0 && !text.endsWith(' ') && !it.str.startsWith(' ') && !text.endsWith('$') && !it.str.startsWith('$')) {
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
// Bulletproof SPR Answer & Accepted Answers Generator
// -----------------------------------------------------------------------------
function extractSprAnswers(fullAnswerText, corrAnsLine = '') {
  const set = new Set();
  const NUM_PATTERN = /(?:-?\d+\/\d+|-?\d+\.\d+|-?\.\d+|-?\d+)/g;

  if (corrAnsLine) {
    const raw = corrAnsLine.replace(/Correct\s+Answer\s*:\s*/i, '').trim();
    if (raw && !raw.toLowerCase().includes('rationale')) {
      const matches = raw.match(NUM_PATTERN);
      if (matches) {
        matches.forEach(m => set.add(m));
      }
    }
  }

  // 1. "Note that X and Y are examples of ways to enter a correct answer"
  const noteMatch = fullAnswerText.match(/Note\s+that\s+([\s\S]+?)\s+are\s+examples/i);
  if (noteMatch) {
    const matches = noteMatch[1].match(NUM_PATTERN);
    if (matches) {
      matches.forEach(m => set.add(m));
    }
  }

  // 2. "The correct answer is X."
  const corMatch = fullAnswerText.match(/The\s+correct\s+answer\s+is\s+([^\.]+)/i);
  if (corMatch) {
    const matches = corMatch[1].match(NUM_PATTERN);
    if (matches) {
      matches.forEach(m => set.add(m));
    }
  }

  // 3. "yields or . Note that X and Y"
  const altMatch = fullAnswerText.match(/(?:yields|equals|is)\s+([^\.\n]+?)\s+or\s+([^\.\n]+)/i);
  if (altMatch) {
    const m1 = (altMatch[1] || '').match(NUM_PATTERN);
    const m2 = (altMatch[2] || '').match(NUM_PATTERN);
    if (m1) m1.forEach(m => set.add(m));
    if (m2) m2.forEach(m => set.add(m));
  }

  // 4. "it follows that X is the minimum/maximum/solution/value"
  const folMatch = fullAnswerText.match(/it\s+follows\s+that\s+([^\.\n]+?)\s+is\s+the/i);
  if (folMatch) {
    const matches = folMatch[1].match(NUM_PATTERN);
    if (matches) {
      matches.forEach(m => set.add(m));
    }
  }

  // 5. "Since w is the y-coordinate of this point, w = X" or "X = y"
  const coordMatch = fullAnswerText.match(/(?:is\s+the\s+[a-z\-]+,\s*([^\.\n]+)|[a-z]\s*=\s*([^\.\n]+))/i);
  if (coordMatch) {
    const targetStr = coordMatch[1] || coordMatch[2] || '';
    const matches = targetStr.match(NUM_PATTERN);
    if (matches) {
      matches.forEach(m => set.add(m));
    }
  }

  const rawList = Array.from(set).map(s => s.replace(/^[.\s\-]+|[.\s\-]+$/g, '')).filter(s => /[0-9]/.test(s));

  // Restore dropped leading decimals (e.g. 1764 paired with .1765 -> 0.1764)
  const hasDec = rawList.some(s => s.startsWith('.') || s.startsWith('0.'));
  const finalList = [];
  for (const s of rawList) {
    if (hasDec && /^\d{4}$/.test(s)) {
      finalList.push('0.' + s);
      finalList.push('.' + s);
    } else {
      finalList.push(s);
    }
  }

  // Expand accepted answers with fractions and decimals
  const acceptedSet = new Set();
  const primaryAnswer = finalList.find(s => s.includes('/')) || finalList.find(s => s.startsWith('0.') || s.startsWith('.')) || finalList[0] || '0';

  for (const p of finalList) {
    acceptedSet.add(p);
    if (p.includes('/')) {
      const [numStr, denStr] = p.split('/');
      const num = parseFloat(numStr);
      const den = parseFloat(denStr);
      if (!isNaN(num) && !isNaN(den) && den !== 0) {
        const dec = num / den;
        acceptedSet.add(String(dec));
        acceptedSet.add(dec.toFixed(3));
        acceptedSet.add(dec.toFixed(4));
        const decStr = String(dec);
        if (decStr.startsWith('0.')) {
          acceptedSet.add(decStr.slice(1));
        } else if (decStr.startsWith('-0.')) {
          acceptedSet.add('-' + decStr.slice(3));
        }
      }
    } else {
      const num = parseFloat(p);
      if (!isNaN(num)) {
        if (p.startsWith('.')) {
          acceptedSet.add('0' + p);
        } else if (p.startsWith('0.')) {
          acceptedSet.add(p.slice(1));
        } else if (p.startsWith('-.')) {
          acceptedSet.add('-0.' + p.slice(2));
        } else if (p.startsWith('-0.')) {
          acceptedSet.add('-.' + p.slice(3));
        }
      }
    }
  }

  return {
    correctAnswer: primaryAnswer,
    acceptedAnswers: Array.from(acceptedSet),
  };
}

// -----------------------------------------------------------------------------
// Main Extraction Pipeline
// -----------------------------------------------------------------------------
async function extractMathPdfs() {
  console.log('========================================================================');
  console.log('   SATify: Dedicated Coordinate-Aware Digital SAT Math Pipeline         ');
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
  let totalTypoFixes = 0;

  for (const { file, defaultDomain } of mathPdfs) {
    const filePath = path.join('raw-pdfs', file);
    if (!fs.existsSync(filePath)) {
      console.warn(`[WARN] File not found: ${filePath}`);
      continue;
    }

    console.log(`Processing ${file} ...`);
    const data = new Uint8Array(fs.readFileSync(filePath));
    const doc = await pdfjsLib.getDocument({ data, canvasFactory }).promise;
    console.log(`  Loaded ${doc.numPages} pages.`);

    // Preload pages and extract visual elements
    const pagesInfo = [];
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      const visualElements = await extractPageVisualElements(page, p);
      const lines = assemblePageLines(content, visualElements);
      const fullText = lines.map(l => l.text).join(' ');
      pagesInfo.push({ p, page, content, visualElements, lines, fullText });
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
      const qHeaderIdx = firstLines.findIndex(l => /^Question\b/i.test(l.text.trim()) && l.y < 700);
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
      const ansHeaderIdx = firstLines.findIndex(l => /^Answer\b/i.test(l.text.trim()) || /\bAnswer\s+[A-D]\./i.test(l.text));
      const corrAnsIdx = firstLines.findIndex(l => /Correct\s+Answer/i.test(l.text));
      const ratHeaderIdx = firstLines.findIndex(l => /^Rationale\b/i.test(l.text.trim()));
      const isSPR = ansHeaderIdx === -1;
      let questionType = isSPR ? 'spr' : 'mcq';

      const qEndLineIdx = ansHeaderIdx !== -1 
        ? ansHeaderIdx 
        : (corrAnsIdx !== -1 
            ? corrAnsIdx 
            : (ratHeaderIdx !== -1 ? ratHeaderIdx : firstLines.length));
      const betweenLines = firstLines.slice(qHeaderIdx + 1, qEndLineIdx);
      const betweenText = betweenLines.map(l => l.text).join(' ');

      // -----------------------------------------------------------------------
      // Detect Visual Figure / Equation / Diagram on First Page
      // -----------------------------------------------------------------------
      const qHeaderY = firstLines[qHeaderIdx].y;
      const ansY = ansHeaderIdx !== -1 
        ? firstLines[ansHeaderIdx].y 
        : (corrAnsIdx !== -1 
            ? firstLines[corrAnsIdx].y 
            : (ratHeaderIdx !== -1 ? firstLines[ratHeaderIdx].y : 0));

      let firstProseLineY = null;
      let lastProseLineY = null;
      if (betweenLines.length > 0) {
        firstProseLineY = betweenLines[0].y;
        lastProseLineY = betweenLines[betweenLines.length - 1].y;
      }

      const promptCandidateText = betweenText.toLowerCase();
      const promptMentionsVisual = /\b(graph|table|chart|figure|scatterplot|diagram|plane|triangle|circle|polygon|rectangle|cylinder|sphere|shown|above)\b/i.test(promptCandidateText);

      const pathsInRegion = (firstPageObj.visualElements.paths || []).filter(p => p.minY >= (ansY > 0 ? ansY - 10 : 0) && p.maxY <= qHeaderY + 5);
      const imagesInRegion = (firstPageObj.visualElements.images || []).filter(img => img.y >= (ansY > 0 ? ansY - 10 : 0) && img.y <= qHeaderY + 5);
      const hasDrawingsInRegion = pathsInRegion.length >= 2 || imagesInRegion.length >= 1;

      const isTopGap = firstProseLineY !== null && (qHeaderY - firstProseLineY >= 30);
      const isBottomGap = lastProseLineY !== null && ansY > 0 && (lastProseLineY - ansY >= 35);
      const isEntireRegionFigure = betweenLines.length === 0 && ansY > 0 && (qHeaderY - ansY >= 40);

      let imageUrl = undefined;

      // In Algebra, strictly restrict images to genuine coordinate plane graphs only.
      // In other domains, only crop true coordinate graphs, scatterplots or geometric figures (never tables or text).
      const shouldAttemptFigureCrop = defaultDomain === 'Algebra'
        ? ALGEBRA_GRAPH_IDS.has(id)
        : (imagesInRegion.some(img => img.w >= 100 && img.h >= 80) || (pathsInRegion.length >= 8 && !promptCandidateText.includes('table')));

      if (shouldAttemptFigureCrop) {
        const imageFileName = `${id}.png`;
        const imagePath = path.join(IMAGES_DIR, imageFileName);

        if (fs.existsSync(imagePath) && fs.statSync(imagePath).size > 1000) {
          imageUrl = `/question-images/math/${imageFileName}`;
          totalFiguresCropped++;
        } else {
          try {
            let topCropPt = qHeaderY - 4;
            let bottomCropPt = ansY > 0 ? ansY + 18 : 10;

            if (isTopGap && !isBottomGap) {
              topCropPt = qHeaderY - 4;
              bottomCropPt = firstProseLineY + 8;
            } else if (isBottomGap && !isTopGap) {
              topCropPt = lastProseLineY - 4;
              bottomCropPt = ansY + 18;
            }

            const gapPt = topCropPt - bottomCropPt;
            if (gapPt >= 25) {
              const viewport = firstPageObj.page.getViewport({ scale: 2.0 });
              const pageCanvas = createCanvas(viewport.width, viewport.height);
              const ctx = pageCanvas.getContext('2d');
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, viewport.width, viewport.height);
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

      // Re-assemble prompt lines with axis stripping if figure exists
      let prompt = cleanMathText(betweenLines.map(l => l.text).join(' '));
      if (!prompt && imageUrl) {
        prompt = 'Refer to the figure or equation above to answer the question.';
      }

      // -----------------------------------------------------------------------
      // Build Passage vs Prompt
      // -----------------------------------------------------------------------
      let passage = '';
      if (isSPR) {
        passage = "Student-produced response directions\n• If you find more than one correct solution, enter only one.\n• You can enter up to 5 characters for a positive result and up to 6 characters (including the negative sign) for a negative result.\n• If your answer is a fraction that doesn't fit in the provided space, enter the decimal equivalent.\n• If your answer is a decimal that doesn't fit in the provided space, truncate or round it at the fourth digit.\n• If your answer is a mixed number (such as 3 1/2), enter it as an improper fraction (7/2) or its decimal equivalent (3.5).\n• Don't enter symbols such as a percent sign, comma, or dollar sign.";
      }

      // -----------------------------------------------------------------------
      // Parse Options, Accepted Answers & Rationale Across All Pages
      // -----------------------------------------------------------------------
      let allAnswerPartLines = [];
      if (ansHeaderIdx !== -1) {
        allAnswerPartLines.push(...firstLines.slice(ansHeaderIdx + 1));
      } else if (corrAnsIdx !== -1) {
        allAnswerPartLines.push(...firstLines.slice(corrAnsIdx));
      } else if (ratHeaderIdx !== -1) {
        allAnswerPartLines.push(...firstLines.slice(ratHeaderIdx));
      }
      for (let pIdx = startPageIdx + 1; pIdx < endPageIdx; pIdx++) {
        allAnswerPartLines.push(...pagesInfo[pIdx].lines);
      }

      const fullAnswerText = allAnswerPartLines.map(l => l.text).join(' ');

      let correctAnswer = 'A';
      let acceptedAnswers = undefined;
      let options = [];

      if (isSPR) {
        const corrLine = allAnswerPartLines.find(l => /Correct\s+Answer/i.test(l.text))?.text || '';
        const sprResult = extractSprAnswers(fullAnswerText, corrLine);
        correctAnswer = sprResult.correctAnswer || '0';
        acceptedAnswers = sprResult.acceptedAnswers;
        options = [];
        fileSpr++;
        totalSpr++;
      } else {
        const correctSplit = fullAnswerText.split(/Correct\s+Answer\s*:\s*([A-D])/i);
        const optionsText = correctSplit[0] || '';

        if (correctSplit.length > 1) {
          correctAnswer = correctSplit[1].trim().toUpperCase();
        }

        // Cross-check against Rationale "Choice [A-D] is correct"
        const ratChoiceMatch = fullAnswerText.match(/Rationale[\s\S]*?Choice\s+([A-D])\s+is\s+correct/i);
        if (ratChoiceMatch) {
          const ratChoice = ratChoiceMatch[1].trim().toUpperCase();
          if (ratChoice && ratChoice !== correctAnswer) {
            correctAnswer = ratChoice; // Always trust rationale on official PDF typo!
            totalTypoFixes++;
          }
        }

        // Special handling for 83f2c3bf: Reconstruct 2-column tables in answer choices
        if (id === '83f2c3bf') {
          options = [
            {
              id: 'A',
              label: 'A',
              text: '$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 4 \\\\ \\hline 1 & 5 \\\\ \\hline 2 & 6 \\\\ \\hline \\end{array}$$',
            },
            {
              id: 'B',
              label: 'B',
              text: '$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 6 \\\\ \\hline 1 & 5 \\\\ \\hline 2 & 4 \\\\ \\hline \\end{array}$$',
            },
            {
              id: 'C',
              label: 'C',
              text: '$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 2 \\\\ \\hline 1 & 1 \\\\ \\hline 2 & 0 \\\\ \\hline \\end{array}$$',
            },
            {
              id: 'D',
              label: 'D',
              text: '$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 0 \\\\ \\hline 1 & 1 \\\\ \\hline 2 & 2 \\\\ \\hline \\end{array}$$',
            },
          ];
        } else {
          // Extract text options A-D
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

          // Ensure options A-D are clean text objects (never screenshot strips)
          options = options.map(o => ({
            id: o.id,
            label: o.label || o.id,
            text: cleanMathText(o.text) || '',
          }));
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

      // Apply curated Algebra corrections (HTML tables, exact LaTeX options, vector math gap fills)
      if (ALGEBRA_CORRECTIONS[id]) {
        const corr = ALGEBRA_CORRECTIONS[id];
        if (corr.passage !== undefined) passage = corr.passage;
        if (corr.prompt !== undefined) prompt = corr.prompt;
        if (corr.options !== undefined) options = corr.options;
        if (corr.correctAnswer !== undefined) correctAnswer = corr.correctAnswer;
        if (corr.acceptedAnswers !== undefined) acceptedAnswers = corr.acceptedAnswers;
        if (corr.questionType !== undefined) questionType = corr.questionType;
        if (corr.imageUrl !== undefined) imageUrl = corr.imageUrl;
      }

      // Restrict imageUrl strictly:
      // In Algebra, only genuine coordinate graphs have an image.
      // If the question has a structured table in passage, imageUrl is NEVER set.
      if (defaultDomain === 'Algebra') {
        if (!ALGEBRA_GRAPH_IDS.has(id)) {
          imageUrl = undefined;
        }
      } else if (passage && passage.includes('<table')) {
        imageUrl = undefined;
      }

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
  console.log(`  • Typo Auto-Corrections       : ${totalTypoFixes}`);
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
  console.log('========================================================================\n');

  // Verification of targets
  console.log('=== TARGET QUESTIONS VERIFICATION ===');
  const targets = [
    'ac472881',
    '002dba45',
    'f224df07',
    'e10d8313',
    '1adb39f0',
    'a8e6bd75',
    '512bd5b4',
    '83f2c3bf',
    'bf5f80c6',
    '1e11190a',
    'd1b66ae6',
    'e62cfe5f',
    'ee2f611f',
    'fdee0fbf',
    '9c7741c6',
    '466b87e3',
    '40c09d66',
    'fcdf87b7',
    '881ef5f5',
    '8193e8cd',
    'eeb4143c',
    '6933b3d9',
    'fb58c0db',
    '9bbce683',
    'b0fc3166',
  ];

  for (const tid of targets) {
    const q = allQuestions.find(x => x.id === tid);
    if (q) {
      console.log(`[PASS] ID: ${q.id} | Domain: ${q.domain} | Skill: ${q.skill} | Diff: ${q.difficulty} | Type: ${q.questionType}`);
      if (q.imageUrl) console.log(`       Figure Image : ${q.imageUrl}`);
      if (q.questionType === 'spr') {
        console.log(`       SPR Answer   : "${q.correctAnswer}" (Accepted: ${JSON.stringify(q.acceptedAnswers)})`);
      } else {
        console.log(`       MCQ Options  : ${q.options.map(o => o.id + (o.imageUrl ? '[img]' : `:"${o.text.slice(0, 20)}"`)).join(', ')} | Ans: ${q.correctAnswer}`);
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
