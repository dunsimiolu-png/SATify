import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  Activity, 
  Calculator as CalcIcon, 
  ArrowDownRight, 
  Maximize2, 
  Minimize2,
  GripHorizontal
} from 'lucide-react';

interface DesmosCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    Desmos?: {
      GraphingCalculator: (element: HTMLElement, options?: any) => any;
      ScientificCalculator: (element: HTMLElement, options?: any) => any;
    };
  }
}

// -----------------------------------------------------------------------------
// Singleton Desmos API Script Loader
// -----------------------------------------------------------------------------
const DESMOS_API_URL = 'https://www.desmos.com/api/v1.9/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6';
let desmosLoadingPromise: Promise<any> | null = null;

export function loadDesmosScript(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window not available'));
  if (window.Desmos) return Promise.resolve(window.Desmos);
  if (desmosLoadingPromise) return desmosLoadingPromise;

  desmosLoadingPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src*="desmos.com/api"]`);
    if (existing && window.Desmos) {
      resolve(window.Desmos);
      return;
    }

    const script = document.createElement('script');
    script.src = DESMOS_API_URL;
    script.async = true;
    script.onload = () => {
      if (window.Desmos) {
        resolve(window.Desmos);
      } else {
        reject(new Error('Desmos API script loaded but window.Desmos not defined'));
      }
    };
    script.onerror = (err) => {
      desmosLoadingPromise = null;
      reject(err);
    };
    document.head.appendChild(script);
  });

  return desmosLoadingPromise;
}

// -----------------------------------------------------------------------------
// DesmosCalculator Component
// -----------------------------------------------------------------------------
export const DesmosCalculator: React.FC<DesmosCalculatorProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'graphing' | 'scientific'>('graphing');
  const [isExpandedWidth, setIsExpandedWidth] = useState<boolean>(false);

  // Floating Window Geometry for Desktop
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 400,
    height: 560,
  });
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    const defaultX = Math.max(20, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 430);
    return { x: defaultX, y: 70 };
  });

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; initialX: number; initialY: number }>({
    mouseX: 0,
    mouseY: 0,
    initialX: 0,
    initialY: 0,
  });
  const resizeStartRef = useRef<{ mouseX: number; mouseY: number; initialWidth: number; initialHeight: number }>({
    mouseX: 0,
    mouseY: 0,
    initialWidth: 400,
    initialHeight: 560,
  });

  // Desmos DOM elements & Calculator Instances
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const sciContainerRef = useRef<HTMLDivElement>(null);
  const graphCalcRef = useRef<any>(null);
  const sciCalcRef = useRef<any>(null);
  const [isDesmosReady, setIsDesmosReady] = useState<boolean>(false);

  // Detect mobile viewport (< 640px)
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(() => 
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const handleWinResize = () => {
      setIsMobileScreen(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleWinResize);
    return () => window.removeEventListener('resize', handleWinResize);
  }, []);

  // Initialize Desmos via singleton Promise
  useEffect(() => {
    let mounted = true;

    loadDesmosScript()
      .then((Desmos) => {
        if (!mounted || !Desmos) return;

        // Initialize Graphing Calculator
        if (graphContainerRef.current && !graphCalcRef.current) {
          try {
            graphCalcRef.current = Desmos.GraphingCalculator(graphContainerRef.current, {
              keypad: true,
              expressions: true,
              settingsMenu: true,
              zoomButtons: true,
              border: false,
            });
          } catch (e) {
            console.error('Failed to init Desmos Graphing Calculator:', e);
          }
        }

        // Initialize Scientific Calculator
        if (sciContainerRef.current && !sciCalcRef.current) {
          try {
            sciCalcRef.current = Desmos.ScientificCalculator(sciContainerRef.current, {
              border: false,
            });
          } catch (e) {
            console.error('Failed to init Desmos Scientific Calculator:', e);
          }
        }

        setIsDesmosReady(true);
      })
      .catch((err) => {
        console.error('Desmos loading failed:', err);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // ResizeObserver on containers to call .resize() whenever container dimensions change
  useEffect(() => {
    const activeContainer = activeTab === 'graphing' ? graphContainerRef.current : sciContainerRef.current;
    if (!activeContainer) return;

    const resizeObserver = new ResizeObserver(() => {
      if (activeTab === 'graphing' && graphCalcRef.current?.resize) {
        graphCalcRef.current.resize();
      } else if (activeTab === 'scientific' && sciCalcRef.current?.resize) {
        sciCalcRef.current.resize();
      }
    });

    resizeObserver.observe(activeContainer);
    return () => resizeObserver.disconnect();
  }, [activeTab, isDesmosReady]);

  // Handle Tab Switch & Modal Open Resize
  useEffect(() => {
    if (!isOpen || !isDesmosReady) return;
    const timer = setTimeout(() => {
      if (activeTab === 'graphing' && graphCalcRef.current?.resize) {
        graphCalcRef.current.resize();
      } else if (activeTab === 'scientific' && sciCalcRef.current?.resize) {
        sciCalcRef.current.resize();
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [activeTab, isOpen, isDesmosReady, isExpandedWidth]);

  // ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Width toggle (Standard vs Expanded)
  const toggleWidth = () => {
    setIsExpandedWidth(prev => {
      const next = !prev;
      const newWidth = next ? Math.min(680, window.innerWidth - 40) : 400;
      setSize(s => ({ ...s, width: newWidth }));
      return next;
    });
  };

  // Drag Handlers
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
  };

  // Resize Handlers
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialWidth: size.width,
      initialHeight: size.height,
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStartRef.current.mouseX;
      const deltaY = e.clientY - dragStartRef.current.mouseY;
      const newX = Math.max(10, Math.min(window.innerWidth - size.width - 10, dragStartRef.current.initialX + deltaX));
      const newY = Math.max(10, Math.min(window.innerHeight - size.height - 10, dragStartRef.current.initialY + deltaY));
      setPosition({ x: newX, y: newY });
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStartRef.current.mouseX;
      const deltaY = e.clientY - resizeStartRef.current.mouseY;
      const newWidth = Math.max(340, Math.min(window.innerWidth - position.x - 10, resizeStartRef.current.initialWidth + deltaX));
      const newHeight = Math.max(420, Math.min(window.innerHeight - position.y - 10, resizeStartRef.current.initialHeight + deltaY));
      setSize({ width: newWidth, height: newHeight });

      if (activeTab === 'graphing' && graphCalcRef.current?.resize) {
        graphCalcRef.current.resize();
      } else if (activeTab === 'scientific' && sciCalcRef.current?.resize) {
        sciCalcRef.current.resize();
      }
    }
  }, [isDragging, isResizing, size.width, size.height, position.x, position.y, activeTab]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) setIsDragging(false);
    if (isResizing) {
      setIsResizing(false);
      if (activeTab === 'graphing' && graphCalcRef.current?.resize) {
        graphCalcRef.current.resize();
      } else if (activeTab === 'scientific' && sciCalcRef.current?.resize) {
        sciCalcRef.current.resize();
      }
    }
  }, [isDragging, isResizing, activeTab]);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  if (!isOpen) return null;

  return (
    <div
      style={
        isMobileScreen
          ? undefined
          : {
              position: 'fixed',
              left: `${position.x}px`,
              top: `${position.y}px`,
              width: `${size.width}px`,
              height: `${size.height}px`,
            }
      }
      className={
        isMobileScreen
          ? "fixed inset-x-0 bottom-0 h-[82vh] w-full z-50 flex flex-col bg-white rounded-t-2xl shadow-2xl border-t border-zinc-700 overflow-hidden select-none animate-in slide-in-from-bottom-6 duration-200"
          : "z-50 flex flex-col bg-white rounded-xl shadow-2xl border border-gray-700 overflow-hidden select-none animate-in fade-in-50 duration-150"
      }
    >
      {/* 1. Header Bar with Tabs, Drag Handle, Width Toggle & Close Button */}
      <div 
        onMouseDown={!isMobileScreen ? handleDragStart : undefined}
        className="bg-[#1e1e1e] h-11 px-3 flex items-center justify-between select-none text-white rounded-t-xl flex-shrink-0 cursor-move"
      >
        {/* Left: Mode Toggle (Graphing vs Scientific) */}
        <div 
          onMouseDown={e => e.stopPropagation()} 
          className="border border-gray-500 rounded-md overflow-hidden flex items-center text-xs font-bold"
        >
          <button
            type="button"
            onClick={() => setActiveTab('graphing')}
            className={`flex items-center gap-1.5 px-2.5 py-1 transition-colors cursor-pointer ${
              activeTab === 'graphing'
                ? 'bg-white text-black'
                : 'bg-[#1e1e1e] text-zinc-300 hover:bg-white/10'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Graphing</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('scientific')}
            className={`flex items-center gap-1.5 px-2.5 py-1 transition-colors cursor-pointer ${
              activeTab === 'scientific'
                ? 'bg-white text-black'
                : 'bg-[#1e1e1e] text-zinc-300 hover:bg-white/10'
            }`}
          >
            <CalcIcon className="w-3.5 h-3.5" />
            <span>Scientific</span>
          </button>
        </div>

        {/* Center: Drag Grip Indicator */}
        {!isMobileScreen && (
          <div className="flex items-center gap-1 text-zinc-400 hover:text-white px-2 py-1 rounded transition">
            <GripHorizontal className="w-4 h-4" />
          </div>
        )}

        {/* Right: Width Expand Toggle & Close Button */}
        <div onMouseDown={e => e.stopPropagation()} className="flex items-center gap-1.5">
          {!isMobileScreen && (
            <button
              type="button"
              onClick={toggleWidth}
              className="p-1 rounded text-zinc-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title={isExpandedWidth ? 'Standard Width' : 'Expanded Width'}
            >
              {isExpandedWidth ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-zinc-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Close calculator"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Isolated Explicitly-Sized Wrapper for Desmos */}
      <div 
        className="w-full flex-1 min-h-[380px] bg-white relative overflow-hidden"
        style={{
          color: '#000',
          backgroundColor: '#ffffff',
          isolation: 'isolate',
        }}
      >
        {/* Graphing Calculator Container */}
        <div
          ref={graphContainerRef}
          style={{ 
            display: activeTab === 'graphing' ? 'block' : 'none',
            width: '100%',
            height: '100%',
            backgroundColor: '#ffffff',
          }}
          className="w-full h-full bg-white text-black"
        />

        {/* Scientific Calculator Container */}
        <div
          ref={sciContainerRef}
          style={{ 
            display: activeTab === 'scientific' ? 'block' : 'none',
            width: '100%',
            height: '100%',
            backgroundColor: '#ffffff',
          }}
          className="w-full h-full bg-white text-black"
        />

        {/* Loading Overlay */}
        {!isDesmosReady && (
          <div className="absolute inset-0 bg-white flex flex-col items-center justify-center gap-2 text-zinc-600 text-xs">
            <div className="w-6 h-6 border-2 border-zinc-300 border-t-blue-600 rounded-full animate-spin" />
            <span>Loading Desmos Calculator...</span>
          </div>
        )}
      </div>

      {/* 3. Bottom-Right Circular Resize Handle (Desktop Only) */}
      {!isMobileScreen && (
        <div
          onMouseDown={handleResizeStart}
          className="w-6 h-6 rounded-full bg-white border border-gray-300 shadow-md flex items-center justify-center cursor-nwse-resize absolute bottom-1 right-1 z-20 hover:scale-110 active:scale-95 transition-transform"
          title="Drag to resize calculator"
        >
          <ArrowDownRight className="w-3.5 h-3.5 text-gray-700" />
        </div>
      )}
    </div>
  );
};

export default DesmosCalculator;
