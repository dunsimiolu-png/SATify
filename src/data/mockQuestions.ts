import rawQuestions from './questions.json';
import rawMathQuestions from './mathQuestions.json';
import { MockQuestion, AnswerChoice, SectionType } from '../types/quiz';
import { normalizeExplanationText } from '../utils/formatExplanation';

// Filter rawQuestions to ensure only Reading & Writing questions are taken from questions.json
const rawRWQuestions = (rawQuestions as any[]).filter(
  q => q.section === 'Reading and Writing' || q.section === 'Reading & Writing'
);

// Map Reading & Writing questions
export const allEnglishQuestions: MockQuestion[] = rawRWQuestions.map((q, idx) => {
  const options: AnswerChoice[] = (q.options || []).map((opt: any) => ({
    id: (opt.id || opt.label) as 'A' | 'B' | 'C' | 'D',
    label: (opt.label || opt.id) as 'A' | 'B' | 'C' | 'D',
    text: opt.text || '',
    imageUrl: opt.imageUrl,
  }));

  return {
    id: q.id,
    questionNumber: idx + 1,
    totalQuestions: rawRWQuestions.length,
    section: 'Reading and Writing' as SectionType,
    module: 1,
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

// Map dedicated Math questions from mathQuestions.json
export const allMathQuestions: MockQuestion[] = (rawMathQuestions as any[]).map((q, idx) => {
  const options: AnswerChoice[] = (q.options || []).map((opt: any) => ({
    id: (opt.id || opt.label) as 'A' | 'B' | 'C' | 'D',
    label: (opt.label || opt.id) as 'A' | 'B' | 'C' | 'D',
    text: opt.text || '',
    imageUrl: opt.imageUrl,
  }));

  return {
    id: q.id,
    questionNumber: idx + 1,
    totalQuestions: rawMathQuestions.length,
    section: 'Math' as SectionType,
    module: 1,
    difficulty: q.difficulty,
    domain: q.domain,
    skill: q.skill,
    questionType: (q.questionType || (options.length === 0 ? 'spr' : 'mcq')) as 'mcq' | 'spr',
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

// Complete unified question store with sequential global numbering
export const allQuestions: MockQuestion[] = [...allEnglishQuestions, ...allMathQuestions].map((q, idx, arr) => ({
  ...q,
  questionNumber: idx + 1,
  totalQuestions: arr.length,
}));

export const mockQuestions: MockQuestion[] = allQuestions.slice(0, 25);
