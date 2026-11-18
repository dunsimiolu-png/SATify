const fs = require('fs');
const path = require('path');

const basePath = 'C:/Users/dunsi/OneDrive/Documents/SATify';
const mqPath = path.join(basePath, 'src/data/mathQuestions.json');
const backupPath = path.join(basePath, 'src/data/mathQuestions.pre_sr_clean_backup.json');

const mq = JSON.parse(fs.readFileSync(mqPath, 'utf8'));

console.log(`Loaded ${mq.length} math questions.`);

// Backup original file
fs.writeFileSync(backupPath, JSON.stringify(mq, null, 2));
console.log(`Saved backup to ${backupPath}`);

/**
 * Cleans College Board TTS screen-reader artifacts:
 * - Repeated "upper [A-Z]" -> joined letters (e.g. "upper W upper X upper Q" -> "WXQ")
 * - Single "upper [A-Z]" -> "[A-Z]"
 * - Single "lower [a-z]" -> "[a-z]"
 * - "script l" -> "$\ell$"
 */
function cleanScreenReaderText(input) {
  if (!input) return '';
  let s = input;

  // 1. Repeated "upper [A-Z]" sequences -> joined letters (e.g. upper W upper X upper Q -> WXQ)
  s = s.replace(/\bupper\s+([A-Za-z])(?:\s+upper\s+([A-Za-z]))+/gi, (match) => {
    return match.replace(/upper\s+/gi, '').replace(/\s+/g, '');
  });

  // 2. Single "upper [A-Z]" -> "[A-Z]"
  s = s.replace(/\bupper\s+([A-Za-z])\b/gi, '$1');

  // 3. Single "lower [a-z]" -> "[a-z]"
  s = s.replace(/\blower\s+([a-z])\b/gi, '$1');

  // 4. "script l" -> "$\ell$"
  s = s.replace(/\bscript\s+l\b/gi, '$\\ell$');

  // 5. Clean punctuation spacing
  s = s.replace(/\s+([.,;:?!])/g, '$1');

  return s.trim();
}

const dividerRegex = /(?:A\s+note\s+indicates\s+the\s+figures?\s+(?:is|are)\s+not\s+drawn\s+to\s+scale\.?|Note:\s*Figures?\s+not\s+drawn\s+to\s+scale\.?)/i;

// Custom minimalist white-stroke SVGs for geometry questions
const CUSTOM_SVGS = {
  // 1318dfea & 345cc36a: Intersecting triangles WXQ and YZQ
  '1318dfea': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 210" width="100%" height="auto" class="w-full max-w-[460px] select-none" style="overflow: visible;">
  <!-- Intersecting segments WZ and XY at Q forming triangles WXQ and YZQ -->
  <g stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" class="text-zinc-900 dark:text-zinc-100">
    <line x1="76" y1="28" x2="400" y2="120" />
    <line x1="22" y1="140" x2="345" y2="24" />
    <line x1="76" y1="28" x2="22" y2="140" />
    <line x1="345" y1="24" x2="400" y2="120" />
    <path d="M 64,48 A 24,24 0 0,0 89,32" stroke-width="1.5" />
    <path d="M 333,33 A 24,24 0 0,0 352,40" stroke-width="1.5" />
  </g>
  <g font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="15" fill="currentColor" class="text-zinc-900 dark:text-zinc-100 select-none">
    <text x="68" y="16" text-anchor="middle">W</text>
    <text x="8" y="152" text-anchor="middle">X</text>
    <text x="216" y="60" text-anchor="middle">Q</text>
    <text x="352" y="14" text-anchor="middle">Y</text>
    <text x="416" y="128" text-anchor="middle">Z</text>
    <text x="82" y="58" font-size="13" font-style="italic" font-weight="500">a°</text>
    <text x="338" y="54" font-size="13" font-style="italic" font-weight="500">a°</text>
  </g>
  <text x="230" y="196" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="currentColor" class="text-zinc-500 dark:text-zinc-400 select-none" letter-spacing="0.02em">
    Note: Figure not drawn to scale.
  </text>
</svg>`,

  '345cc36a': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 210" width="100%" height="auto" class="w-full max-w-[460px] select-none" style="overflow: visible;">
  <!-- Intersecting segments WZ and XY at Q forming triangles WXQ and YZQ -->
  <g stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" class="text-zinc-900 dark:text-zinc-100">
    <line x1="76" y1="28" x2="400" y2="120" />
    <line x1="22" y1="140" x2="345" y2="24" />
    <line x1="76" y1="28" x2="22" y2="140" />
    <line x1="345" y1="24" x2="400" y2="120" />
    <path d="M 64,48 A 24,24 0 0,0 89,32" stroke-width="1.5" />
    <path d="M 333,33 A 24,24 0 0,0 352,40" stroke-width="1.5" />
  </g>
  <g font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="15" fill="currentColor" class="text-zinc-900 dark:text-zinc-100 select-none">
    <text x="68" y="16" text-anchor="middle">W</text>
    <text x="8" y="152" text-anchor="middle">X</text>
    <text x="216" y="60" text-anchor="middle">Q</text>
    <text x="352" y="14" text-anchor="middle">Y</text>
    <text x="416" y="128" text-anchor="middle">Z</text>
    <text x="82" y="58" font-size="13" font-style="italic" font-weight="500">a°</text>
    <text x="338" y="54" font-size="13" font-style="italic" font-weight="500">a°</text>
  </g>
  <text x="230" y="196" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="currentColor" class="text-zinc-500 dark:text-zinc-400 select-none" letter-spacing="0.02em">
    Note: Figure not drawn to scale.
  </text>
</svg>`,

  // 3e4e2ab0: Triangles ABC and CDE sharing vertex C, AB || DE
  '3e4e2ab0': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 210" width="100%" height="auto" class="w-full max-w-[460px] select-none" style="overflow: visible;">
  <!-- Triangles ABC and CDE sharing vertex C with AB || DE -->
  <g stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" class="text-zinc-900 dark:text-zinc-100">
    <line x1="60" y1="30" x2="60" y2="160" />
    <line x1="400" y1="40" x2="400" y2="150" />
    <line x1="60" y1="30" x2="400" y2="150" />
    <line x1="60" y1="160" x2="400" y2="40" />
    <path d="M 78,40 A 20,20 0 0,1 68,54" stroke-width="1.5" />
    <path d="M 246,95 A 18,18 0 0,0 238,107" stroke-width="1.5" />
    <path d="M 382,50 A 20,20 0 0,1 392,60" stroke-width="1.5" />
  </g>
  <g font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="15" fill="currentColor" class="text-zinc-900 dark:text-zinc-100 select-none">
    <text x="44" y="28" text-anchor="middle">A</text>
    <text x="44" y="172" text-anchor="middle">B</text>
    <text x="230" y="80" text-anchor="middle">C</text>
    <text x="416" y="38" text-anchor="middle">D</text>
    <text x="416" y="162" text-anchor="middle">E</text>
    <text x="82" y="55" font-size="13" font-style="italic" font-weight="500">y°</text>
    <text x="254" y="115" font-size="13" font-style="italic" font-weight="500">x°</text>
    <text x="375" y="66" font-size="13" font-style="italic" font-weight="500">z°</text>
  </g>
  <text x="230" y="196" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="currentColor" class="text-zinc-500 dark:text-zinc-400 select-none" letter-spacing="0.02em">
    Note: Figure not drawn to scale.
  </text>
</svg>`,

  // adae6543 & b5d62bba: Triangles LMR and PQR sharing vertex R with LM || PQ
  'adae6543': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 210" width="100%" height="auto" class="w-full max-w-[460px] select-none" style="overflow: visible;">
  <!-- Triangles LMR and PQR sharing vertex R with LM || PQ -->
  <g stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" class="text-zinc-900 dark:text-zinc-100">
    <line x1="70" y1="35" x2="70" y2="155" />
    <line x1="390" y1="20" x2="390" y2="170" />
    <line x1="70" y1="35" x2="390" y2="170" />
    <line x1="70" y1="155" x2="390" y2="20" />
  </g>
  <g font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="15" fill="currentColor" class="text-zinc-900 dark:text-zinc-100 select-none">
    <text x="52" y="32" text-anchor="middle">L</text>
    <text x="52" y="168" text-anchor="middle">M</text>
    <text x="200" y="85" text-anchor="middle">R</text>
    <text x="408" y="18" text-anchor="middle">P</text>
    <text x="408" y="182" text-anchor="middle">Q</text>
  </g>
  <text x="230" y="196" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="currentColor" class="text-zinc-500 dark:text-zinc-400 select-none" letter-spacing="0.02em">
    Note: Figure not drawn to scale.
  </text>
</svg>`,

  'b5d62bba': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 210" width="100%" height="auto" class="w-full max-w-[460px] select-none" style="overflow: visible;">
  <!-- Triangles LMR and PQR sharing vertex R with LM || PQ -->
  <g stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" class="text-zinc-900 dark:text-zinc-100">
    <line x1="70" y1="35" x2="70" y2="155" />
    <line x1="390" y1="20" x2="390" y2="170" />
    <line x1="70" y1="35" x2="390" y2="170" />
    <line x1="70" y1="155" x2="390" y2="20" />
  </g>
  <g font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="15" fill="currentColor" class="text-zinc-900 dark:text-zinc-100 select-none">
    <text x="52" y="32" text-anchor="middle">L</text>
    <text x="52" y="168" text-anchor="middle">M</text>
    <text x="200" y="85" text-anchor="middle">R</text>
    <text x="408" y="18" text-anchor="middle">P</text>
    <text x="408" y="182" text-anchor="middle">Q</text>
  </g>
  <text x="230" y="196" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="currentColor" class="text-zinc-500 dark:text-zinc-400 select-none" letter-spacing="0.02em">
    Note: Figure not drawn to scale.
  </text>
</svg>`,

  // 014edcb7: Triangle PQR with side QR extended to point S
  '014edcb7': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 210" width="100%" height="auto" class="w-full max-w-[460px] select-none" style="overflow: visible;">
  <!-- Triangle PQR with side QR extended to S -->
  <g stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" class="text-zinc-900 dark:text-zinc-100">
    <line x1="80" y1="140" x2="400" y2="140" />
    <line x1="160" y1="40" x2="80" y2="140" />
    <line x1="160" y1="40" x2="280" y2="140" />
    <path d="M 102,140 A 24,24 0 0,0 95,122" stroke-width="1.5" />
    <path d="M 298,140 A 24,24 0 0,0 270,126" stroke-width="1.5" />
  </g>
  <g font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="15" fill="currentColor" class="text-zinc-900 dark:text-zinc-100 select-none">
    <text x="160" y="28" text-anchor="middle">P</text>
    <text x="75" y="162" text-anchor="middle">Q</text>
    <text x="280" y="162" text-anchor="middle">R</text>
    <text x="405" y="162" text-anchor="middle">S</text>
    <text x="116" y="132" font-size="12" font-weight="500">132°</text>
    <text x="312" y="132" font-size="12" font-weight="500">163°</text>
  </g>
  <text x="230" y="196" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="currentColor" class="text-zinc-500 dark:text-zinc-400 select-none" letter-spacing="0.02em">
    Note: Figure not drawn to scale.
  </text>
</svg>`,

  // 053e5e9f: Right triangle QRS with right angle at R
  '053e5e9f': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 210" width="100%" height="auto" class="w-full max-w-[460px] select-none" style="overflow: visible;">
  <!-- Right triangle QRS with right angle at R -->
  <g stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" class="text-zinc-900 dark:text-zinc-100">
    <polygon points="100,40 100,160 360,160" />
    <polyline points="100,145 115,145 115,160" stroke-width="1.5" />
  </g>
  <g font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="15" fill="currentColor" class="text-zinc-900 dark:text-zinc-100 select-none">
    <text x="100" y="26" text-anchor="middle">Q</text>
    <text x="82" y="172" text-anchor="middle">R</text>
    <text x="375" y="166" text-anchor="middle">S</text>
    <text x="230" y="180" font-size="14" font-weight="500" text-anchor="middle">25</text>
  </g>
  <text x="230" y="200" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="currentColor" class="text-zinc-500 dark:text-zinc-400 select-none" letter-spacing="0.02em">
    Note: Figure not drawn to scale.
  </text>
</svg>`,

  // 2757549e: Right triangle ADE with parallel segment BC
  '2757549e': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 210" width="100%" height="auto" class="w-full max-w-[460px] select-none" style="overflow: visible;">
  <!-- Right triangle ADE with parallel segment BC -->
  <g stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" class="text-zinc-900 dark:text-zinc-100">
    <line x1="60" y1="150" x2="400" y2="150" />
    <line x1="400" y1="150" x2="400" y2="30" />
    <line x1="60" y1="150" x2="400" y2="30" />
    <line x1="260" y1="150" x2="260" y2="80" />
    <polyline points="385,150 385,135 400,135" stroke-width="1.5" />
    <path d="M 260,98 A 18,18 0 0,0 248,84" stroke-width="1.5" />
  </g>
  <g font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="15" fill="currentColor" class="text-zinc-900 dark:text-zinc-100 select-none">
    <text x="45" y="156" text-anchor="middle">A</text>
    <text x="260" y="172" text-anchor="middle">B</text>
    <text x="254" y="68" text-anchor="middle">C</text>
    <text x="415" y="156" text-anchor="middle">D</text>
    <text x="415" y="24" text-anchor="middle">E</text>
    <text x="242" y="104" font-size="13" font-style="italic" font-weight="500">x°</text>
  </g>
  <text x="230" y="196" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="currentColor" class="text-zinc-500 dark:text-zinc-400 select-none" letter-spacing="0.02em">
    Note: Figure not drawn to scale.
  </text>
</svg>`,

  // ffc39dc5: Quadrilateral with diagonal DF
  'ffc39dc5': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 210" width="100%" height="auto" class="w-full max-w-[460px] select-none" style="overflow: visible;">
  <!-- Parallelogram CDEF with diagonal DF -->
  <g stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" class="text-zinc-900 dark:text-zinc-100">
    <polygon points="120,40 380,40 320,150 60,150" />
    <line x1="60" y1="150" x2="380" y2="40" />
    <path d="M 82,143 A 24,24 0 0,0 80,126" stroke-width="1.5" />
    <path d="M 358,47 A 24,24 0 0,0 360,64" stroke-width="1.5" />
  </g>
  <g font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="15" fill="currentColor" class="text-zinc-900 dark:text-zinc-100 select-none">
    <text x="110" y="28" text-anchor="middle">C</text>
    <text x="390" y="28" text-anchor="middle">F</text>
    <text x="45" y="162" text-anchor="middle">D</text>
    <text x="330" y="168" text-anchor="middle">E</text>
    <text x="96" y="132" font-size="13" font-style="italic" font-weight="500">x°</text>
    <text x="345" y="68" font-size="13" font-style="italic" font-weight="500">y°</text>
  </g>
  <text x="230" y="196" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="currentColor" class="text-zinc-500 dark:text-zinc-400 select-none" letter-spacing="0.02em">
    Note: Figure not drawn to scale.
  </text>
</svg>`
};

let cleanedTtsCount = 0;
let strippedDescCount = 0;
let customSvgAttachedCount = 0;

mq.forEach((q) => {
  let prompt = q.prompt || q.stem || '';
  const initialPrompt = prompt;

  // 1. Attach custom minimalist SVG if defined for this question
  if (CUSTOM_SVGS[q.id]) {
    q.figureSvg = CUSTOM_SVGS[q.id];
    customSvgAttachedCount++;
  }

  const hasVisual = Boolean(q.imageUrl || q.figureSvg || q.svg);

  // 2. Check for College Board divider note ("A note indicates the figure is not drawn to scale...")
  const match = prompt.match(dividerRegex);
  if (match && typeof match.index === 'number') {
    const rawQuestion = prompt.slice(match.index + match[0].length).trim();
    if (hasVisual && rawQuestion.length > 0) {
      // With visual diagram present: remove redundant screen-reader description!
      prompt = rawQuestion;
      strippedDescCount++;
    }
  } else if (/^\s*(?:upper\s+[A-Za-z]\s*)+(?:\n+|$)/i.test(prompt)) {
    // Leading stray screen-reader labels (like 800e71b8)
    const labelMatch = prompt.match(/^(\s*(?:upper\s+[A-Za-z]\s*)+(?:\n+|$))([\s\S]*)$/i);
    if (labelMatch) {
      prompt = labelMatch[2].trim();
      strippedDescCount++;
    }
  }

  // 3. Clean any remaining "upper X" / "lower x" / "script l" notation across the prompt
  const cleaned = cleanScreenReaderText(prompt);
  if (cleaned !== initialPrompt) {
    cleanedTtsCount++;
    q.prompt = cleaned;
    if (q.stem) q.stem = cleaned;
  }
});

fs.writeFileSync(mqPath, JSON.stringify(mq, null, 2));
console.log(`\nSuccessfully upgraded ${mqPath}:`);
console.log(`- Questions cleaned of TTS syntax: ${cleanedTtsCount}`);
console.log(`- Questions where redundant screen-reader descriptions were stripped: ${strippedDescCount}`);
console.log(`- Custom minimalist SVGs attached: ${customSvgAttachedCount}`);
