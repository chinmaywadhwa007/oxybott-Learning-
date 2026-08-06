import React from 'react';
import { motion } from 'framer-motion';
import { cardHover, fadeUp, float } from '../animations/motionVariants';
import { useAppStore } from '../store/useAppStore';
import { ProgressBar } from './ProgressBar';
import { ArrowRight, Code2, Sparkles } from 'lucide-react';

export const LearnerProfileCard: React.FC = () => {
  const { profile, setProfileModalOpen, addXp } = useAppStore();

  return (
    <motion.div
      variants={float}
      initial="initial"
      animate="animate"
      className="relative w-full max-w-[540px] mx-auto"
    >
      {/* Ambient Soft Cyan Radial Glow directly behind dashboard */}
      <div className="absolute -inset-8 rounded-[44px] bg-gradient-to-r from-[#5BE4FF]/25 to-[#1E62EC]/30 blur-3xl opacity-75 pointer-events-none" />

      {/* Main Outer Glass Card Container */}
      <motion.div
        variants={cardHover}
        initial="rest"
        whileHover="hover"
        className="relative w-full rounded-[28px] bg-[#13233A]/95 border border-white/10 p-7 sm:p-8 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.65)] overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] font-extrabold tracking-widest text-[#5BE4FF] uppercase">
            LEARNER PROFILE
          </span>
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#5BE4FF]">
            <Code2 className="w-4 h-4" />
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-sm font-medium text-[#9BA9C2] mb-6">
          XP earned by doing the work
        </p>

        {/* Inner Light Container matching exact screenshot */}
        <div className="rounded-[22px] bg-white p-6 sm:p-7 text-slate-900 shadow-xl border border-slate-100/80">
          {/* Top row inside inner card */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold tracking-wider text-slate-400 uppercase">
              LEARNER LEVEL
            </span>
            <span className="px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600">
              XP {profile.xp}
            </span>
          </div>

          <h4 className="text-[20px] font-bold text-slate-900 mb-5">Keep exploring</h4>

          {/* User Level Badge & Avatar */}
          <div className="flex items-center gap-4 mb-6 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-3xl shadow-md shrink-0">
              👋
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-md bg-[#0F172A] text-white text-[12px] font-black">
                  LVL {profile.level}
                </span>
                <span className="text-[18px] font-extrabold text-slate-900">
                  {profile.levelTitle}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                {Math.max(0, profile.nextLevelXp - profile.xp)} XP to next level
              </p>
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-2.5 mb-5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Progress</span>
              <span>{profile.totalProgressPercentage}%</span>
            </div>
            <ProgressBar progressPercentage={profile.totalProgressPercentage} />
          </div>

          {/* Bottom Action Row matching screenshot */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Tap to view profile
            </span>
            <button
              onClick={() => setProfileModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <span>View</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Quick Demo XP Simulation Trigger */}
        <div className="mt-5 flex items-center justify-between pt-4 border-t border-white/5 text-xs">
          <span className="text-[#9BA9C2]">Simulate activity:</span>
          <button
            onClick={() => addXp(15)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#5BE4FF]/10 text-[#5BE4FF] border border-[#5BE4FF]/20 hover:bg-[#5BE4FF]/20 font-bold transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            +15 XP
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
