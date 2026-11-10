import katex from 'katex';

const prompt = "Leo goes to a packing store to buy containers and tape. Leo has \\$15. Each container costs \\$1.87 and each roll of tape costs \\$2.40. Which inequality represents the relationship between the number of containers, $c$, and the number of rolls of tape, $t$, Leo can buy?";

const withoutDisplay = prompt.replace(/\$\$[\s\S]+?\$\$/g, '');
const inlineMatches = withoutDisplay.matchAll(/(?<!\\)\$([^\$\n]+?)\$/g);
let errorCount = 0;
for (const m of inlineMatches) {
  try {
    katex.renderToString(m[1].trim(), { displayMode: false, throwOnError: true });
    console.log(`[PASS]: "${m[1].trim()}"`);
  } catch (e) {
    console.error(`[FAIL]: "${m[1].trim()}" -> ${e.message}`);
    errorCount++;
  }
}
console.log(`Total errors: ${errorCount}`);
