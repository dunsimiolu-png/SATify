import * as fs from 'fs';

const rawOcr = JSON.parse(fs.readFileSync('scripts/adv_vector_extracted_raw.json', 'utf8'));
const emptyList = JSON.parse(fs.readFileSync('scripts/adv_empty_options.json', 'utf8'));

console.log(`Inspecting ${Object.keys(rawOcr).length} OCR results...`);

let successful4Options = 0;
let needsReview = 0;

for (const [id, item] of Object.entries(rawOcr)) {
  const lines = item.ocrText.split('\n').map(l => l.trim()).filter(Boolean);
  const ansIdx = lines.findIndex(l => /^Answer\b/i.test(l));
  const corrIdx = lines.findIndex(l => /Correct\s+Answer/i.test(l));

  if (ansIdx === -1) {
    needsReview++;
    console.log(`[${id}] No Answer line found. Lines:`, lines.slice(0, 5));
    continue;
  }

  const optEnd = corrIdx !== -1 ? corrIdx : lines.length;
  const optLines = lines.slice(ansIdx + 1, optEnd);
  const cleanOpts = [];
  for (const l of optLines) {
    const cleaned = l.replace(/^[A-D0][\.\s\-\:\)]+/i, '').trim();
    if (cleaned) cleanOpts.push(cleaned);
  }

  if (cleanOpts.length === 4) {
    successful4Options++;
  } else {
    needsReview++;
    console.log(`[${id}] Opt count = ${cleanOpts.length} (Page ${item.page}):`, cleanOpts);
  }
}

console.log(`\nParse summary: ${successful4Options} with exactly 4 options, ${needsReview} needing review.`);
