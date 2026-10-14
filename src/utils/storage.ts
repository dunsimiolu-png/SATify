import { getCurrentUser } from './auth';

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
  VOCAB_DECKS: 'satify_vocab_decks',
  VOCAB_RATINGS: 'satify_vocab_word_ratings',
  SOUND_ENABLED: 'satify_sound_enabled',
};

/**
 * Returns a normalized identifier for the active account (or 'guest')
 */
export function getUserScope(): string {
  if (typeof window === 'undefined') return 'guest';
  try {
    const user = getCurrentUser();
    if (user?.email) {
      return `usr_${user.email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    }
    if (user?.id) {
      return `usr_${user.id.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    }
  } catch (e) {
    console.warn('Failed to resolve user scope:', e);
  }
  return 'guest';
}

/**
 * Generates an account-scoped localStorage key
 */
export function getScopedKey(baseKey: string): string {
  const scope = getUserScope();
  return `${baseKey}_${scope}`;
}

// -----------------------------------------------------------------------------
// Unified satify_attempts Store (Scoped to active user account)
// -----------------------------------------------------------------------------
export function getAttempts(): AttemptRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = getScopedKey(STORAGE_KEYS.ATTEMPTS);
    let raw = localStorage.getItem(key);

    // Fallback: If guest and scoped key has nothing yet, check legacy un-scoped key
    if (!raw && getUserScope() === 'guest') {
      raw = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    }

    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }

    // Fallback migration from legacy answers
    const answersKey = getScopedKey(STORAGE_KEYS.ANSWERS);
    let legacy = localStorage.getItem(answersKey);
    if (!legacy && getUserScope() === 'guest') {
      legacy = localStorage.getItem(STORAGE_KEYS.ANSWERS);
    }

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
      localStorage.setItem(key, JSON.stringify(migrated));
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
    const attemptsKey = getScopedKey(STORAGE_KEYS.ATTEMPTS);
    localStorage.setItem(attemptsKey, JSON.stringify(filtered));

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
    const answersKey = getScopedKey(STORAGE_KEYS.ANSWERS);
    localStorage.setItem(answersKey, JSON.stringify(legacyAnswers));

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
// Guarded Reset Progress Function (Scoped to active user account)
// -----------------------------------------------------------------------------
export function clearAllProgress(): void {
  if (typeof window === 'undefined') return;
  try {
    const attemptsKey = getScopedKey(STORAGE_KEYS.ATTEMPTS);
    const answersKey = getScopedKey(STORAGE_KEYS.ANSWERS);
    const userStatesKey = getScopedKey(STORAGE_KEYS.USER_STATES);
    const streakKey = getScopedKey(STORAGE_KEYS.STREAK);

    localStorage.removeItem(attemptsKey);
    localStorage.removeItem(answersKey);
    localStorage.removeItem(userStatesKey);
    localStorage.removeItem(streakKey);

    if (getUserScope() === 'guest') {
      localStorage.removeItem(STORAGE_KEYS.ATTEMPTS);
      localStorage.removeItem(STORAGE_KEYS.ANSWERS);
      localStorage.removeItem(STORAGE_KEYS.USER_STATES);
      localStorage.removeItem(STORAGE_KEYS.STREAK);
    }

    window.dispatchEvent(new CustomEvent('satify_storage_update'));
  } catch (e) {
    console.error('Failed to clear progress', e);
  }
}

// -----------------------------------------------------------------------------
// Saved & Bookmarked Questions (Scoped to active user account)
// -----------------------------------------------------------------------------
export function getSavedQuestionIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = getScopedKey(STORAGE_KEYS.SAVED);
    let raw = localStorage.getItem(key);
    if (!raw && getUserScope() === 'guest') {
      raw = localStorage.getItem(STORAGE_KEYS.SAVED);
    }
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
    const key = getScopedKey(STORAGE_KEYS.SAVED);
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('satify_storage_update'));
    return isNowSaved;
  } catch (e) {
    return false;
  }
}

// -----------------------------------------------------------------------------
// Daily Study Streak (Scoped to active user account)
// -----------------------------------------------------------------------------
export function getStudyStreak(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const key = getScopedKey(STORAGE_KEYS.STREAK);
    let raw = localStorage.getItem(key);
    if (!raw && getUserScope() === 'guest') {
      raw = localStorage.getItem(STORAGE_KEYS.STREAK);
    }
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
    const key = getScopedKey(STORAGE_KEYS.STREAK);
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    let raw = localStorage.getItem(key);
    if (!raw && getUserScope() === 'guest') {
      raw = localStorage.getItem(STORAGE_KEYS.STREAK);
    }

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

    localStorage.setItem(key, JSON.stringify({ streak, lastDate: today }));
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
  
  // High-performance single O(N) reduction pass
  const countsByDate = new Map<string, { correct: number; wrong: number; total: number }>();
  for (let i = 0; i < attempts.length; i++) {
    const a = attempts[i];
    const dateStr = new Date(a.timestamp).toISOString().slice(0, 10);
    let entry = countsByDate.get(dateStr);
    if (!entry) {
      entry = { correct: 0, wrong: 0, total: 0 };
      countsByDate.set(dateStr, entry);
    }
    entry.total++;
    if (a.isCorrect) entry.correct++;
    else entry.wrong++;
  }

  const days: DayActivity[] = [];
  const now = Date.now();
  for (let i = 9; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    const dateStr = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const stats = countsByDate.get(dateStr) || { correct: 0, wrong: 0, total: 0 };

    days.push({
      date: dateStr,
      label,
      correct: stats.correct,
      wrong: stats.wrong,
      total: stats.total,
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

// -----------------------------------------------------------------------------
// Cross-Device Sync & Data Transfer
// -----------------------------------------------------------------------------
export interface UserDataBackup {
  version: 1;
  email: string;
  timestamp: number;
  attempts: AttemptRecord[];
  savedIds: string[];
  streak: { streak: number; lastDate: string } | null;
  vocabRatings?: Record<string, any>;
  customDecks?: any[];
}

export function exportUserData(): string {
  const attempts = getAttempts();
  const savedIds = getSavedQuestionIds();
  const streakRaw = typeof window !== 'undefined' ? localStorage.getItem(getScopedKey(STORAGE_KEYS.STREAK)) : null;
  const streak = streakRaw ? JSON.parse(streakRaw) : null;
  const user = getCurrentUser();

  const data: UserDataBackup = {
    version: 1,
    email: user?.email || 'guest',
    timestamp: Date.now(),
    attempts,
    savedIds,
    streak,
  };

  try {
    if (typeof window !== 'undefined') {
      const ratingsRaw = localStorage.getItem(getScopedKey(STORAGE_KEYS.VOCAB_RATINGS));
      if (ratingsRaw) data.vocabRatings = JSON.parse(ratingsRaw);
      const decksRaw = localStorage.getItem(getScopedKey(STORAGE_KEYS.VOCAB_DECKS));
      if (decksRaw) data.customDecks = JSON.parse(decksRaw);
    }
  } catch {}

  return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}

export function importUserData(code: string): { success: boolean; message: string; count?: number } {
  try {
    const clean = code.trim();
    if (!clean) return { success: false, message: 'Please enter a sync code.' };
    
    const jsonStr = decodeURIComponent(escape(atob(clean)));
    const data: UserDataBackup = JSON.parse(jsonStr);

    if (!data || !Array.isArray(data.attempts)) {
      return { success: false, message: 'Invalid or incomplete sync code.' };
    }

    if (typeof window === 'undefined') return { success: false, message: 'Window unavailable' };

    // Merge attempts (keep newer if duplicate question)
    const existing = getAttempts();
    const map = new Map<string, AttemptRecord>();
    for (const a of existing) {
      map.set(a.questionId, a);
    }
    for (const a of data.attempts) {
      const cur = map.get(a.questionId);
      if (!cur || a.timestamp >= cur.timestamp) {
        map.set(a.questionId, a);
      }
    }
    const mergedAttempts = Array.from(map.values());
    localStorage.setItem(getScopedKey(STORAGE_KEYS.ATTEMPTS), JSON.stringify(mergedAttempts));

    // Merge saved questions
    const existingSaved = getSavedQuestionIds();
    const mergedSaved = Array.from(new Set([...existingSaved, ...(data.savedIds || [])]));
    localStorage.setItem(getScopedKey(STORAGE_KEYS.SAVED), JSON.stringify(mergedSaved));

    // Merge streak if higher
    if (data.streak) {
      const curStreak = getStudyStreak();
      if ((data.streak.streak || 0) > curStreak) {
        localStorage.setItem(getScopedKey(STORAGE_KEYS.STREAK), JSON.stringify(data.streak));
      }
    }

    // Vocab ratings & decks
    if (data.vocabRatings) {
      const ratingsKey = getScopedKey(STORAGE_KEYS.VOCAB_RATINGS);
      const curRatings = localStorage.getItem(ratingsKey);
      const parsedCur = curRatings ? JSON.parse(curRatings) : {};
      localStorage.setItem(ratingsKey, JSON.stringify({ ...parsedCur, ...data.vocabRatings }));
    }
    if (data.customDecks && data.customDecks.length > 0) {
      const decksKey = getScopedKey(STORAGE_KEYS.VOCAB_DECKS);
      const curDecks = localStorage.getItem(decksKey);
      const parsedCur: any[] = curDecks ? JSON.parse(curDecks) : [];
      const deckMap = new Map();
      for (const d of parsedCur) deckMap.set(d.id, d);
      for (const d of data.customDecks) deckMap.set(d.id, d);
      localStorage.setItem(decksKey, JSON.stringify(Array.from(deckMap.values())));
    }

    window.dispatchEvent(new CustomEvent('satify_storage_update'));
    return { 
      success: true, 
      message: `Successfully synced ${mergedAttempts.length} questions and ${mergedSaved.length} bookmarks!`,
      count: mergedAttempts.length 
    };
  } catch (e: any) {
    return { success: false, message: 'Could not parse sync code. Make sure you copied the entire string.' };
  }
}

/**
 * Attempts automated background cloud sync if backend cloud endpoint is available
 */
export async function syncCloudProgress(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const user = getCurrentUser();
  if (!user?.email) return false;

  try {
    const attempts = getAttempts();
    const savedIds = getSavedQuestionIds();
    const streak = getStudyStreak();

    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        attempts,
        savedIds,
        streak,
        timestamp: Date.now(),
      }),
    });

    if (res.ok) {
      const cloudData = await res.json();
      if (cloudData.attempts && Array.isArray(cloudData.attempts) && cloudData.attempts.length > attempts.length) {
        // Cloud has more recent data (e.g. from another device)
        localStorage.setItem(getScopedKey(STORAGE_KEYS.ATTEMPTS), JSON.stringify(cloudData.attempts));
        if (cloudData.savedIds) {
          localStorage.setItem(getScopedKey(STORAGE_KEYS.SAVED), JSON.stringify(cloudData.savedIds));
        }
        window.dispatchEvent(new CustomEvent('satify_storage_update'));
      }
      return true;
    }
  } catch (err) {
    // Silent fail if offline or cloud endpoint not configured
  }
  return false;
}

// -----------------------------------------------------------------------------
// Global Auth Sync Listener
// -----------------------------------------------------------------------------
if (typeof window !== 'undefined') {
  window.addEventListener('satify_auth_changed', () => {
    // Notify all active views that storage scope has switched
    window.dispatchEvent(new CustomEvent('satify_storage_update'));
    // Trigger background cloud sync on login
    syncCloudProgress().catch(() => {});
  });
}

