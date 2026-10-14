import React, { useState, useEffect } from 'react';
import { 
  X, 
  Split, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  HelpCircle,
  FileText,
  Sparkles
} from 'lucide-react';

interface GrammarComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GrammarComparisonModal: React.FC<GrammarComparisonModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'decision' | 'boundaries' | 'fss' | 'comparison'>('decision');

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150 select-text">
      <div 
        className="w-full max-w-4xl bg-white dark:bg-[#0f1522] text-slate-900 dark:text-white rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-[#070a10] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-400">
              <Split className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                Standard English Conventions
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  Cheat Sheet
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Quick Comparison Guide: Boundaries vs. Form, Structure, and Sense
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-800 transition"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0f1522] px-6 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('decision')}
            className={`py-3 px-3.5 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'decision'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>5-Second Decision Rule</span>
          </button>

          <button
            onClick={() => setActiveTab('boundaries')}
            className={`py-3 px-3.5 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'boundaries'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Boundaries (Punctuation)</span>
          </button>

          <button
            onClick={() => setActiveTab('fss')}
            className={`py-3 px-3.5 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'fss'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Form, Structure & Sense</span>
          </button>

          <button
            onClick={() => setActiveTab('comparison')}
            className={`py-3 px-3.5 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'comparison'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Side-by-Side Matrix</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: 5-Second Decision Rule */}
          {activeTab === 'decision' && (
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                <h3 className="font-extrabold text-blue-950 dark:text-blue-100 text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                  The 5-Second Question Recognition Rule
                </h3>
                <p className="text-sm text-blue-900 dark:text-blue-200 mt-1">
                  Both topics share the exact same prompt: <span className="font-serif italic font-semibold">"Which choice completes the text so that it conforms to the conventions of Standard English?"</span> Here is how to distinguish them in under 5 seconds:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Boundaries Card */}
                  <div className="p-4 rounded-xl bg-white dark:bg-[#141a24] border border-blue-200 dark:border-blue-900 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        Topic: Boundaries
                      </span>
                      <span className="text-xs font-bold text-gray-400">Punctuation Focus</span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900">
                      Look at Choices A–D:
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      The words in all four choices are <strong>identical</strong> (or nearly identical), but the <strong>punctuation marks</strong> (commas, semicolons, colons, dashes, periods) change!
                    </p>
                    <div className="bg-gray-50 p-2.5 rounded text-xs font-mono text-gray-700 border border-gray-200 space-y-1">
                      <div>A) landscape, but</div>
                      <div>B) landscape; but</div>
                      <div>C) landscape,</div>
                      <div>D) landscape</div>
                    </div>
                  </div>

                  {/* FSS Card */}
                  <div className="p-4 rounded-xl bg-white dark:bg-[#141a24] border border-blue-200 dark:border-blue-900 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Topic: Form, Structure, and Sense
                      </span>
                      <span className="text-xs font-bold text-gray-400">Grammar & Syntax Focus</span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900">
                      Look at Choices A–D:
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      The words <strong>differ in form</strong>: verb conjugations, pronoun number, noun apostrophes, word order, or modifier structures change!
                    </p>
                    <div className="bg-gray-50 p-2.5 rounded text-xs font-mono text-gray-700 border border-gray-200 space-y-1">
                      <div>A) illustrates</div>
                      <div>B) illustrate</div>
                      <div>C) illustrating</div>
                      <div>D) has illustrated</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decision Flowchart */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-gray-900">
                  Quick Decision Flowchart:
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">1</span>
                    <span className="text-gray-800">Scan choices A–D. Strip out punctuation marks <code>[, ; : — - . ! ?]</code>.</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">2</span>
                    <span className="text-gray-800">Are the remaining words identical across all 4 options?</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 shrink-0 ml-auto" />
                    <span className="font-extrabold text-blue-700 shrink-0">YES &rarr; Boundaries</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">3</span>
                    <span className="text-gray-800">Do the words vary by tense, plural/singular, pronoun, or phrase order?</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 shrink-0 ml-auto" />
                    <span className="font-extrabold text-emerald-700 shrink-0">YES &rarr; Form, Structure & Sense</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Boundaries */}
          {activeTab === 'boundaries' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-extrabold text-gray-900 text-base">
                  Boundaries: Core Rules & Punctuation Masterclass
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Boundaries questions test how clauses (independent and subordinate) and supplementary elements are linked or separated.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Rule 1 */}
                <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-1.5">
                  <div className="font-bold text-gray-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Independent Clauses (IC; IC)</span>
                  </div>
                  <p className="text-gray-600">
                    A semicolon (;) connects two complete independent clauses without a coordinating conjunction. Both sides must be able to stand alone as complete sentences.
                  </p>
                  <div className="bg-gray-50 p-2 rounded font-mono text-[11px] text-gray-700">
                    The satellite gathered data; the scientists analyzed it.
                  </div>
                </div>

                {/* Rule 2 */}
                <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-1.5">
                  <div className="font-bold text-gray-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Colon Rules (IC: Explanation)</span>
                  </div>
                  <p className="text-gray-600">
                    A colon (:) must be preceded by a <strong>complete independent clause</strong>. What follows can be an explanation, elaboration, or list.
                  </p>
                  <div className="bg-gray-50 p-2 rounded font-mono text-[11px] text-gray-700">
                    She had one primary objective: to preserve biodiversity.
                  </div>
                </div>

                {/* Rule 3 */}
                <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-1.5">
                  <div className="font-bold text-gray-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Dashes (Single or Paired)</span>
                  </div>
                  <p className="text-gray-600">
                    Paired dashes set off nonessential parenthetical phrases (must match: dash...dash). A single dash functions similarly to a colon to introduce an emphatic conclusion.
                  </p>
                  <div className="bg-gray-50 p-2 rounded font-mono text-[11px] text-gray-700">
                    The specimen—fragile yet intact—was moved to the museum.
                  </div>
                </div>

                {/* Rule 4 */}
                <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-1.5">
                  <div className="font-bold text-gray-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Comma + FANBOYS (IC, and IC)</span>
                  </div>
                  <p className="text-gray-600">
                    Connecting two independent clauses requires a comma followed by a coordinating conjunction (For, And, Nor, But, Or, Yet, So).
                  </p>
                  <div className="bg-gray-50 p-2 rounded font-mono text-[11px] text-gray-700">
                    The reaction completed, but the yield was unexpectedly low.
                  </div>
                </div>
              </div>

              {/* Major Traps */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-2">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>College Board Boundaries Traps:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-amber-950">
                  <li><strong>Comma Splice:</strong> Two independent clauses joined ONLY by a comma is always wrong (e.g., <code>The storm arrived, the match was canceled</code> &rarr; WRONG).</li>
                  <li><strong>Conjunctive Adverbs:</strong> Words like <code>however</code>, <code>therefore</code>, <code>furthermore</code> cannot join clauses with just a comma (use <code>; however,</code> or <code>. However,</code>).</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: Form, Structure, and Sense */}
          {activeTab === 'fss' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-extrabold text-gray-900 text-base">
                  Form, Structure, and Sense: Core Grammar Rules
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tests grammatical agreement, verb aspect, pronoun references, possessives, and modifying structures.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* FSS 1 */}
                <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-1.5">
                  <div className="font-bold text-gray-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Subject-Verb Agreement</span>
                  </div>
                  <p className="text-gray-600">
                    Singular subjects take singular verbs (ends in -s); plural subjects take plural verbs. Watch out for intervening prepositional phrases and appositives!
                  </p>
                  <div className="bg-gray-50 p-2 rounded font-mono text-[11px] text-gray-700">
                    The discovery of ancient artifacts <u>reveals</u> (not reveal)...
                  </div>
                </div>

                {/* FSS 2 */}
                <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-1.5">
                  <div className="font-bold text-gray-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Finite vs. Nonfinite Verb Forms</span>
                  </div>
                  <p className="text-gray-600">
                    A clause requires a <strong>finite verb</strong> (has tense and subject agreement). Participles (-ing) and infinitives (to...) cannot act as the main verb of a clause alone!
                  </p>
                  <div className="bg-gray-50 p-2 rounded font-mono text-[11px] text-gray-700">
                    The team <u>concluded</u> (not concluding) the trial.
                  </div>
                </div>

                {/* FSS 3 */}
                <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-1.5">
                  <div className="font-bold text-gray-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Pronoun-Antecedent Agreement</span>
                  </div>
                  <p className="text-gray-600">
                    Pronouns must match their antecedent in number (singular vs. plural). Watch out for collective nouns like <code>committee</code>, <code>firm</code>, or <code>species</code>.
                  </p>
                  <div className="bg-gray-50 p-2 rounded font-mono text-[11px] text-gray-700">
                    Each company announced <u>its</u> (not their) quarterly earnings.
                  </div>
                </div>

                {/* FSS 4 */}
                <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-1.5">
                  <div className="font-bold text-gray-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Dangling & Misplaced Modifiers</span>
                  </div>
                  <p className="text-gray-600">
                    An introductory modifying phrase must be immediately followed by the noun it describes.
                  </p>
                  <div className="bg-gray-50 p-2 rounded font-mono text-[11px] text-gray-700">
                    Entering the cavern, <u>the researcher</u> found fossils.
                  </div>
                </div>
              </div>

              {/* Plural vs. Possessive Nouns */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-2">
                <div className="font-bold text-gray-900">
                  Apostrophe Quick Key:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-gray-700">
                  <div className="p-2 bg-white rounded border border-gray-200">
                    <code>artists</code>: Plural (no possession)
                  </div>
                  <div className="p-2 bg-white rounded border border-gray-200">
                    <code>artist's</code>: Singular possessive (one artist)
                  </div>
                  <div className="p-2 bg-white rounded border border-gray-200">
                    <code>artists'</code>: Plural possessive (multiple artists)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Side-by-Side Comparison */}
          {activeTab === 'comparison' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-gray-200 rounded-xl overflow-hidden">
                  <thead className="bg-gray-50 text-gray-700 border-b border-gray-200 font-bold">
                    <tr>
                      <th className="p-3">Attribute</th>
                      <th className="p-3 text-blue-700 bg-blue-50/50">Boundaries</th>
                      <th className="p-3 text-emerald-700 bg-emerald-50/50">Form, Structure, and Sense</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-800">
                    <tr>
                      <td className="p-3 font-bold bg-gray-50/50">What is Tested</td>
                      <td className="p-3">Punctuation between clauses and phrases</td>
                      <td className="p-3">Grammatical agreements, verb tenses & word forms</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold bg-gray-50/50">Key Punctuation</td>
                      <td className="p-3">Semicolons, colons, dashes, commas, periods</td>
                      <td className="p-3">Apostrophes for possessive vs plural</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold bg-gray-50/50">Choices Signature</td>
                      <td className="p-3">Identical words, varying punctuation</td>
                      <td className="p-3">Different verb endings, pronouns, word order</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold bg-gray-50/50">Typical Rationale Keywords</td>
                      <td className="p-3">"independent clause", "comma splice", "supplementary phrase", "semicolon"</td>
                      <td className="p-3">"subject-verb agreement", "singular/plural", "past tense", "modifier"</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold bg-gray-50/50">Top Strategy</td>
                      <td className="p-3">Label clauses as Independent (IC) or Dependent (DC)</td>
                      <td className="p-3">Find the true subject & identify the time clue in the sentence</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">
            Standard English Conventions • Reading & Writing
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs transition"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

export default GrammarComparisonModal;
