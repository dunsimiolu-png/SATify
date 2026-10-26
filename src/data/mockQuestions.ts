import rawQuestions from './questions.json';
import { MockQuestion, AnswerChoice } from '../types/quiz';
import { normalizeExplanationText } from '../utils/formatExplanation';

export const allQuestions: MockQuestion[] = (rawQuestions as any[]).map((q, idx) => {
  const options: AnswerChoice[] = (q.options || []).map((opt: any) => ({
    id: (opt.id || opt.label) as 'A' | 'B' | 'C' | 'D',
    label: (opt.label || opt.id) as 'A' | 'B' | 'C' | 'D',
    text: opt.text || '',
    imageUrl: opt.imageUrl,
  }));

  return {
    id: q.id,
    questionNumber: idx + 1,
    totalQuestions: rawQuestions.length,
    section: (q.section || 'Reading and Writing') as 'Reading and Writing' | 'Math',
    module: q.section === 'Math' ? 1 : 1,
    difficulty: q.difficulty,
    domain: q.domain,
    skill: q.skill,
    questionType: q.questionType || (options.length === 0 ? 'spr' : 'mcq'),
    passage: q.passage || '',
    passageText: q.passage || '',
    imageUrl: q.imageUrl,
    prompt: q.prompt,
    stem: q.prompt,
    options,
    choices: options,
    correctAnswer: q.correctAnswer,
    acceptedAnswers: q.acceptedAnswers,
    rationale: typeof q.rationale === 'string' ? normalizeExplanationText(q.rationale) : q.rationale,
  };
});

export const allEnglishQuestions: MockQuestion[] = allQuestions.filter(
  q => q.section === 'Reading and Writing'
);

export const allMathQuestions: MockQuestion[] = allQuestions.filter(
  q => q.section === 'Math'
);

export const mockQuestions: MockQuestion[] = allQuestions.slice(0, 25);
