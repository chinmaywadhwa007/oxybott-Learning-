import React from 'react';

export const OxybottLogo: React.FC<{ className?: string; showText?: boolean }> = ({ className = 'w-5 h-5', showText = true }) => {
  if (!showText) {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="8 6 2 12 8 18" />
        <line x1="14" y1="4" x2="10" y2="20" />
        <polyline points="16 18 22 12 16 6" />
      </svg>
    );
  }

  return (
    <div className="flex items-center gap-3 group cursor-pointer select-none">
      {/* Cube with rounded corners */}
      <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-[#0B1524] border border-[#5BE4FF]/50 shadow-[0_0_20px_rgba(91,228,255,0.3)] transition-all duration-300 group-hover:scale-105 group-hover:border-[#5BE4FF] group-hover:shadow-[0_0_26px_rgba(91,228,255,0.5)]">
        <svg
          className={`${className} text-[#5BE4FF]`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="8 6 2 12 8 18" />
          <line x1="14" y1="4" x2="10" y2="20" />
          <polyline points="16 18 22 12 16 6" />
        </svg>
      </div>
      <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-[#5BE4FF] transition-colors">
        Oxybott
      </span>
    </div>
  );
};

export const AceCodeLogo = OxybottLogo;


