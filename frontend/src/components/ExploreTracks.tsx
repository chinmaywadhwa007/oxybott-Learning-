import React from 'react';
import { motion } from 'framer-motion';
import { cardHover, staggerContainer, staggerItem } from '../animations/motionVariants';
import { useAppStore } from '../store/useAppStore';

interface TrackItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
}

const TRACKS: TrackItem[] = [
  {
    id: 'python',
    badge: 'PY',
    title: 'Python',
    subtitle: 'Logic, syntax, and real programs',
  },
  {
    id: 'ai',
    badge: 'AI',
    title: 'AI',
    subtitle: 'Understand intelligent systems',
  },
  {
    id: 'web',
    badge: 'JS',
    title: 'Web',
    subtitle: 'Build for the browser',
  },
  {
    id: 'projects',
    badge: '{}',
    title: 'Projects',
    subtitle: 'Turn skills into things',
  },
];

export const ExploreTracks: React.FC = () => {
  const { setProfileModalOpen, addXp } = useAppStore();

  return (
    <section className="w-full bg-white text-slate-900 py-16 px-6 lg:px-12 border-t border-slate-100">
      <div className="max-w-[1440px] mx-auto space-y-8">
        {/* Section Header */}
        <div className="space-y-2">
          <span className="text-xs font-extrabold tracking-widest text-sky-600 uppercase">
            EXPLORE BY TRACK
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            What do you want to make?
          </h2>
        </div>

        {/* 4 Track Cards Row */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {TRACKS.map((track) => (
            <motion.div
              key={track.id}
              variants={cardHover}
              initial="rest"
              whileHover="hover"
              onClick={() => {
                addXp(15);
                setProfileModalOpen(true);
              }}
              className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200/80 hover:bg-slate-100/90 hover:border-slate-300 transition-all duration-200 cursor-pointer flex items-center gap-4 shadow-sm group select-none"
            >
              <div className="w-12 h-12 rounded-xl bg-[#0B1727] text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-md group-hover:scale-105 transition-transform">
                {track.badge}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base group-hover:text-sky-600 transition-colors">
                  {track.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                  {track.subtitle}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
