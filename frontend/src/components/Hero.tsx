import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { StatusBadge } from './StatusBadge';
import { CodingWorkspace } from './CodingWorkspace';
import { useAppStore } from '../store/useAppStore';
import { staggerContainer, staggerItem, slideRight } from '../animations/motionVariants';
import { ArrowRight } from 'lucide-react';

export const Hero: React.FC = () => {
  const { setProfileModalOpen } = useAppStore();

  return (
    <section className="relative w-full min-h-[760px] pt-[120px] pb-[120px] flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-[1440px] mx-auto px-8 lg:px-12">
        {/* Hero Split Grid: 45% Left / 55% Right on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-[96px] items-center">
          {/* Left Content Column (45% -> 5 cols out of 12) */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="lg:col-span-5 max-w-[560px] flex flex-col items-start space-y-8"
          >
            {/* Status Badge */}
            <motion.div variants={staggerItem}>
              <StatusBadge />
            </motion.div>

            {/* Main Heading Block matching exact text & cyan color split */}
            <div className="space-y-6">
              <motion.h1
                variants={staggerItem}
                className="text-[45px] sm:text-[68px] lg:text-[76px] leading-[1.02] font-black tracking-tight max-w-[560px]"
              >
                <span className="text-white block">Don't just learn</span>
                <span className="text-white block">tech.</span>
                <span className="text-[#5BE4FF] block">Make it do things.</span>
              </motion.h1>

              {/* Subtitle Paragraph */}
              <motion.p
                variants={staggerItem}
                className="text-[20px] leading-[1.55] text-[#9BA9C2] font-normal max-w-[540px]"
              >
                Oxybott turns technology into a hands-on playground: clear guidance, useful feedback, and practical challenges across coding, AI, digital skills, and more.
              </motion.p>
            </div>

            {/* Two Compact Hero CTA Buttons */}
            <motion.div
              variants={staggerItem}
              className="flex flex-col sm:flex-row items-center justify-start gap-[14px] sm:gap-[16px] w-full mt-[28px] sm:mt-[32px] pt-1"
            >
              {/* Primary Cyan Gradient Button */}
              <Link
                to="/visual-programmer"
                className="w-full sm:w-auto px-[24px] sm:px-[28px] h-[48px] sm:h-[52px] rounded-[14px] sm:rounded-[16px] bg-gradient-to-r from-[#63E8FF] to-[#47D7FF] hover:from-[#7AF0FF] hover:to-[#5CE1FF] text-[#081321] font-extrabold text-sm sm:text-base tracking-[-0.01em] shadow-[0_0_20px_rgba(99,232,255,0.35)] hover:shadow-[0_0_30px_rgba(99,232,255,0.55)] hover:-translate-y-[2px] transition-all duration-200 cursor-pointer select-none flex items-center justify-center gap-[10px] shrink-0 whitespace-nowrap group"
              >
                <span>Start learning free</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5] shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              {/* Secondary Outline Glass Button */}
              <button
                onClick={() => setProfileModalOpen(true)}
                className="w-full sm:w-auto px-[24px] sm:px-[28px] h-[48px] sm:h-[52px] rounded-[14px] sm:rounded-[16px] bg-white/[0.03] border-[1.5px] border-white/[0.18] hover:bg-white/[0.08] hover:border-white/40 text-white font-extrabold text-sm sm:text-base tracking-[-0.01em] backdrop-blur-md hover:-translate-y-[2px] transition-all duration-200 cursor-pointer select-none flex items-center justify-center gap-[8px] shrink-0 whitespace-nowrap"
              >
                <span>Explore learning paths</span>
              </button>
            </motion.div>
          </motion.div>

          {/* Right Content Column: Educational Coding Workspace (55% -> 7 cols out of 12) */}
          <motion.div
            variants={slideRight}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 flex justify-center lg:justify-end w-full"
          >
            <CodingWorkspace />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
