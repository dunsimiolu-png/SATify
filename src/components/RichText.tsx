import React from 'react';
import { TextHighlight } from '../types/quiz';

export interface RichTextProps {
  text: string;
  className?: string;
  target?: 'passage' | 'stem' | 'prompt';
  highlights?: TextHighlight[];
  onHighlightClick?: (highlight: TextHighlight, rect: DOMRect) => void;
  onOpenNote?: (highlight: TextHighlight, rect: DOMRect) => void;
}

interface CharStyle {
  char: string;
  isItalic: boolean;
  isUnderline: boolean;
  isSub: boolean;
  isSup: boolean;
  rawIdx: number;
}

export const renderFormattedContent = (
  text: string,
  target?: 'passage' | 'stem' | 'prompt',
  highlights?: TextHighlight[],
  onHighlightClick?: (highlight: TextHighlight, rect: DOMRect) => void,
  onOpenNote?: (highlight: TextHighlight, rect: DOMRect) => void
): React.ReactNode => {
  if (!text) return null;

  // Filter highlights if provided
  const relevantHighlights = highlights && target && onHighlightClick
    ? highlights
        .filter((h) => {
          const matchTarget = h.target === target || (target === 'stem' && h.target === 'prompt') || (target === 'prompt' && h.target === 'stem');
          return matchTarget && h.start < text.length && h.end <= text.length && h.start < h.end;
        })
        .sort((a, b) => a.start - b.start)
    : [];

  // Parse characters and track active formatting tags
  const chars: CharStyle[] = [];
  let isItalic = false;
  let isUnderline = false;
  let isSub = false;
  let isSup = false;

  let i = 0;
  while (i < text.length) {
    const sub = text.slice(i);
    const tagMatch = sub.match(/^<\/?(?:em|i|u|sub|sup)\b[^>]*>/i);
    if (tagMatch) {
      const tag = tagMatch[0].toLowerCase();
      if (tag.startsWith('</')) {
        if (tag.startsWith('</em>') || tag.startsWith('</i>')) isItalic = false;
        else if (tag.startsWith('</u>')) isUnderline = false;
        else if (tag.startsWith('</sub>')) isSub = false;
        else if (tag.startsWith('</sup>')) isSup = false;
      } else {
        if (tag.startsWith('<em') || tag.startsWith('<i')) isItalic = true;
        else if (tag.startsWith('<u')) isUnderline = true;
        else if (tag.startsWith('<sub')) isSub = true;
        else if (tag.startsWith('<sup')) isSup = true;
      }
      i += tagMatch[0].length;
      continue;
    }

    chars.push({
      char: text[i],
      isItalic,
      isUnderline,
      isSub,
      isSup,
      rawIdx: i,
    });
    i++;
  }

  if (chars.length === 0) return null;

  // Map each character to any active highlight
  interface Segment {
    text: string;
    isItalic: boolean;
    isUnderline: boolean;
    isSub: boolean;
    isSup: boolean;
    highlight: TextHighlight | null;
  }

  const segments: Segment[] = [];
  let curSegment: Segment | null = null;

  for (const c of chars) {
    const hl = relevantHighlights.find((h) => c.rawIdx >= h.start && c.rawIdx < h.end) || null;

    if (
      curSegment &&
      curSegment.isItalic === c.isItalic &&
      curSegment.isUnderline === c.isUnderline &&
      curSegment.isSub === c.isSub &&
      curSegment.isSup === c.isSup &&
      curSegment.highlight === hl
    ) {
      curSegment.text += c.char;
    } else {
      if (curSegment) segments.push(curSegment);
      curSegment = {
        text: c.char,
        isItalic: c.isItalic,
        isUnderline: c.isUnderline,
        isSub: c.isSub,
        isSup: c.isSup,
        highlight: hl,
      };
    }
  }
  if (curSegment) segments.push(curSegment);

  // Render segments into React elements
  return segments.map((seg, idx) => {
    let node: React.ReactNode = seg.text;

    if (seg.isSub) {
      node = <sub key={`sub-${idx}`}>{node}</sub>;
    }
    if (seg.isSup) {
      node = <sup key={`sup-${idx}`}>{node}</sup>;
    }
    if (seg.isItalic) {
      node = (
        <em key={`em-${idx}`} className="italic font-serif">
          {node}
        </em>
      );
    }
    if (seg.isUnderline) {
      node = (
        <u
          key={`u-${idx}`}
          className="underline underline-offset-4 decoration-2 decoration-gray-900 font-medium"
        >
          {node}
        </u>
      );
    }

    if (seg.highlight && onHighlightClick) {
      const h = seg.highlight;
      const bgMap = {
        yellow: '#fef08a',
        blue: '#bae6fd',
        pink: '#fbcfe8',
      };
      const bgColor = bgMap[h.color] || '#fef08a';
      const underlineClass = h.isUnderlined
        ? `underline decoration-[#1e1e1e] decoration-2 ${
            h.underlineStyle === 'dashed'
              ? 'decoration-dashed'
              : h.underlineStyle === 'dotted'
              ? 'decoration-dotted'
              : 'decoration-solid'
          }`
        : '';

      return (
        <mark
          key={`hl-${idx}`}
          data-highlight-id={h.id}
          onClick={(e) => {
            e.stopPropagation();
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            onHighlightClick(h, rect);
          }}
          style={{ backgroundColor: bgColor }}
          className={`px-0.5 rounded-none box-decoration-clone cursor-pointer select-text transition-colors hover:brightness-95 ${underlineClass}`}
        >
          {node}
          {h.note && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                if (onOpenNote) {
                  onOpenNote(h, rect);
                } else {
                  onHighlightClick(h, rect);
                }
              }}
              className="inline-flex items-center ml-1 px-1 py-0.2 bg-amber-200 border border-amber-600 rounded-xs text-[10px] font-sans font-bold text-amber-900 cursor-pointer hover:bg-amber-300 align-middle shadow-2xs select-none"
              title={`Note: ${h.note}`}
            >
              📝
            </span>
          )}
        </mark>
      );
    }

    return <React.Fragment key={`seg-${idx}`}>{node}</React.Fragment>;
  });
};

export const RichText: React.FC<RichTextProps> = ({
  text,
  className = '',
  target,
  highlights,
  onHighlightClick,
  onOpenNote,
}) => {
  return (
    <span className={`rich-text ${className}`}>
      {renderFormattedContent(text, target, highlights, onHighlightClick, onOpenNote)}
    </span>
  );
};
