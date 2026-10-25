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

  // Apply search and difficulty filter
  const displayedQuestions = useMemo(() => {
    return currentList.filter(q => {
      const matchSearch = searchTerm === '' ||
        q.passage.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.skill.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchDiff = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
      return matchSearch && matchDiff;
    });
  }, [currentList, searchTerm, selectedDifficulty]);

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
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 font-semibold text-xs transition-colors duration-150 cursor-pointer w-fit"
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Toggle Pill */}
        <div className="inline-flex p-0.5 bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] rounded-lg shadow-2xs flex-wrap gap-1">
          <button
            onClick={() => setTab('answered')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors duration-150 ${
              tab === 'answered'
                ? 'bg-blue-700 text-white dark:bg-blue-600 font-semibold shadow-2xs'
                : 'text-zinc-600 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.75} />
            <span>Answered ({answeredQuestions.length})</span>
          </button>

          <button
            onClick={() => setTab('mistakes')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors duration-150 ${
              tab === 'mistakes'
                ? 'bg-blue-700 text-white dark:bg-blue-600 font-semibold shadow-2xs'
                : 'text-zinc-600 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-rose-400" strokeWidth={1.75} />
            <span>Mistakes ({mistakeQuestions.length})</span>
          </button>

          <button
            onClick={() => setTab('saved')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors duration-150 ${
              tab === 'saved'
                ? 'bg-blue-700 text-white dark:bg-blue-600 font-semibold shadow-2xs'
                : 'text-zinc-600 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>Saved ({savedQuestions.length})</span>
          </button>
        </div>

        {/* Search & Difficulty Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search passage, prompt, or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0050d8] w-48 sm:w-64"
            />
          </div>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#0050d8]"
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
        <div className="p-12 text-center bg-white border border-gray-200 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
            {tab === 'saved' ? <Bookmark className="w-6 h-6" /> : tab === 'answered' ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <XCircle className="w-6 h-6 text-rose-500" />}
          </div>
          <h3 className="font-bold text-base text-gray-800">
            {tab === 'saved' ? 'No Saved Bookmarks Yet' : tab === 'answered' ? 'No Answered Questions Recorded Yet' : 'No Incorrect Questions Recorded'}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
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

            return (
              <div
                key={q.id}
                className="bg-white border border-gray-200 rounded-xl shadow-xs hover:border-gray-300 transition overflow-hidden"
              >
                {/* Summary Header Bar */}
                <div className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-gray-400">
                        ID: {q.id}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-[#0050d8] border border-blue-100">
                        {q.skill}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        q.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700' :
                        q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700' :
                        'bg-rose-50 text-rose-700'
                      }`}>
                        {q.difficulty}
                      </span>
                      {attempt ? (
                        attempt.isCorrect ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Answered • Choice ({attempt.selectedOption}) Correct</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>Answered • Chose ({attempt.selectedOption}) • Correct: ({q.correctAnswer})</span>
                          </span>
                        )
                      ) : answeredIds.has(q.id) ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Answered</span>
                        </span>
                      ) : null}
                    </div>

                    <div className="font-serif text-sm text-gray-800 line-clamp-2">
                      <RichText text={q.passage} />
                    </div>

                    <div className="text-xs font-semibold text-gray-600 line-clamp-1">
                      <RichText text={q.prompt} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => toggleExpand(q.id)}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition cursor-pointer"
                      title={isExpanded ? 'Hide Review Details' : 'Show Full Review'}
                    >
                      <span>{isExpanded ? 'Hide Details' : 'Review'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleToggleBookmark(q.id)}
                      className={`p-2 rounded-lg border transition cursor-pointer ${
                        savedIds.includes(q.id)
                          ? 'bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-100'
                          : 'border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                      title={savedIds.includes(q.id) ? 'Remove Bookmark' : 'Bookmark Question'}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>

                    <button
                      onClick={() => onStartCustomPractice([q])}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gray-900 hover:bg-[#0050d8] text-white font-bold text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer"
                      title="Practice this question"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Retry Question</span>
                    </button>
                  </div>
                </div>

                {/* Full Review Inspection Drawer */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-2 border-t border-gray-100 bg-slate-50/50 space-y-5 animate-in fade-in duration-150">
                    {/* Full Passage */}
                    <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-2">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Passage Stimulus
                      </span>
                      {q.imageUrl && (
                        <div className="my-2 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
                          <img src={q.imageUrl} alt="Question figure" className="max-w-full h-auto object-contain rounded" />
                        </div>
                      )}
                      <div className="font-serif text-[15px] leading-relaxed text-gray-900 whitespace-pre-line">
                        <RichText text={q.passage} />
                      </div>
                    </div>

                    {/* Question Prompt */}
                    <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-2">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Question Prompt
                      </span>
                      <div className="font-serif font-semibold text-[15px] text-gray-900">
                        <RichText text={q.prompt} />
                      </div>
                    </div>

                    {/* Options Breakdown */}
                    <div className="space-y-2.5">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                        Answer Choices
                      </span>
                      <div className="grid grid-cols-1 gap-2.5">
                        {options.map(opt => {
                          const optLabel = opt.id || opt.label || 'A';
                          const isCorrect = optLabel === q.correctAnswer;
                          const wasChosenWrong = attempt && attempt.selectedOption === optLabel && !isCorrect;

                          let cardStyle = 'border-gray-200 bg-white text-gray-800';
                          let badge = null;

                          if (isCorrect) {
                            cardStyle = 'border-2 border-emerald-500 bg-emerald-50/70 text-emerald-950 font-medium';
                            badge = (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                                <Check className="w-3 h-3 stroke-[3]" /> Correct Answer
                              </span>
                            );
                          } else if (wasChosenWrong) {
                            cardStyle = 'border-2 border-rose-500 bg-rose-50/70 text-rose-950';
                            badge = (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full shrink-0">
                                <X className="w-3 h-3 stroke-[3]" /> Your Selection
                              </span>
                            );
                          }

                          return (
                            <div
                              key={optLabel}
                              className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${cardStyle}`}
                            >
                              <div className="flex items-start gap-3">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isCorrect ? 'bg-emerald-600 text-white' :
                                  wasChosenWrong ? 'bg-rose-600 text-white' :
                                  'bg-gray-100 text-gray-700 border border-gray-300'
                                }`}>
                                  {optLabel}
                                </span>
                                <div className="font-serif text-sm pt-0.5">
                                  <RichText text={opt.text} />
                                </div>
                              </div>
                              {badge}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Official Rationale / Explanation */}
                    {q.rationale && (
                      <div className="p-4 bg-blue-50/80 dark:bg-[#0f1522] border border-blue-200 dark:border-slate-800 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-[#0050d8] dark:text-blue-400 font-bold text-xs uppercase tracking-wider mb-2">
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
