import React from 'react';
import { motion } from 'framer-motion';
import { fadeDown } from '../animations/motionVariants';
import { ArrowRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const BannerNotice: React.FC = () => {
  const { setViewMode } = useAppStore();

  return (
    <motion.div
      variants={fadeDown}
      initial="hidden"
      animate="visible"
      onClick={() => setViewMode('explorer')}
      className="w-full max-w-[1376px] mx-auto mb-10 p-4 sm:p-5 px-6 sm:px-8 rounded-2xl bg-gradient-to-r from-[#E7F8FD] via-[#EEFAFE] to-[#E5F6FC] border border-[#BFEBF6] shadow-[0_8px_30px_rgba(91,228,255,0.12)] flex items-center justify-between gap-6 cursor-pointer group hover:shadow-[0_12px_40px_rgba(91,228,255,0.22)] transition-all duration-300"
    >
      <div className="flex items-center gap-5">
        {/* Map Icon Pill */}
        <div className="w-11 h-11 rounded-xl bg-white border border-[#D0F2FA] flex items-center justify-center text-xl shrink-0 shadow-sm group-hover:scale-105 transition-transform">
          🗺️
        </div>
        <div className="space-y-0.5">
          <h4 className="font-extrabold text-[#0B1727] text-[16px] group-hover:text-[#0284C7] transition-colors leading-snug">
            Try Explorer Mode!
          </h4>
          <p className="text-xs sm:text-sm font-medium text-[#475569] hidden sm:block">
            Explore the Oxybott world map — walk between islands and complete coding quests.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[#0B1727] group-hover:text-[#0284C7] font-semibold text-sm group-hover:translate-x-1 transition-all shrink-0">
        <ArrowRight className="w-5 h-5 stroke-[2.5]" />
      </div>
    </motion.div>
  );
};
