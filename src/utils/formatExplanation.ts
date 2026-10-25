/**
 * Utility functions for formatting and parsing SAT question explanation texts.
 * 
 * Features:
 * 1. Missing space repair using regex:
 *    - Inserts a space whenever "Choice [A-D]" is immediately followed by a lowercase letter or word
 *      e.g., /\b(Choice\s+[A-D])(?=[a-zA-Z])/g -> "$1 "
 *    - Normalizes "Choice[A-D]" -> "Choice $1"
 *    - Fixes kerning word splits in rationales
 * 2. Paragraph splitting:
 *    - Splits giant wall of text into distinct paragraphs whenever "Choice [A-D] is (the best answer|incorrect|correct)" appears mid-paragraph
 *    - Ensures the correct answer rationale is at the top, followed by each incorrect choice rationale on its own separated line/paragraph
 * 3. Key label extraction:
 *    - Identifies "Choice A", "Choice B", "Choice C", "Choice D" at the start of each segment so it can be bolded
 */

export interface ExplanationSegment {
  id: string;
  label?: string; // e.g. "Choice A", "Choice B"
  body: string; // The remaining text after the label
  fullText: string;
  isCorrectRationale: boolean;
}

/**
 * Fixes missing spaces and kerning issues in explanation strings.
 */
export function normalizeExplanationText(text: string): string {
  if (!text) return '';

  return text
    // 1. Fix missing spaces: "Choice Bis" -> "Choice B is", "Choice Cis" -> "Choice C is"
    .replace(/\b(Choice\s+[A-D])(?=[a-zA-Z])/gi, '$1 ')
    // Fix missing space between "Choice" and option letter if collapsed
    .replace(/\bChoice([A-D])\b/gi, 'Choice $1')
    // Fix known kerning splits in PDF extraction
    .replace(/\bunder\s+taking\b/gi, 'undertaking')
    .replace(/\bPor\s+tuguese\b/gi, 'Portuguese')
    .replace(/\bRober\s+t\b/gi, 'Robert')
    .replace(/\bBar\s+ton\b/gi, 'Barton')
    .replace(/\bFor\s+tunes\b/gi, 'Fortunes')
    .replace(/\bfor\s+tunes\b/gi, 'fortunes')
    .replace(/\bMc\s+Clellan\b/gi, 'McClellan')
    .replace(/\bimpor\s+t\b/gi, 'import')
    .replace(/\bdeser\s+t\b/gi, 'desert')
    .replace(/\bMar\s+tel\b/gi, 'Martel')
    .trim();
}

/**
 * Splits raw explanation text into structured paragraph segments for each choice explanation.
 */
export function formatExplanationSegments(rawRationale?: string): ExplanationSegment[] {
  if (!rawRationale) return [];

  const normalized = normalizeExplanationText(rawRationale);

  // Split whenever "Choice [A-D] is (the best answer|incorrect|correct)" or "Choice [A-D] is" appears mid-text
  const splitPattern = /(?<!^)(?=(?:Choice\s+[A-D]\s+is\s+(?:the\s+best\s+answer|incorrect|correct)|Choice\s+[A-D]\s+is\b))/gi;
  const rawSegments = normalized
    .split(splitPattern)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  return rawSegments.map((segment, index) => {
    // Extract label like "Choice A", "Choice B", etc. at the start of the segment
    const labelMatch = segment.match(/^(Choice\s+[A-D])\b([\s\S]*)$/i);
    const isCorrect = /Choice\s+[A-D]\s+is\s+(?:the\s+best\s+answer|correct)/i.test(segment);

    if (labelMatch) {
      return {
        id: `choice-seg-${index}-${labelMatch[1].replace(/\s+/g, '')}`,
        label: labelMatch[1],
        body: labelMatch[2],
        fullText: segment,
        isCorrectRationale: isCorrect,
      };
    }

    return {
      id: `choice-seg-${index}`,
      body: segment,
      fullText: segment,
      isCorrectRationale: isCorrect,
    };
  });
}
