import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Bot, Zap, Flame, Terminal, CheckCircle } from 'lucide-react';

export const FloatingDashboardWidgets: React.FC = () => {
  return (
    <div className="relative w-full max-w-lg py-2 select-none">
      {/* Background Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-60 h-60 bg-[#5BE4FF]/20 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-50 h-50 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />

      {/* COMPOSITION CONTAINER */}
      <div className="relative z-10 space-y-3">
        {/* TOP ROW: Code Snippet + XP Card */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Code Snippet Card (7 cols) */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="sm:col-span-7 bg-[#0E1B2E]/90 border border-white/12 rounded-xl p-3 shadow-xl backdrop-blur-xl hover:border-[#5BE4FF]/40 transition-all group"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-rose-500/80" />
                <div className="w-2 h-2 rounded-full bg-amber-500/80" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
              </div>
              <div className="flex items-center gap-1 text-[9px] font-mono text-[#9BA9C2]">
                <Terminal className="w-2.5 h-2.5 text-[#5BE4FF]" />
                <span>main.ts</span>
              </div>
            </div>
            {/* Code Body */}
            <div className="font-mono text-[11px] space-y-0.5 text-slate-300 leading-tight">
              <div>
                <span className="text-[#5BE4FF]">const</span> <span className="text-purple-300">oxybott</span> = <span className="text-amber-300">new</span> <span className="text-emerald-300">OxybottAI</span>();
              </div>
              <div>
                <span className="text-[#5BE4FF]">await</span> oxybott.<span className="text-purple-300">startChallenge</span>({'{'}
              </div>
              <div className="pl-3 text-emerald-400">
                mode: <span className="text-amber-300">&apos;hands_on&apos;</span>, xp: <span className="text-sky-300">50</span>
              </div>
              <div>{'}'});</div>
            </div>
          </motion.div>

          {/* XP Progress Card (5 cols) */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="sm:col-span-5 bg-[#0E1B2E]/90 border border-white/12 rounded-xl p-3 shadow-xl backdrop-blur-xl flex flex-col justify-between hover:border-[#5BE4FF]/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-lg bg-[#5BE4FF]/10 text-[#5BE4FF] border border-[#5BE4FF]/20 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[9px] font-extrabold text-[#5BE4FF] uppercase block tracking-wider">
                    LVL 14
                  </span>
                  <h4 className="text-[11px] font-bold text-white leading-none">Code Pioneer</h4>
                </div>
              </div>
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                +50 XP
              </span>
            </div>

            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[9px] text-[#9BA9C2] font-semibold">
                <span>Progress</span>
                <span className="text-white">2.8k / 3k</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#5BE4FF] to-purple-500 rounded-full w-[88%]" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* MIDDLE ROW: AI Assistant Box */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          className="w-full bg-[#0E1B2E]/90 border border-white/12 rounded-xl p-3 shadow-xl backdrop-blur-xl flex items-start gap-2.5 hover:border-purple-400/40 transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-white flex items-center gap-1">
                Oxybott AI Assistant
                <Sparkles className="w-3 h-3 text-[#5BE4FF]" />
              </span>
              <span className="text-[9px] font-semibold text-slate-400">Just now</span>
            </div>
            <p className="text-[11px] text-[#9BA9C2] leading-relaxed">
              &ldquo;Great logic! Optimize execution with <code className="text-[#5BE4FF] bg-white/[0.05] px-1 py-0.5 rounded">useMemo</code>.&rdquo;
            </p>
          </div>
        </motion.div>

        {/* BOTTOM ROW: Streak Widget + Velocity Graph */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Streak Widget (6 cols) */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
            className="sm:col-span-6 bg-[#0E1B2E]/90 border border-white/12 rounded-xl p-3 shadow-xl backdrop-blur-xl flex items-center justify-between hover:border-amber-400/40 transition-all"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white leading-tight">12 Day Streak</h4>
                <p className="text-[9px] text-[#9BA9C2]">Goal met</p>
              </div>
            </div>

            {/* Weekly Active Day Dots */}
            <div className="flex items-center gap-1">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-0.5">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      idx < 5 ? 'bg-[#5BE4FF] shadow-[0_0_6px_rgba(91,228,255,0.6)]' : 'bg-slate-800'
                    }`}
                  />
                  <span className="text-[8px] text-slate-400 font-semibold">{day}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Velocity Graph (6 cols) */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            className="sm:col-span-6 bg-[#0E1B2E]/90 border border-white/12 rounded-xl p-3 shadow-xl backdrop-blur-xl flex items-center justify-between hover:border-emerald-400/40 transition-all"
          >
            <div className="space-y-0.5">
              <span className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-wider block">
                SPEED & ACCURACY
              </span>
              <h4 className="text-[11px] font-black text-white flex items-center gap-1">
                98.4% Passed
                <CheckCircle className="w-3 h-3 text-emerald-400" />
              </h4>
            </div>

            {/* Mini Sparkline Bar Chart */}
            <div className="flex items-end gap-1 h-6">
              {[40, 65, 55, 80, 95, 75, 100].map((h, idx) => (
                <div
                  key={idx}
                  style={{ height: `${h}%` }}
                  className={`w-1.5 rounded-t-sm ${
                    idx === 6 ? 'bg-[#5BE4FF] shadow-[0_0_6px_rgba(91,228,255,0.6)]' : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
