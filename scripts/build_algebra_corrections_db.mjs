import * as fs from 'fs';
import katex from 'katex';

const rawOcr = JSON.parse(fs.readFileSync('scripts/vector_extracted_raw.json', 'utf8'));
const classData = JSON.parse(fs.readFileSync('scripts/empty_options_classified.json', 'utf8'));
const mathQuestions = JSON.parse(fs.readFileSync('src/data/mathQuestions.json', 'utf8'));

// Format math string with LaTeX delimiters
function formatMathOption(str) {
  if (!str) return '';
  let s = str.trim()
    .replace(/[\u2013\u2014\u2212]/g, '-')
    .replace(/\b([0-9]+)\s*¢\b/g, '$1x')
    .replace(/\b([0-9]+)z\b/g, '$1x')
    .replace(/\b([0-9]+)¥\b/g, '$1y')
    .replace(/\b([0-9]+)\s*#\b/g, '$1x')
    .replace(/\s+/g, ' ');

  // If already has $, return
  if (s.includes('$')) return s;

  // Fraction patterns like '4/5' or '-4/5'
  const fracMatch = s.match(/^(-?\d+)\s*\/\s*(\d+)$/);
  if (fracMatch) {
    return `$-\\frac{${fracMatch[1].replace('-', '')}}{${fracMatch[2]}}$`.replace('--', '-');
  }

  // Linear equation or inequality
  if (s.includes('=') || s.includes('<') || s.includes('>') || s.includes('+') || s.includes('-') || /^-?\d+/.test(s) || /^\(/.test(s)) {
    return `$${s}$`;
  }

  return `$${s}$`;
}

// Special hand-crafted curated fixes for complex multi-line questions
const MANUAL_OVERRIDES = {
  '6e6a3241': {
    prompt: '$$\\begin{aligned} x + 5y &= 5 \\\\ 2x - y &= -4 \\end{aligned}$$\n\nWhich of the following graphs in the $xy$-plane could be used to solve the system of equations above?',
    options: [
      { id: 'A', label: 'A', text: '', imageUrl: '/question-images/math/6e6a3241_opt_A.png' },
      { id: 'B', label: 'B', text: '', imageUrl: '/question-images/math/6e6a3241_opt_B.png' },
      { id: 'C', label: 'C', text: '', imageUrl: '/question-images/math/6e6a3241_opt_C.png' },
      { id: 'D', label: 'D', text: '', imageUrl: '/question-images/math/6e6a3241_opt_D.png' },
    ],
    correctAnswer: 'C',
  },
  '0b46bad5': {
    prompt: '$$ax + by = b$$\n\nIn the equation above, $a$ and $b$ are constants and $0 < a < b$. Which of the following could represent the graph of the equation in the $xy$-plane?',
    options: [
      { id: 'A', label: 'A', text: '', imageUrl: '/question-images/math/0b46bad5_opt_A.png' },
      { id: 'B', label: 'B', text: '', imageUrl: '/question-images/math/0b46bad5_opt_B.png' },
      { id: 'C', label: 'C', text: '', imageUrl: '/question-images/math/0b46bad5_opt_C.png' },
      { id: 'D', label: 'D', text: '', imageUrl: '/question-images/math/0b46bad5_opt_D.png' },
    ],
    correctAnswer: 'C',
  },
  'a8e6bd75': {
    prompt: 'Which of the following is the graph of the equation $y = 2x - 5$ in the $xy$-plane?',
    options: [
      { id: 'A', label: 'A', text: '', imageUrl: '/question-images/math/a8e6bd75_opt_A.png' },
      { id: 'B', label: 'B', text: '', imageUrl: '/question-images/math/a8e6bd75_opt_B.png' },
      { id: 'C', label: 'C', text: '', imageUrl: '/question-images/math/a8e6bd75_opt_C.png' },
      { id: 'D', label: 'D', text: '', imageUrl: '/question-images/math/a8e6bd75_opt_D.png' },
    ],
    correctAnswer: 'D',
  },
  '4acd05cd': {
    prompt: 'The graph shows the linear relationship between $x$ and $y$. Which table gives three values of $x$ and their corresponding values of $y$ for this relationship?',
    options: [
      { id: 'A', label: 'A', text: '$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 0 \\\\ \\hline 1 & -7 \\\\ \\hline 2 & -9 \\\\ \\hline \\end{array}$$' },
      { id: 'B', label: 'B', text: '$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 0 \\\\ \\hline 1 & -3 \\\\ \\hline 2 & -1 \\\\ \\hline \\end{array}$$' },
      { id: 'C', label: 'C', text: '$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & -5 \\\\ \\hline 1 & -7 \\\\ \\hline 2 & -9 \\\\ \\hline \\end{array}$$' },
      { id: 'D', label: 'D', text: '$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & -5 \\\\ \\hline 1 & -3 \\\\ \\hline 2 & -1 \\\\ \\hline \\end{array}$$' },
    ],
    correctAnswer: 'D',
  },
  '9b7a1b67': {
    prompt: 'The graph of line $h$ is shown in the $xy$-plane. Line $k$ (not shown) is defined by $sx + 48y = t$, where $s$ and $t$ are constants. If line $k$ is graphed in this $xy$-plane, the result is a graph of two linear equations. This system of two linear equations has no solution. Which of the following is NOT a possible value of $t$?',
    options: [
      { id: 'A', label: 'A', text: '$-432$' },
      { id: 'B', label: 'B', text: '$-9$' },
      { id: 'C', label: 'C', text: '$72$' },
      { id: 'D', label: 'D', text: '$288$' },
    ],
    correctAnswer: 'A',
  },
  '608eeb6e': {
    prompt: '$$\\begin{aligned} 5x &= 15 \\\\ -4x + y &= -2 \\end{aligned}$$\n\nThe solution to the given system of equations is $(x, y)$. What is the value of $x + y$?',
    options: [
      { id: 'A', label: 'A', text: '$-17$' },
      { id: 'B', label: 'B', text: '$-13$' },
      { id: 'C', label: 'C', text: '$13$' },
      { id: 'D', label: 'D', text: '$17$' },
    ],
    correctAnswer: 'C',
  },
  'b0fc3166': {
    prompt: 'The graph of a system of linear equations is shown. What is the solution $(x, y)$ to the system?',
    options: [
      { id: 'A', label: 'A', text: '$(0, 3)$' },
      { id: 'B', label: 'B', text: '$(1, 3)$' },
      { id: 'C', label: 'C', text: '$(2, 3)$' },
      { id: 'D', label: 'D', text: '$(3, 3)$' },
    ],
    correctAnswer: 'C',
  },
  '9b886541': {
    prompt: 'If $3x - 8 = 7$, what is the value of $3x + 8$?',
    options: [
      { id: 'A', label: 'A', text: '$-1$' },
      { id: 'B', label: 'B', text: '$5$' },
      { id: 'C', label: 'C', text: '$13$' },
      { id: 'D', label: 'D', text: '$23$' },
    ],
    correctAnswer: 'D',
  },
  'd914abec': {
    prompt: 'To complete a landscaping project, Adam charges a fee of $\\$20.00$ for his equipment and $\\$9.50$ per hour spent working on the project. To complete this same landscaping project, Caroline charges a fee of $\\$17.00$ for her equipment and $\\$10.00$ per hour spent working on the project. If $x$ represents the number of hours spent working on the landscaping project, what are all the values of $x$ for which Caroline\'s total charge is greater than Adam\'s total charge?',
    options: [
      { id: 'A', label: 'A', text: '$5 < x < 6$' },
      { id: 'B', label: 'B', text: '$6 < x < 7$' },
      { id: 'C', label: 'C', text: '$x < 5$' },
      { id: 'D', label: 'D', text: '$x > 6$' },
    ],
    correctAnswer: 'D',
  },
  '00b9bd37': {
    prompt: 'The graph models the relationship between the number of T-shirts, $x$, and the number of sweatshirts, $y$, that Kira can purchase for a school fundraiser. Which equation could represent this relationship?',
    options: [
      { id: 'A', label: 'A', text: '$y = 7x + 18$' },
      { id: 'B', label: 'B', text: '$7x + 18y = 630$' },
      { id: 'C', label: 'C', text: '$y = 18x + 7$' },
      { id: 'D', label: 'D', text: '$18x + 7y = 630$' },
    ],
    correctAnswer: 'B',
  },
  '340afb12': {
    prompt: 'Ellen bought two types of snack bags for a school event. Each bag of pretzels cost $\\$11$, and each bag of cookies cost $\\$24$. She bought a total of $33$ bags for $\\$497$. If $x$ represents the number of bags of pretzels and $y$ represents the number of bags of cookies, which system of equations represents this situation?',
    options: [
      { id: 'A', label: 'A', text: '$$\\begin{aligned} 11x + 16y &= 968 \\\\ 24x + 9y &= 497 \\end{aligned}$$' },
      { id: 'B', label: 'B', text: '$$\\begin{aligned} 11x + 9y &= 968 \\\\ 24x + 16y &= 497 \\end{aligned}$$' },
      { id: 'C', label: 'C', text: '$$\\begin{aligned} 11x + 9y &= 497 \\\\ 24x + 16y &= 968 \\end{aligned}$$' },
      { id: 'D', label: 'D', text: '$$\\begin{aligned} 9x + 11y &= 497 \\\\ 16x + 24y &= 968 \\end{aligned}$$' },
    ],
    correctAnswer: 'C',
  },
  '1e0a46e4': {
    prompt: '$$\\begin{aligned} 2x - 3y &= 9 \\\\ 3x + 4y &= 10 \\end{aligned}$$\n\nWhich of the following systems of equations has the same solution as the system of equations above?',
    options: [
      { id: 'A', label: 'A', text: '$$\\begin{aligned} -2x + 3y &= -9 \\\\ 2x - 3y &= 9 \\end{aligned}$$' },
      { id: 'B', label: 'B', text: '$$\\begin{aligned} 2x - 3y &= 9 \\\\ 3x + 4y &= 10 \\end{aligned}$$' },
      { id: 'C', label: 'C', text: '$$\\begin{aligned} 2x - 3y &= 9 \\\\ -6x + 9y &= -27 \\end{aligned}$$' },
      { id: 'D', label: 'D', text: '$$\\begin{aligned} -2x + 3y &= 9 \\\\ 4x - 6y &= 18 \\end{aligned}$$' },
    ],
    correctAnswer: 'B',
  },
  'e77a76ce': {
    prompt: 'Which of the following systems of linear equations has no solution?',
    options: [
      { id: 'A', label: 'A', text: '$$\\begin{aligned} y &= 6x + 3 \\\\ y &= 6x + 9 \\end{aligned}$$' },
      { id: 'B', label: 'B', text: '$$\\begin{aligned} y &= 10 \\\\ y &= 10x + 10 \\end{aligned}$$' },
      { id: 'C', label: 'C', text: '$$\\begin{aligned} y &= 14x + 14 \\\\ y &= 10x + 14 \\end{aligned}$$' },
      { id: 'D', label: 'D', text: '$$\\begin{aligned} x &= 3 \\\\ y &= 10 \\end{aligned}$$' },
    ],
    correctAnswer: 'A',
  },
  '6e50ce28': {
    prompt: 'The sum of a number $x$ and $7$ is twice as large as a number $y$. The number $y$ is $3$ less than $x$. Which system of equations represents this situation?',
    options: [
      { id: 'A', label: 'A', text: '$$\\begin{aligned} x + 7 &= 2y \\\\ y &= x - 3 \\end{aligned}$$' },
      { id: 'B', label: 'B', text: '$$\\begin{aligned} x + 7 &= 2y \\\\ y &= 3 - x \\end{aligned}$$' },
      { id: 'C', label: 'C', text: '$$\\begin{aligned} 2(x + 7) &= y \\\\ y &= x - 3 \\end{aligned}$$' },
      { id: 'D', label: 'D', text: '$$\\begin{aligned} 2(x + 7) &= y \\\\ y &= 3 - x \\end{aligned}$$' },
    ],
    correctAnswer: 'A',
  },
  '6daf8d70': {
    prompt: 'A city employee is organizing a 5k charity walk. The goal is to raise more than $\\$164$. The ticket price is $\\$3$ for adults and $\\$1$ for students. The employee also wants the number of adult participants $a$ to be more than three times the number of student participants $b$. Which system of inequalities represents this situation?',
    options: [
      { id: 'A', label: 'A', text: '$a + b > 164$ and $3a > b$' },
      { id: 'B', label: 'B', text: '$a + b > 164$ and $a < 3b$' },
      { id: 'C', label: 'C', text: '$a + b < 164$ and $3a > b$' },
      { id: 'D', label: 'D', text: '$a + b < 164$ and $a < 3b$' },
    ],
    correctAnswer: 'A',
  },
  'e142f83c': {
    prompt: '$$\\begin{aligned} y - 6 &= \\frac{1}{2}(x + 5) \\\\ y - v &= \\frac{1}{2}(x + 10) \\end{aligned}$$\n\nIn the given system of equations, $v$ is a constant. The system has infinitely many solutions. What is the value of $v$?',
    options: [
      { id: 'A', label: 'A', text: '$0$' },
      { id: 'B', label: 'B', text: '$\\frac{7}{2}$' },
      { id: 'C', label: 'C', text: '$4$' },
      { id: 'D', label: 'D', text: '$12$' },
    ],
    correctAnswer: 'B',
  },
  'f14484a5': {
    prompt: 'A manufacturing plant makes 10-inch, 9-inch, and 7-inch frying pans. During a certain day, the number of 10-inch frying pans that the manufacturing plant makes is 4 times the number of 9-inch frying pans it makes, and the number of 7-inch frying pans it makes is 10. During this day, the manufacturing plant makes 100 frying pans total. If $n$ represents the number of 9-inch frying pans made, which equation represents this situation?',
    options: [
      { id: 'A', label: 'A', text: '$10(4n) + 9n + 7(10) = 100$' },
      { id: 'B', label: 'B', text: '$10n + 9n + 7n = 100$' },
      { id: 'C', label: 'C', text: '$4n + 10 = 100$' },
      { id: 'D', label: 'D', text: '$5n + 10 = 100$' },
    ],
    correctAnswer: 'D',
  },
};

console.log('Building complete algebra corrections database...');
console.log('Manual overrides defined:', Object.keys(MANUAL_OVERRIDES).length);

// Generate for remaining vector questions
const finalCorrections = { ...MANUAL_OVERRIDES };

for (const [id, item] of Object.entries(rawOcr)) {
  if (finalCorrections[id]) continue; // already customized

  const origQ = mathQuestions.find(x => x.id === id);
  const lines = item.ocrText.split('\n').map(l => l.trim()).filter(Boolean);
  const ansIdx = lines.findIndex(l => /^Answer\b/i.test(l));
  const corrIdx = lines.findIndex(l => /Correct\s+Answer/i.test(l));

  if (ansIdx === -1) continue;

  // Options
  const optEnd = corrIdx !== -1 ? corrIdx : lines.length;
  const optLines = lines.slice(ansIdx + 1, optEnd);
  const cleanOpts = [];

  for (const l of optLines) {
    const cleaned = l.replace(/^[A-D0][\.\s\-\:\)]+/i, '').trim();
    if (cleaned) cleanOpts.push(cleaned);
  }

  // If 4 clean options found
  if (cleanOpts.length >= 4) {
    const options = [
      { id: 'A', label: 'A', text: formatMathOption(cleanOpts[0]) },
      { id: 'B', label: 'B', text: formatMathOption(cleanOpts[1]) },
      { id: 'C', label: 'C', text: formatMathOption(cleanOpts[2]) },
      { id: 'D', label: 'D', text: formatMathOption(cleanOpts[3]) },
    ];

    let corr = origQ?.correctAnswer || 'A';
    if (corrIdx !== -1) {
      const cm = lines[corrIdx].match(/Correct\s+Answer\s*:\s*([A-D])/i);
      if (cm) corr = cm[1].toUpperCase();
    }

    // Build prompt from origQ if it has text, or clean OCR text
    let prompt = origQ?.prompt || '';
    if (!prompt || prompt.length < 15 || prompt.includes('If, what is the value of?')) {
      const qIdx = lines.findIndex(l => /^Question\b/i.test(l));
      if (qIdx !== -1) {
        prompt = lines.slice(qIdx + 1, ansIdx).join(' ').replace(/[\u2013\u2014\u2212]/g, '-');
      }
    }

    finalCorrections[id] = {
      prompt,
      options,
      correctAnswer: corr,
    };
  }
}

console.log(`Total corrections assembled: ${Object.keys(finalCorrections).length}`);
fs.writeFileSync('scripts/generated_algebra_corrections.json', JSON.stringify(finalCorrections, null, 2));
console.log('Saved to scripts/generated_algebra_corrections.json!');
