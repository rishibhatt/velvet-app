export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.94 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
  transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const },
};

export const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

export const slideInRight = {
  initial: { x: "100%", opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: "100%", opacity: 0 },
  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
};

export const saveFlyAnimation = {
  initial: { scale: 1 },
  animate: { scale: [1, 1.05, 0.95, 1] },
  transition: { duration: 0.4, times: [0, 0.3, 0.7, 1] },
};
