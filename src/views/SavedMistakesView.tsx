import React, { useState, useMemo, useEffect } from 'react';
import { 
  Bookmark, 
  XCircle, 
  Play, 
  Search, 
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  HelpCircle
} from 'lucide-react';
import { MockQuestion, AnswerChoice } from '../types/quiz';
import { RichText } from '../components/RichText';
import { ExplanationRenderer } from '../components/ExplanationRenderer';
import { 
  getSavedQuestionIds, 
  getLatestAttemptsMap,
  getAnsweredQuestionIds,
  toggleSaveQuestion 
} from '../utils/storage';

interface SavedMistakesViewProps {
  questions: MockQuestion[];
  onStartCustomPractice: (selectedQuestions: MockQuestion[]) => void;
}

export const SavedMistakesView: React.FC<SavedMistakesViewProps> = ({
  questions,
  onStartCustomPractice,
}) => {
  const [tab, setTab] = useState<'answered' | 'mistakes' | 'saved'>('answered');
  const [sectionFilter, setSectionFilter] = useState<'all' | 'Reading and Writing' | 'Math'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [storageVersion, setStorageVersion] = useState<number>(0);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  // Live storage update listener
  useEffect(() => {
    const handleUpdate = () => setStorageVersion(prev => prev + 1);
    window.addEventListener('satify_storage_update', handleUpdate);
    return () => window.removeEventListener('satify_storage_update', handleUpdate);
  }, []);

  const savedIds = useMemo(() => getSavedQuestionIds(), [storageVersion]);
  const attemptsMap = useMemo(() => getLatestAttemptsMap(), [storageVersion]);
  const answeredIds = useMemo(() => getAnsweredQuestionIds(), [storageVersion]);

  // Filtered lists
  const answeredQuestions = useMemo(() => {
    return questions.filter(q => answeredIds.has(q.id) || !!attemptsMap[q.id]);
  }, [questions, answeredIds, attemptsMap]);

  const mistakeQuestions = useMemo(() => {
    const wrongIds = Object.values(attemptsMap)
      .filter(a => !a.isCorrect)
      .map(a => a.questionId);
    return questions.filter(q => wrongIds.includes(q.id));
  }, [questions, attemptsMap]);

  const savedQuestions = useMemo(() => {
    return questions.filter(q => savedIds.includes(q.id));
  }, [questions, savedIds]);

  const currentList = tab === 'answered'
    ? answeredQuestions
    : tab === 'mistakes' 
    ? mistakeQuestions 
    : savedQuestions;

  const mathDomains = ['Algebra', 'Advanced Math', 'Problem-Solving and Data Analysis', 'Geometry and Trigonometry'];

  // Apply search, section, and difficulty filter
  const displayedQuestions = useMemo(() => {
    return currentList.filter(q => {
      const isMath = q.section === 'Math' || mathDomains.includes(q.domain);
      if (sectionFilter === 'Reading and Writing' && isMath) return false;
      if (sectionFilter === 'Math' && !isMath) return false;

      const matchSearch = searchTerm === '' ||
        (q.passage && q.passage.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (q.prompt && q.prompt.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (q.skill && q.skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (q.id && q.id.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchDiff = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
      return matchSearch && matchDiff;
    });
  }, [currentList, searchTerm, selectedDifficulty, sectionFilter]);

  const handleToggleBookmark = (id: string) => {
    toggleSaveQuestion(id);
  };

  const handlePracticeAll = () => {
    if (displayedQuestions.length > 0) {
      onStartCustomPractice(displayedQuestions);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedQuestionId(prev => prev === id ? null : id);
  };

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-neutral-50 dark:bg-[#090A0F] text-zinc-950 dark:text-[#F4F4F6] px-4 sm:px-6 md:px-10 py-6 sm:py-8 space-y-6 select-text">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-[#222634]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-semibold tracking-wider text-blue-700 dark:text-blue-400 uppercase">
              Question Archive
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 dark:text-[#F4F4F6] mt-1">
            Saved & Mistake Bank
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-[#8E95A5] mt-1">
            Review detailed question rationales, see your exact incorrect choices, and retry questions to lock in mastery.
          </p>
        </div>

        {displayedQuestions.length > 0 && (
          <button
            onClick={handlePracticeAll}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 font-semibold text-xs shadow-xs hover:shadow transition-all duration-150 active:scale-95 cursor-pointer w-fit"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>
              {tab === 'answered'
                ? `Practice All Answered (${displayedQuestions.length})`
                : tab === 'mistakes' 
                ? `Practice All Mistakes (${displayedQuestions.length})`
                : `Practice Saved (${displayedQuestions.length})`}
            </span>
          </button>
        )}
      </div>

      {/* Tabs & Search Filter Strip */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Toggle Pill */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] rounded-xl shadow-2xs flex-wrap gap-1">
            <button
              onClick={() => setTab('answered')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-150 active:scale-95 cursor-pointer ${
                tab === 'answered'
                  ? 'bg-blue-700 text-white dark:bg-blue-600 font-semibold shadow-xs'
                  : 'text-zinc-600 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.75} />
              <span>Answered ({answeredQuestions.length})</span>
            </button>

            <button
              onClick={() => setTab('mistakes')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-150 active:scale-95 cursor-pointer ${
                tab === 'mistakes'
                  ? 'bg-blue-700 text-white dark:bg-blue-600 font-semibold shadow-xs'
                  : 'text-zinc-600 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-rose-400" strokeWidth={1.75} />
              <span>Mistakes ({mistakeQuestions.length})</span>
            </button>

            <button
              onClick={() => setTab('saved')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-150 active:scale-95 cursor-pointer ${
                tab === 'saved'
                  ? 'bg-blue-700 text-white dark:bg-blue-600 font-semibold shadow-xs'
                  : 'text-zinc-600 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Saved ({savedQuestions.length})</span>
            </button>
          </div>

          {/* Section Filter Pills */}
          <div className="inline-flex p-1 bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] rounded-xl shadow-2xs gap-1">
            {[
              { id: 'all', label: 'All Sections' },
              { id: 'Reading and Writing', label: 'R&W' },
              { id: 'Math', label: 'Math' },
            ].map(sec => (
              <button
                key={sec.id}
                onClick={() => setSectionFilter(sec.id as 'all' | 'Reading and Writing' | 'Math')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all duration-150 active:scale-95 cursor-pointer ${
                  sectionFilter === sec.id
                    ? 'bg-blue-700 text-white dark:bg-blue-600 font-semibold shadow-xs'
                    : 'text-zinc-600 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Difficulty Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search passage, prompt, or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] rounded-xl text-xs font-medium text-zinc-950 dark:text-[#F4F4F6] placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 w-44 sm:w-56 transition-colors shadow-2xs"
            />
          </div>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] rounded-xl text-xs font-semibold text-zinc-800 dark:text-[#F4F4F6] focus:outline-hidden focus:border-blue-600 transition-colors shadow-2xs cursor-pointer"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      {displayedQuestions.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] rounded-2xl space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-[#181B24] text-zinc-400 mx-auto flex items-center justify-center">
            {tab === 'saved' ? <Bookmark className="w-6 h-6" /> : tab === 'answered' ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <XCircle className="w-6 h-6 text-rose-500" />}
          </div>
          <h3 className="font-bold text-base text-zinc-950 dark:text-[#F4F4F6]">
            {tab === 'saved' ? 'No Saved Bookmarks Yet' : tab === 'answered' ? 'No Answered Questions Recorded Yet' : 'No Incorrect Questions Recorded'}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-[#8E95A5] max-w-sm mx-auto">
            {tab === 'saved'
              ? 'Click the bookmark ribbon on any question during practice to save it here for later review.'
              : tab === 'answered'
              ? 'Answer questions in practice mode and every question you answer will be saved and displayed here!'
              : 'Great job! Questions you miss during practice will automatically appear here for review and retry.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedQuestions.map((q) => {
            const attempt = attemptsMap[q.id];
            const isExpanded = expandedQuestionId === q.id;
            const options: AnswerChoice[] = q.options || q.choices || [];
            const isMath = q.section === 'Math' || mathDomains.includes(q.domain);

            return (
              <div
                key={q.id}
                className="bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] hover:border-zinc-300 dark:hover:border-zinc-700 rounded-2xl shadow-2xs hover:shadow-xs transition-all duration-200 overflow-hidden"
              >
                {/* Summary Header Bar */}
                <div className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-zinc-400 dark:text-[#8E95A5]">
                        ID: {q.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        isMath
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60'
                          : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/60'
                      }`}>
                        {isMath ? 'Math' : 'R&W'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-100 dark:bg-[#181B24] text-zinc-700 dark:text-[#C5CAD6] border border-zinc-200 dark:border-[#222634]">
                        {q.skill}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        q.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                        q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800' :
                        'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}>
                        {q.difficulty}
                      </span>
                      {q.questionType === 'spr' && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          SPR
                        </span>
                      )}
                      {attempt ? (
                        attempt.isCorrect ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Answered • {q.questionType === 'spr' ? `Entered (${attempt.selectedOption}) Correct` : `Choice (${attempt.selectedOption}) Correct`}</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                            <span>Answered • {q.questionType === 'spr' ? `Entered (${attempt.selectedOption}) • Correct: ${q.correctAnswer}` : `Chose (${attempt.selectedOption}) • Correct: (${q.correctAnswer})`}</span>
                          </span>
                        )
                      ) : answeredIds.has(q.id) ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>Answered</span>
                        </span>
                      ) : null}
                    </div>

                    <div className="font-serif text-sm text-zinc-800 dark:text-[#C5CAD6] line-clamp-2">
                      <RichText text={q.passage} />
                    </div>

                    <div className="text-xs font-semibold text-zinc-600 dark:text-[#8E95A5] line-clamp-1">
                      <RichText text={q.prompt} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => toggleExpand(q.id)}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl border border-zinc-200 dark:border-[#222634] text-zinc-700 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-[#F4F4F6] hover:bg-zinc-100 dark:hover:bg-[#181B24] text-xs font-semibold transition-all duration-150 cursor-pointer active:scale-95 shadow-2xs"
                      title={isExpanded ? 'Hide Review Details' : 'Show Full Review'}
                    >
                      <span>{isExpanded ? 'Hide Details' : 'Review'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleToggleBookmark(q.id)}
                      className={`p-2 rounded-xl border transition-all duration-150 cursor-pointer active:scale-90 ${
                        savedIds.includes(q.id)
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 hover:bg-amber-100 shadow-2xs'
                          : 'border-zinc-200 dark:border-[#222634] text-zinc-400 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#181B24]'
                      }`}
                      title={savedIds.includes(q.id) ? 'Remove Bookmark' : 'Bookmark Question'}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>

                    <button
                      onClick={() => onStartCustomPractice([q])}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 font-semibold text-xs transition-all duration-150 active:scale-95 cursor-pointer shadow-xs hover:shadow"
                      title="Practice this question"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Retry</span>
                    </button>
                  </div>
                </div>

                {/* Full Review Inspection Drawer */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-2 border-t border-zinc-100 dark:border-[#181B24] bg-neutral-50/50 dark:bg-[#090A0F]/50 space-y-5 animate-in fade-in duration-150">
                    {/* Full Passage */}
                    <div className="p-4 bg-white dark:bg-[#11131A] rounded-xl border border-zinc-200 dark:border-[#222634] space-y-2 shadow-2xs">
                      <span className="text-[11px] font-bold text-zinc-400 dark:text-[#8E95A5] uppercase tracking-wider">
                        Passage Stimulus
                      </span>
                      {q.imageUrl && (
                        <div className="my-2 p-3 bg-zinc-50 dark:bg-[#181B24] border border-zinc-200 dark:border-[#222634] rounded-lg flex items-center justify-center">
                          <img src={q.imageUrl} alt="Question figure" className="max-w-full h-auto object-contain rounded" />
                        </div>
                      )}
                      <div className="font-serif text-[15px] leading-relaxed text-zinc-950 dark:text-[#F4F4F6] whitespace-pre-line">
                        <RichText text={q.passage} />
                      </div>
                    </div>

                    {/* Question Prompt */}
                    <div className="p-4 bg-white dark:bg-[#11131A] rounded-xl border border-zinc-200 dark:border-[#222634] space-y-2 shadow-2xs">
                      <span className="text-[11px] font-bold text-zinc-400 dark:text-[#8E95A5] uppercase tracking-wider">
                        Question Prompt
                      </span>
                      <div className="font-serif font-semibold text-[15px] text-zinc-950 dark:text-[#F4F4F6]">
                        <RichText text={q.prompt} />
                      </div>
                    </div>

                    {/* Options Breakdown */}
                    {q.questionType === 'spr' ? (
                      <div className="space-y-2.5">
                        <span className="text-[11px] font-bold text-zinc-400 dark:text-[#8E95A5] uppercase tracking-wider block">
                          Student-Produced Response
                        </span>
                        <div className="p-4 rounded-xl border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] space-y-3 shadow-2xs">
                          <div className="flex flex-wrap items-center gap-6">
                            <div>
                              <div className="text-[11px] font-bold text-zinc-500 dark:text-[#8E95A5] uppercase tracking-wider">
                                Official Correct Answer
                              </div>
                              <div className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                {q.correctAnswer}
                                {q.acceptedAnswers && q.acceptedAnswers.length > 1 && (
                                  <span className="text-xs font-normal text-zinc-500 dark:text-[#8E95A5] ml-2 font-sans">
                                    (also accepted: {q.acceptedAnswers.filter(a => a !== q.correctAnswer).join(', ')})
                                  </span>
                                )}
                              </div>
                            </div>
                            {attempt && attempt.selectedOption && (
                              <div>
                                <div className="text-[11px] font-bold text-zinc-500 dark:text-[#8E95A5] uppercase tracking-wider">
                                  Your Recorded Response
                                </div>
                                <div className={`font-mono text-lg font-bold mt-0.5 ${
                                  attempt.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                                }`}>
                                  {attempt.selectedOption}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <span className="text-[11px] font-bold text-zinc-400 dark:text-[#8E95A5] uppercase tracking-wider block">
                          Answer Choices
                        </span>
                        <div className="grid grid-cols-1 gap-2.5">
                          {options.map(opt => {
                            const optLabel = opt.id || opt.label || 'A';
                            const isCorrect = optLabel === q.correctAnswer;
                            const wasChosenWrong = attempt && attempt.selectedOption === optLabel && !isCorrect;

                            let cardStyle = 'border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] text-zinc-950 dark:text-[#F4F4F6] shadow-2xs';
                            let badge = null;

                            if (isCorrect) {
                              cardStyle = 'border-2 border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100 font-medium shadow-xs';
                              badge = (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full shrink-0">
                                  <Check className="w-3 h-3 stroke-[3]" /> Correct Answer
                                </span>
                              );
                            } else if (wasChosenWrong) {
                              cardStyle = 'border-2 border-rose-500 bg-rose-50/70 dark:bg-rose-950/30 text-rose-950 dark:text-rose-100 shadow-xs';
                              badge = (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded-full shrink-0">
                                  <X className="w-3 h-3 stroke-[3]" /> Your Selection
                                </span>
                              );
                            }

                            return (
                              <div
                                key={optLabel}
                                className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${cardStyle}`}
                              >
                                <div className="flex items-start gap-3 flex-1">
                                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                    isCorrect ? 'bg-emerald-600 text-white' :
                                    wasChosenWrong ? 'bg-rose-600 text-white' :
                                    'bg-zinc-100 dark:bg-[#181B24] text-zinc-700 dark:text-[#8E95A5] border border-zinc-200 dark:border-[#222634]'
                                  }`}>
                                    {optLabel}
                                  </span>
                                  <div className="font-serif text-sm pt-0.5 space-y-2 flex-1">
                                    {opt.text && <RichText text={opt.text} />}
                                    {opt.imageUrl && (
                                      <div className="p-2 bg-zinc-50 dark:bg-[#181B24] border border-zinc-200 dark:border-[#222634] rounded-lg inline-block">
                                        <img src={opt.imageUrl} alt={`Choice ${optLabel}`} className="max-h-24 max-w-full object-contain rounded" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {badge}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Official Rationale / Explanation */}
                    {q.rationale && (
                      <div className="p-4 bg-blue-50/80 dark:bg-[#141622] border border-blue-200/80 dark:border-blue-900/50 rounded-xl space-y-2 shadow-2xs">
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-xs uppercase tracking-wider mb-2">
                          <HelpCircle className="w-4 h-4" />
                          <span>Official Explanation & Rationale</span>
                        </div>
                        <ExplanationRenderer rationale={q.rationale} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedMistakesView;
