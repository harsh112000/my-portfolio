import { useEffect, useState } from 'react';
import { motion, animate } from 'framer-motion';
import { easeInOut, draw } from '../lib/motion';

export default function Loader({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const c = animate(0, 100, { duration: 1.25, ease: [0.4, 0, 0.2, 1], onUpdate: (v) => setN(Math.round(v)), onComplete: () => setTimeout(onDone, 180) });
    return () => c.stop();
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-ink-950"
      exit={{ clipPath: 'inset(0 0 100% 0)' }}
      initial={{ clipPath: 'inset(0 0 0% 0)' }}
      transition={{ duration: 0.9, ease: easeInOut }}
    >
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5eead4" /><stop offset="1" stopColor="#a78bfa" /></linearGradient>
        </defs>
        <motion.path d="M14 12v40M14 32h18M32 12v40" stroke="url(#lg)" strokeWidth="3" strokeLinecap="round" initial={draw(0)} animate={draw(1)} transition={{ duration: 0.9, ease: easeInOut }} />
        <motion.path d="M52 18c-5-5-13-3-13 4 0 9 15 6 15 15 0 8-10 9-15 4" stroke="url(#lg)" strokeWidth="3" strokeLinecap="round" initial={draw(0)} animate={draw(1)} transition={{ duration: 0.9, delay: 0.25, ease: easeInOut }} />
      </svg>
      <div className="mt-8 flex w-48 items-center gap-3">
        <div className="h-px flex-1 overflow-hidden bg-white/10">
          <div className="h-full bg-gradient-to-r from-mint to-iris" style={{ width: `${n}%` }} />
        </div>
        <span className="w-8 text-right font-mono text-[11px] tabular-nums text-fog-400">{n}</span>
      </div>
      <span className="sr-only">Loading</span>
    </motion.div>
  );
}
