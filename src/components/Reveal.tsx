import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import { ease, viewport } from '../lib/motion';

/** Splits text into words that rise out of a mask, one after another. */
export function SplitWords({ text, className = '', delay = 0, step = 0.06, animateNow, gradient = [] as string[] }: {
  text: string; className?: string; delay?: number; step?: number; animateNow?: boolean; gradient?: string[];
}) {
  const words = text.split(' ');
  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: step, delayChildren: delay } } };
  const word: Variants = { hidden: { y: '110%', rotate: 4 }, show: { y: '0%', rotate: 0, transition: { duration: 1, ease } } };
  const trigger = animateNow === undefined ? { whileInView: 'show', viewport } : { animate: animateNow ? 'show' : 'hidden' };
  return (
    <motion.span className={className} variants={container} initial="hidden" {...trigger} aria-label={text} role="text">
      {words.map((w, i) => {
        const clean = w.replace(/[.,]/g, '');
        return (
          <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-bottom -mb-[0.12em]">
            <motion.span variants={word} className={`inline-block origin-bottom-left ${gradient.includes(clean) ? 'gradient-text font-serif italic tracking-normal' : ''}`}>
              {w}
            </motion.span>
            {i < words.length - 1 && ' '}
          </span>
        );
      })}
    </motion.span>
  );
}

export function SectionHeading({ index, eyebrow, title, accent, kicker }: { index: string; eyebrow: string; title: string; accent?: string[]; kicker?: ReactNode }) {
  return (
    <div className="mb-14 md:mb-20">
      <motion.div className="mb-6 flex items-center gap-4" initial="hidden" whileInView="show" viewport={viewport}>
        <motion.span variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0, transition: { duration: 0.7, ease } } }} className="font-mono text-xs text-mint">{index}</motion.span>
        <motion.span variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.1, ease, delay: 0.1 } } }} className="h-px w-16 origin-left bg-gradient-to-r from-mint/60 to-transparent" />
        <motion.span variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.8, delay: 0.3 } } }} className="eyebrow">{eyebrow}</motion.span>
      </motion.div>
      <h2 className="max-w-3xl text-[clamp(2rem,5vw,3.6rem)] font-medium leading-[1.04] tracking-tightest text-fog-100">
        <SplitWords text={title} gradient={accent} />
      </h2>
      {kicker && (
        <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewport} transition={{ duration: 0.9, ease, delay: 0.25 }} className="mt-6 max-w-xl text-[15px] leading-relaxed text-fog-400">
          {kicker}
        </motion.p>
      )}
    </div>
  );
}

export function FadeIn({ children, delay = 0, y = 24, className = '' }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={viewport} transition={{ duration: 0.9, ease, delay }}>
      {children}
    </motion.div>
  );
}
