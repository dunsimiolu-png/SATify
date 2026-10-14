import React from 'react';
import { X } from 'lucide-react';

interface ReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferenceModal: React.FC<ReferenceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-gray-300 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-[#f8fafc]">
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">SAT Math Reference Sheet</h2>
            <p className="text-xs text-gray-500">Official College Board Digital SAT geometric formulas and references</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Row 1: 2D Geometry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Circle */}
            <div className="border border-gray-200 rounded-lg p-3 flex flex-col items-center text-center bg-gray-50/50">
              <svg className="w-20 h-20 text-gray-800 my-1" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="2.5" fill="none" />
                <line x1="50" y1="50" x2="88" y2="50" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
                <circle cx="50" cy="50" r="2.5" fill="currentColor" />
                <text x="66" y="44" fontSize="13" fontFamily="sans-serif" fontStyle="italic">r</text>
              </svg>
              <div className="font-serif text-[15px] mt-2 space-y-1">
                <div>A = πr²</div>
                <div>C = 2πr</div>
              </div>
            </div>

            {/* Rectangle */}
            <div className="border border-gray-200 rounded-lg p-3 flex flex-col items-center text-center bg-gray-50/50">
              <svg className="w-20 h-20 text-gray-800 my-1" viewBox="0 0 100 100">
                <rect x="15" y="25" width="70" height="50" stroke="currentColor" strokeWidth="2.5" fill="none" />
                <text x="50" y="88" fontSize="13" textAnchor="middle" fontStyle="italic">w</text>
                <text x="8" y="54" fontSize="13" fontStyle="italic">ℓ</text>
              </svg>
              <div className="font-serif text-[15px] mt-2">
                <div>A = ℓw</div>
              </div>
            </div>

            {/* Triangle */}
            <div className="border border-gray-200 rounded-lg p-3 flex flex-col items-center text-center bg-gray-50/50">
              <svg className="w-20 h-20 text-gray-800 my-1" viewBox="0 0 100 100">
                <polygon points="15,75 85,75 55,20" stroke="currentColor" strokeWidth="2.5" fill="none" />
                <line x1="55" y1="20" x2="55" y2="75" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                <text x="50" y="89" fontSize="13" textAnchor="middle" fontStyle="italic">b</text>
                <text x="60" y="52" fontSize="13" fontStyle="italic">h</text>
              </svg>
              <div className="font-serif text-[15px] mt-2">
                <div>A = ½bh</div>
              </div>
            </div>

            {/* Pythagorean */}
            <div className="border border-gray-200 rounded-lg p-3 flex flex-col items-center text-center bg-gray-50/50">
              <svg className="w-20 h-20 text-gray-800 my-1" viewBox="0 0 100 100">
                <polygon points="20,75 80,75 20,25" stroke="currentColor" strokeWidth="2.5" fill="none" />
                <polyline points="20,65 30,65 30,75" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <text x="50" y="89" fontSize="13" textAnchor="middle" fontStyle="italic">b</text>
                <text x="10" y="54" fontSize="13" fontStyle="italic">a</text>
                <text x="54" y="44" fontSize="13" fontStyle="italic">c</text>
              </svg>
              <div className="font-serif text-[15px] mt-2">
                <div>c² = a² + b²</div>
              </div>
            </div>
          </div>

          {/* Row 2: Special Right Triangles */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
            <h3 className="font-semibold text-gray-800 text-xs uppercase tracking-wider mb-3">Special Right Triangles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 justify-center">
                <svg className="w-28 h-20 text-gray-800" viewBox="0 0 120 80">
                  <polygon points="15,70 105,70 15,20" stroke="currentColor" strokeWidth="2.5" fill="none" />
                  <polyline points="15,60 25,60 25,70" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <text x="60" y="79" fontSize="11" textAnchor="middle">x√3</text>
                  <text x="5" y="48" fontSize="11">x</text>
                  <text x="62" y="40" fontSize="11">2x</text>
                  <text x="20" y="32" fontSize="9">60°</text>
                  <text x="80" y="66" fontSize="9">30°</text>
                </svg>
                <div className="text-xs text-gray-700 font-serif">
                  <div className="font-sans font-semibold">30° - 60° - 90°</div>
                  <div>Sides in ratio: 1 : √3 : 2</div>
                </div>
              </div>

              <div className="flex items-center gap-4 justify-center">
                <svg className="w-24 h-20 text-gray-800" viewBox="0 0 100 80">
                  <polygon points="15,70 75,70 15,10" stroke="currentColor" strokeWidth="2.5" fill="none" />
                  <polyline points="15,60 25,60 25,70" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <text x="45" y="79" fontSize="11" textAnchor="middle">s</text>
                  <text x="6" y="45" fontSize="11">s</text>
                  <text x="48" y="36" fontSize="11">s√2</text>
                  <text x="20" y="24" fontSize="9">45°</text>
                  <text x="58" y="66" fontSize="9">45°</text>
                </svg>
                <div className="text-xs text-gray-700 font-serif">
                  <div className="font-sans font-semibold">45° - 45° - 90°</div>
                  <div>Sides in ratio: 1 : 1 : √2</div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: 3D Geometry Volumes */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="border border-gray-200 rounded p-2 bg-gray-50/50">
              <div className="font-medium text-xs text-gray-600 mb-1">Rect. Prism</div>
              <div className="font-serif text-sm font-semibold">V = ℓwh</div>
            </div>
            <div className="border border-gray-200 rounded p-2 bg-gray-50/50">
              <div className="font-medium text-xs text-gray-600 mb-1">Cylinder</div>
              <div className="font-serif text-sm font-semibold">V = πr²h</div>
            </div>
            <div className="border border-gray-200 rounded p-2 bg-gray-50/50">
              <div className="font-medium text-xs text-gray-600 mb-1">Sphere</div>
              <div className="font-serif text-sm font-semibold">V = ⁴⁄₃πr³</div>
            </div>
            <div className="border border-gray-200 rounded p-2 bg-gray-50/50">
              <div className="font-medium text-xs text-gray-600 mb-1">Cone</div>
              <div className="font-serif text-sm font-semibold">V = ⅓πr²h</div>
            </div>
            <div className="border border-gray-200 rounded p-2 bg-gray-50/50">
              <div className="font-medium text-xs text-gray-600 mb-1">Pyramid</div>
              <div className="font-serif text-sm font-semibold">V = ⅓ℓwh</div>
            </div>
          </div>

          {/* Key Facts Footnote */}
          <div className="p-3 bg-gray-100 rounded-lg text-xs text-gray-600 space-y-1">
            <p>• The number of degrees of arc in a circle is 360.</p>
            <p>• The number of radians of arc in a circle is 2π.</p>
            <p>• The sum of the measures in degrees of the angles of a triangle is 180.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex justify-end">
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
