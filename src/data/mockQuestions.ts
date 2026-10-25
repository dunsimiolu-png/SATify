import rawQuestions from './questions.json';
import { MockQuestion } from '../types/quiz';
import { normalizeExplanationText } from '../utils/formatExplanation';

export const allEnglishQuestions: MockQuestion[] = (rawQuestions as any[]).map((q, idx) => ({
  id: q.id,
  questionNumber: idx + 1,
  totalQuestions: rawQuestions.length,
  section: 'Reading and Writing',
  module: 1,
  difficulty: q.difficulty,
  domain: q.domain,
  skill: q.skill,
  passage: q.passage,
  passageText: q.passage,
  imageUrl: q.imageUrl,
  prompt: q.prompt,
  stem: q.prompt,
  options: q.options.map((opt: any) => ({
    id: (opt.id || opt.label) as 'A' | 'B' | 'C' | 'D',
    label: (opt.label || opt.id) as 'A' | 'B' | 'C' | 'D',
    text: opt.text,
  })),
  choices: q.options.map((opt: any) => ({
    id: (opt.id || opt.label) as 'A' | 'B' | 'C' | 'D',
    label: (opt.label || opt.id) as 'A' | 'B' | 'C' | 'D',
    text: opt.text,
  })),
  correctAnswer: q.correctAnswer,
  rationale: typeof q.rationale === 'string' ? normalizeExplanationText(q.rationale) : q.rationale,
}));

export const mockQuestions: MockQuestion[] = allEnglishQuestions.slice(0, 25);
