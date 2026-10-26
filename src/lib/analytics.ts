import type { TestId } from './saved-results';

/**
 * The only three custom GA4 events, each with fixed values only: never answers, scores, bands,
 * timings, results or anything derived from them. Anything else is dropped before it reaches gtag.
 */
export type TestEventName = 'test_start' | 'test_complete' | 'result_share';

/** Questions (or tries) per test: a fixed fact about the test, the same for everyone. */
export const QUESTION_COUNTS: Record<TestId, number> = {
  'reaction-time': 5,
  enneagram: 45,
  stroop: 40,
  'number-memory': 1,
  'photographic-memory': 1,
  'attention-span': 80,
  'emotional-intelligence': 28,
};

const TEST_NAMES = new Set<string>(Object.keys(QUESTION_COUNTS));
const COUNTS = new Set<number>(Object.values(QUESTION_COUNTS));
const allowed: Record<string, (v: string | number) => boolean> = {
  test_name: (v) => typeof v === 'string' && TEST_NAMES.has(v),
  test_category: (v) => v === 'personality' || v === 'cognitive',
  language: (v) => v === 'en',
  question_count: (v) => typeof v === 'number' && COUNTS.has(v),
  method: (v) => v === 'share' || v === 'download' || v === 'copy',
};
const EVENT_KEYS: Record<TestEventName, string[]> = {
  test_start: ['test_name', 'test_category', 'language'],
  test_complete: ['test_name', 'test_category', 'language', 'question_count'],
  result_share: ['test_name', 'method'],
};

/** True when `params` has exactly the keys this event takes, each with one of its fixed values. */
export function isAllowedPayload(name: string, params: Record<string, string | number>): boolean {
  const keys = EVENT_KEYS[name as TestEventName];
  if (!keys) return false;
  const given = Object.keys(params);
  return given.length === keys.length && keys.every((k) => k in params && allowed[k](params[k]));
}

const isRunning = () => {
  try {
    const running = (window as Window & { kpTestRunning?: () => boolean }).kpTestRunning;
    return typeof running === 'function' && running();
  } catch {
    return false;
  }
};

// test_start goes once per run. A run ends when its result shows or Restart is pressed (endRun).
let startSent = false;

/** Lets the next test_start through: call when a result shows or the test is restarted. */
export function endRun(): void {
  startSent = false;
}

/**
 * Send one of the three test events through the existing GA4 tag. While a test is running
 * (window.kpTestRunning), the only thing allowed is that run's single test_start.
 */
export function trackEvent(name: TestEventName, params: Record<string, string | number>): void {
  try {
    if (typeof window === 'undefined') return;
    if (!isAllowedPayload(name, params)) return;
    if (name === 'test_start') {
      if (startSent) return;
    } else if (isRunning()) {
      return;
    }
    const gtag = (window as Window & { gtag?: (command: string, event: string, data: typeof params) => void }).gtag;
    if (name === 'test_start') startSent = true;
    if (typeof gtag === 'function') gtag('event', name, params);
  } catch {
    // Analytics must never interrupt a test (including when an extension blocks the tag).
  }
}
