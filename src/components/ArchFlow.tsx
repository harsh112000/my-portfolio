import { motion } from 'framer-motion';
import { ease, draw } from '../lib/motion';

// Six-node topology: entry → edge → core service, which fans out to cache, store and an external system.
const P = [
  { x: 58, y: 110 }, { x: 196, y: 110 }, { x: 342, y: 110 },
  { x: 502, y: 36 }, { x: 502, y: 184 }, { x: 648, y: 110 },
];
const E: [number, number][] = [[0, 1], [1, 2], [2, 3], [2, 4], [2, 5], [3, 5]];

const path = (a: number, b: number) => {
  const A = P[a], B = P[b];
  const mx = (A.x + B.x) / 2;
  return `M${A.x},${A.y} C${mx},${A.y} ${mx},${B.y} ${B.x},${B.y}`;
};

export default function ArchFlow({ labels, color, active, detailed = false }: { labels: string[]; color: string; active: boolean; detailed?: boolean }) {
  return (
    <svg viewBox="0 0 710 220" className="h-full w-full" role="img" aria-label={`Request flow: ${labels.join(' to ')}`}>
      <defs>
        <radialGradient id={`dot-${color}`}><stop offset="0" stopColor="#fff" /><stop offset=".35" stopColor={color} /><stop offset="1" stopColor={color} stopOpacity="0" /></radialGradient>
      </defs>
      {E.map(([a, b], i) => (
        <g key={i}>
          <path d={path(a, b)} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="1.2" />
          <motion.path d={path(a, b)} fill="none" stroke={color} strokeWidth="1.2" strokeOpacity=".7"
            initial={draw(0)} animate={draw(active ? 1 : 0)} transition={{ duration: 0.9, delay: active ? i * 0.12 : 0, ease }} />
          {active && (
            <circle r={detailed ? 5 : 6} fill={`url(#dot-${color})`} opacity="0">
              <set attributeName="opacity" to="1" begin={`${0.9 + i * 0.35}s`} />
              <animateMotion dur="2.4s" begin={`${0.9 + i * 0.35}s`} repeatCount="indefinite" path={path(a, b)} calcMode="spline" keyPoints="0;1" keyTimes="0;1" keySplines=".5 0 .3 1" />
            </circle>
          )}
        </g>
      ))}
      {P.map((p, i) => {
        const w = Math.max(detailed ? 104 : 92, labels[i].length * (detailed ? 7.4 : 7.2) + 22);
        return (
        <motion.g key={i} initial={false} animate={{ opacity: active ? 1 : 0.8 }} transition={{ delay: active ? i * 0.08 : 0 }}>
          <rect x={p.x - w / 2} y={p.y - 17} width={w} height="34" rx="9" fill="#0b0f17" stroke={active ? color : 'rgba(255,255,255,.12)'} strokeOpacity={active ? 0.55 : 1} style={{ transition: 'stroke .4s' }} />
          <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize={detailed ? 11.5 : 11} className="fill-fog-300 font-mono">{labels[i]}</text>
        </motion.g>
        );
      })}
    </svg>
  );
}
