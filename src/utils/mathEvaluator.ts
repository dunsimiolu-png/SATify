/**
 * Digital SAT Student-Produced Response (SPR) Math Evaluation Engine
 * Validates mathematical equivalence across fractions, decimals, rounding, and negative numbers.
 */

/**
 * Parses a numeric value from string supporting integers, decimals (.5, 0.5), and fractions (3/5, -7/2)
 */
export function parseMathValue(val: string): number | null {
  if (!val) return null;
  const s = val.trim();
  if (s === '' || s === '-' || s === '.') return null;

  // Fraction case (e.g. 3/5, -7/2)
  if (s.includes('/')) {
    const parts = s.split('/');
    if (parts.length === 2) {
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      if (!isNaN(num) && !isNaN(den) && den !== 0) {
        return num / den;
      }
    }
    return null;
  }

  // Decimal / Integer case
  const num = parseFloat(s);
  return !isNaN(num) ? num : null;
}

/**
 * Checks if a user's answer matches the official answer or any accepted equivalent forms
 */
export function evaluateNumericEquivalence(
  userAnswer: string,
  officialAnswer: string,
  acceptedAnswers?: string[]
): boolean {
  if (!userAnswer || !officialAnswer) return false;
  const u = userAnswer.trim();
  const o = officialAnswer.trim();

  // 1. Direct exact or lowercase match
  if (u.toLowerCase() === o.toLowerCase()) return true;

  // 2. Check explicitly provided acceptedAnswers array
  if (acceptedAnswers && acceptedAnswers.length > 0) {
    for (const ans of acceptedAnswers) {
      if (ans.trim().toLowerCase() === u.toLowerCase()) return true;
    }
  }

  // 3. Extract all possible valid answer strings from official answer string
  // (e.g. ".1764, .1765, 3/17" or "3/5 or 0.6")
  const candidateOfficialStrings: string[] = [];
  if (acceptedAnswers && acceptedAnswers.length > 0) {
    candidateOfficialStrings.push(...acceptedAnswers);
  }
  // Split comma or 'or' separated answers in official string
  const splitCandidates = o.split(/[,;]|\bor\b/i).map(s => s.trim()).filter(Boolean);
  candidateOfficialStrings.push(...splitCandidates);

  for (const cand of candidateOfficialStrings) {
    if (cand.toLowerCase() === u.toLowerCase()) return true;
    // Normalize leading dot (e.g. ".6" -> "0.6")
    const uNorm = u.startsWith('.') ? '0' + u : u.startsWith('-.') ? '-0.' + u.slice(2) : u;
    const cNorm = cand.startsWith('.') ? '0' + cand : cand.startsWith('-.') ? '-0.' + cand.slice(2) : cand;
    if (uNorm === cNorm) return true;
  }

  // 4. Numeric evaluation
  const userNum = parseMathValue(u);
  if (userNum === null) return false;

  for (const cand of candidateOfficialStrings) {
    const candNum = parseMathValue(cand);
    if (candNum === null) continue;

    // Direct floating-point match within tolerance
    const diff = Math.abs(userNum - candNum);
    if (diff < 1e-4) return true;

    // SAT Relative Tolerance: within 0.1% or rounding to 3-4 significant figures
    const relativeDiff = Math.abs(candNum) > 0 ? diff / Math.abs(candNum) : diff;
    if (relativeDiff < 0.002) return true;

    // SAT Rounding / Truncation Check:
    // When a fraction produces an infinite decimal like 1/3 = 0.3333... or 2/3 = 0.6666...
    // Official Bluebook accepts truncation (0.333, 0.666) and rounding (0.3333, 0.667).
    const candStr4 = candNum.toFixed(4);
    const candStr3 = candNum.toFixed(3);
    const userStr4 = userNum.toFixed(4);
    const userStr3 = userNum.toFixed(3);

    if (userStr4 === candStr4 || userStr3 === candStr3) return true;

    // Check truncation without rounding (e.g. 2/3 = 0.6666... -> user types .666 or 0.666)
    const candAbsStr = String(Math.abs(candNum));
    const uAbsStr = String(Math.abs(userNum));
    if (candAbsStr.startsWith(uAbsStr) && uAbsStr.length >= 4) return true;
  }

  return false;
}

/**
 * Formats live preview and badge helper text for the Student-Produced Response input box
 */
export function formatSprPreview(input: string): {
  display: string;
  valueNum: number | null;
  isValid: boolean;
  helperText: string;
} {
  if (!input || input.trim() === '') {
    return {
      display: 'Empty',
      valueNum: null,
      isValid: false,
      helperText: 'Enter a number, fraction (e.g. 3/5), or decimal (e.g. 0.6)',
    };
  }

  const s = input.trim();

  // Validate character set: only 0-9, ., /, and leading -
  if (!/^-?[0-9.\/]*$/.test(s)) {
    return {
      display: s,
      valueNum: null,
      isValid: false,
      helperText: 'Invalid characters. Use only digits 0-9, ., /, and leading -',
    };
  }

  if (s === '-') {
    return {
      display: '-',
      valueNum: null,
      isValid: false,
      helperText: 'Negative sign entered...',
    };
  }

  if (s.includes('/')) {
    const parts = s.split('/');
    if (parts.length > 2) {
      return {
        display: s,
        valueNum: null,
        isValid: false,
        helperText: 'Invalid fraction format (multiple slashes)',
      };
    }
    if (parts[1] === '') {
      return {
        display: s,
        valueNum: null,
        isValid: false,
        helperText: 'Enter denominator...',
      };
    }
    const num = parseFloat(parts[0]);
    const den = parseFloat(parts[1]);
    if (den === 0) {
      return {
        display: s,
        valueNum: null,
        isValid: false,
        helperText: 'Division by zero is undefined',
      };
    }
    if (!isNaN(num) && !isNaN(den)) {
      const dec = num / den;
      const decFormatted = Number.isInteger(dec) ? String(dec) : dec.toFixed(4).replace(/0+$/, '');
      return {
        display: `${parts[0]}/${parts[1]}`,
        valueNum: dec,
        isValid: true,
        helperText: `Fraction: ${s} ≈ ${decFormatted}`,
      };
    }
  }

  const val = parseMathValue(s);
  if (val !== null) {
    const isInt = Number.isInteger(val);
    return {
      display: s.startsWith('.') ? '0' + s : s,
      valueNum: val,
      isValid: true,
      helperText: isInt ? `Integer: ${val}` : `Decimal: ${val}`,
    };
  }

  return {
    display: s,
    valueNum: null,
    isValid: false,
    helperText: 'Incomplete number',
  };
}
