import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { SectionHeading } from './Reveal';
import Counter from './Counter';
import { useGithub } from '../hooks/useGithub';
import { GITHUB_USERNAME, FEATURED_REPOS, REPO_NOTES, profile } from '../data/content';
import { ease, viewport } from '../lib/motion';

const langColor: Record<string, string> = {
  TypeScript: '#7dd3fc', JavaScript: '#fde68a', Python: '#93c5fd', Go: '#5eead4', Java: '#fbbf77', HTML: '#fb923c',
  CSS: '#a78bfa', SCSS: '#f0abfc', Solidity: '#c4b5fd', Shell: '#86efac', Rust: '#fca5a5', Dart: '#67e8f9',
};
const ago = (iso: string) => {
  const d = (Date.now() - +new Date(iso)) / 86400000;
  if (d < 1) return 'today'; if (d < 30) return `${Math.floor(d)}d ago`; if (d < 365) return `${Math.floor(d / 30)}mo ago`; return `${Math.floor(d / 365)}y ago`;
};

export default function GitHub() {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { once: true, margin: '400px 0px' });
  const { data, error, loading } = useGithub(GITHUB_USERNAME, near, FEATURED_REPOS);

  return (
    <section id="github" className="relative py-28 md:py-40">
      <div className="container-x" ref={ref}>
        <SectionHeading index="06" eyebrow="Open source" title="Live from GitHub." accent={['GitHub.']}
          kicker={data?.snapshot
            ? `Tools, experiments and side projects from @${GITHUB_USERNAME}, outside my day job. Live data couldn't load here, so this is a recent snapshot.`
            : `Pulled live from the GitHub API for @${GITHUB_USERNAME}: tools, experiments and side projects outside my day job.`} />

        {error && (
          <div className="rounded-2xl border border-white/[0.08] p-8 text-fog-400">
            {error}{' '}
            <a className="text-mint underline-offset-4 hover:underline" href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noreferrer">View the profile on GitHub →</a>
          </div>
        )}

        {!error && (
          <>
            <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
              <motion.a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noreferrer" data-cursor="visit"
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewport} transition={{ duration: 0.9, ease }}
                className="group relative flex items-center gap-5 overflow-hidden rounded-3xl border border-white/[0.07] bg-ink-900/50 p-6 transition-colors hover:border-white/15 md:p-8">
                {data && (data.snapshot || !data.user.avatar_url) ? (
                  <div className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-2xl border border-white/10 bg-ink-850 font-mono text-lg text-mint">HS</div>
                ) : data ? (
                  <img src={data.user.avatar_url} alt="" width={72} height={72} loading="lazy" className="h-[72px] w-[72px] rounded-2xl border border-white/10 grayscale transition duration-700 group-hover:grayscale-0" />
                ) : <div className="h-[72px] w-[72px] animate-pulse rounded-2xl bg-white/5" />}
                <div className="min-w-0">
                  <div className="text-xl font-medium tracking-tight text-fog-100">{data?.user.name ?? profile.name}</div>
                  <div className="font-mono text-[12px] text-mint">@{GITHUB_USERNAME}</div>
                  <p className="mt-2 line-clamp-2 text-[13px] text-fog-400">{data?.user.bio ?? (loading ? 'Loading profile…' : 'Backend services, developer tooling and side projects: rate limiters, MCP agents, real-time apps and more.')}</p>
                </div>
                <span className="ml-auto text-xl text-fog-500 transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-mint">↗</span>
              </motion.a>

              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewport} transition={{ duration: 0.9, ease, delay: 0.1 }}
                className="grid grid-cols-3 overflow-hidden rounded-3xl border border-white/[0.07] bg-ink-900/50">
                {[
                  { k: 'Public repos', v: data?.user.public_repos },
                  { k: 'Languages', v: data ? new Set(data.repos.map((r) => r.language).filter(Boolean)).size : undefined },
                  { k: 'Years on GitHub', v: data?.years, suffix: '+' },
                ].map((s, i) => (
                  <div key={s.k} className={`flex flex-col justify-center p-6 ${i < 2 ? 'border-r hairline' : ''}`}>
                    <div className="text-3xl font-medium tracking-tight text-fog-100 md:text-4xl">{s.v !== undefined ? <Counter to={s.v} suffix={s.suffix} /> : '—'}</div>
                    <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-fog-500">{s.k}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {data && data.languages.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewport} transition={{ duration: 0.9, ease }}
                className="mt-4 rounded-3xl border border-white/[0.07] bg-ink-900/50 p-6 md:p-8">
                <div className="eyebrow mb-4 text-[10px]">Languages across repositories</div>
                <div className="flex h-2 overflow-hidden rounded-full bg-white/5">
                  {data.languages.map((l, i) => (
                    <motion.div key={l.name} initial={{ width: 0 }} whileInView={{ width: `${l.pct}%` }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.2 + i * 0.1, ease }}
                      style={{ background: langColor[l.name] ?? '#8d97a9' }} className="h-full" title={`${l.name} ${l.pct.toFixed(0)}%`} />
                  ))}
                </div>
                <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                  {data.languages.map((l) => (
                    <li key={l.name} className="flex items-center gap-2 font-mono text-[12px] text-fog-400">
                      <span className="h-2 w-2 rounded-full" style={{ background: langColor[l.name] ?? '#8d97a9' }} />{l.name} <span className="text-fog-600">{l.pct.toFixed(0)}%</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewport} transition={{ duration: 0.9, ease }}
              className="mt-4 overflow-x-auto rounded-3xl border border-white/[0.07] bg-ink-900/50 p-6 md:p-8 has-[img[data-failed]]:hidden">
              <div className="eyebrow mb-4 text-[10px]">Contributions · last 12 months</div>
              <img src={`https://ghchart.rshah.org/5eead4/${GITHUB_USERNAME}`} alt={`GitHub contribution chart for ${GITHUB_USERNAME}`} loading="lazy" onError={(e) => e.currentTarget.setAttribute('data-failed', '')}
                className="min-w-[680px] w-full opacity-80 [filter:invert(1)_hue-rotate(180deg)_brightness(.9)]" />
            </motion.div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {!data && loading && Array.from({ length: 6 }, (_, i) => <div key={i} className="h-[200px] animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.02]" />)}
              {data?.top.map((repo, i) => (
                  <motion.a key={repo.name} href={repo.html_url} target="_blank" rel="noreferrer" data-cursor="repo"
                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={viewport} transition={{ duration: 0.8, ease, delay: (i % 3) * 0.08 }}
                    whileHover={{ y: -5 }}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-900/50 p-6 transition-colors duration-500 hover:border-mint/30">
                    <div className="absolute inset-x-0 top-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-mint to-transparent transition-transform duration-700 group-hover:scale-x-100" />
                    <div className="flex items-center justify-between">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-mint"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
                      <span className="text-fog-500 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-mint">↗</span>
                    </div>
                    <h3 className="mt-5 truncate text-[17px] font-medium tracking-tight text-fog-100 transition-colors group-hover:text-mint">{repo.name}</h3>
                    <p className="mt-2 line-clamp-3 flex-1 text-[13px] leading-relaxed text-fog-400">{repo.description ?? REPO_NOTES[repo.name] ?? 'No description provided.'}</p>
                    <div className="mt-5 flex items-center gap-4 font-mono text-[11px] text-fog-500">
                      {repo.language && <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: langColor[repo.language] ?? '#8d97a9' }} />{repo.language}</span>}
                      {repo.stargazers_count > 0 && <span>★ {repo.stargazers_count}</span>}
                      {repo.forks_count > 0 && <span>⑂ {repo.forks_count}</span>}
                      <span className="ml-auto">{ago(repo.pushed_at)}</span>
                    </div>
                  </motion.a>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
