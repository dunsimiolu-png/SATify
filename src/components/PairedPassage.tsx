import React, { useState } from 'react';
import { RichText } from './RichText';
import { TextHighlight } from '../types/quiz';

interface PairedPassageProps {
  text: string;
  target?: 'passage';
  highlights?: TextHighlight[];
  onHighlightClick?: (highlight: TextHighlight, rect: DOMRect) => void;
  onOpenNote?: (highlight: TextHighlight, rect: DOMRect) => void;
  className?: string;
  showTabsOnMobile?: boolean;
}

export interface PairedParts {
  intro: string;
  t1: string;
  t2: string;
}

/**
 * Robust parser for SAT Paired Passages (Cross-Text Connections).
 * Handles standalone "Text 1" / "Text 2" markers with or without newlines,
 * colons, dashes, or punctuation delimiters.
 */
export function parsePairedPassage(passageText?: string): PairedParts | null {
  if (!passageText) return null;

  // Standalone "Text 1" regex: matches at start, after newline, or after punctuation
  const t1Regex = /(?:^|\n|\.\s+)\s*(Text\s*1)\s*(?::|-|\n|\s+)(?!(?:is\s+adapted|discusses|was\s+written|describes|presents|explores|argues|considers))/i;
  // Standalone "Text 2" regex: matches before Text 2
  const t2Regex = /(?:^|\n|\.\s+)\s*(Text\s*2)\s*(?::|-|\n|\s+)(?!(?:is\s+adapted|discusses|was\s+written|describes|presents|explores|argues|considers))/i;

  const m1 = passageText.match(t1Regex);
  const m2 = passageText.match(t2Regex);

  if (m1 && m2 && m1.index !== undefined && m2.index !== undefined && m1.index < m2.index) {
    const intro = passageText.slice(0, m1.index).trim();
    const t1 = passageText.slice(m1.index + m1[0].length, m2.index).trim();
    const t2 = passageText.slice(m2.index + m2[0].length).trim();
    if (t1.length > 0 && t2.length > 0) {
      return { intro, t1, t2 };
    }
  }

  // Fallback: Check if passage explicitly contains "Text 1" and "Text 2" markers
  const idx1 = passageText.search(/Text\s*1\b/i);
  const idx2 = passageText.search(/Text\s*2\b/i);
  if (idx1 !== -1 && idx2 !== -1 && idx1 < idx2) {
    const intro = passageText.slice(0, idx1).trim();
    // Strip "Text 1" and any immediate punctuation/newline
    const after1 = passageText.slice(idx1).replace(/^Text\s*1[\s:\-\n]*/i, '');
    const relIdx2 = after1.search(/Text\s*2\b/i);
    if (relIdx2 !== -1) {
      const t1 = after1.slice(0, relIdx2).trim();
      const t2 = after1.slice(relIdx2).replace(/^Text\s*2[\s:\-\n]*/i, '').trim();
      if (t1.length > 0 && t2.length > 0) {
        return { intro, t1, t2 };
      }
    }
  }

  return null;
}

/**
 * Checks whether a question passage is a Cross-Text Connections paired passage.
 */
export const isPairedPassage = (text?: string, skill?: string): boolean => {
  if (!text) return false;
  if (skill === 'Cross-Text Connections') return true;
  return parsePairedPassage(text) !== null;
};

export const PairedPassage: React.FC<PairedPassageProps> = ({
  text,
  target = 'passage',
  highlights,
  onHighlightClick,
  onOpenNote,
  className = '',
  showTabsOnMobile = false,
}) => {
  const [activeMobileTab, setActiveMobileTab] = useState<'both' | 'text1' | 'text2'>('both');
  const parsed = parsePairedPassage(text);

  // Fallback if parsing fails on edge case
  if (!parsed) {
    return (
      <div className={`font-serif text-[15px] sm:text-[17px] leading-[1.7] text-[#111827] dark:text-slate-100 whitespace-pre-line ${className}`}>
        <RichText
          text={text}
          target={target}
          highlights={highlights}
          onHighlightClick={onHighlightClick}
          onOpenNote={onOpenNote}
        />
      </div>
    );
  }

  const { intro, t1, t2 } = parsed;

  return (
    <div className={`flex flex-col gap-3.5 sm:gap-5 w-full font-serif text-[15px] sm:text-[17px] leading-[1.7] text-[#111827] dark:text-slate-100 ${className}`}>
      {/* Optional Context Intro */}
      {intro && (
        <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-gray-700 dark:text-slate-300 italic text-xs sm:text-[15px] leading-relaxed">
          <RichText
            text={intro}
            target={target}
            highlights={highlights}
            onHighlightClick={onHighlightClick}
            onOpenNote={onOpenNote}
          />
        </div>
      )}

      {/* Optional Mobile Segmented Toggle (For Question Rush on small screens) */}
      {showTabsOnMobile && (
        <div className="sm:hidden flex items-center justify-center p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 select-none">
          <button
            type="button"
            onClick={() => setActiveMobileTab('both')}
            className={`flex-1 py-1 px-2 text-xs font-bold rounded-lg transition-all ${
              activeMobileTab === 'both'
                ? 'bg-white dark:bg-[#0f1522] text-blue-600 dark:text-blue-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Both Texts
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab('text1')}
            className={`flex-1 py-1 px-2 text-xs font-bold rounded-lg transition-all ${
              activeMobileTab === 'text1'
                ? 'bg-white dark:bg-[#0f1522] text-blue-600 dark:text-blue-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Text 1
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab('text2')}
            className={`flex-1 py-1 px-2 text-xs font-bold rounded-lg transition-all ${
              activeMobileTab === 'text2'
                ? 'bg-white dark:bg-[#0f1522] text-blue-600 dark:text-blue-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Text 2
          </button>
        </div>
      )}

      {/* Text 1 Card */}
      {(!showTabsOnMobile || activeMobileTab === 'both' || activeMobileTab === 'text1') && (
        <div className="w-full bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3.5 sm:p-5 shadow-2xs">
          <div className="mb-2 sm:mb-3">
            <span className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-md bg-[#0050d8] text-white font-sans font-bold text-[11px] sm:text-xs uppercase tracking-wider">
              Text 1
            </span>
          </div>
          <div className="whitespace-pre-line leading-[1.7]">
            <RichText
              text={t1}
              target={target}
              highlights={highlights}
              onHighlightClick={onHighlightClick}
              onOpenNote={onOpenNote}
            />
          </div>
        </div>
      )}

      {/* Text 2 Card */}
      {(!showTabsOnMobile || activeMobileTab === 'both' || activeMobileTab === 'text2') && (
        <div className="w-full bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3.5 sm:p-5 shadow-2xs">
          <div className="mb-2 sm:mb-3">
            <span className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-md bg-[#0050d8] text-white font-sans font-bold text-[11px] sm:text-xs uppercase tracking-wider">
              Text 2
            </span>
          </div>
          <div className="whitespace-pre-line leading-[1.7]">
            <RichText
              text={t2}
              target={target}
              highlights={highlights}
              onHighlightClick={onHighlightClick}
              onOpenNote={onOpenNote}
            />
          </div>
        </div>
      )}
    </div>
  );
};
