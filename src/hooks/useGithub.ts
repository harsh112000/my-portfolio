import { useEffect, useState } from 'react';

export type Repo = {
  name: string; description: string | null; html_url: string; homepage: string | null;
  stargazers_count: number; forks_count: number; language: string | null; fork: boolean;
  pushed_at: string; topics?: string[]; size: number; archived: boolean;
};
export type GhUser = { login: string; name: string | null; avatar_url: string; html_url: string; public_repos: number; followers: number; bio: string | null; created_at: string };
export type GhData = { user: GhUser; repos: Repo[]; stars: number; forks: number; languages: { name: string; count: number; pct: number }[]; top: Repo[]; years: number };

const TTL = 30 * 60 * 1000;

export function useGithub(username: string, enabled: boolean, featured: string[] = []) {
  const [data, setData] = useState<GhData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!username || !enabled || data) return;
    const key = `gh2:${username}`;
    try {
      const cached = JSON.parse(sessionStorage.getItem(key) || 'null');
      if (cached && Date.now() - cached.t < TTL) { setData(cached.d); return; }
    } catch { /* storage unavailable */ }

    const ctl = new AbortController();
    setLoading(true);
    const get = (u: string) => fetch(u, { signal: ctl.signal, headers: { Accept: 'application/vnd.github+json' } }).then((r) => {
      if (!r.ok) throw new Error(r.status === 403 ? 'GitHub rate limit reached, try again later.' : `GitHub returned ${r.status}`);
      return r.json();
    });
    Promise.all([
      get(`https://api.github.com/users/${username}`),
      get(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`),
    ])
      .then(([user, repos]: [GhUser, Repo[]]) => {
        const own = repos.filter((r) => !r.fork);
        const stars = own.reduce((a, r) => a + r.stargazers_count, 0);
        const forks = own.reduce((a, r) => a + r.forks_count, 0);
        const counts: Record<string, number> = {};
        own.forEach((r) => { if (r.language) counts[r.language] = (counts[r.language] || 0) + 1; });
        const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
        const languages = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, count]) => ({ name, count, pct: (count / total) * 100 }));
        const byName = new Map(own.map((r) => [r.name.toLowerCase(), r]));
        const picked = featured.map((n) => byName.get(n.toLowerCase())).filter((r): r is Repo => !!r);
        const rest = own
          .filter((r) => !r.archived && r.description && !picked.includes(r))
          .sort((a, b) => +new Date(b.pushed_at) - +new Date(a.pushed_at));
        const top = [...picked, ...rest].slice(0, 6);
        const years = Math.max(1, Math.floor((Date.now() - +new Date(user.created_at)) / (365.25 * 86400000)));
        const d: GhData = { user, repos: own, stars, forks, languages, top, years };
        setData(d);
        try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), d })); } catch { /* ignore */ }
      })
      .catch((e) => { if (e.name !== 'AbortError') setError(e.message); })
      .finally(() => setLoading(false));
    return () => ctl.abort();
  }, [username, enabled, data]);

  return { data, error, loading };
}
