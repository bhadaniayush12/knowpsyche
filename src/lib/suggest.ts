/**
 * "Did you mean…?" for the 404 page. Pure functions: the page passes in `location.pathname`
 * and the list of real routes; nothing is sent anywhere.
 */

export interface Route {
  href: string;
  /** Link text, read after "Did you mean the …", e.g. "Reaction time test". */
  label: string;
  /** Words that describe the page: the slug plus common guesses, e.g. "reaction time", "reflex". */
  keys: string[];
}

/** Words that say nothing about which page someone wanted. */
const STOP = new Set(['test', 'tests', 'quiz', 'the', 'a', 'an', 'of', 'and', 'my', 'page', 'html', 'htm', 'php', 'index', 'www', 'us', 'free', 'online']);

/** Below this score we'd rather show nothing than a wrong guess. */
export const MIN_SCORE = 0.6;

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

/** Lowercase words from a path or key, with filler words removed. */
export function tokens(text: string): string[] {
  let s = text;
  try {
    s = decodeURIComponent(s);
  } catch {
    // Malformed escapes: use the raw text.
  }
  return s
    .toLowerCase()
    .replace(/\.(html?|php)$/, '')
    .split(/[^a-z0-9]+/)
    .filter((w) => w && !STOP.has(w));
}

/** Two words match when equal, or one typo apart for longer words (two for very long ones). */
function wordsMatch(a: string, b: string): boolean {
  if (a === b) return true;
  const len = Math.min(a.length, b.length);
  const d = levenshtein(a, b);
  return (len >= 5 && d <= 1) || (len >= 8 && d <= 2);
}

/** 0–1: how well the typed words match one key. */
export function scoreKey(input: string[], key: string[]): number {
  if (!input.length || !key.length) return 0;
  const a = input.join('');
  const b = key.join('');
  const spelling = 1 - levenshtein(a, b) / Math.max(a.length, b.length);
  const hits = input.filter((w) => key.some((k) => wordsMatch(w, k))).length;
  // Matching every typed word is a strong sign, but not as strong as matching the spelling exactly.
  const overlap = (hits / input.length) * 0.9;
  return Math.max(spelling, overlap);
}

/**
 * Best route for a mistyped path, or null when nothing is close enough.
 * Ties go to the route listed first.
 */
export function suggestRoute(pathname: string, routes: Route[]): Route | null {
  const input = tokens(pathname);
  if (!input.length) {
    // "/test/" or "/tests.html": they wanted the list of tests.
    return /\btests?\b/i.test(pathname) ? routes.find((r) => r.href === '/tests/') ?? null : null;
  }
  let best: Route | null = null;
  let bestScore = 0;
  for (const r of routes) {
    for (const k of r.keys) {
      const s = scoreKey(input, tokens(k));
      if (s > bestScore) {
        best = r;
        bestScore = s;
      }
    }
  }
  return bestScore >= MIN_SCORE ? best : null;
}
