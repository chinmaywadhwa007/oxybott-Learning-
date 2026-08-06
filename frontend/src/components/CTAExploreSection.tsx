import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fadeUp } from '../animations/motionVariants';
import { ArrowRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const CTAExploreSection: React.FC = () => {
  const { addXp } = useAppStore();

  return (
    <section className="w-full bg-[#081321] text-white min-h-[460px] py-[100px] lg:py-[120px] px-8 flex items-center justify-center relative overflow-hidden border-t border-white/10">
      {/* Container 1360px Centered */}
      <div className="w-full max-w-[1360px] mx-auto flex flex-col items-center justify-center text-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[900px] mx-auto text-center"
        >
          {/* Top Label */}
          <span className="text-xs font-extrabold tracking-[6px] text-[#6FE8FF] uppercase mb-[24px] block select-none">
            7 PATHS READY TO EXPLORE
          </span>

          {/* Heading (Medium Font Size, Spaced 48px Gap) */}
          <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-black text-white tracking-tight leading-[1.12] mb-[48px] select-none">
            Your next idea deserves <br className="hidden sm:inline" />
            practical skills.
          </h2>

          {/* Primary CTA Link Button */}
          <motion.div
            animate={{
              boxShadow: [
                '0 0 16px rgba(103, 231, 255, 0.3)',
                '0 0 28px rgba(103, 231, 255, 0.45)',
                '0 0 16px rgba(103, 231, 255, 0.3)',
              ],
            }}
            transition={{
              boxShadow: {
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
            className="rounded-[14px]"
          >
            <Link
              to="/visual-programmer"
              onClick={() => addXp(25)}
              className="px-[28px] h-[52px] min-w-[260px] rounded-[14px] bg-[#67E7FF] hover:bg-[#85EAFF] text-[#081321] font-extrabold text-sm transition-colors cursor-pointer select-none inline-flex items-center justify-center gap-[10px] shrink-0 whitespace-nowrap"
            >
              <span>Start Coding Now</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
