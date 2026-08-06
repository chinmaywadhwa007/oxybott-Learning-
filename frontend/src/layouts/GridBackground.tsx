import React from 'react';

export const GridBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Dark Navy Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#091320] via-[#0b1727] to-[#091320]" />

      {/* Subtle Grid Overlay Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 mask-radial-gradient" />
    </div>
  );
};
