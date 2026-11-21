# Harsh Srivastava — Portfolio

React 18 + TypeScript + Vite + Tailwind + Framer Motion (+ Lenis for smooth scroll).

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Make it yours

All content lives in `src/data/content.ts`:

- `GITHUB_USERNAME`: set your handle and the **GitHub** section (profile, repo/star/follower
  counters, language breakdown, contribution chart, top repos) appears and loads live from the
  GitHub API in the visitor's browser (cached for 30 min). Left empty, the section and its nav
  link are hidden.
- `experience`, `projects`, `skills`, `stats`, `terminalScript`: copy for every section.
- `public/resume.pdf` is served by the Résumé buttons and the terminal's `resume` command.

## Sections

| Section | What moves |
| --- | --- |
| Loader | Monogram draws itself, then the page is revealed |
| Hero | Word-by-word masked headline, typing terminal you can type into (`help`), distributed-system topology with travelling packets, mouse parallax, magnetic CTAs |
| Background | Fine grid that brightens around the cursor, drifting gradient lights, sparse node network with occasional pulses, cursor glow |
| About | Paragraph that lights up word by word as you scroll, counters |
| Experience | Scroll-driven timeline progress, expandable roles, hover to reveal technical context |
| Work | Cards lift, borders light up toward the cursor, architecture diagrams animate a request; click to open a full case study (shared-layout transition) |
| How systems work | Interactive client → gateway → service → Redis/MySQL simulation with cache hit/miss, TTL, step mode, request log |
| Stack | Skill constellation: hover a tool to light up what it connects to; cluster cards |
| GitHub | Live data (see above) |
| Footer | Moving gradient, availability pulse, copy-email, magnetic socials, back-to-top progress ring |

## Accessibility & performance

- `prefers-reduced-motion` is respected throughout (Framer `MotionConfig reducedMotion="user"`,
  Lenis and canvas loops off, CSS animations neutralised).
- Custom cursor and parallax only run on fine pointers; touch devices get native behaviour.
- Animations use transform/opacity; the background canvas pauses on hidden tabs; hero packets
  stop when the hero leaves the viewport; Playground and GitHub are lazy-loaded chunks.

## Deploy

Any static host works. On Vercel or Netlify: build command `npm run build`, output directory `dist`.
