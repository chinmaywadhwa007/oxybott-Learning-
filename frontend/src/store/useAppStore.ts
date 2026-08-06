import { create } from 'zustand';
import type { ViewMode, UserProfile } from '../types';

interface AppState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isProfileModalOpen: boolean;
  setProfileModalOpen: (open: boolean) => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  profile: UserProfile;
  addXp: (amount: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  viewMode: 'classic',
  setViewMode: (mode) => set({ viewMode: mode }),
  isProfileModalOpen: false,
  setProfileModalOpen: (open) => set({ isProfileModalOpen: open }),
  isMobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  profile: {
    name: 'Alex Learner',
    level: 1,
    levelTitle: 'Spark',
    xp: 0,
    nextLevelXp: 50,
    learningPathsCount: 7,
    lessonsClearedCount: 0,
    totalProgressPercentage: 0,
  },
  addXp: (amount: number) =>
    set((state) => {
      const newXp = state.profile.xp + amount;
      let newLevel = state.profile.level;
      let newTitle = state.profile.levelTitle;
      let newNext = state.profile.nextLevelXp;

      if (newXp >= newNext) {
        newLevel += 1;
        newNext = newLevel * 100;
        if (newLevel === 2) newTitle = 'Builder';
        if (newLevel >= 3) newTitle = 'Architect';
      }

      const newProgress = Math.min(100, Math.round((newXp / newNext) * 100));

      return {
        profile: {
          ...state.profile,
          xp: newXp,
          level: newLevel,
          levelTitle: newTitle,
          nextLevelXp: newNext,
          totalProgressPercentage: newProgress,
          lessonsClearedCount: state.profile.lessonsClearedCount + (amount > 0 ? 1 : 0),
        },
      };
    }),
}));
