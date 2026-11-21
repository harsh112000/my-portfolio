import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import Magnetic from './Magnetic';
import { SplitWords } from './Reveal';
import { profile } from '../data/content';
import { scrollToId } from '../lib/scroll';
import { ease, viewport } from '../lib/motion';

const Icon = {
  linkedin: <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4v11H3zm7 0h3.8v1.6h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1v5.35h-4v-4.75c0-1.13-.02-2.6-1.58-2.6-1.59 0-1.83 1.24-1.83 2.52v4.83h-4z" fill="currentColor" />,
  github: <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" fill="currentColor" />,
  leetcode: <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  mail: <path d="M3 6.5 12 13l9-6.5M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinejoin="round" />,
};

function LocalTime() {
  const fmt = () => new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }).format(new Date());
  const [t, setT] = useState(fmt);
  useEffect(() => { const i = setInterval(() => setT(fmt()), 30_000); return () => clearInterval(i); }, []);
  return <span className="tabular-nums">{t} IST</span>;
}

export default function Footer() {
  const [copied, setCopied] = useState(false);
  const { scrollYProgress } = useScroll();
  const ring = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const dash = useTransform(ring, (v) => 2 * Math.PI * 22 * (1 - v));

  const copy = async () => {
    try { await navigator.clipboard.writeText(profile.email); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    catch { window.location.href = `mailto:${profile.email}`; }
  };

  const socials = [
    { k: 'linkedin', href: profile.socials.linkedin, label: 'LinkedIn' },
    profile.socials.github && { k: 'github', href: profile.socials.github, label: 'GitHub' },
    { k: 'leetcode', href: profile.socials.leetcode, label: 'LeetCode' },
    { k: 'mail', href: `mailto:${profile.email}`, label: 'Email' },
  ].filter(Boolean) as { k: keyof typeof Icon; href: string; label: string }[];

  return (
    <footer id="contact" className="relative overflow-hidden pt-28 md:pt-40">
      {/* Slow-moving gradient field */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[80%]">
        <div className="absolute -bottom-1/2 left-[10%] h-[120%] w-[80%] rounded-full opacity-25 blur-[120px] motion-safe:animate-[footer-flow_18s_ease-in-out_infinite_alternate]"
          style={{ background: 'conic-gradient(from 90deg, #5eead4, #7dd3fc, #a78bfa, #5eead4)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950 via-ink-950/70 to-transparent" />
      </div>

      <div className="container-x relative">
        <motion.div className="mb-8 flex items-center gap-4" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={viewport}>
          <span className="font-mono text-xs text-mint">07</span>
          <span className="h-px w-16 bg-gradient-to-r from-mint/60 to-transparent" />
          <span className="eyebrow">What's next</span>
        </motion.div>

        <h2 className="max-w-5xl text-[clamp(2.5rem,6.6vw,6rem)] font-medium leading-[0.95] tracking-tightest text-fog-100">
          <SplitWords text="Let's build something that holds up." gradient={['holds', 'up.']} />
        </h2>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewport} transition={{ duration: 0.9, ease, delay: 0.3 }}
          className="mt-12 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <p className="max-w-md text-[16px] leading-relaxed text-fog-400">
            I'm interested in senior backend, platform and fintech infrastructure roles, and in hard problems where correctness matters. My inbox is open.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Magnetic strength={0.25}>
              <a href={`mailto:${profile.email}`} className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-fog-100 px-7 py-4 text-[15px] font-medium text-ink-950">
                <span className="absolute inset-0 translate-y-full bg-gradient-to-r from-mint to-sky transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-y-0" />
                <span className="relative">Say hello</span>
                <span className="relative transition-transform duration-500 group-hover:translate-x-1">→</span>
              </a>
            </Magnetic>
            <button onClick={copy} className="relative rounded-full border border-white/15 px-5 py-4 font-mono text-[12px] text-fog-300 transition-colors hover:border-mint/50 hover:text-fog-100" aria-live="polite">
              <motion.span key={copied ? 'c' : 'e'} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="inline-block">
                {copied ? '✓ Copied to clipboard' : profile.email}
              </motion.span>
            </button>
          </div>
        </motion.div>

        <div className="mt-28 flex flex-col gap-10 border-t hairline py-10 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="pulse-ring absolute inset-0 rounded-full bg-mint" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-mint" />
            </span>
            <span className="text-[13px] text-fog-300">Available for new opportunities</span>
            <span className="font-mono text-[12px] text-fog-500">· {profile.location} · <LocalTime /></span>
          </div>

          <ul className="flex items-center gap-2">
            {socials.map((s, i) => (
              <motion.li key={s.k} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewport} transition={{ delay: i * 0.06 }}>
                <Magnetic strength={0.4}>
                  <a href={s.href} target={s.k === 'mail' ? undefined : '_blank'} rel="noreferrer" aria-label={s.label}
                    className="group relative grid h-11 w-11 place-items-center rounded-full border border-white/10 text-fog-400 transition-colors duration-300 hover:border-mint/50 hover:text-mint">
                    <svg width="17" height="17" viewBox="0 0 24 24" className="transition-transform duration-300 group-hover:scale-110">{Icon[s.k]}</svg>
                    <span className="pointer-events-none absolute -top-9 whitespace-nowrap rounded-md border border-white/10 bg-ink-850 px-2 py-1 font-mono text-[10px] text-fog-300 opacity-0 transition-all duration-300 group-hover:-translate-y-1 group-hover:opacity-100">{s.label}</span>
                  </a>
                </Magnetic>
              </motion.li>
            ))}
            <li className="ml-3">
              <Magnetic strength={0.4}>
                <button onClick={() => scrollToId('top')} aria-label="Back to top" className="group relative grid h-14 w-14 place-items-center">
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,.1)" />
                    <motion.circle cx="28" cy="28" r="22" fill="none" stroke="#5eead4" strokeWidth="1.5" strokeDasharray={2 * Math.PI * 22} style={{ strokeDashoffset: dash }} strokeLinecap="round" />
                  </svg>
                  <span className="relative grid h-5 w-5 place-items-center overflow-hidden text-fog-300 group-hover:text-mint">
                    <span className="transition-transform duration-500 group-hover:-translate-y-[150%]">↑</span>
                    <span className="absolute translate-y-[150%] transition-transform duration-500 group-hover:translate-y-0">↑</span>
                  </span>
                </button>
              </Magnetic>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-2 pb-10 font-mono text-[11px] text-fog-600 md:flex-row md:justify-between">
          <span>© {new Date().getFullYear()} Harsh Srivastava</span>
          <span>Designed & engineered with React, Framer Motion and a lot of idempotency keys.</span>
        </div>
      </div>
    </footer>
  );
}
