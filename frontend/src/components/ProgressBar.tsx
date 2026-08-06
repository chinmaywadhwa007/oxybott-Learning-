import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progressPercentage: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progressPercentage, className = '' }) => {
  return (
    <div className={`w-full h-2 rounded-full bg-slate-200/80 overflow-hidden ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progressPercentage}%` }}
        transition={{ type: 'spring', mass: 0.7, stiffness: 120, damping: 20 }}
        className="h-full bg-gradient-to-r from-[#1E62EC] to-[#5BE4FF] rounded-full shadow-[0_0_12px_rgba(91,228,255,0.6)]"
      />
    </div>
  );
};
