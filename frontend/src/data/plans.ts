import { PricingPlan } from '../types';

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Explorer Free',
    price: '$0',
    billingPeriod: 'forever',
    description: 'Perfect for getting started with core coding concepts and island quests.',
    features: ['Access to 7 Learning Paths', 'Interactive Code Sandbox', 'Community Leaderboard', 'Basic Progress Tracking'],
    ctaText: 'Start Free Learning',
  },
  {
    id: 'pro',
    name: 'Oxybott Pro',
    price: '$19',
    billingPeriod: 'per month',
    description: 'Full unlimited access to all advanced paths, code reviews, and certificate tracks.',
    features: [
      'All 30+ Premium Paths & Quests',
      'Explorer Mode World Map Unlimited',
      'Real-time Code Assistant',
      'Verified Skill Certificates',
      'Priority Discord Support',
    ],
    isPopular: true,
    ctaText: 'Start 7-Day Free Trial',
  },
  {
    id: 'team',
    name: 'Team / Enterprise',
    price: '$49',
    billingPeriod: 'per user / mo',
    description: 'Empower your team with shared progress analytics, custom roadmaps, and admin controls.',
    features: [
      'Everything in Pro',
      'Team Analytics Dashboard',
      'Custom Learning Roadmaps',
      'Dedicated Success Manager',
      'SSO & SAML Auth Integration',
    ],
    ctaText: 'Contact Enterprise Team',
  },
];
