// Live reads from the team repo (ClxNode/KuyayPet). No copies: the screens render what GitHub serves now.
// Unauthenticated; responses are cached in sessionStorage for 10 min to stay well under the 60 req/h limit.
import { useEffect, useState } from 'react';

export const REPO = 'ClxNode/KuyayPet';
export const REPO_URL = `https://github.com/${REPO}`;
export const PROJECTS_URL = 'https://github.com/users/ClxNode/projects';
export const HU_MD_URL = `https://raw.githubusercontent.com/${REPO}/main/docs/historias-de-usuario.md`;
export const MILESTONES_URL = `https://api.github.com/repos/${REPO}/milestones?state=all`;
export const ISSUES_URL = `https://api.github.com/repos/${REPO}/issues?state=all&per_page=100`;

const TTL_MS = 10 * 60 * 1000;
const PREFIX = 'kuyaypet-gh:';

export type GhError = 'offline' | 'rate-limit' | 'http';

interface CacheEntry<T> {
  at: number;
  data: T;
}

function readCache<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as CacheEntry<T>;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, data: T) {
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify({ at: Date.now(), data }));
  } catch {
    /* quota or private mode: fine, we just refetch next time */
  }
}

export interface Fetched<T> {
  data: T | null;
  error: GhError | null;
  loading: boolean;
  /** When the data was fetched (ms). Lets the screen say "actualizado hace N min". */
  at: number | null;
  stale: boolean;
}

/** Fetch JSON or text with a session cache. On error, serve the stale cache if there is one. */
export async function ghFetch<T>(url: string, as: 'json' | 'text'): Promise<{ data: T; at: number; stale: boolean }> {
  const cached = readCache<T>(url);
  if (cached && Date.now() - cached.at < TTL_MS) return { data: cached.data, at: cached.at, stale: false };
  try {
    const res = await fetch(url, { headers: as === 'json' ? { Accept: 'application/vnd.github+json' } : {} });
    if (!res.ok) {
      const remaining = res.headers.get('x-ratelimit-remaining');
      let rateLimited = res.status === 429 || (res.status === 403 && remaining === '0');
      if (res.status === 403 && remaining === null) {
        // Secondary limits come without the counter: GitHub says it in the body.
        const body = await res.text().catch(() => '');
        rateLimited = /rate limit/i.test(body);
      }
      const kind: GhError = rateLimited ? 'rate-limit' : 'http';
      if (cached) return { data: cached.data, at: cached.at, stale: true };
      throw Object.assign(new Error(kind), { kind });
    }
    const data = (as === 'json' ? await res.json() : await res.text()) as T;
    writeCache(url, data);
    return { data, at: Date.now(), stale: false };
  } catch (e) {
    if (cached) return { data: cached.data, at: cached.at, stale: true };
    const kind = (e as { kind?: GhError }).kind ?? 'offline';
    throw Object.assign(new Error(kind), { kind });
  }
}

export function useGh<T>(url: string, as: 'json' | 'text'): Fetched<T> {
  const [state, setState] = useState<Fetched<T>>({ data: null, error: null, loading: true, at: null, stale: false });
  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    ghFetch<T>(url, as)
      .then((r) => alive && setState({ data: r.data, error: null, loading: false, at: r.at, stale: r.stale }))
      .catch((e: { kind?: GhError }) => alive && setState({ data: null, error: e.kind ?? 'offline', loading: false, at: null, stale: false }));
    return () => {
      alive = false;
    };
  }, [url, as]);
  return state;
}

export function agoLabel(at: number | null): string {
  if (!at) return '';
  const min = Math.round((Date.now() - at) / 60000);
  if (min < 1) return 'actualizado ahora';
  if (min === 1) return 'actualizado hace 1 min';
  return `actualizado hace ${min} min`;
}

/* ─── Historias de usuario (markdown table) ─── */
export interface HuRow {
  id: string;
  title: string;
  role: string;
  priority: string;
}

/** Parses the first markdown table with columns ID · Historia de usuario · Rol · Prioridad. */
export function parseHuTable(md: string): HuRow[] {
  const rows: HuRow[] = [];
  for (const line of md.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim().replace(/^`|`$/g, '').replace(/\*\*/g, ''));
    if (cells.length < 4) continue;
    if (!/^HU-\d{2}$/i.test(cells[0])) continue;
    rows.push({ id: cells[0].toUpperCase(), title: cells[1], role: cells[2], priority: cells[3] });
  }
  return rows;
}

/* ─── Issues / milestones ─── */
export interface GhLabel {
  name: string;
  color: string;
}
export interface GhUser {
  login: string;
  avatar_url: string;
  html_url: string;
}
export interface GhMilestone {
  number: number;
  title: string;
  description: string | null;
  state: 'open' | 'closed';
  open_issues: number;
  closed_issues: number;
  due_on: string | null;
  html_url: string;
}
export interface GhIssue {
  number: number;
  title: string;
  state: 'open' | 'closed';
  html_url: string;
  labels: GhLabel[];
  assignees: GhUser[];
  milestone: { number: number; title: string } | null;
  pull_request?: unknown;
}
