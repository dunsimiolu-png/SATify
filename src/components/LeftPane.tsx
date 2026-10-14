import React, { useCallback, useEffect } from 'react';
import { MockQuestion, TextHighlight } from '../types/quiz';
import { RichText } from './RichText';

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
    }
  }, [isAnnotateActive]);

  // Detect Rhetorical Synthesis questions with student notes
  const isRhetoricalSynthesis = /While researching a topic, a student has taken the following notes:/i.test(passageText);

  // Detect Paired texts (Text 1 / Text 2)
  const STANDALONE_T1_REGEX = /(?:^|\n)\s*Text\s*1(?!\s+(?:is\s+adapted|discusses|was\s+written|describes|presents|explores|argues|considers))\s*(?:\n|$)/i;
  const STANDALONE_T2_REGEX = /(?:^|\n)\s*Text\s*2(?!\s+(?:is\s+adapted|discusses|was\s+written|describes|presents|explores|argues|considers))\s*(?:\n|$)/i;

  const isPairedText = question.skill === 'Cross-Text Connections' || (
    STANDALONE_T1_REGEX.test(passageText) && STANDALONE_T2_REGEX.test(passageText)
  );

  // Handle selection mouse up to trigger floating highlighter toolbar
  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectedText = selection.toString().trim();
    if (!selectedText || selectedText.length < 1) return;

    try {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (!rect || (rect.width === 0 && rect.height === 0)) return;

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
        const end = rawIdx;
        if (onTextSelected) {
          onTextSelected({
            target: 'passage',
            start,
            end,
            text: selectedText,
            rect,
          });
        }
      }
    } catch (e) {
      console.warn('Selection detection error:', e);
    }
  }, [passageText, onTextSelected]);

  const renderContent = () => {
    // 1. Rhetorical Synthesis: Bullet-Point Student Notes
    if (isRhetoricalSynthesis) {
      const match = passageText.match(/(While researching a topic, a student has taken the following notes:)([\s\S]+)/i);
      if (match) {
        const intro = match[1].trim();
        const rawNotes = match[2].trim();
        // Split notes cleanly by newline and bullet markers
        const notes = rawNotes
          .split(/(?:^|\n)\s*[•\-\*]?\s*/)
          .map(s => s.replace(/^[•\-\*]\s*/, '').trim())
          .filter(s => s.length > 0);

        return (
          <div className="space-y-4">
            <p className="font-serif italic text-[16px] text-gray-700 leading-relaxed">
              <RichText text={intro} />
            </p>
            <ul className="space-y-3 pl-1 font-serif text-[17px] leading-[1.65] text-[#111827]">
              {notes.map((note, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-[#0050d8] font-bold text-lg leading-none select-none mt-1">•</span>
                  <span className="flex-1">
                    <RichText
                      text={note}
                      target="passage"
                      highlights={highlights}
                      onHighlightClick={onHighlightClick}
                      onOpenNote={onOpenNote}
                    />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      }
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
      onMouseUp={handleMouseUp}
      className="h-full px-4 sm:px-6 lg:px-10 py-6 sm:py-8 overflow-y-auto overflow-x-hidden bg-white dark:bg-[#070a10] text-slate-900 dark:text-white select-text passage-text"
    >
      {/* Annotate active mode indicator */}
      {isAnnotateActive && (
        <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-full text-xs font-medium text-[#0050d8] dark:text-blue-400">
          <span className="w-2 h-2 rounded-full bg-[#0050d8] animate-ping" />
          <span>Highlighter Active — Select any passage text to highlight</span>
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
