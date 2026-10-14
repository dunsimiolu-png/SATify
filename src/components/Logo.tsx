import React from 'react';
import { useTheme } from '../utils/theme';

interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'mark' | 'badge' | 'header';
  inverted?: boolean; // true for dark backgrounds (white text), false for light backgrounds (charcoal text)
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  inverted = false,
}) => {
  const { isDark } = useTheme();

  // Size dimensions for icon and text
  const sizeMap = {
    xs: { h: 18, w: 18, textSize: 'text-xs', markH: 'h-4.5', swooshSize: 'w-2 h-2 -top-1 -left-0.5' },
    sm: { h: 24, w: 24, textSize: 'text-sm', markH: 'h-6', swooshSize: 'w-2.5 h-2.5 -top-1.5 -left-0.5' },
    md: { h: 32, w: 32, textSize: 'text-lg', markH: 'h-8', swooshSize: 'w-3 h-3 -top-2 -left-0.5' },
    lg: { h: 44, w: 44, textSize: 'text-2xl', markH: 'h-11', swooshSize: 'w-4 h-4 -top-2.5 -left-1' },
    xl: { h: 64, w: 64, textSize: 'text-4xl', markH: 'h-16', swooshSize: 'w-5 h-5 -top-3.5 -left-1' },
  };

  const { textSize, markH, swooshSize } = sizeMap[size] || sizeMap.md;

  // The official brand mark SVG: Open line-art book with rising checkmark-arrow
  const BrandMark = ({ className: markClass = '' }: { className?: string }) => (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${markH} w-auto aspect-square shrink-0 ${markClass}`}
    >
      {/* Left Page of Open Book */}
      <path
        d="M48 68C38 64 26 64 16 67C15 67.3 14 66.5 14 65.4V36.5C14 35.8 14.5 35.2 15.2 35C24 32.5 37 32.5 48 37"
        stroke="#0077cc"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right Page of Open Book */}
      <path
        d="M52 68C62 64 74 64 84 67C85 67.3 86 66.5 86 65.4V36.5C86 35.8 85.5 35.2 84.8 35C76 32.5 63 32.5 52 37"
        stroke="#0077cc"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Spine Notch Curve */}
      <path
        d="M48 68C49.3 69.5 50.7 69.5 52 68"
        stroke="#0077cc"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Central Rising Checkmark Arrow */}
      <path
        d="M36 44L47 57L74 20"
        stroke="#0077cc"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Arrowhead */}
      <path
        d="M62 18H77V33"
        stroke="#0077cc"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Pure white in Dark Mode or when inverted; dark slate in Light Mode
  const isWhiteText = inverted || isDark;
  const textColorClass = isWhiteText ? 'text-white' : 'text-slate-900 dark:text-white';
  const textStyle = { color: isWhiteText ? '#ffffff' : '#0f172a' };

  // Variant: Header (non-overlapping Bluebook header container with w-8 h-8 SVG icon and HTML SATIFY text)
  if (variant === 'header') {
    return (
      <div className={`inline-flex items-center gap-2 shrink-0 pr-4 mr-4 border-r border-slate-300 dark:border-slate-700 select-none ${className}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8 shrink-0"
        >
          {/* Left Page of Open Book */}
          <path
            d="M48 68C38 64 26 64 16 67C15 67.3 14 66.5 14 65.4V36.5C14 35.8 14.5 35.2 15.2 35C24 32.5 37 32.5 48 37"
            stroke="#0077cc"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Right Page of Open Book */}
          <path
            d="M52 68C62 64 74 64 84 67C85 67.3 86 66.5 86 65.4V36.5C86 35.8 85.5 35.2 84.8 35C76 32.5 63 32.5 52 37"
            stroke="#0077cc"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Spine Notch Curve */}
          <path
            d="M48 68C49.3 69.5 50.7 69.5 52 68"
            stroke="#0077cc"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Central Rising Checkmark Arrow */}
          <path
            d="M36 44L47 57L74 20"
            stroke="#0077cc"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Arrowhead */}
          <path
            d="M62 18H77V33"
            stroke="#0077cc"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span 
          style={textStyle}
          className={`font-sans font-extrabold text-base tracking-tight leading-none ${textColorClass}`}
        >
          SATIFY
        </span>
      </div>
    );
  }

  // Variant: Badge (compact header pill with brand mark and bold wordmark)
  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-transparent select-none ${className}`}>
        <BrandMark />
        <span 
          style={textStyle}
          className={`font-sans font-extrabold text-xs tracking-tight flex items-center leading-none ${textColorClass}`}
        >
          SAT
          <span className="relative inline-block">
            I
            {/* Blue flame/swoosh over the I */}
            <svg
              className="absolute -top-1.5 -left-0.5 w-2 h-2 text-[#0077cc] pointer-events-none"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M8 0C8 4 12 5 12 9C12 12.3 9.3 15 6 15C4.2 15 2.7 14.2 1.7 13C3.5 12.8 5 11.5 5 9.8C5 8.2 3.8 7 3.5 5.5C3.2 4.1 4 2.5 5 1.5C6.2 3.5 7.5 4.5 7.5 6C7.5 6.8 7 7.5 6.5 8C7.5 8 8.5 7.2 8.5 6C8.5 3.5 8 2 8 0Z" />
            </svg>
          </span>
          FY
        </span>
      </div>
    );
  }

  // Variant: Mark only
  if (variant === 'mark') {
    return (
      <div className={`inline-flex items-center justify-center select-none bg-transparent ${className}`}>
        <BrandMark />
      </div>
    );
  }

  // Variant: Full (Book Mark + SATIFY Wordmark)
  return (
    <div className={`inline-flex items-center gap-2.5 select-none bg-transparent ${className}`}>
      <BrandMark />
      <div 
        style={textStyle}
        className={`font-sans font-extrabold ${textSize} tracking-tight ${textColorClass} leading-none flex items-center`}
      >
        <span>SAT</span>
        <span className="relative inline-block">
          <span>I</span>
          {/* Crisp Blue flame/swoosh accent over the I */}
          <svg
            className={`absolute ${swooshSize} text-[#0077cc] pointer-events-none`}
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path d="M8 0C8 4 12 5 12 9C12 12.3 9.3 15 6 15C4.2 15 2.7 14.2 1.7 13C3.5 12.8 5 11.5 5 9.8C5 8.2 3.8 7 3.5 5.5C3.2 4.1 4 2.5 5 1.5C6.2 3.5 7.5 4.5 7.5 6C7.5 6.8 7 7.5 6.5 8C7.5 8 8.5 7.2 8.5 6C8.5 3.5 8 2 8 0Z" />
          </svg>
        </span>
        <span>FY</span>
      </div>
    </div>
  );
};

export default Logo;
