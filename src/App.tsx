import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig } from 'framer-motion';
import Lenis from 'lenis';
import Background from './components/Background';
import Cursor from './components/Cursor';
import Loader from './components/Loader';
import Nav from './components/Nav';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Footer from './components/Footer';
import { setLenis } from './lib/scroll';
import { usePrefersReducedMotion } from './hooks/useMedia';
import { GITHUB_USERNAME } from './data/content';

// Heavier, below-the-fold sections load on demand.
const Playground = lazy(() => import('./components/Playground'));
const GitHub = lazy(() => import('./components/GitHub'));

const Fallback = ({ id }: { id: string }) => <section id={id} className="min-h-[60vh]" />;

export default function App() {
  const reduced = usePrefersReducedMotion();
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const done = useCallback(() => setLoading(false), []);

  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    setLenis(lenis);
    let raf = requestAnimationFrame(function loop(t) { lenis.raf(t); raf = requestAnimationFrame(loop); });
    return () => { cancelAnimationFrame(raf); lenis.destroy(); setLenis(null); };
  }, [reduced]);

  useEffect(() => {
    document.documentElement.style.overflow = loading ? 'hidden' : '';
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (loading) window.scrollTo(0, 0);
  }, [loading]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="grain relative">
        <a href="#about" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-mint focus:px-4 focus:py-2 focus:text-ink-950">Skip to content</a>
        <Background />
        <Cursor />
        <AnimatePresence onExitComplete={() => setReady(true)}>
          {loading && <Loader key="loader" onDone={done} />}
        </AnimatePresence>
        <Nav ready={ready} />
        <main>
          <Hero ready={ready} />
          <About />
          <Experience />
          <Projects />
          <Suspense fallback={<Fallback id="systems" />}><Playground /></Suspense>
          <Skills />
          {GITHUB_USERNAME && <Suspense fallback={<Fallback id="github" />}><GitHub /></Suspense>}
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
