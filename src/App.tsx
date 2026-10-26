import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Header } from './components/Header';
import { LeftPane } from './components/LeftPane';
import { RightPane } from './components/RightPane';
import { Footer } from './components/Footer';
import { DirectionsModal } from './components/DirectionsModal';
import { ReferenceModal } from './components/ReferenceModal';
import { CalculatorModal } from './components/CalculatorModal';
import { QuestionNavModal } from './components/QuestionNavModal';
import { HighlightToolbar } from './components/HighlightToolbar';
import { SetupDashboard } from './components/SetupDashboard';
import { GrammarComparisonModal } from './components/GrammarComparisonModal';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { LoginModal } from './components/LoginModal';
import { UserAccountModal } from './components/UserAccountModal';
import { UserProfile, getCurrentUser, logoutUser } from './utils/auth';
import { Sidebar, AppRoute } from './components/Sidebar';

// Dynamically lazy-loaded view chunks with Suspense for instant page loads (Requirement 1)
const HomeDashboard = React.lazy(() => import('./views/HomeDashboard').then(m => ({ default: m.HomeDashboard })));
const AnalyticsView = React.lazy(() => import('./views/AnalyticsView').then(m => ({ default: m.AnalyticsView })));
const SavedMistakesView = React.lazy(() => import('./views/SavedMistakesView').then(m => ({ default: m.SavedMistakesView })));
const VocabPracticeView = React.lazy(() => import('./views/VocabPracticeView').then(m => ({ default: m.VocabPracticeView })));
const ScoreCalculatorView = React.lazy(() => import('./views/ScoreCalculatorView').then(m => ({ default: m.ScoreCalculatorView })));
const QuestionRush = React.lazy(() => import('./components/QuestionRush').then(m => ({ default: m.QuestionRush })));

import { allQuestions as mockAllQuestions, allMathQuestions } from './data/mockQuestions';
import { evaluateNumericEquivalence } from './utils/mathEvaluator';
import { 
  MockQuestion, 
  UserQuestionState, 
  TextHighlight, 
  HighlightColor, 
  UnderlineStyle,
  EnglishFilterConfig
} from './types/quiz';
import { 
  recordAnswer, 
  toggleSaveQuestion, 
  saveQuestion,
  getSavedQuestionIds,
  getSavedUserStates,
  saveUserState,
  getLatestAttemptsMap,
  isQuestionAnswered
} from './utils/storage';
import { GripVertical, Columns, Menu, Sun, Moon } from 'lucide-react';
import { Logo } from './components/Logo';
import { useTheme } from './utils/theme';

export const App: React.FC = () => {
  // Global Theme state ('dark' | 'light')
  const { theme, isDark, toggleTheme } = useTheme();

  // User profile and Google Sign-in state (Requirement 8)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [storageVersion, setStorageVersion] = useState<number>(0);

  useEffect(() => {
    const handleAuthChange = (e: any) => {
      setCurrentUser(e.detail || null);
      // Reset active practice question states so in-flight questions don't bleed between accounts
      setUserStates({});
      setStorageVersion(v => v + 1);
    };
    window.addEventListener('satify_auth_changed', handleAuthChange);
    return () => window.removeEventListener('satify_auth_changed', handleAuthChange);
  }, []);

  useEffect(() => {
    const handleStorageUpdate = () => {
      setStorageVersion(v => v + 1);
    };
    window.addEventListener('satify_storage_update', handleStorageUpdate);
    return () => window.removeEventListener('satify_storage_update', handleStorageUpdate);
  }, []);

  useEffect(() => {
    const handleToast = (e: any) => {
      setToastMessage(e.detail || null);
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    };
    window.addEventListener('satify_toast', handleToast);
    return () => window.removeEventListener('satify_toast', handleToast);
  }, []);

  // Mobile navigation drawer and responsive layout states
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState<number>(() => 
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );
  const [isLandscape, setIsLandscape] = useState<boolean>(() => 
    typeof window !== 'undefined' ? window.innerWidth >= window.innerHeight : true
  );

  // Manual layout override: null ('auto' based on device orientation), 'split', or 'stacked'
  const [layoutOverride, setLayoutOverride] = useState<'split' | 'stacked' | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setIsLandscape(window.innerWidth >= window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Mobile devices (< 768px): STRICTLY STACKED ONLY, NO OTHER OPTION!
  const isMobile = windowWidth < 768;

  // Compute active two-pane state:
  // - On mobile (< 768px): Strictly stacked only - no other option!
  // - Tablet & Desktop (>= 768px):
  //     - If user manually toggled, obey their preference
  //     - Default: Split view when screen is in landscape (standard iPad landscape & desktop)
  //     - In portrait orientation on tablets, defaults to stacked
  const isTwoPane = useMemo(() => {
    if (isMobile) return false;
    if (layoutOverride) return layoutOverride === 'split';
    return isLandscape && windowWidth >= 768;
  }, [isMobile, layoutOverride, isLandscape, windowWidth]);

  const handleToggleLayout = useCallback(() => {
    if (windowWidth < 768) return; // Disallowed on mobile view
    setLayoutOverride(prev => {
      const current = prev !== null ? prev === 'split' : isTwoPane;
      return current ? 'stacked' : 'split';
    });
  }, [isTwoPane, windowWidth]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'dark') {
      root.classList.add('dark');
      if (body) body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      if (body) body.classList.remove('dark');
    }
  }, [theme]);

  // Navigation Route state
  const [currentRoute, setCurrentRoute] = useState<AppRoute | 'practice'>('home');

  // Master questions pool from extracted JSON
  const [allQuestions] = useState<MockQuestion[]>(mockAllQuestions);

  // Active session questions pool
  const [sessionQuestions, setSessionQuestions] = useState<MockQuestion[]>(mockAllQuestions);
  const [filterConfig, setFilterConfig] = useState<EnglishFilterConfig | undefined>(undefined);

  // Numbered active questions pool
  const activeQuestions = useMemo(() => {
    return sessionQuestions.map((q, idx, arr) => ({
      ...q,
      questionNumber: idx + 1,
      totalQuestions: arr.length,
    }));
  }, [sessionQuestions]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [splitRatio, setSplitRatio] = useState<number>(50); // percentage: 25% to 75%
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isLeftCollapsed, setIsLeftCollapsed] = useState<boolean>(false);

  // Modals state
  const [isDirectionsOpen, setIsDirectionsOpen] = useState<boolean>(false);
  const [isReferenceOpen, setIsReferenceOpen] = useState<boolean>(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [isGridOpen, setIsGridOpen] = useState<boolean>(false);
  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(false);
  const [isGrammarGuideOpen, setIsGrammarGuideOpen] = useState<boolean>(false);
  const [isAnnotateActive, setIsAnnotateActive] = useState<boolean>(false);

  // Helper to load initial question states from persistent storage
  const loadInitialUserStates = useCallback((questions: MockQuestion[]): Record<number, UserQuestionState> => {
    const savedStates = getSavedUserStates();
    const attemptsMap = getLatestAttemptsMap();
    const savedIds = getSavedQuestionIds();
    const map: Record<number, UserQuestionState> = {};

    questions.forEach((q, idx) => {
      const saved = savedStates[q.id];
      const attempt = attemptsMap[q.id];
      const isSaved = savedIds.includes(q.id);

      if (saved) {
        map[idx] = {
          selectedChoice: saved.selectedChoice,
          sprAnswer: saved.sprAnswer,
          eliminatedChoices: saved.eliminatedChoices || [],
          isMarkedForReview: saved.isMarkedForReview || isSaved,
          isAnswerChecked: saved.isAnswerChecked || false,
          isExplanationOpen: saved.isExplanationOpen || false,
        };
      } else if (attempt) {
        const isOpt = ['A', 'B', 'C', 'D'].includes(attempt.selectedOption);
        map[idx] = {
          selectedChoice: isOpt ? (attempt.selectedOption as 'A' | 'B' | 'C' | 'D') : null,
          sprAnswer: !isOpt ? attempt.selectedOption : undefined,
          eliminatedChoices: [],
          isMarkedForReview: isSaved,
          isAnswerChecked: true,
          isExplanationOpen: false,
        };
      } else if (isSaved) {
        map[idx] = {
          selectedChoice: null,
          eliminatedChoices: [],
          isMarkedForReview: true,
          isAnswerChecked: false,
          isExplanationOpen: false,
        };
      }
    });

    return map;
  }, []);

  // Per-question state map (user answers, review flags)
  const [userStates, setUserStates] = useState<Record<number, UserQuestionState>>(() => loadInitialUserStates(mockAllQuestions));

  // Sync initial user states when session questions change or storage updates
  useEffect(() => {
    setUserStates(prev => {
      const loaded = loadInitialUserStates(sessionQuestions);
      return { ...loaded, ...prev };
    });
  }, [sessionQuestions, storageVersion, loadInitialUserStates]);

  // Annotations & Highlights state by question ID (Session-only; resets when leaving practice or returning to dashboard)
  const [highlightsByQuestion, setHighlightsByQuestion] = useState<Record<string, TextHighlight[]>>({});

  // Floating Highlight Pill Toolbar State
  const [toolbarState, setToolbarState] = useState<{
    isOpen: boolean;
    position: { top: number; left: number };
    activeHighlight: TextHighlight | null;
    pendingSelection?: {
      target: 'passage' | 'stem';
      start: number;
      end: number;
      text: string;
      rect: DOMRect;
    };
  }>({
    isOpen: false,
    position: { top: 0, left: 0 },
    activeHighlight: null,
  });

  const safeIndex = Math.min(currentQuestionIndex, Math.max(0, activeQuestions.length - 1));
  const currentQuestion = activeQuestions[safeIndex] || mockAllQuestions[0];
  const currentState: UserQuestionState = userStates[safeIndex] || {
    selectedChoice: null,
    eliminatedChoices: [],
    isMarkedForReview: false,
    isAnswerChecked: false,
    isExplanationOpen: false,
  };
  const isCurrentAnswered = (currentQuestion.questionType === 'spr' ? !!currentState.sprAnswer?.trim() : currentState.selectedChoice !== null) || currentState.isAnswerChecked || isQuestionAnswered(currentQuestion.id);
  const currentHighlights = highlightsByQuestion[currentQuestion?.id || ''] || [];

  // State update helper
  const updateCurrentState = useCallback((updater: (prev: UserQuestionState) => UserQuestionState) => {
    setUserStates(prev => ({
      ...prev,
      [safeIndex]: updater(prev[safeIndex] || {
        selectedChoice: null,
        eliminatedChoices: [],
        isMarkedForReview: false,
        isAnswerChecked: false,
        isExplanationOpen: false,
      })
    }));
  }, [safeIndex]);

  // SPR Answer Input Handler
  const handleSprAnswerChange = useCallback((value: string) => {
    updateCurrentState(prev => {
      const nextState: UserQuestionState = {
        ...prev,
        sprAnswer: value,
      };
      saveUserState(currentQuestion.id, nextState);
      return nextState;
    });
  }, [updateCurrentState, currentQuestion.id]);

  // Choice Selection (Multiple Choice)
  const handleSelectChoice = useCallback((choice: 'A' | 'B' | 'C' | 'D') => {
    updateCurrentState(prev => {
      const isDeselecting = prev.selectedChoice === choice;
      const nextChoice = isDeselecting ? null : choice;
      const nextState: UserQuestionState = {
        ...prev,
        selectedChoice: nextChoice,
        eliminatedChoices: prev.eliminatedChoices.filter(c => c !== choice),
      };

      // Persist to storage
      saveUserState(currentQuestion.id, nextState);

      // Auto-save question and record answer when answered
      if (nextChoice !== null) {
        saveQuestion(currentQuestion.id);
        recordAnswer(
          currentQuestion.id,
          nextChoice,
          nextChoice === currentQuestion.correctAnswer,
          currentQuestion.domain,
          currentQuestion.skill,
          currentQuestion.difficulty,
          30
        );
      }

      return nextState;
    });
  }, [updateCurrentState, currentQuestion]);

  // Choice Elimination (ABC mode)
  const handleToggleEliminate = useCallback((choice: 'A' | 'B' | 'C' | 'D') => {
    updateCurrentState(prev => {
      const isEliminated = prev.eliminatedChoices.includes(choice);
      const nextEliminated = isEliminated
        ? prev.eliminatedChoices.filter(c => c !== choice)
        : [...prev.eliminatedChoices, choice];
      const nextChoice = prev.selectedChoice === choice ? null : prev.selectedChoice;
      const nextState: UserQuestionState = {
        ...prev,
        eliminatedChoices: nextEliminated,
        selectedChoice: nextChoice,
      };
      saveUserState(currentQuestion.id, nextState);
      return nextState;
    });
  }, [updateCurrentState, currentQuestion.id]);

  // Mark for Review & Bookmark in LocalStorage
  const handleToggleMarkForReview = useCallback(() => {
    updateCurrentState(prev => {
      const nextReview = !prev.isMarkedForReview;
      toggleSaveQuestion(currentQuestion.id);
      const nextState: UserQuestionState = {
        ...prev,
        isMarkedForReview: nextReview,
      };
      saveUserState(currentQuestion.id, nextState);
      return nextState;
    });
  }, [updateCurrentState, currentQuestion.id]);

  // Check Answer & Record to Statistics (Evaluates both MCQ and SPR Equivalence)
  const handleCheckAnswer = useCallback((timeSpentSeconds?: number) => {
    const isSpr = currentQuestion.questionType === 'spr';
    if (!isSpr && !currentState.selectedChoice) return;
    if (isSpr && (!currentState.sprAnswer || !currentState.sprAnswer.trim())) return;

    const isCorrect = isSpr
      ? evaluateNumericEquivalence(currentState.sprAnswer || '', currentQuestion.correctAnswer, currentQuestion.acceptedAnswers)
      : currentState.selectedChoice === currentQuestion.correctAnswer;

    const recordedOption = isSpr ? (currentState.sprAnswer || '').trim() : currentState.selectedChoice!;

    // Record to persistent storage (satify_attempts)
    recordAnswer(
      currentQuestion.id,
      recordedOption,
      isCorrect,
      currentQuestion.domain,
      currentQuestion.skill,
      currentQuestion.difficulty,
      timeSpentSeconds || 30
    );

    // Save answered question to bookmarks
    saveQuestion(currentQuestion.id);

    const nextState: UserQuestionState = {
      ...currentState,
      isAnswerChecked: true,
      isExplanationOpen: true,
    };

    saveUserState(currentQuestion.id, nextState);

    updateCurrentState(() => nextState);
  }, [currentState, currentQuestion, updateCurrentState]);

  // Toggle Explanation Drawer
  const handleToggleExplanation = useCallback(() => {
    updateCurrentState(prev => ({
      ...prev,
      isExplanationOpen: !prev.isExplanationOpen,
    }));
  }, [updateCurrentState]);

  // Navigation (Auto-closes explanation drawer on question transition)
  const handlePrev = useCallback(() => {
    if (safeIndex > 0) {
      const nextIdx = safeIndex - 1;
      setUserStates(prev => {
        if (!prev[nextIdx]?.isExplanationOpen) return prev;
        return {
          ...prev,
          [nextIdx]: { ...prev[nextIdx], isExplanationOpen: false }
        };
      });
      setCurrentQuestionIndex(nextIdx);
      setToolbarState(prev => ({ ...prev, isOpen: false }));
    }
  }, [safeIndex]);

  const handleNext = useCallback(() => {
    if (safeIndex < activeQuestions.length - 1) {
      const nextIdx = safeIndex + 1;
      setUserStates(prev => {
        if (!prev[nextIdx]?.isExplanationOpen) return prev;
        return {
          ...prev,
          [nextIdx]: { ...prev[nextIdx], isExplanationOpen: false }
        };
      });
      setCurrentQuestionIndex(nextIdx);
      setToolbarState(prev => ({ ...prev, isOpen: false }));
    }
  }, [safeIndex, activeQuestions.length]);

  // Unified Pointer & Touch Resizable Split Pane Logic
  const isDraggingRef = useRef<boolean>(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    isDraggingRef.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  }, []);

  const handlePointerMove = useCallback((clientX: number) => {
    if (!isDraggingRef.current) return;
    const containerWidth = window.innerWidth;
    if (containerWidth <= 0) return;
    const newSplit = (clientX / containerWidth) * 100;
    if (newSplit >= 20 && newSplit <= 80) {
      setSplitRatio(newSplit);
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);
    }
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const onPointerMove = (e: PointerEvent) => {
      handlePointerMove(e.clientX);
    };
    const onPointerUp = () => {
      handlePointerUp();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    // Touch events fallback for Mobile Safari / iPadOS
    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length === 0) return;
      handlePointerMove(e.touches[0].clientX);
    };
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onPointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  // Keyboard Shortcuts (A-D, Enter, Arrow keys)
  useEffect(() => {
    if (currentRoute !== 'practice') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        handleSelectChoice(key as 'A' | 'B' | 'C' | 'D');
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Enter') {
        handleCheckAnswer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSelectChoice, handleNext, handlePrev, handleCheckAnswer, currentRoute]);

  // Launch practice for a specific skill from dashboard
  const handleStartSkillPractice = useCallback((skillName: string, domainName: string) => {
    // Strictly filter by exact skill and canonical domain
    const filtered = allQuestions.filter(q => q.skill === skillName && (!domainName || q.domain === domainName));
    const targetPool = filtered.length > 0 ? filtered : allQuestions.filter(q => q.skill === skillName);
    setSessionQuestions(targetPool);
    setCurrentQuestionIndex(0);
    setUserStates(loadInitialUserStates(targetPool));
    setFilterConfig({
      test: 'SAT',
      masterCategory: true,
      selectedDomains: domainName ? [domainName] : [],
      selectedSkills: [skillName],
      selectedDifficulties: ['Easy', 'Medium', 'Hard'],
      shuffle: false,
      excludeActive: false,
      hideAnswered: false,
    });
    setCurrentRoute('practice');
  }, [allQuestions, loadInitialUserStates]);

  // Launch custom practice from saved/mistakes
  const handleStartCustomPractice = useCallback((selectedQs: MockQuestion[]) => {
    if (selectedQs.length > 0) {
      setSessionQuestions(selectedQs);
      setCurrentQuestionIndex(0);
      setUserStates(loadInitialUserStates(selectedQs));
      setCurrentRoute('practice');
    }
  }, [loadInitialUserStates]);

  // Practice session configuration started from SetupDashboard
  const handleStartPractice = useCallback((filtered: MockQuestion[], config: EnglishFilterConfig) => {
    setFilterConfig(config);
    // Strict exact skill and canonical domain-to-skill pairing
    let pool = filtered;
    if (config.selectedSkills && config.selectedSkills.length > 0) {
      pool = pool.filter(q => config.selectedSkills.includes(q.skill) && (!config.selectedDomains || config.selectedDomains.includes(q.domain)));
    }
    const targetPool = pool.length > 0 ? pool : filtered;
    setSessionQuestions(targetPool);
    setCurrentQuestionIndex(0);
    setUserStates(loadInitialUserStates(targetPool));
    setIsSetupOpen(false);
    setCurrentRoute('practice');
  }, [loadInitialUserStates]);

  // Passage text selection listener from LeftPane
  const handleTextSelected = useCallback((data: {
    target: 'passage';
    start: number;
    end: number;
    text: string;
    rect: DOMRect;
  }) => {
    setToolbarState({
      isOpen: true,
      position: { top: Math.max(20, data.rect.top - 8), left: data.rect.left + data.rect.width / 2 },
      activeHighlight: null,
      pendingSelection: data,
    });
  }, []);

  // Text Highlighting & Annotate handlers
  const handleSelectHighlightColor = useCallback((color: HighlightColor) => {
    if (toolbarState.pendingSelection) {
      const { target, start, end, text } = toolbarState.pendingSelection;
      const newH: TextHighlight = {
        id: `hl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        target,
        start,
        end,
        text,
        color,
        isUnderlined: false,
        underlineStyle: 'solid',
      };
      setHighlightsByQuestion(prev => ({
        ...prev,
        [currentQuestion.id]: [...(prev[currentQuestion.id] || []), newH],
      }));
      setToolbarState(prev => ({ ...prev, isOpen: false, pendingSelection: undefined, activeHighlight: null }));
      window.getSelection()?.removeAllRanges();
      return;
    }

    if (toolbarState.activeHighlight) {
      const hid = toolbarState.activeHighlight.id;
      setHighlightsByQuestion(prev => ({
        ...prev,
        [currentQuestion.id]: (prev[currentQuestion.id] || []).map(h =>
          h.id === hid ? { ...h, color } : h
        ),
      }));
      setToolbarState(prev => ({ ...prev, isOpen: false, activeHighlight: null }));
    }
  }, [toolbarState.pendingSelection, toolbarState.activeHighlight, currentQuestion.id]);

  const handleToggleUnderline = useCallback((style?: UnderlineStyle) => {
    if (toolbarState.pendingSelection) {
      const { target, start, end, text } = toolbarState.pendingSelection;
      const newH: TextHighlight = {
        id: `hl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        target,
        start,
        end,
        text,
        color: 'yellow',
        isUnderlined: true,
        underlineStyle: style || 'solid',
      };
      setHighlightsByQuestion(prev => ({
        ...prev,
        [currentQuestion.id]: [...(prev[currentQuestion.id] || []), newH],
      }));
      setToolbarState(prev => ({ ...prev, isOpen: false, pendingSelection: undefined, activeHighlight: null }));
      window.getSelection()?.removeAllRanges();
      return;
    }

    if (toolbarState.activeHighlight) {
      const hid = toolbarState.activeHighlight.id;
      setHighlightsByQuestion(prev => ({
        ...prev,
        [currentQuestion.id]: (prev[currentQuestion.id] || []).map(h =>
          h.id === hid 
            ? { 
                ...h, 
                isUnderlined: style !== undefined ? true : !h.isUnderlined,
                underlineStyle: style || h.underlineStyle || 'solid'
              } 
            : h
        ),
      }));
    }
  }, [toolbarState.pendingSelection, toolbarState.activeHighlight, currentQuestion.id]);

  const handleDeleteHighlight = useCallback(() => {
    if (toolbarState.activeHighlight) {
      const hid = toolbarState.activeHighlight.id;
      setHighlightsByQuestion(prev => ({
        ...prev,
        [currentQuestion.id]: (prev[currentQuestion.id] || []).filter(h => h.id !== hid),
      }));
      setToolbarState(prev => ({ ...prev, isOpen: false, activeHighlight: null, pendingSelection: undefined }));
    }
  }, [toolbarState.activeHighlight, currentQuestion.id]);

  const handleSaveNote = useCallback((note: string) => {
    if (toolbarState.activeHighlight) {
      const hid = toolbarState.activeHighlight.id;
      setHighlightsByQuestion(prev => ({
        ...prev,
        [currentQuestion.id]: (prev[currentQuestion.id] || []).map(h =>
          h.id === hid ? { ...h, note } : h
        ),
      }));
    }
  }, [toolbarState.activeHighlight, currentQuestion.id]);

  const handleHighlightClick = useCallback((highlight: TextHighlight, rect: DOMRect) => {
    setToolbarState({
      isOpen: true,
      position: { top: Math.max(20, rect.top - 8), left: rect.left + rect.width / 2 },
      activeHighlight: highlight,
      pendingSelection: undefined,
    });
  }, []);

  // Exit Practice Mode and return to Dashboard with full cleanup
  const handleExitToDashboard = useCallback(() => {
    setIsAnnotateActive(false);
    setHighlightsByQuestion({});
    setToolbarState({
      isOpen: false,
      position: { top: 0, left: 0 },
      activeHighlight: null,
      pendingSelection: undefined,
    });
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('satify_highlights');
      } catch {}
      const sel = window.getSelection();
      if (sel) sel.removeAllRanges();
    }
    setCurrentRoute('home');
  }, []);

  // Clean up any pending text selection or floating annotation toolbar when navigating away from practice
  useEffect(() => {
    if (currentRoute !== 'practice') {
      setIsAnnotateActive(false);
      setHighlightsByQuestion({});
      setToolbarState({
        isOpen: false,
        position: { top: 0, left: 0 },
        activeHighlight: null,
        pendingSelection: undefined,
      });
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('satify_highlights');
        } catch {}
        const sel = window.getSelection();
        if (sel) sel.removeAllRanges();
      }
    }
  }, [currentRoute]);

  // Global Keyboard Shortcut: 'C' toggles Desmos Calculator (when not typing in text fields)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      if (e.key === 'c' || e.key === 'C') {
        if (!e.metaKey && !e.ctrlKey && !e.altKey) {
          e.preventDefault();
          setIsCalculatorOpen(prev => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Preload next 2 questions' graph & figure images in memory for zero-delay rendering
  useEffect(() => {
    const nextIdx1 = safeIndex + 1;
    const nextIdx2 = safeIndex + 2;
    [nextIdx1, nextIdx2].forEach(idx => {
      if (idx < activeQuestions.length) {
        const q = activeQuestions[idx];
        if (q?.imageUrl) {
          const img = new Image();
          img.src = q.imageUrl;
        }
        if (q?.options) {
          q.options.forEach(opt => {
            if (opt.imageUrl) {
              const optImg = new Image();
              optImg.src = opt.imageUrl;
            }
          });
        }
      }
    });
  }, [safeIndex, activeQuestions]);

  const savedCount = useMemo(() => getSavedQuestionIds().length, [currentState, storageVersion]);

  return (
    <div className="w-full max-w-full overflow-x-hidden h-[100dvh] max-h-[100dvh] flex flex-col md:flex-row overflow-hidden font-sans bg-neutral-50 dark:bg-[#090A0F] text-zinc-950 dark:text-[#F4F4F6]">
      {/* 1. Mobile Top Bar (< 1024px / lg:hidden) when NOT in full practice mode */}
      {currentRoute !== 'practice' && (
        <div className="lg:hidden flex items-center justify-between px-4 h-14 pt-[max(env(safe-area-inset-top,0px),4px)] bg-white dark:bg-[#11131A] border-b border-zinc-200 dark:border-[#222634] z-40 shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="h-9 w-9 flex items-center justify-center -ml-1 rounded-lg text-zinc-700 dark:text-[#8E95A5] hover:bg-zinc-100 dark:hover:bg-[#181B24] transition-colors duration-150 cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <Logo size="sm" variant="header" inverted={isDark} />
          </div>
          <div className="flex items-center gap-2">
            {currentUser ? (
              <button
                onClick={() => setIsAccountModalOpen(true)}
                className="w-7 h-7 rounded-md overflow-hidden border border-zinc-300 dark:border-[#222634] flex items-center justify-center bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold text-xs cursor-pointer"
                title={currentUser.name}
              >
                {currentUser.picture ? (
                  <img src={currentUser.picture} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{currentUser.name.charAt(0).toUpperCase()}</span>
                )}
              </button>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 font-semibold text-xs transition-colors duration-150 cursor-pointer"
              >
                Sign In
              </button>
            )}

            <button
              onClick={toggleTheme}
              className="h-9 w-9 flex items-center justify-center rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-[#222634] bg-zinc-50 dark:bg-[#181B24] text-zinc-700 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-[#F4F4F6] transition-colors duration-150 cursor-pointer"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" strokeWidth={1.75} /> : <Moon className="w-4 h-4 text-zinc-700" strokeWidth={1.75} />}
            </button>
          </div>
        </div>
      )}

      {/* 2. Slide-over Mobile Navigation Drawer (< 1024px / lg:hidden) */}
      {isMobileNavOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 animate-in fade-in duration-200"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div className="w-72 fixed inset-y-0 left-0 z-50 animate-in slide-in-from-left duration-200 flex flex-col shadow-2xl">
            <Sidebar
              className="w-full h-full"
              currentRoute={currentRoute as AppRoute}
              onRouteChange={(route) => {
                setIsMobileNavOpen(false);
                if (route === 'question-bank') {
                  setIsSetupOpen(true);
                } else {
                  setCurrentRoute(route);
                }
              }}
              savedCount={savedCount}
              onCloseMobile={() => setIsMobileNavOpen(false)}
              user={currentUser}
              onOpenLogin={() => setIsLoginModalOpen(true)}
              onOpenAccount={() => {
                setIsMobileNavOpen(false);
                setIsAccountModalOpen(true);
              }}
            />
          </div>
        </>
      )}

      {/* 3. Desktop Left Sidebar (>= 1024px / hidden lg:flex) when NOT in full practice mode */}
      {currentRoute !== 'practice' && (
        <div className="hidden lg:flex h-full shrink-0">
          <Sidebar
            currentRoute={currentRoute as AppRoute}
            onRouteChange={(route) => {
              if (route === 'question-bank') {
                setIsSetupOpen(true);
              } else {
                setCurrentRoute(route);
              }
            }}
            savedCount={savedCount}
            user={currentUser}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onOpenAccount={() => setIsAccountModalOpen(true)}
          />
        </div>
      )}

      {/* 4. Main Content Area */}
      <div className="flex-1 h-full overflow-hidden flex flex-col">
        <React.Suspense fallback={
          <div className="flex-1 flex items-center justify-center min-h-[300px] w-full bg-neutral-50 dark:bg-[#090A0F] animate-in fade-in duration-150">
            <div className="w-7 h-7 border-2 border-blue-600 dark:border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          {currentRoute === 'home' && (
            <HomeDashboard
              questions={allQuestions}
              onStartSkillPractice={handleStartSkillPractice}
              onOpenQuestionBank={() => setIsSetupOpen(true)}
              onStartMathPractice={() => handleStartCustomPractice(allMathQuestions)}
            />
          )}

          {currentRoute === 'analytics' && (
            <AnalyticsView
              questions={allQuestions}
              onStartSkillPractice={handleStartSkillPractice}
            />
          )}

          {currentRoute === 'saved' && (
            <SavedMistakesView
              questions={allQuestions}
              onStartCustomPractice={handleStartCustomPractice}
            />
          )}

          {currentRoute === 'vocab' && (
            <VocabPracticeView />
          )}

          {currentRoute === 'rush' && (
            <QuestionRush
              questions={allQuestions}
              onOpenQuestionBank={() => setIsSetupOpen(true)}
            />
          )}

          {currentRoute === 'calculator' && (
            <ScoreCalculatorView />
          )}
        </React.Suspense>

        {/* ----------------------------------------------------------------- */}
        {/* FULL BLUEBOOK TEST RUNNER VIEW (When in Practice Mode)            */}
        {/* ----------------------------------------------------------------- */}
        {currentRoute === 'practice' && (
          <div className="fixed inset-0 h-[100dvh] max-h-[100dvh] w-full flex flex-col overflow-hidden bg-white dark:bg-[#090A0F] z-30">
            {/* Top Bluebook Header */}
            <Header
              section={currentQuestion.section}
              moduleNumber={currentQuestion.module || 1}
              onOpenDirections={() => setIsDirectionsOpen(true)}
              onOpenReference={() => setIsReferenceOpen(true)}
              onOpenCalculator={() => setIsCalculatorOpen(true)}
              onOpenFilter={() => setIsSetupOpen(true)}
              onOpenGrammarGuide={() => setIsGrammarGuideOpen(true)}
              isAnnotateActive={isAnnotateActive}
              onToggleAnnotate={() => setIsAnnotateActive(!isAnnotateActive)}
              onExitToDashboard={handleExitToDashboard}
              onOpenNav={() => setIsMobileNavOpen(true)}
              currentQuestion={currentQuestion}
              isAnswerChecked={currentState.isAnswerChecked}
              isAnswered={isCurrentAnswered}
              user={currentUser}
              onOpenLogin={() => setIsLoginModalOpen(true)}
              onOpenAccount={() => setIsAccountModalOpen(true)}
              onToggleLayout={handleToggleLayout}
              isTwoPane={isTwoPane}
            />

            {/* Split Pane / Stacked Mobile Workspace */}
            <main className={`flex-1 min-h-0 w-full relative bg-white dark:bg-[#090A0F] ${
              isTwoPane && !isLeftCollapsed
                ? 'flex flex-row overflow-hidden'
                : 'flex flex-col overflow-y-auto overscroll-contain'
            }`}>
              {!isLeftCollapsed ? (
                <>
                  {/* Left Pane: Reading Passage, Visual Graphs, Paired Texts, Poems */}
                  <section
                    style={isTwoPane ? { width: `${splitRatio}%` } : { width: '100%' }}
                    className={`${
                      isTwoPane 
                        ? 'h-full overflow-hidden flex flex-col border-r border-zinc-200 dark:border-[#222634] shrink-0' 
                        : 'w-full flex flex-col border-b border-dashed border-zinc-300 dark:border-[#222634] shrink-0'
                    } bg-white dark:bg-[#090A0F]`}
                  >
                    <LeftPane
                      question={currentQuestion}
                      isAnnotateActive={isAnnotateActive}
                      highlights={currentHighlights}
                      onHighlightClick={handleHighlightClick}
                      onTextSelected={handleTextSelected}
                      isSplitView={isTwoPane}
                      onClearSelection={() => {
                        setToolbarState(prev => ({
                          ...prev,
                          isOpen: false,
                          activeHighlight: null,
                          pendingSelection: undefined,
                        }));
                        if (typeof window !== 'undefined') {
                          const sel = window.getSelection();
                          if (sel) sel.removeAllRanges();
                        }
                      }}
                    />
                  </section>

                  {/* Interactive Drag Divider (Tactile grab handle with w-1.5 hit-area) */}
                  {isTwoPane && (
                    <div
                      onPointerDown={handlePointerDown}
                      onDoubleClick={() => setIsLeftCollapsed(true)}
                      style={{ touchAction: 'none' }}
                      className="relative w-1.5 hover:w-2 flex items-center justify-center cursor-col-resize z-20 group shrink-0 select-none touch-none bg-zinc-200 dark:bg-[#222634] transition-colors duration-150 hover:bg-blue-600 dark:hover:bg-blue-500"
                      title="Drag to resize panes • Double-click to collapse passage"
                    >
                      {/* Centered Pill Handle */}
                      <div className={`absolute h-9 w-4 rounded-full flex items-center justify-center border border-zinc-200 dark:border-[#222634] shadow-xs transition-colors duration-150 pointer-events-none ${
                        isDragging
                          ? 'bg-blue-700 dark:bg-blue-600 text-white border-blue-600'
                          : 'bg-white dark:bg-[#181B24] text-zinc-400 dark:text-[#8E95A5] group-hover:text-blue-600 dark:group-hover:text-blue-400'
                      }`}>
                        <GripVertical className="w-3 h-3" strokeWidth={1.75} />
                      </div>
                    </div>
                  )}

                  {/* Right Pane: Question Stem, Options, Controls & Rationale */}
                  <section
                    style={isTwoPane ? { width: `${100 - splitRatio}%` } : { width: '100%' }}
                    className={`${
                      isTwoPane 
                        ? 'h-full overflow-hidden flex flex-col shrink-0 pb-20 xl:pb-0' 
                        : 'w-full flex flex-col shrink-0 pb-12'
                    } bg-white dark:bg-[#090A0F]`}
                  >
                    <RightPane
                      question={currentQuestion}
                      userState={currentState}
                      onSelectChoice={handleSelectChoice}
                      onSprAnswerChange={handleSprAnswerChange}
                      onToggleEliminate={handleToggleEliminate}
                      onToggleMarkForReview={handleToggleMarkForReview}
                      onCheckAnswer={handleCheckAnswer}
                      onToggleExplanation={handleToggleExplanation}
                      highlights={currentHighlights}
                      onHighlightClick={handleHighlightClick}
                      onOpenGrammarGuide={() => setIsGrammarGuideOpen(true)}
                      isSplitView={isTwoPane}
                    />
                  </section>
                </>
              ) : (
                /* Collapsed Full Width View */
                <div className="relative w-full h-full bg-white dark:bg-[#090A0F] overflow-y-auto flex flex-col">
                  <button
                    onClick={() => setIsLeftCollapsed(false)}
                    className="absolute left-6 top-3 z-30 flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#11131A] hover:bg-zinc-100 dark:hover:bg-[#181B24] border border-zinc-200 dark:border-[#222634] rounded-lg text-xs font-semibold text-zinc-900 dark:text-[#F4F4F6] shadow-xs transition-colors duration-150 cursor-pointer"
                    title="Restore Two-Pane Split View"
                  >
                    <Columns className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" strokeWidth={1.75} />
                    <span>Split View</span>
                  </button>

                  <div className="w-full max-w-4xl mx-auto h-full flex flex-col">
                    <RightPane
                      question={currentQuestion}
                      userState={currentState}
                      onSelectChoice={handleSelectChoice}
                      onSprAnswerChange={handleSprAnswerChange}
                      onToggleEliminate={handleToggleEliminate}
                      onToggleMarkForReview={handleToggleMarkForReview}
                      onCheckAnswer={handleCheckAnswer}
                      onToggleExplanation={handleToggleExplanation}
                      highlights={currentHighlights}
                      onHighlightClick={handleHighlightClick}
                      onOpenGrammarGuide={() => setIsGrammarGuideOpen(true)}
                      isSplitView={false}
                    />
                  </div>
                </div>
              )}
            </main>

            {/* Bottom Bluebook Footer with "© Oluwole Inuoluwadunsimi 2026" */}
            <Footer
              currentIndex={safeIndex}
              totalQuestions={activeQuestions.length}
              isGridOpen={isGridOpen}
              onToggleGrid={() => setIsGridOpen(!isGridOpen)}
              onPrev={handlePrev}
              onNext={handleNext}
              isAnswered={isCurrentAnswered}
            />
          </div>
        )}
      </div>

      {/* 3. Popups & Modals */}
      <DirectionsModal
        isOpen={isDirectionsOpen}
        onClose={() => setIsDirectionsOpen(false)}
        section={currentQuestion.section}
      />

      <ReferenceModal
        isOpen={isReferenceOpen}
        onClose={() => setIsReferenceOpen(false)}
      />

      <CalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      <QuestionNavModal
        isOpen={isGridOpen}
        onClose={() => setIsGridOpen(false)}
        questions={activeQuestions}
        currentIndex={safeIndex}
        userStates={userStates}
        onSelectQuestion={(idx) => {
          setUserStates(prev => {
            if (!prev[idx]?.isExplanationOpen) return prev;
            return {
              ...prev,
              [idx]: { ...prev[idx], isExplanationOpen: false }
            };
          });
          setCurrentQuestionIndex(idx);
          setIsGridOpen(false);
        }}
      />

      {/* Boundaries vs. Form, Structure, and Sense Quick Comparison Cheat Sheet Modal */}
      <GrammarComparisonModal
        isOpen={isGrammarGuideOpen}
        onClose={() => setIsGrammarGuideOpen(false)}
      />

      {/* Question Bank Filter Setup Modal */}
      <SetupDashboard
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onStartPractice={handleStartPractice}
        currentConfig={filterConfig}
      />

      {/* Floating Theme-Aware Cookie Consent Banner & Preferences Modal */}
      <CookieConsentBanner />

      {/* Google Sign-In & Founder Welcome Email Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={(u) => setCurrentUser(u)}
        currentUser={currentUser}
      />

      {/* User Account Details & Sign Out Modal */}
      <UserAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        user={currentUser}
        onSignOut={() => {
          logoutUser();
          setIsAccountModalOpen(false);
        }}
        onSwitchAccount={() => {
          setIsAccountModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      {/* Floating Global Auth & Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-none">
          <div className="px-4 py-2 rounded-full bg-zinc-950/95 dark:bg-white/95 text-white dark:text-zinc-950 font-semibold text-xs sm:text-sm shadow-2xl backdrop-blur-md flex items-center gap-2 border border-zinc-800/80 dark:border-zinc-200/80">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Floating Highlighter Pill Toolbar (Active only in Practice mode) */}
      {currentRoute === 'practice' && toolbarState.isOpen && (
        <div className="highlight-toolbar">
          <HighlightToolbar
            position={toolbarState.position}
            activeHighlight={toolbarState.activeHighlight}
            onSelectColor={handleSelectHighlightColor}
            onToggleUnderline={handleToggleUnderline}
            onDeleteHighlight={handleDeleteHighlight}
            onSaveNote={handleSaveNote}
            onClose={() => setToolbarState(prev => ({ ...prev, isOpen: false }))}
          />
        </div>
      )}
    </div>
  );
};

export default App;
