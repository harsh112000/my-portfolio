import { useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { SectionHeading } from './Reveal';
import Counter from './Counter';
import { experience, type Experience as Exp } from '../data/content';
import { ease, viewport } from '../lib/motion';

function Role({ job, index }: { job: Exp; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.li initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewport} transition={{ duration: 1, ease }} className="relative pl-10 md:pl-0">
      <div className="md:grid md:grid-cols-[180px_1fr] md:gap-12">
        <div className="relative mb-4 md:mb-0 md:pt-1 md:text-right">
          <motion.span initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={viewport} transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.2 }}
            className="absolute -left-10 top-1.5 grid h-[15px] w-[15px] place-items-center rounded-full border border-mint/50 bg-ink-950 md:left-auto md:-right-[31.5px]">
            <span className="h-[5px] w-[5px] rounded-full bg-mint shadow-[0_0_10px_#5eead4]" />
          </motion.span>
          <div className="font-mono text-[12px] text-fog-400">{job.period}</div>
          <div className="mt-1 font-serif text-5xl italic text-white/[0.06] md:text-7xl">{job.start}</div>
        </div>

        <div className="relative rounded-2xl border border-transparent transition-colors duration-500 md:-m-6 md:p-6 md:hover:border-white/[0.06] md:hover:bg-white/[0.015]">
          <button onClick={() => setOpen((o) => !o)} className="group flex w-full items-start justify-between gap-6 text-left" aria-expanded={open}>
            <div>
              <h3 className="text-[22px] font-medium tracking-tight text-fog-100 md:text-[26px]">
                {job.role} <span className="text-mint">@ {job.company}</span>
              </h3>
              {job.org && <div className="mt-1 font-mono text-[12px] text-fog-500">{job.org}</div>}
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-fog-400">{job.blurb}</p>
            </div>
            <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.4, ease }}
              className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-lg text-fog-300 transition-colors group-hover:border-mint/50 group-hover:text-mint">+</motion.span>
          </button>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div key="body" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.6, ease }} className="overflow-hidden">
                <div className="mt-6 flex flex-wrap gap-8 border-y hairline py-5">
                  {job.metrics.map((m) => (
                    <div key={m.label}>
                      <div className="text-3xl font-medium tracking-tight text-fog-100"><Counter to={m.value} suffix={m.suffix} duration={1.4} /></div>
                      <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-fog-500">{m.label}</div>
                    </div>
                  ))}
                </div>
                <ul className="mt-6 space-y-2" onPointerLeave={() => setHovered(null)}>
                  {job.highlights.map((h, i) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.07, duration: 0.6, ease }}
                      onPointerEnter={() => setHovered(i)} onFocus={() => setHovered(i)} tabIndex={0}
                      className="relative cursor-default rounded-xl px-4 py-3 outline-none">
                      {hovered === i && <motion.span layoutId={`hl-${job.company}`} className="absolute inset-0 rounded-xl border border-mint/15 bg-mint/[0.035]" transition={{ type: 'spring', stiffness: 380, damping: 34 }} />}
                      <div className="relative flex gap-3">
                        <span className={`mt-[9px] h-px w-3 shrink-0 transition-all duration-300 ${hovered === i ? 'w-5 bg-mint' : 'bg-fog-600'}`} />
                        <div>
                          <p className="text-[15px] leading-relaxed text-fog-300">{h.text}</p>
                          <AnimatePresence>
                            {hovered === i && (
                              <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease }}
                                className="overflow-hidden font-mono text-[12px] leading-relaxed text-mint/80">
                                <span className="block pt-2">↳ {h.context}</span>
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-2">
                  {job.stack.map((s, i) => (
                    <motion.span key={s} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.03 }} whileHover={{ y: -2 }} className="tag">{s}</motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.li>
  );
}

export default function Experience() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.7', 'end 0.6'] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <section id="experience" className="relative py-28 md:py-40">
      <div className="container-x">
        <SectionHeading index="02" eyebrow="Experience" title="Where I've been building." accent={['building.']}
          kicker="Hover any line to see the engineering behind it. Expand a role for the full picture." />
        <div ref={ref} className="relative">
          <div className="absolute bottom-0 left-[7px] top-2 w-px bg-white/[0.06] md:left-[204px]" />
          <motion.div style={{ scaleY }} className="absolute bottom-0 left-[7px] top-2 w-px origin-top bg-gradient-to-b from-mint via-sky to-iris md:left-[204px]" />
          <ol className="space-y-20 md:space-y-28">
            {experience.map((job, i) => <Role key={job.company} job={job} index={i} />)}
          </ol>
        </div>
      </div>
    </section>
  );
}
