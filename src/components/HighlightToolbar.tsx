import React, { useState, useEffect, useRef } from 'react';
import { 
  Droplet, 
  Trash2, 
  ChevronDown, 
  Check, 
  X, 
  StickyNote 
} from 'lucide-react';
import { HighlightColor, UnderlineStyle, TextHighlight } from '../types/quiz';

interface HighlightToolbarProps {
  position: { top: number; left: number }; // coords for the floating toolbar
  activeHighlight: TextHighlight | null; // null if newly selected text
  onSelectColor: (color: HighlightColor) => void;
  onToggleUnderline: (style?: UnderlineStyle) => void;
  onDeleteHighlight: () => void;
  onSaveNote: (note: string) => void;
  onClose: () => void;
}

export const HighlightToolbar: React.FC<HighlightToolbarProps> = ({
  position,
  activeHighlight,
  onSelectColor,
  onToggleUnderline,
  onDeleteHighlight,
  onSaveNote,
  onClose,
}) => {
  const [isUnderlineMenuOpen, setIsUnderlineMenuOpen] = useState<boolean>(false);
  const [isNoteBoxOpen, setIsNoteBoxOpen] = useState<boolean>(false);
  const [noteContent, setNoteContent] = useState<string>(activeHighlight?.note || '');
  const noteTextareaRef = useRef<HTMLTextAreaElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const noteBoxRef = useRef<HTMLDivElement>(null);

  // Sync note content if activeHighlight changes
  useEffect(() => {
    setNoteContent(activeHighlight?.note || '');
  }, [activeHighlight]);

  useEffect(() => {
    if (isNoteBoxOpen) {
      setTimeout(() => noteTextareaRef.current?.focus(), 50);
    }
  }, [isNoteBoxOpen]);

  // Close toolbar on Escape key or when clicking/tapping outside (whitespace)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (toolbarRef.current && toolbarRef.current.contains(target)) return;
      if (noteBoxRef.current && noteBoxRef.current.contains(target)) return;
      onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    // Slight delay so the mouseup/touchend event that created the selection doesn't instantly dismiss it
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }, 60);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [onClose]);

  const currentColor = activeHighlight?.color || 'yellow';
  const isUnderlined = activeHighlight?.isUnderlined || false;
  const currentUnderlineStyle = activeHighlight?.underlineStyle || 'solid';

  const swatches: { id: HighlightColor; bg: string; fill: string; dropletColor: string }[] = [
    { id: 'yellow', bg: '#fef08a', fill: '#ffeb00', dropletColor: 'fill-yellow-400 text-gray-800' },
    { id: 'blue', bg: '#e0f2fe', fill: '#bae6fd', dropletColor: 'fill-sky-400 text-gray-800' },
    { id: 'pink', bg: '#fce7f3', fill: '#fbcfe8', dropletColor: 'fill-pink-400 text-gray-800' },
  ];

  return (
    <>
      {/* Floating White Pill Toolbar */}
      <div
        ref={toolbarRef}
        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }} // CRITICAL: Never clears window.getSelection()
        onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
        style={{
          position: 'fixed',
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: 'translate(-50%, -100%)',
        }}
        className="bg-white rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.15)] border border-gray-200 px-2.5 py-1.5 flex items-center gap-2 z-50 animate-in fade-in zoom-in-95 duration-150 select-none"
      >
        {/* 1. Three Circular Color Swatches */}
        <div className="flex items-center gap-1.5" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }} onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }}>
          {swatches.map((swatch) => {
            const isActive = activeHighlight ? currentColor === swatch.id : swatch.id === 'yellow';
            return (
              <button
                key={swatch.id}
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelectColor(swatch.id);
                }}
                onClick={() => onSelectColor(swatch.id)}
                style={{ backgroundColor: swatch.bg }}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 ${
                  isActive
                    ? 'border-2 border-[#4b5563] ring-1 ring-gray-400/50'
                    : 'border border-gray-400 hover:border-gray-600'
                }`}
                title={`Highlight in ${swatch.id}`}
              >
                {isActive && (
                  <Droplet className={`w-3.5 h-3.5 ${swatch.dropletColor}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* 2. Underline Style Button with chevron */}
        <div className="relative flex items-center" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }} onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }}>
          <div
            className={`flex items-center rounded-full border border-gray-400 transition-colors ${
              isUnderlined ? 'bg-gray-100 text-black border-gray-600 font-bold' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <button
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleUnderline();
              }}
              onClick={() => onToggleUnderline()}
              className="pl-2.5 pr-1 py-1 flex items-center justify-center text-xs font-bold cursor-pointer"
              title="Toggle Underline"
            >
              <span className={`underline ${currentUnderlineStyle === 'dashed' ? 'decoration-dashed' : currentUnderlineStyle === 'dotted' ? 'decoration-dotted' : 'decoration-solid'} decoration-2`}>
                U
              </span>
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsUnderlineMenuOpen(!isUnderlineMenuOpen);
              }}
              onClick={(e) => {
                e.stopPropagation();
                setIsUnderlineMenuOpen(!isUnderlineMenuOpen);
              }}
              className="pr-2 pl-0.5 py-1 text-gray-500 hover:text-gray-800 cursor-pointer"
              title="Underline style menu"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* Underline Style Dropdown Menu */}
          {isUnderlineMenuOpen && (
            <div
              className="absolute left-0 bottom-full mb-2 bg-white rounded-lg shadow-xl border border-gray-200 py-1 w-32 z-50 text-xs text-gray-800 select-none animate-in fade-in zoom-in-95"
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onClick={(e) => e.stopPropagation()}
            >
              {(['solid', 'dashed', 'dotted'] as UnderlineStyle[]).map((style) => (
                <button
                  key={style}
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleUnderline(style);
                    setIsUnderlineMenuOpen(false);
                  }}
                  onClick={() => {
                    onToggleUnderline(style);
                    setIsUnderlineMenuOpen(false);
                  }}
                  className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-gray-100 transition-colors cursor-pointer ${
                    isUnderlined && currentUnderlineStyle === style ? 'bg-blue-50 font-bold text-[#0050d8]' : ''
                  }`}
                >
                  <span className={`capitalize underline decoration-2 ${
                    style === 'dashed' ? 'decoration-dashed' : style === 'dotted' ? 'decoration-dotted' : 'decoration-solid'
                  }`}>
                    {style}
                  </span>
                  {isUnderlined && currentUnderlineStyle === style && (
                    <Check className="w-3.5 h-3.5 text-[#0050d8]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Delete Highlight Button (Trash Icon inside Circle) */}
        <button
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDeleteHighlight();
          }}
          onClick={onDeleteHighlight}
          className="w-8 h-8 rounded-full border border-gray-400 hover:bg-gray-100 flex items-center justify-center text-gray-700 hover:text-rose-600 transition-colors shadow-2xs cursor-pointer"
          title="Remove highlight"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* 4. Vertical Divider */}
        <div className="h-6 w-[1px] bg-gray-300 mx-0.5" />

        {/* 5. Add/Edit Sticky Note Button */}
        <button
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onClick={() => setIsNoteBoxOpen(!isNoteBoxOpen)}
          className={`w-8 h-8 rounded-full border border-gray-400 hover:bg-gray-100 flex items-center justify-center transition-colors shadow-2xs cursor-pointer ${
            activeHighlight?.note ? 'bg-yellow-50 border-amber-500' : ''
          }`}
          title={activeHighlight?.note ? "Edit note" : "Add note"}
        >
          <div className="bg-yellow-200 border border-gray-700 rounded-xs w-4 h-4 flex items-center justify-center text-[10px] font-bold text-gray-800 shadow-2xs">
            +
          </div>
        </button>
      </div>

      {/* Floating Note Box Drawer right below the highlight */}
      {isNoteBoxOpen && (
        <div
          ref={noteBoxRef}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: `${position.top + 38}px`,
            left: `${position.left}px`,
            transform: 'translateX(-50%)',
          }}
          className="w-64 bg-[#fef9c3] rounded-xl shadow-2xl border border-amber-300 p-3 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-amber-200/80 text-xs font-semibold text-amber-900">
            <div className="flex items-center gap-1.5">
              <StickyNote className="w-3.5 h-3.5 text-amber-700" />
              <span>Annotation Note</span>
            </div>
            <button
              onClick={() => setIsNoteBoxOpen(false)}
              className="text-amber-700 hover:text-amber-950 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <textarea
            ref={noteTextareaRef}
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Type your note here..."
            rows={3}
            className="w-full bg-white/80 border border-amber-300 rounded p-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans resize-none"
          />

          <div className="mt-2 flex items-center justify-between">
            {activeHighlight?.note ? (
              <button
                onClick={() => {
                  onSaveNote('');
                  setIsNoteBoxOpen(false);
                }}
                className="text-[11px] text-rose-600 hover:underline cursor-pointer"
              >
                Delete note
              </button>
            ) : <span />}

            <button
              onClick={() => {
                onSaveNote(noteContent);
                setIsNoteBoxOpen(false);
              }}
              className="px-3 py-1 bg-amber-800 hover:bg-amber-900 text-white rounded text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              Save Note
            </button>
          </div>
        </div>
      )}
    </>
  );
};
