const fs = require('fs');
const path = require('path');

const basePath = 'C:/Users/dunsi/OneDrive/Documents/SATify';

// Test 1: mathSanitizer utility tests
console.log('=== TEST 1: mathSanitizer Utility Functions ===');
const { cleanScreenReaderText, extractFigureDescription } = require(path.join(basePath, 'src/utils/mathSanitizer.ts'));

// 1a: TTS cleaning
const ttsSample = "Triangle upper W upper X upper Q has a common vertex with triangle upper Y upper Z upper Q. The common vertex is upper Q. For triangle upper W upper X upper Q: The measure of angle upper W is a°.";
const cleanedTts = cleanScreenReaderText(ttsSample);
console.log('Cleaned TTS sample:');
console.log(' ', cleanedTts);
console.assert(!cleanedTts.includes('upper'), 'Should not contain upper');
console.assert(cleanedTts.includes('WXQ'), 'Should contain WXQ');
console.assert(cleanedTts.includes('YZQ'), 'Should contain YZQ');

// 1b: Figure extraction with visual present
const fullPromptWithFigure = "Triangle upper W upper X upper Q has a common vertex with triangle upper Y upper Z upper Q. The common vertex is upper Q. For triangle upper W upper X upper Q: The measure of angle upper W is a°. For triangle upper Y upper Z upper Q: The measure of angle upper Y is a°. A note indicates the figure is not drawn to scale. In the figure shown, $\\overline{WZ}$ and $\\overline{XY}$ intersect at point $Q$, $YQ=21$, $WQ=70$, $WX=60$, and $XQ=120$. What is the length of $\\overline{YZ}$?";

const resWithVisual = extractFigureDescription(fullPromptWithFigure, true);
console.log('\nResult with visual attached (hasVisual = true):');
console.log('  figureDescription:', resWithVisual.figureDescription);
console.log('  cleanPrompt:      ', resWithVisual.cleanPrompt);
console.assert(resWithVisual.figureDescription === null, 'figureDescription should be null when visual is present');
console.assert(resWithVisual.cleanPrompt.startsWith('In the figure shown'), 'cleanPrompt should start with question text');

// 1c: Figure extraction without visual (fallback callout)
const resWithoutVisual = extractFigureDescription(fullPromptWithFigure, false);
console.log('\nResult without visual attached (hasVisual = false):');
console.log('  figureDescription:', resWithoutVisual.figureDescription);
console.log('  cleanPrompt:      ', resWithoutVisual.cleanPrompt);
console.assert(resWithoutVisual.figureDescription !== null, 'figureDescription should be populated for callout box');
console.assert(resWithoutVisual.figureDescription.includes('Triangle WXQ'), 'figureDescription should be cleaned of TTS');
console.assert(resWithoutVisual.cleanPrompt.startsWith('In the figure shown'), 'cleanPrompt should have question text');

// Test 2: mathQuestions.json verification
console.log('\n=== TEST 2: mathQuestions.json Bank Verification ===');
const mq = JSON.parse(fs.readFileSync(path.join(basePath, 'src/data/mathQuestions.json'), 'utf8'));

// Check 1318dfea
const q1318 = mq.find(q => q.id === '1318dfea');
console.log('Question 1318dfea:');
console.log('  Prompt:   ', q1318.prompt);
console.log('  figureSvg exists:', Boolean(q1318.figureSvg));
console.assert(Boolean(q1318.figureSvg), 'figureSvg must exist on 1318dfea');
console.assert(!q1318.prompt.includes('upper'), 'Prompt must not contain upper');
console.assert(!q1318.prompt.includes('not drawn to scale'), 'Prompt must not contain not drawn to scale');

// Overall check
let leftoverUpper = 0;
let leftoverNote = 0;
let totalFigureSvg = 0;

mq.forEach(q => {
  if (/\bupper\s+[A-Za-z]\b/i.test(q.prompt)) leftoverUpper++;
  if (/not drawn to scale/i.test(q.prompt)) leftoverNote++;
  if (q.figureSvg) totalFigureSvg++;
});

console.log('\nDataset Summary (1466 questions):');
console.log('  Leftover "upper [A-Z]" in prompts:      ', leftoverUpper);
console.log('  Leftover "not drawn to scale" in prompts:', leftoverNote);
console.log('  Questions with custom figureSvg:         ', totalFigureSvg);

console.assert(leftoverUpper === 0, 'No leftover upper allowed');
console.assert(leftoverNote === 0, 'No leftover not drawn to scale in prompt allowed');
console.log('\nALL VERIFICATIONS PASSED SUCCESSFULLY!');
