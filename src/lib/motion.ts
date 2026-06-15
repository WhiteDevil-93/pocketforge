// Shared motion presets — tuned for snappy mobile feel.

export const EASE_OUT = [0.4, 0, 0.2, 1] as const;
export const EASE_SNAP = [0.32, 0.72, 0, 1] as const;

export const transitionFast = { duration: 0.12, ease: EASE_OUT };
export const transitionMedium = { duration: 0.18, ease: EASE_OUT };
export const transitionBackdrop = { duration: 0.14, ease: EASE_OUT };
export const transitionSheet = { duration: 0.2, ease: EASE_SNAP };

export const springSnappy = {
  type: 'spring' as const,
  stiffness: 800,
  damping: 42,
  mass: 0.6,
};

export const springTap = {
  type: 'spring' as const,
  stiffness: 700,
  damping: 38,
  mass: 0.5,
};