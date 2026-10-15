// Homepage copy, word for word from docs/design/Main.dc.html. Test times follow the content docs.

/** What the homepage filter chips sort by. */
export type TestTopic = 'memory' | 'focus' | 'feelings' | 'personality';
export type GlyphKey = 'rt' | 'en' | 'pm' | 'nm' | 'as' | 'st' | 'eq';

export interface HomeTest {
  name: string;
  kind: string;
  topic: TestTopic;
  time: string;
  desc: string;
  href: string;
  glyph: GlyphKey;
  /** Tries, questions or lives, as in the test page's meta line. Shown on /tests/. */
  count: string;
  /** Drafted: what the test looks at, in plain words. Shown on /tests/. */
  looksAt: string;
  /** Dark card (ink background). Otherwise tint + accent colour. */
  dark?: boolean;
  color?: string;
  tint?: string;
}

export const homeTests: HomeTest[] = [
  // Drafted. desc: Dev's wording (no comparison with others).
  { name: 'Reaction time', kind: 'Most popular', topic: 'focus', time: '1 min', desc: 'How fast you respond when something changes on screen.', href: '/reaction-time-test/', count: '5 tries', looksAt: 'How fast you respond when something changes', glyph: 'rt', dark: true },
  { name: 'Enneagram', kind: 'Personality', topic: 'personality', time: '8 min', desc: 'Which of 9 personality types drives your choices, fears and habits.', href: '/enneagram-test/', count: '45 statements', looksAt: 'The motives behind your choices', glyph: 'en', color: 'var(--color-violet)', tint: 'var(--color-tint-violet)' },
  { name: 'Photographic memory', kind: 'Memory', topic: 'memory', time: '2–3 min', desc: 'How much you remember from a quick look at a picture.', href: '/photographic-memory-test/', count: '3 lives', looksAt: 'Memory for what you see', glyph: 'pm', color: 'var(--color-ochre)', tint: 'var(--color-tint-ochre)' },
  { name: 'Number memory', kind: 'Memory', topic: 'memory', time: '1–2 min', desc: 'How many digits you can hold in your head at once.', href: '/number-memory-test/', count: '2 lives', looksAt: 'Memory for numbers', glyph: 'nm', color: 'var(--color-teal-dark)', tint: 'var(--color-tint-teal)' },
  { name: 'Attention span', kind: 'Focus', topic: 'focus', time: '2–3 min', desc: 'How well you stay focused and ignore distractions.', href: '/attention-span-test/', count: '80 circles', looksAt: 'Focus and self-control', glyph: 'as', color: 'var(--color-blue)', tint: 'var(--color-tint-blue)' },
  { name: 'Stroop test', kind: 'Focus', topic: 'focus', time: '1 min', desc: 'How your mind copes when what you see and what you read disagree.', href: '/stroop-test/', count: '40 words', looksAt: 'Ignoring an automatic habit', glyph: 'st', color: 'var(--color-red)', tint: 'var(--color-tint-red)' },
  // Drafted: em dash removed.
  { name: 'Emotional intelligence', kind: 'Emotions', topic: 'feelings', time: '5 min', desc: 'How well you notice and handle feelings, yours and other people’s.', href: '/emotional-intelligence-test/', count: '28 statements', looksAt: 'Noticing and handling feelings', glyph: 'eq', color: 'var(--color-red)', tint: 'var(--color-tint-red)' },
];

/** The next test in doc order (Test 1 to 7), or null after the last one. */
export const nextAfter = (href: string): HomeTest | null => homeTests[homeTests.findIndex((t) => t.href === href) + 1] ?? null;

/** Homepage filter chips. Labels from the homepage ("Memory", "Focus", "Feelings") plus "All" and "Personality". */
export const testFilters: { key: 'all' | TestTopic; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'memory', label: 'Memory' },
  { key: 'focus', label: 'Focus' },
  { key: 'feelings', label: 'Feelings' },
  { key: 'personality', label: 'Personality' },
];

/** Drafted: what screen readers hear after a chip is picked, e.g. "Showing 2 memory tests". */
export const filterStatus = (n: number, label: string | null) =>
  label ? `Showing ${n} ${label.toLowerCase()} ${n === 1 ? 'test' : 'tests'}` : `Showing all ${n} tests`;

export const marqueeQuestions: { t: string; bg: string }[] = [
  { t: 'Am I a good listener?', bg: 'var(--color-lilac)' },
  { t: 'Why can’t I focus?', bg: 'var(--color-white)' },
  { t: 'How good is my memory?', bg: 'var(--color-cream)' },
  { t: 'What drives my decisions?', bg: 'var(--color-mint)' },
  { t: 'Am I quick to react?', bg: 'var(--color-white)' },
  { t: 'Do I read emotions well?', bg: 'var(--color-tint-red)' },
  { t: 'Why do I overthink?', bg: 'var(--color-lilac)' },
];

export const homeFaqs: { q: string; a: string }[] = [
  { q: 'Is it really free?', a: 'Yes. Every test and every result is free, with no sign-up.' },
  // Drafted: em dash removed.
  { q: 'How accurate are these tests?', a: "They're based on well-known psychology experiments and questionnaires. Great for learning about yourself, but one result is a snapshot, not a final answer." },
  { q: 'Do you save my answers?', a: 'No. Your answers are scored on your own device and never sent to us.' },
  // Drafted: em dash removed.
  { q: 'Is this a medical or mental-health test?', a: "No. KnowPsyche is for learning and self-reflection. It can't diagnose anything. For that, please talk to a professional." },
  // Drafted: the five questions below (Dev's wording).
  { q: 'Do I need to create an account?', a: 'No. There is no sign-up, no email and nothing to install. Open a test and start.' },
  { q: 'Does it work on my phone?', a: 'Yes. Every test works on phones and computers. You tap on a touch screen and click or use the keyboard on a computer.' },
  { q: 'Can I retake a test?', a: 'Yes, as often as you like. Results can change from one try to the next because of sleep, mood and practice, so a different score is not a mistake.' },
  { q: "Why don't you compare me with other people?", a: "We don't collect anyone's answers, so we have no group to compare you with, and any ranking would be made up. Instead, each result comes with bands that are our own guide, plus plain-English notes on what it means." },
  { q: 'Will there be ads?', a: "The site is free to use. We may show ads later, never inside a running test and never based on your answers, which we don't collect." },
];

export interface FooterMode {
  key: string;
  label: string;
  title: string;
  note: string;
  cta?: { label: string; href: string };
  col: string;
  anim: 'breathe' | 'pulse-loop';
  speed: string;
}

// Calm and Reflect CTAs link to articles that don't exist yet, so they're left out for now.
export const footerModes: FooterMode[] = [
  { key: 'calm', label: 'Calm', title: 'Breathe with the circle.', note: 'In as it grows, out as it shrinks. Three rounds is enough.', col: '#8FD0C2', anim: 'breathe', speed: '60s' },
  // Drafted: em dash removed.
  { key: 'focus', label: 'Focus', title: 'One thing at a time.', note: 'See how well you ignore distractions. It takes three minutes.', cta: { label: 'Attention span test', href: '/attention-span-test/' }, col: '#7d8cf0', anim: 'pulse-loop', speed: '26s' },
  { key: 'reflect', label: 'Reflect', title: 'What did you notice today?', note: 'A thought that kept coming back is worth a closer look.', col: '#EDCA69', anim: 'breathe', speed: '90s' },
];

export const PRIVATE_LINE = 'Private by design: your answers never leave this page.';

export const DISCLAIMER =
  "KnowPsyche tests are for learning and self-reflection. They are not medical or psychological assessments. If you're worried about your health or wellbeing, please speak to a qualified professional.";
