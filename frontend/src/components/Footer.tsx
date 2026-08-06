import React from 'react';
import { OxybottLogo } from '../icons/AceCodeLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#060D1A] border-t border-slate-800/80 py-[40px] text-slate-400">
      <div className="w-full max-w-[1360px] mx-auto px-8 flex flex-col sm:flex-row items-center justify-between gap-[24px]">
        {/* Brand Logo */}
        <div className="flex items-center gap-[12px]">
          <OxybottLogo className="w-8 h-8" />
        </div>

        {/* Copyright & Nav */}
        <div className="flex flex-wrap items-center justify-center gap-[24px] text-xs font-medium text-slate-500">
          <span>&copy; {new Date().getFullYear()} Oxybott. All rights reserved.</span>
          <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
};
