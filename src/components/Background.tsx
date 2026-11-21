import { useEffect, useRef } from 'react';
import { useFinePointer, usePrefersReducedMotion, useMedia } from '../hooks/useMedia';

/**
 * Fixed, understated backdrop:
 *  - a fine grid with a brighter copy revealed around the cursor (CSS mask, no repaint cost)
 *  - two slow gradient lights (compositor-only transforms)
 *  - a sparse canvas of drifting nodes; nearby nodes link, and a pulse occasionally runs along a link
 */
export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const small = useMedia('(max-width: 768px)');

  // Cursor position → CSS variables, rAF-throttled
  useEffect(() => {
    if (!fine) return;
    let raf = 0, x = 0, y = 0;
    const root = document.documentElement;
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      if (!raf) raf = requestAnimationFrame(() => {
        root.style.setProperty('--mx', `${x}px`);
        root.style.setProperty('--my', `${y}px`);
        raf = 0;
      });
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => { window.removeEventListener('pointermove', move); cancelAnimationFrame(raf); };
  }, [fine]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0, running = true, last = performance.now();
    const count = small ? 22 : 46;
    const linkDist = small ? 120 : 160;
    type N = { x: number; y: number; vx: number; vy: number; r: number };
    let nodes: N[] = [];
    let pulse: { a: number; b: number; t: number } | null = null;
    let nextPulse = 1500;

    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.08, vy: (Math.random() - 0.5) * 0.08,
        r: Math.random() * 1.1 + 0.4,
      }));
      draw(0);
    };

    const draw = (dt: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes) {
        n.x += n.vx * dt; n.y += n.vy * dt;
        if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;
      }
      const pairs: [number, number][] = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < linkDist) {
            pairs.push([i, j]);
            ctx.strokeStyle = `rgba(148, 196, 220, ${(1 - d / linkDist) * 0.09})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.fillStyle = 'rgba(200, 225, 240, 0.35)';
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      }
      // Occasional pulse along a live link
      if (!reduced) {
        nextPulse -= dt;
        if (!pulse && nextPulse <= 0 && pairs.length) {
          const [a, b] = pairs[Math.floor(Math.random() * pairs.length)];
          pulse = { a, b, t: 0 };
          nextPulse = 2200 + Math.random() * 2600;
        }
        if (pulse) {
          pulse.t += dt / 900;
          const A = nodes[pulse.a], B = nodes[pulse.b];
          if (pulse.t >= 1 || Math.hypot(A.x - B.x, A.y - B.y) > linkDist) pulse = null;
          else {
            const px = A.x + (B.x - A.x) * pulse.t, py = A.y + (B.y - A.y) * pulse.t;
            const g = ctx.createLinearGradient(A.x, A.y, B.x, B.y);
            g.addColorStop(0, 'rgba(94,234,212,0)');
            g.addColorStop(Math.max(0, pulse.t - 0.001), 'rgba(94,234,212,0.5)');
            g.addColorStop(Math.min(1, pulse.t + 0.001), 'rgba(94,234,212,0)');
            ctx.strokeStyle = g; ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
            ctx.fillStyle = 'rgba(94,234,212,0.9)';
            ctx.beginPath(); ctx.arc(px, py, 1.8, 0, Math.PI * 2); ctx.fill();
          }
        }
      }
    };

    const loop = (t: number) => {
      const dt = Math.min(t - last, 50); last = t;
      if (running) draw(dt);
      raf = requestAnimationFrame(loop);
    };
    const vis = () => { running = !document.hidden; last = performance.now(); };

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', vis);
    if (!reduced) raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', vis);
    };
  }, [reduced, small]);

  const grid = (alpha: number) => ({
    backgroundImage: `linear-gradient(rgba(255,255,255,${alpha}) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,${alpha}) 1px, transparent 1px)`,
    backgroundSize: '64px 64px',
  });

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink-950">
      <div className="absolute inset-0" style={{ ...grid(0.025), maskImage: 'radial-gradient(ellipse 90% 70% at 50% 0%, #000 30%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 0%, #000 30%, transparent 100%)' }} />
      {fine && (
        <div className="absolute inset-0" style={{ ...grid(0.09), maskImage: 'radial-gradient(260px circle at var(--mx) var(--my), #000, transparent 70%)', WebkitMaskImage: 'radial-gradient(260px circle at var(--mx) var(--my), #000, transparent 70%)' }} />
      )}
      <div className="absolute -left-[20%] -top-[30%] h-[80vh] w-[80vh] rounded-full opacity-[0.16] blur-[120px] motion-safe:animate-[drift1_28s_ease-in-out_infinite_alternate]" style={{ background: 'radial-gradient(circle, #5eead4, transparent 65%)' }} />
      <div className="absolute -right-[15%] top-[10%] h-[70vh] w-[70vh] rounded-full opacity-[0.12] blur-[120px] motion-safe:animate-[drift2_34s_ease-in-out_infinite_alternate]" style={{ background: 'radial-gradient(circle, #a78bfa, transparent 65%)' }} />
      <canvas ref={canvasRef} className="absolute inset-0" />
      {fine && (
        <div className="absolute inset-0" style={{ background: 'radial-gradient(600px circle at var(--mx) var(--my), rgba(94,234,212,0.06), transparent 45%)' }} />
      )}
      <style>{`
        @keyframes drift1 { to { transform: translate3d(30vw, 25vh, 0) scale(1.15); } }
        @keyframes drift2 { to { transform: translate3d(-25vw, 40vh, 0) scale(.9); } }
      `}</style>
    </div>
  );
}
