import React, { useState } from 'react';
import {
  Search,
  Home,
  Zap,
  Clock,
  GitBranch,
  Repeat,
  Calculator,
  Box,
  Puzzle,
  Radio,
  Monitor,
  Gauge,
  Cog,
  Globe,
  Brain,
  Sliders,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export interface ToolboxCategory {
  id: string;
  name: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  badgeColor: string;
  blocklyCategoryName: string;
}

export const TOOLBOX_CATEGORIES: ToolboxCategory[] = [
  { id: 'setup', name: 'Setup', icon: Home, color: '#2563EB', badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40', blocklyCategoryName: 'Program' },
  { id: 'gpio', name: 'GPIO', icon: Zap, color: '#EAB308', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40', blocklyCategoryName: 'GPIO' },
  { id: 'timing', name: 'Timing', icon: Clock, color: '#10B981', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', blocklyCategoryName: 'Timing' },
  { id: 'logic', name: 'Logic', icon: GitBranch, color: '#8B5CF6', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40', blocklyCategoryName: 'Logic' },
  { id: 'loops', name: 'Loops', icon: Repeat, color: '#06B6D4', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', blocklyCategoryName: 'Loops' },
  { id: 'math', name: 'Math', icon: Calculator, color: '#D97706', badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40', blocklyCategoryName: 'Math' },
  { id: 'variables', name: 'Variables', icon: Box, color: '#EC4899', badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/40', blocklyCategoryName: 'Variables' },
  { id: 'functions', name: 'Functions', icon: Puzzle, color: '#14B8A6', badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40', blocklyCategoryName: 'Functions' },
  { id: 'comm', name: 'Communication', icon: Radio, color: '#0284C7', badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40', blocklyCategoryName: 'Communication' },
  { id: 'displays', name: 'Displays', icon: Monitor, color: '#7C3AED', badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/40', blocklyCategoryName: 'Displays' },
  { id: 'sensors', name: 'Sensors', icon: Gauge, color: '#059669', badgeColor: 'bg-emerald-600/20 text-emerald-300 border-emerald-600/40', blocklyCategoryName: 'Sensors' },
  { id: 'motors', name: 'Motors', icon: Cog, color: '#B45309', badgeColor: 'bg-amber-600/20 text-amber-300 border-amber-600/40', blocklyCategoryName: 'Motors' },
  { id: 'iot', name: 'IoT', icon: Globe, color: '#1E40AF', badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40', blocklyCategoryName: 'IoT' },
  { id: 'advanced', name: 'Advanced', icon: Brain, color: '#475569', badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40', blocklyCategoryName: 'Advanced' },
];

interface ToolboxSidebarProps {
  activeCategory: string | null;
  onSelectCategory: (cat: ToolboxCategory) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const ToolboxSidebar: React.FC<ToolboxSidebarProps> = ({
  activeCategory,
  onSelectCategory,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = TOOLBOX_CATEGORIES.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`h-full bg-transparent flex flex-col justify-between select-none text-xs font-sans transition-all duration-200 ${
        isCollapsed ? 'w-14' : 'w-full'
      }`}
    >
      {/* 1. Explorer Header Bar */}
      <div className="h-9 px-3 border-b border-[#1E293B]/60 flex items-center justify-between shrink-0 bg-[#0B1220]/40">
        {!isCollapsed && (
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span>Toolbox</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#1E293B] text-slate-300">
              {filteredCategories.length}
            </span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="h-6 w-6 rounded hover:bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-auto"
          title={isCollapsed ? 'Expand Toolbox (Ctrl+B)' : 'Collapse Toolbox (Ctrl+B)'}
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 2. Search Input */}
      {!isCollapsed && (
        <div className="p-2 border-b border-[#1E293B]/40 shrink-0">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search blocks (Ctrl+F)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-7 pl-8 pr-7 rounded bg-[#111A2E] border border-[#1E293B] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#38BDF8]/60 transition-colors"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-slate-400 hover:text-white text-[11px] cursor-pointer"
              >
                ✕
              </button>
            ) : (
              <Sliders className="w-3 h-3 text-slate-500 absolute right-2.5 pointer-events-none" />
            )}
          </div>
        </div>
      )}

      {/* 3. VS Code Explorer Style Categories Stack */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
        {filteredCategories.map((cat) => {
          const IconComp = cat.icon;
          const isSelected = activeCategory === cat.name || activeCategory === cat.blocklyCategoryName;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs transition-colors cursor-pointer text-left group ${
                isSelected
                  ? 'bg-[#1E293B] text-white font-semibold border-l-2 border-[#38BDF8]'
                  : 'text-slate-300 hover:bg-[#1E293B]/50 hover:text-white border-l-2 border-transparent'
              }`}
              title={cat.name}
            >
              {/* Category Icon Badge */}
              <div
                className="w-5 h-5 rounded flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                style={{
                  backgroundColor: `${cat.color}20`,
                  color: cat.color,
                }}
              >
                <IconComp className="w-3.5 h-3.5" />
              </div>

              {!isCollapsed && (
                <span className="truncate flex-1 tracking-tight text-[12px]">{cat.name}</span>
              )}

              {!isCollapsed && isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
