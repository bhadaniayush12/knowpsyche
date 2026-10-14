// The head flag (TrailFlag.astro) and clean() must agree, so the first paint matches the final state (Q1-07).
// This runs the flag's real inline script against the same stored JSON readReport() sees.
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DATA_RULES, MAX_TEXT, readReport, STORAGE_KEY, TEST_IDS } from '../saved-results';

const source = readFileSync(new URL('../../components/result/TrailFlag.astro', import.meta.url), 'utf8');
const body = /<script is:inline define:vars=\{\{[^}]*\}\}>([\s\S]*?)<\/script>/.exec(source)![1];
const flagScript = new Function('localStorage', 'document', 'key', 'ids', 'rules', 'max', body);

const memory = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) };
};

/** Runs the head flag on raw stored text; returns the ids it lists, or null when it sets nothing. */
function headFlag(raw: string | null) {
  const store = memory();
  if (raw !== null) store.setItem(STORAGE_KEY, raw);
  const attrs: Record<string, string> = {};
  const document = { documentElement: { setAttribute: (k: string, v: string) => void (attrs[k] = v) } };
  // JSON round trip, like define:vars does.
  flagScript(store, document, STORAGE_KEY, [...TEST_IDS], JSON.parse(JSON.stringify(DATA_RULES)), MAX_TEXT);
  if (!('data-kp-saved' in attrs)) return null;
  return attrs['data-kp-report'].split(' ');
}

const entry = (testId: string, badge: string, headline: string, data: unknown, date = '2026-10-14') => ({ testId, date, badge, headline, data });
const ok = (o = {}) => ({ version: 1, results: { 'number-memory': { ...entry('number-memory', 'Steady', '7 digits · Steady', 7), ...o } } });
const enne = (v: number) => Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => [String(n), v]));
const eq = (v: number) => ({ knowing: v, managing: v, reading: v, relationships: v });

// The 24 corrupted-storage cases from the Q1 audit, then valid and edge cases.
const cases: Record<string, unknown> = {
  brokenJson: '{',
  nullJson: 'null',
  array: '[]',
  string: '"hello"',
  resultsArray: '{"results":[]}',
  unknownId: { version: 1, results: { foo: entry('foo', 'X', 'Y', 1) } },
  dataString: ok({ data: '7' }),
  unknownBadge: { version: 1, results: { 'reaction-time': entry('reaction-time', 'Turbo', '150 ms · Turbo', 150) } },
  unknownBadge9: { version: 1, results: { 'number-memory': entry('number-memory', 'Level 9', '9 digits · Level 9', 9) } },
  badDate: ok({ date: 'garbage' }),
  badMonth: ok({ date: '2026-13-45' }),
  negative: ok({ data: -5 }),
  huge: { version: 1, results: { 'reaction-time': entry('reaction-time', 'Running on empty', '999999999 ms', 999999999) } },
  enneaOdd: { version: 1, results: { enneagram: entry('enneagram', '4w5', 'Type 4', { 4: 999, 5: -3, x: 2 }) } },
  enneaEmpty: { version: 1, results: { enneagram: entry('enneagram', 'Type 4', 'Type 4', {}) } },
  eqUnknownKeys: { version: 1, results: { 'emotional-intelligence': entry('emotional-intelligence', 'Solid', 'Solid', { foo: 60 }) } },
  eqNumber: { version: 1, results: { 'emotional-intelligence': entry('emotional-intelligence', 'Solid', 'Solid', 60) } },
  nmNull: ok({ data: null }),
  wrongKey: { version: 1, results: { banana: entry('stroop', 'Mild pull', '120 ms · Mild pull', 120) } },
  nameNumber: { ...ok(), name: 42 },
  extraFields: { ...ok({ answers: [1, 2, 3], timings: [200, 210] }), tracking: 'x' },
  htmlBadge: ok({ badge: '<img src=x onerror=alert(1)>', headline: '<script>alert(2)</script>' }),
  longHeadline: ok({ headline: 'Seven digits '.repeat(400) }),
  emptyHeadline: ok({ headline: '', badge: '' }),
  // Valid and edge cases.
  nothing: null,
  empty: '',
  valid: ok(),
  dateArray: ok({ date: ['2026-10-14'] }),
  leapDay: ok({ date: '2024-02-29' }),
  notLeapDay: ok({ date: '2025-02-29' }),
  badgeAt120: ok({ badge: 'b'.repeat(120) }),
  badgeAt121: ok({ badge: 'b'.repeat(121) }),
  stroopNull: { version: 1, results: { stroop: entry('stroop', '', "We couldn't measure this one. Try again.", null) } },
  stroopNegative: { version: 1, results: { stroop: entry('stroop', 'Unshakeable', '-20 ms · Unshakeable', -20) } },
  nmFraction: ok({ data: 7.5 }),
  eqValid: { version: 1, results: { 'emotional-intelligence': entry('emotional-intelligence', 'Solid', 'x', eq(60)) } },
  eqExtraKey: { version: 1, results: { 'emotional-intelligence': entry('emotional-intelligence', 'Solid', 'x', { ...eq(60), x: 1 }) } },
  eqOver: { version: 1, results: { 'emotional-intelligence': entry('emotional-intelligence', 'Solid', 'x', eq(101)) } },
  enneaValid: { version: 1, results: { enneagram: entry('enneagram', '4w5', 'Type 4', { ...enne(10), 4: 22, 5: 21 }) } },
  enneaUnder: { version: 1, results: { enneagram: entry('enneagram', 'Type 4', 'Type 4', enne(4)) } },
  attentionHalf: { version: 1, results: { 'attention-span': entry('attention-span', 'Steady', 'x', 77.5) } },
  attentionOver: { version: 1, results: { 'attention-span': entry('attention-span', 'Laser', 'x', 101) } },
  protoKey: { version: 1, results: { 'number-memory': entry('constructor', 'x', 'x', 1) } },
  mixed: {
    version: 1,
    results: {
      'number-memory': entry('number-memory', 'Steady', 'x', 7),
      'reaction-time': entry('reaction-time', 'Quick', 'x', -1),
      stroop: entry('stroop', 'Mild pull', 'x', 120),
      enneagram: entry('enneagram', 'x', 'x', enne(30)),
    },
  },
};

describe('head flag agrees with readReport (Q1-07)', () => {
  let store: ReturnType<typeof memory>;
  beforeEach(() => {
    store = memory();
    vi.stubGlobal('localStorage', store);
    vi.stubGlobal('window', { localStorage: store });
  });
  afterEach(() => vi.unstubAllGlobals());

  it.each(Object.entries(cases))('%s', (_name, value) => {
    const raw = value === null ? null : typeof value === 'string' ? value : JSON.stringify(value);
    if (raw !== null) store.setItem(STORAGE_KEY, raw);
    const kept = TEST_IDS.filter((id) => readReport()?.results[id]);
    expect(headFlag(raw)).toEqual(kept.length ? kept : null);
  });

  it('the 24 audit cases are all here, and bad data really is dropped', () => {
    expect(Object.keys(cases).indexOf('emptyHeadline')).toBe(23);
    expect(headFlag(JSON.stringify(cases.huge))).toBeNull();
    expect(headFlag(JSON.stringify(cases.mixed))).toEqual(['number-memory', 'stroop']);
  });
});
