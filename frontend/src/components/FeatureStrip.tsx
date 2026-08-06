import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '../animations/motionVariants';

const STEPS = [
  {
    number: '01',
    heading: 'Learn the idea',
    paragraph: 'Short explanations that get to the useful bit.',
  },
  {
    number: '02',
    heading: 'Try it yourself',
    paragraph: 'Activities, quizzes, and editors turn ideas into practice.',
  },
  {
    number: '03',
    heading: 'Make something',
    paragraph: 'Projects and challenges give every new skill somewhere to land.',
  },
];

export const FeatureStrip: React.FC = () => {
  return (
    <section className="w-full bg-white border-t border-b border-slate-900/[0.08] min-h-[180px] flex items-center justify-center mb-[96px] relative z-10">
      {/* Centered Global Container */}
      <div className="w-full max-w-[1360px] mx-auto px-8">
        {/* Equal 3-Column Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="w-full grid grid-cols-1 md:grid-cols-3 items-start justify-center"
        >
          {STEPS.map((step, idx) => (
            <motion.div
              key={step.number}
              variants={fadeUp}
              className={`w-full py-[48px] px-[40px] flex flex-col items-start justify-start ${
                idx < STEPS.length - 1 ? 'md:border-r border-slate-900/[0.08]' : ''
              }`}
            >
              {/* Step Number */}
              <span className="text-[16px] font-bold tracking-[0.12em] text-[#2563EB] mb-[16px] block">
                {step.number}
              </span>

              {/* Heading */}
              <h3 className="text-[20px] font-bold text-[#0F172A] mb-[18px] tracking-tight">
                {step.heading}
              </h3>

              {/* Supporting Paragraph */}
              <p className="text-[16px] leading-[1.7] text-[#64748B] max-w-[280px]">
                {step.paragraph}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
