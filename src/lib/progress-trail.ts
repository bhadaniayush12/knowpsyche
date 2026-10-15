// Progress trail: which of the seven tests have a saved result, in the linear next-test order.
// Pure, so it can be tested. The trail is only shown to people who saved at least one result.
import { TEST_IDS, type TestId } from './saved-results';

/** Linear next-test order (same as TEST_IDS): Reaction, Enneagram, Photographic, Number, Attention, Stroop, EQ. */
export const TRAIL_ORDER: readonly TestId[] = TEST_IDS;

export const testHref = (id: TestId) => `/${id}-test/`;

export interface TrailState {
  /** How many of the seven have a saved result. */
  count: number;
  total: number;
  /** One per test, in TRAIL_ORDER. */
  saved: boolean[];
  /** The first test without a saved result after the current one (wrapping round), never the current one. */
  next: TestId | null;
  allDone: boolean;
}

export function trailState(savedIds: Iterable<string>, current: TestId | null = null): TrailState {
  const have = new Set(savedIds);
  const saved = TRAIL_ORDER.map((id) => have.has(id));
  const count = saved.filter(Boolean).length;
  const start = current ? TRAIL_ORDER.indexOf(current) + 1 : 0;
  let next: TestId | null = null;
  for (let i = 0; i < TRAIL_ORDER.length; i++) {
    const id = TRAIL_ORDER[(start + i) % TRAIL_ORDER.length];
    if (id !== current && !have.has(id)) {
      next = id;
      break;
    }
  }
  return { count, total: TRAIL_ORDER.length, saved, next, allDone: count === TRAIL_ORDER.length };
}

// Drafted: the trail's copy.
export const trailCopy = {
  // Screen reader names for the trail and its row of test links (Q5: they were the same). A result page shows
  // both variants, so all four differ.
  labels: {
    strip: { region: 'Your test progress', nav: 'Jump to a test' },
    card: { region: 'Your report so far', nav: 'Choose a test to try next' },
  },
  heading: (count: number, total: number) => `Your KnowPsyche report · ${count} of ${total} tried`,
  next: (name: string) => `Next: ${name}`,
  allDone: 'All 7 tried. Your report is ready.',
  soFar: 'See your report so far',
  marker: (name: string, saved: boolean) => `${name}: ${saved ? 'saved' : 'not saved yet'}`,
};
