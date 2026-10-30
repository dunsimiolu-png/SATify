import * as fs from 'fs';
const data = JSON.parse(fs.readFileSync('scripts/adv_detected_graphs.json', 'utf8'));
const qs = JSON.parse(fs.readFileSync('src/data/mathQuestions.json', 'utf8'));

for (const g of data.genuineGraphs) {
  const q = qs.find(x => x.id === g.id);
  console.log(`[${g.id}] Page ${g.page}:`);
  console.log(`   Prompt: ${q?.prompt?.slice(0, 100)}`);
}
