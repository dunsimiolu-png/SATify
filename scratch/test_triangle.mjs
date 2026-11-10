import katex from 'katex';

for (const s of ["\\triangle ABC", "\\triangle QPR", "\\triangle STR", "\\triangle XYZ"]) {
  try {
    katex.renderToString(s, { throwOnError: true });
    console.log(`[PASS]: "${s}"`);
  } catch (e) {
    console.error(`[FAIL]: "${s}" -> ${e.message}`);
  }
}
