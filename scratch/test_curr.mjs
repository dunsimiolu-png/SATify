const s = 'Leo has \\$15. Each container costs \\$1.87.';
const out = s.replace(/(?<!\\)\$([^\$\n]+?)\$/g, 'MATH');
console.log('Processed:', out);
