import React from 'react';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';

interface StatItemProps {
  value: number;
  suffix?: string;
  label: string;
}

export const StatItem: React.FC<StatItemProps> = ({ value, suffix = '', label }) => {
  const animatedValue = useAnimatedCounter(value, 1200);

  return (
    <div className="flex flex-col justify-center items-start px-7 py-4 h-full border-r last:border-r-0 border-white/5">
      <div className="text-3xl sm:text-[34px] font-extrabold text-white tracking-tight leading-none">
        {animatedValue}
        {suffix}
      </div>
      <div className="text-xs font-semibold text-[#9BA9C2] mt-2 capitalize">
        {label}
      </div>
    </div>
  );
};
