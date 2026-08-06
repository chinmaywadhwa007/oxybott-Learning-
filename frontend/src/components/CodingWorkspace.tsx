import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { float } from '../animations/motionVariants';
import { useAppStore } from '../store/useAppStore';
import { Play, Check, Loader2 } from 'lucide-react';

type WorkspaceTab = 'coding' | 'ai' | 'skills';

export const CodingWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('coding');
  const { addXp } = useAppStore();
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileOutput, setCompileOutput] = useState<string | null>(null);

  const [tasksState, setTasksState] = useState([
    { label: 'Create a function', done: true },
    { label: 'Store some data', done: true },
    { label: 'Run your code', done: false, active: true },
    { label: 'Ship the project', done: false },
  ]);

  const handleTaskClick = (idx: number) => {
    const updated = [...tasksState];
    updated[idx].done = !updated[idx].done;
    setTasksState(updated);
  };

  const handleRunCompile = () => {
    setIsCompiling(true);
    setCompileOutput('Compiling code...');
    setTimeout(() => {
      setIsCompiling(false);
      const out =
        activeTab === 'coding'
          ? 'My game is live!'
          : activeTab === 'ai'
            ? 'AI Model Ready!'
            : 'Level Up: Spark!';
      setCompileOutput(out);
      addXp(15);
      // Mark "Run your code" task as completed
      const updated = [...tasksState];
      if (updated[2]) updated[2].done = true;
      setTasksState(updated);
    }, 600);
  };

  return (
    <motion.div
      variants={float}
      initial="initial"
      animate="animate"
      className="relative w-full max-w-[620px] mx-auto select-none font-sans"
    >
      {/* Background Soft Glow */}
      <div className="absolute -inset-8 rounded-[32px] bg-gradient-to-r from-[#5BE4FF]/15 to-[#1E62EC]/20 blur-2xl opacity-60 pointer-events-none" />

      {/* Top Segmented Tabs */}
      <div className="flex items-center justify-between gap-2 mb-4 p-1.5 px-2 rounded-[14px] bg-[#0E1E33]/90 border border-white/[0.08] backdrop-blur-xl shadow-md max-w-[500px] mx-auto">
        {/* Tab 1: Coding */}
        <button
          onClick={() => {
            setActiveTab('coding');
            setCompileOutput(null);
          }}
          className={`relative flex items-center justify-center gap-2 flex-1 py-2 text-[14px] font-bold rounded-[10px] transition-colors duration-200 cursor-pointer ${
            activeTab === 'coding' ? 'text-slate-900 font-extrabold' : 'text-[#9BA9C2] hover:text-white'
          }`}
        >
          {activeTab === 'coding' && (
            <motion.div
              layoutId="workspaceTabPill"
              className="absolute inset-0 bg-white rounded-[10px] shadow-sm z-[-1]"
              transition={{ type: 'spring', mass: 0.5, stiffness: 160, damping: 18 }}
            />
          )}
          <span className="w-2 h-2 rounded-full bg-[#5BE4FF]" />
          <span>Coding</span>
        </button>

        {/* Tab 2: AI */}
        <button
          onClick={() => {
            setActiveTab('ai');
            setCompileOutput(null);
          }}
          className={`relative flex items-center justify-center gap-2 flex-1 py-2 text-[14px] font-bold rounded-[10px] transition-colors duration-200 cursor-pointer ${
            activeTab === 'ai' ? 'text-slate-900 font-extrabold' : 'text-[#9BA9C2] hover:text-white'
          }`}
        >
          {activeTab === 'ai' && (
            <motion.div
              layoutId="workspaceTabPill"
              className="absolute inset-0 bg-white rounded-[10px] shadow-sm z-[-1]"
              transition={{ type: 'spring', mass: 0.5, stiffness: 160, damping: 18 }}
            />
          )}
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          <span>AI</span>
        </button>

        {/* Tab 3: Digital Skills */}
        <button
          onClick={() => {
            setActiveTab('skills');
            setCompileOutput(null);
          }}
          className={`relative flex items-center justify-center gap-2 flex-1 py-2 text-[14px] font-bold rounded-[10px] transition-colors duration-200 cursor-pointer ${
            activeTab === 'skills' ? 'text-slate-900 font-extrabold' : 'text-[#9BA9C2] hover:text-white'
          }`}
        >
          {activeTab === 'skills' && (
            <motion.div
              layoutId="workspaceTabPill"
              className="absolute inset-0 bg-white rounded-[10px] shadow-sm z-[-1]"
              transition={{ type: 'spring', mass: 0.5, stiffness: 160, damping: 18 }}
            />
          )}
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Digital Skills</span>
        </button>
      </div>

      {/* Main Educational Editor Window Card */}
      <div className="relative w-full rounded-[18px] bg-[#0A1626]/95 border border-white/[0.08] backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5 flex flex-col justify-between min-h-[440px]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          {/* Three Traffic Light Circles */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
          </div>

          {/* Centered Filename & Subtitle */}
          <div className="text-center">
            <h4 className="text-[15px] font-mono font-bold text-slate-300 tracking-wide">
              {activeTab === 'coding' ? 'first_project.py' : activeTab === 'ai' ? 'ai_model.py' : 'skills_track.py'}
            </h4>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
              Build with code
            </p>
          </div>

          {/* Compile & Run Button + Language Badge */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRunCompile}
              disabled={isCompiling}
              className="flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-gradient-to-r from-[#1E62EC] to-[#5BE4FF] hover:from-[#256CFC] hover:to-[#76ECFF] text-[#081321] text-[11px] font-black tracking-wide shadow-[0_0_12px_rgba(91,228,255,0.4)] transition-all cursor-pointer disabled:opacity-50"
            >
              {isCompiling ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Play className="w-3 h-3 fill-current" />
              )}
              <span>{isCompiling ? 'Compiling...' : 'Compile Code'}</span>
            </button>
            <span className="px-2.5 py-1 rounded-[6px] bg-[#13233A] border border-white/[0.08] text-[10px] font-black text-[#5BE4FF] tracking-wider uppercase">
              PYTHON
            </span>
          </div>
        </div>

        {/* Code Body & Mission Sidebar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-5 flex-1 items-start">
          {/* Left Code Area & Output Panel (8 cols out of 12) */}
          <div className="md:col-span-8 space-y-5 flex flex-col justify-between h-full">
            {/* Syntax Highlighted Code Lines (15px Font Size, Leading 1.8) */}
            <div className="font-mono text-[15px] leading-[1.8] space-y-1 pl-1">
              <AnimatePresence mode="wait">
                {activeTab === 'coding' && (
                  <motion.div
                    key="coding-code"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-1"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-slate-600 text-xs w-3 select-none">1</span>
                      <div>
                        <span className="text-purple-400 font-bold">def </span>
                        <span className="text-[#5BE4FF] font-semibold">build_idea</span>
                        <span className="text-white">(name):</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-slate-600 text-xs w-3 select-none">2</span>
                      <div className="pl-6">
                        <span className="text-white">skills = [</span>
                        <span className="text-[#FFDF6D]">"logic"</span>
                        <span className="text-white">, </span>
                        <span className="text-[#FFDF6D]">"creativity"</span>
                        <span className="text-white">]</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-slate-600 text-xs w-3 select-none">3</span>
                      <div className="pl-6">
                        <span className="text-purple-400 font-bold">return </span>
                        <span className="text-purple-400">f</span>
                        <span className="text-[#5BE4FF]">"&#123;name&#125; </span>
                        <span className="text-emerald-400">is live!"</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 py-1">
                      <span className="text-slate-600 text-xs w-3 select-none">4</span>
                      <span className="text-slate-500 italic text-xs"># Your turn ↓</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-slate-600 text-xs w-3 select-none">5</span>
                      <div>
                        <span className="text-[#5BE4FF] font-bold">print</span>
                        <span className="text-white">(</span>
                        <span className="text-[#5BE4FF]">build_idea</span>
                        <span className="text-white">(</span>
                        <span className="text-[#FFDF6D]">"My game"</span>
                        <span className="text-white">))</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'ai' && (
                  <motion.div
                    key="ai-code"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-1"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-slate-600 text-xs w-3 select-none">1</span>
                      <div>
                        <span className="text-purple-400 font-bold">import </span>
                        <span className="text-[#5BE4FF]">oxybott_ai</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-600 text-xs w-3 select-none">2</span>
                      <div>
                        <span className="text-white">model = oxybott_ai.</span>
                        <span className="text-amber-300 font-bold">LLM</span>
                        <span className="text-white">()</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-600 text-xs w-3 select-none">3</span>
                      <div>
                        <span className="text-[#5BE4FF] font-bold">print</span>
                        <span className="text-white">(model.</span>
                        <span className="text-emerald-400">ask</span>
                        <span className="text-white">(</span>
                        <span className="text-[#FFDF6D]">"Hello AI"</span>
                        <span className="text-white">))</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'skills' && (
                  <motion.div
                    key="skills-code"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-1"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-slate-600 text-xs w-3 select-none">1</span>
                      <div>
                        <span className="text-white">xp = </span>
                        <span className="text-amber-300 font-bold">50</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-600 text-xs w-3 select-none">2</span>
                      <div>
                        <span className="text-[#5BE4FF] font-bold">print</span>
                        <span className="text-white">(</span>
                        <span className="text-[#FFDF6D]">"Level Up: Spark!"</span>
                        <span className="text-white">)</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Output Panel */}
            <div className="rounded-[14px] bg-[#06111F] border border-white/[0.08] p-4 space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold tracking-widest text-[#5BE4FF] uppercase block">
                  OUTPUT
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  {isCompiling ? '● COMPILING' : '● EXECUTED'}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[15px] text-white">
                <span className="text-slate-400 font-bold">&gt;</span>
                <span className="font-semibold">
                  {compileOutput ||
                    (activeTab === 'coding'
                      ? 'My game is live!'
                      : activeTab === 'ai'
                        ? 'AI Model Ready!'
                        : 'Level Up: Spark!')}
                </span>
                <span className="w-2.5 h-4 bg-[#5BE4FF] inline-block animate-pulse rounded-xs ml-1" />
              </div>
            </div>
          </div>

          {/* Mission Progress Sidebar */}
          <div className="md:col-span-4 space-y-4">
            {/* Header & Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[14px] font-bold tracking-wider text-slate-400 uppercase">
                <span>MISSION</span>
                <span className="text-slate-300">
                  {tasksState.filter((t) => t.done).length}/{tasksState.length}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <motion.div
                  animate={{
                    width: `${(tasksState.filter((t) => t.done).length / tasksState.length) * 100}%`,
                  }}
                  transition={{ type: 'spring', mass: 0.5, stiffness: 140, damping: 18 }}
                  className="h-full bg-gradient-to-r from-[#1E62EC] to-[#5BE4FF] rounded-full"
                />
              </div>
            </div>

            {/* Task Cards Stack */}
            <div className="space-y-2.5 pt-1">
              {tasksState.map((task, idx) => (
                <div
                  key={task.label}
                  onClick={() => {
                    handleTaskClick(idx);
                    addXp(10);
                  }}
                  className={`py-2.5 px-3.5 rounded-[10px] border text-[13px] font-bold transition-all duration-150 cursor-pointer select-none flex items-center gap-2.5 ${
                    task.done
                      ? 'bg-[#0E1F35] border-white/[0.08] text-white shadow-sm hover:border-slate-600'
                      : task.active
                        ? 'bg-[#0F243A] border-[#5BE4FF]/40 text-white shadow-sm hover:border-[#5BE4FF]'
                        : 'bg-[#0A1626]/60 border-white/[0.05] text-slate-500 hover:text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-base font-extrabold shrink-0">
                    {task.done ? (
                      <span className="text-emerald-400">✓</span>
                    ) : task.active ? (
                      <span className="text-[#5BE4FF]">→</span>
                    ) : (
                      <span className="text-slate-600">○</span>
                    )}
                  </span>
                  <span className="leading-snug">{task.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
