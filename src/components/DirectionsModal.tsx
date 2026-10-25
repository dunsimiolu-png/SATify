import React, { useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { SectionType } from '../types/quiz';

interface DirectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: SectionType;
}

export const DirectionsModal: React.FC<DirectionsModalProps> = ({
  isOpen,
  onClose,
  section,
}) => {
  // ESC listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#11131A] text-zinc-950 dark:text-[#F4F4F6] rounded-2xl shadow-2xl border border-zinc-200/90 dark:border-[#222634] overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-[#222634] flex items-center justify-between bg-neutral-50/80 dark:bg-[#181B24]/80 backdrop-blur-xs">
          <div>
            <h2 className="text-lg font-bold text-zinc-950 dark:text-[#F4F4F6] tracking-tight">
              {section === 'Reading and Writing'
                ? 'Reading and Writing Directions'
                : 'Math Directions'}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-[#8E95A5] mt-0.5">
              Official College Board test instructions and key bindings
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-950 dark:hover:text-[#F4F4F6] hover:bg-zinc-100 dark:hover:bg-[#181B24] transition-all duration-150 active:scale-90 cursor-pointer"
            aria-label="Close directions"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-[15px] leading-relaxed text-zinc-700 dark:text-[#C5CAD6]">
          {section === 'Reading and Writing' ? (
            <>
              <p>
                The questions in this section address a number of important reading and writing skills. Each question includes one or more passages, which may include a table or other graphic. Read each passage and question carefully, and then choose the best answer to the question based on the passage(s).
              </p>
              <p>
                All questions in this section are multiple-choice with four answer choices. Each question has a single best answer.
              </p>
              <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl text-blue-950 dark:text-blue-200 text-sm space-y-2">
                <div className="font-semibold flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SATify Keyboard Shortcuts</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-blue-900 dark:text-blue-200/90 text-xs sm:text-sm">
                  <li>Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#11131A] border border-blue-300 dark:border-blue-800 rounded text-xs font-mono">A</kbd>, <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#11131A] border border-blue-300 dark:border-blue-800 rounded text-xs font-mono">B</kbd>, <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#11131A] border border-blue-300 dark:border-blue-800 rounded text-xs font-mono">C</kbd>, or <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#11131A] border border-blue-300 dark:border-blue-800 rounded text-xs font-mono">D</kbd> to select an answer choice.</li>
                  <li>Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#11131A] border border-blue-300 dark:border-blue-800 rounded text-xs font-mono">C</kbd> or <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#11131A] border border-blue-300 dark:border-blue-800 rounded text-xs font-mono">Enter</kbd> to trigger "Check Answer".</li>
                  <li>Use <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#11131A] border border-blue-300 dark:border-blue-800 rounded text-xs font-mono">←</kbd> and <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#11131A] border border-blue-300 dark:border-blue-800 rounded text-xs font-mono">→</kbd> arrow keys to navigate between questions.</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <p>
                The questions in this section address a number of important math skills. Use of a calculator is permitted for all questions.
              </p>
              <p>
                Unless a question indicates otherwise:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>All variables and expressions represent real numbers.</li>
                <li>Figures provided are drawn to scale unless specifically stated otherwise.</li>
                <li>All figures lie in a plane.</li>
                <li>The domain of a given function <em>f</em> is the set of all real numbers <em>x</em> for which <em>f(x)</em> is a real number.</li>
              </ul>
              <p>
                For multiple-choice questions, solve each problem, choose the best answer from the choices provided, and select your choice.
              </p>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-200 dark:border-[#222634] bg-neutral-50/80 dark:bg-[#181B24]/80 backdrop-blur-xs flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-all duration-150 cursor-pointer active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DirectionsModal;
