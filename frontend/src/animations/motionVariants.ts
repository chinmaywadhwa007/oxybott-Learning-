import { Variants, Transition } from 'framer-motion';

// Ultra-smooth, subtle spring physics without aggressive popping or scaling
export const springTransition: Transition = {
  type: 'spring',
  mass: 0.6,
  stiffness: 140,
  damping: 22,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springTransition,
  },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springTransition,
  },
};

export const scale: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: springTransition,
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springTransition,
  },
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: springTransition,
  },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: springTransition,
  },
};

// Subtle, grounded float without scaling pop
export const float: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-4, 4, -4],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const pulse: Variants = {
  initial: { opacity: 0.8 },
  animate: {
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const glow: Variants = {
  initial: { opacity: 0.4 },
  animate: {
    opacity: [0.35, 0.65, 0.35],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Button Hover without scaling pop
export const buttonHover: Variants = {
  rest: { y: 0 },
  hover: {
    y: -1.5,
    transition: springTransition,
  },
  tap: {
    y: 0,
    transition: { duration: 0.08 },
  },
};

// Card Hover without scaling pop
export const cardHover: Variants = {
  rest: { y: 0 },
  hover: {
    y: -2,
    transition: springTransition,
  },
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] },
  },
};

export const navbarReveal: Variants = {
  hidden: { y: -72, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: springTransition,
  },
};

export const scrollReveal: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springTransition,
  },
};
