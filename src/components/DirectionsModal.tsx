import React from 'react';
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-300 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-[#f8fafc]">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">
            {section === 'Reading and Writing'
              ? 'Reading and Writing Directions'
              : 'Math Directions'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-[15px] leading-relaxed text-gray-700">
          {section === 'Reading and Writing' ? (
            <>
              <p>
                The questions in this section address a number of important reading and writing skills. Each question includes one or more passages, which may include a table or other graphic. Read each passage and question carefully, and then choose the best answer to the question based on the passage(s).
              </p>
              <p>
                All questions in this section are multiple-choice with four answer choices. Each question has a single best answer.
              </p>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-sm space-y-2">
                <div className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#0050d8]" />
                  <span>SATify Keyboard Shortcuts</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-blue-800">
                  <li>Press <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-xs font-mono">A</kbd>, <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-xs font-mono">B</kbd>, <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-xs font-mono">C</kbd>, or <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-xs font-mono">D</kbd> to select an answer choice.</li>
                  <li>Press <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-xs font-mono">C</kbd> or <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-xs font-mono">Enter</kbd> to trigger "Check Answer".</li>
                  <li>Use <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-xs font-mono">←</kbd> and <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded text-xs font-mono">→</kbd> arrow keys to navigate between questions.</li>
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
        <div className="px-6 py-3.5 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1e1e1e] hover:bg-black text-white font-semibold text-sm rounded-md shadow-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
