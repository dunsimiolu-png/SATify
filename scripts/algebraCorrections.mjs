/**
 * Official Digital SAT Math Corrections and Structured Table Stimuli for ALGEBRA.pdf.
 * 
 * Contains:
 * 1. ALGEBRA_GRAPH_IDS: The exact 6 coordinate plane graph questions in ALGEBRA.pdf.
 *    Only these 6 questions are allowed to have an imageUrl.
 * 2. ALGEBRA_CORRECTIONS: Exact prompt, HTML table passage, and LaTeX text options
 *    for all table questions and questions with vector math gaps in ALGEBRA.pdf.
 */

export const ALGEBRA_GRAPH_IDS = new Set([
  '3f5375d9',
  'e1259a5a',
  'c362c210',
  '11e1ab81',
  '2704399f',
  '8a1544f1',
]);

export const ALGEBRA_CORRECTIONS = {
  // --- Target Verification Questions ---
  'c039b198': {
    prompt: 'A computer company pays customers for trading in old computers. The payment $p$, in dollars, is the original retail price of a computer minus $\\$150$ for each year since the computer was released. Which equation represents this situation for a computer with an original retail price of $\\$690$ when it was released $t$ years ago, where $t$ is a whole number and $1 \\le t \\le 4$?',
    options: [
      { id: 'A', label: 'A', text: '$p = 150 - 690t$' },
      { id: 'B', label: 'B', text: '$p = 690 - 150t$' },
      { id: 'C', label: 'C', text: '$t = 150 - 690p$' },
      { id: 'D', label: 'D', text: '$t = 690 - 150p$' },
    ],
    correctAnswer: 'B',
  },

  'd4572f55': {
    passage: `<div class="sat-table-container">
  <table class="sat-table">
    <thead>
      <tr><th>$x$</th><th>$y$</th></tr>
    </thead>
    <tbody>
      <tr><td>$-34$</td><td>$t$</td></tr>
      <tr><td>$-17$</td><td>$t + 23$</td></tr>
      <tr><td>$0$</td><td>$t + 46$</td></tr>
    </tbody>
  </table>
</div>`,
    prompt: 'For a linear relationship between $x$ and $y$, the table gives three values of $x$ and their corresponding values of $y$, where $t$ is a constant. Which equation represents this relationship?',
    options: [
      { id: 'A', label: 'A', text: '$y = -2x + t + 23$' },
      { id: 'B', label: 'B', text: '$y = 2x + t + 23$' },
      { id: 'C', label: 'C', text: '$y = -\\frac{23}{17}x + t + 46$' },
      { id: 'D', label: 'D', text: '$y = \\frac{23}{17}x + t + 46$' },
    ],
    correctAnswer: 'D',
  },

  '3008cfc3': {
    passage: `<div class="sat-table-container">
  <table class="sat-table">
    <thead>
      <tr><th>$x$</th><th>$y$</th></tr>
    </thead>
    <tbody>
      <tr><td>$k$</td><td>$13$</td></tr>
      <tr><td>$k + 7$</td><td>$-15$</td></tr>
    </tbody>
  </table>
</div>`,
    prompt: 'The table gives the coordinates of two points on a line in the $xy$-plane. The $y$-intercept of the line is $(k - 5, b)$, where $k$ and $b$ are constants. What is the value of $b$?',
    correctAnswer: '33',
    questionType: 'spr',
    options: [],
  },

  '9bbce683': {
    passage: `<div class="sat-table-container">
  <table class="sat-table">
    <thead>
      <tr><th>$x$</th><th>$y$</th></tr>
    </thead>
    <tbody>
      <tr><td>$18$</td><td>$130$</td></tr>
      <tr><td>$23$</td><td>$160$</td></tr>
      <tr><td>$26$</td><td>$178$</td></tr>
    </tbody>
  </table>
</div>`,
    prompt: 'For line $h$, the table shows three values of $x$ and their corresponding values of $y$. Line $k$ is the result of translating line $h$ down $5$ units in the $xy$-plane. What is the $x$-intercept of line $k$?',
    options: [
      { id: 'A', label: 'A', text: '$(-\\frac{26}{3}, 0)$' },
      { id: 'B', label: 'B', text: '$(-\\frac{9}{2}, 0)$' },
      { id: 'C', label: 'C', text: '$(-\\frac{11}{3}, 0)$' },
      { id: 'D', label: 'D', text: '$(-\\frac{17}{6}, 0)$' },
    ],
    correctAnswer: 'D',
  },

  'e25f0807': {
    passage: `<div class="sat-table-container">
  <table class="sat-table">
    <thead>
      <tr><th>$x$</th><th>$y$</th></tr>
    </thead>
    <tbody>
      <tr><td>$-12$</td><td>$-45$</td></tr>
      <tr><td>$6$</td><td>$45$</td></tr>
    </tbody>
  </table>
</div>`,
    prompt: 'The table shows two values of $x$ and their corresponding values of $y$. The graph of the linear equation representing this relationship passes through the point $(\\frac{1}{4}, a)$. What is the value of $a$?',
    correctAnswer: '65/4',
    acceptedAnswers: ['65/4', '16.25', '16.250', '.25'],
    questionType: 'spr',
    options: [],
  },

  '12983c1e': {
    passage: `<div class="sat-table-container">
  <table class="sat-table">
    <thead>
      <tr><th>$x$</th><th>$f(x)$</th></tr>
    </thead>
    <tbody>
      <tr><td>$1$</td><td>$5$</td></tr>
      <tr><td>$3$</td><td>$13$</td></tr>
      <tr><td>$5$</td><td>$21$</td></tr>
    </tbody>
  </table>
</div>`,
    prompt: 'Some values of the linear function $f$ are shown in the table above. Which of the following defines $f$?',
    options: [
      { id: 'A', label: 'A', text: '$f(x) = 2x + 3$' },
      { id: 'B', label: 'B', text: '$f(x) = 3x + 2$' },
      { id: 'C', label: 'C', text: '$f(x) = 4x + 1$' },
      { id: 'D', label: 'D', text: '$f(x) = 5x$' },
    ],
    correctAnswer: 'C',
  },

  '50f4cb9c': {
    passage: `<div class="sat-table-container">
  <table class="sat-table">
    <thead>
      <tr><th>$x$</th><th>$f(x)$</th></tr>
    </thead>
    <tbody>
      <tr><td>$0$</td><td>$-128$</td></tr>
      <tr><td>$1$</td><td>$-64$</td></tr>
      <tr><td>$2$</td><td>$0$</td></tr>
    </tbody>
  </table>
</div>`,
    prompt: 'For the linear function $f$, the table shows three values of $x$ and their corresponding values of $f(x)$. Function $f$ is defined by $f(x) = ax + b$, where $a$ and $b$ are constants. What is the value of $a - b$?',
    options: [
      { id: 'A', label: 'A', text: '$-64$' },
      { id: 'B', label: 'B', text: '$62$' },
      { id: 'C', label: 'C', text: '$128$' },
      { id: 'D', label: 'D', text: '$192$' },
    ],
    correctAnswer: 'D',
  },

  '83f2c3bf': {
    prompt: 'Which table gives three values of $x$ and their corresponding values of $y$ for the given equation $y = x + 4$?',
    options: [
      { id: 'A', label: 'A', text: '$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 4 \\\\ \\hline 1 & 5 \\\\ \\hline 2 & 6 \\\\ \\hline \\end{array}$$' },
      { id: 'B', label: 'B', text: '$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 6 \\\\ \\hline 1 & 5 \\\\ \\hline 2 & 4 \\\\ \\hline \\end{array}$$' },
      { id: 'C', label: 'C', text: '$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 2 \\\\ \\hline 1 & 1 \\\\ \\hline 2 & 0 \\\\ \\hline \\end{array}$$' },
      { id: 'D', label: 'D', text: '$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 0 \\\\ \\hline 1 & 1 \\\\ \\hline 2 & 2 \\\\ \\hline \\end{array}$$' },
    ],
    correctAnswer: 'A',
  },

  'e7343559': {
    prompt: 'Which table gives three values of $x$ and their corresponding values of $y$ for the given equation $y = 7x + 2$?',
    options: [
      { id: 'A', label: 'A', text: '$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 2 \\\\ \\hline 1 & 9 \\\\ \\hline 2 & 16 \\\\ \\hline \\end{array}$$' },
      { id: 'B', label: 'B', text: '$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 7 \\\\ \\hline 1 & 9 \\\\ \\hline 2 & 11 \\\\ \\hline \\end{array}$$' },
      { id: 'C', label: 'C', text: '$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 2 \\\\ \\hline 1 & 7 \\\\ \\hline 2 & 14 \\\\ \\hline \\end{array}$$' },
      { id: 'D', label: 'D', text: '$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 14 \\\\ \\hline 1 & 7 \\\\ \\hline 2 & 2 \\\\ \\hline \\end{array}$$' },
    ],
    correctAnswer: 'A',
  },

  'cea27ab2': {
    prompt: 'For the given equation $y = 3x + 8$, which table gives three values of $x$ and their corresponding values of $y$?',
    options: [
      { id: 'A', label: 'A', text: '$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 8 \\\\ \\hline 1 & 11 \\\\ \\hline 2 & 14 \\\\ \\hline \\end{array}$$' },
      { id: 'B', label: 'B', text: '$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 3 \\\\ \\hline 1 & 6 \\\\ \\hline 2 & 9 \\\\ \\hline \\end{array}$$' },
      { id: 'C', label: 'C', text: '$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 8 \\\\ \\hline 1 & 3 \\\\ \\hline 2 & 6 \\\\ \\hline \\end{array}$$' },
      { id: 'D', label: 'D', text: '$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 3 \\\\ \\hline 1 & 8 \\\\ \\hline 2 & 11 \\\\ \\hline \\end{array}$$' },
    ],
    correctAnswer: 'A',
  },

  '1efd8202': {
    prompt: 'Which table gives three values of $x$ and their corresponding values of $y$ for the given equation $y = 70x + 8$?',
    options: [
      { id: 'A', label: 'A', text: '$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 8 \\\\ \\hline 1 & 78 \\\\ \\hline 2 & 148 \\\\ \\hline \\end{array}$$' },
      { id: 'B', label: 'B', text: '$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 70 \\\\ \\hline 2 & 78 \\\\ \\hline 4 & 86 \\\\ \\hline \\end{array}$$' },
      { id: 'C', label: 'C', text: '$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 8 \\\\ \\hline 2 & 70 \\\\ \\hline 4 & 140 \\\\ \\hline \\end{array}$$' },
      { id: 'D', label: 'D', text: '$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 70 \\\\ \\hline 1 & 78 \\\\ \\hline 2 & 86 \\\\ \\hline \\end{array}$$' },
    ],
    correctAnswer: 'A',
  },

  '6cb9bf45': {
    prompt: 'For which of the following tables are all the values of $x$ and their corresponding values of $y$ solutions to the given inequality $y > 7x - 4$?',
    options: [
      { id: 'A', label: 'A', text: '$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 5 & 35 \\\\ \\hline 8 & 52 \\\\ \\hline \\end{array}$$' },
      { id: 'B', label: 'B', text: '$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 5 & 31 \\\\ \\hline 8 & 52 \\\\ \\hline \\end{array}$$' },
      { id: 'C', label: 'C', text: '$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 5 & 30 \\\\ \\hline 8 & 50 \\\\ \\hline \\end{array}$$' },
      { id: 'D', label: 'D', text: '$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 5 & 28 \\\\ \\hline 8 & 49 \\\\ \\hline \\end{array}$$' },
    ],
    correctAnswer: 'A',
  },

  'af711d1b': {
    passage: `<div class="sat-table-container">
  <table class="sat-table">
    <thead>
      <tr><th>Distance (kilometers)</th><th>Average time (minutes)</th></tr>
    </thead>
    <tbody>
      <tr><td>$0.3$</td><td>$8$</td></tr>
      <tr><td>$0.6$</td><td>$16$</td></tr>
      <tr><td>$0.9$</td><td>$24$</td></tr>
    </tbody>
  </table>
</div>`,
    prompt: 'The table gives the average time $t$, in minutes, it takes Carly to travel a certain distance $d$, in kilometers. Which equation could represent this linear relationship?',
    options: [
      { id: 'A', label: 'A', text: '$t = 4d$' },
      { id: 'B', label: 'B', text: '$t = \\frac{1}{4}d$' },
      { id: 'C', label: 'C', text: '$t = 25d$' },
      { id: 'D', label: 'D', text: '$t = \\frac{1}{25}d$' },
    ],
    correctAnswer: 'C',
  },

  'bbb0359a': {
    passage: `<div class="sat-table-container">
  <table class="sat-table">
    <thead>
      <tr><th>$x$</th><th>$y$</th></tr>
    </thead>
    <tbody>
      <tr><td>$0$</td><td>$6$</td></tr>
      <tr><td>$1$</td><td>$11$</td></tr>
      <tr><td>$2$</td><td>$16$</td></tr>
    </tbody>
  </table>
</div>`,
    prompt: 'The table shows three values of $x$ and their corresponding values of $y$. Which equation represents the linear relationship between $x$ and $y$?',
    options: [
      { id: 'A', label: 'A', text: '$y = 5x + 6$' },
      { id: 'B', label: 'B', text: '$y = 5x + 11$' },
      { id: 'C', label: 'C', text: '$y = 6x + 5$' },
      { id: 'D', label: 'D', text: '$y = 6x + 11$' },
    ],
    correctAnswer: 'A',
  },

  '606cdce7': {
    passage: `<div class="sat-table-container">
  <table class="sat-table">
    <thead>
      <tr><th>$x$</th><th>$y$</th></tr>
    </thead>
    <tbody>
      <tr><td>$0$</td><td>$18$</td></tr>
      <tr><td>$1$</td><td>$13$</td></tr>
      <tr><td>$2$</td><td>$8$</td></tr>
      <tr><td>$3$</td><td>$3$</td></tr>
    </tbody>
  </table>
</div>`,
    prompt: 'The table shows four values of $x$ and their corresponding values of $y$. There is a linear relationship between $x$ and $y$. Which of the following equations represents this relationship?',
    options: [
      { id: 'A', label: 'A', text: '$y = 18x + 13$' },
      { id: 'B', label: 'B', text: '$y = 18x + 18$' },
      { id: 'C', label: 'C', text: '$y = -5x + 13$' },
      { id: 'D', label: 'D', text: '$y = -5x + 18$' },
    ],
    correctAnswer: 'D',
  },

  'c651cc56': {
    passage: `<div class="sat-table-container">
  <table class="sat-table">
    <thead>
      <tr><th>$x$</th><th>$f(x)$</th></tr>
    </thead>
    <tbody>
      <tr><td>$0$</td><td>$29$</td></tr>
      <tr><td>$1$</td><td>$32$</td></tr>
      <tr><td>$2$</td><td>$35$</td></tr>
    </tbody>
  </table>
</div>`,
    prompt: 'Some values of the linear function $f$ are shown in the table above. Which of the following equations defines $f$?',
    options: [
      { id: 'A', label: 'A', text: '$f(x) = 2x + 29$' },
      { id: 'B', label: 'B', text: '$f(x) = 3x + 29$' },
      { id: 'C', label: 'C', text: '$f(x) = 29x + 2$' },
      { id: 'D', label: 'D', text: '$f(x) = 29x + 3$' },
    ],
    correctAnswer: 'B',
  },

  'ba79f10f': {
    passage: `<div class="sat-table-container">
  <table class="sat-table">
    <thead>
      <tr><th>$x$</th><th>$y$</th></tr>
    </thead>
    <tbody>
      <tr><td>$0$</td><td>$14$</td></tr>
      <tr><td>$1$</td><td>$19$</td></tr>
      <tr><td>$2$</td><td>$24$</td></tr>
    </tbody>
  </table>
</div>`,
    prompt: 'The table shows three values of $x$ and their corresponding values of $y$. Which equation represents the relationship between $x$ and $y$?',
    options: [
      { id: 'A', label: 'A', text: '$y = 5x + 14$' },
      { id: 'B', label: 'B', text: '$y = 5x + 19$' },
      { id: 'C', label: 'C', text: '$y = 14x + 5$' },
      { id: 'D', label: 'D', text: '$y = 14x + 19$' },
    ],
    correctAnswer: 'A',
  },

  '868fc236': {
    passage: `<div class="sat-table-container">
  <table class="sat-table">
    <thead>
      <tr><th>Macronutrient</th><th>Food calories</th><th>Kilojoules</th></tr>
    </thead>
    <tbody>
      <tr><td>Protein</td><td>$4.0$</td><td>$16.7$</td></tr>
      <tr><td>Fat</td><td>$9.0$</td><td>$37.7$</td></tr>
      <tr><td>Carbohydrate</td><td>$4.0$</td><td>$16.7$</td></tr>
    </tbody>
  </table>
</div>`,
    prompt: 'The table above gives the typical amounts of energy per gram, expressed in both food calories and kilojoules, of the three macronutrients in food. If $x$ food calories is equivalent to $k$ kilojoules, of the following, which best represents the relationship between $x$ and $k$?',
    options: [
      { id: 'A', label: 'A', text: '$k = 0.24x$' },
      { id: 'B', label: 'B', text: '$k = 4.2x$' },
      { id: 'C', label: 'C', text: '$x = 4.2k$' },
      { id: 'D', label: 'D', text: '$x = k + 12.7$' },
    ],
    correctAnswer: 'B',
  },

  '0366d965': {
    passage: `<div class="sat-table-container">
  <table class="sat-table">
    <thead>
      <tr><th>$x$</th><th>$y$</th></tr>
    </thead>
    <tbody>
      <tr><td>$3$</td><td>$7$</td></tr>
      <tr><td>$k$</td><td>$11$</td></tr>
      <tr><td>$12$</td><td>$n$</td></tr>
    </tbody>
  </table>
</div>`,
    prompt: 'The table above shows the coordinates of three points on a line in the $xy$-plane, where $k$ and $n$ are constants. If the slope of the line is $2$, what is the value of $k + n$?',
    correctAnswer: '30',
    questionType: 'spr',
    options: [],
  },

  'b2de69bd': {
    passage: `<div class="sat-table-container">
  <table class="sat-table">
    <thead>
      <tr><th>$x$</th><th>$y$</th></tr>
    </thead>
    <tbody>
      <tr><td>$1$</td><td>$5$</td></tr>
      <tr><td>$2$</td><td>$7$</td></tr>
      <tr><td>$3$</td><td>$9$</td></tr>
      <tr><td>$4$</td><td>$11$</td></tr>
    </tbody>
  </table>
</div>`,
    prompt: 'The table above shows some pairs of $x$ values and $y$ values. Which of the following equations could represent the relationship between $x$ and $y$?',
    options: [
      { id: 'A', label: 'A', text: '$y = 2x + 3$' },
      { id: 'B', label: 'B', text: '$y = 3x - 2$' },
      { id: 'C', label: 'C', text: '$y = 4x - 1$' },
      { id: 'D', label: 'D', text: '$y = 5x$' },
    ],
    correctAnswer: 'A',
  },

  '78391fcc': {
    passage: `<div class="sat-table-container">
  <table class="sat-table">
    <thead>
      <tr><th>$x$</th><th>$f(x)$</th></tr>
    </thead>
    <tbody>
      <tr><td>$2$</td><td>$21$</td></tr>
      <tr><td>$3$</td><td>$18$</td></tr>
      <tr><td>$4$</td><td>$15$</td></tr>
      <tr><td>$5$</td><td>$12$</td></tr>
    </tbody>
  </table>
</div>`,
    prompt: 'The table above shows some values of $x$ and their corresponding values $f(x)$ for the linear function $f$. What is the $x$-intercept of the graph of $y = f(x)$ in the $xy$-plane?',
    options: [
      { id: 'A', label: 'A', text: '$(-3, 0)$' },
      { id: 'B', label: 'B', text: '$(-4, 0)$' },
      { id: 'C', label: 'C', text: '$(-9, 0)$' },
      { id: 'D', label: 'D', text: '$(9, 0)$' },
    ],
    correctAnswer: 'D',
  },

  'b2fe7ab6': {
    passage: `<div class="sat-table-container">
  <table class="sat-table">
    <thead>
      <tr><th>$x$</th><th>$g(x)$</th></tr>
    </thead>
    <tbody>
      <tr><td>$0$</td><td>$57$</td></tr>
      <tr><td>$1$</td><td>$54$</td></tr>
      <tr><td>$2$</td><td>$51$</td></tr>
      <tr><td>$3$</td><td>$48$</td></tr>
    </tbody>
  </table>
</div>`,
    prompt: 'For the linear function $g$, the table shows four values of $x$ and their corresponding values of $g(x)$. The function can be written as $g(x) = mx + b$, where $m$ and $b$ are constants. What is the value of $b$?',
    options: [
      { id: 'A', label: 'A', text: '$3$' },
      { id: 'B', label: 'B', text: '$27$' },
      { id: 'C', label: 'C', text: '$54$' },
      { id: 'D', label: 'D', text: '$57$' },
    ],
    correctAnswer: 'D',
  },

  '97eab129': {
    passage: `<div class="sat-table-container">
  <table class="sat-table">
    <thead>
      <tr><th>Area (square feet)</th><th>Water (gallons)</th></tr>
    </thead>
    <tbody>
      <tr><td>$2,520$</td><td>$4,536$</td></tr>
      <tr><td>$3,780$</td><td>$6,804$</td></tr>
      <tr><td>$5,040$</td><td>$9,072$</td></tr>
    </tbody>
  </table>
</div>`,
    prompt: 'The buildings of a shopping center are designed to allow water to drain from the roof into gutters on the sides of the buildings. The table shows the relationship between the area $x$, in square feet, of a roof and the amount of water $f(x)$, in gallons, drained from the roof into the gutters over a certain period of time. Which equation could define $f$?',
    options: [
      { id: 'A', label: 'A', text: '$f(x) = 0.6x$' },
      { id: 'B', label: 'B', text: '$f(x) = 1.8x$' },
      { id: 'C', label: 'C', text: '$f(x) = 2,268x$' },
      { id: 'D', label: 'D', text: '$f(x) = 4,536x$' },
    ],
    correctAnswer: 'B',
  },

  '6f6dfe3e': {
    passage: `<div class="sat-table-container">
  <table class="sat-table">
    <thead>
      <tr><th>$x$</th><th>$y$</th></tr>
    </thead>
    <tbody>
      <tr><td>$-6$</td><td>$n + 184$</td></tr>
      <tr><td>$-3$</td><td>$n + 92$</td></tr>
      <tr><td>$0$</td><td>$n$</td></tr>
    </tbody>
  </table>
</div>`,
    prompt: 'The table shows three values of $x$ and their corresponding values of $y$, where $n$ is a constant, for the linear relationship between $x$ and $y$. What is the slope of the line that represents this relationship in the $xy$-plane?',
    options: [
      { id: 'A', label: 'A', text: '$-\\frac{92}{3}$' },
      { id: 'B', label: 'B', text: '$-\\frac{3}{92}$' },
      { id: 'C', label: 'C', text: '$\\frac{n + 92}{3}$' },
      { id: 'D', label: 'D', text: '$-\\frac{2n - 92}{3}$' },
    ],
    correctAnswer: 'A',
  },

  '41fdc0b8': {
    passage: `<div class="sat-table-container">
  <table class="sat-table">
    <thead>
      <tr><th>Year</th><th>Population</th></tr>
    </thead>
    <tbody>
      <tr><td>$2000$</td><td>$862$</td></tr>
      <tr><td>$2010$</td><td>$846$</td></tr>
    </tbody>
  </table>
</div>`,
    prompt: 'The table above shows the population of Greenleaf, Idaho, for the years 2000 and 2010. If the relationship between population and year is linear, which of the following functions $P$ models the population of Greenleaf $t$ years after 2000?',
    options: [
      { id: 'A', label: 'A', text: '$P(t) = 862 - 1.6t$' },
      { id: 'B', label: 'B', text: '$P(t) = 862 - 16t$' },
      { id: 'C', label: 'C', text: '$P(t) = 862 + 16(t - 2,000)$' },
      { id: 'D', label: 'D', text: '$P(t) = 862 + 1.6(t - 2,000)$' },
    ],
    correctAnswer: 'A',
  },

  '49800634': {
    passage: `<div class="sat-table-container">
  <table class="sat-table">
    <thead>
      <tr><th>$x$</th><th>$y$</th></tr>
    </thead>
    <tbody>
      <tr><td>$-14$</td><td>$-172$</td></tr>
      <tr><td>$2$</td><td>$20$</td></tr>
    </tbody>
  </table>
</div>`,
    prompt: 'The table shows two values of $x$ and their corresponding values of $y$. In the $xy$-plane, the graph of the linear equation representing this relationship passes through the point $(4, a)$. What is the value of $a$?',
    options: [
      { id: 'A', label: 'A', text: '$-11$' },
      { id: 'B', label: 'B', text: '$-\\frac{4}{11}$' },
      { id: 'C', label: 'C', text: '$\\frac{4}{7}$' },
      { id: 'D', label: 'D', text: '$44$' },
    ],
    correctAnswer: 'D',
  },

  // --- Word Problem Vector Math Gap Fixes ---
  '0eae6be1': {
    prompt: 'The number $y$ is $84$ less than the number $x$. Which equation represents the relationship between $x$ and $y$?',
    options: [
      { id: 'A', label: 'A', text: '$y = x + 84$' },
      { id: 'B', label: 'B', text: '$y = \\frac{x}{84}$' },
      { id: 'C', label: 'C', text: '$y = 84x$' },
      { id: 'D', label: 'D', text: '$y = x - 84$' },
    ],
    correctAnswer: 'D',
  },

  'f8fa0cf0': {
    prompt: 'What value of $r$ is the solution to the given equation $9r = 7(r + 7)$?',
    correctAnswer: '49/2',
    acceptedAnswers: ['49/2', '24.5'],
    questionType: 'spr',
    options: [],
  },

  '60f71697': {
    prompt: 'What value of $x$ is the solution to the given equation $8x = 88$?',
    options: [
      { id: 'A', label: 'A', text: '$11$' },
      { id: 'B', label: 'B', text: '$80$' },
      { id: 'C', label: 'C', text: '$96$' },
      { id: 'D', label: 'D', text: '$704$' },
    ],
    correctAnswer: 'A',
  },

  '1a621af4': {
    prompt: 'A number $x$ is at most $2$ less than $3$ times the value of $y$. If the value of $y$ is $-4$, what is the greatest possible value of $x$?',
    correctAnswer: '-14',
    questionType: 'spr',
    options: [],
  },

  '87071893': {
    prompt: 'What value of $x$ is the solution to the given equation $x + 40 = 95$?',
    correctAnswer: '55',
    questionType: 'spr',
    options: [],
  },

  '771bd0ca': {
    prompt: 'What value of $t$ is the solution to the given equation $5(t + 3) - 7(t + 3) = 38$?',
    correctAnswer: '-22',
    questionType: 'spr',
    options: [],
  },

  '915463e0': {
    prompt: 'Normal body temperature for an adult is between $97.8^\\circ\\text{F}$ and $99^\\circ\\text{F}$, inclusive. If Kevin, an adult male, has a body temperature that is considered to be normal, which of the following could be his body temperature?',
    options: [
      { id: 'A', label: 'A', text: '$96.7^\\circ\\text{F}$' },
      { id: 'B', label: 'B', text: '$97.6^\\circ\\text{F}$' },
      { id: 'C', label: 'C', text: '$97.9^\\circ\\text{F}$' },
      { id: 'D', label: 'D', text: '$99.7^\\circ\\text{F}$' },
    ],
    correctAnswer: 'C',
  },

  'aee9fd2d': {
    prompt: 'If $\\frac{x + 6}{3} = \\frac{x + 6}{13}$, the value of $x + 6$ is between which of the following pairs of values?',
    options: [
      { id: 'A', label: 'A', text: '$-7$ and $-3$' },
      { id: 'B', label: 'B', text: '$-2$ and $2$' },
      { id: 'C', label: 'C', text: '$2$ and $7$' },
      { id: 'D', label: 'D', text: '$8$ and $13$' },
    ],
    correctAnswer: 'B',
  },

  '4f8bd093': {
    prompt: 'What value of $x$ is the solution to the equation $16x + 24 = 24x$?',
    options: [
      { id: 'A', label: 'A', text: '$-4$' },
      { id: 'B', label: 'B', text: '$0$' },
      { id: 'C', label: 'C', text: '$\\frac{1}{3}$' },
      { id: 'D', label: 'D', text: '$3$' },
    ],
    correctAnswer: 'D',
  },

  '429fb7c0': {
    prompt: 'What value of $t$ is the solution to the equation $0.8t - 0.46 = 8(t - 0.001) + 1.9$?',
    correctAnswer: '-49/150',
    acceptedAnswers: ['-49/150', '-.3267', '-.3266', '-0.326', '-0.327', '-0.3267'],
    questionType: 'spr',
    options: [],
  },

  'f5ff91b2': {
    prompt: 'If $\\frac{x - 5}{7} = \\frac{x - 5}{9}$, the value of $x - 5$ is between which of the following pairs of values?',
    options: [
      { id: 'A', label: 'A', text: '$-9$ and $-7$' },
      { id: 'B', label: 'B', text: '$-3$ and $3$' },
      { id: 'C', label: 'C', text: '$4.5$ and $5.5$' },
      { id: 'D', label: 'D', text: '$6.75$ and $9.25$' },
    ],
    correctAnswer: 'B',
  },

  '208626df': {
    prompt: 'A rectangle has length $\\ell$ and width $w$. The inequality $2\\ell + 2w \\le 27$ gives the possible values of $\\ell$ and $w$ for which the perimeter of this rectangle is less than or equal to $27$. Which statement is the best interpretation of $(\\ell, w) = (8, 3)$ in this context?',
    options: [
      { id: 'A', label: 'A', text: 'If the rectangle has length 3 and width 8, its perimeter is less than or equal to 27.' },
      { id: 'B', label: 'B', text: 'If the rectangle has length 8 and width 3, its perimeter is less than or equal to 27.' },
      { id: 'C', label: 'C', text: 'If the rectangle has length 3 and width 8, its perimeter is greater than or equal to 27.' },
      { id: 'D', label: 'D', text: 'If the rectangle has length 8 and width 3, its perimeter is greater than or equal to 27.' },
    ],
    correctAnswer: 'B',
  },
};
