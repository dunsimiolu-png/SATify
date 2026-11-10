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
export const DESMOS_API_KEY = 'dff6ea11e7df4482bab9a540c52a64a0';
export const DESMOS_API_URL = `https://www.desmos.com/api/v1.9/calculator.js?apiKey=${DESMOS_API_KEY}`;
let desmosLoadingPromise: Promise<any> | null = null;

export function loadDesmosScript(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window not available'));
  if (window.Desmos && typeof window.Desmos.GraphingCalculator === 'function') {
    return Promise.resolve(window.Desmos);
  }
  if (desmosLoadingPromise) return desmosLoadingPromise;

  desmosLoadingPromise = new Promise((resolve, reject) => {
    // 1. Remove any broken or un-substituted script tags
    const brokenScripts = document.querySelectorAll<HTMLScriptElement>(`script[src*="%VITE_"]`);
    brokenScripts.forEach(s => s.remove());

    // 2. Check if a valid script tag is already in DOM
    const existing = document.querySelector<HTMLScriptElement>(`script[src*="desmos.com/api"]`);
    if (existing) {
      if (window.Desmos && typeof window.Desmos.GraphingCalculator === 'function') {
        resolve(window.Desmos);
        return;
      }
      existing.addEventListener('load', () => {
        if (window.Desmos && typeof window.Desmos.GraphingCalculator === 'function') {
          resolve(window.Desmos);
        } else {
          reject(new Error('Desmos API script loaded but window.Desmos not defined'));
        }
      });
      existing.addEventListener('error', () => {
        // Remove bad script and fallback to dynamic injection
        existing.remove();
        injectScript(resolve, reject);
      });
      // Fallback polling in case the load event already fired
      let retries = 0;
      const interval = setInterval(() => {
        retries++;
        if (window.Desmos && typeof window.Desmos.GraphingCalculator === 'function') {
          clearInterval(interval);
          resolve(window.Desmos);
        } else if (retries > 60) {
          clearInterval(interval);
          // If existing script timed out, try fresh injection
          existing.remove();
          injectScript(resolve, reject);
        }
      }, 50);
      return;
    }

    injectScript(resolve, reject);
  });

  return desmosLoadingPromise;
}

function injectScript(resolve: (val: any) => void, reject: (err: any) => void) {
  const script = document.createElement('script');
  script.src = DESMOS_API_URL;
  script.async = true;
  script.onload = () => {
    if (window.Desmos && typeof window.Desmos.GraphingCalculator === 'function') {
      resolve(window.Desmos);
    } else {
      reject(new Error('Desmos API script loaded but window.Desmos.GraphingCalculator is missing'));
    }
  };
  script.onerror = (err) => {
    desmosLoadingPromise = null;
    reject(err);
  };
  document.head.appendChild(script);
}

// Kick off script preloading immediately in the background
if (typeof window !== 'undefined') {
  loadDesmosScript().catch(() => {});
}

// -----------------------------------------------------------------------------
// DesmosCalculator Component
// -----------------------------------------------------------------------------
export const DesmosCalculator: React.FC<DesmosCalculatorProps> = ({ isOpen, onClose }) => {
  const [hasBeenOpened, setHasBeenOpened] = useState<boolean>(isOpen);
  const [activeTab, setActiveTab] = useState<'graphing' | 'scientific'>('graphing');
  const [isExpandedWidth, setIsExpandedWidth] = useState<boolean>(false);
  const [isDesmosReady, setIsDesmosReady] = useState<boolean>(
    () => typeof window !== 'undefined' && !!(window.Desmos?.GraphingCalculator)
  );

  // If opened, immediately mark hasBeenOpened as true without delay
  if (isOpen && !hasBeenOpened) {
    setHasBeenOpened(true);
  }

  // Floating Window Geometry for Desktop
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 440,
    height: 570,
  });

  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window === 'undefined') return { x: 50, y: 70 };
    const preferredX = Math.max(20, window.innerWidth - 470);
    return { x: preferredX, y: 70 };
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
    initialWidth: 440,
    initialHeight: 570,
  });

  // Desmos DOM elements & Calculator Instances
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const sciContainerRef = useRef<HTMLDivElement>(null);
  const graphCalcRef = useRef<any>(null);
  const sciCalcRef = useRef<any>(null);

  // Detect mobile viewport (< 640px)
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(() => 
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const handleWinResize = () => {
      const isMobile = window.innerWidth < 640;
      setIsMobileScreen(isMobile);
      if (!isMobile) {
        // Clamp floating window inside visible viewport
        setPosition(prev => ({
          x: Math.max(10, Math.min(window.innerWidth - size.width - 10, prev.x)),
          y: Math.max(10, Math.min(window.innerHeight - size.height - 10, prev.y)),
        }));
      }
    };
    window.addEventListener('resize', handleWinResize);
    return () => window.removeEventListener('resize', handleWinResize);
  }, [size.width, size.height]);

  // 1. Script Loader Trigger
  useEffect(() => {
    let mounted = true;

    loadDesmosScript()
      .then((Desmos) => {
        if (!mounted || !Desmos) return;
        setIsDesmosReady(true);
      })
      .catch((err) => {
        console.error('Desmos loading failed:', err);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // 2. Calculator Instance Initialization & Resize when Open
  useEffect(() => {
    if (!isOpen || !isDesmosReady) return;
    const Desmos = window.Desmos;
    if (!Desmos) return;

    if (activeTab === 'graphing') {
      if (graphContainerRef.current && !graphCalcRef.current) {
        try {
          graphCalcRef.current = Desmos.GraphingCalculator(graphContainerRef.current, {
            keypad: true,
            expressions: true,
            settingsMenu: true,
            zoomButtons: true,
            border: false,
            showResetButtonOnGraphpaper: true,
          });
        } catch (e) {
          console.error('Failed to init Desmos Graphing Calculator:', e);
        }
      }

      // Multi-stage resize trigger
      const trigger = () => {
        if (graphCalcRef.current?.resize) {
          graphCalcRef.current.resize();
        }
      };

      trigger();
      const raf = requestAnimationFrame(trigger);
      const t1 = setTimeout(trigger, 40);
      const t2 = setTimeout(trigger, 150);

      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else if (activeTab === 'scientific') {
      if (sciContainerRef.current && !sciCalcRef.current) {
        try {
          sciCalcRef.current = Desmos.ScientificCalculator(sciContainerRef.current, {
            border: false,
          });
        } catch (e) {
          console.error('Failed to init Desmos Scientific Calculator:', e);
        }
      }

      const trigger = () => {
        if (sciCalcRef.current?.resize) {
          sciCalcRef.current.resize();
        }
      };

      trigger();
      const raf = requestAnimationFrame(trigger);
      const t1 = setTimeout(trigger, 40);
      const t2 = setTimeout(trigger, 150);

      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [activeTab, isOpen, isDesmosReady, size]);

  // 3. ResizeObserver on active container for real-time resizing
  useEffect(() => {
    if (!isOpen || !isDesmosReady) return;
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
  }, [activeTab, isOpen, isDesmosReady]);

  // 4. Memory Cleanup on Unmount
  useEffect(() => {
    return () => {
      if (graphCalcRef.current) {
        try {
          graphCalcRef.current.destroy();
        } catch (e) {
          console.warn('Error destroying Desmos Graphing Calculator:', e);
        }
        graphCalcRef.current = null;
      }
      if (sciCalcRef.current) {
        try {
          sciCalcRef.current.destroy();
        } catch (e) {
          console.warn('Error destroying Desmos Scientific Calculator:', e);
        }
        sciCalcRef.current = null;
      }
    };
  }, []);

  // 5. ESC key to close
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
      const newWidth = next ? Math.min(740, window.innerWidth - 30) : 440;
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

  // If calculator has never been toggled open, do not mount DOM
  if (!isOpen && !hasBeenOpened) return null;

  return (
    <div
      style={
        isMobileScreen
          ? {
              display: isOpen ? 'flex' : 'none',
              zIndex: 99999,
            }
          : {
              display: isOpen ? 'flex' : 'none',
              position: 'fixed',
              left: `${position.x}px`,
              top: `${position.y}px`,
              width: `${size.width}px`,
              height: `${size.height}px`,
              zIndex: 99999,
            }
      }
      className={
        isMobileScreen
          ? "fixed inset-x-0 bottom-0 h-[82vh] w-full flex flex-col bg-white rounded-t-2xl shadow-2xl border-t border-zinc-700 overflow-hidden select-none animate-in slide-in-from-bottom-6 duration-200"
          : "fixed flex flex-col bg-white rounded-xl shadow-2xl border border-gray-700 overflow-hidden select-none animate-in fade-in-50 duration-150"
      }
    >
      {/* 1. Header Bar with Tabs, Drag Handle, Width Toggle & Close Button */}
      <div 
        onMouseDown={!isMobileScreen ? handleDragStart : undefined}
        className="bg-[#1e1e1e] h-11 px-3 flex items-center justify-between select-none text-white rounded-t-xl shrink-0 cursor-move"
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
        className="w-full flex-1 relative overflow-hidden bg-white"
        style={{
          color: '#000',
          backgroundColor: '#ffffff',
          isolation: 'isolate',
          width: '100%',
          minHeight: '380px',
        }}
      >
        {/* Graphing Calculator Container */}
        <div
          ref={graphContainerRef}
          style={{ 
            position: 'absolute',
            inset: 0,
            display: activeTab === 'graphing' ? 'block' : 'none',
            width: '100%',
            height: '100%',
            backgroundColor: '#ffffff',
          }}
          className="bg-white text-black"
        />

        {/* Scientific Calculator Container */}
        <div
          ref={sciContainerRef}
          style={{ 
            position: 'absolute',
            inset: 0,
            display: activeTab === 'scientific' ? 'block' : 'none',
            width: '100%',
            height: '100%',
            backgroundColor: '#ffffff',
          }}
          className="bg-white text-black"
        />

        {/* Loading Overlay */}
        {!isDesmosReady && (
          <div className="absolute inset-0 bg-white flex flex-col items-center justify-center gap-2 text-zinc-600 text-xs z-30">
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
