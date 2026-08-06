import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CONCEPTS_DATA } from '../data/concepts';
import { cardHover, fadeUp, staggerContainer } from '../animations/motionVariants';
import { BookOpen, Check, Copy } from 'lucide-react';

export const ConceptBookPage: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="w-full min-h-screen pt-28 pb-20 max-w-[1440px] mx-auto px-6 lg:px-12 space-y-10"
    >
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5BE4FF]/10 text-[#5BE4FF] text-xs font-bold uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          Interactive Concept Reference
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Oxybott Concept Book</h1>
        <p className="text-base text-[#9BA9C2] max-w-2xl">
          Quick reference manual containing production patterns, spring motion math formulas, state stores, and Tailwind architecture.
        </p>
      </div>

      {/* Concept Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {CONCEPTS_DATA.map((item) => (
          <motion.div
            key={item.id}
            variants={cardHover}
            initial="rest"
            whileHover="hover"
            className="rounded-3xl bg-[#18283D]/80 border border-white/10 p-6 backdrop-blur-xl flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#5BE4FF]">
                  {item.category}
                </span>
                <button
                  onClick={() => handleCopy(item.id, item.codeSnippet)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#9BA9C2] hover:text-white transition-colors cursor-pointer"
                  title="Copy snippet"
                >
                  {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-[#9BA9C2] leading-relaxed mb-4">{item.summary}</p>
            </div>

            {/* Code Block */}
            <div className="rounded-xl bg-[#091320] border border-white/10 p-4 font-mono text-xs text-sky-300 overflow-x-auto">
              <pre>{item.codeSnippet}</pre>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};
