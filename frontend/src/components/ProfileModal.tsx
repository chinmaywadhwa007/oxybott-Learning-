import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { ProgressBar } from './ProgressBar';
import { Button } from './Button';
import { Award, BookOpen, CheckCircle2, Sparkles, Trophy, X } from 'lucide-react';

export const ProfileModal: React.FC = () => {
  const { isProfileModalOpen, setProfileModalOpen, profile, addXp } = useAppStore();

  if (!isProfileModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setProfileModalOpen(false)}
          className="absolute inset-0 bg-[#091320]/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', mass: 0.7, stiffness: 120, damping: 20 }}
          className="relative w-full max-w-xl rounded-3xl bg-[#13233A] border border-white/15 p-6 sm:p-8 shadow-2xl z-10 space-y-6 overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={() => setProfileModalOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 border border-white/10 text-[#9BA9C2] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-4 pt-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-3xl shadow-lg">
              👋
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-extrabold text-white">{profile.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#5BE4FF]/20 text-[#5BE4FF] text-xs font-bold border border-[#5BE4FF]/30">
                  LVL {profile.level}
                </span>
              </div>
              <p className="text-sm font-semibold text-[#9BA9C2]">{profile.levelTitle} Learner</p>
            </div>
          </div>

          {/* XP & Level Progress */}
          <div className="p-5 rounded-2xl bg-[#18283D] border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-white">Experience Points</span>
              <span className="text-[#5BE4FF]">
                {profile.xp} / {profile.nextLevelXp} XP
              </span>
            </div>
            <ProgressBar progressPercentage={profile.totalProgressPercentage} />
            <p className="text-xs text-[#9BA9C2]">
              Complete lessons or click the button below to earn experience points and level up!
            </p>
          </div>

          {/* Stats Summary Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-[#18283D]/60 border border-white/5 text-center">
              <BookOpen className="w-5 h-5 text-[#5BE4FF] mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{profile.learningPathsCount}</div>
              <div className="text-[11px] text-[#9BA9C2]">Paths Enrolled</div>
            </div>
            <div className="p-4 rounded-xl bg-[#18283D]/60 border border-white/5 text-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{profile.lessonsClearedCount}</div>
              <div className="text-[11px] text-[#9BA9C2]">Lessons Done</div>
            </div>
            <div className="p-4 rounded-xl bg-[#18283D]/60 border border-white/5 text-center">
              <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{profile.totalProgressPercentage}%</div>
              <div className="text-[11px] text-[#9BA9C2]">Overall Rate</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="primary"
              size="md"
              icon={<Sparkles className="w-4 h-4" />}
              onClick={() => addXp(25)}
            >
              Earn +25 XP
            </Button>
            <Button variant="outline" size="md" onClick={() => setProfileModalOpen(false)}>
              Close Profile
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
