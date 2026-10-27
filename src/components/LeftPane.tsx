import React, { useCallback, useEffect, useRef } from 'react';
import { MockQuestion, TextHighlight } from '../types/quiz';
import { RichText } from './RichText';
import { BulletPassage, isBulletPassage } from './BulletPassage';
import { PairedPassage, isPairedPassage } from './PairedPassage';

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
  onClearSelection?: () => void;
  isSplitView?: boolean;
}

export const LeftPane: React.FC<LeftPaneProps> = ({
  question,
  isAnnotateActive,
  highlights,
  onHighlightClick,
  onOpenNote,
  onTextSelected,
  onClearSelection,
  isSplitView = true,
}) => {
  const passageText = question.passage || question.passageText || '';
  const isSpr = question.questionType === 'spr' || !question.options || question.options.length === 0;
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
    const sel = extractSelection();
    if (sel && onTextSelected) {
      lastValidSelectionRef.current = sel;
      onTextSelected({
        target: 'passage',
        ...sel,
      });
    } else if (!sel) {
      // User clicked or tapped whitespace without selecting text
      lastValidSelectionRef.current = null;
      if (onClearSelection) {
        onClearSelection();
      }
    }
  }, [extractSelection, onTextSelected, onClearSelection]);

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

    // 2. Paired Passages: Text 1 and Text 2 (Cross-Text Connections)
    if (isPairedPassage(passageText, question.skill)) {
      return (
        <PairedPassage
          text={passageText}
          target="passage"
          highlights={highlights}
          onHighlightClick={onHighlightClick}
          onOpenNote={onOpenNote}
        />
      );
    }

    // 3. Standard Reading Passage: Preserve poem lines and paragraph splits
    return (
      <div className="font-serif text-[17px] leading-relaxed max-w-[65ch] text-zinc-950 dark:text-[#F4F4F6] whitespace-pre-line">
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
      className={`px-4 sm:px-6 lg:px-8 py-5 sm:py-6 overflow-x-hidden bg-white dark:bg-[#090A0F] text-zinc-950 dark:text-[#F4F4F6] select-text passage-text ${
        isSplitView 
          ? 'h-full overflow-y-auto' 
          : 'h-auto overflow-visible'
      }`}
    >
      {/* Annotate active mode indicator & Sticky Mobile Highlighter Bar */}
      {isAnnotateActive && (
        <div className="sticky top-0 z-20 mb-4 pb-1 bg-white dark:bg-[#090A0F]">
          <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-100 dark:bg-[#181B24] border border-zinc-200 dark:border-[#222634]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
              <span className="text-xs font-semibold text-zinc-800 dark:text-[#F4F4F6]">
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
                  className={`w-5 h-5 rounded-full border border-zinc-300 dark:border-zinc-600 ${bg} transition-opacity duration-150 cursor-pointer`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Optional passage title */}
      {question.passageTitle && (
        <h3 className="font-serif font-semibold text-lg text-zinc-950 dark:text-[#F4F4F6] mb-4 max-w-[65ch]">
          {question.passageTitle}
        </h3>
      )}

      {/* Visual Graph / Table / Chart Figure Card */}
      {question.imageUrl && (
        <div className="mb-6 p-4 bg-white dark:bg-[#11131A] border border-zinc-200 dark:border-[#222634] rounded-xl overflow-hidden flex flex-col items-center max-w-[65ch]">
          <img
            src={question.imageUrl}
            alt="Question Graph or Table"
            className="max-w-full h-auto object-contain rounded-md select-none"
            loading="lazy"
          />
        </div>
      )}

      {/* Official Bluebook Student-Produced Response Directions */}
      {isSpr && (
        <div className="mb-6 rounded-2xl border border-zinc-200 dark:border-[#222634] bg-white dark:bg-[#11131A] shadow-xs overflow-hidden">
          <div className="bg-zinc-100 dark:bg-[#181B24] border-b border-zinc-200 dark:border-[#222634] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                #
              </span>
              <h4 className="font-bold text-xs text-zinc-950 dark:text-[#F4F4F6] tracking-tight uppercase">
                Student-Produced Response Directions
              </h4>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 dark:text-[#8E95A5] px-2 py-0.5 rounded bg-zinc-200/60 dark:bg-[#222634]">
              Official SAT Format
            </span>
          </div>

          <div className="p-4 sm:p-5 space-y-3.5 text-xs text-zinc-700 dark:text-[#C5CAD6] leading-relaxed">
            <ul className="space-y-2.5 list-disc list-outside ml-4">
              <li>
                <strong className="text-zinc-950 dark:text-[#F4F4F6]">One answer only:</strong> If you find more than one correct answer, enter only one answer.
              </li>
              <li>
                <strong className="text-zinc-950 dark:text-[#F4F4F6]">Character limit:</strong> Enter up to 5 characters for positive answers, or up to 6 characters (including the negative sign) for negative answers.
              </li>
              <li>
                <strong className="text-zinc-950 dark:text-[#F4F4F6]">Fractions:</strong> If your fraction answer does not fit in the provided space, enter its decimal equivalent.
              </li>
              <li>
                <strong className="text-zinc-950 dark:text-[#F4F4F6]">Decimals:</strong> If your decimal answer does not fit, truncate or round it to the third decimal place.
              </li>
              <li>
                <strong className="text-zinc-950 dark:text-[#F4F4F6]">Mixed numbers:</strong> Enter mixed numbers (such as 3 1/2) as improper fractions (7/2) or their decimal equivalents (3.5).
              </li>
              <li>
                <strong className="text-zinc-950 dark:text-[#F4F4F6]">No symbols:</strong> Do not enter symbols such as %, commas, or $.
              </li>
            </ul>

            {/* Examples Card */}
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-[#181B24]">
              <span className="font-mono text-[11px] font-bold uppercase text-zinc-500 dark:text-[#8E95A5] block mb-2">
                Acceptable Equivalent Examples
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-[#141620] border border-zinc-200/70 dark:border-[#222634]">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200 mb-0.5">Fraction 3/5:</div>
                  <div className="font-mono text-blue-700 dark:text-blue-400 font-bold">3/5, 0.6, or .6</div>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-[#141620] border border-zinc-200/70 dark:border-[#222634]">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200 mb-0.5">Repeating 2/3:</div>
                  <div className="font-mono text-blue-700 dark:text-blue-400 font-bold">2/3, .6666, 0.667</div>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-[#141620] border border-zinc-200/70 dark:border-[#222634]">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200 mb-0.5">Negative -1/4:</div>
                  <div className="font-mono text-blue-700 dark:text-blue-400 font-bold">-1/4, -.25, -0.25</div>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-[#141620] border border-zinc-200/70 dark:border-[#222634]">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200 mb-0.5">Mixed 3 1/2:</div>
                  <div className="font-mono text-blue-700 dark:text-blue-400 font-bold">7/2 or 3.5 (never 3 1/2)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main passage stimulus content */}
      <div data-annotate-target="passage" className="text-zinc-950 dark:text-[#F4F4F6] max-w-[65ch]">
        {renderContent()}
      </div>
    </div>
  );
};
