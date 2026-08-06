export const CONCEPTS_DATA = [
  {
    id: 'framer-spring',
    title: 'Spring Physics in UI Animations',
    category: 'Framer Motion',
    summary: 'Why spring physics (mass: 0.7, stiffness: 120, damping: 20) feel significantly better than static cubic-bezier easing.',
    codeSnippet: `const springTransition = {
  type: 'spring',
  mass: 0.7,
  stiffness: 120,
  damping: 20,
};`,
  },
  {
    id: 'zustand-store',
    title: 'Lightweight Global State with Zustand',
    category: 'State Management',
    summary: 'Eliminate boilerplate and unnecessary re-renders using clean hook-based store actions.',
    codeSnippet: `export const useAppStore = create((set) => ({
  xp: 0,
  addXp: (amount) => set((s) => ({ xp: s.xp + amount })),
}));`,
  },
  {
    id: 'glassmorphism',
    title: 'Glassmorphism Backdrop Filter Layers',
    category: 'TailwindCSS Design System',
    summary: 'Combining rgba dark backgrounds with backdrop-blur-xl and subtle 1px border highlights.',
    codeSnippet: `.glass-panel {
  background: rgba(24, 40, 61, 0.65);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}`,
  },
];
