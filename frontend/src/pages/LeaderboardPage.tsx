import React from 'react';
import { motion } from 'framer-motion';
import { LEADERBOARD_USERS } from '../data/leaderboard';
import { fadeUp } from '../animations/motionVariants';
import { Trophy } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const LeaderboardPage: React.FC = () => {
  const { profile } = useAppStore();

  const allUsers = LEADERBOARD_USERS.map((u) =>
    u.name.includes('(You)')
      ? { ...u, xp: profile.xp, level: profile.levelTitle }
      : u
  ).sort((a, b) => b.xp - a.xp);

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="w-full min-h-screen pt-28 pb-20 max-w-[1440px] mx-auto px-6 lg:px-12 space-y-10"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-extrabold uppercase tracking-wider mb-3">
            <Trophy className="w-4 h-4" />
            Global Learner Rankings
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Oxybott Leaderboard</h1>
          <p className="text-base text-[#9BA9C2] mt-2">
            Top active developers completing lessons, solving challenges, and earning experience points.
          </p>
        </div>
      </div>

      {/* Leaderboard Table Container */}
      <div className="rounded-3xl bg-[#18283D]/80 border border-white/10 overflow-hidden backdrop-blur-xl shadow-glass">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-xs font-bold text-[#9BA9C2] uppercase tracking-wider">
              <th className="py-4 px-6">Rank</th>
              <th className="py-4 px-6">Learner</th>
              <th className="py-4 px-6">Level</th>
              <th className="py-4 px-6">Badges</th>
              <th className="py-4 px-6 text-right">XP Earned</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm font-semibold text-white">
            {allUsers.map((user, idx) => {
              const isCurrentUser = user.name.includes('(You)');
              return (
                <tr
                  key={user.name}
                  className={`transition-colors hover:bg-white/5 ${
                    isCurrentUser ? 'bg-[#5BE4FF]/10 font-bold border-l-4 border-l-[#5BE4FF]' : ''
                  }`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {idx === 0 && <span className="text-xl">🥇</span>}
                      {idx === 1 && <span className="text-xl">🥈</span>}
                      {idx === 2 && <span className="text-xl">🥉</span>}
                      <span className="font-extrabold text-[#5BE4FF]">#{idx + 1}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-1.5 rounded-xl bg-white/10">{user.avatar}</span>
                      <span className={isCurrentUser ? 'text-[#5BE4FF] font-extrabold' : 'text-white'}>
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#9BA9C2]">
                      {user.level}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {user.badges.map((b) => (
                        <span
                          key={b}
                          className="px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right font-extrabold text-base text-[#5BE4FF]">
                    {user.xp} XP
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
