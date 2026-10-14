import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { UserProfile, getCurrentUser } from './utils/auth';
import { Sidebar, AppRoute } from './components/Sidebar';
import { PasscodeLock } from './components/PasscodeLock';

// Dynamically lazy-loaded view chunks with Suspense for instant page loads (Requirement 1)
const HomeDashboard = React.lazy(() => import('./views/HomeDashboard').then(m => ({ default: m.HomeDashboard })));
const AnalyticsView = React.lazy(() => import('./views/AnalyticsView').then(m => ({ default: m.AnalyticsView })));
const SavedMistakesView = React.lazy(() => import('./views/SavedMistakesView').then(m => ({ default: m.SavedMistakesView })));
const VocabPracticeView = React.lazy(() => import('./views/VocabPracticeView').then(m => ({ default: m.VocabPracticeView })));
const ScoreCalculatorView = React.lazy(() => import('./views/ScoreCalculatorView').then(m => ({ default: m.ScoreCalculatorView })));
const QuestionRush = React.lazy(() => import('./components/QuestionRush').then(m => ({ default: m.QuestionRush })));

import { allEnglishQuestions } from './data/mockQuestions';
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
  getSavedQuestionIds 
} from './utils/storage';
import { GripVertical, Columns, Menu, Sun, Moon } from 'lucide-react';
import { Logo } from './components/Logo';
import { useTheme } from './utils/theme';

export const App: React.FC = () => {
  // Global Theme state ('dark' | 'light')
  const { theme, isDark, toggleTheme } = useTheme();

  // Private Passcode Authentication State
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('satify_auth_status') === 'unlocked' || 
           sessionStorage.getItem('satify_auth_status') === 'unlocked';
  });

  const handleLockApp = useCallback(() => {
    localStorage.removeItem('satify_auth_status');
    sessionStorage.removeItem('satify_auth_status');
    setIsUnlocked(false);
  }, []);

  // User profile and Google Sign-in state (Requirement 8)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleAuthChange = (e: any) => {
      setCurrentUser(e.detail || null);
    };
    window.addEventListener('satify_auth_changed', handleAuthChange);
    return () => window.removeEventListener('satify_auth_changed', handleAuthChange);
  }, []);

  // Mobile navigation drawer and responsive layout states (< 1280px / xl)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(() => 
    typeof window !== 'undefined' ? window.innerWidth >= 1280 : true
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1280);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
  const [allQuestions] = useState<MockQuestion[]>(allEnglishQuestions);

  // Active session questions pool
  const [sessionQuestions, setSessionQuestions] = useState<MockQuestion[]>(allEnglishQuestions);
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

  // Per-question state map (user answers, review flags)
  const [userStates, setUserStates] = useState<Record<number, UserQuestionState>>({});

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
  const currentQuestion = activeQuestions[safeIndex] || allEnglishQuestions[0];
  const currentState: UserQuestionState = userStates[safeIndex] || {
    selectedChoice: null,
    eliminatedChoices: [],
    isMarkedForReview: false,
    isAnswerChecked: false,
    isExplanationOpen: false,
  };
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

  // Choice Selection (Multiple Choice)
  const handleSelectChoice = useCallback((choice: 'A' | 'B' | 'C' | 'D') => {
    updateCurrentState(prev => ({
      ...prev,
      selectedChoice: prev.selectedChoice === choice ? null : choice,
      eliminatedChoices: prev.eliminatedChoices.filter(c => c !== choice),
    }));
  }, [updateCurrentState]);

  // Choice Elimination (ABC mode)
  const handleToggleEliminate = useCallback((choice: 'A' | 'B' | 'C' | 'D') => {
    updateCurrentState(prev => {
      const isEliminated = prev.eliminatedChoices.includes(choice);
      return {
        ...prev,
        eliminatedChoices: isEliminated
          ? prev.eliminatedChoices.filter(c => c !== choice)
          : [...prev.eliminatedChoices, choice],
        selectedChoice: prev.selectedChoice === choice ? null : prev.selectedChoice,
      };
    });
  }, [updateCurrentState]);

  // Mark for Review & Bookmark in LocalStorage
  const handleToggleMarkForReview = useCallback(() => {
    updateCurrentState(prev => {
      const nextReview = !prev.isMarkedForReview;
      toggleSaveQuestion(currentQuestion.id);
      return {
        ...prev,
        isMarkedForReview: nextReview,
      };
    });
  }, [updateCurrentState, currentQuestion.id]);

  // Check Answer & Record to Statistics
  const handleCheckAnswer = useCallback((timeSpentSeconds?: number) => {
    if (!currentState.selectedChoice) return;
    const isCorrect = currentState.selectedChoice === currentQuestion.correctAnswer;
    
    // Record to persistent storage (satify_attempts)
    recordAnswer(
      currentQuestion.id,
      currentState.selectedChoice,
      isCorrect,
      currentQuestion.domain,
      currentQuestion.skill,
      currentQuestion.difficulty,
      timeSpentSeconds || 30
    );

    updateCurrentState(prev => ({
      ...prev,
      isAnswerChecked: true,
      isExplanationOpen: true,
    }));
  }, [currentState.selectedChoice, currentQuestion, updateCurrentState]);

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

  // Resizable Split Pane Logic
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const containerWidth = window.innerWidth;
      const newSplit = (e.clientX / containerWidth) * 100;
      if (newSplit >= 25 && newSplit <= 75) {
        setSplitRatio(newSplit);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

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
    setSessionQuestions(filtered.length > 0 ? filtered : allQuestions.filter(q => q.skill === skillName));
    setCurrentQuestionIndex(0);
    setUserStates({});
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
  }, [allQuestions]);

  // Launch custom practice from saved/mistakes
  const handleStartCustomPractice = useCallback((selectedQs: MockQuestion[]) => {
    if (selectedQs.length > 0) {
      setSessionQuestions(selectedQs);
      setCurrentQuestionIndex(0);
      setUserStates({});
      setCurrentRoute('practice');
    }
  }, []);

  // Practice session configuration started from SetupDashboard
  const handleStartPractice = useCallback((filtered: MockQuestion[], config: EnglishFilterConfig) => {
    setFilterConfig(config);
    // Strict exact skill and canonical domain-to-skill pairing
    let pool = filtered;
    if (config.selectedSkills && config.selectedSkills.length > 0) {
      pool = pool.filter(q => config.selectedSkills.includes(q.skill) && (!config.selectedDomains || config.selectedDomains.includes(q.domain)));
    }
    setSessionQuestions(pool.length > 0 ? pool : filtered);
    setCurrentQuestionIndex(0);
    setUserStates({});
    setIsSetupOpen(false);
    setCurrentRoute('practice');
  }, []);

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

  const savedCount = useMemo(() => getSavedQuestionIds().length, [currentState]);

  if (!isUnlocked) {
    return <PasscodeLock onUnlock={() => setIsUnlocked(true)} />;
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden h-[100dvh] max-h-[100dvh] flex flex-col md:flex-row overflow-hidden font-sans bg-slate-50 dark:bg-[#070a10] text-slate-900 dark:text-white">
      {/* 1. Mobile Top Bar (< 1024px / lg:hidden) when NOT in full practice mode */}
      {currentRoute !== 'practice' && (
        <div className="lg:hidden flex items-center justify-between px-4 py-2 pt-[max(env(safe-area-inset-top,0px),8px)] bg-white dark:bg-[#070a10] border-b border-slate-200 dark:border-slate-800 z-40 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-1 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Logo size="sm" variant="header" inverted={isDark} />
          </div>
          <div className="flex items-center gap-2">
            {currentUser ? (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="w-8 h-8 rounded-full overflow-hidden border-2 border-blue-600 flex items-center justify-center bg-blue-600 text-white font-bold text-xs cursor-pointer"
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
                className="px-2.5 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-xs cursor-pointer active:scale-95"
              >
                Sign In
              </button>
            )}

            <button
              onClick={toggleTheme}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
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
              onLock={handleLockApp}
              user={currentUser}
              onOpenLogin={() => setIsLoginModalOpen(true)}
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
            onLock={handleLockApp}
            user={currentUser}
            onOpenLogin={() => setIsLoginModalOpen(true)}
          />
        </div>
      )}

      {/* 4. Main Content Area */}
      <div className="flex-1 h-full overflow-hidden flex flex-col">
        <React.Suspense fallback={
          <div className="flex-1 flex items-center justify-center min-h-[300px] w-full bg-white dark:bg-[#070a10]">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          {currentRoute === 'home' && (
            <HomeDashboard
              questions={allQuestions}
              onStartSkillPractice={handleStartSkillPractice}
              onOpenQuestionBank={() => setIsSetupOpen(true)}
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
          <div className="fixed inset-0 h-[100dvh] max-h-[100dvh] w-full flex flex-col overflow-hidden bg-white dark:bg-[#070a10] z-30">
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
              user={currentUser}
              onOpenLogin={() => setIsLoginModalOpen(true)}
            />

            {/* Split Pane / Stacked Mobile Workspace */}
            <main className="flex-1 min-h-0 w-full flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden overscroll-contain relative bg-white dark:bg-[#070a10]">
              {!isLeftCollapsed ? (
                <>
                  {/* Left Pane: Reading Passage, Visual Graphs, Paired Texts, Poems */}
                  <section
                    style={isDesktop ? { width: `${splitRatio}%` } : undefined}
                    className="w-full lg:h-full bg-white dark:bg-[#070a10] lg:overflow-hidden flex flex-col border-b lg:border-b-0 border-slate-200 dark:border-slate-800 shrink-0"
                  >
                    <LeftPane
                      question={currentQuestion}
                      isAnnotateActive={isAnnotateActive}
                      highlights={currentHighlights}
                      onHighlightClick={handleHighlightClick}
                      onTextSelected={handleTextSelected}
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

                  {/* Interactive Drag Divider (Hidden on < 1280px / xl:hidden) */}
                  <div
                    onMouseDown={handleMouseDown}
                    onDoubleClick={() => setIsLeftCollapsed(true)}
                    className="hidden xl:flex relative w-1 bg-slate-200 dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-blue-500 items-center justify-center cursor-col-resize transition-colors z-20 group shrink-0"
                    title="Drag to resize panes • Double-click to collapse left pane"
                  >
                    <div className="absolute h-10 w-4 rounded-full bg-slate-900 dark:bg-slate-700 group-hover:bg-blue-600 text-white flex items-center justify-center shadow-md transition-colors pointer-events-none">
                      <GripVertical className="w-3 h-3 text-slate-300" />
                    </div>
                  </div>

                  {/* Right Pane: Question Stem, Options, Controls & Rationale (pb-24 on mobile/tablet so questions never overlap fixed footer) */}
                  <section
                    style={isDesktop ? { width: `${100 - splitRatio}%` } : undefined}
                    className="w-full xl:h-full bg-white dark:bg-[#070a10] xl:overflow-hidden flex flex-col shrink-0 pb-24 xl:pb-0"
                  >
                    <RightPane
                      question={currentQuestion}
                      userState={currentState}
                      onSelectChoice={handleSelectChoice}
                      onToggleEliminate={handleToggleEliminate}
                      onToggleMarkForReview={handleToggleMarkForReview}
                      onCheckAnswer={handleCheckAnswer}
                      onToggleExplanation={handleToggleExplanation}
                      highlights={currentHighlights}
                      onHighlightClick={handleHighlightClick}
                      onOpenGrammarGuide={() => setIsGrammarGuideOpen(true)}
                    />
                  </section>
                </>
              ) : (
                /* Collapsed Full Width View */
                <div className="relative w-full h-full bg-white dark:bg-[#070a10] overflow-y-auto flex flex-col">
                  <button
                    onClick={() => setIsLeftCollapsed(false)}
                    className="absolute left-6 top-3 z-30 flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-xs font-semibold text-gray-700 dark:text-slate-200 shadow-xs transition cursor-pointer"
                    title="Restore Two-Pane Split View"
                  >
                    <Columns className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Split View</span>
                  </button>

                  <div className="w-full max-w-4xl mx-auto h-full flex flex-col">
                    <RightPane
                      question={currentQuestion}
                      userState={currentState}
                      onSelectChoice={handleSelectChoice}
                      onToggleEliminate={handleToggleEliminate}
                      onToggleMarkForReview={handleToggleMarkForReview}
                      onCheckAnswer={handleCheckAnswer}
                      onToggleExplanation={handleToggleExplanation}
                      highlights={currentHighlights}
                      onHighlightClick={handleHighlightClick}
                      onOpenGrammarGuide={() => setIsGrammarGuideOpen(true)}
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
      />

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
