import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, staggerItem } from '../animations/motionVariants';
import { Button } from '../components/Button';
import { useAppStore } from '../store/useAppStore';
import { Compass, MapPin, Play, ShieldCheck, Sparkles, Trophy } from 'lucide-react';

export const ExplorerPage: React.FC = () => {
  const { addXp, setProfileModalOpen } = useAppStore();
  const [selectedIsland, setSelectedIsland] = useState<string>('island-1');

  const islands = [
    {
      id: 'island-1',
      name: 'Variables & Data Types Isle',
      level: '1',
      status: 'Unlocked',
      icon: '🏝️',
      description: 'Master primitive primitives, immutability, type assertions, and scopes.',
      questsCount: 5,
      xpReward: 50,
      coordinates: 'x: 20%, y: 30%',
    },
    {
      id: 'island-2',
      name: 'Component Archipelago',
      level: '2',
      status: 'In Progress',
      icon: '⛰️',
      description: 'Build functional components, custom hooks, and composition patterns.',
      questsCount: 8,
      xpReward: 100,
      coordinates: 'x: 55%, y: 25%',
    },
    {
      id: 'island-3',
      name: 'Async State Citadel',
      level: '3',
      status: 'Locked',
      icon: '🏰',
      description: 'Conquer promises, async/await, fetching, caching, and optimistic UI updates.',
      questsCount: 12,
      xpReward: 200,
      coordinates: 'x: 75%, y: 65%',
    },
  ];

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="w-full min-h-screen pt-28 pb-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-3xl bg-[#13233A]/80 border border-[#5BE4FF]/20 backdrop-blur-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5BE4FF]/10 text-[#5BE4FF] text-xs font-extrabold uppercase tracking-wider mb-3">
            <Compass className="w-4 h-4" />
            Explorer Mode World Map
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
            Walk between islands & complete quests
          </h1>
          <p className="text-sm sm:text-base text-[#9BA9C2] mt-2 max-w-2xl">
            Interactive gamified island map. Click an island to preview active coding quests and earn XP.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          icon={<Sparkles className="w-5 h-5" />}
          onClick={() => {
            addXp(50);
            setProfileModalOpen(true);
          }}
        >
          Claim Daily Quest (+50 XP)
        </Button>
      </div>

      {/* World Map Graphical Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Interactive Map Canvas Mockup */}
        <div className="lg:col-span-8 relative h-[480px] rounded-3xl bg-[#0b1727] border border-white/10 overflow-hidden bg-grid-pattern flex items-center justify-center p-8">
          {/* Animated Connecting Pathways */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
            <line x1="25%" y1="35%" x2="55%" y2="30%" stroke="#5BE4FF" strokeWidth="3" strokeDasharray="6 6" />
            <line x1="55%" y1="30%" x2="75%" y2="65%" stroke="#9BA9C2" strokeWidth="2" strokeDasharray="4 4" />
          </svg>

          {/* Island Nodes */}
          {islands.map((island, idx) => (
            <motion.div
              key={island.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedIsland(island.id)}
              className={`absolute cursor-pointer flex flex-col items-center group ${
                idx === 0 ? 'top-[25%] left-[18%]' : idx === 1 ? 'top-[20%] left-[50%]' : 'top-[60%] left-[70%]'
              }`}
            >
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-2xl border transition-all duration-300 ${
                  selectedIsland === island.id
                    ? 'bg-[#5BE4FF] text-black border-white shadow-[0_0_30px_rgba(91,228,255,0.6)] scale-110'
                    : 'bg-[#18283D] border-white/15 text-white group-hover:border-[#5BE4FF]'
                }`}
              >
                {island.icon}
              </div>
              <span className="mt-2 text-xs font-bold text-white bg-[#091320]/90 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                LVL {island.level} • {island.name.split(' ')[0]}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Selected Island Quest Sidebar Detail */}
        <div className="lg:col-span-4 rounded-3xl bg-[#18283D]/80 border border-white/10 p-6 backdrop-blur-xl flex flex-col justify-between">
          {(() => {
            const active = islands.find((i) => i.id === selectedIsland) || islands[0];
            return (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-4xl">{active.icon}</span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                    {active.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white">{active.name}</h3>
                  <p className="text-sm text-[#9BA9C2] mt-2 leading-relaxed">{active.description}</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#9BA9C2]">Active Quests:</span>
                    <span className="font-bold text-white">{active.questsCount} coding tasks</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#9BA9C2]">Completion Bonus:</span>
                    <span className="font-bold text-[#5BE4FF]">+{active.xpReward} XP</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-center"
                  icon={<Play className="w-4 h-4 fill-current" />}
                  onClick={() => {
                    addXp(active.xpReward);
                    setProfileModalOpen(true);
                  }}
                >
                  Enter Island Quests
                </Button>
              </div>
            );
          })()}
        </div>
      </div>
    </motion.div>
  );
};
