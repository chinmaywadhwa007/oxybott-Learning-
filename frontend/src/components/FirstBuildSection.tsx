import React from 'react';
import { motion } from 'framer-motion';
import { cardHover, staggerContainer } from '../animations/motionVariants';
import { ArrowRight, Clock, Sparkles, Puzzle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const FirstBuildSection: React.FC = () => {
  const { setProfileModalOpen, addXp } = useAppStore();

  return (
    <section className="w-full bg-[#F8FAFC] text-slate-900 py-[120px] border-t border-b border-slate-200/80 min-h-[85vh] flex items-center justify-center">
      {/* Container 1360px Centered */}
      <div className="w-full max-w-[1360px] mx-auto px-8">
        {/* Balanced Centered Grid: Left 480px / Right minmax(720px, 1fr), Gap 72px */}
        <div className="grid grid-cols-1 lg:grid-cols-[480px_minmax(720px,1fr)] gap-[72px] items-center justify-center">
          {/* Left Content Column (480px Fixed Width) */}
          <div className="w-full max-w-[480px]">
            {/* Label (24px gap to Heading) */}
            <span className="text-xs font-extrabold tracking-widest text-blue-600 uppercase mb-[24px] block">
              CHOOSE YOUR FIRST BUILD
            </span>

            {/* Heading (32px gap to Description) */}
            <h2 className="text-4xl sm:text-[50px] font-black text-slate-900 tracking-tight leading-[1.1] mb-[32px]">
              Learn a skill. Use it immediately.
            </h2>

            {/* Description (32px gap to Link Button) */}
            <p className="text-slate-600 text-base sm:text-lg leading-[1.65] mb-[32px]">
              Every path combines plain-English explanations with activities, quizzes, and practical tasks. Coding tools appear where they genuinely help.
            </p>

            {/* Link Button */}
            <button
              onClick={() => setProfileModalOpen(true)}
              className="inline-flex items-center gap-[8px] text-blue-600 hover:text-blue-700 font-extrabold text-base transition-colors group cursor-pointer"
            >
              <span>Browse the full catalogue</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Right Cards Column (minmax(720px, 1fr) - 2 Path Cards Side-by-Side, 24px Gap) */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="w-full grid grid-cols-1 sm:grid-cols-2 gap-[24px]"
          >
            {/* Card 1: AI Explorers */}
            <motion.div
              variants={cardHover}
              initial="rest"
              whileHover="hover"
              className="bg-white rounded-[20px] border border-slate-200/90 shadow-sm flex flex-col justify-between relative overflow-hidden select-none min-h-[350px]"
            >
              <div className="p-[20px]">
                {/* Top Row: Icon & Status Pill */}
                <div className="flex items-center justify-between mb-[16px]">
                  <div className="w-10 h-10 rounded-xl bg-[#0F172A] flex items-center justify-center text-white shadow-sm">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="inline-flex items-center gap-[6px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    Ready to start
                  </span>
                </div>

                {/* Level & Lessons Tag */}
                <div className="text-[10px] font-extrabold tracking-wider text-blue-600 uppercase mb-[6px]">
                  BEGINNER · 6 LESSONS
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-extrabold text-slate-900 mb-[6px]">
                  AI Explorers
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-[14px]">
                  Discover how artificial intelligence learns, where it appears in everyday technology, and how to use it responsibly.
                </p>

                {/* Hash Tags */}
                <div className="flex flex-wrap gap-[6px]">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[11px]">#ai</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[11px]">#beginner</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[11px]">#technology</span>
                </div>
              </div>

              <div>
                {/* Duration Info */}
                <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-[12px] px-[20px] mb-[14px]">
                  <div className="flex items-center gap-[6px]">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>2 hours</span>
                  </div>
                  <span>·</span>
                  <span>Hands-on</span>
                </div>

                {/* Full Width Bottom Cyan Button */}
                <button
                  onClick={() => {
                    addXp(15);
                    setProfileModalOpen(true);
                  }}
                  className="w-full h-[44px] bg-[#5BE4FF] hover:bg-[#7AE8FF] text-[#091320] font-extrabold text-xs transition-colors flex items-center justify-center gap-[6px] cursor-pointer"
                >
                  <span>Start path</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </motion.div>

            {/* Card 2: Block Coding Basics */}
            <motion.div
              variants={cardHover}
              initial="rest"
              whileHover="hover"
              className="bg-white rounded-[20px] border border-slate-200/90 shadow-sm flex flex-col justify-between relative overflow-hidden select-none min-h-[350px]"
            >
              <div className="p-[20px]">
                {/* Top Row: Icon & Status Pill */}
                <div className="flex items-center justify-between mb-[16px]">
                  <div className="w-10 h-10 rounded-xl bg-[#0F172A] flex items-center justify-center text-white shadow-sm">
                    <Puzzle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="inline-flex items-center gap-[6px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    Ready to start
                  </span>
                </div>

                {/* Level & Lessons Tag */}
                <div className="text-[10px] font-extrabold tracking-wider text-blue-600 uppercase mb-[6px]">
                  BEGINNER · 8 LESSONS
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-extrabold text-slate-900 mb-[6px]">
                  Block Coding Basics
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-[14px]">
                  Learn to code by snapping blocks together — no typing needed! Perfect for young coders taking their very first steps.
                </p>

                {/* Hash Tags */}
                <div className="flex flex-wrap gap-[6px]">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[11px]">#blocks</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[11px]">#scratch-style</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[11px]">#beginner</span>
                </div>
              </div>

              <div>
                {/* Duration Info */}
                <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-[12px] px-[20px] mb-[14px]">
                  <div className="flex items-center gap-[6px]">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>2.5 hours</span>
                  </div>
                  <span>·</span>
                  <span>Hands-on</span>
                </div>

                {/* Full Width Bottom Cyan Button */}
                <button
                  onClick={() => {
                    addXp(15);
                    setProfileModalOpen(true);
                  }}
                  className="w-full h-[44px] bg-[#5BE4FF] hover:bg-[#7AE8FF] text-[#091320] font-extrabold text-xs transition-colors flex items-center justify-center gap-[6px] cursor-pointer"
                >
                  <span>Start path</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
