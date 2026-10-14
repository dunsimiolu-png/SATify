export interface AttemptRecord {
  questionId: string;
  selectedOption: string; // 'A' | 'B' | 'C' | 'D'
  isCorrect: boolean;
  timestamp: number;
  timeSpentSeconds: number;
  skill: string;
  domain: string;
  difficulty: string;
}

export interface UserAnswerRecord {
  questionId: string;
  selectedChoice: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  domain: string;
  skill: string;
  difficulty: string;
  timestamp: number;
  timeSpentSeconds: number;
}

export interface DayActivity {
  date: string;
  label: string; // e.g. "Oct 12"
  correct: number;
  wrong: number;
  total: number;
}

export const STORAGE_KEYS = {
  ATTEMPTS: 'satify_attempts',
  ANSWERS: 'satify_answers_v2',
  USER_STATES: 'satify_user_states',
  SAVED: 'satify_saved_questions',
  STREAK: 'satify_study_streak',
  CUSTOM_VOCAB: 'satify_custom_vocab',
  VOCAB_PROGRESS: 'satify_vocab_progress',
  SOUND_ENABLED: 'satify_sound_enabled',
};

// -----------------------------------------------------------------------------
// Unified satify_attempts Store
// -----------------------------------------------------------------------------
export function getAttempts(): AttemptRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }

    // Fallback migration from legacy answers
    const legacy = localStorage.getItem(STORAGE_KEYS.ANSWERS);
    if (legacy) {
      const parsedLegacy = JSON.parse(legacy);
      const migrated: AttemptRecord[] = Object.values(parsedLegacy).map((a: any) => ({
        questionId: a.questionId,
        selectedOption: a.selectedChoice || a.selectedOption,
        isCorrect: !!a.isCorrect,
        timestamp: a.timestamp || Date.now(),
        timeSpentSeconds: a.timeSpentSeconds || 30,
        skill: a.skill || '',
        domain: a.domain || '',
        difficulty: a.difficulty || 'Medium',
      }));
      localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(migrated));
      return migrated;
    }

    return [];
  } catch (e) {
    console.error('Failed to load satify_attempts from localStorage', e);
    return [];
  }
}

export function getLatestAttemptsMap(): Record<string, AttemptRecord> {
  const attempts = getAttempts();
  const map: Record<string, AttemptRecord> = {};
  for (const a of attempts) {
    // Keep the most recent attempt for each question
    if (!map[a.questionId] || a.timestamp >= map[a.questionId].timestamp) {
      map[a.questionId] = a;
    }
  }
  return map;
}

export function recordAttempt(attempt: AttemptRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const attempts = getAttempts();
    // Remove previous attempt for same question or append to history
    // We update the record for the question and place latest at end
    const filtered = attempts.filter(a => a.questionId !== attempt.questionId);
    filtered.push(attempt);
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(filtered));

    // Also mirror to legacy answers map for any third-party compatibility
    const legacyAnswers = getSavedAnswers();
    legacyAnswers[attempt.questionId] = {
      questionId: attempt.questionId,
      selectedChoice: (attempt.selectedOption as 'A' | 'B' | 'C' | 'D') || 'A',
      isCorrect: attempt.isCorrect,
      domain: attempt.domain,
      skill: attempt.skill,
      difficulty: attempt.difficulty,
      timestamp: attempt.timestamp,
      timeSpentSeconds: attempt.timeSpentSeconds,
    };
    localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(legacyAnswers));

    updateStudyStreak();

    // Trigger reactive update across open components
    window.dispatchEvent(new CustomEvent('satify_storage_update'));
  } catch (e) {
    console.error('Failed to record attempt to localStorage', e);
  }
}

export function recordAnswer(
  questionId: string,
  selectedChoice: 'A' | 'B' | 'C' | 'D',
  isCorrect: boolean,
  domain: string,
  skill: string,
  difficulty: string,
  timeSpentSeconds: number = 30
): void {
  recordAttempt({
    questionId,
    selectedOption: selectedChoice,
    isCorrect,
    domain,
    skill,
    difficulty,
    timestamp: Date.now(),
    timeSpentSeconds,
  });
}

export function getSavedAnswers(): Record<string, UserAnswerRecord> {
  const map = getLatestAttemptsMap();
  const answers: Record<string, UserAnswerRecord> = {};
  for (const [id, a] of Object.entries(map)) {
    answers[id] = {
      questionId: a.questionId,
      selectedChoice: (a.selectedOption as 'A' | 'B' | 'C' | 'D') || 'A',
      isCorrect: a.isCorrect,
      domain: a.domain,
      skill: a.skill,
      difficulty: a.difficulty,
      timestamp: a.timestamp,
      timeSpentSeconds: a.timeSpentSeconds,
    };
  }
  return answers;
}

export function getAnsweredQuestionIds(): Set<string> {
  return new Set(getAttempts().map(a => a.questionId));
}

export function getIncorrectAttempts(): AttemptRecord[] {
  const map = getLatestAttemptsMap();
  return Object.values(map).filter(a => !a.isCorrect);
}

export function getIncorrectQuestionIds(): string[] {
  return getIncorrectAttempts().map(a => a.questionId);
}

// -----------------------------------------------------------------------------
// Guarded Reset Progress Function
// -----------------------------------------------------------------------------
export function clearAllProgress(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
    localStorage.removeItem(STORAGE_KEYS.ANSWERS);
    localStorage.removeItem(STORAGE_KEYS.USER_STATES);
    localStorage.removeItem(STORAGE_KEYS.STREAK);
    window.dispatchEvent(new CustomEvent('satify_storage_update'));
  } catch (e) {
    console.error('Failed to clear progress', e);
  }
}

// -----------------------------------------------------------------------------
// Saved & Bookmarked Questions
// -----------------------------------------------------------------------------
export function getSavedQuestionIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function isQuestionSaved(id: string): boolean {
  const list = getSavedQuestionIds();
  return list.includes(id);
}

export function toggleSaveQuestion(id: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const list = getSavedQuestionIds();
    let updated: string[];
    let isNowSaved = false;
    if (list.includes(id)) {
      updated = list.filter(item => item !== id);
      isNowSaved = false;
    } else {
      updated = [...list, id];
      isNowSaved = true;
    }
    localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('satify_storage_update'));
    return isNowSaved;
  } catch (e) {
    return false;
  }
}

// -----------------------------------------------------------------------------
// Daily Study Streak
// -----------------------------------------------------------------------------
export function getStudyStreak(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STREAK);
    if (!raw) return 0;
    const data = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    if (data.lastDate === today) {
      return data.streak || 1;
    } else if (data.lastDate === yesterday) {
      return data.streak || 1;
    } else {
      // Missed more than 1 day
      return 1;
    }
  } catch (e) {
    return 0;
  }
}

export function updateStudyStreak(): number {
  if (typeof window === 'undefined') return 1;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const raw = localStorage.getItem(STORAGE_KEYS.STREAK);

    let streak = 1;
    if (raw) {
      const data = JSON.parse(raw);
      if (data.lastDate === today) {
        return data.streak || 1;
      } else if (data.lastDate === yesterday) {
        streak = (data.streak || 1) + 1;
      } else {
        streak = 1;
      }
    }

    localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify({ streak, lastDate: today }));
    return streak;
  } catch (e) {
    return 1;
  }
}

// -----------------------------------------------------------------------------
// 10-Day Activity Trend Bar Chart Data
// -----------------------------------------------------------------------------
export function get10DayActivityTrend(): DayActivity[] {
  const attempts = getAttempts();
  const days: DayActivity[] = [];

  for (let i = 9; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dateStr = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const dayAttempts = attempts.filter(a => {
      const aDate = new Date(a.timestamp).toISOString().slice(0, 10);
      return aDate === dateStr;
    });

    const correct = dayAttempts.filter(a => a.isCorrect).length;
    const wrong = dayAttempts.length - correct;

    days.push({
      date: dateStr,
      label,
      correct,
      wrong,
      total: dayAttempts.length,
    });
  }

  return days;
}

// -----------------------------------------------------------------------------
// Aggregated Question Analytics
// -----------------------------------------------------------------------------
export function getQuestionAnalytics() {
  const map = getLatestAttemptsMap();
  const records = Object.values(map);
  const attempted = records.length;
  const correct = records.filter(a => a.isCorrect).length;
  const wrong = attempted - correct;
  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
  const savedCount = getSavedQuestionIds().length;
  const streak = attempted > 0 ? getStudyStreak() : 0;

  return {
    attempted,
    correct,
    wrong,
    accuracy,
    savedCount,
    streak,
  };
}

export function getSkillStatsMap() {
  const map = getLatestAttemptsMap();
  const stats: Record<string, { attempted: number; correct: number; wrong: number; timeSeconds: number }> = {};

  for (const a of Object.values(map)) {
    if (!stats[a.skill]) {
      stats[a.skill] = { attempted: 0, correct: 0, wrong: 0, timeSeconds: 0 };
    }
    stats[a.skill].attempted++;
    if (a.isCorrect) stats[a.skill].correct++;
    else stats[a.skill].wrong++;
    stats[a.skill].timeSeconds += a.timeSpentSeconds || 35;
  }

  return stats;
}
