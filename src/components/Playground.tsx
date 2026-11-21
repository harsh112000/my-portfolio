import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SectionHeading } from './Reveal';
import { ease, viewport } from '../lib/motion';
import { usePrefersReducedMotion } from '../hooks/useMedia';

type NodeId = 'client' | 'gateway' | 'service' | 'redis' | 'mysql';
const N: Record<NodeId, { x: number; y: number; label: string; sub: string; icon: string }> = {
  client: { x: 90, y: 210, label: 'Client', sub: 'browser / app', icon: '◱' },
  gateway: { x: 310, y: 210, label: 'API Gateway', sub: 'auth · rate limit', icon: '⇄' },
  service: { x: 540, y: 210, label: 'Orders Service', sub: 'node.js', icon: '⬡' },
  redis: { x: 780, y: 92, label: 'Redis', sub: 'cache · TTL 20s', icon: '◆' },
  mysql: { x: 780, y: 328, label: 'MySQL', sub: 'source of truth', icon: '▤' },
};
const LINKS: [NodeId, NodeId][] = [['client', 'gateway'], ['gateway', 'service'], ['service', 'redis'], ['service', 'mysql']];

type Hop = { from: NodeId; to: NodeId; title: string; detail: string; ms: number; dir: 'req' | 'res' };

const TTL = 20_000;

function buildHops(hit: boolean): Hop[] {
  const head: Hop[] = [
    { from: 'client', to: 'gateway', title: 'Client sends the request', detail: 'GET /orders/42 leaves the client over HTTPS with an auth token attached.', ms: 9, dir: 'req' },
    { from: 'gateway', to: 'service', title: 'Gateway routes it', detail: 'The gateway verifies the token, applies rate limits, and forwards to the orders service.', ms: 3, dir: 'req' },
    { from: 'service', to: 'redis', title: 'Service checks the cache', detail: 'Before touching the database, the service looks up key orders:42 in Redis.', ms: 1, dir: 'req' },
  ];
  const tail: Hop[] = [
    { from: 'service', to: 'gateway', title: 'Service builds the response', detail: 'The order is serialised and handed back through the gateway.', ms: 2, dir: 'res' },
    { from: 'gateway', to: 'client', title: 'Response returns to the client', detail: '200 OK. The client renders the order.', ms: 9, dir: 'res' },
  ];
  if (hit) {
    return [...head, { from: 'redis', to: 'service', title: 'Cache HIT', detail: 'Redis already has the order, so MySQL is never touched. That is the whole point of a cache.', ms: 1, dir: 'res' }, ...tail];
  }
  return [
    ...head,
    { from: 'redis', to: 'service', title: 'Cache MISS', detail: 'Nothing cached for orders:42 (cold, or the TTL expired). Fall through to the database.', ms: 1, dir: 'res' },
    { from: 'service', to: 'mysql', title: 'Query MySQL', detail: 'SELECT * FROM orders WHERE id = 42, served from an indexed primary-key lookup.', ms: 18, dir: 'req' },
    { from: 'mysql', to: 'service', title: 'Persisted row returned', detail: 'MySQL returns the row. The service writes it to Redis with a 20s TTL so the next read is fast.', ms: 18, dir: 'res' },
    ...tail,
  ];
}

type LogEntry = { id: number; hit: boolean; total: number };

export default function Playground() {
  const reduced = usePrefersReducedMotion();
  const [hops, setHops] = useState<Hop[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [stepMode, setStepMode] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [cachedUntil, setCachedUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [log, setLog] = useState<LogEntry[]>([]);
  const runId = useRef(0);

  const running = hops !== null;
  const cacheWarm = cachedUntil > now;
  const hop = hops?.[idx];
  const elapsed = hops ? hops.slice(0, idx + 1).reduce((a, h) => a + h.ms, 0) : 0;

  // Tick only while the cache has a live TTL, so there is no idle loop.
  useEffect(() => {
    if (cachedUntil <= Date.now()) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [cachedUntil]);

  const send = () => {
    if (running) return;
    runId.current += 1;
    setNow(Date.now());
    setHops(buildHops(cachedUntil > Date.now()));
    setIdx(0);
    setWaiting(false);
  };

  const finish = useCallback((h: Hop[]) => {
    const hit = h.length === 6;
    const total = h.reduce((a, x) => a + x.ms, 0);
    setLog((l) => [{ id: runId.current, hit, total }, ...l].slice(0, 5));
    if (!hit) { setCachedUntil(Date.now() + TTL); setNow(Date.now()); }
    setTimeout(() => setHops(null), 900);
  }, []);

  const advance = useCallback(() => {
    if (!hops) return;
    if (hops[idx].from === 'mysql') { setCachedUntil(Date.now() + TTL); setNow(Date.now()); }
    if (idx >= hops.length - 1) finish(hops);
    else { setIdx((i) => i + 1); setWaiting(false); }
  }, [hops, idx, finish]);

  const onHopDone = () => {
    if (stepMode) setWaiting(true);
    else setTimeout(advance, reduced ? 600 : 380);
  };

  const active = useMemo(() => new Set(hop ? [hop.from, hop.to] : []), [hop]);
  const ttlPct = cacheWarm ? Math.max(0, (cachedUntil - now) / TTL) : 0;
  const from = hop ? N[hop.from] : null, to = hop ? N[hop.to] : null;
  const color = hop?.dir === 'res' ? '#a78bfa' : '#5eead4';

  return (
    <section id="systems" className="relative py-28 md:py-40">
      <div className="container-x">
        <SectionHeading index="04" eyebrow="Interactive" title="How systems work." accent={['work.']}
          kicker="A small simulation of a read path I build every week. Send a request and follow it hop by hop. Send another within 20 seconds to see the cache earn its keep." />

        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewport} transition={{ duration: 1, ease }}
          className="overflow-hidden rounded-3xl border border-white/[0.08] bg-ink-900/60 backdrop-blur-sm">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 border-b hairline px-5 py-4 md:px-7">
            <button onClick={send} disabled={running}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-mint px-5 py-2.5 text-[13px] font-medium text-ink-950 transition disabled:cursor-not-allowed disabled:opacity-40">
              <span className="absolute inset-0 -translate-x-full bg-white/40 transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative">{running ? 'In flight…' : 'Send request'}</span>
              <span className="relative font-mono text-[11px] opacity-70">GET /orders/42</span>
            </button>
            {stepMode && running && (
              <button onClick={advance} disabled={!waiting} className="rounded-full border border-mint/50 px-4 py-2.5 font-mono text-[12px] text-mint transition disabled:opacity-30">Next step →</button>
            )}
            <div className="ml-auto flex items-center gap-2">
              <label className="flex cursor-pointer select-none items-center gap-2 rounded-full border border-white/10 px-3 py-2 font-mono text-[11px] text-fog-300">
                <span className={`relative h-4 w-7 rounded-full transition-colors ${stepMode ? 'bg-mint/70' : 'bg-white/10'}`}>
                  <motion.span layout className={`absolute top-0.5 h-3 w-3 rounded-full bg-fog-100 ${stepMode ? 'right-0.5' : 'left-0.5'}`} />
                </span>
                <input type="checkbox" className="sr-only" checked={stepMode} onChange={(e) => setStepMode(e.target.checked)} />
                Step mode
              </label>
              <button onClick={() => { setCachedUntil(0); setNow(Date.now()); }} disabled={!cacheWarm || running}
                className="rounded-full border border-white/10 px-3 py-2 font-mono text-[11px] text-fog-300 transition hover:border-iris/50 hover:text-iris disabled:opacity-30">
                Flush cache
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_300px]">
            {/* Diagram */}
            <div className="relative overflow-x-auto px-2 py-6 md:px-6">
              <svg viewBox="0 0 900 420" className="mx-auto w-full min-w-[620px]" role="img" aria-label="Simulated request flow from client through gateway and service to Redis and MySQL">
                <defs>
                  <pattern id="pg-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="rgba(255,255,255,.035)" /></pattern>
                  <filter id="glow"><feGaussianBlur stdDeviation="6" /></filter>
                </defs>
                <rect width="900" height="420" fill="url(#pg-grid)" />
                {LINKS.map(([a, b]) => {
                  const on = hop && ((hop.from === a && hop.to === b) || (hop.from === b && hop.to === a));
                  return (
                    <g key={a + b}>
                      <line x1={N[a].x} y1={N[a].y} x2={N[b].x} y2={N[b].y} stroke="rgba(255,255,255,.1)" strokeWidth="1.5" strokeDasharray="4 6" />
                      <motion.line x1={N[a].x} y1={N[a].y} x2={N[b].x} y2={N[b].y} stroke={color} strokeWidth="1.5" animate={{ opacity: on ? 0.8 : 0 }} transition={{ duration: 0.3 }} />
                    </g>
                  );
                })}

                {(Object.keys(N) as NodeId[]).map((id) => {
                  const n = N[id], on = active.has(id);
                  const dim = id === 'mysql' && running && hops?.length === 6;
                  return (
                    <g key={id} opacity={dim ? 0.35 : 1} style={{ transition: 'opacity .4s' }}>
                      <motion.rect x={n.x - 82} y={n.y - 38} width="164" height="76" rx="16" fill={color} filter="url(#glow)"
                        animate={{ opacity: on ? 0.22 : 0 }} transition={{ duration: 0.35 }} />
                      <rect x={n.x - 80} y={n.y - 36} width="160" height="72" rx="14" fill="#0b0f17" stroke={on ? color : 'rgba(255,255,255,.12)'} strokeWidth="1.2" style={{ transition: 'stroke .35s' }} />
                      <text x={n.x - 62} y={n.y + 6} fontSize="20" fill={on ? color : '#646e80'} style={{ transition: 'fill .35s' }}>{n.icon}</text>
                      <text x={n.x - 34} y={n.y - 2} fontSize="14" className="fill-fog-100" fontWeight={500}>{n.label}</text>
                      <text x={n.x - 34} y={n.y + 16} fontSize="10.5" className="fill-fog-500 font-mono">{n.sub}</text>
                      {id === 'redis' && (
                        <g>
                          <rect x={n.x - 56} y={n.y + 44} width="112" height="3" rx="1.5" fill="rgba(255,255,255,.08)" />
                          <rect x={n.x - 56} y={n.y + 44} width={112 * ttlPct} height="3" rx="1.5" fill="#a78bfa" />
                          <text x={n.x} y={n.y + 64} textAnchor="middle" fontSize="10" className="fill-fog-500 font-mono">
                            {cacheWarm ? `orders:42 cached · ${Math.ceil((cachedUntil - now) / 1000)}s` : 'cold'}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {from && to && (
                  <motion.g key={`${runId.current}-${idx}`} initial={{ x: from.x, y: from.y }} animate={{ x: to.x, y: to.y }}
                    transition={{ duration: reduced ? 0 : 0.85, ease: [0.65, 0, 0.35, 1] }} onAnimationComplete={onHopDone}>
                    <circle r="16" fill={color} opacity=".18" />
                    <circle r="6" fill={color} />
                    <circle r="2.5" fill="#fff" />
                  </motion.g>
                )}
              </svg>
            </div>

            {/* Explanation + log */}
            <aside className="flex flex-col border-t hairline lg:border-l lg:border-t-0">
              <div className="min-h-[190px] flex-1 p-6" aria-live="polite">
                <div className="mb-4 flex items-center justify-between font-mono text-[11px] text-fog-500">
                  <span>{running ? `Step ${idx + 1} / ${hops!.length}` : 'Idle'}</span>
                  {running && <span className="tabular-nums">t = {elapsed}ms <span className="text-fog-600">(sim)</span></span>}
                </div>
                <AnimatePresence mode="wait">
                  {hop ? (
                    <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35, ease }}>
                      <h3 className="text-[17px] font-medium tracking-tight" style={{ color }}>{hop.title}</h3>
                      <p className="mt-2 text-[14px] leading-relaxed text-fog-300">{hop.detail}</p>
                      <div className="mt-4 font-mono text-[11px] text-fog-500">{N[hop.from].label} → {N[hop.to].label} · +{hop.ms}ms</div>
                    </motion.div>
                  ) : (
                    <motion.p key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[14px] leading-relaxed text-fog-400">
                      Press <span className="text-mint">Send request</span> to begin. Turn on <span className="text-fog-100">step mode</span> to walk through each hop at your own pace.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <div className="border-t hairline p-6">
                <div className="eyebrow mb-3 text-[10px]">Request log</div>
                <ul className="space-y-2 font-mono text-[12px]">
                  <AnimatePresence initial={false}>
                    {log.length === 0 && <li className="text-fog-600">No requests yet.</li>}
                    {log.map((l) => (
                      <motion.li key={l.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between">
                        <span className="text-fog-400">#{l.id} <span className="text-fog-300">200</span></span>
                        <span className={l.hit ? 'text-iris' : 'text-ember'}>{l.hit ? 'HIT' : 'MISS'}</span>
                        <span className="tabular-nums text-fog-300">{l.total}ms</span>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                {log.some((l) => l.hit) && log.some((l) => !l.hit) && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-[12px] leading-relaxed text-fog-500">
                    Cache hits skip the database round-trip entirely: {Math.round((1 - log.find((l) => l.hit)!.total / log.find((l) => !l.hit)!.total) * 100)}% less simulated latency.
                  </motion.p>
                )}
              </div>
            </aside>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
