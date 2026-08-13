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
  { id: 'setup', name: 'Events', icon: Home, color: '#ffab19', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300', blocklyCategoryName: 'Program' },
  { id: 'gpio', name: 'Control', icon: Zap, color: '#ff8c1a', badgeColor: 'bg-orange-100 text-orange-800 border-orange-300', blocklyCategoryName: 'GPIO' },
  { id: 'timing', name: 'Timing', icon: Clock, color: '#ff8c1a', badgeColor: 'bg-orange-100 text-orange-800 border-orange-300', blocklyCategoryName: 'Timing' },
  { id: 'logic', name: 'Operators', icon: GitBranch, color: '#59c059', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300', blocklyCategoryName: 'Logic' },
  { id: 'loops', name: 'Loops', icon: Repeat, color: '#ffab19', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300', blocklyCategoryName: 'Loops' },
  { id: 'math', name: 'Math', icon: Calculator, color: '#59c059', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300', blocklyCategoryName: 'Math' },
  { id: 'variables', name: 'Variables', icon: Box, color: '#ff8c1a', badgeColor: 'bg-orange-100 text-orange-800 border-orange-300', blocklyCategoryName: 'Variables' },
  { id: 'functions', name: 'My Blocks', icon: Puzzle, color: '#ff4d6a', badgeColor: 'bg-rose-100 text-rose-800 border-rose-300', blocklyCategoryName: 'Functions' },
  { id: 'comm', name: 'Communication', icon: Radio, color: '#4c97ff', badgeColor: 'bg-blue-100 text-blue-800 border-blue-300', blocklyCategoryName: 'Communication' },
  { id: 'displays', name: 'Displays', icon: Monitor, color: '#9333ea', badgeColor: 'bg-purple-100 text-purple-800 border-purple-300', blocklyCategoryName: 'Displays' },
  { id: 'sensors', name: 'Sensors', icon: Gauge, color: '#59c059', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300', blocklyCategoryName: 'Sensors' },
  { id: 'motors', name: 'Motors', icon: Cog, color: '#ffab19', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300', blocklyCategoryName: 'Motors' },
  { id: 'iot', name: 'Robots', icon: Globe, color: '#4c97ff', badgeColor: 'bg-blue-100 text-blue-800 border-blue-300', blocklyCategoryName: 'IoT' },
  { id: 'advanced', name: 'Advanced', icon: Brain, color: '#64748b', badgeColor: 'bg-slate-100 text-slate-800 border-slate-300', blocklyCategoryName: 'Advanced' },
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
  const [activeTab, setActiveTab] = useState<'code' | 'costumes' | 'sounds'>('code');

  const filteredCategories = TOOLBOX_CATEGORIES.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`h-full bg-[#f8fafc] text-slate-800 flex flex-col justify-between select-none text-xs font-sans transition-all duration-200 border-r border-slate-200 ${
        isCollapsed ? 'w-14' : 'w-full'
      }`}
    >
      {/* 1. Scratch / OxyCode IDE Top Category Tabs (Code, Costumes, Sounds) */}
      {!isCollapsed && (
        <div className="h-10 bg-[#e2e8f0] border-b border-slate-300 flex items-center justify-around px-2 shrink-0">
          <button
            onClick={() => setActiveTab('code')}
            className={`h-7 px-3 rounded-t-lg font-bold text-xs flex items-center gap-1.5 transition-colors ${
              activeTab === 'code'
                ? 'bg-white text-[#007acc] shadow-sm border-t-2 border-[#007acc]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>💻</span> Code
          </button>
          <button
            onClick={() => setActiveTab('costumes')}
            className={`h-7 px-3 rounded-t-lg font-bold text-xs flex items-center gap-1.5 transition-colors ${
              activeTab === 'costumes'
                ? 'bg-white text-[#007acc] shadow-sm border-t-2 border-[#007acc]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🎨</span> Costumes
          </button>
          <button
            onClick={() => setActiveTab('sounds')}
            className={`h-7 px-3 rounded-t-lg font-bold text-xs flex items-center gap-1.5 transition-colors ${
              activeTab === 'sounds'
                ? 'bg-white text-[#007acc] shadow-sm border-t-2 border-[#007acc]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🔊</span> Sounds
          </button>
        </div>
      )}

      {/* 2. Explorer Header Bar */}
      <div className="h-8 px-3 border-b border-slate-200 flex items-center justify-between shrink-0 bg-[#f1f5f9]">
        {!isCollapsed && (
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <span>Categories</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-extrabold">
              {filteredCategories.length}
            </span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="h-6 w-6 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer ml-auto"
          title={isCollapsed ? 'Expand Toolbox' : 'Collapse Toolbox'}
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 3. Search Input */}
      {!isCollapsed && (
        <div className="p-2 border-b border-slate-200 shrink-0 bg-white">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search blocks (Ctrl+F)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-7 pl-8 pr-7 rounded bg-slate-100 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#007acc] transition-colors"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-slate-400 hover:text-slate-700 text-[11px] cursor-pointer"
              >
                ✕
              </button>
            ) : (
              <Sliders className="w-3 h-3 text-slate-400 absolute right-2.5 pointer-events-none" />
            )}
          </div>
        </div>
      )}

      {/* 4. Category Stack */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-1 custom-scrollbar bg-[#f8fafc]">
        {filteredCategories.map((cat) => {
          const IconComp = cat.icon;
          const isSelected = activeCategory === cat.name || activeCategory === cat.blocklyCategoryName;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left group ${
                isSelected
                  ? 'bg-white text-slate-900 font-bold border-l-4 border-[#007acc] shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 border-l-4 border-transparent'
              }`}
              title={cat.name}
            >
              {/* Category Circle Icon Badge */}
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110"
                style={{
                  backgroundColor: cat.color,
                  color: '#ffffff',
                }}
              >
                <IconComp className="w-3 h-3 stroke-[2.5]" />
              </div>

              {!isCollapsed && (
                <span className="truncate flex-1 tracking-tight text-[12px] font-medium">{cat.name}</span>
              )}

              {!isCollapsed && isSelected && (
                <span className="w-2 h-2 rounded-full bg-[#007acc] shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

