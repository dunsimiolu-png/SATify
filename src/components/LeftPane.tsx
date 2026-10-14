import React, { useCallback, useEffect, useRef } from 'react';
import { MockQuestion, TextHighlight } from '../types/quiz';
import { RichText } from './RichText';
import { BulletPassage, isBulletPassage } from './BulletPassage';

interface LeftPaneProps {
  question: MockQuestion;
  isAnnotateActive: boolean;
  highlights: TextHighlight[];
  onHighlightClick: (highlight: TextHighlight, rect: DOMRect) => void;
  onOpenNote?: (highlight: TextHighlight, rect: DOMRect) => void;
  onTextSelected?: (selectionData: {
    target: 'passage';
    start: number;
    end: number;
    text: string;
    rect: DOMRect;
  }) => void;
}

export const LeftPane: React.FC<LeftPaneProps> = ({
  question,
  isAnnotateActive,
  highlights,
  onHighlightClick,
  onOpenNote,
  onTextSelected,
}) => {
  const passageText = question.passage || question.passageText || '';
  const lastValidSelectionRef = useRef<{
    start: number;
    end: number;
    text: string;
    rect: DOMRect;
  } | null>(null);

  // Clean up selection on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        const sel = window.getSelection();
        if (sel) sel.removeAllRanges();
      }
    };
  }, []);

  // Clear window selection when annotation mode is disabled
  useEffect(() => {
    if (!isAnnotateActive && typeof window !== 'undefined') {
      const sel = window.getSelection();
      if (sel) sel.removeAllRanges();
      lastValidSelectionRef.current = null;
    }
  }, [isAnnotateActive]);

  // Detect Paired texts (Text 1 / Text 2)
  const STANDALONE_T1_REGEX = /(?:^|\n)\s*Text\s*1(?!\s+(?:is\s+adapted|discusses|was\s+written|describes|presents|explores|argues|considers))\s*(?:\n|$)/i;
  const STANDALONE_T2_REGEX = /(?:^|\n)\s*Text\s*2(?!\s+(?:is\s+adapted|discusses|was\s+written|describes|presents|explores|argues|considers))\s*(?:\n|$)/i;

  const isPairedText = question.skill === 'Cross-Text Connections' || (
    STANDALONE_T1_REGEX.test(passageText) && STANDALONE_T2_REGEX.test(passageText)
  );

  // Helper to extract and calibrate exact selection start, end, text and rect
  const extractSelection = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return null;

    const selectedText = selection.toString().trim();
    if (!selectedText || selectedText.length < 1) return null;

    try {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (!rect || (rect.width === 0 && rect.height === 0)) return null;

      // Locate offset within passageText
      let start = passageText.indexOf(selectedText);

      // If exact substring not found directly (due to HTML tags like <u>, <em>, <i>, <sup>, <sub>), locate by stripped text
      if (start === -1) {
        const stripped = passageText.replace(/<\/?(?:u|sup|sub|em|i)\b[^>]*>/gi, '');
        const strippedStart = stripped.indexOf(selectedText);
        if (strippedStart !== -1) {
          let rawIdx = 0;
          let strippedIdx = 0;
          while (rawIdx < passageText.length && strippedIdx < strippedStart) {
            const tagMatch = passageText.slice(rawIdx).match(/^<\/?(?:u|sup|sub|em|i)\b[^>]*>/i);
            if (tagMatch) {
              rawIdx += tagMatch[0].length;
            } else {
              rawIdx++;
              strippedIdx++;
            }
          }
          start = rawIdx;
        }
      }

      if (start !== -1) {
        let rawIdx = start;
        let matchedLen = 0;
        while (rawIdx < passageText.length && matchedLen < selectedText.length) {
          const tagMatch = passageText.slice(rawIdx).match(/^<\/?(?:u|sup|sub|em|i)\b[^>]*>/i);
          if (tagMatch) {
            rawIdx += tagMatch[0].length;
          } else {
            rawIdx++;
            matchedLen++;
          }
        }
        return {
          start,
          end: rawIdx,
          text: selectedText,
          rect,
        };
      }
    } catch (e) {
      console.warn('Selection detection error:', e);
    }
    return null;
  }, [passageText]);

  // Touchscreen selection listener: cache selection on mobile selectionchange events
  useEffect(() => {
    if (!isAnnotateActive) return;

    const handleSelectionChange = () => {
      const sel = extractSelection();
      if (sel) {
        lastValidSelectionRef.current = sel;
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [isAnnotateActive, extractSelection]);

  // Handle selection end (mouseup / touchend) to trigger floating highlighter toolbar
  const handleSelectionEnd = useCallback(() => {
    const sel = extractSelection() || lastValidSelectionRef.current;
    if (sel && onTextSelected) {
      onTextSelected({
        target: 'passage',
        ...sel,
      });
    }
  }, [extractSelection, onTextSelected]);

  const renderContent = () => {
    // 1. Rhetorical Synthesis: Structured Bullet Notes List (Requirement 4)
    if (isBulletPassage(passageText)) {
      return (
        <BulletPassage
          text={passageText}
          target="passage"
          highlights={highlights}
          onHighlightClick={onHighlightClick}
          onOpenNote={onOpenNote}
        />
      );
    }

    // 2. Paired Passages: Text 1 and Text 2 (Vertically Stacked Full-Width Cards)
    if (isPairedText) {
      const m1 = passageText.match(STANDALONE_T1_REGEX);
      const m2 = passageText.match(STANDALONE_T2_REGEX);

      if (m1 && m2 && m1.index !== undefined && m2.index !== undefined && m1.index < m2.index) {
        const intro = passageText.slice(0, m1.index).trim();
        const t1 = passageText.slice(m1.index + m1[0].length, m2.index).trim();
        const t2 = passageText.slice(m2.index + m2[0].length).trim();

        return (
          <div className="flex flex-col gap-5 w-full font-serif text-[17px] leading-[1.7] text-[#111827] dark:text-slate-100">
            {intro && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-gray-700 dark:text-slate-300 italic text-[15px] leading-relaxed">
                <RichText
                  text={intro}
                  target="passage"
                  highlights={highlights}
                  onHighlightClick={onHighlightClick}
                  onOpenNote={onOpenNote}
                />
              </div>
            )}
            {/* Text 1 Full-Width Card */}
            <div className="w-full bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 shadow-2xs">
              <div className="mb-3">
                <span className="inline-block px-3 py-1 rounded-md bg-[#0050d8] text-white font-sans font-bold text-xs uppercase tracking-wider">
                  Text 1
                </span>
              </div>
              <div className="whitespace-pre-line leading-[1.7]">
                <RichText
                  text={t1}
                  target="passage"
                  highlights={highlights}
                  onHighlightClick={onHighlightClick}
                  onOpenNote={onOpenNote}
                />
              </div>
            </div>

            {/* Text 2 Full-Width Card */}
            <div className="w-full bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl p-5 shadow-2xs">
              <div className="mb-3">
                <span className="inline-block px-3 py-1 rounded-md bg-[#0050d8] text-white font-sans font-bold text-xs uppercase tracking-wider">
                  Text 2
                </span>
              </div>
              <div className="whitespace-pre-line leading-[1.7]">
                <RichText
                  text={t2}
                  target="passage"
                  highlights={highlights}
                  onHighlightClick={onHighlightClick}
                  onOpenNote={onOpenNote}
                />
              </div>
            </div>
          </div>
        );
      }
    }

    // 3. Standard Reading Passage: Preserve poem lines and paragraph splits
    return (
      <div className="font-serif text-[17px] leading-[1.7] text-[#111827] whitespace-pre-line">
        <RichText
          text={passageText}
          target="passage"
          highlights={highlights}
          onHighlightClick={onHighlightClick}
          onOpenNote={onOpenNote}
        />
      </div>
    );
  };

  return (
    <div 
      onMouseUp={handleSelectionEnd}
      onTouchEnd={handleSelectionEnd}
      className="h-auto lg:h-full px-4 sm:px-6 lg:px-10 py-5 sm:py-8 overflow-y-visible lg:overflow-y-auto overflow-x-hidden bg-white dark:bg-[#070a10] text-slate-900 dark:text-white select-text passage-text"
    >
      {/* Annotate active mode indicator & Sticky Mobile Highlighter Bar */}
      {isAnnotateActive && (
        <div className="sticky top-0 z-20 mb-4 pb-1 bg-white dark:bg-[#070a10]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                Highlighter Active
              </span>
            </div>
            {/* Quick highlight swatches for touch devices */}
            <div 
              className="flex items-center gap-1.5"
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              {[
                { color: 'yellow' as const, bg: 'bg-[#ffeb00]', title: 'Yellow' },
                { color: 'blue' as const, bg: 'bg-[#bae6fd]', title: 'Blue' },
                { color: 'pink' as const, bg: 'bg-[#fbcfe8]', title: 'Pink' },
              ].map(({ color, bg, title }) => (
                <button
                  key={color}
                  type="button"
                  title={`Highlight in ${title}`}
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const sel = extractSelection() || lastValidSelectionRef.current;
                    if (sel && onTextSelected) {
                      onTextSelected({ target: 'passage', ...sel });
                    }
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const sel = extractSelection() || lastValidSelectionRef.current;
                    if (sel && onTextSelected) {
                      onTextSelected({ target: 'passage', ...sel });
                    }
                  }}
                  className={`w-6 h-6 rounded-full border border-gray-400 ${bg} shadow-2xs hover:scale-110 active:scale-95 transition-transform cursor-pointer`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Optional passage title */}
      {question.passageTitle && (
        <h3 className="font-serif font-bold text-lg text-[#111827] dark:text-white mb-4">
          {question.passageTitle}
        </h3>
      )}

      {/* Visual Graph / Table / Chart Figure Card */}
      {question.imageUrl && (
        <div className="mb-6 p-4 bg-white dark:bg-[#0f1522] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden flex flex-col items-center">
          <img
            src={question.imageUrl}
            alt="Question Graph or Table"
            className="max-w-full h-auto object-contain rounded-md select-none"
            loading="lazy"
          />
        </div>
      )}

      {/* Main passage stimulus content */}
      <div data-annotate-target="passage" className="text-[#111827] dark:text-slate-100">
        {renderContent()}
      </div>
    </div>
  );
};
