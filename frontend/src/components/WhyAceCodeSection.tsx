import React from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { fadeUp, staggerContainer } from '../animations/motionVariants';

const TiltCard: React.FC<{
  title: string;
  description: string;
  floatDelay?: number;
}> = ({ title, description, floatDelay = 0 }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 250, damping: 25 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 250, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      animate={{
        y: [0, -8, 0],
      }}
      transition={{
        y: {
          duration: 4,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
          delay: floatDelay,
        },
      }}
      whileHover={{ y: -6, scale: 1.02 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full min-h-[170px] rounded-[22px] p-[24px] bg-white/[0.08] border border-white/45 backdrop-blur-[20px] shadow-2xl shadow-blue-950/40 flex flex-col justify-center select-none cursor-pointer transition-all duration-300 hover:border-white/75 hover:shadow-[0_0_35px_rgba(255,255,255,0.3)] relative group shrink-0"
    >
      {/* Ambient Glass Highlight */}
      <div className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div style={{ transform: 'translateZ(24px)' }} className="relative z-10">
        <h3 className="font-mono text-base sm:text-lg font-bold text-white mb-[8px] tracking-tight">
          {title}
        </h3>
        <p className="text-white/85 text-xs sm:text-sm leading-relaxed font-medium">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export const WhyOxybottSection: React.FC = () => {
  return (
    <section className="w-full bg-[#2E73E8] text-white min-h-[360px] py-[60px] lg:py-[80px] px-8 lg:px-[100px] flex items-center justify-center relative overflow-hidden">
      {/* Container 1360px Max Width Centered */}
      <div className="w-full max-w-[1360px] mx-auto">
        {/* Two-Column Grid: Left Title / Right Cards Row */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-[40px] lg:gap-[56px] items-center justify-between"
        >
          {/* Left Column (Fixed Title) */}
          <motion.div variants={fadeUp} className="w-full">
            {/* Small uppercase label */}
            <span className="text-xs font-extrabold uppercase tracking-[5px] text-white/75 mb-[16px] block select-none">
              WHY OXYBOTT
            </span>

            {/* Line-by-line revealed heading (Medium Font Size) */}
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-white tracking-tight leading-[1.1] select-none">
              Built for the moment when <br className="hidden sm:inline" />
              &ldquo;I get it&rdquo; becomes <br className="hidden sm:inline" />
              &ldquo;I made it.&rdquo;
            </h2>
          </motion.div>

          {/* Right Column - Side-by-Side Horizontal Row Grid */}
          <motion.div
            variants={fadeUp}
            className="w-full grid grid-cols-1 sm:grid-cols-2 gap-[20px] items-center"
          >
            <TiltCard
              title="instant_feedback()"
              description="Get useful feedback from quizzes, activities, and code checks while the idea is still fresh."
              floatDelay={0}
            />

            <TiltCard
              title="progress += 1"
              description="Small wins, visible progress, and challenges that grow with each learner."
              floatDelay={2}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export const WhyAceCodeSection = WhyOxybottSection;
