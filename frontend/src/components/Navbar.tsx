import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { OxybottLogo } from '../icons/AceCodeLogo';
import { SegmentedSwitch } from './navigation/SegmentedSwitch';
import { useScrollShrink } from '../hooks/useScrollShrink';
import { useAppStore } from '../store/useAppStore';
import { navbarReveal } from '../animations/motionVariants';
import { ArrowRight, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const isScrolled = useScrollShrink(20);
  const location = useLocation();
  const { isMobileMenuOpen, setMobileMenuOpen, setProfileModalOpen } = useAppStore();

  const navLinks = [
    { path: '/visual-programmer', label: 'Visual Studio' },
    { path: '/concept-book', label: 'Concept Book' },
    { path: '/leaderboard', label: 'Leaderboard' },
    { path: '/plans', label: 'Plans' },
  ];

  return (
    <motion.header
      variants={navbarReveal}
      initial="hidden"
      animate="visible"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'h-[64px] bg-[#0B1524]/95 backdrop-blur-[20px] border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.4)]'
          : 'h-[72px] bg-[#0B1524]/85 backdrop-blur-[16px] border-b border-white/5'
        }`}
    >
      <div className="max-w-[1440px] mx-auto h-full px-6 lg:px-10 flex items-center justify-between">
        {/* Left Side: Brand Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <OxybottLogo />
        </Link>

        {/* Middle Navigation: Segmented Switch + Links */}
        <div className="hidden lg:flex items-center gap-8 shrink-0">
          <SegmentedSwitch />

          <nav className="flex items-center gap-7 shrink-0">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-semibold transition-colors duration-200 whitespace-nowrap ${isActive ? 'text-[#5BE4FF] font-bold' : 'text-[#9BA9C2] hover:text-white'
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side: CTA */}
        <div className="hidden md:flex items-center gap-4 shrink-0 select-none">
          <Link
            to="/visual-programmer"
            className="inline-flex items-center justify-center gap-3 h-[44px] px-6 text-sm font-extrabold rounded-xl bg-[#5BE4FF] text-[#091320] shadow-[0_0_20px_rgba(91,228,255,0.3)] hover:bg-[#7AE8FF] hover:shadow-[0_0_28px_rgba(91,228,255,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer whitespace-nowrap"
          >
            <span>Start learning</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-[#18283D] border border-white/10 text-white hover:bg-[#1f334d] transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#091320]/98 border-b border-white/10 backdrop-blur-2xl px-6 py-6 space-y-5"
          >
            <div className="py-2">
              <SegmentedSwitch />
            </div>

            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold text-[#9BA9C2] hover:text-white py-2 border-b border-white/5"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <Link
                to="/visual-programmer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-3 h-[44px] rounded-xl bg-[#5BE4FF] text-[#091320] font-extrabold text-sm"
              >
                <span>Start learning</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
