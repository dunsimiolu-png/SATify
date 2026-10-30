/**
 * Official Digital SAT Math Corrections and Structured Table Stimuli for ALGEBRA.pdf.
 * 
 * Auto-generated & curated:
 * 1. ALGEBRA_GRAPH_IDS: The exact 24 genuine coordinate plane graph questions in ALGEBRA.pdf.
 *    Only these questions are allowed to have a stimulus imageUrl in LeftPane.
 * 2. ALGEBRA_CORRECTIONS: Exact prompt, HTML table passage, and LaTeX text options
 *    for all table questions, vector math gap fills, and graphical option choices.
 */

export const ALGEBRA_GRAPH_IDS = new Set([
  "3f5375d9",
  "e1259a5a",
  "c362c210",
  "11e1ab81",
  "2704399f",
  "8a1544f1",
  "9b7a1b67",
  "b0fc3166",
  "9b0a4eae",
  "b2845d88",
  "5cf1bbc9",
  "8eb0e19e",
  "05bb1af9",
  "c307283c",
  "18ac8354",
  "4acd05cd",
  "6d8ad460",
  "c4ea43ef",
  "080e75c2",
  "eeebe166",
  "f0773a55",
  "f40552a9",
  "00b9bd37",
  "0ea7ef01"
]);

export const ALGEBRA_CORRECTIONS = {
  "39617468": {
    "prompt": "$$x + y = 350$$\n\nThe given equation relates the total number of maple trees, $x$, and the total number of birch trees, $y$, planted in a 14-acre forest preserve. If $245$ maple trees were planted in the forest preserve, how many birch trees were planted in the forest preserve?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$14$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$25$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$105$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$245$"
      }
    ],
    "correctAnswer": "C"
  },
  "49800634": {
    "passage": "<div class=\"sat-table-container\">\n  <table class=\"sat-table\">\n    <thead>\n      <tr><th>$x$</th><th>$y$</th></tr>\n    </thead>\n    <tbody>\n      <tr><td>$-14$</td><td>$-172$</td></tr>\n      <tr><td>$2$</td><td>$20$</td></tr>\n    </tbody>\n  </table>\n</div>",
    "prompt": "The table shows two values of $x$ and their corresponding values of $y$. In the $xy$-plane, the graph of the linear equation representing this relationship passes through the point $(4, a)$. What is the value of $a$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$-11$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$-\\frac{4}{11}$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$\\frac{4}{7}$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$44$"
      }
    ],
    "correctAnswer": "D"
  },
  "65833256": {
    "prompt": "$$\\begin{aligned} y &= 6x + 16 \\\\ -7x - y &= 36 \\end{aligned}$$\n\nWhat is the solution $(x, y)$ to the given system of equations?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$(-4, -8)$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$(-\\frac{20}{7}, -\\frac{80}{7})$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$(4, 40)$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$(20, 136)$"
      }
    ],
    "correctAnswer": "A"
  },
  "87071893": {
    "prompt": "What value of $x$ is the solution to the given equation $x + 40 = 95$?",
    "correctAnswer": "55",
    "questionType": "spr",
    "options": []
  },
  "c039b198": {
    "prompt": "A computer company pays customers for trading in old computers. The payment $p$, in dollars, is the original retail price of a computer minus \\$1 for each year since the computer was released. Which equation represents this situation for a computer with an original retail price of \\$1 when it was released $t$ years ago, where $t$ is a whole number and $1 \\le t \\le 4$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$p = 150 - 690t$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$p = 690 - 150t$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$t = 150 - 690p$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$t = 690 - 150p$"
      }
    ],
    "correctAnswer": "B"
  },
  "d4572f55": {
    "passage": "<div class=\"sat-table-container\">\n  <table class=\"sat-table\">\n    <thead>\n      <tr><th>$x$</th><th>$y$</th></tr>\n    </thead>\n    <tbody>\n      <tr><td>$-34$</td><td>$t$</td></tr>\n      <tr><td>$-17$</td><td>$t + 23$</td></tr>\n      <tr><td>$0$</td><td>$t + 46$</td></tr>\n    </tbody>\n  </table>\n</div>",
    "prompt": "For a linear relationship between $x$ and $y$, the table gives three values of $x$ and their corresponding values of $y$, where $t$ is a constant. Which equation represents this relationship?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$y = -2x + t + 23$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$y = 2x + t + 23$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$y = -\\frac{23}{17}x + t + 46$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$y = \\frac{23}{17}x + t + 46$"
      }
    ],
    "correctAnswer": "D"
  },
  "3008cfc3": {
    "passage": "<div class=\"sat-table-container\">\n  <table class=\"sat-table\">\n    <thead>\n      <tr><th>$x$</th><th>$y$</th></tr>\n    </thead>\n    <tbody>\n      <tr><td>$k$</td><td>$13$</td></tr>\n      <tr><td>$k + 7$</td><td>$-15$</td></tr>\n    </tbody>\n  </table>\n</div>",
    "prompt": "The table gives the coordinates of two points on a line in the $xy$-plane. The $y$-intercept of the line is $(k - 5, b)$, where $k$ and $b$ are constants. What is the value of $b$?",
    "correctAnswer": "33",
    "questionType": "spr",
    "options": []
  },
  "9bbce683": {
    "passage": "<div class=\"sat-table-container\">\n  <table class=\"sat-table\">\n    <thead>\n      <tr><th>$x$</th><th>$y$</th></tr>\n    </thead>\n    <tbody>\n      <tr><td>$18$</td><td>$130$</td></tr>\n      <tr><td>$23$</td><td>$160$</td></tr>\n      <tr><td>$26$</td><td>$178$</td></tr>\n    </tbody>\n  </table>\n</div>",
    "prompt": "For line $h$, the table shows three values of $x$ and their corresponding values of $y$. Line $k$ is the result of translating line $h$ down $5$ units in the $xy$-plane. What is the $x$-intercept of line $k$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$(-\\frac{26}{3}, 0)$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$(-\\frac{9}{2}, 0)$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$(-\\frac{11}{3}, 0)$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$(-\\frac{17}{6}, 0)$"
      }
    ],
    "correctAnswer": "D"
  },
  "e25f0807": {
    "passage": "<div class=\"sat-table-container\">\n  <table class=\"sat-table\">\n    <thead>\n      <tr><th>$x$</th><th>$y$</th></tr>\n    </thead>\n    <tbody>\n      <tr><td>$-12$</td><td>$-45$</td></tr>\n      <tr><td>$6$</td><td>$45$</td></tr>\n    </tbody>\n  </table>\n</div>",
    "prompt": "The table shows two values of $x$ and their corresponding values of $y$. The graph of the linear equation representing this relationship passes through the point $(\\frac{1}{4}, a)$. What is the value of $a$?",
    "correctAnswer": "65/4",
    "acceptedAnswers": [
      "65/4",
      "16.25",
      "16.250",
      ".25"
    ],
    "questionType": "spr",
    "options": []
  },
  "12983c1e": {
    "passage": "<div class=\"sat-table-container\">\n  <table class=\"sat-table\">\n    <thead>\n      <tr><th>$x$</th><th>$f(x)$</th></tr>\n    </thead>\n    <tbody>\n      <tr><td>$1$</td><td>$5$</td></tr>\n      <tr><td>$3$</td><td>$13$</td></tr>\n      <tr><td>$5$</td><td>$21$</td></tr>\n    </tbody>\n  </table>\n</div>",
    "prompt": "Some values of the linear function $f$ are shown in the table above. Which of the following defines $f$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$f(x) = 2x + 3$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$f(x) = 3x + 2$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$f(x) = 4x + 1$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$f(x) = 5x$"
      }
    ],
    "correctAnswer": "C"
  },
  "50f4cb9c": {
    "passage": "<div class=\"sat-table-container\">\n  <table class=\"sat-table\">\n    <thead>\n      <tr><th>$x$</th><th>$f(x)$</th></tr>\n    </thead>\n    <tbody>\n      <tr><td>$0$</td><td>$-128$</td></tr>\n      <tr><td>$1$</td><td>$-64$</td></tr>\n      <tr><td>$2$</td><td>$0$</td></tr>\n    </tbody>\n  </table>\n</div>",
    "prompt": "For the linear function $f$, the table shows three values of $x$ and their corresponding values of $f(x)$. Function $f$ is defined by $f(x) = ax + b$, where $a$ and $b$ are constants. What is the value of $a - b$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$-64$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$62$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$128$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$192$"
      }
    ],
    "correctAnswer": "D"
  },
  "83f2c3bf": {
    "prompt": "Which table gives three values of $x$ and their corresponding values of $y$ for the given equation $y = x + 4$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 4 \\\\ \\hline 1 & 5 \\\\ \\hline 2 & 6 \\\\ \\hline \\end{array}$$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 6 \\\\ \\hline 1 & 5 \\\\ \\hline 2 & 4 \\\\ \\hline \\end{array}$$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 2 \\\\ \\hline 1 & 1 \\\\ \\hline 2 & 0 \\\\ \\hline \\end{array}$$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 0 \\\\ \\hline 1 & 1 \\\\ \\hline 2 & 2 \\\\ \\hline \\end{array}$$"
      }
    ],
    "correctAnswer": "A"
  },
  "e7343559": {
    "prompt": "Which table gives three values of $x$ and their corresponding values of $y$ for the given equation $y = 7x + 2$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 2 \\\\ \\hline 1 & 9 \\\\ \\hline 2 & 16 \\\\ \\hline \\end{array}$$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 7 \\\\ \\hline 1 & 9 \\\\ \\hline 2 & 11 \\\\ \\hline \\end{array}$$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 2 \\\\ \\hline 1 & 7 \\\\ \\hline 2 & 14 \\\\ \\hline \\end{array}$$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 14 \\\\ \\hline 1 & 7 \\\\ \\hline 2 & 2 \\\\ \\hline \\end{array}$$"
      }
    ],
    "correctAnswer": "A"
  },
  "cea27ab2": {
    "prompt": "For the given equation $y = 3x + 8$, which table gives three values of $x$ and their corresponding values of $y$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 8 \\\\ \\hline 1 & 11 \\\\ \\hline 2 & 14 \\\\ \\hline \\end{array}$$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 3 \\\\ \\hline 1 & 6 \\\\ \\hline 2 & 9 \\\\ \\hline \\end{array}$$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 8 \\\\ \\hline 1 & 3 \\\\ \\hline 2 & 6 \\\\ \\hline \\end{array}$$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 3 \\\\ \\hline 1 & 8 \\\\ \\hline 2 & 11 \\\\ \\hline \\end{array}$$"
      }
    ],
    "correctAnswer": "A"
  },
  "1efd8202": {
    "prompt": "Which table gives three values of $x$ and their corresponding values of $y$ for the given equation $y = 70x + 8$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 8 \\\\ \\hline 1 & 78 \\\\ \\hline 2 & 148 \\\\ \\hline \\end{array}$$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 70 \\\\ \\hline 2 & 78 \\\\ \\hline 4 & 86 \\\\ \\hline \\end{array}$$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 8 \\\\ \\hline 2 & 70 \\\\ \\hline 4 & 140 \\\\ \\hline \\end{array}$$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 70 \\\\ \\hline 1 & 78 \\\\ \\hline 2 & 86 \\\\ \\hline \\end{array}$$"
      }
    ],
    "correctAnswer": "A"
  },
  "6cb9bf45": {
    "prompt": "For which of the following tables are all the values of $x$ and their corresponding values of $y$ solutions to the given inequality $y > 7x - 4$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 5 & 35 \\\\ \\hline 8 & 52 \\\\ \\hline \\end{array}$$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 5 & 31 \\\\ \\hline 8 & 52 \\\\ \\hline \\end{array}$$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 5 & 30 \\\\ \\hline 8 & 50 \\\\ \\hline \\end{array}$$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 5 & 28 \\\\ \\hline 8 & 49 \\\\ \\hline \\end{array}$$"
      }
    ],
    "correctAnswer": "A"
  },
  "af711d1b": {
    "passage": "<div class=\"sat-table-container\">\n  <table class=\"sat-table\">\n    <thead>\n      <tr><th>Distance (kilometers)</th><th>Average time (minutes)</th></tr>\n    </thead>\n    <tbody>\n      <tr><td>$0.3$</td><td>$8$</td></tr>\n      <tr><td>$0.6$</td><td>$16$</td></tr>\n      <tr><td>$0.9$</td><td>$24$</td></tr>\n    </tbody>\n  </table>\n</div>",
    "prompt": "The table gives the average time $t$, in minutes, it takes Carly to travel a certain distance $d$, in kilometers. Which equation could represent this linear relationship?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$t = 4d$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$t = \\frac{1}{4}d$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$t = 25d$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$t = \\frac{1}{25}d$"
      }
    ],
    "correctAnswer": "C"
  },
  "bbb0359a": {
    "passage": "<div class=\"sat-table-container\">\n  <table class=\"sat-table\">\n    <thead>\n      <tr><th>$x$</th><th>$y$</th></tr>\n    </thead>\n    <tbody>\n      <tr><td>$0$</td><td>$6$</td></tr>\n      <tr><td>$1$</td><td>$11$</td></tr>\n      <tr><td>$2$</td><td>$16$</td></tr>\n    </tbody>\n  </table>\n</div>",
    "prompt": "The table shows three values of $x$ and their corresponding values of $y$. Which equation represents the linear relationship between $x$ and $y$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$y = 5x + 6$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$y = 5x + 11$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$y = 6x + 5$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$y = 6x + 11$"
      }
    ],
    "correctAnswer": "A"
  },
  "606cdce7": {
    "passage": "<div class=\"sat-table-container\">\n  <table class=\"sat-table\">\n    <thead>\n      <tr><th>$x$</th><th>$y$</th></tr>\n    </thead>\n    <tbody>\n      <tr><td>$0$</td><td>$18$</td></tr>\n      <tr><td>$1$</td><td>$13$</td></tr>\n      <tr><td>$2$</td><td>$8$</td></tr>\n      <tr><td>$3$</td><td>$3$</td></tr>\n    </tbody>\n  </table>\n</div>",
    "prompt": "The table shows four values of $x$ and their corresponding values of $y$. There is a linear relationship between $x$ and $y$. Which of the following equations represents this relationship?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$y = 18x + 13$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$y = 18x + 18$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$y = -5x + 13$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$y = -5x + 18$"
      }
    ],
    "correctAnswer": "D"
  },
  "c651cc56": {
    "passage": "<div class=\"sat-table-container\">\n  <table class=\"sat-table\">\n    <thead>\n      <tr><th>$x$</th><th>$f(x)$</th></tr>\n    </thead>\n    <tbody>\n      <tr><td>$0$</td><td>$29$</td></tr>\n      <tr><td>$1$</td><td>$32$</td></tr>\n      <tr><td>$2$</td><td>$35$</td></tr>\n    </tbody>\n  </table>\n</div>",
    "prompt": "Some values of the linear function $f$ are shown in the table above. Which of the following equations defines $f$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$f(x) = 2x + 29$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$f(x) = 3x + 29$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$f(x) = 29x + 2$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$f(x) = 29x + 3$"
      }
    ],
    "correctAnswer": "B"
  },
  "ba79f10f": {
    "passage": "<div class=\"sat-table-container\">\n  <table class=\"sat-table\">\n    <thead>\n      <tr><th>$x$</th><th>$y$</th></tr>\n    </thead>\n    <tbody>\n      <tr><td>$0$</td><td>$14$</td></tr>\n      <tr><td>$1$</td><td>$19$</td></tr>\n      <tr><td>$2$</td><td>$24$</td></tr>\n    </tbody>\n  </table>\n</div>",
    "prompt": "The table shows three values of $x$ and their corresponding values of $y$. Which equation represents the relationship between $x$ and $y$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$y = 5x + 14$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$y = 5x + 19$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$y = 14x + 5$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$y = 14x + 19$"
      }
    ],
    "correctAnswer": "A"
  },
  "868fc236": {
    "passage": "<div class=\"sat-table-container\">\n  <table class=\"sat-table\">\n    <thead>\n      <tr><th>Macronutrient</th><th>Food calories</th><th>Kilojoules</th></tr>\n    </thead>\n    <tbody>\n      <tr><td>Protein</td><td>$4.0$</td><td>$16.7$</td></tr>\n      <tr><td>Fat</td><td>$9.0$</td><td>$37.7$</td></tr>\n      <tr><td>Carbohydrate</td><td>$4.0$</td><td>$16.7$</td></tr>\n    </tbody>\n  </table>\n</div>",
    "prompt": "The table above gives the typical amounts of energy per gram, expressed in both food calories and kilojoules, of the three macronutrients in food. If $x$ food calories is equivalent to $k$ kilojoules, of the following, which best represents the relationship between $x$ and $k$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$k = 0.24x$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$k = 4.2x$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$x = 4.2k$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$x = k + 12.7$"
      }
    ],
    "correctAnswer": "B"
  },
  "0366d965": {
    "passage": "<div class=\"sat-table-container\">\n  <table class=\"sat-table\">\n    <thead>\n      <tr><th>$x$</th><th>$y$</th></tr>\n    </thead>\n    <tbody>\n      <tr><td>$3$</td><td>$7$</td></tr>\n      <tr><td>$k$</td><td>$11$</td></tr>\n      <tr><td>$12$</td><td>$n$</td></tr>\n    </tbody>\n  </table>\n</div>",
    "prompt": "The table above shows the coordinates of three points on a line in the $xy$-plane, where $k$ and $n$ are constants. If the slope of the line is $2$, what is the value of $k + n$?",
    "correctAnswer": "30",
    "questionType": "spr",
    "options": []
  },
  "b2de69bd": {
    "passage": "<div class=\"sat-table-container\">\n  <table class=\"sat-table\">\n    <thead>\n      <tr><th>$x$</th><th>$y$</th></tr>\n    </thead>\n    <tbody>\n      <tr><td>$1$</td><td>$5$</td></tr>\n      <tr><td>$2$</td><td>$7$</td></tr>\n      <tr><td>$3$</td><td>$9$</td></tr>\n      <tr><td>$4$</td><td>$11$</td></tr>\n    </tbody>\n  </table>\n</div>",
    "prompt": "The table above shows some pairs of $x$ values and $y$ values. Which of the following equations could represent the relationship between $x$ and $y$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$y = 2x + 3$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$y = 3x - 2$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$y = 4x - 1$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$y = 5x$"
      }
    ],
    "correctAnswer": "A"
  },
  "78391fcc": {
    "passage": "<div class=\"sat-table-container\">\n  <table class=\"sat-table\">\n    <thead>\n      <tr><th>$x$</th><th>$f(x)$</th></tr>\n    </thead>\n    <tbody>\n      <tr><td>$2$</td><td>$21$</td></tr>\n      <tr><td>$3$</td><td>$18$</td></tr>\n      <tr><td>$4$</td><td>$15$</td></tr>\n      <tr><td>$5$</td><td>$12$</td></tr>\n    </tbody>\n  </table>\n</div>",
    "prompt": "The table above shows some values of $x$ and their corresponding values $f(x)$ for the linear function $f$. What is the $x$-intercept of the graph of $y = f(x)$ in the $xy$-plane?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$(-3, 0)$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$(-4, 0)$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$(-9, 0)$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$(9, 0)$"
      }
    ],
    "correctAnswer": "D"
  },
  "b2fe7ab6": {
    "passage": "<div class=\"sat-table-container\">\n  <table class=\"sat-table\">\n    <thead>\n      <tr><th>$x$</th><th>$g(x)$</th></tr>\n    </thead>\n    <tbody>\n      <tr><td>$0$</td><td>$57$</td></tr>\n      <tr><td>$1$</td><td>$54$</td></tr>\n      <tr><td>$2$</td><td>$51$</td></tr>\n      <tr><td>$3$</td><td>$48$</td></tr>\n    </tbody>\n  </table>\n</div>",
    "prompt": "For the linear function $g$, the table shows four values of $x$ and their corresponding values of $g(x)$. The function can be written as $g(x) = mx + b$, where $m$ and $b$ are constants. What is the value of $b$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$3$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$27$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$54$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$57$"
      }
    ],
    "correctAnswer": "D"
  },
  "97eab129": {
    "passage": "<div class=\"sat-table-container\">\n  <table class=\"sat-table\">\n    <thead>\n      <tr><th>Area (square feet)</th><th>Water (gallons)</th></tr>\n    </thead>\n    <tbody>\n      <tr><td>$2,520$</td><td>$4,536$</td></tr>\n      <tr><td>$3,780$</td><td>$6,804$</td></tr>\n      <tr><td>$5,040$</td><td>$9,072$</td></tr>\n    </tbody>\n  </table>\n</div>",
    "prompt": "The buildings of a shopping center are designed to allow water to drain from the roof into gutters on the sides of the buildings. The table shows the relationship between the area $x$, in square feet, of a roof and the amount of water $f(x)$, in gallons, drained from the roof into the gutters over a certain period of time. Which equation could define $f$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$f(x) = 0.6x$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$f(x) = 1.8x$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$f(x) = 2,268x$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$f(x) = 4,536x$"
      }
    ],
    "correctAnswer": "B"
  },
  "6f6dfe3e": {
    "passage": "<div class=\"sat-table-container\">\n  <table class=\"sat-table\">\n    <thead>\n      <tr><th>$x$</th><th>$y$</th></tr>\n    </thead>\n    <tbody>\n      <tr><td>$-6$</td><td>$n + 184$</td></tr>\n      <tr><td>$-3$</td><td>$n + 92$</td></tr>\n      <tr><td>$0$</td><td>$n$</td></tr>\n    </tbody>\n  </table>\n</div>",
    "prompt": "The table shows three values of $x$ and their corresponding values of $y$, where $n$ is a constant, for the linear relationship between $x$ and $y$. What is the slope of the line that represents this relationship in the $xy$-plane?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$-\\frac{92}{3}$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$-\\frac{3}{92}$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$\\frac{n + 92}{3}$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$-\\frac{2n - 92}{3}$"
      }
    ],
    "correctAnswer": "A"
  },
  "41fdc0b8": {
    "passage": "<div class=\"sat-table-container\">\n  <table class=\"sat-table\">\n    <thead>\n      <tr><th>Year</th><th>Population</th></tr>\n    </thead>\n    <tbody>\n      <tr><td>$2000$</td><td>$862$</td></tr>\n      <tr><td>$2010$</td><td>$846$</td></tr>\n    </tbody>\n  </table>\n</div>",
    "prompt": "The table above shows the population of Greenleaf, Idaho, for the years 2000 and 2010. If the relationship between population and year is linear, which of the following functions $P$ models the population of Greenleaf $t$ years after 2000?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$P(t) = 862 - 1.6t$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$P(t) = 862 - 16t$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$P(t) = 862 + 16(t - 2,000)$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$P(t) = 862 + 1.6(t - 2,000)$"
      }
    ],
    "correctAnswer": "A"
  },
  "0eae6be1": {
    "prompt": "The number $y$ is $84$ less than the number $x$. Which equation represents the relationship between $x$ and $y$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$y = x + 84$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$y = \\frac{x}{84}$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$y = 84x$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$y = x - 84$"
      }
    ],
    "correctAnswer": "D"
  },
  "f8fa0cf0": {
    "prompt": "What value of $r$ is the solution to the given equation $9r = 7(r + 7)$?",
    "correctAnswer": "49/2",
    "acceptedAnswers": [
      "49/2",
      "24.5"
    ],
    "questionType": "spr",
    "options": []
  },
  "60f71697": {
    "prompt": "What value of $x$ is the solution to the given equation $8x = 88$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$11$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$80$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$96$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$704$"
      }
    ],
    "correctAnswer": "A"
  },
  "1a621af4": {
    "prompt": "A number $x$ is at most $2$ less than $3$ times the value of $y$. If the value of $y$ is $-4$, what is the greatest possible value of $x$?",
    "correctAnswer": "-14",
    "questionType": "spr",
    "options": []
  },
  "771bd0ca": {
    "prompt": "What value of $t$ is the solution to the given equation $5(t + 3) - 7(t + 3) = 38$?",
    "correctAnswer": "-22",
    "questionType": "spr",
    "options": []
  },
  "915463e0": {
    "prompt": "Normal body temperature for an adult is between $97.8^\\circ\\text{F}$ and $99^\\circ\\text{F}$, inclusive. If Kevin, an adult male, has a body temperature that is considered to be normal, which of the following could be his body temperature?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$96.7^\\circ\\text{F}$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$97.6^\\circ\\text{F}$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$97.9^\\circ\\text{F}$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$99.7^\\circ\\text{F}$"
      }
    ],
    "correctAnswer": "C"
  },
  "aee9fd2d": {
    "prompt": "If $\\frac{x + 6}{3} = \\frac{x + 6}{13}$, the value of $x + 6$ is between which of the following pairs of values?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$-7$ and $-3$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$-2$ and $2$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$2$ and $7$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$8$ and $13$"
      }
    ],
    "correctAnswer": "B"
  },
  "4f8bd093": {
    "prompt": "What value of $x$ is the solution to the equation $16x + 24 = 24x$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$-4$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$0$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$\\frac{1}{3}$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$3$"
      }
    ],
    "correctAnswer": "D"
  },
  "429fb7c0": {
    "prompt": "What value of $t$ is the solution to the equation $0.8t - 0.46 = 8(t - 0.001) + 1.9$?",
    "correctAnswer": "-49/150",
    "acceptedAnswers": [
      "-49/150",
      "-.3267",
      "-.3266",
      "-0.326",
      "-0.327",
      "-0.3267"
    ],
    "questionType": "spr",
    "options": []
  },
  "f5ff91b2": {
    "prompt": "If $\\frac{x - 5}{7} = \\frac{x - 5}{9}$, the value of $x - 5$ is between which of the following pairs of values?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$-9$ and $-7$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$-3$ and $3$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$4.5$ and $5.5$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$6.75$ and $9.25$"
      }
    ],
    "correctAnswer": "B"
  },
  "208626df": {
    "prompt": "A rectangle has length $\\ell$ and width $w$. The inequality $2\\ell + 2w \\le 27$ gives the possible values of $\\ell$ and $w$ for which the perimeter of this rectangle is less than or equal to $27$. Which statement is the best interpretation of $(\\ell, w) = (8, 3)$ in this context?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "If the rectangle has length 3 and width 8, its perimeter is less than or equal to 27."
      },
      {
        "id": "B",
        "label": "B",
        "text": "If the rectangle has length 8 and width 3, its perimeter is less than or equal to 27."
      },
      {
        "id": "C",
        "label": "C",
        "text": "If the rectangle has length 3 and width 8, its perimeter is greater than or equal to 27."
      },
      {
        "id": "D",
        "label": "D",
        "text": "If the rectangle has length 8 and width 3, its perimeter is greater than or equal to 27."
      }
    ],
    "correctAnswer": "B"
  },
  "6e6a3241": {
    "prompt": "$$\\begin{aligned} x + 5y &= 5 \\\\ 2x - y &= -4 \\end{aligned}$$\n\nWhich of the following graphs in the $xy$-plane could be used to solve the system of equations above?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "",
        "imageUrl": "/question-images/math/6e6a3241_opt_A.png"
      },
      {
        "id": "B",
        "label": "B",
        "text": "",
        "imageUrl": "/question-images/math/6e6a3241_opt_B.png"
      },
      {
        "id": "C",
        "label": "C",
        "text": "",
        "imageUrl": "/question-images/math/6e6a3241_opt_C.png"
      },
      {
        "id": "D",
        "label": "D",
        "text": "",
        "imageUrl": "/question-images/math/6e6a3241_opt_D.png"
      }
    ],
    "correctAnswer": "C"
  },
  "0b46bad5": {
    "prompt": "$$ax + by = b$$\n\nIn the equation above, $a$ and $b$ are constants and $0 < a < b$. Which of the following could represent the graph of the equation in the $xy$-plane?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "",
        "imageUrl": "/question-images/math/0b46bad5_opt_A.png"
      },
      {
        "id": "B",
        "label": "B",
        "text": "",
        "imageUrl": "/question-images/math/0b46bad5_opt_B.png"
      },
      {
        "id": "C",
        "label": "C",
        "text": "",
        "imageUrl": "/question-images/math/0b46bad5_opt_C.png"
      },
      {
        "id": "D",
        "label": "D",
        "text": "",
        "imageUrl": "/question-images/math/0b46bad5_opt_D.png"
      }
    ],
    "correctAnswer": "C"
  },
  "a8e6bd75": {
    "prompt": "Which of the following is the graph of the equation $y = 2x - 5$ in the $xy$-plane?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "",
        "imageUrl": "/question-images/math/a8e6bd75_opt_A.png"
      },
      {
        "id": "B",
        "label": "B",
        "text": "",
        "imageUrl": "/question-images/math/a8e6bd75_opt_B.png"
      },
      {
        "id": "C",
        "label": "C",
        "text": "",
        "imageUrl": "/question-images/math/a8e6bd75_opt_C.png"
      },
      {
        "id": "D",
        "label": "D",
        "text": "",
        "imageUrl": "/question-images/math/a8e6bd75_opt_D.png"
      }
    ],
    "correctAnswer": "D"
  },
  "4acd05cd": {
    "prompt": "The graph shows the linear relationship between $x$ and $y$. Which table gives three values of $x$ and their corresponding values of $y$ for this relationship?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 0 \\\\ \\hline 1 & -7 \\\\ \\hline 2 & -9 \\\\ \\hline \\end{array}$$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & 0 \\\\ \\hline 1 & -3 \\\\ \\hline 2 & -1 \\\\ \\hline \\end{array}$$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & -5 \\\\ \\hline 1 & -7 \\\\ \\hline 2 & -9 \\\\ \\hline \\end{array}$$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$$\\begin{array}{|c|c|}\\hline x & y \\\\ \\hline 0 & -5 \\\\ \\hline 1 & -3 \\\\ \\hline 2 & -1 \\\\ \\hline \\end{array}$$"
      }
    ],
    "correctAnswer": "D"
  },
  "cb8f449f": {
    "prompt": "$$\\begin{aligned} \\frac{1}{2}y &= 4 \\\\ x - \\frac{1}{2}y &= 2 \\end{aligned}$$\n\nThe system of equations above has solution $(x, y)$. What is the value of $x$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$3$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$\\frac{7}{2}$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$4$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$6$"
      }
    ],
    "correctAnswer": "D"
  },
  "6ac23de7": {
    "prompt": "$$\\frac{4x}{5} = 20$$\n\nIn the equation above, what is the value of $x$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$25$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$24$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$16$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$15$"
      }
    ],
    "correctAnswer": "A"
  },
  "af2ba762": {
    "prompt": "$$F(x) = 2.74 - 0.19(x - 3)$$\n\nAccording to data provided by the US Department of Energy, the average price per gallon of regular gasoline in the United States from September 1, 2014, to December 1, 2014, is modeled by the function $F$ defined above, where $F(x)$ is the average price per gallon $x$ months after September 1. The constant $2.74$ in this function estimates which of the following?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "The average monthly decrease in the price per gallon"
      },
      {
        "id": "B",
        "label": "B",
        "text": "The difference in the average price per gallon from September 1, 2014, to December 1, 2014"
      },
      {
        "id": "C",
        "label": "C",
        "text": "The average price per gallon on September 1, 2014"
      },
      {
        "id": "D",
        "label": "D",
        "text": "The average price per gallon on December 1, 2014"
      }
    ],
    "correctAnswer": "D"
  },
  "830120b0": {
    "prompt": "$$\\begin{aligned} y &> 2x - 1 \\\\ 2x &> 5 \\end{aligned}$$\n\nWhich of the following consists of the $y$-coordinates of all the points that satisfy the system of inequalities above?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$y > 6$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$y > 4$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$y > \\frac{5}{2}$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$y > \\frac{3}{2}$"
      }
    ],
    "correctAnswer": "B"
  },
  "9b7a1b67": {
    "prompt": "The graph of line $h$ is shown in the $xy$-plane. Line $k$ (not shown) is defined by $sx + 48y = t$, where $s$ and $t$ are constants. If line $k$ is graphed in this $xy$-plane, the result is a graph of two linear equations. This system of two linear equations has no solution. Which of the following is NOT a possible value of $t$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$-432$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$-9$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$72$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$288$"
      }
    ],
    "correctAnswer": "A"
  },
  "b0fc3166": {
    "prompt": "The graph of a system of linear equations is shown. What is the solution $(x, y)$ to the system?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$(0, 3)$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$(1, 3)$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$(2, 3)$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$(3, 3)$"
      }
    ],
    "correctAnswer": "C"
  },
  "9b0a4eae": {
    "prompt": "The graph in the $xy$-plane models the possible combinations of length, $x$, and width, $y$, in meters, for a rectangle with a perimeter of $18\\text{ meters}$. Which equation represents this relationship?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$x + y = 9$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$x + y = 18$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$2x + y = 9$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$2x + 2y = 9$"
      }
    ],
    "correctAnswer": "A"
  },
  "5cf1bbc9": {
    "prompt": "The graph of the function $f$, where $y = f(x)$, gives the total cost, in dollars, for a certain video game system and $x$ games. What is the cost, in dollars, of the video game system?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "\\$25"
      },
      {
        "id": "B",
        "label": "B",
        "text": "\\$50"
      },
      {
        "id": "C",
        "label": "C",
        "text": "\\$100"
      },
      {
        "id": "D",
        "label": "D",
        "text": "\\$300"
      }
    ],
    "correctAnswer": "D"
  },
  "8eb0e19e": {
    "prompt": "The graph of the linear function $f$ is shown, where $y = f(x)$. Which equation defines function $f$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$f(x) = -2x - 8$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$f(x) = -2x + 8$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$f(x) = 2x - 8$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$f(x) = 2x + 8$"
      }
    ],
    "correctAnswer": "B"
  },
  "05bb1af9": {
    "prompt": "The graph of $y = f(x) + 14$ is shown. Which equation defines function $f$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$f(x) = -\\frac{1}{4}x - 12$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$f(x) = -\\frac{1}{4}x + 16$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$f(x) = -\\frac{1}{4}x + 2$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$f(x) = -\\frac{1}{4}x - 14$"
      }
    ],
    "correctAnswer": "A"
  },
  "c307283c": {
    "prompt": "What is an equation of the graph shown?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$y = -2x - 8$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$y = x - 8$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$y = -x - 8$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$y = 2x - 8$"
      }
    ],
    "correctAnswer": "C"
  },
  "18ac8354": {
    "prompt": "The graph of line $j$ is shown in the $xy$-plane. Line $k$ is defined by $4x + 6y = 12$. If line $k$ is graphed in this $xy$-plane, what is the $x$-coordinate of the intersection point of line $j$ and line $k$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$-6$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$-3$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$0$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$3$"
      }
    ],
    "correctAnswer": "C"
  },
  "6d8ad460": {
    "prompt": "Line $j$ is shown in the $xy$-plane. Line $k$ (not shown) is perpendicular to line $j$. What is the slope of line $k$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$-2$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$-\\frac{1}{2}$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$\\frac{1}{2}$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$2$"
      }
    ],
    "correctAnswer": "C"
  },
  "c4ea43ef": {
    "prompt": "To earn money for college, Avery works two part-time jobs: A and B. She earns \\$1 per hour working at job A and \\$1 per hour working at job B. In one week, Avery earned a total of \\$1. The graph models this situation, where $x$ is the number of hours Avery worked at job A and $y$ is the number of hours she worked at job B. Which equation represents this situation?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$10x + 20y = 400$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$20x + 10y = 400$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$x + y = 400$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$10x + 20y = 30$"
      }
    ],
    "correctAnswer": "A"
  },
  "080e75c2": {
    "prompt": "The functions $f$ and $g$ model the number of participants, in thousands, in two different programs $x$ years since 2010. The graphs of $y = f(x)$ and $y = g(x)$ are shown. Which of the following could represent functions $f$ and $g$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$f(x) = -\\frac{4}{11}x + 13,\\; g(x) = \\frac{2}{11}x + 7$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$f(x) = -\\frac{4}{11}x + 7,\\; g(x) = \\frac{2}{11}x + 13$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$f(x) = -\\frac{2}{11}x + 13,\\; g(x) = \\frac{4}{11}x + 7$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$f(x) = -\\frac{2}{11}x + 7,\\; g(x) = \\frac{4}{11}x + 13$"
      }
    ],
    "correctAnswer": "C"
  },
  "eeebe166": {
    "prompt": "What is the $y$-intercept of the line graphed?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$(-5, 0)$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$(0, 0)$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$(0, 5)$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$(0, 9)$"
      }
    ],
    "correctAnswer": "C"
  },
  "f0773a55": {
    "prompt": "The graph represents the total charge, in dollars, by an electrician for $x$ hours of work. The electrician charges a onetime fee plus an hourly rate. What is the best interpretation of the slope of the graph?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "The onetime fee"
      },
      {
        "id": "B",
        "label": "B",
        "text": "The hourly rate"
      },
      {
        "id": "C",
        "label": "C",
        "text": "The total charge for one hour of work"
      },
      {
        "id": "D",
        "label": "D",
        "text": "The maximum charge possible"
      }
    ],
    "correctAnswer": "B"
  },
  "f40552a9": {
    "prompt": "What is the $y$-intercept of the line graphed?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$(0, -8)$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$(0, -\\frac{1}{8})$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$(0, 0)$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$(0, 8)$"
      }
    ],
    "correctAnswer": "D"
  },
  "00b9bd37": {
    "prompt": "The graph models the relationship between the number of T-shirts, $x$, and the number of sweatshirts, $y$, that Kira can purchase for a school fundraiser. Which equation could represent this relationship?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$y = 7x + 18$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$7x + 18y = 630$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$y = 18x + 7$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$18x + 7y = 630$"
      }
    ],
    "correctAnswer": "B"
  },
  "0ea7ef01": {
    "prompt": "Oxygen gas is placed inside a tank with a constant volume. The graph shows the estimated temperature $y$, in kelvins, of the oxygen gas when its pressure is $x$ atmospheres. What is the estimated temperature, in kelvins, of the oxygen gas when its pressure is $6$ atmospheres?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$6$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$60$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$700$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$760$"
      }
    ],
    "correctAnswer": "C"
  },
  "608eeb6e": {
    "prompt": "$$\\begin{aligned} 5x &= 15 \\\\ -4x + y &= -2 \\end{aligned}$$\n\nThe solution to the given system of equations is $(x, y)$. What is the value of $x + y$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$-17$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$-13$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$13$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$17$"
      }
    ],
    "correctAnswer": "C"
  },
  "9b886541": {
    "prompt": "If $3x - 8 = 7$, what is the value of $3x + 8$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$-1$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$5$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$13$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$23$"
      }
    ],
    "correctAnswer": "D"
  },
  "d914abec": {
    "prompt": "To complete a landscaping project, Adam charges a fee of \\$1 for his equipment and \\$1 per hour spent working on the project. To complete this same landscaping project, Caroline charges a fee of \\$1 for her equipment and \\$1 per hour spent working on the project. If $x$ represents the number of hours spent working on the landscaping project, what are all the values of $x$ for which Caroline's total charge is greater than Adam's total charge?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$5 < x < 6$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$6 < x < 7$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$x < 5$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$x > 6$"
      }
    ],
    "correctAnswer": "D"
  },
  "340afb12": {
    "prompt": "Ellen bought two types of snack bags for a school event. Each bag of pretzels cost \\$1, and each bag of cookies cost \\$1. She bought a total of $33$ bags for \\$1. If $x$ represents the number of bags of pretzels and $y$ represents the number of bags of cookies, which system of equations represents this situation?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$$\\begin{aligned} 11x + 16y &= 968 \\\\ 24x + 9y &= 497 \\end{aligned}$$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$$\\begin{aligned} 11x + 9y &= 968 \\\\ 24x + 16y &= 497 \\end{aligned}$$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$$\\begin{aligned} 11x + 9y &= 497 \\\\ 24x + 16y &= 968 \\end{aligned}$$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$$\\begin{aligned} 9x + 11y &= 497 \\\\ 16x + 24y &= 968 \\end{aligned}$$"
      }
    ],
    "correctAnswer": "C"
  },
  "1e0a46e4": {
    "prompt": "$$\\begin{aligned} 2x - 3y &= 9 \\\\ 3x + 4y &= 10 \\end{aligned}$$\n\nWhich of the following systems of equations has the same solution as the system of equations above?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$$\\begin{aligned} -2x + 3y &= -9 \\\\ 2x - 3y &= 9 \\end{aligned}$$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$$\\begin{aligned} 2x - 3y &= 9 \\\\ 3x + 4y &= 10 \\end{aligned}$$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$$\\begin{aligned} 2x - 3y &= 9 \\\\ -6x + 9y &= -27 \\end{aligned}$$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$$\\begin{aligned} -2x + 3y &= 9 \\\\ 4x - 6y &= 18 \\end{aligned}$$"
      }
    ],
    "correctAnswer": "B"
  },
  "e77a76ce": {
    "prompt": "Which of the following systems of linear equations has no solution?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$$\\begin{aligned} y &= 6x + 3 \\\\ y &= 6x + 9 \\end{aligned}$$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$$\\begin{aligned} y &= 10 \\\\ y &= 10x + 10 \\end{aligned}$$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$$\\begin{aligned} y &= 14x + 14 \\\\ y &= 10x + 14 \\end{aligned}$$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$$\\begin{aligned} x &= 3 \\\\ y &= 10 \\end{aligned}$$"
      }
    ],
    "correctAnswer": "A"
  },
  "6e50ce28": {
    "prompt": "The sum of a number $x$ and $7$ is twice as large as a number $y$. The number $y$ is $3$ less than $x$. Which system of equations represents this situation?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$$\\begin{aligned} x + 7 &= 2y \\\\ y &= x - 3 \\end{aligned}$$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$$\\begin{aligned} x + 7 &= 2y \\\\ y &= 3 - x \\end{aligned}$$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$$\\begin{aligned} 2(x + 7) &= y \\\\ y &= x - 3 \\end{aligned}$$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$$\\begin{aligned} 2(x + 7) &= y \\\\ y &= 3 - x \\end{aligned}$$"
      }
    ],
    "correctAnswer": "A"
  },
  "6daf8d70": {
    "prompt": "A city employee is organizing a 5k charity walk. The goal is to raise more than \\$1. The ticket price is \\$1 for adults and \\$1 for students. The employee also wants the number of adult participants $a$ to be more than three times the number of student participants $b$. Which system of inequalities represents this situation?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$a + b > 164$ and $3a > b$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$a + b > 164$ and $a < 3b$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$a + b < 164$ and $3a > b$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$a + b < 164$ and $a < 3b$"
      }
    ],
    "correctAnswer": "A"
  },
  "e142f83c": {
    "prompt": "$$\\begin{aligned} y - 6 &= \\frac{1}{2}(x + 5) \\\\ y - v &= \\frac{1}{2}(x + 10) \\end{aligned}$$\n\nIn the given system of equations, $v$ is a constant. The system has infinitely many solutions. What is the value of $v$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$0$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$\\frac{7}{2}$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$4$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$12$"
      }
    ],
    "correctAnswer": "B"
  },
  "f14484a5": {
    "prompt": "A manufacturing plant makes 10-inch, 9-inch, and 7-inch frying pans. During a certain day, the number of 10-inch frying pans that the manufacturing plant makes is 4 times the number of 9-inch frying pans it makes, and the number of 7-inch frying pans it makes is 10. During this day, the manufacturing plant makes 100 frying pans total. If $n$ represents the number of 9-inch frying pans made, which equation represents this situation?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$10(4n) + 9n + 7(10) = 100$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$10n + 9n + 7n = 100$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$4n + 10 = 100$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$5n + 10 = 100$"
      }
    ],
    "correctAnswer": "D"
  },
  "be9cb6a2": {
    "prompt": "The cost of renting a backhoe for up to $10$ days is \\$1 for the first day and \\$1 for each additional day. Which of the following equations gives the cost $y$, in dollars, of renting the backhoe for $x$ days, where $x$ is a positive integer and $x \\le 10$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$y = 270x - 135$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$y = 270x + 135$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$y = 135x + 270$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$y = 135x + 135$"
      }
    ],
    "correctAnswer": "D"
  },
  "7e3f8363": {
    "prompt": "In the $xy$-plane, the graph of the linear function $f$ contains the points $(0, 3)$ and $(7, 31)$. Which equation defines $f$, where $y = f(x)$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$f(x) = 28x + 34$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$f(x) = 3x + 38$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$f(x) = 4x + 3$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$f(x) = 7x + 3$"
      }
    ],
    "correctAnswer": "C"
  },
  "55ea0659": {
    "prompt": "$$x(r - 9) + 4 = 19x + 27$$\n\nIn the given equation, $r$ is a positive integer. If the given equation has exactly one solution, what CANNOT be the value of $r$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$4$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$9$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$23$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$28$"
      }
    ],
    "correctAnswer": "D"
  },
  "7efe5495": {
    "prompt": "$$\\begin{aligned} y &= 3x \\\\ 2x + y &= 12 \\end{aligned}$$\n\nThe solution to the given system of equations is $(x, y)$. What is the value of $5x$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$24$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$15$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$12$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$5$"
      }
    ],
    "correctAnswer": "C"
  },
  "0dd6227f": {
    "prompt": "At how many points do the graphs of the equations $y = x + 20$ and $y = 8x$ intersect in the $xy$-plane?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$0$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$1$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$2$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$8$"
      }
    ],
    "correctAnswer": "B"
  },
  "4d8ccb96": {
    "prompt": "A chemist studying the impact of salt on a process mixes $x$ kilograms of a low-salt mixture, which is $2\\%$ salt by weight, with $y$ kilograms of a high-salt mixture, which is $96\\%$ salt by weight, to create $24$ kilograms of a mixture that is $4\\%$ salt by weight. Which equation represents this situation?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$0.96x + 0.02y = (0.04)(24)$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$0.02x + 0.96y = (0.04)(24)$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$0.96x + 0.02y = 24$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$0.02x + 0.96y = 24$"
      }
    ],
    "correctAnswer": "B"
  },
  "59813abf": {
    "prompt": "$$38(x - n) = 38y + 38n$$\n\nOne of the equations in a system of two linear equations is given, where $n$ is a positive constant. The system has no solution. Which equation could be the second equation in this system?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$4x - 4y = 28n$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$4x + 4y = 4n$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$4x + 4y = 28n$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$4x - 4y = 4n$"
      }
    ],
    "correctAnswer": "D"
  },
  "9f3cb472": {
    "prompt": "Line $t$ in the $xy$-plane has a slope of $-\\frac{1}{3}$ and passes through the point $(9, 10)$. Which equation defines line $t$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$y = 13x - \\frac{1}{3}$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$y = 9x + 10$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$y = -\\frac{1}{3}x + 10$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$y = -\\frac{1}{3}x + 13$"
      }
    ],
    "correctAnswer": "D"
  },
  "d7c8ba0b": {
    "prompt": "In the $xy$-plane, line $t$ passes through the points $(0, 9)$ and $(1, 17)$. Which equation defines line $t$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$y = x + 9$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$y = x + 3$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$y = x + 8$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$y = 8x + 9$"
      }
    ],
    "correctAnswer": "D"
  },
  "088bc84e": {
    "prompt": "If $2(5x) = 6$, what is the value of $5x$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$\\frac{4}{5}$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$\\frac{5}{3}$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$3$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$4$"
      }
    ],
    "correctAnswer": "C"
  },
  "6fa1dc0f": {
    "prompt": "Line $r$ in the $xy$-plane has a slope of $4$ and passes through the point $(0, 6)$. Which equation defines line $r$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$y = -6x + 4$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$y = 6x + 4$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$y = 4x - 6$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$y = 4x + 6$"
      }
    ],
    "correctAnswer": "D"
  },
  "99ea3715": {
    "prompt": "If the graph of $27x + 33y = 297$ is shifted down $5$ units in the $xy$-plane, what is the $y$-intercept of the resulting graph?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$(0, 4)$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$(0, 6)$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$(0, 14)$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$(0, 28)$"
      }
    ],
    "correctAnswer": "A"
  },
  "58c7daed": {
    "prompt": "For the linear function $h$, $h(0) = 0$ and $h(11) = 10$. Which equation defines $h$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$h(x) = \\frac{10}{11}x$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$h(x) = \\frac{10}{11}x + 10$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$h(x) = \\frac{11}{10}x$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$h(x) = \\frac{11}{10}x + 11$"
      }
    ],
    "correctAnswer": "A"
  },
  "b3abf40f": {
    "prompt": "$$F(x) = \\frac{9}{5}(x - 273.15) + 32$$\n\nThe function $F$ gives the temperature, in degrees Fahrenheit, that corresponds to a temperature of $x$ kelvins. If a temperature increased by $9.10$ kelvins, by how much did the temperature increase, in degrees Fahrenheit?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$16.38$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$48.38$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$475.29$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$507.29$"
      }
    ],
    "correctAnswer": "A"
  },
  "1a2a0f59": {
    "prompt": "A yoga studio is offering a deal where the first session is free, the second session is half off the regular price, and the remaining sessions are at the regular price. If the regular price of a session is \\$1, which function $f$ gives the total cost, in dollars, of purchasing $x$ sessions using this deal, where $x > 2$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$f(x) = 25.40(x - 1) + 12.70$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$f(x) = 25.40(x - 2) + 12.70$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$f(x) = 25.40(x - 1) + 12.70(x - 2)$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$f(x) = 25.40(x - 2) + 12.70(x - 1)$"
      }
    ],
    "correctAnswer": "B"
  },
  "ee1f63c0": {
    "prompt": "The function $f$ is defined by $f(x) = 6.2x$. What is the value of $f(x)$ when $x = 10$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$7.2$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$62$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$17.2$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$16.2$"
      }
    ],
    "correctAnswer": "B"
  },
  "ea8bd66f": {
    "prompt": "$$\\begin{aligned} y &= 4x \\\\ 5x - 3y &= -14 \\end{aligned}$$\n\nThe solution to the given system of equations is $(x, y)$. What is the value of $x + y$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$4$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$6$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$8$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$10$"
      }
    ],
    "correctAnswer": "D"
  },
  "114ae8a9": {
    "prompt": "A train traveled $173$ miles in the first $3$ hours of a trip and traveled at an average speed of $53$ miles per hour for the remainder of the trip. Which equation gives the total number of miles, $y$, the train traveled if the trip was $x$ hours long and $x > 3$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$y = 53x + 173$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$y = 53x + 14$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$y = 14x + 226$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$y = 14x + 53$"
      }
    ],
    "correctAnswer": "B"
  },
  "018a2704": {
    "prompt": "If $46 = 16 + 2(x - 8)$, what is the value of $2(x - 8)$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$16$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$23$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$30$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$38$"
      }
    ],
    "correctAnswer": "C"
  },
  "8383771a": {
    "prompt": "$$x + y = 20$$\n\nOne of the two equations in a system of linear equations is given. The system has exactly one solution. Which equation could be the second equation in the system?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$3x + 3y = 60$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$-x - y = 40$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$3x + 3y = 14$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$x - y = 20$"
      }
    ],
    "correctAnswer": "D"
  },
  "3d04de9c": {
    "prompt": "A principal used a total of $25$ flags that were either blue or yellow for field day. The principal used $20$ blue flags. How many yellow flags were used?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$5$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$20$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$25$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$30$"
      }
    ],
    "correctAnswer": "A"
  },
  "fc4a0d2a": {
    "prompt": "$$g(x) = 3(14x - 15)$$\n\nWhat is the $y$-coordinate of the $y$-intercept of the graph of $y = g(x) - 2$ in the $xy$-plane?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$-47$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$-45$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$-17$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$-15$"
      }
    ],
    "correctAnswer": "A"
  },
  "a775af14": {
    "prompt": "In the $xy$-plane, the graph of the linear function $f$ contains the points $(0, 2)$ and $(8, 34)$. Which equation defines $f$, where $y = f(x)$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$f(x) = 2x + 42$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$f(x) = 32x + 36$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$f(x) = 4x + 2$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$f(x) = 8x + 2$"
      }
    ],
    "correctAnswer": "C"
  },
  "5e9b6079": {
    "prompt": "$$y = 7x + 18$$\n\nOne of the equations in a system of two linear equations is given. The system has no solution. Which equation could be the second equation in the system?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$-21x + y = 54$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$-21x + y = 18$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$-7x + y = 21$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$-7x + y = 18$"
      }
    ],
    "correctAnswer": "C"
  },
  "94b48cbf": {
    "prompt": "The graph of $7x + 2y = -31$ in the $xy$-plane has an $x$-intercept at $(a, 0)$ and a $y$-intercept at $(0, b)$, where $a$ and $b$ are constants. What is the value of $\\frac{b}{a}$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$-\\frac{7}{2}$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$-\\frac{2}{7}$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$\\frac{2}{7}$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$\\frac{7}{2}$"
      }
    ],
    "correctAnswer": "D"
  },
  "a396ed75": {
    "prompt": "For a training program, Juan rides his bike at an average rate of $5.7$ minutes per mile. Which function $m$ models the number of minutes it will take Juan to ride $x$ miles at this rate?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$m(x) = \\frac{x}{5.7}$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$m(x) = x + 5.7$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$m(x) = x - 5.7$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$m(x) = 5.7x$"
      }
    ],
    "correctAnswer": "D"
  },
  "a309803e": {
    "prompt": "One gallon of paint will cover $220$ square feet of a surface. A room has a total wall area of $w$ square feet. Which equation represents the total amount of paint $P$, in gallons, needed to paint the walls of the room twice?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$P = \\frac{w}{110}$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$P = 440w$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$P = \\frac{w}{220}$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$P = 220w$"
      }
    ],
    "correctAnswer": "A"
  },
  "0e926898": {
    "prompt": "Students and chaperones from a middle school are going on a field trip to a museum. Admission to the museum will cost \\$1 for each student and \\$1 for each chaperone. It will cost a total of \\$1 for admission to the museum for all $83$ people on the field trip. How many students are going on the field trip?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$31$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$70$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$76$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$86$"
      }
    ],
    "correctAnswer": "C"
  },
  "0d1b1e35": {
    "prompt": "A batch of banana milkshakes consists of $4$ cups of ice cream and $2$ bananas and has $1,114$ milligrams (mg) of calcium. There is $276\\text{ mg}$ of calcium in $1$ cup of the ice cream used to make this batch of milkshakes. How much calcium, in mg, is in $1$ banana?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$5$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$10$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$419$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$1,104$"
      }
    ],
    "correctAnswer": "A"
  },
  "55ea82f3": {
    "prompt": "A team hosting an event to raise money for new uniforms plans to sell at least $140$ tickets before this event and at least $220$ tickets during this event to raise a total of at least \\$1 from all tickets sold. The price of a ticket during this event is \\$1 less than the price of a ticket before this event. Which inequality represents this situation, where $x$ is the price, in dollars, of a ticket sold during this event?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$140(x + 3) + 220x \\le 5,820$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$140(x + 3) + 220x \\ge 5,820$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$140(x - 3) + 220x \\le 5,820$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$140(x - 3) + 220x \\ge 5,820$"
      }
    ],
    "correctAnswer": "B"
  },
  "620abf36": {
    "prompt": "If $5(x + 4) = 4(x + 4) + 29$, what is the value of $x + 4$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$-4$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$25$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$29$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$33$"
      }
    ],
    "correctAnswer": "C"
  },
  "23dedddd": {
    "prompt": "In the linear function $f$, $f(0) = 8$ and $f(1) = 12$. Which equation defines $f$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$f(x) = 12x + 8$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$f(x) = 4x$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$f(x) = 4x + 12$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$f(x) = 4x + 8$"
      }
    ],
    "correctAnswer": "D"
  },
  "6989c80a": {
    "prompt": "$$F(x) = \\frac{9}{5}(x - 273.15) + 32$$\n\nThe function $F$ gives the temperature, in degrees Fahrenheit, that corresponds to a temperature of $x$ kelvins. If a temperature increased by $2.10$ kelvins, by how much did the temperature increase, in degrees Fahrenheit?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$3.78$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$35.78$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$487.89$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$519.89$"
      }
    ],
    "correctAnswer": "A"
  },
  "bd45df49": {
    "prompt": "$$\\begin{aligned} y &= 3x + 9 \\\\ 3y &= 8x - 6 \\end{aligned}$$\n\nThe solution to the given system of equations is $(x, y)$. What is the value of $x - y$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$-123$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$-33$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$3$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$57$"
      }
    ],
    "correctAnswer": "D"
  },
  "a7e2859a": {
    "prompt": "The cost of renting a large canopy tent for up to $10$ days is \\$1 for the first day and \\$1 for each additional day. Which of the following equations gives the cost $y$, in dollars, of renting the tent for $x$ days, where $x$ is a positive integer and $x \\le 10$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$y = 215x + 215$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$y = 430x - 215$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$y = 430x + 215$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$y = 215x + 430$"
      }
    ],
    "correctAnswer": "A"
  },
  "2875ba81": {
    "prompt": "$$\\begin{aligned} 6x + 7y &= 28 \\\\ 2x + 2y &= 10 \\end{aligned}$$\n\nThe solution to the given system of equations is $(x, y)$. What is the value of $y$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$-2$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$7$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$14$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$18$"
      }
    ],
    "correctAnswer": "A"
  },
  "265f2a53": {
    "prompt": "When line $n$ is graphed in the $xy$-plane, it has an $x$-intercept of $(-4, 0)$ and a $y$-intercept of $(0, 3)$. What is the slope of line $n$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$-\\frac{4}{3}$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$-\\frac{3}{4}$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$\\frac{3}{4}$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$\\frac{4}{3}$"
      }
    ],
    "correctAnswer": "C"
  },
  "0ef4a7b6": {
    "prompt": "A particular botanist classifies a species of plant as tall if its typical height when fully grown is more than $100$ centimeters. Each of the following inequalities represents the possible heights $h$, in centimeters, for a specific plant species when fully grown. Which inequality represents the possible heights $h$, in centimeters, for a tall plant species?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$106 < h < 158$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$80 < h < 100$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$42 < h < 87$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$17 < h < 85$"
      }
    ],
    "correctAnswer": "A"
  },
  "dcc4886a": {
    "prompt": "$$y = 17x + 3$$\n\nOne of the two equations in a system of linear equations is given. The system has infinitely many solutions. If the second equation in the system is $y = mx + b$, where $m$ and $b$ are constants, what is the value of $b$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$-3$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$-\\frac{1}{3}$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$\\frac{1}{3}$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$3$"
      }
    ],
    "correctAnswer": "D"
  },
  "10c448d6": {
    "prompt": "A line in the $xy$-plane has a slope of $\\frac{1}{3}$ and passes through the point $(0, 14)$. Which equation represents this line?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$y = -\\frac{1}{3}x - 14$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$y = -\\frac{1}{3}x + 14$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$y = \\frac{1}{3}x - 14$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$y = \\frac{1}{3}x + 14$"
      }
    ],
    "correctAnswer": "D"
  },
  "76f29fa5": {
    "prompt": "The cost to rent a commercial fishing boat from a certain company is \\$1 for the first $2$ hours and an additional \\$1 per hour for each hour after the first $2$ hours. If the total cost to rent the commercial fishing boat from the company for $t$ hours, where $t > 2$, is \\$1, which equation represents this situation?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$950(t - 2) + 50t = 1,100$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$950(2t) + 50t = 1,100$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$950 + 50(t - 2) = 1,100$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$950 + 50(2t) = 1,100$"
      }
    ],
    "correctAnswer": "C"
  },
  "042aa429": {
    "prompt": "If $f(x) = x + 7$ and $g(x) = 7x$, what is the value of $4f(2) - g(2)$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$-5$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$1$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$22$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$28$"
      }
    ],
    "correctAnswer": "C"
  },
  "e8fd6d99": {
    "prompt": "Terry has a goal to collect at least $16$ items per week for a donation drive. This week, Terry has collected $4$ items. If $x$ represents the additional number of items Terry needs to collect this week to meet the goal, which inequality represents this situation?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$4 - x \\le 16$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$4 + x \\le 16$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$4 - x \\ge 16$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$4 + x \\ge 16$"
      }
    ],
    "correctAnswer": "D"
  },
  "4fb8adf7": {
    "prompt": "$$\\begin{aligned} 4x - 3y &= 5 \\\\ x &= 8 \\end{aligned}$$\n\nWhat is the solution $(x, y)$ to the given system of equations?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$(8, 9)$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$(8, -24)$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$(8, -9)$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$(8, 24)$"
      }
    ],
    "correctAnswer": "A"
  },
  "c39dbbdf": {
    "prompt": "Line $r$ is defined by the equation $4x - 9y = 3$. Line $s$ is parallel to line $r$ in the $xy$-plane. What is the slope of line $s$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$\\frac{9}{4}$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$\\frac{4}{9}$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$-\\frac{4}{9}$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$-\\frac{9}{4}$"
      }
    ],
    "correctAnswer": "B"
  },
  "1e11190a": {
    "prompt": "Store A sells raspberries for \\$1 per pint and blackberries for \\$1 per pint. Store B sells raspberries for \\$1 per pint and blackberries for \\$1 per pint. A certain purchase of raspberries and blackberries would cost \\$1 at Store A or \\$1 at Store B. How many pints of blackberries are in this purchase?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$4$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$5$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$8$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$12$"
      }
    ],
    "correctAnswer": "B"
  },
  "2869fe95": {
    "prompt": "For a 3-week period in a town in Illinois, the lowest recorded temperature was $31$ degrees Fahrenheit ($^\\circ\\text{F}$) and the highest recorded temperature was $67^\\circ\\text{F}$. Which inequality is true for any recorded temperature $t$, in $^\\circ\\text{F}$, in this town for this 3-week period?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$t > 98$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$t > 67$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$31 \\le t \\le 67$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$t < 31$"
      }
    ],
    "correctAnswer": "C"
  },
  "029c2dc2": {
    "prompt": "A teacher is creating an assignment worth $70$ points. The assignment will consist of questions worth $1$ point and questions worth $3$ points. Which equation represents this situation, where $x$ represents the number of $1$-point questions and $y$ represents the number of $3$-point questions?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$4xy = 70$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$4(x + y) = 70$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$3x + y = 70$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$x + 3y = 70$"
      }
    ],
    "correctAnswer": "D"
  },
  "5eb4918d": {
    "prompt": "If $9x + 4 = 67$, what is the value of $90x + 40$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$7$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$70$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$130$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$670$"
      }
    ],
    "correctAnswer": "D"
  },
  "6efcc0a3": {
    "prompt": "In the linear function $h$, $h(0) = 41$ and $h(1) = 40$. Which equation defines $h$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$h(x) = -x + 41$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$h(x) = -2x$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$h(x) = -41x$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$h(x) = -41$"
      }
    ],
    "correctAnswer": "A"
  },
  "f01ef454": {
    "prompt": "A geologist estimates that the volume of a slab of granite is greater than $12.7$ cubic feet but less than $15.7$ cubic feet. The geologist also estimates that the slab of granite weighs $165$ pounds per cubic foot of volume. Which inequality represents this situation, where $x$ represents the estimated total weight, in pounds, of the slab of granite?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$165 - 15.7 < x < 165 - 12.7$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$165 + 12.7 < x < 165 + 15.7$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$165(12.7) < x < 165(15.7)$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$\\frac{165}{15.7} < x < \\frac{165}{12.7}$"
      }
    ],
    "correctAnswer": "C"
  },
  "ed856e9c": {
    "prompt": "What is the $y$-intercept of the graph of $y = 34x + 81$ in the $xy$-plane?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$(0, 81)$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$(0, 34)$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$(0, -34)$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$(0, -81)$"
      }
    ],
    "correctAnswer": "A"
  },
  "e9ef0e6b": {
    "prompt": "A model estimates that whales from the genus Eschrichtius travel $72$ to $77$ miles in the ocean each day during their migration. Based on this model, which inequality represents the estimated total number of miles, $x$, a whale from the genus Eschrichtius could travel in $16$ days of its migration?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$72 + 16 < x < 77 + 16$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$(72)(16) < x < (77)(16)$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$72 < 16 + x < 77$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$72 < 16x < 77$"
      }
    ],
    "correctAnswer": "B"
  },
  "74d0906a": {
    "prompt": "A tow truck travels at a speed of at least $25$ miles per hour but no more than $45$ miles per hour for a section of a road. Which inequality represents this situation, where $x$ is the speed of the tow truck, in miles per hour, on this section of the road?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$x > 25$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$x > 45$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$25 \\le x \\le 45$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$x \\le 70$"
      }
    ],
    "correctAnswer": "C"
  },
  "1fe778dc": {
    "prompt": "A line in the $xy$-plane has a slope of $-\\frac{1}{3}$ and passes through the point $(0, 3)$. Which equation represents this line?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$y = -\\frac{1}{3}x - 3$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$y = -\\frac{1}{3}x + 3$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$y = \\frac{1}{3}x - 3$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$y = \\frac{1}{3}x + 3$"
      }
    ],
    "correctAnswer": "B"
  },
  "8da536c6": {
    "prompt": "In 2010, a swim club had a total of $35$ swimmers, each classified as either advanced or intermediate. From 2010 to 2020, the number of advanced swimmers in the club increased by approximately $53\\%$, and the number of intermediate swimmers in the club increased by approximately $44\\%$. The total number of swimmers in the club increased by approximately $49\\%$. Which equation best represents this situation, where $a$ represents the number of advanced swimmers in the club in 2010 and $b$ represents the number of intermediate swimmers in the club in 2010?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$1.53a + 1.49b = 35(1.44)$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$1.49a + 0.53b = 35(1.44)$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$1.53a + 1.44b = 35(1.49)$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$1.44a + 1.53b = 35(1.49)$"
      }
    ],
    "correctAnswer": "C"
  },
  "0c490cd5": {
    "prompt": "Sam has a flag with an area of $110\\text{ in}^2$. Sam plans to enlarge the flag by sewing on pieces of colored nylon, where each piece would increase the flag's area by $64\\text{ in}^2$. Which equation gives the flag's total area $y$, in square inches, after Sam sews on $x$ pieces of nylon?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$y = 64x$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$y = 64 + 110x$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$y = 110 + 64x$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$y = 174x$"
      }
    ],
    "correctAnswer": "C"
  },
  "bbf9e5ce": {
    "prompt": "For groups of $25$ or more people, a museum charges \\$1 per person for the first $25$ people and \\$1 for each additional person. Which function $f$ gives the total charge, in dollars, for a tour group with $n$ people, where $n > 25$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$f(n) = 14n + 175$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$f(n) = 14n + 525$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$f(n) = 35n - 350$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$f(n) = 14n + 21$"
      }
    ],
    "correctAnswer": "A"
  },
  "a73a5c22": {
    "prompt": "The function $g$ is defined by $g(x) = 10x + 8$. What is the value of $g(x)$ when $x = 8$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$0$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$8$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$10$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$88$"
      }
    ],
    "correctAnswer": "D"
  },
  "4722abd2": {
    "prompt": "Line $p$ is defined by $2y + 8x = 11$. Line $r$ is perpendicular to line $p$ in the $xy$-plane. What is the slope of line $r$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$-4$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$-\\frac{1}{4}$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$\\frac{1}{4}$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$4$"
      }
    ],
    "correctAnswer": "C"
  },
  "1993561d": {
    "prompt": "For the linear function $f$, the graph of $y = f(x)$ in the $xy$-plane has a slope of $\\frac{1}{3}$ and passes through the point $(0, 5)$. Which equation defines $f$?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$f(x) = \\frac{1}{3}x + 5$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$f(x) = \\frac{1}{3}x + 3$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$f(x) = \\frac{1}{3}x - \\frac{5}{3}$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$f(x) = \\frac{1}{3}x - 5$"
      }
    ],
    "correctAnswer": "A"
  },
  "8c515062": {
    "prompt": "A candle is made of $17$ ounces of wax. When the candle is burning, the amount of wax in the candle decreases by $1$ ounce every $4$ hours. If $6$ ounces of wax remain in this candle, for how many hours has it been burning?",
    "options": [
      {
        "id": "A",
        "label": "A",
        "text": "$3$"
      },
      {
        "id": "B",
        "label": "B",
        "text": "$6$"
      },
      {
        "id": "C",
        "label": "C",
        "text": "$24$"
      },
      {
        "id": "D",
        "label": "D",
        "text": "$44$"
      }
    ],
    "correctAnswer": "D"
  },
  "17d80dc3": {
    "prompt": "In the $xy$-plane, line $k$ has a slope of $5$ and a $y$-intercept of $(0, -35)$. What is the $x$-coordinate of the $x$-intercept of line $k$?",
    "correctAnswer": "7",
    "acceptedAnswers": [
      "7"
    ],
    "questionType": "spr",
    "options": []
  },
  "9aaf7786": {
    "prompt": "In the $xy$-plane, line $p$ has a slope of $-\\frac{5}{3}$ and an $x$-intercept of $(-6, 0)$. What is the $y$-coordinate of the $y$-intercept of line $p$?",
    "correctAnswer": "-10",
    "acceptedAnswers": [
      "-10"
    ],
    "questionType": "spr",
    "options": []
  },
  "9c7741c6": {
    "prompt": "On a 210-mile trip, Cameron drove at an average speed of 60 miles per hour for the first $x$ hours. He then completed the trip, driving at an average speed of 50 miles per hour for the remaining $y$ hours. If $x = 1$, what is the value of $y$?",
    "correctAnswer": "3",
    "acceptedAnswers": [
      "3"
    ],
    "questionType": "spr",
    "options": []
  },
  "3c4ce699": {
    "prompt": "If $6 + x = 9$, what is the value of $18 + 3x$?",
    "correctAnswer": "27",
    "acceptedAnswers": [
      "27"
    ],
    "questionType": "spr",
    "options": []
  },
  "0b0fa68b": {
    "prompt": "For the function $f$, $f(cx) = x - 8$ for all values of $x$, where $c$ is a positive constant. If $f(2) = 35$, what is the value of $c$?",
    "correctAnswer": "2/43",
    "acceptedAnswers": [
      ".0465",
      "2/43",
      "0.0465"
    ],
    "questionType": "spr",
    "options": []
  },
  "ce6b52d8": {
    "prompt": "If $2(3t - 10) + t = 40 + 4t$, what is the value of $3t$?",
    "correctAnswer": "60",
    "acceptedAnswers": [
      "60"
    ],
    "questionType": "spr",
    "options": []
  },
  "4f7981a0": {
    "prompt": "If $3x + 2 = 8$, what is the value of $9x + 6$?",
    "correctAnswer": "24",
    "acceptedAnswers": [
      "24"
    ],
    "questionType": "spr",
    "options": []
  },
  "a4989860": {
    "prompt": "A line in the $xy$-plane has a slope of $9$ and passes through the point $(0, -5)$. The equation $y = px + r$ defines the line, where $p$ and $r$ are constants. What is the value of $p$?",
    "correctAnswer": "9",
    "acceptedAnswers": [
      "9"
    ],
    "questionType": "spr",
    "options": []
  },
  "a4d6fbec": {
    "prompt": "If $y = 5x + 10$, what is the value of $y$ when $x = 8$?",
    "correctAnswer": "50",
    "acceptedAnswers": [
      "50"
    ],
    "questionType": "spr",
    "options": []
  }
};
