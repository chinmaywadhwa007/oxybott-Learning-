import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import type { ViewMode } from '../../types';
import { Map } from 'lucide-react';

export const SegmentedSwitch: React.FC = () => {
  const { viewMode, setViewMode } = useAppStore();

  const options: Array<{ id: ViewMode; label: string; icon: (isActive: boolean) => React.ReactNode }> = [
    {
      id: 'classic',
      label: 'Classic',
      icon: (_isActive: boolean) => (
        <span className="flex items-center justify-center w-5 h-5 shrink-0">
          <svg className="w-4.5 h-4.5" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6.5" height="6.5" rx="1.5" fill="#EF4444" />
            <rect x="8.5" y="1" width="6.5" height="6.5" rx="1.5" fill="#10B981" />
            <rect x="1" y="8.5" width="6.5" height="6.5" rx="1.5" fill="#3B82F6" />
            <rect x="8.5" y="8.5" width="6.5" height="6.5" rx="1.5" fill="#F59E0B" />
          </svg>
        </span>
      ),
    },
    {
      id: 'explorer',
      label: 'Explorer',
      icon: (isActive: boolean) => (
        <span className="flex items-center justify-center w-5 h-5 shrink-0">
          <Map className={`w-4.5 h-4.5 transition-colors ${isActive ? 'text-blue-600' : 'text-[#5BE4FF]'}`} />
        </span>
      ),
    },
  ];

  return (
    <div className="relative inline-flex items-center gap-4 p-2 rounded-2xl bg-[#08111D] border border-white/10 shadow-inner select-none shrink-0">
      {options.map((opt) => {
        const isActive = viewMode === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => setViewMode(opt.id)}
            className={`relative inline-flex items-center justify-center gap-3 h-[44px] px-6 text-sm font-extrabold rounded-xl transition-colors duration-200 cursor-pointer whitespace-nowrap z-10 ${isActive
                ? 'text-slate-900'
                : 'text-[#9BA9C2] hover:text-white bg-[#142338]/60 hover:bg-[#1A2D48] border border-white/5 hover:border-white/15'
              }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeSegmentedPill"
                className="absolute inset-0 bg-white rounded-xl border border-white shadow-md z-[-1]"
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 28,
                }}
              />
            )}
            {opt.icon(isActive)}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};





