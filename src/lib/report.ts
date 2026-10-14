// Pure helpers for /report/. No DOM, so they're covered by Vitest.

/**
 * Splits the cover title: Space Grotesk heavy with the last word in the serif accent, like the site's H1s.
 * A one-word name stays in the heavy sans (Dev's cover spec), so it never loses its weight.
 */
export function nameParts(name: string | null | undefined, empty = { lead: 'Your ', accent: 'report' }) {
  const clean = (name ?? '').replace(/\s+/g, ' ').trim();
  if (!clean) return { ...empty, named: false };
  const cut = clean.lastIndexOf(' ');
  return cut > 0 ? { lead: clean.slice(0, cut + 1), accent: clean.slice(cut + 1), named: true } : { lead: clean, accent: '', named: true };
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "2026-10-14" → "14 October 2026". Anything else comes back as it was. */
export function formatDay(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const month = MONTHS[Number(m[2]) - 1];
  return month ? `${Number(m[3])} ${month} ${m[1]}` : iso;
}

/**
 * The Enneagram type(s) a saved result points to. The badge is what the result screen showed:
 * "4w5" / "Type 4" (one type), "4 or 9" (two close types) or "Even" (no single type).
 * Falls back to the highest score if the badge has no number.
 */
export function enneagramTypes(badge: string, scores: Record<string, number> | null): { kind: 'clear' | 'tie' | 'even'; types: number[] } {
  if (/^even$/i.test(badge.trim())) return { kind: 'even', types: [] };
  const tie = /^\s*(\d)\s+or\s+(\d)\s*$/i.exec(badge);
  if (tie) return { kind: 'tie', types: [Number(tie[1]), Number(tie[2])] };
  const one = /(\d)/.exec(badge);
  if (one) return { kind: 'clear', types: [Number(one[1])] };
  const ranked = Object.entries(scores ?? {}).sort((a, b) => b[1] - a[1]);
  return ranked.length ? { kind: 'clear', types: [Number(ranked[0][0])] } : { kind: 'even', types: [] };
}

/** The band whose `min` is the highest one at or below `score` (bands sorted by min). */
export function bandFor<T extends { min: number }>(score: number, bands: readonly T[]): T {
  let pick = bands[0];
  for (const b of bands) if (score >= b.min) pick = b;
  return pick;
}

/** The id with the lowest score; ties go to the first in `order`. */
export function lowestOf(scores: Record<string, number>, order: readonly string[]): string | null {
  let best: string | null = null;
  for (const id of order) {
    if (typeof scores[id] !== 'number') continue;
    if (best === null || scores[id] < scores[best]) best = id;
  }
  return best;
}

/** The id with the highest score; ties go to the first in `order`. */
export function highestOf(scores: Record<string, number>, order: readonly string[]): string | null {
  let best: string | null = null;
  for (const id of order) {
    if (typeof scores[id] !== 'number') continue;
    if (best === null || scores[id] > scores[best]) best = id;
  }
  return best;
}

/**
 * Biggest font size (stepping down from `max` to `min`) at which the text fits: at most `maxLines` lines
 * and no word wider than the box. `measure(size)` lays the text out at that size and reports back.
 * Returns `min` with `fits: false` when even the smallest size doesn't fit (the caller then lets long words break).
 */
export function fitSize(
  measure: (size: number) => { lines: number; overflow: boolean },
  { max, min, step = 0.25, maxLines = 2 }: { max: number; min: number; step?: number; maxLines?: number },
): { size: number; fits: boolean } {
  for (let size = max; size >= min - 1e-9; size = Math.round((size - step) * 1000) / 1000) {
    const m = measure(size);
    if (m.lines <= maxLines && !m.overflow) return { size, fits: true };
  }
  return { size: min, fits: false };
}
