import type Lenis from 'lenis';

let lenis: Lenis | null = null;
export const setLenis = (l: Lenis | null) => { lenis = l; };

export function scrollToId(id: string) {
  const el = id === 'top' ? document.body : document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(id === 'top' ? 0 : el, { offset: id === 'top' ? 0 : -72, duration: 1.4 });
  else if (id === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
  else el.scrollIntoView({ behavior: 'smooth' });
}

export function lockScroll(lock: boolean) {
  if (lenis) { if (lock) lenis.stop(); else lenis.start(); }
  document.documentElement.style.overflow = lock ? 'hidden' : '';
}
