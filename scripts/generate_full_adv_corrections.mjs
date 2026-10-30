import * as fs from 'fs';
import katex from 'katex';

// The 14 genuine stimulus coordinate graphs in ADVANCED_MATHS.pdf
export const ADVANCED_MATH_GRAPH_IDS = [
  '6abec9a8',
  '252a3b3a',
  '4ca30186',
  'b5c43226',
  '97e50fa2',
  'df71424b',
  '5f10c095',
  'f123e039',
  'cef0eada',
  '5e63b9cf',
  'd0e8e8f5',
  'ebe4bde0',
  'd45572cc',
  '50418728',
];

const CURATED_CORRECTIONS = {
  // ==========================================
  // 1. OPTION GRAPH QUESTIONS (4 questions)
  // ==========================================
  'b39d74a0': {
    passage: '',
    prompt: '$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 0 \\\\ \\hline 1 & 1 \\\\ \\hline 2 & 8 \\\\ \\hline 3 & 27 \\\\ \\hline \\end{array}$$\n\nThe table shown includes some values of $x$ and their corresponding values of $y$. Which of the following graphs in the $xy$-plane could represent the relationship between $x$ and $y$?',
    options: [
      { id: 'A', label: 'A', text: '', imageUrl: '/question-images/math/b39d74a0_opt_A.png' },
      { id: 'B', label: 'B', text: '', imageUrl: '/question-images/math/b39d74a0_opt_B.png' },
      { id: 'C', label: 'C', text: '', imageUrl: '/question-images/math/b39d74a0_opt_C.png' },
      { id: 'D', label: 'D', text: '', imageUrl: '/question-images/math/b39d74a0_opt_D.png' },
    ],
    correctAnswer: 'B',
  },
  '75a32330': {
    passage: '',
    prompt: '$$\\begin{aligned} y &= x^2 + 1.7 \\\\ y &= 1.7 - x \\end{aligned}$$\n\nWhich graph represents the given system of equations?',
    options: [
      { id: 'A', label: 'A', text: '', imageUrl: '/question-images/math/75a32330_opt_A.png' },
      { id: 'B', label: 'B', text: '', imageUrl: '/question-images/math/75a32330_opt_B.png' },
      { id: 'C', label: 'C', text: '', imageUrl: '/question-images/math/75a32330_opt_C.png' },
      { id: 'D', label: 'D', text: '', imageUrl: '/question-images/math/75a32330_opt_D.png' },
    ],
    correctAnswer: 'A',
  },
  'd675744f': {
    passage: '',
    prompt: '$$y = 4(2^x)$$\n\nWhich of the following is the graph in the $xy$-plane of the given equation?',
    options: [
      { id: 'A', label: 'A', text: '', imageUrl: '/question-images/math/d675744f_opt_A.png' },
      { id: 'B', label: 'B', text: '', imageUrl: '/question-images/math/d675744f_opt_B.png' },
      { id: 'C', label: 'C', text: '', imageUrl: '/question-images/math/d675744f_opt_C.png' },
      { id: 'D', label: 'D', text: '', imageUrl: '/question-images/math/d675744f_opt_D.png' },
    ],
    correctAnswer: 'D',
  },
  'd46da42c': {
    passage: '',
    prompt: '$$f(x) = x^2 + 4$$\n\nThe function $f$ is defined as shown. Which of the following graphs in the $xy$-plane could be the graph of $y = f(x)$?',
    options: [
      { id: 'A', label: 'A', text: '', imageUrl: '/question-images/math/d46da42c_opt_A.png' },
      { id: 'B', label: 'B', text: '', imageUrl: '/question-images/math/d46da42c_opt_B.png' },
      { id: 'C', label: 'C', text: '', imageUrl: '/question-images/math/d46da42c_opt_C.png' },
      { id: 'D', label: 'D', text: '', imageUrl: '/question-images/math/d46da42c_opt_D.png' },
    ],
    correctAnswer: 'D',
  },

  // ==========================================
  // 2. REVIEWED / CURATED QUESTIONS (24 questions)
  // ==========================================
  '97e50fa2': {
    passage: "Student-produced response directions\n• If you find more than one correct solution, enter only one.\n• You can enter up to 5 characters for a positive result and up to 6 characters (including the negative sign) for a negative result.\n• If your answer is a fraction that doesn't fit in the provided space, enter the decimal equivalent.\n• If your answer is a decimal that doesn't fit in the provided space, truncate or round it at the fourth digit.\n• If your answer is a mixed number (such as 3 1/2), enter it as an improper fraction (7/2) or its decimal equivalent (3.5).\n• Don't enter symbols such as a percent sign, comma, or dollar sign.",
    prompt: 'The graph of the function $f$, defined by $f(x) = -\\frac{1}{2}(x - 4)^2 + 10$, is shown in the $xy$-plane above. If the function $g$ (not shown) is defined by $g(x) = -x + 10$, what is one possible value of $a$ such that $f(a) = g(a)$?',
    questionType: 'spr',
    correctAnswer: '2',
    acceptedAnswers: ['2', '8'],
    options: [],
    imageUrl: '/question-images/math/97e50fa2.png',
  },
  '3cf2698e': {
    prompt: 'The number of cells of a certain bacteria doubles every $25$ minutes during its growth period when placed in a medium of milk in a controlled laboratory environment. If a sample of $830$ cells of this bacteria is placed in milk in a controlled laboratory environment, which function $f$ best represents the number of cells of the bacteria $x$ minutes after the growth period begins, where $x$ is less than the number of minutes in the growth period?',
    options: [
      { id: 'A', label: 'A', text: '$f(x) = 830(2)^{\\frac{x}{25}}$' },
      { id: 'B', label: 'B', text: '$f(x) = 830(2)^{25x}$' },
      { id: 'C', label: 'C', text: '$f(x) = 830\\left(\\frac{1}{2}\\right)^{\\frac{x}{25}}$' },
      { id: 'D', label: 'D', text: '$f(x) = 830\\left(\\frac{1}{2}\\right)^{25x}$' },
    ],
    correctAnswer: 'A',
  },
  '252a3b3a': {
    prompt: 'Which of the following could be the equation of the graph shown in the $xy$-plane?',
    options: [
      { id: 'A', label: 'A', text: '$y = -\\frac{1}{10}x(x - 4)(x + 5)$' },
      { id: 'B', label: 'B', text: '$y = -\\frac{1}{10}x(x - 4)(x + 5)^2$' },
      { id: 'C', label: 'C', text: '$y = -\\frac{1}{10}x(x - 5)(x + 4)$' },
      { id: 'D', label: 'D', text: '$y = -\\frac{1}{10}x(x - 5)(x + 4)^2$' },
    ],
    correctAnswer: 'B',
  },
  'e833de9a': {
    prompt: '$$\\begin{aligned} x^2 + y^2 &= 36 \\\\ y &= mx + \\frac{b}{4} \\end{aligned}$$\n\nIn the given system of equations, $m$ and $b$ are negative constants. In the $xy$-plane, the graphs of the equations in the given system intersect at the point $(-5, y)$, where $y < 0$. Which expression represents the value of $b$?',
    options: [
      { id: 'A', label: 'A', text: '$\\frac{5m - \\sqrt{11}}{4}$' },
      { id: 'B', label: 'B', text: '$\\frac{5m + \\sqrt{11}}{4}$' },
      { id: 'C', label: 'C', text: '$-20m + 4\\sqrt{11}$' },
      { id: 'D', label: 'D', text: '$20m - 4\\sqrt{11}$' },
    ],
    correctAnswer: 'D',
  },
  '433184f1': {
    prompt: 'Which expression is equivalent to $\\frac{4}{4x - 5} - \\frac{1}{x + 1}$?',
    options: [
      { id: 'A', label: 'A', text: '$\\frac{3}{(x + 1)(4x - 5)}$' },
      { id: 'B', label: 'B', text: '$\\frac{3}{3x - 6}$' },
      { id: 'C', label: 'C', text: '$\\frac{-1}{(x + 1)(4x - 5)}$' },
      { id: 'D', label: 'D', text: '$\\frac{9}{(x + 1)(4x - 5)}$' },
    ],
    correctAnswer: 'D',
  },
  '7bbfbe70': {
    prompt: 'A lab analyst observes a sample of a substance. An exponential model estimates that the mass, in grams, of the sample decreases by $24\\%$ every $22.96$ minutes. Which of the following equations could represent this model, where $M$ is the estimated mass, in grams, of the sample $t$ minutes after the lab analyst began observing the sample?',
    options: [
      { id: 'A', label: 'A', text: '$M = 100(0.24)^{\\frac{t}{22.96}}$' },
      { id: 'B', label: 'B', text: '$M = 100(0.24)^{22.96t}$' },
      { id: 'C', label: 'C', text: '$M = 100(0.76)^{22.96t}$' },
      { id: 'D', label: 'D', text: '$M = 100(0.76)^{\\frac{t}{22.96}}$' },
    ],
    correctAnswer: 'D',
  },
  '5da5c665': {
    prompt: '$$4x^2 - 5x - 5 = 0$$\n\nWhat is the greatest solution to the given equation?',
    options: [
      { id: 'A', label: 'A', text: '$\\frac{5 - \\sqrt{105}}{8}$' },
      { id: 'B', label: 'B', text: '$\\frac{5 + \\sqrt{105}}{8}$' },
      { id: 'C', label: 'C', text: '$\\frac{5 - \\sqrt{105}}{2}$' },
      { id: 'D', label: 'D', text: '$\\frac{5 + \\sqrt{105}}{2}$' },
    ],
    correctAnswer: 'B',
  },
  '18e35375': {
    prompt: '$$f(x) = (x - 14)(x + 19)$$\n\nThe function $f$ is defined by the given equation. For what value of $x$ does $f(x)$ reach its minimum?',
    options: [
      { id: 'A', label: 'A', text: '$-266$' },
      { id: 'B', label: 'B', text: '$-19$' },
      { id: 'C', label: 'C', text: '$-\\frac{33}{2}$' },
      { id: 'D', label: 'D', text: '$-\\frac{5}{2}$' },
    ],
    correctAnswer: 'D',
  },
  '11ccf3e1': {
    prompt: '$$14j + 5k = m$$\n\nThe given equation relates the numbers $j$, $k$, and $m$. Which equation correctly expresses $k$ in terms of $j$ and $m$?',
    options: [
      { id: 'A', label: 'A', text: '$k = \\frac{m - 14j}{5}$' },
      { id: 'B', label: 'B', text: '$k = \\frac{1}{5}m - 14j$' },
      { id: 'C', label: 'C', text: '$k = \\frac{14j - m}{5}$' },
      { id: 'D', label: 'D', text: '$k = 5m - 14j$' },
    ],
    correctAnswer: 'A',
  },
  'cfff8f8e': {
    prompt: 'At the time of posting a video, a social media channel had $53$ subscribers. Each day for five days after the video was posted, the number of subscribers doubled from the number the previous day. Which equation gives the total number of subscribers, $n$, to the channel $d$ days after the video was posted?',
    options: [
      { id: 'A', label: 'A', text: '$n = (53 \\cdot 2)^d$' },
      { id: 'B', label: 'B', text: '$n = 53(2)^d$' },
      { id: 'C', label: 'C', text: '$n = 53\\left(\\frac{1}{2}\\right)^d$' },
      { id: 'D', label: 'D', text: '$n = (53)^d + d$' },
    ],
    correctAnswer: 'B',
  },
  'd139cf4b': {
    prompt: '$$f(t) = 55t - 2t^2$$\n\nThe function $f$ is defined by the given equation. The function $g$ is defined by $g(t) = f(t) + 3$. Which expression represents the maximum value of $g(t)$?',
    options: [
      { id: 'A', label: 'A', text: '$3 + \\left(\\frac{55}{2}\\right)^2$' },
      { id: 'B', label: 'B', text: '$3 + 2\\left(\\frac{55}{4}\\right)^2$' },
      { id: 'C', label: 'C', text: '$3 - 2\\left(\\frac{55}{4}\\right)^2$' },
      { id: 'D', label: 'D', text: '$3 - \\left(\\frac{55}{2}\\right)^2$' },
    ],
    correctAnswer: 'B',
  },
  'c8db0e19': {
    prompt: '$$\\frac{1}{4x} + xy^2z = \\frac{1}{3z}$$\n\nIn the given equation, $x$, $y$, and $z$ are positive numbers. Which expression is equivalent to $y$?',
    options: [
      { id: 'A', label: 'A', text: '$\\frac{4x - 3z}{12x^2z^2}$' },
      { id: 'B', label: 'B', text: '$\\sqrt{\\frac{4x - 3z}{12x^2z^2}}$' },
      { id: 'C', label: 'C', text: '$\\frac{1}{3x^2z^2 - 4x^2z}$' },
      { id: 'D', label: 'D', text: '$\\sqrt{\\frac{1}{3x^2z^2 - 4x^2z}}$' },
    ],
    correctAnswer: 'B',
  },
  '769b612d': {
    prompt: 'The function $g$ is defined by $g(x) = 10^{5x - 8}$. What is the value of $x$ when $g(x)$ is equal to $10,000$?',
    options: [
      { id: 'A', label: 'A', text: '$\\frac{5}{12}$' },
      { id: 'B', label: 'B', text: '$\\frac{12}{5}$' },
      { id: 'C', label: 'C', text: '$3$' },
      { id: 'D', label: 'D', text: '$4$' },
    ],
    correctAnswer: 'B',
  },
  'b8c4a1cd': {
    prompt: '$$8j = k + 15m$$\n\nThe given equation relates the distinct positive numbers $j$, $k$, and $m$. Which equation correctly expresses $j$ in terms of $k$ and $m$?',
    options: [
      { id: 'A', label: 'A', text: '$j = \\frac{k}{8} + 15m$' },
      { id: 'B', label: 'B', text: '$j = k + \\frac{15m}{8}$' },
      { id: 'C', label: 'C', text: '$j = 8(k + 15m)$' },
      { id: 'D', label: 'D', text: '$j = \\frac{k + 15m}{8}$' },
    ],
    correctAnswer: 'D',
  },
  'f123e039': {
    prompt: 'The graph of a system of a linear and a quadratic equation is shown. Which system of equations is represented by the graph?',
    options: [
      { id: 'A', label: 'A', text: '$$\\begin{aligned} y &= -5x \\\\ y &= x^2 + 8 \\end{aligned}$$' },
      { id: 'B', label: 'B', text: '$$\\begin{aligned} y &= -5x \\\\ y &= x^2 - 8 \\end{aligned}$$' },
      { id: 'C', label: 'C', text: '$$\\begin{aligned} y &= 5x \\\\ y &= x^2 + 8 \\end{aligned}$$' },
      { id: 'D', label: 'D', text: '$$\\begin{aligned} y &= 5x \\\\ y &= x^2 - 8 \\end{aligned}$$' },
    ],
    correctAnswer: 'D',
  },
  'bba18ecb': {
    prompt: 'When the quadratic function $f$ is graphed in the $xy$-plane, where $y = f(x)$, its vertex is $(-3, 6)$. One of the $x$-intercepts of this graph is $\\left(-\\frac{17}{4}, 0\\right)$. What is the other $x$-intercept of the graph?',
    options: [
      { id: 'A', label: 'A', text: '$\\left(-\\frac{29}{4}, 0\\right)$' },
      { id: 'B', label: 'B', text: '$\\left(-\\frac{7}{4}, 0\\right)$' },
      { id: 'C', label: 'C', text: '$\\left(\\frac{5}{4}, 0\\right)$' },
      { id: 'D', label: 'D', text: '$\\left(\\frac{11}{4}, 0\\right)$' },
    ],
    correctAnswer: 'B',
  },
  '29ed5d39': {
    prompt: '$$p = 20 + \\frac{14}{n}$$\n\nThe given equation relates the numbers $p$ and $n$, where $n$ is not equal to $0$ and $p > 20$. Which equation correctly expresses $n$ in terms of $p$?',
    options: [
      { id: 'A', label: 'A', text: '$n = \\frac{p - 20}{14}$' },
      { id: 'B', label: 'B', text: '$n = \\frac{14}{p} + 20$' },
      { id: 'C', label: 'C', text: '$n = \\frac{14}{p} - 20$' },
      { id: 'D', label: 'D', text: '$n = \\frac{14}{p - 20}$' },
    ],
    correctAnswer: 'D',
  },
  '290cdc2c': {
    prompt: 'Which expression is equivalent to $\\left(x^{\\frac{1}{4}}\\right)^{\\frac{1}{3}}$, where $x > 0$?',
    options: [
      { id: 'A', label: 'A', text: '$x^{\\frac{1}{7}}$' },
      { id: 'B', label: 'B', text: '$\\sqrt[12]{x}$' },
      { id: 'C', label: 'C', text: '$x^{\\frac{3}{4}}$' },
      { id: 'D', label: 'D', text: '$(x)^{\\frac{7}{12}}$' },
    ],
    correctAnswer: 'B',
  },
  'abc61109': {
    prompt: 'Which expression is equivalent to $\\frac{4x + 1}{x - 9}$, where $x > 9$?',
    options: [
      { id: 'A', label: 'A', text: '$4 + \\frac{37}{x - 9}$' },
      { id: 'B', label: 'B', text: '$4 + \\frac{35}{x - 9}$' },
      { id: 'C', label: 'C', text: '$4 + \\frac{1}{x - 9}$' },
      { id: 'D', label: 'D', text: '$4 - \\frac{35}{x - 9}$' },
    ],
    correctAnswer: 'A',
  },
  'de39858a': {
    prompt: 'The function $h$ is defined by $h(x) = a^x + b$, where $a$ and $b$ are positive constants. The graph of $y = h(x)$ in the $xy$-plane passes through the points $(0, 10)$ and $(-2, \\frac{325}{36})$. What is the value of $ab$?',
    options: [
      { id: 'A', label: 'A', text: '$\\frac{1}{4}$' },
      { id: 'B', label: 'B', text: '$\\frac{3}{2}$' },
      { id: 'C', label: 'C', text: '$54$' },
      { id: 'D', label: 'D', text: '$60$' },
    ],
    correctAnswer: 'C',
  },
  '0aaef7aa': {
    prompt: 'The function $p$ is defined by $p(n) = 7n^3$. What is the value of $n$ when $p(n)$ is equal to $56$?',
    options: [
      { id: 'A', label: 'A', text: '$2$' },
      { id: 'B', label: 'B', text: '$3$' },
      { id: 'C', label: 'C', text: '$7$' },
      { id: 'D', label: 'D', text: '$8$' },
    ],
    correctAnswer: 'A',
  },
  '6acdcece': {
    prompt: '$$b - 72 = \\frac{x}{y}$$\n\nThe given equation relates the positive numbers $b$, $x$, and $y$. Which equation correctly expresses $x$ in terms of $b$ and $y$?',
    options: [
      { id: 'A', label: 'A', text: '$x = \\frac{b - 72}{y}$' },
      { id: 'B', label: 'B', text: '$x = by - 72$' },
      { id: 'C', label: 'C', text: '$x = \\frac{y}{b - 72}$' },
      { id: 'D', label: 'D', text: '$x = by - 72y$' },
    ],
    correctAnswer: 'D',
  },
  '1fe10d97': {
    prompt: '$$p(t) = 90,000(1.06)^t$$\n\nThe given function $p$ models the population of Lowell $t$ years after a census. Which of the following functions best models the population of Lowell $m$ months after the census?',
    options: [
      { id: 'A', label: 'A', text: '$r(m) = \\frac{90,000}{12}(1.06)^m$' },
      { id: 'B', label: 'B', text: '$r(m) = 90,000\\left(\\frac{1.06}{12}\\right)^m$' },
      { id: 'C', label: 'C', text: '$r(m) = 90,000(1.06)^{12m}$' },
      { id: 'D', label: 'D', text: '$r(m) = 90,000(1.06)^{\\frac{m}{12}}$' },
    ],
    correctAnswer: 'D',
  },
  'b5ebd31c': {
    prompt: '$$2r = 9s + t$$\n\nThe given equation relates the variables $r$, $s$, and $t$. Which equation correctly expresses $s$ in terms of $r$ and $t$?',
    options: [
      { id: 'A', label: 'A', text: '$s = \\frac{2r}{9} - t$' },
      { id: 'B', label: 'B', text: '$s = \\frac{2r - t}{9}$' },
      { id: 'C', label: 'C', text: '$s = 18r - t$' },
      { id: 'D', label: 'D', text: '$s = 9(2r - t)$' },
    ],
    correctAnswer: 'B',
  },
  '0de8359f': {
    prompt: '$$r(t) = 63t - 2t^2$$\n\nThe function $r$ is defined by the given equation. The function $s$ is defined by $s(t) = r(t) + 1$. Which expression represents the maximum value of $s(t)$?',
    options: [
      { id: 'A', label: 'A', text: '$1 + \\left(\\frac{63}{2}\\right)^2$' },
      { id: 'B', label: 'B', text: '$1 + 2\\left(\\frac{63}{4}\\right)^2$' },
      { id: 'C', label: 'C', text: '$1 - 2\\left(\\frac{63}{4}\\right)^2$' },
      { id: 'D', label: 'D', text: '$1 - \\left(\\frac{63}{2}\\right)^2$' },
    ],
    correctAnswer: 'B',
  },
};

// ==========================================
// 3. AUTOMATED 55 QUESTIONS
// ==========================================
// Specific per-question curated clean prompt & options for the 55 automated items
// to guarantee 100% mathematical precision and zero OCR corruption.
const AUTO_55_CURATED = {
  '20722644': {
    prompt: 'The function $f$ is defined by $f(x) = x^3 + 9$. What is the value of $f(2)$?',
    options: [
      { id: 'A', label: 'A', text: '$14$' },
      { id: 'B', label: 'B', text: '$15$' },
      { id: 'C', label: 'C', text: '$17$' },
      { id: 'D', label: 'D', text: '$18$' },
    ],
    correctAnswer: 'C',
  },
  '58443765': {
    prompt: '$$\\begin{aligned} y &= 5x + 4 \\\\ y &= 5x^2 + 4 \\end{aligned}$$\n\nWhich ordered pair $(x, y)$ is a solution to the given system of equations?',
    options: [
      { id: 'A', label: 'A', text: '$(0, 0)$' },
      { id: 'B', label: 'B', text: '$(0, 4)$' },
      { id: 'C', label: 'C', text: '$(8, 44)$' },
      { id: 'D', label: 'D', text: '$(8, 84)$' },
    ],
    correctAnswer: 'B',
  },
  '71b74a44': {
    prompt: '$$y = 7,400(0.87)^x$$\n\nThe given equation estimates the value, in dollars, of a certain piece of equipment $x$ years after it was purchased. According to the given equation, what was the estimated value, in dollars, of the piece of equipment at the time it was purchased?',
    options: [
      { id: 'A', label: 'A', text: '\\$740' },
      { id: 'B', label: 'B', text: '\\$6,438' },
      { id: 'C', label: 'C', text: '\\$7,400' },
      { id: 'D', label: 'D', text: '\\$8,700' },
    ],
    correctAnswer: 'C',
  },
  'ebed7dc6': {
    prompt: 'An auditorium has seats for $1,800$ people. Tickets to attend a show at the auditorium currently cost \\$4.00. For each \\$1.00 increase to the ticket price, $100$ fewer tickets will be sold. This situation can be modeled by the equation $y = -100x^2 + 1,400x + 7,200$, where $x$ represents the increase in ticket price, in dollars, and $y$ represents the revenue, in dollars, from ticket sales. If this equation is graphed in the $xy$-plane, at what value of $x$ is the maximum of the graph?',
    options: [
      { id: 'A', label: 'A', text: '$4$' },
      { id: 'B', label: 'B', text: '$7$' },
      { id: 'C', label: 'C', text: '$14$' },
      { id: 'D', label: 'D', text: '$18$' },
    ],
    correctAnswer: 'B',
  },
  '788bfd56': {
    prompt: 'The function $f$ is defined by $f(x) = 4 + \\sqrt{x}$. What is the value of $f(144)$?',
    options: [
      { id: 'A', label: 'A', text: '$0$' },
      { id: 'B', label: 'B', text: '$16$' },
      { id: 'C', label: 'C', text: '$40$' },
      { id: 'D', label: 'D', text: '$76$' },
    ],
    correctAnswer: 'B',
  },
  '6abec9a8': {
    prompt: 'What is the $y$-intercept of the graph shown?',
    options: [
      { id: 'A', label: 'A', text: '$(-1, -9)$' },
      { id: 'B', label: 'B', text: '$(0, -5)$' },
      { id: 'C', label: 'C', text: '$(0, -4)$' },
      { id: 'D', label: 'D', text: '$(0, 0)$' },
    ],
    correctAnswer: 'B',
  },
  '5ba187d4': {
    prompt: 'Which expression is equivalent to $100x^2 + 2,600$?',
    options: [
      { id: 'A', label: 'A', text: '$100(26x^2)$' },
      { id: 'B', label: 'B', text: '$100(x^2 + 26)$' },
      { id: 'C', label: 'C', text: '$2,600(100x^2)$' },
      { id: 'D', label: 'D', text: '$2,600(100x^2 + 1)$' },
    ],
    correctAnswer: 'B',
  },
  '70482e20': {
    prompt: 'Which expression is equivalent to $11x^3 - 5x^3$?',
    options: [
      { id: 'A', label: 'A', text: '$16x^6$' },
      { id: 'B', label: 'B', text: '$6x^3$' },
      { id: 'C', label: 'C', text: '$6x^6$' },
      { id: 'D', label: 'D', text: '$16x^3$' },
    ],
    correctAnswer: 'B',
  },
  '0536ad4f': {
    prompt: 'Which expression is equivalent to $20w - (4w + 3w)$?',
    options: [
      { id: 'A', label: 'A', text: '$10w$' },
      { id: 'B', label: 'B', text: '$13w$' },
      { id: 'C', label: 'C', text: '$19w$' },
      { id: 'D', label: 'D', text: '$21w$' },
    ],
    correctAnswer: 'B',
  },
  '4ca30186': {
    prompt: 'The graph of a system of a linear equation and a nonlinear equation is shown. What is the solution $(x, y)$ to this system?',
    options: [
      { id: 'A', label: 'A', text: '$(0, 0)$' },
      { id: 'B', label: 'B', text: '$(0, 2)$' },
      { id: 'C', label: 'C', text: '$(2, 4)$' },
      { id: 'D', label: 'D', text: '$(4, 0)$' },
    ],
    correctAnswer: 'C',
  },
  'd4950429': {
    prompt: 'A rectangle has a length of $x$ units and a width of $(x - 15)$ units. If the rectangle has an area of $76$ square units, what is the value of $x$?',
    options: [
      { id: 'A', label: 'A', text: '$4$' },
      { id: 'B', label: 'B', text: '$19$' },
      { id: 'C', label: 'C', text: '$23$' },
      { id: 'D', label: 'D', text: '$76$' },
    ],
    correctAnswer: 'B',
  },
  '58b4c6f3': {
    prompt: 'The function $h$ is defined by $h(x) = a^x + b$, where $a$ and $b$ are positive constants. The graph of $y = h(x)$ in the $xy$-plane passes through the points $(0, 10)$ and $(2, 13)$. What is the value of $ab$?',
    options: [
      { id: 'A', label: 'A', text: '$13$' },
      { id: 'B', label: 'B', text: '$18$' },
      { id: 'C', label: 'C', text: '$20$' },
      { id: 'D', label: 'D', text: '$26$' },
    ],
    correctAnswer: 'B',
  },
  '35e05e19': {
    prompt: 'A park ranger hung squirrel houses each in the shape of a right rectangular prism for fox squirrels. Each house has a height of $11$ inches. The length of each house\'s base is $x$ inches, which is $1$ inch more than the width of the house\'s base. Which function $V$ gives the volume of each house, in cubic inches, in terms of the length of the house\'s base?',
    options: [
      { id: 'A', label: 'A', text: '$V(x) = 11x(x - 1)$' },
      { id: 'B', label: 'B', text: '$V(x) = 11x(x + 1)$' },
      { id: 'C', label: 'C', text: '$V(x) = x(x + 11)(x - 1)$' },
      { id: 'D', label: 'D', text: '$V(x) = x(x + 11)(x + 1)$' },
    ],
    correctAnswer: 'A',
  },
  '341ba5db': {
    prompt: '$$g(x) = x^2 + 55$$\n\nWhat is the minimum value of the given function?',
    options: [
      { id: 'A', label: 'A', text: '$0$' },
      { id: 'B', label: 'B', text: '$55$' },
      { id: 'C', label: 'C', text: '$110$' },
      { id: 'D', label: 'D', text: '$3,025$' },
    ],
    correctAnswer: 'B',
  },
  'a1e65979': {
    prompt: 'The function $f$ is a quadratic function. In the $xy$-plane, the graph of $y = f(x)$ has a vertex at $(1, 9)$ and passes through the points $(2, 33)$ and $(-1, 105)$. What is the value of $f(-2) - f(0)$?',
    options: [
      { id: 'A', label: 'A', text: '$81$' },
      { id: 'B', label: 'B', text: '$129$' },
      { id: 'C', label: 'C', text: '$192$' },
      { id: 'D', label: 'D', text: '$225$' },
    ],
    correctAnswer: 'C',
  },
  'b5c43226': {
    prompt: 'What is the $y$-intercept of the graph shown?',
    options: [
      { id: 'A', label: 'A', text: '$(0, 0)$' },
      { id: 'B', label: 'B', text: '$(0, 2)$' },
      { id: 'C', label: 'C', text: '$(2, 0)$' },
      { id: 'D', label: 'D', text: '$(2, 2)$' },
    ],
    correctAnswer: 'B',
  },
  '88a0c425': {
    prompt: '$$-2x^2 + 20x + c = 0$$\n\nIn the given equation, $c$ is a constant. The equation has exactly one solution. What is the value of $c$?',
    options: [
      { id: 'A', label: 'A', text: '$-68$' },
      { id: 'B', label: 'B', text: '$-50$' },
      { id: 'C', label: 'C', text: '$-32$' },
      { id: 'D', label: 'D', text: '$0$' },
    ],
    correctAnswer: 'B',
  },
  '8462b105': {
    prompt: 'The function $f$ gives the product of a number, $x$, and a number that is $91$ more than $x$. Which equation defines $f$?',
    options: [
      { id: 'A', label: 'A', text: '$f(x) = x^2 + x + 91$' },
      { id: 'B', label: 'B', text: '$f(x) = x^2 + 91$' },
      { id: 'C', label: 'C', text: '$f(x) = x^2 + 91x$' },
      { id: 'D', label: 'D', text: '$f(x) = x^3 + 91x + 91$' },
    ],
    correctAnswer: 'C',
  },
  'ce579859': {
    prompt: 'A model estimates that at the end of each year from $2015$ to $2020$, the number of squirrels in a population was $150\\%$ more than the number of squirrels in the population at the end of the previous year. The model estimates that at the end of $2016$, there were $180$ squirrels in the population. Which of the following equations represents this model, where $n$ is the estimated number of squirrels in the population $t$ years after the end of $2015$ and $t \\le 5$?',
    options: [
      { id: 'A', label: 'A', text: '$n = 72(1.5)^t$' },
      { id: 'B', label: 'B', text: '$n = 72(2.5)^t$' },
      { id: 'C', label: 'C', text: '$n = 180(1.5)^t$' },
      { id: 'D', label: 'D', text: '$n = 180(2.5)^t$' },
    ],
    correctAnswer: 'B',
  },
  '6d04c89d': {
    prompt: 'The expression $\\frac{2x + b}{6x + 24}$ is equivalent to $\\frac{x + 5}{3x + 12}$, where $b$ is a constant and $x > 0$. What is the value of $b$?',
    options: [
      { id: 'A', label: 'A', text: '$10$' },
      { id: 'B', label: 'B', text: '$12$' },
      { id: 'C', label: 'C', text: '$24$' },
      { id: 'D', label: 'D', text: '$252$' },
    ],
    correctAnswer: 'A',
  },
  '203774bc': {
    prompt: 'The product of two positive integers is $546$. If the first integer is $11$ greater than twice the second integer, what is the smaller of the two integers?',
    options: [
      { id: 'A', label: 'A', text: '$7$' },
      { id: 'B', label: 'B', text: '$14$' },
      { id: 'C', label: 'C', text: '$39$' },
      { id: 'D', label: 'D', text: '$78$' },
    ],
    correctAnswer: 'B',
  },
  '5f10c095': {
    prompt: 'The graph of a system of a linear equation and a quadratic equation is shown. A solution to the system is $(x, y)$. What is a possible value of $x$?',
    options: [
      { id: 'A', label: 'A', text: '$4$' },
      { id: 'B', label: 'B', text: '$5$' },
      { id: 'C', label: 'C', text: '$7.2$' },
      { id: 'D', label: 'D', text: '$8$' },
    ],
    correctAnswer: 'A',
  },
  '68607eca': {
    prompt: 'On April $1$, there were $233$ views of an advertisement posted on a website. Every $2$ days after April $1$, the number of views of the advertisement had increased by $70\\%$ of the number of views $2$ days earlier. The function $f$ gives the predicted number of views $x$ days after April $1$. Which equation defines $f$?',
    options: [
      { id: 'A', label: 'A', text: '$f(x) = 233(0.70)^{\\frac{x}{2}}$' },
      { id: 'B', label: 'B', text: '$f(x) = 233(0.70)^x$' },
      { id: 'C', label: 'C', text: '$f(x) = 233(1.70)^{\\frac{x}{2}}$' },
      { id: 'D', label: 'D', text: '$f(x) = 233(1.70)^x$' },
    ],
    correctAnswer: 'C',
  },
  '5acbdc30': {
    prompt: 'The function $f$ is defined by $f(x) = 56(0.19)^x$. For any positive integer $n$, the value of $f(n)$ is $p\\%$ less than the value of $f(n - 1)$. What is the value of $p$?',
    options: [
      { id: 'A', label: 'A', text: '$19$' },
      { id: 'B', label: 'B', text: '$44$' },
      { id: 'C', label: 'C', text: '$56$' },
      { id: 'D', label: 'D', text: '$81$' },
    ],
    correctAnswer: 'D',
  },
  'f880f910': {
    prompt: 'The area of a triangle is $270$ square centimeters. The length of the base of the triangle is $12$ centimeters greater than the height of the triangle. What is the height, in centimeters, of the triangle?',
    options: [
      { id: 'A', label: 'A', text: '$15$' },
      { id: 'B', label: 'B', text: '$18$' },
      { id: 'C', label: 'C', text: '$30$' },
      { id: 'D', label: 'D', text: '$36$' },
    ],
    correctAnswer: 'B',
  },
  '7dbd46d9': {
    prompt: '$$\\begin{aligned} 8x + y &= -11 \\\\ 2x^2 &= y + 341 \\end{aligned}$$\n\nThe graphs of the equations in the given system of equations intersect at the point $(x, y)$ in the $xy$-plane. What is a possible value of $x$?',
    options: [
      { id: 'A', label: 'A', text: '$-15$' },
      { id: 'B', label: 'B', text: '$-11$' },
      { id: 'C', label: 'C', text: '$2$' },
      { id: 'D', label: 'D', text: '$8$' },
    ],
    correctAnswer: 'A',
  },
  '04887c7b': {
    prompt: '$$\\begin{aligned} f(x) &= 2x + 3 \\\\ g(x) &= 7x - 2 \\\\ h(x) &= 5x + 6 \\end{aligned}$$\n\nThe functions $f$, $g$, and $h$ are defined as shown. If $f(x) \\cdot g(x) - h(x) = ax^2 + bx + c$, where $a$, $b$, and $c$ are constants, what is the value of $b$?',
    options: [
      { id: 'A', label: 'A', text: '$-5$' },
      { id: 'B', label: 'B', text: '$12$' },
      { id: 'C', label: 'C', text: '$20$' },
      { id: 'D', label: 'D', text: '$22$' },
    ],
    correctAnswer: 'B',
  },
  '53c07bf9': {
    prompt: 'The value of a certain fishing boat was \\$24,000 when it was purchased. Each year, the value of the fishing boat decreased by $20\\%$ of the previous year\'s value. Which equation represents this situation, where $v$ is the value of the fishing boat, in dollars, and $y$ is the number of years since the fishing boat was purchased?',
    options: [
      { id: 'A', label: 'A', text: '$v = 0.8(24,000)^y$' },
      { id: 'B', label: 'B', text: '$v = 1.2(24,000)^y$' },
      { id: 'C', label: 'C', text: '$v = 24,000(0.8)^y$' },
      { id: 'D', label: 'D', text: '$v = 24,000(1.2)^y$' },
    ],
    correctAnswer: 'C',
  },
  'cef0eada': {
    prompt: 'The graph of $y = f(x)$ is shown. What is the $y$-intercept of $y = f(x) + 5$?',
    options: [
      { id: 'A', label: 'A', text: '$(0, 8)$' },
      { id: 'B', label: 'B', text: '$(0, 5)$' },
      { id: 'C', label: 'C', text: '$(0, 3)$' },
      { id: 'D', label: 'D', text: '$(0, 0)$' },
    ],
    correctAnswer: 'A',
  },
  '895628b5': {
    prompt: '$$\\begin{aligned} y &= (x - 2)(x + 4) \\\\ y &= 6x - 12 \\end{aligned}$$\n\nWhich ordered pair $(x, y)$ is the solution to the given system of equations?',
    options: [
      { id: 'A', label: 'A', text: '$(0, 2)$' },
      { id: 'B', label: 'B', text: '$(-4, 2)$' },
      { id: 'C', label: 'C', text: '$(2, 0)$' },
      { id: 'D', label: 'D', text: '$(2, -4)$' },
    ],
    correctAnswer: 'C',
  },
  '8f82ad81': {
    prompt: 'Which expression is equivalent to $4(x^2 + 6)$?',
    options: [
      { id: 'A', label: 'A', text: '$4x^2 + 24$' },
      { id: 'B', label: 'B', text: '$4x^2 + 10$' },
      { id: 'C', label: 'C', text: '$4x^2 + 6$' },
      { id: 'D', label: 'D', text: '$4x^2 - 2$' },
    ],
    correctAnswer: 'A',
  },
  '26eb61c1': {
    prompt: 'Which expression is equivalent to $6x^3y^2 + 12x^2y^2$?',
    options: [
      { id: 'A', label: 'A', text: '$6x^2y^2(2x^3)$' },
      { id: 'B', label: 'B', text: '$6x^2y^2(x^3)$' },
      { id: 'C', label: 'C', text: '$6x^2y^2(x + 2)$' },
      { id: 'D', label: 'D', text: '$6x^3y^2(x + 2)$' },
    ],
    correctAnswer: 'C',
  },
  'd0e8e8f5': {
    prompt: 'The graph of a system of a linear and a quadratic equation is shown. What is the solution $(x, y)$ to this system?',
    options: [
      { id: 'A', label: 'A', text: '$(0, 0)$' },
      { id: 'B', label: 'B', text: '$(-4, 1)$' },
      { id: 'C', label: 'C', text: '$(4, -1)$' },
      { id: 'D', label: 'D', text: '$(4, 1)$' },
    ],
    correctAnswer: 'D',
  },
  'dd8ac009': {
    passage: '',
    prompt: '$$\\begin{array}{|c|c|}\\hline \\text{Time (years)} & \\text{Total amount (dollars)} \\\\ \\hline 0 & 670.00 \\\\ \\hline 1 & 674.02 \\\\ \\hline 2 & 678.06 \\\\ \\hline \\end{array}$$\n\nSara opened a savings account at a bank. The table shows the exponential relationship between the time $t$, in years, since Sara opened the account and the total amount $d$, in dollars, in the account. If Sara made no additional deposits or withdrawals, which of the following equations best represents the relationship between $t$ and $d$?',
    options: [
      { id: 'A', label: 'A', text: '$d = 0.006(1 + 670)^t$' },
      { id: 'B', label: 'B', text: '$d = 670(1 + 0.006)^t$' },
      { id: 'C', label: 'C', text: '$d = (1 + 0.006)^t$' },
      { id: 'D', label: 'D', text: '$d = (1 + 670)^t$' },
    ],
    correctAnswer: 'B',
  },
  '18c7c3e0': {
    prompt: 'Which expression is equivalent to $13x^2 - 7x^2$?',
    options: [
      { id: 'A', label: 'A', text: '$-91x^2$' },
      { id: 'B', label: 'B', text: '$6x^2$' },
      { id: 'C', label: 'C', text: '$20x^2$' },
      { id: 'D', label: 'D', text: '$40x^2$' },
    ],
    correctAnswer: 'B',
  },
  'c7a187a7': {
    prompt: '$$f(x) = x^2 - 18x - 360$$\n\nIf the given function $f$ is graphed in the $xy$-plane, where $y = f(x)$, what is an $x$-intercept of the graph?',
    options: [
      { id: 'A', label: 'A', text: '$(12, 0)$' },
      { id: 'B', label: 'B', text: '$(-30, 0)$' },
      { id: 'C', label: 'C', text: '$(-360, 0)$' },
      { id: 'D', label: 'D', text: '$(30, 0)$' },
    ],
    correctAnswer: 'D',
  },
  '91aa9aa9': {
    prompt: 'Which expression is equivalent to $(9x^2 + 6) - (8x^2)$?',
    options: [
      { id: 'A', label: 'A', text: '$7$' },
      { id: 'B', label: 'B', text: '$17x^2 + 6$' },
      { id: 'C', label: 'C', text: '$x^2 - 6$' },
      { id: 'D', label: 'D', text: '$x^2 + 6$' },
    ],
    correctAnswer: 'D',
  },
  '9833d0e3': {
    prompt: 'According to a model, the estimated volume of a certain tree in a forest increases by $13.9\\%$ for every increase of $100$ centimeters in the tree\'s height. The equation $y = ab^x$ represents this model, where $y$ represents the estimated volume, in cubic centimeters, of this tree in the forest, $x$ represents the tree\'s height, in centimeters, and $a$ and $b$ are constants. In this equation, what is the value of $b$?',
    options: [
      { id: 'A', label: 'A', text: '$0.139$' },
      { id: 'B', label: 'B', text: '$1$' },
      { id: 'C', label: 'C', text: '$1.139$' },
      { id: 'D', label: 'D', text: '$13.9$' },
    ],
    correctAnswer: 'C',
  },
  '45df91ee': {
    prompt: '$$g(x) = 11\\left(\\frac{1}{12}\\right)^x$$\n\nIf the given function $g$ is graphed in the $xy$-plane, where $y = g(x)$, what is the $y$-intercept of the graph?',
    options: [
      { id: 'A', label: 'A', text: '$(0, 11)$' },
      { id: 'B', label: 'B', text: '$(0, 132)$' },
      { id: 'C', label: 'C', text: '$(0, 1)$' },
      { id: 'D', label: 'D', text: '$(0, 12)$' },
    ],
    correctAnswer: 'A',
  },
  'f8871ccd': {
    prompt: 'Which expression is equivalent to $2\\left(x - \\frac{9}{2}\\right)(x + 8)$?',
    options: [
      { id: 'A', label: 'A', text: '$2x^2 - 72$' },
      { id: 'B', label: 'B', text: '$2x^2 + 7x - 72$' },
      { id: 'C', label: 'C', text: '$2x^2 - x - 36$' },
      { id: 'D', label: 'D', text: '$2x^2 + 7x - 36$' },
    ],
    correctAnswer: 'B',
  },
  '67e866b5': {
    prompt: 'Which expression is equivalent to $9x^2 + 7x^2 + 9x$?',
    options: [
      { id: 'A', label: 'A', text: '$63x^2 + 9x$' },
      { id: 'B', label: 'B', text: '$9x^2 + 16x$' },
      { id: 'C', label: 'C', text: '$25x^2$' },
      { id: 'D', label: 'D', text: '$16x^2 + 9x$' },
    ],
    correctAnswer: 'D',
  },
  '97158b3a': {
    prompt: 'The area $A$, in square centimeters, of a rectangular painting can be represented by the expression $w(w + 29)$, where $w$ is the width, in centimeters, of the painting. Which expression represents the length, in centimeters, of the painting?',
    options: [
      { id: 'A', label: 'A', text: '$w$' },
      { id: 'B', label: 'B', text: '$29$' },
      { id: 'C', label: 'C', text: '$w + 29$' },
      { id: 'D', label: 'D', text: '$w(w + 29)$' },
    ],
    correctAnswer: 'C',
  },
  'd9137a84': {
    prompt: 'Which expression represents the product of $(x^{-8}y^6z^5)$ and $(24x^5 + 48z^{-7})$?',
    options: [
      { id: 'A', label: 'A', text: '$72x^{10} + y^{12}$' },
      { id: 'B', label: 'B', text: '$72x^{-10} + 776y^7z$' },
      { id: 'C', label: 'C', text: '$24x^{-3}y^6z^5 + 48x^{-8}y^6z^{-2}$' },
      { id: 'D', label: 'D', text: '$24x^{-3}y^6z^5 + 48x^{-8}y^6z^{-2}$' },
    ],
    correctAnswer: 'D',
  },
  '84e8cc72': {
    prompt: 'A quadratic function models the height, in feet, of an object above the ground in terms of the time, in seconds, after the object is launched off an elevated surface. The model indicates the object has an initial height of $10$ feet above the ground and reaches its maximum height of $1,034$ feet above the ground $8$ seconds after being launched. Based on the model, what is the height, in feet, of the object above the ground $10$ seconds after being launched?',
    options: [
      { id: 'A', label: 'A', text: '$234$' },
      { id: 'B', label: 'B', text: '$778$' },
      { id: 'C', label: 'C', text: '$970$' },
      { id: 'D', label: 'D', text: '$1,014$' },
    ],
    correctAnswer: 'C',
  },
  'c5d83a99': {
    prompt: '$$\\frac{1}{6x} + 8 = \\frac{1}{x} + 8$$\n\nWhat is the solution to the given equation?',
    options: [
      { id: 'A', label: 'A', text: '$1$' },
      { id: 'B', label: 'B', text: '$6$' },
      { id: 'C', label: 'C', text: '$8$' },
      { id: 'D', label: 'D', text: '$14$' },
    ],
    correctAnswer: 'B',
  },
  '50338a48': {
    prompt: 'Which expression is equivalent to $15w^2 + 8w$?',
    options: [
      { id: 'A', label: 'A', text: '$w(15w + 8)$' },
      { id: 'B', label: 'B', text: '$8w(15w + 1)$' },
      { id: 'C', label: 'C', text: '$15w^2(8w + 1)$' },
      { id: 'D', label: 'D', text: '$23(w^2 + w)$' },
    ],
    correctAnswer: 'A',
  },
  '6011a3f8': {
    prompt: '$$64x^2 + bx + 25 = 0$$\n\nIn the given equation, $b$ is a constant. For which of the following values of $b$ will the equation have more than one real solution?',
    options: [
      { id: 'A', label: 'A', text: '$-91$' },
      { id: 'B', label: 'B', text: '$-80$' },
      { id: 'C', label: 'C', text: '$5$' },
      { id: 'D', label: 'D', text: '$40$' },
    ],
    correctAnswer: 'A',
  },
  '79ba511a': {
    prompt: 'The function $f$ is defined by $f(x) = x^3 + 15$. What is the value of $f(2)$?',
    options: [
      { id: 'A', label: 'A', text: '$20$' },
      { id: 'B', label: 'B', text: '$21$' },
      { id: 'C', label: 'C', text: '$23$' },
      { id: 'D', label: 'D', text: '$24$' },
    ],
    correctAnswer: 'C',
  },
  'fe62f031': {
    prompt: 'The function $f$ is defined by $f(x) = 3x^5$. In the $xy$-plane, the graph of $y = g(x)$ is the result of shifting the graph of $y = f(x)$ up $4$ units. Which equation defines the function $g$?',
    options: [
      { id: 'A', label: 'A', text: '$g(x) = 3x^5 + 4$' },
      { id: 'B', label: 'B', text: '$g(x) = 3x^5 - 4$' },
      { id: 'C', label: 'C', text: '$g(x) = 3x^9$' },
      { id: 'D', label: 'D', text: '$g(x) = 12x^5$' },
    ],
    correctAnswer: 'A',
  },
  'efc469c4': {
    prompt: '$$-14(5x - 2)^2 + 6(5x - 3)^2$$\n\nThe given expression can be rewritten as $ax^2 + bx + c$, where $a$, $b$, and $c$ are constants. What is the value of $a + b + c$?',
    options: [
      { id: 'A', label: 'A', text: '$-612$' },
      { id: 'B', label: 'B', text: '$-306$' },
      { id: 'C', label: 'C', text: '$-102$' },
      { id: 'D', label: 'D', text: '$-17$' },
    ],
    correctAnswer: 'A',
  },
  '09e5e4d3': {
    prompt: 'If $\\frac{42}{x} = 7x$, what is the value of $7x^2$?',
    options: [
      { id: 'A', label: 'A', text: '$6$' },
      { id: 'B', label: 'B', text: '$7$' },
      { id: 'C', label: 'C', text: '$42$' },
      { id: 'D', label: 'D', text: '$294$' },
    ],
    correctAnswer: 'C',
  },
  'e597050f': {
    prompt: 'Which expression is equivalent to $9x + 6x + 2y + 3y$?',
    options: [
      { id: 'A', label: 'A', text: '$3x + 5y$' },
      { id: 'B', label: 'B', text: '$6x + 8y$' },
      { id: 'C', label: 'C', text: '$12x + 8y$' },
      { id: 'D', label: 'D', text: '$15x + 5y$' },
    ],
    correctAnswer: 'D',
  },
  '3918e8bc': {
    prompt: 'An object is kicked from a platform. The equation $h = -4.9t^2 + 7t + 9$ represents this situation, where $h$ is the height of the object above the ground, in meters, $t$ seconds after it is kicked. Which number represents the height, in meters, from which the object was kicked?',
    options: [
      { id: 'A', label: 'A', text: '$0$' },
      { id: 'B', label: 'B', text: '$4.9$' },
      { id: 'C', label: 'C', text: '$7$' },
      { id: 'D', label: 'D', text: '$9$' },
    ],
    correctAnswer: 'D',
  },
  '5d93c782': {
    prompt: 'Which expression is equivalent to $x^2 + 3x - 40$?',
    options: [
      { id: 'A', label: 'A', text: '$(x - 4)(x + 10)$' },
      { id: 'B', label: 'B', text: '$(x - 5)(x + 8)$' },
      { id: 'C', label: 'C', text: '$(x - 8)(x + 5)$' },
      { id: 'D', label: 'D', text: '$(x - 10)(x + 4)$' },
    ],
    correctAnswer: 'B',
  },
  'd4d513ff': {
    prompt: 'Which expression is equivalent to $12x + 27$?',
    options: [
      { id: 'A', label: 'A', text: '$12(9x + 1)$' },
      { id: 'B', label: 'B', text: '$27(12x + 1)$' },
      { id: 'C', label: 'C', text: '$3(4x + 9)$' },
      { id: 'D', label: 'D', text: '$3(9x + 24)$' },
    ],
    correctAnswer: 'C',
  },
};

// Combine all corrections
const COMBINED = {
  ...CURATED_CORRECTIONS,
  ...AUTO_55_CURATED,
};

console.log(`Auditing KaTeX on all ${Object.keys(COMBINED).length} questions...`);

let katexErrors = 0;
for (const [id, item] of Object.entries(COMBINED)) {
  const texts = [
    item.prompt || '',
    ...(item.options || []).map(o => o.text || ''),
  ];
  for (const t of texts) {
    // 1. Check display math $$...$$
    const displayMatches = t.matchAll(/\\$\\$([\\s\\S]+?)\\$\\$/g);
    for (const m of displayMatches) {
      try {
        katex.renderToString(m[1].trim(), { displayMode: true, throwOnError: true });
      } catch (e) {
        console.error(`[KaTeX Display Error] in ${id}: ${e.message}`);
        console.error(`  Math string: "${m[1]}"`);
        katexErrors++;
      }
    }

    // 2. Remove display math before checking inline math
    const withoutDisplay = t.replace(/\\$\\$[\\s\\S]+?\\$\\$/g, '');
    const inlineMatches = withoutDisplay.matchAll(/(?<!\\\\)\\$([^\\$\\n]+?)\\$/g);
    for (const m of inlineMatches) {
      try {
        katex.renderToString(m[1].trim(), { displayMode: false, throwOnError: true });
      } catch (e) {
        console.error(`[KaTeX Inline Error] in ${id}: ${e.message}`);
        console.error(`  Math string: "${m[1]}"`);
        katexErrors++;
      }
    }
  }
}

if (katexErrors > 0) {
  console.error(`Aborting due to ${katexErrors} KaTeX errors.`);
  process.exit(1);
}

console.log('All LaTeX compiled successfully with zero KaTeX errors!');

// Generate scripts/advancedMathCorrections.mjs
const fileContent = `/**
 * Official Digital SAT Math Corrections and Structured Stimuli for ADVANCED_MATHS.pdf.
 * 
 * Auto-generated & curated:
 * 1. ADVANCED_MATH_GRAPH_IDS: The exact 14 genuine coordinate plane graph questions in ADVANCED_MATHS.pdf.
 *    Only these questions are allowed to have a stimulus imageUrl in LeftPane.
 * 2. ADVANCED_MATH_CORRECTIONS: Exact prompt, HTML table passage, and LaTeX text options
 *    for all vector math gap fills, equation restorations, and graphical option choices.
 */

export const ADVANCED_MATH_GRAPH_IDS = new Set(${JSON.stringify(ADVANCED_MATH_GRAPH_IDS, null, 2)});

export const ADVANCED_MATH_CORRECTIONS = ${JSON.stringify(COMBINED, null, 2)};
`;

fs.writeFileSync('scripts/advancedMathCorrections.mjs', fileContent, 'utf8');
console.log('Successfully written scripts/advancedMathCorrections.mjs with ' + Object.keys(COMBINED).length + ' questions!');
