import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Calculator, Activity, ArrowDownRight } from 'lucide-react';

interface CalculatorModalProps {
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

export const CalculatorModal: React.FC<CalculatorModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'graphing' | 'scientific'>('graphing');

  // Floating Window Geometry
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 380,
    height: 560,
  });
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    const defaultX = Math.max(20, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 410);
    return { x: defaultX, y: 72 };
  });

  // Dragging & Resizing States
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
    initialWidth: 380,
    initialHeight: 560,
  });

  // Desmos DOM Elements & Instances
  const graphContainerRef = useRef<HTMLDivElement>(null);
  const sciContainerRef = useRef<HTMLDivElement>(null);
  const graphCalcRef = useRef<any>(null);
  const sciCalcRef = useRef<any>(null);
  const [isDesmosReady, setIsDesmosReady] = useState<boolean>(false);

  // Initialize Desmos instances when API is available
  useEffect(() => {
    const initDesmos = () => {
      if (!window.Desmos) return false;

      // Initialize Graphing Calculator
      if (graphContainerRef.current && !graphCalcRef.current) {
        try {
          graphCalcRef.current = window.Desmos.GraphingCalculator(graphContainerRef.current, {
            keypad: true,
            expressions: true,
            settingsMenu: true,
            zoomButtons: true,
            border: false,
          });
        } catch (e) {
          console.error("Failed to initialize Desmos Graphing:", e);
        }
      }

      // Initialize Scientific Calculator
      if (sciContainerRef.current && !sciCalcRef.current) {
        try {
          sciCalcRef.current = window.Desmos.ScientificCalculator(sciContainerRef.current, {
            border: false,
          });
        } catch (e) {
          console.error("Failed to initialize Desmos Scientific:", e);
        }
      }

      setIsDesmosReady(true);
      return true;
    };

    if (!initDesmos()) {
      const interval = setInterval(() => {
        if (initDesmos()) {
          clearInterval(interval);
        }
      }, 250);
      return () => clearInterval(interval);
    }
  }, []);

  // Resize active instance whenever tab changes or modal opens
  useEffect(() => {
    if (!isOpen || !isDesmosReady) return;
    const timer = setTimeout(() => {
      if (activeTab === 'graphing' && graphCalcRef.current) {
        graphCalcRef.current.resize();
      } else if (activeTab === 'scientific' && sciCalcRef.current) {
        sciCalcRef.current.resize();
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [activeTab, isOpen, isDesmosReady]);

  // Handle Dragging
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

  // Handle Resizing
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
      const newWidth = Math.max(320, Math.min(window.innerWidth - position.x - 10, resizeStartRef.current.initialWidth + deltaX));
      const newHeight = Math.max(420, Math.min(window.innerHeight - position.y - 10, resizeStartRef.current.initialHeight + deltaY));
      setSize({ width: newWidth, height: newHeight });

      // Resize active calculator
      if (activeTab === 'graphing' && graphCalcRef.current) {
        graphCalcRef.current.resize();
      } else if (activeTab === 'scientific' && sciCalcRef.current) {
        sciCalcRef.current.resize();
      }
    }
  }, [isDragging, isResizing, size.width, size.height, position.x, position.y, activeTab]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) setIsDragging(false);
    if (isResizing) {
      setIsResizing(false);
      // Final resize call
      if (activeTab === 'graphing' && graphCalcRef.current) {
        graphCalcRef.current.resize();
      } else if (activeTab === 'scientific' && sciCalcRef.current) {
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

  return (
    <div
      style={{
        display: isOpen ? 'flex' : 'none',
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
      className="z-50 flex-col bg-white rounded-lg shadow-2xl border border-gray-700 overflow-visible select-none animate-in fade-in-50 duration-150"
    >
      {/* 1. Exact Dark Header Bar (bg-[#1e1e1e] h-11 px-3 flex items-center justify-between) */}
      <div className="bg-[#1e1e1e] h-11 px-3 flex items-center justify-between select-none text-white rounded-t-lg flex-shrink-0">
        {/* Left: Graphing | Scientific Toggle */}
        <div className="border border-gray-400 rounded-md overflow-hidden flex items-center text-xs font-bold">
          <button
            onClick={() => setActiveTab('graphing')}
            className={`flex items-center gap-1.5 transition-colors ${
              activeTab === 'graphing'
                ? 'bg-white text-black underline decoration-1 underline-offset-2 px-2.5 py-1'
                : 'bg-[#1e1e1e] text-white px-2.5 py-1 hover:bg-white/10'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Graphing</span>
          </button>
          <button
            onClick={() => setActiveTab('scientific')}
            className={`flex items-center gap-1.5 transition-colors ${
              activeTab === 'scientific'
                ? 'bg-white text-black underline decoration-1 underline-offset-2 px-2.5 py-1'
                : 'bg-[#1e1e1e] text-white px-2.5 py-1 hover:bg-white/10'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Scientific</span>
          </button>
        </div>

        {/* Center: 6-Dot Drag Grip */}
        <div
          onMouseDown={handleDragStart}
          className="grid grid-cols-3 gap-1 cursor-move p-2 hover:bg-white/10 rounded transition"
          title="Drag to reposition calculator"
        >
          <div className="w-1 h-1 bg-white rounded-full" />
          <div className="w-1 h-1 bg-white rounded-full" />
          <div className="w-1 h-1 bg-white rounded-full" />
          <div className="w-1 h-1 bg-white rounded-full" />
          <div className="w-1 h-1 bg-white rounded-full" />
          <div className="w-1 h-1 bg-white rounded-full" />
        </div>

        {/* Right: Close Button */}
        <button
          onClick={onClose}
          className="text-white hover:opacity-75 cursor-pointer p-1 rounded hover:bg-white/10 transition"
          title="Close calculator (expressions preserved)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Body with Dual Desmos Mount Points */}
      <div className="flex-1 w-full relative bg-white overflow-hidden rounded-b-lg">
        {/* Graphing Calculator Container */}
        <div
          ref={graphContainerRef}
          style={{ display: activeTab === 'graphing' ? 'block' : 'none' }}
          className="w-full h-full"
        />

        {/* Scientific Calculator Container */}
        <div
          ref={sciContainerRef}
          style={{ display: activeTab === 'scientific' ? 'block' : 'none' }}
          className="w-full h-full"
        />

        {/* Loading overlay if Desmos API is downloading */}
        {!isDesmosReady && (
          <div className="absolute inset-0 bg-white flex flex-col items-center justify-center gap-2 text-gray-500 text-xs">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-[#0050d8] rounded-full animate-spin" />
            <span>Loading Desmos Calculator...</span>
          </div>
        )}
      </div>

      {/* 3. Bottom-Right Circular Resize Handle */}
      <div
        onMouseDown={handleResizeStart}
        className="w-7 h-7 rounded-full bg-white border border-gray-300 shadow-md flex items-center justify-center cursor-nwse-resize absolute -bottom-3 -right-3 z-20 hover:scale-110 active:scale-95 transition-transform"
        title="Drag to resize calculator"
      >
        <ArrowDownRight className="w-4 h-4 text-gray-700" />
      </div>
    </div>
  );
};
