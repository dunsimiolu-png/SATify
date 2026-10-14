export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export type SectionType = 'Reading and Writing' | 'Math';

export type EnglishDomain = 
  | 'Craft and Structure'
  | 'Expression of Ideas'
  | 'Information and Ideas'
  | 'Standard English Conventions';

export interface AnswerChoice {
  id: 'A' | 'B' | 'C' | 'D';
  label?: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface ChoiceExplanation {
  id: 'A' | 'B' | 'C' | 'D' | string;
  isCorrect: boolean;
  explanation: string;
}

export interface RationaleData {
  correctChoice?: 'A' | 'B' | 'C' | 'D' | string;
  summary: string;
  optionsAnalysis?: ChoiceExplanation[];
}

export interface MockQuestion {
  id: string; // 8-char hex/hash
  questionNumber: number;
  totalQuestions: number;
  section: 'Reading and Writing';
  module?: number;
  difficulty: DifficultyLevel;
  domain: string;
  skill: string;
  
  // Left pane: Reading passage
  passage: string;
  passageText?: string;
  passageTitle?: string;
  imageUrl?: string;
  
  // Right pane: Prompt and 4 options A-D
  prompt: string;
  stem?: string; // backwards compatibility alias for prompt
  options: AnswerChoice[];
  choices?: AnswerChoice[]; // backwards compatibility alias for options
  correctAnswer: 'A' | 'B' | 'C' | 'D' | string;
  
  // Rationale
  rationale: string | RationaleData;
}

export interface UserQuestionState {
  selectedChoice: 'A' | 'B' | 'C' | 'D' | null;
  eliminatedChoices: ('A' | 'B' | 'C' | 'D')[];
  isMarkedForReview: boolean;
  isAnswerChecked: boolean;
  isExplanationOpen: boolean;
}

export type HighlightColor = 'yellow' | 'blue' | 'pink';
export type UnderlineStyle = 'solid' | 'dashed' | 'dotted';

export interface TextHighlight {
  id: string;
  target: 'passage' | 'stem' | 'prompt';
  start: number;
  end: number;
  text: string;
  color: HighlightColor;
  isUnderlined: boolean;
  underlineStyle: UnderlineStyle;
  note?: string;
}

export interface EnglishFilterConfig {
  test: 'SAT';
  masterCategory: boolean; // Reading & Writing master checkbox
  selectedDomains: string[]; // Craft and Structure, Expression of Ideas, Information and Ideas, Standard English Conventions
  selectedSkills: string[]; // Specific skills selected
  selectedDifficulties: DifficultyLevel[]; // Easy, Medium, Hard
  shuffle: boolean;
  excludeActive?: boolean; // backwards compatibility alias for hideAnswered
  hideAnswered?: boolean; // Hide questions already answered in localStorage
}
