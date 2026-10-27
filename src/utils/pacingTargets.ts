import { DifficultyLevel } from '../types/quiz';

export type RushMode = 'blitz' | 'normal' | 'relaxed';

export interface SkillPacingMatrix {
  Easy: number;
  Medium: number;
  Hard: number;
}

export const SKILL_PACING_MATRIX: Record<string, SkillPacingMatrix> = {
  'Boundaries': { Easy: 25, Medium: 35, Hard: 50 },
  'Form, Structure, and Sense': { Easy: 25, Medium: 35, Hard: 45 },
  'Transitions': { Easy: 25, Medium: 35, Hard: 50 },
  'Words in Context': { Easy: 25, Medium: 40, Hard: 55 },
  'Rhetorical Synthesis': { Easy: 35, Medium: 50, Hard: 65 },
  'Text Structure and Purpose': { Easy: 45, Medium: 65, Hard: 90 },
  'Central Ideas and Details': { Easy: 50, Medium: 70, Hard: 95 },
  'Cross-Text Connections': { Easy: 60, Medium: 85, Hard: 110 },
  'Command of Evidence': { Easy: 60, Medium: 85, Hard: 115 },
  'Inferences': { Easy: 60, Medium: 85, Hard: 120 },
};

export const DEFAULT_PACING: SkillPacingMatrix = {
  Easy: 45,
  Medium: 65,
  Hard: 85,
};

/**
 * Returns true if the skill belongs to grammar or vocabulary conventions.
 */
export function isGrammarOrVocabSkill(skill: string): boolean {
  const grammarVocabSkills = [
    'Boundaries',
    'Form, Structure, and Sense',
    'Transitions',
    'Words in Context',
    'Rhetorical Synthesis',
  ];
  return grammarVocabSkills.some(s => skill.toLowerCase().includes(s.toLowerCase()));
}

/**
 * Calculates the exact target time in seconds for a question based on its skill, difficulty,
 * and whether it includes an image (+10s bonus).
 */
export function getQuestionTargetSeconds(
  question: { section?: string; domain?: string; skill?: string; difficulty?: DifficultyLevel | string; imageUrl?: string },
  mode: RushMode = 'normal'
): number {
  const isMath = question.section === 'Math' || ['Algebra', 'Advanced Math', 'Problem-Solving and Data Analysis', 'Geometry and Trigonometry'].includes(question.domain || '');
  const diff: DifficultyLevel = (question.difficulty as DifficultyLevel) || 'Medium';

  let baseSeconds = 65;
  if (isMath) {
    baseSeconds = diff === 'Easy' ? 75 : diff === 'Hard' ? 120 : 95;
  } else {
    const skillName = question.skill || '';
    let pacing = DEFAULT_PACING;
    for (const [key, matrix] of Object.entries(SKILL_PACING_MATRIX)) {
      if (skillName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(skillName.toLowerCase())) {
        pacing = matrix;
        break;
      }
    }
    baseSeconds = pacing[diff] || DEFAULT_PACING[diff] || 65;
  }

  // Add +10 extra seconds for table / graph questions
  if (question.imageUrl) {
    baseSeconds += 10;
  }

  // Scale according to Rush mode
  if (mode === 'blitz') {
    return Math.max(10, Math.round(baseSeconds * 0.8));
  } else if (mode === 'relaxed') {
    return Math.round(baseSeconds * 1.25);
  }

  return baseSeconds;
}

/**
 * Calculates star rating (0 to 3) for Question Rush:
 * - ⭐⭐⭐: correct within 75% target (reading) or 70% target (grammar/vocab)
 * - ⭐⭐: correct within 100% target
 * - ⭐: correct over target
 * - 0: incorrect
 */
export function calculateRushStars(
  isCorrect: boolean,
  elapsedSeconds: number,
  targetSeconds: number,
  skill?: string
): number;
export function calculateRushStars(
  elapsedSeconds: number,
  targetSeconds: number,
  skill: string,
  isCorrect: boolean
): number;
export function calculateRushStars(
  arg1: boolean | number,
  arg2: number,
  arg3: string | number,
  arg4?: boolean | string
): number {
  let isCorrect: boolean;
  let elapsedSeconds: number;
  let targetSeconds: number;
  let skill = '';

  if (typeof arg1 === 'boolean') {
    // Called as: calculateRushStars(isCorrect, elapsedTime, targetSeconds, skill?)
    isCorrect = arg1;
    elapsedSeconds = arg2;
    targetSeconds = typeof arg3 === 'number' ? arg3 : 60;
    if (typeof arg4 === 'string') skill = arg4;
  } else if (typeof arg4 === 'boolean') {
    // Called as: calculateRushStars(elapsedSeconds, targetSeconds, skill, isCorrect)
    elapsedSeconds = arg1;
    targetSeconds = arg2;
    skill = typeof arg3 === 'string' ? arg3 : '';
    isCorrect = arg4;
  } else {
    elapsedSeconds = Number(arg1) || 0;
    targetSeconds = arg2 || 60;
    isCorrect = Boolean(arg3);
  }

  if (!isCorrect) return 0;

  const isGrammarVocab = isGrammarOrVocabSkill(skill);
  const threeStarRatio = isGrammarVocab ? 0.70 : 0.75;
  const threeStarThreshold = targetSeconds * threeStarRatio;

  if (elapsedSeconds <= threeStarThreshold) {
    return 3;
  }
  if (elapsedSeconds <= targetSeconds) {
    return 2;
  }
  return 1;
}

/**
 * Formats a duration in seconds to M:SS (e.g. 42 -> "0:42", 115 -> "1:55").
 */
export function formatSecondsToPace(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Returns color classes for the live per-question pace pill.
 * - < 80%: neutral
 * - 80% - 100%: amber
 * - > 100%: red
 */
export function getPacePillColor(
  elapsedSeconds: number,
  targetSeconds: number,
  isDarkTheme: boolean = true
): {
  badgeClass: string;
  dotClass: string;
  status: 'neutral' | 'warning' | 'danger';
} {
  const ratio = targetSeconds > 0 ? elapsedSeconds / targetSeconds : 0;

  if (ratio > 1.0) {
    return {
      badgeClass: isDarkTheme
        ? 'bg-rose-950/50 text-rose-300 border-rose-500/50 animate-pulse'
        : 'bg-rose-50 text-rose-700 border-rose-300',
      dotClass: 'bg-rose-500',
      status: 'danger',
    };
  }

  if (ratio >= 0.8) {
    return {
      badgeClass: isDarkTheme
        ? 'bg-amber-950/40 text-amber-300 border-amber-500/40'
        : 'bg-amber-50 text-amber-800 border-amber-300',
      dotClass: 'bg-amber-400',
      status: 'warning',
    };
  }

  return {
    badgeClass: isDarkTheme
      ? 'bg-[#1e1e24] text-[#a1a1aa] border-[#2e2e36]'
      : 'bg-gray-100 text-gray-700 border-gray-300',
    dotClass: 'bg-[#71717a]',
    status: 'neutral',
  };
}
