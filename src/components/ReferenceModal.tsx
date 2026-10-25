import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferenceModal: React.FC<ReferenceModalProps> = ({ isOpen, onClose }) => {
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
        className="w-full max-w-4xl bg-white dark:bg-[#11131A] text-zinc-950 dark:text-[#F4F4F6] rounded-2xl shadow-2xl border border-zinc-200/90 dark:border-[#222634] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-[#222634] flex items-center justify-between bg-neutral-50/80 dark:bg-[#181B24]/80 backdrop-blur-xs">
          <div>
            <h2 className="text-lg font-bold text-zinc-950 dark:text-[#F4F4F6] tracking-tight">SAT Math Reference Sheet</h2>
            <p className="text-xs text-zinc-500 dark:text-[#8E95A5] mt-0.5">Official College Board Digital SAT geometric formulas and references</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-950 dark:hover:text-[#F4F4F6] hover:bg-zinc-100 dark:hover:bg-[#181B24] transition-all duration-150 active:scale-90 cursor-pointer"
            aria-label="Close reference sheet"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-zinc-800 dark:text-[#C5CAD6]">
          {/* Row 1: 2D Geometry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Circle */}
            <div className="border border-zinc-200 dark:border-[#222634] rounded-xl p-3 flex flex-col items-center text-center bg-neutral-50/50 dark:bg-[#181B24]/50 shadow-2xs">
              <svg className="w-20 h-20 text-zinc-800 dark:text-[#F4F4F6] my-1" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="2.5" fill="none" />
                <line x1="50" y1="50" x2="88" y2="50" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
                <circle cx="50" cy="50" r="2.5" fill="currentColor" />
                <text x="66" y="44" fontSize="13" fontFamily="sans-serif" fontStyle="italic" fill="currentColor">r</text>
              </svg>
              <div className="font-serif text-[15px] mt-2 space-y-1">
                <div>A = πr²</div>
                <div>C = 2πr</div>
              </div>
            </div>

            {/* Rectangle */}
            <div className="border border-zinc-200 dark:border-[#222634] rounded-xl p-3 flex flex-col items-center text-center bg-neutral-50/50 dark:bg-[#181B24]/50 shadow-2xs">
              <svg className="w-20 h-20 text-zinc-800 dark:text-[#F4F4F6] my-1" viewBox="0 0 100 100">
                <rect x="15" y="25" width="70" height="50" stroke="currentColor" strokeWidth="2.5" fill="none" />
                <text x="50" y="88" fontSize="13" textAnchor="middle" fontStyle="italic" fill="currentColor">w</text>
                <text x="8" y="54" fontSize="13" fontStyle="italic" fill="currentColor">ℓ</text>
              </svg>
              <div className="font-serif text-[15px] mt-2">
                <div>A = ℓw</div>
              </div>
            </div>

            {/* Triangle */}
            <div className="border border-zinc-200 dark:border-[#222634] rounded-xl p-3 flex flex-col items-center text-center bg-neutral-50/50 dark:bg-[#181B24]/50 shadow-2xs">
              <svg className="w-20 h-20 text-zinc-800 dark:text-[#F4F4F6] my-1" viewBox="0 0 100 100">
                <polygon points="15,75 85,75 55,20" stroke="currentColor" strokeWidth="2.5" fill="none" />
                <line x1="55" y1="20" x2="55" y2="75" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                <text x="50" y="89" fontSize="13" textAnchor="middle" fontStyle="italic" fill="currentColor">b</text>
                <text x="60" y="52" fontSize="13" fontStyle="italic" fill="currentColor">h</text>
              </svg>
              <div className="font-serif text-[15px] mt-2">
                <div>A = ½bh</div>
              </div>
            </div>

            {/* Pythagorean */}
            <div className="border border-zinc-200 dark:border-[#222634] rounded-xl p-3 flex flex-col items-center text-center bg-neutral-50/50 dark:bg-[#181B24]/50 shadow-2xs">
              <svg className="w-20 h-20 text-zinc-800 dark:text-[#F4F4F6] my-1" viewBox="0 0 100 100">
                <polygon points="20,75 80,75 20,25" stroke="currentColor" strokeWidth="2.5" fill="none" />
                <polyline points="20,65 30,65 30,75" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <text x="50" y="89" fontSize="13" textAnchor="middle" fontStyle="italic" fill="currentColor">b</text>
                <text x="10" y="54" fontSize="13" fontStyle="italic" fill="currentColor">a</text>
                <text x="54" y="44" fontSize="13" fontStyle="italic" fill="currentColor">c</text>
              </svg>
              <div className="font-serif text-[15px] mt-2">
                <div>c² = a² + b²</div>
              </div>
            </div>
          </div>

          {/* Row 2: Special Right Triangles */}
          <div className="border border-zinc-200 dark:border-[#222634] rounded-xl p-4 bg-neutral-50/50 dark:bg-[#181B24]/50 shadow-2xs">
            <h3 className="font-semibold text-zinc-800 dark:text-[#F4F4F6] text-xs uppercase tracking-wider mb-3">Special Right Triangles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 justify-center">
                <svg className="w-28 h-20 text-zinc-800 dark:text-[#F4F4F6]" viewBox="0 0 120 80">
                  <polygon points="15,70 105,70 15,20" stroke="currentColor" strokeWidth="2.5" fill="none" />
                  <polyline points="15,60 25,60 25,70" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <text x="60" y="79" fontSize="11" textAnchor="middle" fill="currentColor">x√3</text>
                  <text x="5" y="48" fontSize="11" fill="currentColor">x</text>
                  <text x="62" y="40" fontSize="11" fill="currentColor">2x</text>
                  <text x="20" y="32" fontSize="9" fill="currentColor">60°</text>
                  <text x="80" y="66" fontSize="9" fill="currentColor">30°</text>
                </svg>
                <div className="text-xs text-zinc-700 dark:text-[#C5CAD6] font-serif">
                  <div className="font-sans font-semibold text-zinc-950 dark:text-white">30° - 60° - 90°</div>
                  <div>Sides in ratio: 1 : √3 : 2</div>
                </div>
              </div>

              <div className="flex items-center gap-4 justify-center">
                <svg className="w-24 h-20 text-zinc-800 dark:text-[#F4F4F6]" viewBox="0 0 100 80">
                  <polygon points="15,70 75,70 15,10" stroke="currentColor" strokeWidth="2.5" fill="none" />
                  <polyline points="15,60 25,60 25,70" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <text x="45" y="79" fontSize="11" textAnchor="middle" fill="currentColor">s</text>
                  <text x="6" y="45" fontSize="11" fill="currentColor">s</text>
                  <text x="48" y="36" fontSize="11" fill="currentColor">s√2</text>
                  <text x="20" y="24" fontSize="9" fill="currentColor">45°</text>
                  <text x="58" y="66" fontSize="9" fill="currentColor">45°</text>
                </svg>
                <div className="text-xs text-zinc-700 dark:text-[#C5CAD6] font-serif">
                  <div className="font-sans font-semibold text-zinc-950 dark:text-white">45° - 45° - 90°</div>
                  <div>Sides in ratio: 1 : 1 : √2</div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: 3D Geometry Volumes */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="border border-zinc-200 dark:border-[#222634] rounded-xl p-2.5 bg-neutral-50/50 dark:bg-[#181B24]/50 shadow-2xs">
              <div className="font-medium text-xs text-zinc-600 dark:text-[#8E95A5] mb-1">Rect. Prism</div>
              <div className="font-serif text-sm font-semibold text-zinc-950 dark:text-white">V = ℓwh</div>
            </div>
            <div className="border border-zinc-200 dark:border-[#222634] rounded-xl p-2.5 bg-neutral-50/50 dark:bg-[#181B24]/50 shadow-2xs">
              <div className="font-medium text-xs text-zinc-600 dark:text-[#8E95A5] mb-1">Cylinder</div>
              <div className="font-serif text-sm font-semibold text-zinc-950 dark:text-white">V = πr²h</div>
            </div>
            <div className="border border-zinc-200 dark:border-[#222634] rounded-xl p-2.5 bg-neutral-50/50 dark:bg-[#181B24]/50 shadow-2xs">
              <div className="font-medium text-xs text-zinc-600 dark:text-[#8E95A5] mb-1">Sphere</div>
              <div className="font-serif text-sm font-semibold text-zinc-950 dark:text-white">V = ⁴⁄₃πr³</div>
            </div>
            <div className="border border-zinc-200 dark:border-[#222634] rounded-xl p-2.5 bg-neutral-50/50 dark:bg-[#181B24]/50 shadow-2xs">
              <div className="font-medium text-xs text-zinc-600 dark:text-[#8E95A5] mb-1">Cone</div>
              <div className="font-serif text-sm font-semibold text-zinc-950 dark:text-white">V = ⅓πr²h</div>
            </div>
            <div className="border border-zinc-200 dark:border-[#222634] rounded-xl p-2.5 bg-neutral-50/50 dark:bg-[#181B24]/50 shadow-2xs">
              <div className="font-medium text-xs text-zinc-600 dark:text-[#8E95A5] mb-1">Pyramid</div>
              <div className="font-serif text-sm font-semibold text-zinc-950 dark:text-white">V = ⅓ℓwh</div>
            </div>
          </div>

          {/* Key Facts Footnote */}
          <div className="p-3.5 bg-zinc-100 dark:bg-[#181B24] rounded-xl text-xs text-zinc-600 dark:text-[#8E95A5] space-y-1 border border-zinc-200/70 dark:border-[#222634]">
            <p>• The number of degrees of arc in a circle is 360.</p>
            <p>• The number of radians of arc in a circle is 2π.</p>
            <p>• The sum of the measures in degrees of the angles of a triangle is 180.</p>
          </div>
        </div>

        {/* Footer */}
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

export default ReferenceModal;
