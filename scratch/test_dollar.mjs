import katex from 'katex';

try {
  const html = katex.renderToString("\\text{\\$}15", { throwOnError: true });
  console.log("KaTeX rendered \\text{\\$}15 successfully!");
} catch (e) {
  console.error("Error:", e.message);
}

try {
  const html2 = katex.renderToString("4\\%", { throwOnError: true });
  console.log("KaTeX rendered 4\\% successfully!");
} catch (e) {
  console.error("Error:", e.message);
}
