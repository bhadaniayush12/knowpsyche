// Copy from docs/content/part-2.md, "Test 3 — Photographic Memory". Word for word.
// Lines marked "drafted" were missing from the content doc and approved in the build plan.
import type { Faq, Source } from '../shared';

export interface MemoryBand {
  /** Lowest score in this band, inclusive. */
  min: number;
  badge: string;
  text: string;
}

/** Levels 1–4, 5–8, 9–12, 13+. A score of 0 reads as the first band. */
export const photoBands: MemoryBand[] = [
  // Drafted: removed comparison wording.
  { min: 0, badge: 'Warming up', text: 'Short-term visual memory fills up fast. Try again; it often improves on the second go.' },
  { min: 5, badge: 'Solid', text: 'You hold a fair amount of detail from a quick look.' },
  { min: 9, badge: 'Sharp', text: 'You keep a lot of visual detail in mind at once.' },
  { min: 13, badge: 'Exceptional', text: 'Very few patterns get past you.' },
];

export const page = {
  // Drafted: em dash removed.
  title: 'Photographic Memory Test: How Much Can You Remember?',
  description:
    // Drafted: em dash removed.
    'Study a grid for a second, then rebuild it. Each level adds a tile. Free, instant, no sign-up. See how sharp your visual memory really is.',
  h1: 'Photographic memory test',
  intro: 'Some tiles will light up for a moment. Click the same tiles once they disappear. Each level adds one more.',
  // Touch screens: same line with "tap" (shared rule).
  introTouch: 'Some tiles will light up for a moment. Tap the same tiles once they disappear. Each level adds one more.',
  crumb: 'Photographic memory',
  // Drafted.
  eyebrow: 'Test / 03 · Memory · 2–3 min',
  metaLine: 'About 2–3 minutes · 3 lives · Nothing saved',
};

export const ui = {
  biggerGrid: 'Bigger grid. Try seeing the tiles as shapes.',
  // Drafted.
  ready: 'The tiles will light up here.',
  watch: 'Watch the tiles…',
  yourTurn: (n: number) => `Your turn: pick ${n} tiles.`,
  levelDone: 'Level done.',
  wrong: (lives: number) => `Wrong tile. ${lives === 1 ? '1 life' : `${lives} lives`} left.`,
  over: 'No lives left. Your result is below.',
  // Drafted: after a wrong pick, the tiles still to find are outlined.
  missedHint: 'The outlined tiles are the ones you missed.',
  // Drafted: screen-reader label for an outlined tile.
  missedTile: 'one you missed',
  livesLeft: (lives: number) => (lives === 1 ? '1 life left' : `${lives} lives left`),
  copyScore: 'Copy my score',
  leaveWarning: 'Your progress will be lost if you leave this page.',
};

export const result = {
  // Drafted: removed comparison wording.
  change:
    'Focus, tiredness and strategy. Grouping tiles into shapes or patterns makes them easier to hold than single squares.',
  // Try this = FAQ 4's answer (approved in the build plan).
  tip: 'Practice helps, and so does grouping tiles into shapes or patterns.',
  // Next test (name, link, time) comes from nextAfter() in data/home.ts, in doc order.
  nextLine: 'Try Number memory to compare how you hold numbers versus pictures.',
  learn: { href: '/method/', label: 'How we build our tests →' },
};

export const faqs: Faq[] = [
  { q: 'Is photographic memory real?', a: 'A perfect, camera-like memory in adults has little solid evidence. Some children show vivid "eidetic" images, but this is rare and fades with age.' },
  // Drafted: em dash removed.
  { q: 'What does this test actually measure?', a: 'Visual short-term memory: how many locations you can hold in mind for a few seconds.' },
  { q: 'How many things can we remember at once?', a: 'Classic research suggests visual short-term memory holds only a handful of items at a time, often around four.' },
  { q: 'Can I improve my visual memory?', a: 'Practice helps, and so does grouping tiles into shapes or patterns.' },
  { q: 'Is this a medical test?', a: "No. It's for curiosity and self-reflection." },
];

export const sources: Source[] = [
  { before: 'Luck, S. J., & Vogel, E. K. (1997). The capacity of visual working memory for features and conjunctions. ', title: 'Nature', after: '.' },
  { before: 'Haber, R. N. (1979). Twenty years of haunting eidetic imagery. ', title: 'Behavioral and Brain Sciences', after: '.' },
];
