import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cardHover, staggerContainer } from '../animations/motionVariants';
import { ArrowRight, Check } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface DirectionGoal {
  id: string;
  badge: string;
  badgeBg: string;
  title: string;
  description: string;
  recommendedPath: {
    title: string;
    description: string;
    level: string;
    lessons: number;
    hours: number;
  };
}

const GOALS: DirectionGoal[] = [
  {
    id: 'games',
    badge: 'GAME',
    badgeBg: 'bg-[#0B1727]',
    title: 'Build games',
    description: 'Learn logic by making things move, react, and keep score.',
    recommendedPath: {
      title: 'Game Logic Starter',
      description: 'Master canvas mechanics, collision detection, and score state.',
      level: 'Beginner',
      lessons: 8,
      hours: 3,
    },
  },
  {
    id: 'ai',
    badge: 'AI',
    badgeBg: 'bg-[#0B1727]',
    title: 'Understand AI',
    description: 'Explore models, data, responsible AI, and intelligent systems.',
    recommendedPath: {
      title: 'AI Fundamentals',
      description: 'Learn how modern LLMs process tokens, data, and intelligent flows.',
      level: 'Beginner',
      lessons: 5,
      hours: 2,
    },
  },
  {
    id: 'python',
    badge: 'PY',
    badgeBg: 'bg-[#0B1727]',
    title: 'Learn Python',
    description: 'Start writing programs and build confidence one challenge at a time.',
    recommendedPath: {
      title: 'Python Essentials',
      description: 'Write clean Python code, functions, data structures, and scripts.',
      level: 'Beginner',
      lessons: 10,
      hours: 4,
    },
  },
  {
    id: 'tech',
    badge: 'TECH',
    badgeBg: 'bg-blue-600',
    title: 'Improve tech skills',
    description: 'Build broad confidence with practical technology concepts.',
    recommendedPath: {
      title: 'AI Explorers',
      description: 'This path is a welcoming place to build broader technical confidence before specialising.',
      level: 'Beginner',
      lessons: 6,
      hours: 2,
    },
  },
];

export const DirectionSelector: React.FC = () => {
  const [selectedGoalId, setSelectedGoalId] = useState<string>('tech');
  const { setProfileModalOpen, addXp } = useAppStore();

  const activeGoal = GOALS.find((g) => g.id === selectedGoalId) || GOALS[3];

  return (
    <section className="w-full bg-white text-slate-900 pt-[120px] pb-[120px] border-t border-b border-slate-200 min-h-[85vh] flex items-center justify-center">
      {/* Container 1360px Centered */}
      <div className="w-full max-w-[1360px] mx-auto px-8">
        {/* Balanced Centered Grid: Left 480px / Right minmax(720px, 1fr), Gap 72px */}
        <div className="grid grid-cols-1 lg:grid-cols-[480px_minmax(720px,1fr)] gap-[72px] items-center justify-center">
          {/* Left Column (480px Fixed Width) */}
          <div className="w-full max-w-[480px]">
            {/* Label */}
            <span className="text-xs font-extrabold tracking-widest text-sky-600 uppercase mb-[24px] block">
              CHOOSE YOUR FIRST DIRECTION
            </span>

            {/* Heading */}
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-[32px]">
              What would you like to do?
            </h2>

            {/* Description */}
            <p className="text-slate-600 text-base sm:text-lg leading-[1.6]">
              Pick one goal and Oxybott will recommend the strongest place to begin. You can change it anytime.
            </p>
          </div>

          {/* Right Column (minmax(720px, 1fr) - Flex column with 20px gap between grid and recommendation panel) */}
          <div className="w-full flex flex-col gap-[20px]">
            {/* 2x2 Grid of Cards (Gap 16px, Min-Height 92px) */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] w-full"
            >
              {GOALS.map((goal) => {
                const isSelected = selectedGoalId === goal.id;
                return (
                  <motion.div
                    key={goal.id}
                    variants={cardHover}
                    initial="rest"
                    whileHover="hover"
                    onClick={() => setSelectedGoalId(goal.id)}
                    className={`w-full min-h-[92px] rounded-[14px] border p-[14px] transition-all duration-200 cursor-pointer flex items-start gap-[12px] select-none ${
                      isSelected
                        ? 'bg-sky-50/70 border-2 border-sky-500 shadow-md ring-2 ring-sky-500/20'
                        : 'bg-white border-black/[0.08] hover:bg-slate-50 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-extrabold text-[11px] text-white shrink-0 shadow-sm ${
                        isSelected ? 'bg-sky-600' : goal.badgeBg
                      }`}
                    >
                      {goal.badge}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-bold text-slate-900 text-sm flex items-center gap-[6px] truncate">
                        <span>{goal.title}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 stroke-[3] shrink-0" />}
                      </h3>
                      <p className="text-[11px] text-slate-600 mt-[4px] leading-snug line-clamp-2">
                        {goal.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Recommendation Card: Ultra-Compact (Min-Height 110px, Py-16px Px-24px, 36px Flex Gap) */}
            <div className="w-full min-h-[110px] rounded-[16px] bg-[#06101E] border border-slate-800 py-[16px] px-[24px] shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-[36px]">
              <div className="flex flex-col justify-center space-y-[4px] flex-1 pr-[12px]">
                <span className="text-[10px] font-extrabold tracking-widest text-[#5BE4FF] uppercase block">
                  YOUR RECOMMENDED START
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  {activeGoal.recommendedPath.title}
                </h3>
                <p className="text-[#9BA9C2] text-xs leading-relaxed max-w-xl">
                  {activeGoal.recommendedPath.description}
                </p>
              </div>

              {/* Start This Path Button */}
              <Link
                to="/visual-programmer"
                onClick={() => addXp(20)}
                className="px-[20px] h-[44px] rounded-[12px] bg-[#5BE4FF] text-[#091320] font-extrabold text-xs shadow-[0_0_18px_rgba(91,228,255,0.3)] hover:bg-[#7AE8FF] hover:shadow-[0_0_24px_rgba(91,228,255,0.5)] transition-all duration-200 cursor-pointer shrink-0 flex items-center justify-center gap-[8px] select-none whitespace-nowrap"
              >
                <span>Start this path</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

