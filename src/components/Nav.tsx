import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'framer-motion';
import { navItems } from '../data/content';
import { useActiveSection } from '../hooks/useActiveSection';
import { scrollToId } from '../lib/scroll';
import { ease, easeInOut } from '../lib/motion';
import Magnetic from './Magnetic';

const ids = navItems.map((n) => n.id);

export default function Nav({ ready }: { ready: boolean }) {
  const active = useActiveSection(ids);
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(y > 400 && y > prev + 2 && !open);
    if (y < prev - 2) setHidden(false);
  });

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [open]);

  const go = (id: string) => { setOpen(false); setTimeout(() => scrollToId(id), open ? 350 : 0); };

  return (
    <>
      <motion.div className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-mint via-sky to-iris" style={{ scaleX: progress }} />
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={ready ? { y: hidden ? -90 : 0, opacity: 1 } : {}}
        transition={{ duration: 0.7, ease }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div className={`transition-[background-color,border-color,backdrop-filter] duration-500 ${scrolled ? 'glass border-b hairline' : 'border-b border-transparent'}`}>
          <nav className="container-x flex h-[68px] items-center justify-between" aria-label="Primary">
            <button onClick={() => go('top')} className="group flex items-center gap-3" aria-label="Back to top">
              <span className="relative grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-ink-850 font-mono text-[13px] font-medium text-fog-100 transition-colors group-hover:border-mint/50">
                HS
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-mint shadow-[0_0_10px_#5eead4]" />
              </span>
              <span className="hidden text-sm font-medium tracking-tight text-fog-100 sm:block">Harsh Srivastava</span>
            </button>

            <ul className="hidden items-center gap-1 lg:flex" onPointerLeave={() => setHovered(null)}>
              {navItems.map((item, i) => (
                <motion.li key={item.id} initial={{ opacity: 0, y: -8 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.15 + i * 0.05, duration: 0.6, ease }}>
                  <button
                    onClick={() => go(item.id)}
                    onPointerEnter={() => setHovered(item.id)}
                    className={`relative px-3 py-2 text-[13px] transition-colors duration-300 ${active === item.id ? 'text-fog-100' : 'text-fog-400 hover:text-fog-100'}`}
                  >
                    {hovered === item.id && (
                      <motion.span layoutId="nav-hover" className="absolute inset-0 rounded-lg bg-white/[0.04]" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />
                    )}
                    <span className="relative"><span className="mr-1 font-mono text-[10px] text-mint/70">0{i + 1}</span>{item.label}</span>
                    {active === item.id && (
                      <motion.span layoutId="nav-active" className="absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-mint to-iris" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                    )}
                  </button>
                </motion.li>
              ))}
              <motion.li initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 0.6 }} className="ml-3">
                <Magnetic>
                  <a href="resume.pdf" target="_blank" rel="noreferrer" className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-mint/40 px-4 py-2 font-mono text-[12px] text-mint transition-colors hover:text-ink-950">
                    <span className="absolute inset-0 translate-y-full rounded-full bg-mint transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-y-0" />
                    <span className="relative">Résumé</span>
                  </a>
                </Magnetic>
              </motion.li>
            </ul>

            <button onClick={() => setOpen((o) => !o)} className="relative z-[60] grid h-10 w-10 place-items-center lg:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
              <motion.span className="absolute h-px w-6 bg-fog-100" animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }} transition={{ duration: 0.4, ease }} />
              <motion.span className="absolute h-px w-6 bg-fog-100" animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }} transition={{ duration: 0.4, ease }} />
            </button>
          </nav>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[55] flex flex-col bg-ink-950/95 backdrop-blur-xl lg:hidden"
            initial={{ clipPath: 'circle(0% at calc(100% - 36px) 34px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 36px) 34px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 36px) 34px)' }}
            transition={{ duration: 0.7, ease: easeInOut }}
          >
            <ul className="container-x mt-28 flex flex-col gap-2">
              {navItems.map((item, i) => (
                <motion.li key={item.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ delay: 0.15 + i * 0.05, duration: 0.6, ease }}>
                  <button onClick={() => go(item.id)} className="flex w-full items-baseline gap-4 border-b hairline py-4 text-left">
                    <span className="font-mono text-xs text-mint">0{i + 1}</span>
                    <span className={`text-3xl font-medium tracking-tight ${active === item.id ? 'text-fog-100' : 'text-fog-400'}`}>{item.label}</span>
                  </button>
                </motion.li>
              ))}
            </ul>
            <motion.a initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} href="resume.pdf" target="_blank" rel="noreferrer" className="container-x mt-10 font-mono text-sm text-mint">
              Download résumé →
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
