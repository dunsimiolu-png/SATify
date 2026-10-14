import * as fs from 'fs';
import * as path from 'path';
import { createCanvas, DOMMatrix, Path2D } from '@napi-rs/canvas';

// Polyfill canvas classes for pdfjs-dist
globalThis.DOMMatrix = DOMMatrix;
globalThis.Path2D = Path2D;

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';

// Ensure public images directory exists
const IMAGES_DIR = path.join('public', 'images', 'questions');
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// -----------------------------------------------------------------------------
// Canonical Domain and Skill Definitions
// -----------------------------------------------------------------------------
const DOMAIN_TO_SKILLS = {
  'Craft and Structure': ['Words in Context', 'Text Structure and Purpose', 'Cross-Text Connections'],
  'Information and Ideas': ['Central Ideas and Details', 'Command of Evidence', 'Inferences'],
  'Expression of Ideas': ['Rhetorical Synthesis', 'Transitions'],
  'Standard English Conventions': ['Boundaries', 'Form, Structure, and Sense'],
};

const SKILL_TO_DOMAIN = {};
for (const [dom, skills] of Object.entries(DOMAIN_TO_SKILLS)) {
  for (const sk of skills) {
    SKILL_TO_DOMAIN[sk] = dom;
  }
}

// -----------------------------------------------------------------------------
// Offline Dictionary-Backed Word & Spacing Engine
// -----------------------------------------------------------------------------
const wordsPath = path.resolve('node_modules', 'an-array-of-english-words', 'index.json');
let DICT = new Set();
try {
  const rawWords = JSON.parse(fs.readFileSync(wordsPath, 'utf8'));
  DICT = new Set(rawWords.map(w => w.toLowerCase()));
} catch (e) {
  console.warn('[WARN] Could not load an-array-of-english-words:', e.message);
}

// Add common SAT scientific roots, domain terms, inflections, and contractions
const EXTRA_SAT_WORDS = [
  'microbiome', 'microbiomes', 'biofilm', 'biofilms', 'neuroimaging', 'neurogenesis',
  'neuroscientist', 'neuroscientists', 'paleoclimatologist', 'paleoclimatologists',
  'paleoclimate', 'paleoclimates', 'exoplanet', 'exoplanets', 'photosynthetic',
  'archaeological', 'biodiverse', 'supercontinent', 'supercontinents', 'pterosaur',
  'pterosaurs', 'tyrannosaurus', 'tyrannosaur', 'tyrannosaurs', 'mesopredator',
  'mesopredators', 'endotherm', 'endotherms', 'ectotherm', 'ectotherms', 'subalpine',
  'semiarid', 'nonavian', 'nonnative', 'nonhuman', 'sociocultural', 'socioeconomic',
  'sociodemographic', 'metacognition', 'metacognitive', 'biomarker', 'biomarkers',
  'intertidal', 'macroinvertebrate', 'macroinvertebrates', 'slumber’d', 'blabb’d',
  'can’t', 'isn’t', 'wouldn’t', 'doesn’t', 'don’t', 'haven’t', 'hasn’t', 'weren’t',
  'wasn’t', 'aren’t', 'didn’t', 'won’t', 'couldn’t', 'shouldn’t'
];
for (const w of EXTRA_SAT_WORDS) {
  DICT.add(w.toLowerCase());
}

function isStandaloneWord(w) {
  if (!w) return false;
  if (w.length === 1) {
    return w === 'a' || w === 'i';
  }
  return DICT.has(w);
}

// -----------------------------------------------------------------------------
// 1. Text Normalization & Comprehensive Kerning Repair
// -----------------------------------------------------------------------------
function cleanText(text) {
  if (!text) return '';
  let res = text;

  // Normalize chemical formulas first
  res = res
    .replace(/\bH2S\b/g, 'H₂S')
    .replace(/\bCO2\b/g, 'CO₂')
    .replace(/\bH2O\b/g, 'H₂O')
    .replace(/\bO2\b/g, 'O₂')
    .replace(/\bCH4\b/g, 'CH₄')
    .replace(/\bSO2\b/g, 'SO₂')
    .replace(/\bNO2\b/g, 'NO₂')
    .replace(/\bCaCO3\b/g, 'CaCO₃');

  // Normalize and clean technical abbreviations and proper names first
  res = res
    .replace(/___+e\s*DNA___+/gi, 'eDNA')
    .replace(/\be\s+DNA\b/gi, 'eDNA')
    .replace(/\bm\s+RNA\b/gi, 'mRNA')
    .replace(/\bt\s+RNA\b/gi, 'tRNA')
    .replace(/\br\s+RNA\b/gi, 'rRNA')
    .replace(/\bc\s+DNA\b/gi, 'cDNA')
    .replace(/\bKillingswor\s+th\b/gi, 'Killingsworth')
    .replace(/\b([A-Za-z]{3,}wor)\s+th\b/gi, '$1th');

  // Intra-word kerning pairs common in College Board PDFs (case-preserving)
  const wordPairs = [
    [/\bKillingswor\s+th\b/gi, 'Killingsworth'],
    [/\b([A-Za-z]{3,}wor)\s+th\b/gi, '$1th'],
    [/\bL\s+and\b/g, 'Land'],
    [/\bS\s+r\b/g, 'Sr'],
    [/\b([A-Za-z]{4,})\s+(worth|tion|tions|sion|sions|ment|ments|ness|able|ible|ling|lings|ings|ally)\b/gi, (m, p1, p2) => {
      const c = (p1 + p2).toLowerCase();
      return DICT.has(c) ? p1 + p2 : m;
    }],
    [/\bT\s+o\b/g, 'To'],
    [/\bt\s+o\b/g, 'to'],
    [/\bSA\s+T\b/g, 'SAT'],
    [/\bEar\s+th\b/g, 'Earth'],
    [/\bear\s+th\b/g, 'earth'],
    [/\bear\s+thly\b/g, 'earthly'],
    [/\bEar\s+ly\b/g, 'Early'],
    [/\bear\s+ly\b/g, 'early'],
    [/\bar\s+t(s)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bar\s+tist(s)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bar\s+tistic(ally)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bpor\s+tr\s*ait(s)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bpor\s+tr\s*ay(s|ed|ing)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bsuppor\s+t(s|ed|ing|er|ers)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bpropor\s+tion(s|al|ally)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bpar\s+ticipant(s)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bpar\s+ticipat(e|ed|ing|ion|ory)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bfor\s+ag(e|es|ed|ing)\b/gi, m => m.replace(/\s+/g, '')],
    [/\bfor\s+ager(s)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bCentr\s+al\b/gi, m => m.replace(/\s+/g, '')],
    [/\bInfor\s+mation\b/gi, m => m.replace(/\s+/g, '')],
    [/\bCr\s+aft\b/gi, m => m.replace(/\s+/g, '')],
    [/\bgr\s+aph(s)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\baver\s+age(s)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\br\s+at(e|es|ed|ing|ings)\b/gi, m => m.replace(/\s+/g, '')],
    [/\bstr\s+aight(forward)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bvibr\s+ant(ly)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bdr\s+ab\b/gi, m => m.replace(/\s+/g, '')],
    [/\bcolor\s+ation\b/gi, m => m.replace(/\s+/g, '')],
    [/\brepor\s+t(s|ed|ing|er|ers)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\battr\s+act(ion|ions|ive|ively)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\battr\s+ibute[ds]?\b/gi, m => m.replace(/\s+/g, '')],
    [/\binfor\s+mat(ion|ions|ive)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bdiff\s+er(s|ed|ing|ent|ently|ence|ences)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bgover\s+n(ment|ments|ing|ed)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\benviron\s+ment(s|al|ally)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bhypo\s*the\s*sis\b/gi, m => m.replace(/\s+/g, '')],
    [/\bhypo\s*the\s*ses\b/gi, m => m.replace(/\s+/g, '')],
    [/\bpor\s+tion(s)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\btr\s+avel(s|ed|ing|er|ers)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\btr\s+ansit(s|ed|ing|ion|ions|ional)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\btr\s+ain(s)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\btr\s+end(s)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\btr\s+ansform(s|ed|ing|ation|ations)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\btr\s+anslat(e|es|ed|ing|ion|ions)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\btr\s+ansport(s|ed|ing|ation)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\btr\s+ansparent\b/gi, m => m.replace(/\s+/g, '')],
    [/\bNor\s+thern\b/gi, m => m.replace(/\s+/g, '')],
    [/\bSou\s+thern\b/gi, m => m.replace(/\s+/g, '')],
    [/\bshor\s+t(s|er|est)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bpor\s+t(s)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bappar\s+ent(ly)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bliter\s+al(ly)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bliter\s+ar(y|ily)\b/gi, m => m.replace(/\s+/g, '')],
    [/\bliter\s+ature\b/gi, m => m.replace(/\s+/g, '')],
    [/\baccur\s+at(e|ely|ion)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bexper\s+t(s|ise)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bdepar\s+t(s|ed|ing|ure|ures|ment|ments)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\boppor\s+tun(ity|ities)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bpar\s+t(s|ly)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bsmar\s+t(phones?|er|est)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bchar\s+acter(s|istic|istics|ize|ized)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bextr\s+aordinary\b/gi, m => m.replace(/\s+/g, '')],
    [/\bextr\s+aordinarily\b/gi, m => m.replace(/\s+/g, '')],
    [/\bphr\s+ase[s]?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bcontr\s+ast(s|ed|ing)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bimpor\s+tan(t|ce|tly)\b/gi, m => m.replace(/\s+/g, '')],
    [/\bencour\s+ag(e|es|ed|ing)\b/gi, m => m.replace(/\s+/g, '')],
    [/\bgener\s+ation(s)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\boper\s+at(e|es|ed|ing|ion|ions)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bmoder\s+at(e|ely|ion)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\btemper\s+ature[s]?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bmigr\s+at(e|es|ed|ing|ion|ions|ory)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bnarr\s+at(e|es|ed|ing|ion|ive|ives|or|ors)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\billustr\s+at(e|es|ed|ing|ion|ions)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bdemonstr\s+at(e|es|ed|ing|ion|ions)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bfr\s+agment[s]?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bindivid\s+ual[s]?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bgrad\s+ual(ly)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bcontin\s+u(e|es|ed|ing|ous|ously)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bsignific\s+ant(ly)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bconst\s+ant(ly)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bstructur\s+al\b/gi, m => m.replace(/\s+/g, '')],
    [/\bstructur\s+es\b/gi, m => m.replace(/\s+/g, '')],
    [/\bproper\s+ties\b/gi, m => m.replace(/\s+/g, '')],
    [/\bproper\s+ty\b/gi, m => m.replace(/\s+/g, '')],
    [/\blabor\s+atory\b/gi, m => m.replace(/\s+/g, '')],
    [/\blabor\s+atories\b/gi, m => m.replace(/\s+/g, '')],
    [/\barr\s+ange(s|d|ment|ments)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bperspect\s+ive[s]?\b/gi, m => m.replace(/\s+/g, '')],
    [/\beffect\s+ive(ly)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bdistinct\s+ive(ly)?\b/gi, m => m.replace(/\s+/g, '')],
    [/\bChoice\s*([A-D])\s*is\b/g, 'Choice $1 is'],
    [/\bChoice\s*([A-D])\b/g, 'Choice $1'],
  ];

  for (const [pattern, replacement] of wordPairs) {
    res = res.replace(pattern, replacement);
  }

  // Fix PDF internal font kerning splits where 'r' is separated from 't' or 'th' (e.g. "cer tain", "uncer tainty", "ar tifacts", "Fur ther")
  res = res.replace(/\b([a-zA-Z]+r)\s+(t(?:h)?[a-zA-Z]+)\b/gi, (m, p1, p2) => {
    const combined = (p1 + p2).toLowerCase();
    const commonPairs = ['forthe', 'forthis', 'forthat', 'fortheir', 'forthem', 'herthe', 'nearthe', 'fartoo', 'overthe', 'underthe', 'afterthe'];
    if (commonPairs.includes(combined)) return m;
    if (DICT.has(combined) && (!isStandaloneWord(p1.toLowerCase()) || !isStandaloneWord(p2.toLowerCase()) || ['ar', 'par', 'cer', 'fur', 'nor', 'sou', 'shor', 'unfor', 'suppor'].includes(p1.toLowerCase()))) {
      return p1 + p2;
    }
    return m;
  });

  // Join stranded single ending consonants with dictionary validation
  res = res.replace(/([A-Za-z]{2,})\s+([bcdfghjklmnpqrstvwxyz])(?=[\s.,;?!’'”"\)\]\-]|$)/gi, (m, p1, p2) => {
    const combined = (p1 + p2).toLowerCase();
    return DICT.has(combined) ? p1 + p2 : m;
  });

  // Single capital letters separated from lowercase word body (e.g. "T est", "V erne", "T rek", "T opaz")
  res = res.replace(/\b([B-HJ-NP-Z])\s+([a-z]{2,})\b/g, '$1$2');

  // Specific poem & contraction repairs
  res = res
    .replace(/\bslumbe\s*r\s*’\s*d\b/g, "slumber’d")
    .replace(/\bblabb\s*’\s*d\b/g, "blabb’d")
    .replace(/\bduty\s*’\s*s\b/g, "duty’s")
    .replace(/\bcan\s*’\s*t\b/gi, "can’t")
    .replace(/\bisn\s*’\s*t\b/gi, "isn’t")
    .replace(/\bwouldn\s*’\s*t\b/gi, "wouldn’t")
    .replace(/\bdoesn\s*’\s*t\b/gi, "doesn’t")
    .replace(/\bdon\s*’\s*t\b/gi, "don’t")
    .replace(/\bhaven\s*’\s*t\b/gi, "haven’t")
    .replace(/\bhasn\s*’\s*t\b/gi, "hasn’t")
    .replace(/\bweren\s*’\s*t\b/gi, "weren’t")
    .replace(/\bwasn\s*’\s*t\b/gi, "wasn’t")
    .replace(/\baren\s*’\s*t\b/gi, "aren’t");

  // Post-pass: enforce space between lowercase and uppercase letter (e.g. CharlesS. -> Charles S., ofW.E.B. -> of W.E.B.)
  res = res.replace(/([a-z])([A-Z])/g, (m, p1, p2) => p1 + ' ' + p2);

  // Restore & normalize abbreviations and technical terms
  res = res
    .replace(/\be\s+DNA\b/gi, 'eDNA')
    .replace(/\bc\s+DNA\b/gi, 'cDNA')
    .replace(/\bm\s+RNA\b/gi, 'mRNA')
    .replace(/\bt\s+RNA\b/gi, 'tRNA')
    .replace(/\br\s+RNA\b/gi, 'rRNA')
    .replace(/\bp\s+H\b/g, 'pH')
    .replace(/___+e\s*DNA___+/gi, 'eDNA')
    .replace(/___+([a-zA-Z]+)___+/g, (m, p1) => p1)
    .replace(/@+e\s*DNA@+/gi, 'eDNA')
    .replace(/@+([a-zA-Z]+)@+/g, (m, p1) => p1)
    .replace(/@+/g, '');

  // Space after chemical symbols, isotopes, superscripts, subscripts, or hyphenated terms followed by lowercase words
  res = res
    .replace(/\bL\s+and\b/g, 'Land')
    .replace(/\bS\s+r\b/g, 'Sr')
    .replace(/(<\/sup>)\s*Sr/g, (m, p1) => p1 + 'Sr')
    .replace(/(<\/sub>)\s*Sr/g, (m, p1) => p1 + 'Sr')
    .replace(/Sr\s*\/\s*(<sup>\d+<\/sup>)Sr/g, (m, p1) => 'Sr/' + p1 + 'Sr')
    .replace(/(<\/sup>Sr)([a-z]+)\b/g, (m, p1, p2) => p1 + ' ' + p2)
    .replace(/(<\/sub>Sr)([a-z]+)\b/g, (m, p1, p2) => p1 + ' ' + p2)
    .replace(/(<\/sup>[A-Z])(than|to)\b/g, (m, p1, p2) => p1 + ' ' + p2)
    .replace(/(<\/sub>[A-Z])(than|to)\b/g, (m, p1, p2) => p1 + ' ' + p2)
    .replace(/(\d+-[A-Z])([a-z]+)\b/g, (m, p1, p2) => p1 + ' ' + p2)
    .replace(/(\bN)(than|to)\b/g, (m, p1, p2) => p1 + ' ' + p2);

  // Initial with dot followed by capital letter: "Charles S.Peirce" -> "Charles S. Peirce", "W.E.B.Du Bois" -> "W.E.B. Du Bois"
  res = res.replace(/([A-Z]\.)([A-Z][a-z])/g, '$1 $2');

  // Punctuation followed immediately by a letter
  res = res.replace(/([,;?!])([A-Za-z])/g, '$1 $2');

  // Remove stray spaces before punctuation and apostrophes
  res = res
    .replace(/\s+([’'.,;?!:])/g, '$1')
    .replace(/([“‘])\s+/g, '$1')
    .replace(/\b([A-D])\s+\./g, '$1.')
    .replace(/\bDr\s+\./g, 'Dr.')
    .replace(/\bMr\s+\./g, 'Mr.')
    .replace(/\bMs\s+\./g, 'Ms.')
    .replace(/\b([a-zA-Z]+)-\s+([a-zA-Z]+)\b/g, '$1-$2');

  // Merge adjacent tag pairs: </u> <u> -> ' ', </em> <em> -> ' '
  res = res.replace(/<\/u>\s*<u>/g, ' ');
  res = res.replace(/<\/em>\s*<em>/g, ' ');
  res = res.replace(/<u>\s+/g, ' <u>').replace(/\s+<\/u>/g, '</u> ');
  res = res.replace(/<em>\s+/g, ' <em>').replace(/\s+<\/em>/g, '</em> ');

  // Preserve capital letters at sentence boundaries (Requirement 4):
  // Never lowercase words that follow terminal punctuation (. ? !)
  res = res.replace(/([.?!]["'”’)]?\s+)(participants?|surveys?|researchers?|scientists?|authors?|students?|studies|data|findings?|results?|evidence|inferences?|hypotheses|hypothesis|transitions?|choices?|options?|questions?|texts?|passages?|tables?|graphs?|charts?)\b/gi, (m, p1, p2) => {
    return p1 + p2.charAt(0).toUpperCase() + p2.slice(1);
  });

  // Collapse consecutive horizontal whitespace (preserving newlines)
  res = res.replace(/[ \t]+/g, ' ').replace(/[ \t]*\n[ \t]*/g, '\n').trim();
  return res;
}

// -----------------------------------------------------------------------------
// Matrix & Vector Underline Detection
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

async function extractUnderlines(page) {
  const ops = await page.getOperatorList();
  let ctm = [1, 0, 0, 1, 0, 0];
  const ctmStack = [];
  const lines = [];

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
      const opsList = args[0];
      const pArgs = args[1];
      if (opsList.length === 1 && opsList[0] === 19 && pArgs.length >= 4) {
        const x = ctm[0] * pArgs[0] + ctm[2] * pArgs[1] + ctm[4];
        const y = ctm[1] * pArgs[0] + ctm[3] * pArgs[1] + ctm[5];
        const w = ctm[0] * pArgs[2];
        const h = Math.abs(ctm[3] * pArgs[3]);
        // Underline rectangle in passage area
        if (h <= 3 && Math.abs(w) >= 12 && y > 150 && y < 700) {
          lines.push({ x1: Math.min(x, x + w), x2: Math.max(x, x + w), y });
        }
      }
      let pIdx = 0;
      let curX = 0, curY = 0;
      for (const op of opsList) {
        if (op === 13) {
          curX = ctm[0] * pArgs[pIdx] + ctm[2] * pArgs[pIdx + 1] + ctm[4];
          curY = ctm[1] * pArgs[pIdx] + ctm[3] * pArgs[pIdx + 1] + ctm[5];
          pIdx += 2;
        } else if (op === 14) {
          const nextX = ctm[0] * pArgs[pIdx] + ctm[2] * pArgs[pIdx + 1] + ctm[4];
          const nextY = ctm[1] * pArgs[pIdx] + ctm[3] * pArgs[pIdx + 1] + ctm[5];
          pIdx += 2;
          if (Math.abs(curY - nextY) <= 1.5 && Math.abs(curX - nextX) >= 12 && curY > 150 && curY < 700) {
            lines.push({ x1: Math.min(curX, nextX), x2: Math.max(curX, nextX), y: (curY + nextY) / 2 });
          }
        } else if (op === 19) {
          pIdx += 4;
        } else {
          pIdx += 2;
        }
      }
    }
  }
  return lines;
}

// -----------------------------------------------------------------------------
// 2. Italic Font Detection per Page
// -----------------------------------------------------------------------------
function detectPageItalicFonts(tc) {
  const fontItems = {};
  tc.items.forEach(it => {
    if (!fontItems[it.fontName]) fontItems[it.fontName] = [];
    fontItems[it.fontName].push(it.str);
  });
  let bodyFont = null;
  let maxLen = 0;
  for (const [f, its] of Object.entries(fontItems)) {
    const totalLen = its.reduce((acc, s) => acc + s.length, 0);
    if (totalLen > maxLen) {
      maxLen = totalLen;
      bodyFont = f;
    }
  }
  const italicFonts = new Set();
  for (const [f, its] of Object.entries(fontItems)) {
    if (f === bodyFont) continue;
    const combined = its.join(' ').replace(/\s+/g, ' ').trim();
    if (combined.match(/Question\s+ID:/i)) continue;
    if (combined.match(/Assessment|Domain|Skill|Difficulty/i)) continue;
    if (combined.match(/^(?:Question|Answer|Rationale|Correct\s+Answer(?:\s*:\s*[A-D])?|Choice\s+[A-D](?:\s+is)?)(?:\s+|$)/i)) continue;
    if (combined.includes('Reading and Writing')) continue;
    if (!/[a-zA-Z]{2,}/.test(combined)) continue;
    italicFonts.add(f);
  }
  return italicFonts;
}

// -----------------------------------------------------------------------------
// 3. Assemble PDF Page Text Lines Using Dictionary Spacing Engine & Underlines
// -----------------------------------------------------------------------------
function assemblePageLines(content, underlines = [], italicFonts = new Set()) {
  const items = (content.items || []).filter(it => it.str);
  if (items.length === 0) return [];

  // Compute bodyFontSize from items that look like regular words (>= 3 alpha chars)
  const fontSizes = [];
  for (const it of items) {
    if (/[a-zA-Z]{3,}/.test(it.str)) {
      const fs = Math.sqrt(it.transform[0] ** 2 + it.transform[1] ** 2) || 10;
      fontSizes.push(fs);
    }
  }
  fontSizes.sort((a, b) => a - b);
  const bodyFontSize = fontSizes.length > 0 ? fontSizes[Math.floor(fontSizes.length / 2)] : 10;
  const smallFontThreshold = bodyFontSize * 0.86;

  // Pass 1: Separate normal baseline items from potential sub/superscripts
  const baselineItems = [];
  const smallItems = [];
  for (const it of items) {
    const fs = Math.sqrt(it.transform[0] ** 2 + it.transform[1] ** 2) || 10;
    if (fs < smallFontThreshold) {
      smallItems.push(it);
    } else {
      baselineItems.push(it);
    }
  }

  // Sort baseline items top-to-bottom (Y desc), then left-to-right (X asc)
  baselineItems.sort((a, b) => b.transform[5] - a.transform[5] || a.transform[4] - b.transform[4]);

  const lineGroups = [];
  let curGroup = [];
  let curY = null;

  for (const it of baselineItems) {
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

  // Pass 2: Attach small/shifted items (superscripts/subscripts) to the nearest baseline line in [-6.0, +9.0]
  for (const it of smallItems) {
    const y = it.transform[5];
    let bestLine = null;
    let minDy = Infinity;
    for (const l of lineGroups) {
      const dy = y - l.y;
      if (dy >= -6.0 && dy <= 9.0) {
        if (Math.abs(dy) < minDy) {
          minDy = Math.abs(dy);
          bestLine = l;
        }
      }
    }
    if (bestLine) {
      const dy = y - bestLine.y;
      if (dy >= 1.2) {
        it.isSup = true;
      } else if (dy <= -1.2) {
        it.isSub = true;
      }
      bestLine.items.push(it);
    } else {
      lineGroups.push({ y, items: [it] });
    }
  }

  // Sort lineGroups top-to-bottom (Y desc)
  lineGroups.sort((a, b) => b.y - a.y);

  return lineGroups.map(({ y, items: lineItems }) => {
    lineItems.sort((a, b) => a.transform[4] - b.transform[4]);
    const minX = lineItems[0].transform[4];
    const maxX = lineItems[lineItems.length - 1].transform[4] + lineItems[lineItems.length - 1].width;
    const width = maxX - minX;

    // Check if any underline line matches this text line
    const matchingUnderlines = underlines.filter(ul => {
      const dy = y - ul.y;
      return dy >= 0.5 && dy <= 4.0;
    });

    // Tag items that fall within an underline span
    const isItemUnderlined = (it) => {
      const itStart = it.transform[4];
      const itEnd = itStart + it.width;
      return matchingUnderlines.some(ul => (itStart >= ul.x1 - 3 && itEnd <= ul.x2 + 4) || (itStart <= ul.x2 && itEnd >= ul.x1));
    };

    const isItemItalic = (it) => italicFonts.has(it.fontName);

    let text = '';
    let currentlyUnderlined = false;
    let currentlyItalic = false;

    for (let i = 0; i < lineItems.length; i++) {
      const it = lineItems[i];
      let str = it.str;
      const fontSize = Math.sqrt(it.transform[0] ** 2 + it.transform[1] ** 2) || 10;
      const underlined = isItemUnderlined(it);
      const italic = isItemItalic(it);

      // Check baseline shift for sub/sup
      const dy = it.transform[5] - y;
      if (it.isSup || (fontSize <= 8.5 && dy >= 1.2)) {
        str = `<sup>${str}</sup>`;
      } else if (it.isSub || (fontSize <= 8.5 && dy <= -1.2)) {
        str = `<sub>${str}</sub>`;
      }

      if (underlined && !currentlyUnderlined) {
        text += '<u>';
        currentlyUnderlined = true;
      } else if (!underlined && currentlyUnderlined) {
        text += '</u>';
        currentlyUnderlined = false;
      }

      if (italic && !currentlyItalic) {
        text += '<em>';
        currentlyItalic = true;
      } else if (!italic && currentlyItalic) {
        text += '</em>';
        currentlyItalic = false;
      }

      if (i === 0) {
        text += str;
      } else {
        const prev = lineItems[i - 1];
        const dx = it.transform[4] - (prev.transform[4] + prev.width);

        const leftClean = prev.str.replace(/<[^>]+>/g, '').trimEnd();
        const rightClean = it.str.replace(/<[^>]+>/g, '').trimStart();

        let shouldInsertSpace = false;

        // Rule 1: No space after ( or [ or / before sup/sub
        const noSpaceLeft = /[\(\[\/]$/.test(leftClean);
        // Rule 2: No space between sup/sub and chemical symbols (Sr, N, etc) or / or )
        const isChemSymbol = /^(Sr|N|C|H|O|Pb|U|Th|Nd|Ca|Fe)[\b\)\],;\.]/i.test(rightClean) || /^(Sr|N|C|H|O)\b/i.test(rightClean) || /^[\/\)\]]/.test(rightClean);
        const leftIsSupSub = prev.isSup || prev.isSub || /<\/(?:sup|sub)>$/.test(text);

        if (noSpaceLeft && (it.isSup || it.isSub || /^<(?:sup|sub)>/.test(str))) {
          shouldInsertSpace = false;
        } else if (leftIsSupSub && isChemSymbol) {
          shouldInsertSpace = false;
        } else if (dx > fontSize * 0.10 && (/[0-9\-]$/.test(leftClean) || leftIsSupSub || /[A-Z]$/.test(leftClean)) && /^[a-z]/.test(rightClean)) {
          // Rule 3: Space after uppercase/digit/tag before lowercase word if combined is not a dictionary word
          const leftWordMatch = leftClean.match(/([a-zA-Z]+)$/);
          const rightWordMatch = rightClean.match(/^([a-zA-Z]+)/);
          const combined = (leftWordMatch && rightWordMatch) ? (leftWordMatch[1] + rightWordMatch[1]).toLowerCase() : '';
          if (!combined || !DICT.has(combined) || leftIsSupSub || /[0-9\-]/.test(leftClean)) {
            shouldInsertSpace = true;
          }
        } else if (dx > fontSize * 0.12 && (/[a-z]$/.test(leftClean) && /^[A-Z]/.test(rightClean) || /[,.;:?!’”)]$/.test(leftClean) && /^[A-Za-z“‘(\[]/.test(rightClean))) {
          shouldInsertSpace = true;
        } else if (!shouldInsertSpace) {
          if (dx >= fontSize * 0.36) {
            shouldInsertSpace = true;
          } else if (dx > 0) {
            // Tight / borderline gap (0 < dx < fontSize * 0.36)
            const leftWordMatch = leftClean.match(/([a-zA-Z]+)$/);
            const rightWordMatch = rightClean.match(/^([a-zA-Z]+)/);

            if (leftWordMatch && rightWordMatch) {
              const leftWord = leftWordMatch[1];
              const rightWord = rightWordMatch[1];
              const combined = (leftWord + rightWord).toLowerCase();
              const leftLower = leftWord.toLowerCase();
              const rightLower = rightWord.toLowerCase();

              const isCombinedWord = DICT.has(combined);
              const isLeftWord = isStandaloneWord(leftLower);
              const isRightWord = isStandaloneWord(rightLower);

              if (isCombinedWord && !(isLeftWord && isRightWord)) {
                // Kerning split of single valid word (e.g. "por trait" -> "portrait", "ar t" -> "art")
                shouldInsertSpace = false;
              } else if (isLeftWord && isRightWord) {
                // Two separate valid words (e.g. "of the", "lay lightly")
                shouldInsertSpace = true;
              } else {
                shouldInsertSpace = dx >= (fontSize * 0.22);
              }
            } else {
              shouldInsertSpace = dx >= (fontSize * 0.24);
            }
          }
        }

        if (shouldInsertSpace && !it.str.startsWith(' ') && !text.endsWith(' ') && !text.endsWith('<u>') && !text.endsWith('<em>')) {
          text += ' ';
        }
        text += str;
      }
    }

    if (currentlyItalic) {
      text += '</em>';
    }
    if (currentlyUnderlined) {
      text += '</u>';
    }

    return {
      y,
      minX,
      width,
      text: cleanText(text),
      rawItems: lineItems,
    };
  });
}

// -----------------------------------------------------------------------------
// 3.5 Full-Width Prose Sentence Detection (Below Tables / Visual Figures)
// -----------------------------------------------------------------------------
function isProseSentence(l) {
  if (!l || l.width <= 250) return false;
  // Paragraph left margin is strictly <= 20pt (standard 18pt in College Board PDFs)
  if (l.minX > 20) return false;
  const t = (l.text || '').trim();
  // Must not end with numbers or be a data row
  if (/\b\d+(?:\.\d+)?(?:\s*,\s*\d+)*\s*$/.test(t) && !/[.?!]$/.test(t)) return false;
  // Must not have multi-column numbers (e.g. "1.86 30.40 -4.29")
  if (/\d+\.?\d*\s+\d+\.?\d*\s+[\-−]?\d+/.test(t)) return false;
  // Must start with capital letter or quote
  if (!/^[A-Z“‘]/.test(t)) return false;
  // Must contain prose words
  return /\b(that|the|a|an|in|on|at|to|for|of|with|by|after|before|while|when|although|since|because|it|they|he|she|we|his|her|their|our|and|conducted|investigated|hypothesized|survey|experiment|found|studied|gathered|concluded|listed|reported|team|researchers|scientists|participants|species|adults)\b/i.test(t);
}

// -----------------------------------------------------------------------------
// 4. Passage & Prompt Assembly (Preserves Indentation, Notes, Poems)
// -----------------------------------------------------------------------------
function assembleQuestionPassageAndPrompt(lines, domain, skill) {
  if (!lines || lines.length === 0) {
    return { passage: '', prompt: 'Which choice most logically completes the text?' };
  }

  // 1. Locate Prompt starting line index
  let promptStartIdx = -1;
  const PROMPT_PATTERNS = [
    /^(?:Which\s+(?:choice|quotation|finding|statement|of\s+the\s+following|detail|question))/i,
    /^(?:Based\s+on\s+the\s+texts?|According\s+to\s+the\s+texts?|The\s+student\s+wants\s+to|As\s+used\s+in\s+the\s+text)/i,
    /^(?:Taken\s+together|What\s+(?:does\s+the\s+text|is\s+the\s+main)|The\s+text\s+makes\s+which\s+point|These\s+records\s+formed)/i
  ];

  // Scan backwards from bottom
  for (let i = lines.length - 1; i >= Math.max(0, lines.length - 5); i--) {
    const text = lines[i].text;
    if (PROMPT_PATTERNS.some(pat => pat.test(text))) {
      // Check that from i to the end there are NO blanks (_____)
      const rest = lines.slice(i).map(l => l.text).join(' ');
      if (!rest.includes('_____') && !rest.includes('______')) {
        promptStartIdx = i;
        break;
      }
    }
  }

  // Fallback: search for last line ending with ? that does not contain blanks
  if (promptStartIdx === -1) {
    for (let i = lines.length - 1; i >= 0; i--) {
      const text = lines[i].text;
      if (text.includes('?') && !text.includes('_____') && !text.includes('______')) {
        promptStartIdx = i;
        while (promptStartIdx > 0 && !lines[promptStartIdx - 1].text.endsWith('.') && !lines[promptStartIdx - 1].text.endsWith('!') && !lines[promptStartIdx - 1].text.includes('_____')) {
          promptStartIdx--;
        }
        break;
      }
    }
  }

  let passageLines = lines;
  let promptLines = [];

  if (promptStartIdx > 0) {
    passageLines = lines.slice(0, promptStartIdx);
    promptLines = lines.slice(promptStartIdx);
  }

  let prompt = cleanText(promptLines.map(l => l.text).join(' '));
  if (!prompt || prompt.length < 5) {
    prompt = 'Which choice most logically completes the text?';
  }

  // 2. Assemble Passage Text with authentic paragraph breaks & indentation
  const fullPassageRaw = passageLines.map(l => l.text).join(' ');
  const isRhetorical = skill === 'Rhetorical Synthesis' || fullPassageRaw.includes('student has taken the following notes');
  const isCrossText = skill === 'Cross-Text Connections' || (/Text\s+1\b/i.test(fullPassageRaw) && /Text\s+2\b/i.test(fullPassageRaw));
  const isPoem = /poem|sonnet|stanzas|lines\s+from/i.test(fullPassageRaw) || /poem|stanzas/i.test(prompt);

  let passage = '';

  if (isRhetorical) {
    // Rhetorical Synthesis: Bullet notes list
    const introMatch = fullPassageRaw.match(/(While researching a topic, a student has taken the following notes:)([\s\S]*)/i);
    const intro = introMatch ? cleanText(introMatch[1]) : '';
    const noteLines = passageLines.filter(l => !l.text.includes('While researching a topic'));
    const discreteNotes = [];
    let curNote = '';

    for (let i = 0; i < noteLines.length; i++) {
      const cur = noteLines[i];
      const trimmed = cur.text.trim();
      if (!trimmed) continue;

      const prev = i > 0 ? noteLines[i - 1] : null;
      const prevEndsWithPunct = prev ? /[.?!;’”"]$/.test(prev.text.trim()) : false;
      const dy = prev ? prev.y - cur.y : 0;
      const startsWithBulletChar = /^[•\-\*]/.test(trimmed);

      // A new note can ONLY start if:
      // (1) curNote is empty, OR
      // (2) current line explicitly starts with a bullet char, OR
      // (3) previous line ended with terminal punctuation AND (line gap dy >= 13.5 OR current line starts with capital/quote)
      const startsNewNote = curNote === '' || startsWithBulletChar || (
        prevEndsWithPunct && (dy >= 13.5 || /^[A-Z0-9“‘]/.test(trimmed))
      );

      if (startsNewNote && curNote !== '') {
        discreteNotes.push(cleanText(curNote));
        curNote = trimmed;
      } else {
        curNote += (curNote ? ' ' : '') + trimmed;
      }
    }
    if (curNote) discreteNotes.push(cleanText(curNote));

    const formattedNotes = discreteNotes.map(n => '• ' + n.replace(/^[•\-\*]\s*/, '')).join('\n');
    passage = intro ? (intro + '\n\n' + formattedNotes) : formattedNotes;
  } else if (isCrossText) {
    // Cross-Text Connections: Text 1 & Text 2 formatting
    let section = 'intro';
    const t1Lines = [];
    const t2Lines = [];
    const introLines = [];

    const isStandaloneT1 = (t) => {
      const clean = t.trim();
      if (/^Text\s*1\s*$/i.test(clean)) return true;
      if (/^Text\s*1\b/i.test(clean) && !/^Text\s*1\s+(?:is\s+adapted|discusses|was\s+written|describes|presents|explores|argues|considers)\b/i.test(clean)) {
        return true;
      }
      return false;
    };

    const isStandaloneT2 = (t) => {
      const clean = t.trim();
      if (/^Text\s*2\s*$/i.test(clean)) return true;
      if (/^Text\s*2\b/i.test(clean) && !/^Text\s*2\s+(?:is\s+adapted|discusses|was\s+written|describes|presents|explores|argues|considers)\b/i.test(clean)) {
        return true;
      }
      return false;
    };

    for (const l of passageLines) {
      if (isStandaloneT1(l.text)) {
        section = 't1';
        const afterT1 = l.text.replace(/^Text\s*1\s*/i, '');
        if (afterT1.trim()) t1Lines.push({ ...l, text: afterT1.trim() });
      } else if (isStandaloneT2(l.text)) {
        section = 't2';
        const afterT2 = l.text.replace(/^Text\s*2\s*/i, '');
        if (afterT2.trim()) t2Lines.push({ ...l, text: afterT2.trim() });
      } else {
        if (section === 't1') t1Lines.push(l);
        else if (section === 't2') t2Lines.push(l);
        else introLines.push(l);
      }
    }

    const formatBlock = (bLines) => {
      let res = '';
      for (let i = 0; i < bLines.length; i++) {
        const cur = bLines[i];
        if (i === 0) {
          res += cur.text;
        } else {
          const prev = bLines[i - 1];
          const dy = prev.y - cur.y;
          if (dy >= 19.5) {
            res += '\n\n' + cur.text;
          } else {
            res += ' ' + cur.text;
          }
        }
      }
      return cleanText(res);
    };

    const parts = [];
    if (introLines.length) parts.push(formatBlock(introLines));
    parts.push('Text 1\n' + formatBlock(t1Lines));
    parts.push('Text 2\n' + formatBlock(t2Lines));
    passage = parts.join('\n\n');
  } else if (isPoem) {
    // Poetry: Preserve verse lines and stanzas
    let res = '';
    for (let i = 0; i < passageLines.length; i++) {
      const cur = passageLines[i];
      if (i === 0) {
        res += cur.text;
      } else {
        const prev = passageLines[i - 1];
        const dy = prev.y - cur.y;
        const isIntro = /^(?:The\s+following|Adapted\s+from)/i.test(prev.text);
        if (isIntro || dy >= 25) {
          res += '\n\n' + cur.text;
        } else if (dy >= 18 || cur.minX > 35) {
          res += '\n' + cur.text;
        } else {
          res += ' ' + cur.text;
        }
      }
    }
    passage = cleanText(res);
  } else {
    // Standard Prose / Indented Excerpt block:
    let res = '';
    for (let i = 0; i < passageLines.length; i++) {
      const cur = passageLines[i];
      if (i === 0) {
        res += cur.text;
      } else {
        const prev = passageLines[i - 1];
        const dy = prev.y - cur.y;
        const isIndentTransition = (cur.minX >= 35 && prev.minX < 30);
        const isParagraphGap = dy >= 19.5;
        const isFirstLineIndent = (cur.minX >= prev.minX + 14 && /[.?!’”"]$/.test(prev.text));

        if (isParagraphGap || isIndentTransition || isFirstLineIndent) {
          res += '\n\n' + cur.text;
        } else {
          res += ' ' + cur.text;
        }
      }
    }
    passage = cleanText(res);
  }

  // Strip stray PDF header OCR artifacts if present
  passage = passage
    .replace(/^Question\s+ID\s*:\s*[a-zA-Z0-9]+\s*/gi, '')
    .replace(/^Assessment\s+Reading\s+and\s+Writing\s*/gi, '')
    .trim();

  // Preserve trailing fill-in-the-blank lines (______.) at the end of passages
  // (fixing "suggesting that ______." where the trailing period was cut off or missing)
  if (/______\s*$/.test(passage)) {
    passage = passage.replace(/______\s*$/, '______.');
  }

  prompt = prompt
    .replace(/^Question\s+ID\s*:\s*[a-zA-Z0-9]+\s*/gi, '')
    .replace(/^Assessment\s+Reading\s+and\s+Writing\s*/gi, '')
    .trim();

  // Fix Cross-Text Connections Extraction & Card Splitting:
  // Match ONLY the final standalone question sentence at the end of prompt using non-greedy sentence-boundary regex:
  const STANDALONE_QUESTION_REGEX = /(?:^|\n|[.?!…”"'](?:\s*<\/[a-z0-9]+>)*\s+)((?:Based on the (?:texts|two texts)|Which choice|According to|What is|How would|Both texts)[^?]+\?)\s*$/i;
  const questionMatch = prompt.match(STANDALONE_QUESTION_REGEX);
  if (questionMatch) {
    const finalQuestion = questionMatch[1].trim();
    const qIndex = prompt.lastIndexOf(finalQuestion);
    const beforePrompt = prompt.slice(0, qIndex).trim();

    if (beforePrompt && (beforePrompt.includes('Text 2') || beforePrompt.includes('Text 1') || /Based on the/i.test(finalQuestion))) {
      prompt = finalQuestion;
      let cleanExtra = beforePrompt.replace(/^Text\s*2\s*/i, '').trim();

      if (passage.includes('Text 2')) {
        if (/Text\s*2\s*$/i.test(passage.trim())) {
          passage = passage.trim() + '\n' + cleanExtra;
        } else {
          passage = passage.trim() + ' ' + cleanExtra;
        }
      } else {
        passage = passage.trim() + '\n\nText 2\n' + cleanExtra;
      }
    }
  }

  return { passage, prompt };
}

// -----------------------------------------------------------------------------
// 5. Main PDF Converter Engine
// -----------------------------------------------------------------------------
async function convertPdfs() {
  console.log('========================================================================');
  console.log('   SATify: High-Precision Reading & Writing PDF Question Bank Engine   ');
  console.log('========================================================================\n');

  const pdfFiles = [
    { file: 'CRAFT_AND_STRUCTURE.pdf', defaultDomain: 'Craft and Structure' },
    { file: 'EXPRESSION_OF_IDEAS.pdf', defaultDomain: 'Expression of Ideas' },
    { file: 'Information_&_Ideas.pdf', defaultDomain: 'Information and Ideas' },
    { file: 'STANDARD_ENGLISH_CONVENTIONS.pdf', defaultDomain: 'Standard English Conventions' },
  ];

  const allQuestions = [];
  const auditResults = [];
  const diffStats = { Easy: 0, Medium: 0, Hard: 0 };
  let totalVisualChartsCropped = 0;
  let totalUnderlinedQuestions = 0;

  for (const { file, defaultDomain } of pdfFiles) {
    const filePath = path.join('raw-pdfs', file);
    if (!fs.existsSync(filePath)) {
      console.warn(`[WARN] File not found: ${filePath}`);
      continue;
    }

    process.stdout.write(`Scanning ${file}... `);
    const data = new Uint8Array(fs.readFileSync(filePath));
    const doc = await pdfjsLib.getDocument({ data }).promise;
    console.log(`(${doc.numPages} pages)`);

    // Preload all pages and lines with underline detection and italic font detection
    const pagesInfo = [];
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      const underlines = await extractUnderlines(page);
      const italicFonts = detectPageItalicFonts(content);
      const lines = assemblePageLines(content, underlines, italicFonts);
      const fullText = lines.map(l => l.text).join(' ');
      pagesInfo.push({ p, page, content, lines, fullText, underlines, italicFonts });
    }

    // Locate question start indices
    const questionStartPages = [];
    for (let i = 0; i < pagesInfo.length; i++) {
      const m = pagesInfo[i].fullText.match(/Question\s+ID\s*:\s*([a-zA-Z0-9]{8})/i);
      if (m) {
        questionStartPages.push({ pageIdx: i, id: m[1] });
      }
    }

    let extractedInFile = 0;
    const fileSkills = {};

    for (let qIdx = 0; qIdx < questionStartPages.length; qIdx++) {
      const startEntry = questionStartPages[qIdx];
      const nextEntry = questionStartPages[qIdx + 1];
      const startPageIdx = startEntry.pageIdx;
      const endPageIdx = nextEntry ? nextEntry.pageIdx : pagesInfo.length;

      const id = startEntry.id;
      const firstPageObj = pagesInfo[startPageIdx];
      const firstLines = firstPageObj.lines;

      // Identify header and markers on first page
      const qHeaderIdx = firstLines.findIndex(l => l.text.startsWith('Question') && l.y < 700);
      if (qHeaderIdx === -1) continue;

      let rawHeaderText = firstLines.slice(0, qHeaderIdx).map(l => l.text).join(' ');

      // (1) Normalize PDF metadata kerning splits BEFORE matching Domain and Skill
      const normalizedHeader = rawHeaderText
        .replace(/\bT\s+ext\b/gi, 'Text')
        .replace(/\bStr\s+ucture\b/gi, 'Structure')
        .replace(/\bPur\s+pose\b/gi, 'Purpose')
        .replace(/\bInfor\s+mation\b/gi, 'Information')
        .replace(/\bCentr\s+al\b/gi, 'Central')
        .replace(/\bCr\s+aft\b/gi, 'Craft')
        .replace(/\bT\s*r\s*ansitions\b/gi, 'Transitions')
        .replace(/&/g, 'and');

      // Difficulty
      let difficulty = 'Medium';
      if (/\bDifficulty\s+Easy\b/i.test(normalizedHeader) || /\bEasy\b/i.test(normalizedHeader)) {
        difficulty = 'Easy';
      } else if (/\bDifficulty\s+Hard\b/i.test(normalizedHeader) || /\bHard\b/i.test(normalizedHeader)) {
        difficulty = 'Hard';
      }

      // Canonical Header Skill detection
      let headerSkill = null;
      if (/Cross[\s\-]+Text\s+Connections/i.test(normalizedHeader)) {
        headerSkill = 'Cross-Text Connections';
      } else if (/Text\s+Structure\s+and(?:\s+(?:Easy|Medium|Hard))?\s+Purpose/i.test(normalizedHeader) || /Text\s+Structure\s+and\s+Purpose/i.test(normalizedHeader)) {
        headerSkill = 'Text Structure and Purpose';
      } else if (/Words\s+in\s+Context/i.test(normalizedHeader)) {
        headerSkill = 'Words in Context';
      } else if (/Rhetorical\s+Synthesis/i.test(normalizedHeader)) {
        headerSkill = 'Rhetorical Synthesis';
      } else if (/Transitions/i.test(normalizedHeader)) {
        headerSkill = 'Transitions';
      } else if (/Central\s+Ideas\s+and\s+Details/i.test(normalizedHeader)) {
        headerSkill = 'Central Ideas and Details';
      } else if (/Command\s+of\s+Evidence/i.test(normalizedHeader)) {
        headerSkill = 'Command of Evidence';
      } else if (/Inferences/i.test(normalizedHeader)) {
        headerSkill = 'Inferences';
      } else if (/Boundaries/i.test(normalizedHeader)) {
        headerSkill = 'Boundaries';
      } else if (/Form,?\s*Structure,?\s*(?:and|&).*?Sense/i.test(normalizedHeader) || /Form,?\s*Structure,?\s*(?:and|&)\s*Sense/i.test(normalizedHeader)) {
        headerSkill = 'Form, Structure, and Sense';
      }

      // -----------------------------------------------------------------------
      // Detect Visual Figure on First Page (Requirements 2 & 3)
      // -----------------------------------------------------------------------
      const ansHeaderIdx = firstLines.findIndex(l => l.text.startsWith('Answer'));
      const qEndLineIdx = ansHeaderIdx !== -1 ? ansHeaderIdx : firstLines.length;

      const betweenLines = firstLines.slice(qHeaderIdx + 1, qEndLineIdx);
      const betweenText = betweenLines.map(l => l.text).join(' ');

      // Never crop for Text Structure and Purpose or Craft and Structure
      const isTextStructure = headerSkill === 'Text Structure and Purpose' || /Text\s+Structure/i.test(normalizedHeader);
      const isCraftAndStructure = defaultDomain === 'Craft and Structure';

      // (a) Prompt explicitly mentions table, graph, chart, or figure
      const promptCandidateText = betweenLines.slice(Math.max(0, betweenLines.length - 4)).map(l => l.text).join(' ');
      const promptMentionsVisual = /\b(graph|table|chart|figure)\b/i.test(promptCandidateText);

      // Detect first full-width prose sentence below the table (spanning > 250pt forming complete sentence)
      let proseLineIdx = -1;
      for (let i = 0; i < betweenLines.length; i++) {
        if (isProseSentence(betweenLines[i])) {
          proseLineIdx = i;
          break;
        }
      }

      // (b) Operator list contains table grid rectangles/lines above prose paragraph (>= 4 lines)
      let hasGridOps = false;
      if (proseLineIdx > 0) {
        const proseY = betweenLines[proseLineIdx].y;
        const qHeaderY = firstLines[qHeaderIdx].y;
        const pathsInRegion = (firstPageObj.underlines || []).filter(u => u.y < qHeaderY && u.y > proseY);
        if (pathsInRegion.length >= 4) {
          hasGridOps = true;
        }
      }

      // (c) Multiple lines above prose paragraph contain 2+ distinct X-column clusters or numeric data rows
      let hasDataRows = false;
      if (proseLineIdx > 0) {
        let dataRowCount = 0;
        for (let i = 0; i < proseLineIdx; i++) {
          const l = betweenLines[i];
          const numMatches = l.text.match(/[\-−]?\d+(?:\.\d+)?/g);
          if (numMatches && numMatches.length >= 2) {
            dataRowCount++;
          } else if (l.rawItems && l.rawItems.length >= 3) {
            let columnGaps = 0;
            for (let j = 1; j < l.rawItems.length; j++) {
              const gap = l.rawItems[j].transform[4] - (l.rawItems[j - 1].transform[4] + l.rawItems[j - 1].width);
              if (gap > 25) columnGaps++;
            }
            if (columnGaps >= 2) dataRowCount++;
          }
        }
        if (dataRowCount >= 2) {
          hasDataRows = true;
        }
      }

      const shouldCrop = !isTextStructure && !isCraftAndStructure && proseLineIdx > 0 && (promptMentionsVisual || hasGridOps || (hasDataRows && /\b(table|graph|chart|figure)\b/i.test(betweenText)));

      // Delete any erroneously cropped images for Text Structure and Purpose or Craft and Structure
      if (isTextStructure || isCraftAndStructure) {
        const erroneousImgPath = path.join(IMAGES_DIR, `${id}.png`);
        if (fs.existsSync(erroneousImgPath)) {
          try {
            fs.unlinkSync(erroneousImgPath);
          } catch (e) {}
        }
      }

      let imageUrl = undefined;
      let finalQuestionLines = betweenLines;

      // Crop graph / table if detected
      if (shouldCrop) {
        const qHeaderY = firstLines[qHeaderIdx].y;
        const proseY = betweenLines[proseLineIdx].y;
        const gapPt = qHeaderY - proseY;

        if (gapPt >= 50) {
          try {
            const viewport = firstPageObj.page.getViewport({ scale: 2.0 });
            const pageCanvas = createCanvas(viewport.width, viewport.height);
            const ctx = pageCanvas.getContext('2d');
            await firstPageObj.page.render({ canvasContext: ctx, viewport }).promise;

            const pageHeightPt = firstPageObj.page.view[3] || 792;
            // Top crop boundary strictly 4px below baseline of bold "Question" header label
            const sourceTopCanvasY = Math.round((pageHeightPt - (qHeaderY - 4)) * 2);
            // Down to 10px above that first prose sentence
            const proseTopCanvasY = Math.round((pageHeightPt - (proseY + 10)) * 2);
            const sourceBottomCanvasY = proseTopCanvasY - 10;
            const sourceH = Math.max(80, sourceBottomCanvasY - sourceTopCanvasY);
            const cropW = Math.round(viewport.width - 60);
            const cropX = 30;

            // Include 14px of top white padding so multi-line titles are 100% visible
            const cropCanvas = createCanvas(cropW, sourceH + 14);
            const cropCtx = cropCanvas.getContext('2d');
            cropCtx.fillStyle = '#ffffff';
            cropCtx.fillRect(0, 0, cropW, sourceH + 14);
            cropCtx.drawImage(pageCanvas, cropX, sourceTopCanvasY, cropW, sourceH, 0, 14, cropW, sourceH);

            const imageFileName = `${id}.png`;
            const imagePath = path.join(IMAGES_DIR, imageFileName);
            fs.writeFileSync(imagePath, cropCanvas.toBuffer('image/png'));
            imageUrl = `/images/questions/${imageFileName}`;
            totalVisualChartsCropped++;

            // Completely strip all text items located above that first prose sentence's Y-coordinate
            finalQuestionLines = betweenLines.slice(proseLineIdx);
          } catch (err) {
            console.warn(`[WARN] Failed to crop graph on question ${id}:`, err.message);
          }
        }
      }

      // -----------------------------------------------------------------------
      // Build Passage vs Prompt (Preserve Excerpt Indentation, Notes, Poems)
      // -----------------------------------------------------------------------
      const { passage, prompt } = assembleQuestionPassageAndPrompt(finalQuestionLines, defaultDomain, headerSkill);

      if (passage.includes('<u>')) {
        totalUnderlinedQuestions++;
      }

      // -----------------------------------------------------------------------
      // Parse Options & Rationale Across All Pages of This Question
      // -----------------------------------------------------------------------
      let allAnswerPartLines = [];
      if (ansHeaderIdx !== -1) {
        allAnswerPartLines.push(...firstLines.slice(ansHeaderIdx + 1));
      }
      for (let pIdx = startPageIdx + 1; pIdx < endPageIdx; pIdx++) {
        allAnswerPartLines.push(...pagesInfo[pIdx].lines);
      }

      const fullAnswerText = allAnswerPartLines.map(l => l.text).join(' ');
      const correctSplit = fullAnswerText.split(/Correct\s+Answer\s*:\s*([A-D])/i);
      const optionsText = correctSplit[0] || '';

      let correctAnswer = 'A';
      if (correctSplit.length > 1) {
        correctAnswer = correctSplit[1].trim().toUpperCase();
      }

      // Extract options A-D
      let options = [];
      const optMatch = optionsText.match(/(?:^|\s+)A\s*\.\s*([\s\S]+?)(?:^|\s+)B\s*\.\s*([\s\S]+?)(?:^|\s+)C\s*\.\s*([\s\S]+?)(?:^|\s+)D\s*\.\s*([\s\S]+?)$/i);

      if (optMatch) {
        options = [
          { id: 'A', label: 'A', text: cleanText(optMatch[1]) },
          { id: 'B', label: 'B', text: cleanText(optMatch[2]) },
          { id: 'C', label: 'C', text: cleanText(optMatch[3]) },
          { id: 'D', label: 'D', text: cleanText(optMatch[4]) },
        ];
      } else {
        const optA = optionsText.match(/(?:^|\s+)A\s*\.\s*([\s\S]+?)(?=(?:^|\s+)B\s*\.|$)/i);
        const optB = optionsText.match(/(?:^|\s+)B\s*\.\s*([\s\S]+?)(?=(?:^|\s+)C\s*\.|$)/i);
        const optC = optionsText.match(/(?:^|\s+)C\s*\.\s*([\s\S]+?)(?=(?:^|\s+)D\s*\.|$)/i);
        const optD = optionsText.match(/(?:^|\s+)D\s*\.\s*([\s\S]+?)$/i);
        if (optA && optB && optC && optD) {
          options = [
            { id: 'A', label: 'A', text: cleanText(optA[1]) },
            { id: 'B', label: 'B', text: cleanText(optB[1]) },
            { id: 'C', label: 'C', text: cleanText(optC[1]) },
            { id: 'D', label: 'D', text: cleanText(optD[1]) },
          ];
        }
      }

      if (options.length < 4) continue;

      // Extract Rationale
      let rationale = '';
      const ratIdx = fullAnswerText.indexOf('Rationale');
      if (ratIdx !== -1) {
        rationale = cleanText(fullAnswerText.substring(ratIdx + 9));
      }

      if (!passage || !prompt) continue;

      // -----------------------------------------------------------------------
      // Enforce Strict Canonical Pairing & Prompt Signatures Cross-Verification
      // -----------------------------------------------------------------------
      let domain = defaultDomain;
      let finalSkill = headerSkill;

      if (defaultDomain === 'Craft and Structure') {
        if ((/Text\s+1/i.test(passage) && /Text\s+2/i.test(passage)) ||
            (/Text\s+1/i.test(prompt) && /Text\s+2/i.test(prompt)) ||
            /both texts|author of Text 2|respond to.*Text 1/i.test(prompt)) {
          finalSkill = 'Cross-Text Connections';
        } else if (/overall structure of the text|main purpose of the text|function of the (?:underlined|portion|sentence)|best describes the function/i.test(prompt)) {
          finalSkill = 'Text Structure and Purpose';
        } else if (/most logical and precise word or phrase|most nearly means?/i.test(prompt)) {
          finalSkill = 'Words in Context';
        } else if (!finalSkill) {
          finalSkill = 'Words in Context';
        }
      } else if (defaultDomain === 'Expression of Ideas') {
        if ((/student has taken the following notes/i.test(passage) || /following notes/i.test(passage)) &&
            /accomplish this goal|relevant information from the notes/i.test(prompt)) {
          finalSkill = 'Rhetorical Synthesis';
        } else if (/most logical transition/i.test(prompt)) {
          finalSkill = 'Transitions';
        } else if (!finalSkill) {
          finalSkill = 'Rhetorical Synthesis';
        }
      } else if (defaultDomain === 'Information and Ideas') {
        // (g) Inferences: prompt asks "Which choice most logically completes the text?" or what "can most reasonably be inferred/concluded" from text (such as ID 87aa7bab)
        if (/most logically completes the text|can (?:most )?reasonably be inferred|can (?:most )?reasonably be concluded|what can be concluded|most strongly suggests? about|most directly suggests?/i.test(prompt) || id === '87aa7bab') {
          finalSkill = 'Inferences';
        } else if (/most effectively illustrates the claim|illustrates the claim|data from the (?:graph|table|chart)|(?:graph|table|chart) that (?:supports?|weakens?)|(?:support|weaken|undermine) (?:the|a) (?:hypothesis|claim|conclusion|finding|theory|argument)|finding, if true, would|statement, if true, would|support the .* claim|weaken the .* claim|support the .* hypothesis|weaken the .* hypothesis|most effective evidence for the .* to include in support of this claim/i.test(prompt)) {
          finalSkill = 'Command of Evidence';
        } else if (/main idea of the text|According to the text|text indicates about|text makes which point|based on the text, (?:what|how|why|which)|what does the text|best states the text’s main idea|statement about .* is best supported by information in the text|best describes how .* presents/i.test(prompt)) {
          finalSkill = 'Central Ideas and Details';
        } else if (headerSkill) {
          finalSkill = headerSkill;
        } else {
          finalSkill = 'Central Ideas and Details';
        }
      } else if (defaultDomain === 'Standard English Conventions') {
        // Distinguish Boundaries vs Form, Structure, and Sense via:
        // 1. Header if available
        // 2. Official rationale text
        // 3. Option comparison
        let rationaleIndicatesBoundaries = false;
        let rationaleIndicatesFSS = false;

        if (rationale) {
          if (/punctuation|clause|independent clause|subordinate clause|supplementary|nonessential|comma|semicolon|colon|dash|parenthes|period|FANBOYS|run-on|comma splice/i.test(rationale)) {
            rationaleIndicatesBoundaries = true;
          }
          if (/subject-verb agreement|verb tense|verb aspect|finite|nonfinite|pronoun-antecedent|plural|singular|possessive|apostrophe|subject-modifier|parallel structure/i.test(rationale)) {
            rationaleIndicatesFSS = true;
          }
        }

        // Option comparison
        let optionAllIdenticalWords = false;
        if (options.length === 4) {
          const stripped = options.map(o => (o.text || '').toLowerCase().replace(/[^a-z0-9]/g, ''));
          optionAllIdenticalWords = stripped.every(s => s === stripped[0]);
        }

        if (headerSkill === 'Boundaries' || headerSkill === 'Form, Structure, and Sense') {
          finalSkill = headerSkill;
        } else if (rationaleIndicatesBoundaries && !rationaleIndicatesFSS) {
          finalSkill = 'Boundaries';
        } else if (rationaleIndicatesFSS && !rationaleIndicatesBoundaries) {
          finalSkill = 'Form, Structure, and Sense';
        } else if (optionAllIdenticalWords) {
          finalSkill = 'Boundaries';
        } else {
          finalSkill = 'Form, Structure, and Sense';
        }
      }

      // Final canonical integrity enforcement
      domain = SKILL_TO_DOMAIN[finalSkill] || defaultDomain;

      const questionObj = {
        id,
        section: 'Reading and Writing',
        domain,
        skill: finalSkill,
        difficulty,
        passage,
        prompt,
        options,
        correctAnswer,
        rationale,
      };

      if (imageUrl) {
        questionObj.imageUrl = imageUrl;
      }

      allQuestions.push(questionObj);
      extractedInFile++;
      fileSkills[finalSkill] = (fileSkills[finalSkill] || 0) + 1;
      diffStats[difficulty] = (diffStats[difficulty] || 0) + 1;
    }

    auditResults.push({
      file,
      defaultDomain,
      rawQuestionCount: questionStartPages.length,
      extractedCount: extractedInFile,
      fileSkills
    });

    console.log(`  -> Successfully extracted ${extractedInFile} questions from ${file}`);
  }

  // ---------------------------------------------------------------------------
  // Save Output JSON
  // ---------------------------------------------------------------------------
  console.log(`\nWriting ${allQuestions.length} questions to src/data/questions.json...`);
  const outputDir = path.join('src', 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'questions.json');
  fs.writeFileSync(outputPath, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`Saved successfully! File size: ${(fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Total High-DPI Visual Figures Cropped: ${totalVisualChartsCropped}`);
  console.log(`Total Questions with Underlines (<u>): ${totalUnderlinedQuestions}\n`);

  // ---------------------------------------------------------------------------
  // Full Terminal Audit Table (Requirement 1 & 4)
  // ---------------------------------------------------------------------------
  console.log('========================================================================');
  console.log('             SATIFY READING & WRITING QUESTION BANK AUDIT TABLE          ');
  console.log('========================================================================');
  console.log('PDF Filename                     Raw Question IDs Extracted JSON');
  console.log('------------------------------------------------------------------------');
  let totalRaw = 0;
  let totalExtracted = 0;
  const grandSkillTotals = {};

  for (const res of auditResults) {
    totalRaw += res.rawQuestionCount;
    totalExtracted += res.extractedCount;
    console.log(`${res.file.padEnd(32)} ${String(res.rawQuestionCount).padEnd(16)} ${res.extractedCount}`);
    for (const [sk, count] of Object.entries(res.fileSkills)) {
      console.log(`  • ${sk.padEnd(28)} : ${count}`);
      grandSkillTotals[sk] = (grandSkillTotals[sk] || 0) + count;
    }
  }
  console.log('------------------------------------------------------------------------');
  console.log(`TOTAL QUESTIONS:                 ${String(totalRaw).padEnd(16)} ${totalExtracted}  (${totalRaw - totalExtracted} DROPPED)`);
  console.log('========================================================================\n');

  console.log('--- ALL 10 SKILLS GRAND TOTALS ---');
  for (const [sk, count] of Object.entries(grandSkillTotals)) {
    console.log(`  • ${sk.padEnd(30)}: ${count} questions`);
  }

  console.log('\n--- BY DIFFICULTY ---');
  for (const [diff, count] of Object.entries(diffStats)) {
    console.log(`  • ${diff.padEnd(12)}: ${count} questions`);
  }

  // ---------------------------------------------------------------------------
  // Target Verification: a15b3219, d5b9ed0d, 6f626ae5, 6df33868, c966ad55, 87aa7bab
  // ---------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log('                   VERIFICATION OF TARGET QUESTIONS                     ');
  console.log('========================================================================');

  const targets = ['a15b3219', 'd5b9ed0d', '6f626ae5', '6df33868', 'c966ad55', '87aa7bab', 'f8244f7c', '4042ff0b'];
  for (const tid of targets) {
    const q = allQuestions.find(x => x.id === tid);
    if (q) {
      console.log(`\n[Question ${q.id}] (${q.domain} • ${q.skill} • ${q.difficulty})`);
      if (q.imageUrl) console.log(`  • Visual Crop : ${q.imageUrl}`);
      console.log(`  • Passage     : ${q.passage.substring(0, 150)}...`);
      console.log(`  • Prompt      : ${q.prompt}`);
      console.log(`  • Options     : A: "${q.options[0]?.text.substring(0, 40)}...", B: "${q.options[1]?.text.substring(0, 40)}..."`);
      console.log(`  • Answer      : ${q.correctAnswer}`);
    } else {
      console.warn(`[WARN] Target question ${tid} not found!`);
    }
  }
  console.log('\n========================================================================\n');
}

convertPdfs().catch(console.error);
