export type ViewMode = 'classic' | 'explorer';

export interface UserProfile {
  name: string;
  level: number;
  levelTitle: string;
  xp: number;
  nextLevelXp: number;
  avatarUrl?: string;
  learningPathsCount: number;
  lessonsClearedCount: number;
  totalProgressPercentage: number;
}

export interface CoursePath {
  id: string;
  title: string;
  description: string;
  icon: string;
  lessonsCount: number;
  estimatedHours: number;
  tag: string;
  badgeColor: string;
  isPopular?: boolean;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  badges: string[];
  level: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  billingPeriod: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  ctaText: string;
}
