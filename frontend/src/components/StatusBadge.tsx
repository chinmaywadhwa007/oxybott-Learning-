import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from '../animations/motionVariants';

export const StatusBadge: React.FC = () => {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0A262C]/90 border border-[#5BE4FF]/30 backdrop-blur-md"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5BE4FF] opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5BE4FF]" />
      </span>
      <span className="text-[11px] font-extrabold tracking-widest text-[#5BE4FF] uppercase">
        HANDS-ON TECH LEARNING FOR CURIOUS MINDS
      </span>
    </motion.div>
  );
};
