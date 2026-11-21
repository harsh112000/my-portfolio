import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useFinePointer, usePrefersReducedMotion } from '../hooks/useMedia';

/** Dot + trailing ring. Grows over interactive elements and shows a label from [data-cursor]. */
export default function Cursor() {
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const enabled = fine && !reduced;
  const x = useMotionValue(-100), y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 420, damping: 36, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 420, damping: 36, mass: 0.6 });
  const [hover, setHover] = useState(false);
  const [label, setLabel] = useState('');
  const [down, setDown] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add('has-cursor');
    const move = (e: PointerEvent) => {
      x.set(e.clientX); y.set(e.clientY); setVisible(true);
      const t = (e.target as Element)?.closest?.('a, button, [role="button"], [data-cursor], input, textarea, label');
      setHover(!!t);
      setLabel(t?.getAttribute('data-cursor') ?? '');
    };
    const leave = () => setVisible(false);
    const d = () => setDown(true), u = () => setDown(false);
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    window.addEventListener('pointerdown', d);
    window.addEventListener('pointerup', u);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      window.removeEventListener('pointerdown', d);
      window.removeEventListener('pointerup', u);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;
  const size = label ? 76 : hover ? 46 : 30;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]" style={{ opacity: visible ? 1 : 0, transition: 'opacity .3s' }}>
      <motion.div className="absolute left-0 top-0" style={{ x: rx, y: ry }}>
        <motion.div
          className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border"
          animate={{
            width: size, height: size,
            scale: down ? 0.85 : 1,
            borderColor: hover ? 'rgba(94,234,212,0.6)' : 'rgba(255,255,255,0.22)',
            backgroundColor: label ? 'rgba(94,234,212,0.95)' : hover ? 'rgba(94,234,212,0.06)' : 'rgba(0,0,0,0)',
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        >
          <AnimatePresence>
            {label && (
              <motion.span key={label} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} className="font-mono text-[10px] font-medium uppercase tracking-widest text-ink-950">
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
      <motion.div className="absolute left-0 top-0" style={{ x, y }}>
        <motion.div className="h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mint" animate={{ scale: hover ? 0 : 1 }} />
      </motion.div>
    </div>
  );
}
