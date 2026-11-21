import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { SectionHeading } from './Reveal';
import { skills, skillGroups } from '../data/content';
import { ease, viewport, draw } from '../lib/motion';

const byId = Object.fromEntries(skills.map((s) => [s.id, s]));
const edges = skills.flatMap((s) => s.links.filter((l) => byId[l]).map((l) => [s.id, l] as [string, string]));

export default function Skills() {
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const [hoverGroup, setHoverGroup] = useState<string | null>(null);

  // Everything one hop from the hovered node, in either direction.
  const lit = useMemo(() => {
    if (hoverNode) {
      const set = new Set([hoverNode]);
      edges.forEach(([a, b]) => { if (a === hoverNode) set.add(b); if (b === hoverNode) set.add(a); });
      return set;
    }
    if (hoverGroup) return new Set(skills.filter((s) => s.group === hoverGroup).map((s) => s.id));
    return null;
  }, [hoverNode, hoverGroup]);

  const focus = hoverNode ? byId[hoverNode] : null;

  return (
    <section id="skills" className="relative py-28 md:py-40">
      <div className="container-x">
        <SectionHeading index="05" eyebrow="Stack" title="Tools, connected the way I use them." accent={['connected']}
          kicker="No percentages. Each line is a pairing I've shipped to production. Hover a technology to see what it works with." />

        <div className="mb-8 flex flex-wrap gap-2" onPointerLeave={() => setHoverGroup(null)}>
          {Object.entries(skillGroups).map(([k, g], i) => (
            <motion.button key={k} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewport} transition={{ delay: i * 0.06, duration: 0.6, ease }}
              onPointerEnter={() => setHoverGroup(k)} onFocus={() => setHoverGroup(k)} onBlur={() => setHoverGroup(null)}
              className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12px] transition-colors duration-300 ${hoverGroup === k ? 'border-white/25 text-fog-100' : 'border-white/[0.08] text-fog-400'}`}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: g.color, boxShadow: hoverGroup === k ? `0 0 10px ${g.color}` : 'none' }} />
              {g.label}
            </motion.button>
          ))}
        </div>

        {/* Constellation (tablet and up) */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={viewport} transition={{ duration: 1 }}
          className="relative hidden overflow-hidden rounded-3xl border border-white/[0.07] bg-ink-900/40 md:block">
          <svg viewBox="0 0 1000 560" className="w-full" onPointerLeave={() => setHoverNode(null)}>
            {edges.map(([a, b], i) => {
              const A = byId[a], B = byId[b];
              const on = lit ? lit.has(a) && lit.has(b) && (!hoverNode || a === hoverNode || b === hoverNode) : false;
              return (
                <motion.line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y}
                  stroke={on ? skillGroups[(hoverNode ? byId[hoverNode] : A).group].color : 'rgba(255,255,255,0.07)'}
                  strokeWidth={on ? 1.4 : 1}
                  initial={draw(0)} whileInView={draw(1)} viewport={{ once: true }}
                  transition={{ pathLength: { duration: 1.4, delay: 0.3 + i * 0.02, ease } }}
                  style={{ transition: 'stroke .3s, stroke-width .3s' }} />
              );
            })}
            {skills.map((s, i) => {
              const g = skillGroups[s.group];
              const on = !lit || lit.has(s.id);
              const isHover = hoverNode === s.id;
              const w = s.label.length * 7.4 + 28;
              return (
                <motion.g key={s.id}
                  initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.03, duration: 0.7, ease }}
                  style={{ transformOrigin: `${s.x}px ${s.y}px`, cursor: 'pointer' }}
                  onPointerEnter={() => setHoverNode(s.id)}
                  tabIndex={0} onFocus={() => setHoverNode(s.id)} onBlur={() => setHoverNode(null)}
                  role="button" aria-label={`${s.label}, ${g.label}`}
                >
                  <g style={{ opacity: on ? 1 : 0.22, transition: 'opacity .35s' }}>
                    <motion.rect x={s.x - w / 2} y={s.y - 15} width={w} height="30" rx="15"
                      fill="#0b0f17" stroke={isHover ? g.color : on && lit ? `${g.color}88` : 'rgba(255,255,255,0.1)'}
                      animate={{ scale: isHover ? 1.08 : 1 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                      style={{ transformOrigin: `${s.x}px ${s.y}px`, transition: 'stroke .3s' }} />
                    <circle cx={s.x - w / 2 + 14} cy={s.y} r="3" fill={g.color} />
                    <text x={s.x + 6} y={s.y + 4} textAnchor="middle" fontSize="12" className="fill-fog-300 font-mono" style={{ fill: isHover ? '#eef1f6' : undefined }}>{s.label}</text>
                  </g>
                </motion.g>
              );
            })}
          </svg>
          <div className="pointer-events-none absolute bottom-5 left-6 font-mono text-[11px] text-fog-500">
            {focus ? (
              <motion.span key={focus.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                <span style={{ color: skillGroups[focus.group].color }}>{focus.label}</span> → {[...(lit ?? [])].filter((x) => x !== focus.id).map((x) => byId[x].label).join(' · ') || 'standalone'}
              </motion.span>
            ) : hoverGroup ? skillGroups[hoverGroup].note : 'hover to explore connections'}
          </div>
        </motion.div>

        {/* Cluster cards (all sizes; primary on mobile) */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Object.entries(skillGroups).map(([k, g], i) => (
            <motion.div key={k} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewport} transition={{ delay: i * 0.08, duration: 0.8, ease }}
              onPointerEnter={() => setHoverGroup(k)} onPointerLeave={() => setHoverGroup(null)}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-900/40 p-5 transition-colors duration-500 hover:border-white/15">
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-30" style={{ background: g.color }} />
              <div className="relative flex items-center gap-2">
                <motion.span className="h-2 w-2 rounded-full" style={{ background: g.color }} whileInView={{ scale: [1, 1.6, 1] }} viewport={{ once: true }} transition={{ delay: 0.6 + i * 0.1, duration: 0.6 }} />
                <h3 className="text-[14px] font-medium text-fog-100">{g.label}</h3>
              </div>
              <p className="relative mt-2 text-[12px] text-fog-500">{g.note}</p>
              <ul className="relative mt-4 flex flex-wrap gap-1.5">
                {skills.filter((s) => s.group === k).map((s) => (
                  <li key={s.id} className="tag text-[10.5px] group-hover:border-white/15">{s.label}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
