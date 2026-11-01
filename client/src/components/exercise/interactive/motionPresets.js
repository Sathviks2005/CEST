import { useReducedMotion } from 'framer-motion';

/**
 * Custom hook wrapping framer-motion's useReducedMotion().
 * When prefers-reduced-motion is active, disable movement/scale/looping
 * and use instant transitions.
 */
export const useMotionSafe = () => {
  const shouldReduce = useReducedMotion();
  const isReduced = Boolean(shouldReduce);

  return {
    isReduced,
    safeTransition: (normal, reduced = { duration: 0.01 }) => (isReduced ? reduced : normal),
    safeScale: (normalScale) => (isReduced ? 1 : normalScale),
  };
};

/**
 * Shared animation variants
 */
export const fadeSlideUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

export const staggerList = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
};

export const popIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 350, damping: 24 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

export const accordion = {
  hidden: { height: 0, opacity: 0, overflow: 'hidden' },
  visible: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeInOut' },
  },
};
