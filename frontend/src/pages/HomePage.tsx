import React from 'react';
import { Hero } from '../components/Hero';
import { FeatureStrip } from '../components/FeatureStrip';
import { DirectionSelector } from '../components/DirectionSelector';
import { FirstBuildSection } from '../components/FirstBuildSection';
import { WhyOxybottSection } from '../components/WhyAceCodeSection';
import { CTAExploreSection } from '../components/CTAExploreSection';
import { Footer } from '../components/Footer';
import { SupportWidget } from '../components/SupportWidget';

export const HomePage: React.FC = () => {
  return (
    <div className="relative w-full overflow-x-hidden">
      {/* Primary Hero Section with Interactive Coding Workspace */}
      <Hero />

      {/* 3-Step Process Feature Strip */}
      <FeatureStrip />

      {/* Choose Your First Direction Section */}
      <DirectionSelector />

      {/* Choose Your First Build Section */}
      <FirstBuildSection />

      {/* Why Oxybott Royal Blue Section */}
      <WhyOxybottSection />

      {/* 7 Paths Dark Midnight CTA Hero Banner */}
      <CTAExploreSection />

      {/* Footer */}
      <Footer />

      {/* Floating Circular Support Widget & Modal */}
      <SupportWidget />
    </div>
  );
};

