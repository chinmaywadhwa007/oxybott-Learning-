import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { GridBackground } from './GridBackground';
import { FloatingGlow } from './FloatingGlow';
import { ParticlesBackground } from './ParticlesBackground';
import { ProfileModal } from '../components/ProfileModal';
import { pageTransition } from '../animations/motionVariants';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const isHideNavbar = location.pathname === '/visual-programmer' || location.pathname === '/auth';

  if (isHideNavbar) {
    return <div className="min-h-screen bg-[#081321] text-white font-sans overflow-hidden">{children}</div>;
  }

  return (
    <div className="relative min-h-screen bg-[#091320] text-white overflow-x-hidden selection:bg-[#5BE4FF] selection:text-[#091320]">
      {/* Background Visual Layers */}
      <GridBackground />
      <FloatingGlow />
      <ParticlesBackground />

      {/* Sticky Header Navigation */}
      <Navbar />

      {/* Main Content Area with Page Transitions */}
      <main className="relative z-10 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Profile & XP Modal */}
      <ProfileModal />
    </div>
  );
};
