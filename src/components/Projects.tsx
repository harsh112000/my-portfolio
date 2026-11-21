import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SectionHeading } from './Reveal';
import ArchFlow from './ArchFlow';
import { projects, type Project } from '../data/content';
import { ease, viewport } from '../lib/motion';
import { lockScroll } from '../lib/scroll';

function Card({ p, i, onOpen }: { p: Project; i: number; onOpen: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  const move = (e: PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    ref.current!.style.setProperty('--cx', `${e.clientX - r.left}px`);
    ref.current!.style.setProperty('--cy', `${e.clientY - r.top}px`);
  };
  return (
    <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewport} transition={{ duration: 1, ease, delay: (i % 2) * 0.12 }}>
      <motion.article
        ref={ref}
        layoutId={`card-${p.id}`}
        onClick={onOpen}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onOpen())}
        onPointerMove={move}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        tabIndex={0}
        role="button"
        aria-label={`Open case study: ${p.title}`}
        data-cursor="open"
        whileHover={{ y: -6 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-ink-900/70 p-7 outline-none ring-mint/50 focus-visible:ring-2 md:p-9"
        style={{ borderRadius: 24 }}
      >
        {/* Illuminated border following the cursor */}
        <div className="pointer-events-none absolute inset-0 rounded-[24px] p-px opacity-100"
          style={{
            background: `radial-gradient(380px circle at var(--cx, 50%) var(--cy, 0%), ${p.accent}${hover ? 'aa' : '00'}, rgba(255,255,255,.07) 45%)`,
            WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', transition: 'background .3s',
          }} />
        {/* Shifting inner glow */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          style={{ background: `radial-gradient(520px circle at var(--cx, 50%) var(--cy, 0%), ${p.accent}14, transparent 50%)` }} />

        <div className="relative flex items-center justify-between font-mono text-[11px] text-fog-500">
          <span>0{i + 1} / Case study</span>
          <span>{p.year}</span>
        </div>

        <div className="relative my-8 h-[130px] md:h-[150px]">
          <motion.div animate={{ opacity: hover ? 1 : 0.6, scale: hover ? 1 : 0.97 }} transition={{ duration: 0.6, ease }} className="h-full">
            <ArchFlow labels={p.flow} color={p.accent} active={hover} />
          </motion.div>
        </div>

        <h3 className="relative text-[24px] font-medium leading-tight tracking-tight text-fog-100 md:text-[28px]">{p.title}</h3>
        <p className="relative mt-3 text-[15px] leading-relaxed text-fog-400">{p.tagline}</p>

        <div className="relative mt-auto flex items-end justify-between gap-4 pt-8">
          <ul className="flex flex-wrap gap-2">
            {p.stack.slice(0, 4).map((s, j) => (
              <motion.li key={s} animate={{ y: hover ? -3 : 0, borderColor: hover ? `${p.accent}55` : 'rgba(255,255,255,0.08)' }} transition={{ delay: hover ? j * 0.04 : 0, duration: 0.35 }}
                className="rounded-full border bg-white/[0.02] px-2.5 py-1 font-mono text-[11px] text-fog-300">{s}</motion.li>
            ))}
          </ul>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 text-fog-300 transition-all duration-500 group-hover:rotate-[-45deg] group-hover:border-transparent group-hover:text-ink-950" style={{ background: hover ? p.accent : 'transparent' }}>→</span>
        </div>
      </motion.article>
    </motion.div>
  );
}

function Detail({ p, onClose }: { p: Project; onClose: () => void }) {
  useEffect(() => {
    lockScroll(true);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => { lockScroll(false); window.removeEventListener('keydown', esc); };
  }, [onClose]);

  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } } };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center md:items-center md:p-8" role="dialog" aria-modal="true" aria-label={p.title}>
      <motion.div className="absolute inset-0 bg-ink-950/80 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} data-cursor="close" />
      <motion.div layoutId={`card-${p.id}`} style={{ borderRadius: 24 }}
        className="relative max-h-[92svh] w-full max-w-4xl overflow-y-auto border border-white/10 bg-ink-900 shadow-2xl [scrollbar-width:thin]" data-lenis-prevent>
        <div className="absolute inset-x-0 top-0 h-48 opacity-60" style={{ background: `radial-gradient(600px circle at 20% 0%, ${p.accent}22, transparent 60%)` }} />
        <button onClick={onClose} className="sticky right-4 top-4 z-10 float-right m-4 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-ink-900/80 text-fog-300 backdrop-blur transition hover:rotate-90 hover:text-fog-100" aria-label="Close">✕</button>
        <motion.div className="relative p-7 md:p-12" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } } }}>
          <motion.div variants={item} className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: p.accent }}>Case study · {p.year}</motion.div>
          <motion.h3 variants={item} className="mt-4 max-w-2xl text-[clamp(1.9rem,4vw,3rem)] font-medium leading-[1.05] tracking-tightest text-fog-100">{p.title}</motion.h3>
          <motion.p variants={item} className="mt-4 max-w-2xl text-[16px] leading-relaxed text-fog-400">{p.tagline}</motion.p>

          <motion.div variants={item} className="mt-10 rounded-2xl border border-white/[0.07] bg-ink-950/60 p-4 md:p-6">
            <div className="mb-2 flex items-center justify-between font-mono text-[11px] text-fog-500">
              <span>architecture.svg</span>
              <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full" style={{ background: p.accent }} /> live request path</span>
            </div>
            <div className="h-[160px] md:h-[220px]"><ArchFlow labels={p.flow} color={p.accent} active detailed /></div>
          </motion.div>

          <div className="mt-12 grid gap-10 md:grid-cols-2">
            <motion.div variants={item}>
              <h4 className="eyebrow mb-3">The problem</h4>
              <p className="text-[15px] leading-relaxed text-fog-300">{p.problem}</p>
            </motion.div>
            <motion.div variants={item}>
              <h4 className="eyebrow mb-3">The approach</h4>
              <p className="text-[15px] leading-relaxed text-fog-300">{p.approach}</p>
            </motion.div>
          </div>

          <motion.div variants={item} className="mt-12">
            <h4 className="eyebrow mb-5">Engineering decisions</h4>
            <ol className="grid gap-3 md:grid-cols-2">
              {p.decisions.map((d, i) => (
                <li key={d} className="flex gap-4 rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 transition-colors hover:border-white/15">
                  <span className="font-mono text-[11px]" style={{ color: p.accent }}>0{i + 1}</span>
                  <span className="text-[14px] leading-relaxed text-fog-300">{d}</span>
                </li>
              ))}
            </ol>
          </motion.div>

          <motion.div variants={item} className="mt-12 flex flex-col gap-8 border-t hairline pt-8 md:flex-row md:items-end md:justify-between">
            <div>
              <h4 className="eyebrow mb-4">Stack</h4>
              <div className="flex flex-wrap gap-2">{p.stack.map((s) => <span key={s} className="tag">{s}</span>)}</div>
            </div>
            <p className="max-w-xs font-serif text-xl italic leading-snug text-fog-100">“{p.outcome}”</p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function Projects() {
  const [open, setOpen] = useState<Project | null>(null);
  const close = useCallback(() => setOpen(null), []);
  return (
    <section id="work" className="relative py-28 md:py-40">
      <div className="container-x">
        <SectionHeading index="03" eyebrow="Selected work" title="Systems I've designed and shipped." accent={['designed']}
          kicker="Each card holds a small architecture. Hover to watch a request travel through it, click for the full case study." />
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((p, i) => <Card key={p.id} p={p} i={i} onOpen={() => setOpen(p)} />)}
        </div>
      </div>
      <AnimatePresence>{open && <Detail key={open.id} p={open} onClose={close} />}</AnimatePresence>
    </section>
  );
}
