import { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion';
import Terminal from './Terminal';
import Magnetic from './Magnetic';
import { SplitWords } from './Reveal';
import { profile } from '../data/content';
import { scrollToId } from '../lib/scroll';
import { ease, draw } from '../lib/motion';
import { useFinePointer, usePrefersReducedMotion } from '../hooks/useMedia';

// Topology drawn behind the terminal: a tiny distributed system.
const nodes = [
  { id: 'client', label: 'client', x: 40, y: 70 },
  { id: 'gw', label: 'api-gateway', x: 250, y: 24 },
  { id: 'orders', label: 'orders-svc', x: 520, y: 70 },
  { id: 'pay', label: 'payments-svc', x: 560, y: 300 },
  { id: 'kafka', label: 'kafka', x: 520, y: 520 },
  { id: 'redis', label: 'redis', x: 40, y: 330 },
  { id: 'mysql', label: 'mysql', x: 200, y: 540 },
];
const edges: [string, string, number][] = [
  ['client', 'gw', 0], ['gw', 'orders', 0.6], ['orders', 'pay', 1.4], ['pay', 'kafka', 2.1],
  ['kafka', 'mysql', 2.9], ['gw', 'redis', 1.1], ['redis', 'mysql', 3.4],
];
const pos = (id: string) => nodes.find((n) => n.id === id)!;

function Network({ live }: { live: boolean }) {
  return (
    <svg viewBox="0 0 600 580" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
      <defs>
        <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5eead4" stopOpacity=".45" />
          <stop offset="1" stopColor="#a78bfa" stopOpacity=".25" />
        </linearGradient>
        <radialGradient id="pkt"><stop offset="0" stopColor="#fff" /><stop offset=".4" stopColor="#5eead4" /><stop offset="1" stopColor="#5eead4" stopOpacity="0" /></radialGradient>
      </defs>
      {edges.map(([a, b, delay], i) => {
        const A = pos(a), B = pos(b);
        const mx = (A.x + B.x) / 2 + (i % 2 ? 40 : -40), my = (A.y + B.y) / 2 + (i % 2 ? -30 : 30);
        const d = `M${A.x},${A.y} Q${mx},${my} ${B.x},${B.y}`;
        return (
          <g key={i}>
            <motion.path d={d} fill="none" stroke="url(#edge)" strokeWidth="1" strokeDasharray="3 5"
              initial={draw(0, { opacity: 0 })} animate={draw(1, { opacity: 1 })} transition={{ duration: 1.6, delay: 1.2 + i * 0.12, ease }} />
            {live && (
              <circle r="4" fill="url(#pkt)" opacity="0">
                <set attributeName="opacity" to="1" begin={`${delay + 2}s`} />
                <animateMotion dur={`${2.6 + (i % 3) * 0.6}s`} begin={`${delay + 2}s`} repeatCount="indefinite" path={d} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines=".6 0 .4 1" />
              </circle>
            )}
          </g>
        );
      })}
      {nodes.map((n, i) => (
        <motion.g key={n.id} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 + i * 0.08, duration: 0.8, ease }} style={{ transformOrigin: `${n.x}px ${n.y}px` }}>
          <circle cx={n.x} cy={n.y} r="14" fill="#0b0f17" stroke="rgba(94,234,212,.35)" />
          <circle cx={n.x} cy={n.y} r="3" fill="#5eead4" />
          <text x={n.x} y={n.y + 30} textAnchor="middle" className="fill-fog-500 font-mono" fontSize="11">{n.label}</text>
        </motion.g>
      ))}
    </svg>
  );
}

function Floating({ mx, my, depth, className, children, delay }: { mx: MotionValue<number>; my: MotionValue<number>; depth: number; className: string; children: React.ReactNode; delay: number }) {
  const x = useTransform(mx, (v) => v * depth);
  const y = useTransform(my, (v) => v * depth);
  return (
    <motion.div style={{ x, y }} className={`absolute z-20 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: [0, -6, 0] }}
        transition={{ opacity: { delay, duration: 0.8 }, y: { delay, duration: 6 + depth / 10, repeat: Infinity, ease: 'easeInOut' } }}
        className="glass whitespace-nowrap rounded-lg border border-white/[0.08] px-3 py-2 font-mono text-[11px] text-fog-300 shadow-xl"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function Hero({ ready }: { ready: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const inView = useInView(ref, { margin: '-10% 0px' });
  const mxRaw = useMotionValue(0), myRaw = useMotionValue(0);
  const mx = useSpring(mxRaw, { stiffness: 60, damping: 18 });
  const my = useSpring(myRaw, { stiffness: 60, damping: 18 });

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -120]);
  const contentO = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const visualY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -60]);

  useEffect(() => {
    if (!fine || reduced) return;
    const move = (e: PointerEvent) => {
      mxRaw.set((e.clientX / window.innerWidth - 0.5) * 2);
      myRaw.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [fine, reduced, mxRaw, myRaw]);

  const termX = useTransform(mx, (v) => v * -10);
  const termY = useTransform(my, (v) => v * -8);
  const netX = useTransform(mx, (v) => v * 14);
  const netY = useTransform(my, (v) => v * 10);

  return (
    <section ref={ref} id="top" className="relative flex min-h-[100svh] items-center pb-20 pt-32 lg:pt-24">
      <div className="container-x grid items-center gap-16 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        <motion.div style={{ y: contentY, opacity: contentO }}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, ease, delay: 0.1 }}
            className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/[0.08] bg-white/[0.02] py-1.5 pl-2 pr-4">
            <span className="relative flex h-2 w-2">
              <span className="pulse-ring absolute inset-0 rounded-full bg-mint" />
              <span className="relative h-2 w-2 rounded-full bg-mint" />
            </span>
            <span className="font-mono text-[11px] tracking-wide text-fog-300">{profile.availabilityText}</span>
          </motion.div>

          <h1 className="text-[clamp(2.5rem,5.6vw,4.9rem)] font-medium leading-[0.98] tracking-tightest text-fog-100">
            <SplitWords text="Harsh Srivastava." animateNow={ready} delay={0.2} step={0.08} />
            <span className="mt-3 block text-[clamp(1.9rem,3.6vw,3.2rem)] leading-[1.04] text-fog-500">
              <SplitWords text="I build backend systems that never lose a transaction." animateNow={ready} delay={0.45} step={0.05} gradient={['never', 'lose']} />
            </span>
          </h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1, ease, delay: 1.15 }}
            className="mt-8 max-w-[520px] text-[16px] leading-relaxed text-fog-400 md:text-[17px]">
            Senior Software Engineer at <span className="text-fog-100">Zoop (Ixigo Group)</span>. I design event-driven payment, settlement and
            ledger systems on Node.js and Kafka that stay correct under retries, failures and real-world load.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1, ease, delay: 1.3 }} className="mt-10 flex flex-wrap items-center gap-4">
            <Magnetic>
              <button onClick={() => scrollToId('work')} className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-fog-100 px-6 py-3.5 text-[14px] font-medium text-ink-950">
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-mint to-sky transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-0" />
                <span className="relative">View selected work</span>
                <span className="relative grid h-5 w-5 place-items-center overflow-hidden">
                  <span className="transition-transform duration-500 group-hover:translate-y-[150%]">↓</span>
                  <span className="absolute -translate-y-[150%] transition-transform duration-500 group-hover:translate-y-0">↓</span>
                </span>
              </button>
            </Magnetic>
            <Magnetic>
              <button onClick={() => scrollToId('contact')} className="group relative inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-[14px] text-fog-100 transition-colors duration-500 hover:border-mint/60">
                Get in touch
                <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
              </button>
            </Magnetic>
          </motion.div>
        </motion.div>

        <motion.div style={{ y: visualY }} className="relative mx-auto w-full max-w-[560px]">
          <motion.div style={{ x: netX, y: netY }} className="absolute -inset-10 hidden opacity-80 sm:block">
            {ready && <Network live={inView && !reduced} />}
          </motion.div>
          <motion.div style={{ x: termX, y: termY }} initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={ready ? { opacity: 1, y: 0, scale: 1 } : {}} transition={{ duration: 1.2, ease, delay: 0.7 }}
            className="relative z-10 mx-auto max-w-[480px] py-8 sm:py-16">
            <Terminal start={ready} />
          </motion.div>
          {ready && (
            <>
              <Floating mx={mx} my={my} depth={22} delay={1.8} className="-left-4 top-6 hidden sm:block"><span className="text-iris">topic</span> payments.settled</Floating>
              <Floating mx={mx} my={my} depth={-18} delay={2.0} className="-right-2 bottom-10 hidden sm:block"><span className="text-mint">200</span> OK · idempotent replay</Floating>
              <Floating mx={mx} my={my} depth={30} delay={2.2} className="-left-6 bottom-2 hidden md:block"><span className="text-ember">Idempotency-Key</span> 7f3a…c91</Floating>
            </>
          )}
        </motion.div>
      </div>

      <motion.button onClick={() => scrollToId('about')} initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex" aria-label="Scroll to about">
        <span className="eyebrow text-[10px]">Scroll</span>
        <span className="relative h-10 w-px overflow-hidden bg-white/10">
          <motion.span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-transparent to-mint" animate={reduced ? {} : { y: ['-100%', '200%'] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} />
        </span>
      </motion.button>
    </section>
  );
}
