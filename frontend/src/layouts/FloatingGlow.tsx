import React from 'react';
import { motion } from 'framer-motion';
import { glow } from '../animations/motionVariants';

export const FloatingGlow: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Glow Behind Dashboard Card on Right */}
      <motion.div
        variants={glow}
        initial="initial"
        animate="animate"
        className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full bg-[#5BE4FF]/10 blur-[100px]"
      />

      {/* Deep Blue Ambient Glow Top Left */}
      <motion.div
        variants={glow}
        initial="initial"
        animate="animate"
        className="absolute top-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-[#1E62EC]/15 blur-[120px]"
      />
    </div>
  );
};
