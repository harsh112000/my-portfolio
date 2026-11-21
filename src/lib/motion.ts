export const ease = [0.22, 1, 0.36, 1] as const; // expo-out: the site's one motion curve
export const easeInOut = [0.65, 0, 0.35, 1] as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.9, ease, delay: i * 0.08 } }),
};

export const stagger = (step = 0.08, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: step, delayChildren: delay } },
});

export const viewport = { once: true, margin: '0px 0px -12% 0px' } as const;

// framer-motion 11's TargetProperties types reject numeric `pathLength` under @types/react 18.3;
// the runtime handles it fine, so route SVG path-draw targets through this helper.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const draw = (pathLength: number, extra: Record<string, number> = {}) => ({ pathLength, ...extra }) as any;
