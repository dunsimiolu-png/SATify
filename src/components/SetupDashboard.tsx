import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Play, 
  X,
  Shuffle,
  EyeOff,
  Sun,
  Moon,
  RotateCcw,
  AlertTriangle,
  BookOpen,
  Calculator
} from 'lucide-react';
import { MockQuestion, EnglishFilterConfig, DifficultyLevel } from '../types/quiz';
import { allQuestions } from '../data/mockQuestions';
import { Logo } from './Logo';
import { useTheme } from '../utils/theme';
import { getAnsweredQuestionIds } from '../utils/storage';

interface SetupDashboardProps {
  isOpen: boolean;
  onClose?: () => void;
  onStartPractice: (filteredQuestions: MockQuestion[], config: EnglishFilterConfig) => void;
  currentConfig?: EnglishFilterConfig;
}

const RW_DOMAINS = [
  'Craft and Structure',
  'Information and Ideas',
  'Expression of Ideas',
  'Standard English Conventions',
] as const;

const MATH_DOMAINS = [
  'Algebra',
  'Advanced Math',
  'Problem-Solving and Data Analysis',
  'Geometry and Trigonometry',
] as const;

const ALL_DOMAINS = [...RW_DOMAINS, ...MATH_DOMAINS] as const;

const SKILLS_BY_DOMAIN: Record<string, string[]> = {
  // Reading & Writing
  'Craft and Structure': [
    'Words in Context',
    'Text Structure and Purpose',
    'Cross-Text Connections',
  ],
  'Information and Ideas': [
    'Central Ideas and Details',
    'Command of Evidence',
    'Inferences',
  ],
  'Expression of Ideas': [
    'Rhetorical Synthesis',
    'Transitions',
  ],
  'Standard English Conventions': [
    'Boundaries',
    'Form, Structure, and Sense',
  ],
  // Math
  'Algebra': [
    'Linear equations in one variable',
    'Linear equations in two variables',
    'Linear functions',
    'Systems of two linear equations in two variables',
    'Linear inequalities in one or two variables',
  ],
  'Advanced Math': [
    'Equivalent expressions',
    'Nonlinear equations in one variable and systems of equations in two variables',
    'Nonlinear functions',
  ],
  'Problem-Solving and Data Analysis': [
    'Ratios, rates, proportional relationships, and units',
    'Percentages',
    'One-variable data: Distributions and measures of center and spread',
    'Two-variable data: Models and scatterplots',
    'Probability and conditional probability',
    'Inference from sample statistics and margin of error',
    'Evaluating statistical claims: Observational studies and experiments',
  ],
  'Geometry and Trigonometry': [
    'Area and volume',
    'Lines, angles, and triangles',
    'Right triangles and trigonometry',
    'Circles',
  ],
};

const RW_SKILLS = RW_DOMAINS.flatMap(d => SKILLS_BY_DOMAIN[d]);
const MATH_SKILLS = MATH_DOMAINS.flatMap(d => SKILLS_BY_DOMAIN[d]);
const ALL_SKILLS = Object.values(SKILLS_BY_DOMAIN).flat();

export const SetupDashboard: React.FC<SetupDashboardProps> = ({
  isOpen,
  onClose,
  onStartPractice,
  currentConfig,
}) => {
  const { isDark, toggleTheme } = useTheme();
  // Config state
  const [test, setTest] = useState<'SAT'>('SAT');
  const [selectedDomains, setSelectedDomains] = useState<string[]>(
    currentConfig?.selectedDomains ?? [...ALL_DOMAINS]
  );
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    currentConfig?.selectedSkills ?? [...ALL_SKILLS]
  );
  const [selectedDifficulties, setSelectedDifficulties] = useState<DifficultyLevel[]>(
    currentConfig?.selectedDifficulties ?? ['Easy', 'Medium', 'Hard']
  );
  const [shuffle, setShuffle] = useState<boolean>(currentConfig?.shuffle ?? false);
  const [hideAnswered, setHideAnswered] = useState<boolean>(
    currentConfig?.hideAnswered ?? currentConfig?.excludeActive ?? false
  );

  // Accordion state for all 8 domain dropdowns
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({
    'Craft and Structure': false,
    'Information and Ideas': false,
    'Expression of Ideas': false,
    'Standard English Conventions': false,
    'Algebra': false,
    'Advanced Math': false,
    'Problem-Solving and Data Analysis': false,
    'Geometry and Trigonometry': false,
  });

  useEffect(() => {
    if (isOpen && currentConfig) {
      if (currentConfig.selectedDomains) {
        setSelectedDomains(currentConfig.selectedDomains);
      }
      if (currentConfig.selectedSkills) {
        setSelectedSkills(currentConfig.selectedSkills);
      }
      if (currentConfig.selectedDifficulties) {
        setSelectedDifficulties(currentConfig.selectedDifficulties);
      }
    }
  }, [isOpen, currentConfig]);

  const toggleDomainExpanded = (domain: string) => {
    setExpandedDomains(prev => ({
      ...prev,
      [domain]: !prev[domain],
    }));
  };

  // Master Subject Toggles
  const isRwAllSelected = RW_DOMAINS.every(d => selectedDomains.includes(d));
  const isMathAllSelected = MATH_DOMAINS.every(d => selectedDomains.includes(d));

  const handleToggleRWMaster = () => {
    if (isRwAllSelected) {
      // Deselect all R&W
      setSelectedDomains(prev => prev.filter(d => !RW_DOMAINS.includes(d as any)));
      setSelectedSkills(prev => prev.filter(s => !RW_SKILLS.includes(s)));
    } else {
      // Select all R&W
      setSelectedDomains(prev => Array.from(new Set([...prev, ...RW_DOMAINS])));
      setSelectedSkills(prev => Array.from(new Set([...prev, ...RW_SKILLS])));
    }
  };

  const handleToggleMathMaster = () => {
    if (isMathAllSelected) {
      // Deselect all Math
      setSelectedDomains(prev => prev.filter(d => !MATH_DOMAINS.includes(d as any)));
      setSelectedSkills(prev => prev.filter(s => !MATH_SKILLS.includes(s)));
    } else {
      // Select all Math
      setSelectedDomains(prev => Array.from(new Set([...prev, ...MATH_DOMAINS])));
      setSelectedSkills(prev => Array.from(new Set([...prev, ...MATH_SKILLS])));
    }
  };

  // Toggle domain
  const handleToggleDomain = (domain: string) => {
    const isSelected = selectedDomains.includes(domain);
    const domainSkills = SKILLS_BY_DOMAIN[domain] || [];

    if (isSelected) {
      setSelectedDomains(prev => prev.filter(d => d !== domain));
      setSelectedSkills(prev => prev.filter(s => !domainSkills.includes(s)));
    } else {
      setSelectedDomains(prev => [...prev, domain]);
      setSelectedSkills(prev => Array.from(new Set([...prev, ...domainSkills])));
    }
  };

  // Toggle skill
  const handleToggleSkill = (domain: string, skill: string) => {
    const isSelected = selectedSkills.includes(skill);
    const domainSkills = SKILLS_BY_DOMAIN[domain] || [];

    let newSkills: string[];
    if (isSelected) {
      newSkills = selectedSkills.filter(s => s !== skill);
    } else {
      newSkills = [...selectedSkills, skill];
    }
    setSelectedSkills(newSkills);

    // Update parent domain selection
    const anyDomainSkillSelected = domainSkills.some(s => newSkills.includes(s));
    if (anyDomainSkillSelected && !selectedDomains.includes(domain)) {
      setSelectedDomains(prev => [...prev, domain]);
    } else if (!anyDomainSkillSelected && selectedDomains.includes(domain)) {
      setSelectedDomains(prev => prev.filter(d => d !== domain));
    }
  };

  // Toggle difficulty
  const handleToggleDifficulty = (diff: DifficultyLevel) => {
    if (selectedDifficulties.includes(diff)) {
      if (selectedDifficulties.length === 1) return; // keep at least 1
      setSelectedDifficulties(selectedDifficulties.filter(d => d !== diff));
    } else {
      setSelectedDifficulties([...selectedDifficulties, diff]);
    }
  };

  // Compute question counts for each category
  const counts = useMemo(() => {
    const domainMap: Record<string, number> = {};
    const skillMap: Record<string, number> = {};
    const diffMap: Record<string, number> = { Easy: 0, Medium: 0, Hard: 0 };
    let rwTotal = 0;
    let mathTotal = 0;

    for (const q of allQuestions) {
      domainMap[q.domain] = (domainMap[q.domain] || 0) + 1;
      skillMap[q.skill] = (skillMap[q.skill] || 0) + 1;
      diffMap[q.difficulty] = (diffMap[q.difficulty] || 0) + 1;
      if (q.section === 'Math') mathTotal++;
      else rwTotal++;
    }

    return { domainMap, skillMap, diffMap, rwTotal, mathTotal };
  }, []);

  // Compute matched questions from satify_attempts
  const answeredIds = useMemo(() => {
    return hideAnswered ? getAnsweredQuestionIds() : new Set<string>();
  }, [hideAnswered]);

  const matchedQuestions = useMemo(() => {
    return allQuestions.filter(q => {
      // Must match selected skill strictly
      if (!selectedSkills.includes(q.skill)) return false;
      // Must match canonical domain-to-skill pairing
      if (!selectedDomains.includes(q.domain)) return false;
      // Must match selected difficulty
      if (!selectedDifficulties.includes(q.difficulty)) return false;
      // Hide already answered if option enabled (reading from satify_attempts)
      if (hideAnswered && answeredIds.has(q.id)) return false;
      return true;
    });
  }, [selectedSkills, selectedDomains, selectedDifficulties, hideAnswered, answeredIds]);

  const handleResetFilters = () => {
    setSelectedDomains([...ALL_DOMAINS]);
    setSelectedSkills([...ALL_SKILLS]);
    setSelectedDifficulties(['Easy', 'Medium', 'Hard']);
    setHideAnswered(false);
  };

  const handleLaunch = () => {
    if (matchedQuestions.length === 0) return;
    let pool = [...matchedQuestions];

    // Apply shuffle if enabled
    if (shuffle) {
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
    }

    const config: EnglishFilterConfig = {
      test,
      masterCategory: true,
      selectedDomains,
      selectedSkills,
      selectedDifficulties,
      shuffle,
      excludeActive: hideAnswered,
      hideAnswered,
    };

    onStartPractice(pool, config);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto select-none animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl bg-white text-zinc-950 dark:bg-[#11131A] dark:text-[#F4F4F6] rounded-2xl border border-zinc-200/90 dark:border-[#222634] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-200 dark:border-[#222634] bg-neutral-50/80 dark:bg-[#181B24]/80 backdrop-blur-xs flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="shrink-0">
              <Logo size="sm" variant="header" inverted={isDark} />
            </div>
            <div className="h-6 w-px bg-zinc-200 dark:bg-[#222634] hidden sm:block" />
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base md:text-lg font-bold text-zinc-950 dark:text-[#F4F4F6] tracking-tight truncate">
                Question Bank Filter
              </h2>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-[#8E95A5] truncate">
                Digital SAT Reading &amp; Writing + Math Practice
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-1.5 px-2.5 rounded-lg text-zinc-600 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-[#F4F4F6] hover:bg-zinc-100 dark:hover:bg-[#181B24] transition-all duration-150 flex items-center gap-1.5 text-xs font-semibold border border-transparent hover:border-zinc-200 dark:hover:border-[#222634] cursor-pointer active:scale-95"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle dark/light theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-700" />
              )}
              <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-950 dark:hover:text-[#F4F4F6] hover:bg-zinc-100 dark:hover:bg-[#181B24] transition-all duration-150 cursor-pointer active:scale-90"
                title="Close and return to active quiz"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Main Configuration Scroll Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm">
          {/* SECTION 1: Choose Your Test */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#a1a1aa] flex items-center gap-1.5">
              <span>1. Choose your test</span>
            </h3>
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-[#141a24] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="test_selection"
                  checked={test === 'SAT'}
                  onChange={() => setTest('SAT')}
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                />
                <span className="font-bold text-slate-900 dark:text-white text-sm">SAT</span>
              </label>
              <span className="text-xs text-slate-500 dark:text-[#71717a] border-l border-slate-200 dark:border-slate-800 pl-4">
                Official Digital SAT Question Bank (Reading &amp; Writing + Complete Math Section)
              </span>
            </div>
          </div>

          {/* SECTION 2: Choose Your Categories */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#a1a1aa]">
                2. Choose your categories
              </h3>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                {selectedSkills.length} of {ALL_SKILLS.length} skills selected
              </span>
            </div>

            {/* Category Card 1: Reading & Writing */}
            <div className="bg-slate-50 dark:bg-[#141a24] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
              {/* R&W Header Bar */}
              <div className="p-4 bg-slate-100 dark:bg-[#1a2233] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isRwAllSelected}
                    onChange={handleToggleRWMaster}
                    className="w-5 h-5 rounded-md accent-blue-600 cursor-pointer"
                  />
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      Reading &amp; Writing
                    </span>
                    <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                      {counts.rwTotal} Questions
                    </span>
                  </div>
                </label>
              </div>

              {/* R&W 4 Domains List */}
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {RW_DOMAINS.map(domain => {
                  const isDomainSelected = selectedDomains.includes(domain);
                  const isExpanded = expandedDomains[domain] ?? false;
                  const skills = SKILLS_BY_DOMAIN[domain] || [];
                  const domainCount = counts.domainMap[domain] || 0;

                  return (
                    <div key={domain} className="bg-white dark:bg-[#111726]">
                      {/* Domain Header Row */}
                      <div className="p-3.5 pl-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#1a2233] transition">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isDomainSelected}
                            onChange={() => handleToggleDomain(domain)}
                            className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                          />
                          <span className={`font-semibold text-sm ${isDomainSelected ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-[#a1a1aa]'}`}>
                            {domain}
                          </span>
                          <span className="text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-mono">
                            {domainCount}
                          </span>
                        </label>

                        {/* Expand / Collapse Chevron */}
                        <button
                          type="button"
                          onClick={() => toggleDomainExpanded(domain)}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1 text-xs cursor-pointer"
                          title={isExpanded ? 'Collapse subtopics' : 'Expand subtopics'}
                        >
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                            {skills.length} subtopics
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Expandable Skills List */}
                      {isExpanded && (
                        <div className="bg-slate-50 dark:bg-[#0b0e14] border-t border-slate-200 dark:border-slate-800/80 pl-12 pr-6 py-2.5 space-y-2 animate-in fade-in duration-150">
                          {skills.map(skill => {
                            const isSkillSelected = selectedSkills.includes(skill);
                            const skillCount = counts.skillMap[skill] || 0;

                            return (
                              <label
                                key={skill}
                                className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#141a24] cursor-pointer group transition"
                              >
                                <div className="flex items-center gap-2.5">
                                  <input
                                    type="checkbox"
                                    checked={isSkillSelected}
                                    onChange={() => handleToggleSkill(domain, skill)}
                                    className="w-3.5 h-3.5 rounded accent-blue-600 cursor-pointer"
                                  />
                                  <span className={`text-xs ${isSkillSelected ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-500 dark:text-[#71717a]'}`}>
                                    {skill}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono group-hover:text-slate-700 dark:group-hover:text-slate-300">
                                  {skillCount} qs
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Card 2: Math (Complete 4 Domains & 19 Subtopics) */}
            <div className="bg-slate-50 dark:bg-[#141a24] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
              {/* Math Header Bar */}
              <div className="p-4 bg-slate-100 dark:bg-[#1a2233] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isMathAllSelected}
                    onChange={handleToggleMathMaster}
                    className="w-5 h-5 rounded-md accent-blue-600 cursor-pointer"
                  />
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      Math
                    </span>
                    <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      {counts.mathTotal} Questions
                    </span>
                  </div>
                </label>
              </div>

              {/* Math 4 Domains List */}
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {MATH_DOMAINS.map(domain => {
                  const isDomainSelected = selectedDomains.includes(domain);
                  const isExpanded = expandedDomains[domain] ?? false;
                  const skills = SKILLS_BY_DOMAIN[domain] || [];
                  const domainCount = counts.domainMap[domain] || 0;

                  return (
                    <div key={domain} className="bg-white dark:bg-[#111726]">
                      {/* Domain Header Row */}
                      <div className="p-3.5 pl-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#1a2233] transition">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isDomainSelected}
                            onChange={() => handleToggleDomain(domain)}
                            className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                          />
                          <span className={`font-semibold text-sm ${isDomainSelected ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-[#a1a1aa]'}`}>
                            {domain}
                          </span>
                          <span className="text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-mono">
                            {domainCount}
                          </span>
                        </label>

                        {/* Expand / Collapse Chevron */}
                        <button
                          type="button"
                          onClick={() => toggleDomainExpanded(domain)}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1 text-xs cursor-pointer"
                          title={isExpanded ? 'Collapse subtopics' : 'Expand subtopics'}
                        >
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                            {skills.length} subtopics
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Expandable Skills List */}
                      {isExpanded && (
                        <div className="bg-slate-50 dark:bg-[#0b0e14] border-t border-slate-200 dark:border-slate-800/80 pl-12 pr-6 py-2.5 space-y-2 animate-in fade-in duration-150">
                          {skills.map(skill => {
                            const isSkillSelected = selectedSkills.includes(skill);
                            const skillCount = counts.skillMap[skill] || 0;

                            return (
                              <label
                                key={skill}
                                className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#141a24] cursor-pointer group transition"
                              >
                                <div className="flex items-center gap-2.5">
                                  <input
                                    type="checkbox"
                                    checked={isSkillSelected}
                                    onChange={() => handleToggleSkill(domain, skill)}
                                    className="w-3.5 h-3.5 rounded accent-blue-600 cursor-pointer"
                                  />
                                  <span className={`text-xs ${isSkillSelected ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-500 dark:text-[#71717a]'}`}>
                                    {skill}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono group-hover:text-slate-700 dark:group-hover:text-slate-300">
                                  {skillCount} qs
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 3: Difficulty */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#a1a1aa]">
              3. Difficulty
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              {(['Easy', 'Medium', 'Hard'] as DifficultyLevel[]).map(diff => {
                const isSelected = selectedDifficulties.includes(diff);
                const count = counts.diffMap[diff] || 0;

                const colorClasses = diff === 'Easy'
                  ? 'border-emerald-300 text-emerald-700 bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-400 dark:bg-emerald-950/20'
                  : diff === 'Medium'
                    ? 'border-amber-300 text-amber-700 bg-amber-50 dark:border-amber-500/30 dark:text-amber-400 dark:bg-amber-950/20'
                    : 'border-rose-300 text-rose-700 bg-rose-50 dark:border-rose-500/30 dark:text-rose-400 dark:bg-rose-950/20';

                return (
                  <label
                    key={diff}
                    className={`flex items-center justify-between p-3 sm:p-3.5 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? `bg-blue-50/60 dark:bg-[#1a2233] border-blue-600 dark:border-blue-500 shadow-xs ring-1 ring-blue-600 dark:ring-blue-500`
                        : 'bg-slate-50 dark:bg-[#141a24] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleDifficulty(diff)}
                        className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                      />
                      <span className={`font-semibold text-sm ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                        {diff}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-md border font-mono font-bold ${colorClasses}`}>
                      {count}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: More Options */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#a1a1aa]">
              4. More options
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Shuffle Questions */}
              <label className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-[#141a24] border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  checked={shuffle}
                  onChange={e => setShuffle(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                />
                <div className="flex items-center gap-2">
                  <Shuffle className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span className="font-medium text-slate-900 dark:text-white text-xs sm:text-sm">
                    Shuffle Questions
                  </span>
                </div>
              </label>

              {/* Hide already answered questions */}
              <label className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-[#141a24] border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  checked={hideAnswered}
                  onChange={e => setHideAnswered(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                />
                <div className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span className="font-medium text-slate-900 dark:text-white text-xs sm:text-sm">
                    Hide already answered questions
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Empty State Banner if 0 match */}
        {matchedQuestions.length === 0 && (
          <div className="mx-6 mb-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-xs block text-amber-900 dark:text-amber-300">
                  No Questions Found Matching These Filters
                </span>
                <span className="text-[11px] text-amber-700 dark:text-amber-200/80">
                  {hideAnswered
                    ? 'All matching questions have already been answered. Uncheck "Hide already answered questions" or reset filters.'
                    : 'Try selecting more skills, domains, or difficulty levels.'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-800/60 text-amber-800 dark:text-amber-200 font-bold text-xs transition border border-amber-300 dark:border-amber-700 cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}

        {/* Bottom Action Footer Bar */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50 dark:bg-[#070a10] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {matchedQuestions.length} Questions matching criteria
              </span>
              <span className="text-xs text-slate-500 dark:text-[#71717a] hidden sm:inline">
                (from {allQuestions.length} official items)
              </span>
            </div>
            <span className="text-xs text-slate-400 dark:text-[#71717a] hidden md:inline">
              • © Oluwole Inuoluwadunsimi 2026
            </span>
          </div>

          <div className="flex items-center gap-3">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="min-h-[42px] px-4 py-2 rounded-xl border border-zinc-200 dark:border-[#222634] text-zinc-700 dark:text-[#8E95A5] hover:text-zinc-950 dark:hover:text-[#F4F4F6] hover:bg-zinc-100 dark:hover:bg-[#181B24] transition-all duration-150 font-semibold text-xs cursor-pointer active:scale-95 flex items-center justify-center shadow-2xs"
              >
                Cancel
              </button>
            )}

            <button
              type="button"
              onClick={handleLaunch}
              disabled={matchedQuestions.length === 0}
              className={`h-11 px-6 rounded-xl font-semibold text-xs text-white flex items-center gap-2 transition-all duration-150 active:scale-95 shadow-xs hover:shadow ${
                matchedQuestions.length > 0
                  ? 'bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 cursor-pointer'
                  : 'bg-zinc-200 dark:bg-[#222634] text-zinc-400 dark:text-zinc-600 cursor-not-allowed opacity-50'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" strokeWidth={1.75} />
              <span>Practice Questions</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
