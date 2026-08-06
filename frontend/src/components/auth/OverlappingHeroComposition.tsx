import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Sparkles, Bot, Zap, Flame, Terminal, Trophy, CheckCircle2 } from 'lucide-react';

export interface OverlappingHeroCompositionProps {
  onHoverStateChange?: (isHovering: boolean) => void;
}

const AI_MESSAGES = [
  'Use useMemo to cache calculation result.',
  'Optimize loop with WebAssembly worker.',
  'Add cleanup function to prevent memory leaks.',
  'All 14 test assertions passed in 0.38ms!',
];

export const OverlappingHeroComposition: React.FC<OverlappingHeroCompositionProps> = ({
  onHoverStateChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse Coordinates for Smooth Parallax & 3D Tilt
  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);

  // Spring Physics for Smooth 60fps Movement
  const mouseX = useSpring(rawMouseX, { stiffness: 100, damping: 20 });
  const mouseY = useSpring(rawMouseY, { stiffness: 100, damping: 20 });

  // 3D Tilt Transformations (rotateX ±4°, rotateY ±6°)
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-6, 6]);

  // Card Parallax Translations (Different Depths)
  const aiX = useTransform(mouseX, [-0.5, 0.5], [-14, 14]);
  const aiY = useTransform(mouseY, [-0.5, 0.5], [-14, 14]);

  const codeX = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);
  const codeY = useTransform(mouseY, [-0.5, 0.5], [-10, 10]);

  const xpX = useTransform(mouseX, [-0.5, 0.5], [-18, 18]);
  const xpY = useTransform(mouseY, [-0.5, 0.5], [-18, 18]);

  const achieveX = useTransform(mouseX, [-0.5, 0.5], [-8, 8]);
  const achieveY = useTransform(mouseY, [-0.5, 0.5], [-8, 8]);

  const streakX = useTransform(mouseX, [-0.5, 0.5], [-12, 12]);
  const streakY = useTransform(mouseY, [-0.5, 0.5], [-12, 12]);

  // Radial Glow Tracking
  const glowX = useTransform(mouseX, [-0.5, 0.5], [100, 320]);
  const glowY = useTransform(mouseY, [-0.5, 0.5], [60, 240]);

  // Live Interactive States inside Cards
  const [aiMessageIndex, setAiMessageIndex] = useState(0);
  const [isTypingAi, setIsTypingAi] = useState(false);
  const [typedCode, setTypedCode] = useState('');
  const fullCodeLine = "await app.startLesson({ mode: 'interactive' });";
  const [xpValue, setXpValue] = useState(2850);
  const [activeStreakDays, setActiveStreakDays] = useState([true, true, true, true, true, false, false]);

  // Typing Effect for Code Editor
  useEffect(() => {
    let charIdx = 0;
    const interval = setInterval(() => {
      if (charIdx <= fullCodeLine.length) {
        setTypedCode(fullCodeLine.slice(0, charIdx));
        charIdx++;
      } else {
        setTimeout(() => {
          charIdx = 0;
        }, 3000);
      }
    }, 60);
    return () => clearInterval(interval);
  }, []);

  // AI Message Cycling Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setIsTypingAi(true);
      setTimeout(() => {
        setAiMessageIndex((prev) => (prev + 1) % AI_MESSAGES.length);
        setIsTypingAi(false);
      }, 500);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // XP Counter Increment
  const handleXpClick = () => {
    setXpValue((prev) => (prev >= 3000 ? 2850 : prev + 50));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const normalizedX = (e.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (e.clientY - rect.top) / rect.height - 0.5;
    rawMouseX.set(normalizedX);
    rawMouseY.set(normalizedY);
  };

  const handleMouseEnter = () => {
    if (onHoverStateChange) onHoverStateChange(true);
  };

  const handleMouseLeave = () => {
    rawMouseX.set(0);
    rawMouseY.set(0);
    if (onHoverStateChange) onHoverStateChange(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[500px] h-[350px] my-3 select-none perspective-[1200px]"
    >
      {/* Dynamic Radial Glow following Cursor */}
      <motion.div
        style={{ left: glowX, top: glowY }}
        className="absolute w-[280px] h-[280px] bg-gradient-to-tr from-[#5BE4FF]/14 via-purple-600/08 to-transparent rounded-full blur-[90px] pointer-events-none transition-opacity duration-300"
      />

      {/* Floating Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -20, 0],
              x: [0, i % 2 === 0 ? 10 : -10, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 5 + i * 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              top: `${20 + (i * 15) % 60}%`,
              left: `${15 + (i * 22) % 70}%`,
            }}
            className="absolute w-1 h-1 rounded-full bg-[#5BE4FF]/50 blur-[0.5px]"
          />
        ))}
      </div>

      {/* 3D TILTED MAIN COMPOSITION CONTAINER */}
      <motion.div
        style={{ rotateX, rotateY }}
        className="relative w-full h-full transform-style-3d transition-transform duration-100 ease-out"
      >
        {/* 1. CODE EDITOR CARD (10px Parallax Depth + Interactive Mouse Dragging) */}
        <motion.div
          drag
          dragConstraints={{ left: -80, right: 80, top: -80, bottom: 80 }}
          dragElastic={0.15}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
          style={{ x: codeX, y: codeY }}
          whileHover={{ scale: 1.04, zIndex: 40 }}
          whileTap={{ scale: 0.98 }}
          whileDrag={{ scale: 1.06, zIndex: 50 }}
          className="absolute top-[55px] left-[10px] w-[330px] h-[190px] bg-[#0E1A2B]/90 backdrop-blur-[24px] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.4)] rounded-[20px] p-3.5 flex flex-col justify-between z-20 hover:border-[#5BE4FF]/50 hover:shadow-[0_25px_70px_rgba(91,228,255,0.25)] transition-colors cursor-grab active:cursor-grabbing group"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono text-[#9BA9C2]">
              <Terminal className="w-3.5 h-3.5 text-[#5BE4FF]" />
              <span>oxybott.ts</span>
            </div>
          </div>

          {/* Syntax Code Body with Typing Cursor */}
          <div className="font-mono text-[11px] space-y-1.5 text-slate-300 relative">
            <div>
              <span className="text-[#5BE4FF]">import</span> {'{'} <span className="text-purple-300">OxybottAI</span> {'}'} <span className="text-[#5BE4FF]">from</span> <span className="text-amber-300">&apos;@oxybott/ai&apos;</span>;
            </div>
            <div>
              <span className="text-[#5BE4FF]">const</span> <span className="text-emerald-300">app</span> = <span className="text-purple-300">new</span> <span className="text-emerald-300">OxybottAI</span>();
            </div>
            <div className="text-[#5BE4FF] font-semibold flex items-center">
              <span>{typedCode}</span>
              <span className="w-1.5 h-3.5 bg-[#5BE4FF] animate-pulse inline-block ml-0.5" />
            </div>
          </div>

          {/* Footer Status */}
          <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[10px] text-[#9BA9C2]">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Tests Passed
            </span>
            <span className="font-mono text-[#5BE4FF] text-[9px]">Drag with mouse &bull; 0.38ms</span>
          </div>
        </motion.div>

        {/* 2. AI ASSISTANT CARD (14px Parallax Depth + Interactive Mouse Dragging) */}
        <motion.div
          drag
          dragConstraints={{ left: -80, right: 80, top: -80, bottom: 80 }}
          dragElastic={0.15}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
          style={{ x: aiX, y: aiY }}
          whileHover={{ scale: 1.05, zIndex: 40 }}
          whileTap={{ scale: 0.98 }}
          whileDrag={{ scale: 1.06, zIndex: 50 }}
          className="absolute -top-[5px] right-[0px] w-[245px] h-[125px] bg-[#0E1A2B]/90 backdrop-blur-[24px] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.4)] rounded-[20px] p-3.5 z-30 hover:border-purple-400/50 hover:shadow-[0_25px_70px_rgba(168,85,247,0.25)] transition-colors cursor-grab active:cursor-grabbing group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center relative">
                <Bot className="w-3.5 h-3.5" />
                <span className="absolute inset-0 rounded-md bg-purple-400/20 blur-sm animate-pulse pointer-events-none" />
              </div>
              <span className="text-[11px] font-extrabold text-white flex items-center gap-1">
                Oxybott AI
                <Sparkles className="w-2.5 h-2.5 text-[#5BE4FF]" />
              </span>
            </div>
            <span className="text-[9px] font-bold text-slate-400">Assistant</span>
          </div>

          <div className="min-h-[42px] flex items-center">
            {isTypingAi ? (
              <div className="flex items-center gap-1 text-slate-400 text-[10px] pl-1">
                <span>AI is thinking</span>
                <span className="w-1 h-1 rounded-full bg-purple-400 animate-ping" />
                <span className="w-1 h-1 rounded-full bg-[#5BE4FF] animate-ping delay-100" />
              </div>
            ) : (
              <p className="text-[10px] text-[#9BA9C2] leading-relaxed">
                &ldquo;{AI_MESSAGES[aiMessageIndex]}&rdquo;
              </p>
            )}
          </div>
        </motion.div>

        {/* 3. XP PROGRESS CARD (18px Parallax Depth + Interactive Mouse Dragging) */}
        <motion.div
          drag
          dragConstraints={{ left: -80, right: 80, top: -80, bottom: 80 }}
          dragElastic={0.15}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
          style={{ x: xpX, y: xpY }}
          whileHover={{ scale: 1.05, zIndex: 40 }}
          whileTap={{ scale: 0.98 }}
          whileDrag={{ scale: 1.06, zIndex: 50 }}
          onClick={handleXpClick}
          className="absolute top-[135px] -right-[15px] w-[225px] h-[115px] bg-[#0E1A2B]/90 backdrop-blur-[24px] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.4)] rounded-[20px] p-3.5 z-30 flex flex-col justify-between hover:border-[#5BE4FF]/50 hover:shadow-[0_25px_70px_rgba(91,228,255,0.25)] transition-colors cursor-grab active:cursor-grabbing group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#5BE4FF]/15 text-[#5BE4FF] border border-[#5BE4FF]/30 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[8px] font-extrabold text-[#5BE4FF] uppercase tracking-wider block">
                  LEVEL 14
                </span>
                <h4 className="text-[11px] font-extrabold text-white leading-none">Code Pioneer</h4>
              </div>
            </div>
            <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(52,211,153,0.3)]">
              +50 XP
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[9px] font-semibold text-[#9BA9C2]">
              <span>Progress</span>
              <span className="text-white font-bold">{xpValue} / 3,000 XP</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${(xpValue / 3000) * 100}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                className="h-full bg-gradient-to-r from-[#5BE4FF] to-purple-500 rounded-full shadow-[0_0_10px_rgba(91,228,255,0.5)]"
              />
            </div>
          </div>
        </motion.div>

        {/* 4. STREAK CARD (12px Parallax Depth + Interactive Mouse Dragging) */}
        <motion.div
          drag
          dragConstraints={{ left: -80, right: 80, top: -80, bottom: 80 }}
          dragElastic={0.15}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
          style={{ x: streakX, y: streakY }}
          whileHover={{ scale: 1.05, zIndex: 40 }}
          whileTap={{ scale: 0.98 }}
          whileDrag={{ scale: 1.06, zIndex: 50 }}
          className="absolute bottom-[0px] left-[5px] w-[185px] h-[95px] bg-[#0E1A2B]/90 backdrop-blur-[24px] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.4)] rounded-[18px] p-3 flex flex-col justify-between z-30 hover:border-amber-400/50 hover:shadow-[0_25px_70px_rgba(251,191,36,0.25)] transition-colors cursor-grab active:cursor-grabbing group"
        >
          <div className="flex items-center gap-2">
            <div className="w-6.5 h-6.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[11px] font-black text-white leading-none">12 Day Streak</h4>
              <p className="text-[8px] text-[#9BA9C2]">Goal met</p>
            </div>
          </div>

          {/* Active Days */}
          <div className="flex items-center justify-between px-0.5">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
              <div
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  const updated = [...activeStreakDays];
                  updated[idx] = !updated[idx];
                  setActiveStreakDays(updated);
                }}
                className="flex flex-col items-center gap-0.5 cursor-pointer group/dot"
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    activeStreakDays[idx]
                      ? 'bg-[#5BE4FF] shadow-[0_0_8px_rgba(91,228,255,0.8)] scale-105'
                      : 'bg-slate-800 group-hover/dot:bg-slate-700'
                  }`}
                />
                <span className="text-[7px] text-slate-400 font-semibold">{day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 5. ACHIEVEMENT CARD (8px Parallax Depth + Interactive Mouse Dragging) */}
        <motion.div
          drag
          dragConstraints={{ left: -80, right: 80, top: -80, bottom: 80 }}
          dragElastic={0.15}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
          style={{ x: achieveX, y: achieveY }}
          whileHover={{ scale: 1.05, zIndex: 40 }}
          whileTap={{ scale: 0.98 }}
          whileDrag={{ scale: 1.06, zIndex: 50 }}
          className="absolute -bottom-[15px] right-[25px] w-[175px] h-[95px] bg-[#0E1A2B]/90 backdrop-blur-[24px] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.4)] rounded-[18px] p-3 z-30 flex items-center gap-2.5 hover:border-amber-400/50 hover:shadow-[0_25px_70px_rgba(251,191,36,0.25)] transition-colors cursor-grab active:cursor-grabbing group"
        >
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform duration-300">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[8px] font-extrabold text-amber-400 uppercase tracking-wider block">
              UNLOCKED
            </span>
            <h4 className="text-[11px] font-black text-white leading-none">Master Coder</h4>
            <p className="text-[9px] text-[#9BA9C2]">Top 5% League</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OverlappingHeroComposition;
