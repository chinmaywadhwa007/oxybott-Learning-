import React from 'react';
import { motion } from 'framer-motion';
import { PRICING_PLANS } from '../data/plans';
import { Button } from '../components/Button';
import { cardHover, fadeUp, staggerContainer } from '../animations/motionVariants';
import { Check, Sparkles, Zap } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const PlansPage: React.FC = () => {
  const { setProfileModalOpen } = useAppStore();

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="w-full min-h-screen pt-28 pb-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12"
    >
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5BE4FF]/10 text-[#5BE4FF] text-xs font-bold uppercase tracking-wider">
          <Zap className="w-4 h-4" />
          Flexible Membership Options
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
          Invest in your developer career
        </h1>
        <p className="text-lg text-[#9BA9C2]">
          Unlock unlimited coding paths, interactive island quests, and verified skill badges.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch"
      >
        {PRICING_PLANS.map((plan) => (
          <motion.div
            key={plan.id}
            variants={cardHover}
            initial="rest"
            whileHover="hover"
            className={`relative rounded-3xl p-8 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 ${
              plan.isPopular
                ? 'bg-[#18283D] border-2 border-[#5BE4FF] shadow-[0_0_40px_rgba(91,228,255,0.25)]'
                : 'bg-[#18283D]/60 border border-white/10'
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#5BE4FF] text-[#091320] text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                MOST POPULAR
              </div>
            )}

            <div>
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-sm text-[#9BA9C2] mb-6 leading-relaxed">{plan.description}</p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-black text-white">{plan.price}</span>
                <span className="text-sm text-[#9BA9C2] font-semibold">/ {plan.billingPeriod}</span>
              </div>

              <ul className="space-y-3.5 mb-8 border-t border-white/10 pt-6">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-3 text-sm text-slate-200">
                    <div className="w-5 h-5 rounded-full bg-[#5BE4FF]/20 text-[#5BE4FF] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              variant={plan.isPopular ? 'primary' : 'outline'}
              size="lg"
              className="w-full justify-center"
              onClick={() => setProfileModalOpen(true)}
            >
              {plan.ctaText}
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};
