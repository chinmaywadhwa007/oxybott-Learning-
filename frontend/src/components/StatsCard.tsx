import React from 'react';
import { motion } from 'framer-motion';
import { StatItem } from './StatItem';
import { cardHover } from '../animations/motionVariants';
import { useAppStore } from '../store/useAppStore';

export const StatsCard: React.FC = () => {
  const { profile } = useAppStore();

  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      animate="visible"
      whileHover="hover"
      className="w-full h-[110px] rounded-[24px] bg-[#13233A]/90 border border-white/10 backdrop-blur-xl shadow-[0_15px_35px_rgba(0,0,0,0.5)] grid grid-cols-3 divide-x divide-white/5 overflow-hidden transition-all duration-300"
    >
      <StatItem value={profile.learningPathsCount} label="Learning paths" />
      <StatItem value={profile.lessonsClearedCount} label="Lessons cleared" />
      <StatItem value={profile.totalProgressPercentage} suffix="%" label="Total progress" />
    </motion.div>
  );
};
