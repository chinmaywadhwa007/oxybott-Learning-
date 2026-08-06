import React from 'react';
import { Dices, User } from 'lucide-react';

interface UsernameGeneratorProps {
  value: string;
  onChange: (value: string) => void;
}

const PREFIXES = [
  'Code',
  'Byte',
  'Logic',
  'Syntax',
  'Pixel',
  'Algo',
  'Cyber',
  'Dev',
  'Data',
  'Stack',
];

const SUFFIXES = [
  'Explorer',
  'Pioneer',
  'Wizard',
  'Ninja',
  'Guru',
  'Viking',
  'Craft',
  'Alchemist',
  'Coder',
  'Maker',
];

export const UsernameGenerator: React.FC<UsernameGeneratorProps> = ({ value, onChange }) => {
  const generateRandomUsername = () => {
    const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
    const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
    const num = Math.floor(Math.random() * 90) + 10;
    onChange(`${prefix}${suffix}${num}`);
  };

  return (
    <div className="w-full space-y-1">
      <label className="block text-[11px] font-bold text-[#9BA9C2] uppercase tracking-wider">
        Username
      </label>

      <div className="relative flex items-center">
        <div className="absolute left-[16px] text-[#64748B] pointer-events-none z-10 flex items-center justify-center">
          <User className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. CodeExplorer21"
          required
          style={{ paddingLeft: '48px' }}
          className="w-full h-[48px] pr-12 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white font-semibold text-sm placeholder:text-[#64748B] focus:bg-white/[0.06] focus:border-[#5BE4FF] focus:ring-2 focus:ring-[#5BE4FF]/20 transition-all duration-200 outline-none"
        />

        {/* Dice Generator Button */}
        <button
          type="button"
          onClick={generateRandomUsername}
          title="Generate random username"
          className="absolute right-2.5 w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[#5BE4FF] transition-colors flex items-center justify-center cursor-pointer group active:scale-95 border border-white/[0.08]"
        >
          <Dices className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" />
        </button>
      </div>

      <p className="text-[11px] text-[#64748B] pl-1 font-medium">
        This name will be visible to other learners.
      </p>
    </div>
  );
};
