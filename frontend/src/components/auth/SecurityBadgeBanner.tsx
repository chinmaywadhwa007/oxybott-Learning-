import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

export const SecurityBadgeBanner: React.FC = () => {
  return (
    <div className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[10px] font-semibold text-[#9BA9C2] mb-4 select-none">
      <div className="flex items-center gap-1.5 text-emerald-400">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span className="font-extrabold tracking-wide">SOC2 TYPE II CERTIFIED</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1 text-slate-400">
          <Lock className="w-3 h-3 text-[#5BE4FF]" />
          256-Bit TLS
        </span>
      </div>
    </div>
  );
};
