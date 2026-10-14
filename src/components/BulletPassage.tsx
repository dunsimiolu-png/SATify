import React from 'react';
import { RichText } from './RichText';
import { TextHighlight } from '../types/quiz';

interface BulletPassageProps {
  text: string;
  target?: 'passage' | 'stem' | 'prompt';
  highlights?: TextHighlight[];
  onHighlightClick?: (highlight: TextHighlight, rect: DOMRect) => void;
  onOpenNote?: (highlight: TextHighlight, rect: DOMRect) => void;
  className?: string;
}

/**
 * Checks whether the given text is a Rhetorical Synthesis or bullet notes passage.
 */
export const isBulletPassage = (text?: string): boolean => {
  if (!text) return false;
  return (
    /While researching a topic, a student has taken the following notes:?/i.test(text) ||
    /[•●\u2022]/.test(text)
  );
};

/**
 * Parses and renders Rhetorical Synthesis research notes as clean, indented bullet points (<ul className="list-disc pl-6 space-y-2.5 my-2">).
 */
export const BulletPassage: React.FC<BulletPassageProps> = ({
  text,
  target = 'passage',
  highlights,
  onHighlightClick,
  onOpenNote,
  className = '',
}) => {
  if (!text) return null;

  let intro = '';
  let rawNotes = '';

  const rsMatch = text.match(/(While researching a topic, a student has taken the following notes:?)([\s\S]*)/i);
  if (rsMatch) {
    intro = rsMatch[1].trim();
    rawNotes = rsMatch[2].trim();
  } else {
    // Look for first bullet marker
    const firstBulletIdx = text.search(/[•●\u2022]/);
    if (firstBulletIdx !== -1) {
      intro = text.slice(0, firstBulletIdx).trim();
      rawNotes = text.slice(firstBulletIdx).trim();
    } else {
      rawNotes = text;
    }
  }

  // Split discrete notes by newline and/or bullet delimiters (•, ●, \u2022, -, *)
  const notes = rawNotes
    .split(/(?:^|\n)\s*[•●\u2022\*\-]?\s*/)
    .map(s => s.replace(/^[•●\u2022\*\-]\s*/, '').trim())
    .filter(s => s.length > 0);

  return (
    <div className={`space-y-4 ${className}`}>
      {intro && (
        <p className="font-serif italic text-[16px] text-gray-700 dark:text-slate-300 leading-relaxed">
          <RichText text={intro} />
        </p>
      )}
      <ul className="list-disc pl-6 space-y-2.5 my-2 font-serif text-[16px] sm:text-[17px] leading-[1.65] text-[#111827] dark:text-slate-100">
        {notes.map((note, idx) => (
          <li key={idx} className="pl-1">
            <RichText
              text={note}
              target={target}
              highlights={highlights}
              onHighlightClick={onHighlightClick}
              onOpenNote={onOpenNote}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
