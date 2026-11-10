import katex from 'katex';

for (const s of ["\\overline{AB}", "\\overline{DE}", "\\overline{CD}"]) {
  try {
    const html = katex.renderToString(s, { throwOnError: true });
    console.log(`[PASS]: "${s}"`);
  } catch (e) {
    console.error(`[FAIL]: "${s}" -> ${e.message}`);
  }
}
