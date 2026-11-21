import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { terminalScript, profile, experience } from '../data/content';
import { scrollToId } from '../lib/scroll';
import { usePrefersReducedMotion } from '../hooks/useMedia';

type Line = { kind: 'cmd' | 'out' | 'hint'; text: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const commands: Record<string, () => string[] | 'clear'> = {
  help: () => ['Available commands:', '  whoami · specialization · experience · stack', '  projects · systems · contact · resume · clear'],
  whoami: () => [profile.name, `${profile.role} · ${profile.location}`],
  specialization: () => ['Backend Engineering', 'Distributed Systems', 'Scalable Architecture'],
  experience: () => experience.map((e) => `${e.period.padEnd(20)} ${e.role} @ ${e.company}`),
  stack: () => ['Node.js · TypeScript · Express · Kafka · Redis', 'MySQL · PostgreSQL · MongoDB · AWS · React'],
  projects: () => { scrollToId('work'); return ['→ scrolling to selected work…']; },
  systems: () => { scrollToId('systems'); return ['→ opening the request-flow simulator…']; },
  contact: () => [`email    ${profile.email}`, `linkedin ${profile.socials.linkedin.replace('https://www.', '')}`],
  resume: () => {
    const a = Object.assign(document.createElement('a'), { href: 'resume.pdf', target: '_blank', rel: 'noreferrer' });
    a.click();
    return ['→ opening résumé.pdf'];
  },
  status: () => ['Building systems that scale…'],
  clear: () => 'clear',
  sudo: () => ['Nice try. Permission granted only after an interview. 😉'],
  ls: () => ['about.md  experience/  projects/  systems.sim  resume.pdf'],
};

export default function Terminal({ start }: { start: boolean }) {
  const reduced = usePrefersReducedMotion();
  const [lines, setLines] = useState<Line[]>([]);
  const [typing, setTyping] = useState('');
  const [done, setDone] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const [run, setRun] = useState(0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scripted intro: types each command with human-ish cadence, then prints output line by line.
  useEffect(() => {
    if (!start) return;
    let cancelled = false;
    setLines([]); setDone(false); setTyping('');
    (async () => {
      await sleep(reduced ? 0 : 500);
      for (const step of terminalScript) {
        if (reduced) {
          setLines((l) => [...l, { kind: 'cmd', text: step.cmd }, ...step.out.map((t) => ({ kind: 'out' as const, text: t }))]);
          continue;
        }
        for (let i = 1; i <= step.cmd.length; i++) {
          if (cancelled) return;
          setTyping(step.cmd.slice(0, i));
          await sleep(45 + Math.random() * 70 + (step.cmd[i - 1] === ' ' ? 60 : 0));
        }
        await sleep(260);
        if (cancelled) return;
        setTyping('');
        setLines((l) => [...l, { kind: 'cmd', text: step.cmd }]);
        for (const out of step.out) {
          await sleep(110);
          if (cancelled) return;
          setLines((l) => [...l, { kind: 'out', text: out }]);
        }
        await sleep(520);
      }
      if (!cancelled) {
        setLines((l) => [...l, { kind: 'hint', text: "Type 'help' to explore." }]);
        setDone(true);
      }
    })();
    return () => { cancelled = true; };
  }, [start, run, reduced]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: reduced ? 'auto' : 'smooth' });
  }, [lines, typing, reduced]);

  const submit = () => {
    const raw = input.trim();
    setInput(''); setHIdx(-1);
    if (!raw) return;
    setHistory((h) => [raw, ...h].slice(0, 20));
    const key = raw.split(' ')[0].toLowerCase();
    const fn = commands[key];
    const out = fn ? fn() : [`command not found: ${key}. Try 'help'.`];
    if (out === 'clear') { setLines([]); return; }
    setLines((l) => [...l, { kind: 'cmd', text: raw }, ...out.map((t) => ({ kind: 'out' as const, text: t }))]);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit();
    else if (e.key === 'ArrowUp') { e.preventDefault(); const i = Math.min(hIdx + 1, history.length - 1); if (history[i]) { setHIdx(i); setInput(history[i]); } }
    else if (e.key === 'ArrowDown') { e.preventDefault(); const i = hIdx - 1; setHIdx(i); setInput(i >= 0 ? history[i] : ''); }
    else if (e.key === 'Tab') {
      e.preventDefault();
      const m = Object.keys(commands).find((c) => c.startsWith(input.toLowerCase()) && input);
      if (m) setInput(m);
    }
  };

  const Prompt = () => (
    <span className="select-none">
      <span className="text-mint">harsh</span>
      <span className="text-fog-500">@</span>
      <span className="text-sky">prod</span>
      <span className="text-fog-500"> ~ $ </span>
    </span>
  );

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900/80 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.02)_inset] backdrop-blur-xl"
      onClick={() => done && inputRef.current?.focus({ preventScroll: true })}
      data-cursor={done ? 'type' : undefined}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-mint/50 to-transparent" />
      <div className="flex items-center gap-2 border-b hairline px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
        <span className="ml-3 font-mono text-[11px] text-fog-500">~/harsh — zsh</span>
        <button
          onClick={(e) => { e.stopPropagation(); setRun((r) => r + 1); }}
          className="ml-auto rounded-md px-2 py-0.5 font-mono text-[10px] text-fog-500 opacity-0 transition hover:bg-white/5 hover:text-fog-100 group-hover:opacity-100 focus-visible:opacity-100"
          aria-label="Replay terminal intro"
        >
          ↻ replay
        </button>
      </div>
      <div ref={bodyRef} className="h-[300px] overflow-y-auto px-4 py-4 font-mono text-[12.5px] leading-[1.75] sm:h-[330px] sm:text-[13px] [scrollbar-width:none]" aria-live="polite">
        {lines.map((l, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
            {l.kind === 'cmd' && <><Prompt /><span className="text-fog-100">{l.text}</span></>}
            {l.kind === 'out' && <span className="pl-0 text-fog-300">{l.text}</span>}
            {l.kind === 'hint' && <span className="text-fog-500"># {l.text}</span>}
          </motion.div>
        ))}
        {!done && (
          <div><Prompt /><span className="text-fog-100">{typing}</span><span className="caret ml-px inline-block h-[1.05em] w-[7px] translate-y-[3px] bg-mint" /></div>
        )}
        {done && (
          <label className="flex items-center">
            <Prompt />
            <span className="relative flex-1">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                aria-label="Terminal input"
                className="w-full bg-transparent text-fog-100 caret-transparent outline-none"
              />
              <span aria-hidden className="pointer-events-none absolute left-0 top-0 whitespace-pre text-transparent">
                {input}<span className="caret inline-block h-[1.05em] w-[7px] translate-y-[3px] bg-mint" />
              </span>
            </span>
          </label>
        )}
      </div>
    </div>
  );
}
