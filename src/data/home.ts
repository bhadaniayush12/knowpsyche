// Homepage copy, word for word from docs/design/Main.dc.html.

export type TestCategory = 'brain' | 'personality' | 'emotions';
export type GlyphKey = 'rt' | 'en' | 'pm' | 'nm' | 'as' | 'st' | 'eq';

export interface HomeTest {
  name: string;
  kind: string;
  cat: TestCategory;
  time: string;
  desc: string;
  href: string;
  glyph: GlyphKey;
  /** Dark card (ink background). Otherwise tint + accent colour. */
  dark?: boolean;
  color?: string;
  tint?: string;
}

export const homeTests: HomeTest[] = [
  { name: 'Reaction time', kind: 'Most popular', cat: 'brain', time: '1 min', desc: 'How fast you respond — and how you compare with typical scores.', href: '/reaction-time-test/', glyph: 'rt', dark: true },
  { name: 'Enneagram', kind: 'Personality', cat: 'personality', time: '8 min', desc: 'Which of 9 personality types drives your choices, fears and habits.', href: '/enneagram-test/', glyph: 'en', color: 'var(--color-violet)', tint: 'var(--color-tint-violet)' },
  { name: 'Photographic memory', kind: 'Memory', cat: 'brain', time: '2 min', desc: 'How much you remember from a quick look at a picture.', href: '/photographic-memory-test/', glyph: 'pm', color: 'var(--color-ochre)', tint: 'var(--color-tint-ochre)' },
  { name: 'Number memory', kind: 'Memory', cat: 'brain', time: '2 min', desc: 'How many digits you can hold in your head at once.', href: '/number-memory-test/', glyph: 'nm', color: 'var(--color-teal-dark)', tint: 'var(--color-tint-teal)' },
  { name: 'Attention span', kind: 'Focus', cat: 'brain', time: '3 min', desc: 'How well you stay focused and ignore distractions.', href: '/attention-span-test/', glyph: 'as', color: 'var(--color-blue)', tint: 'var(--color-tint-blue)' },
  { name: 'Stroop test', kind: 'Focus', cat: 'brain', time: '1 min', desc: 'How your mind copes when what you see and what you read disagree.', href: '/stroop-test/', glyph: 'st', color: 'var(--color-red)', tint: 'var(--color-tint-red)' },
  { name: 'Emotional intelligence', kind: 'Emotions', cat: 'emotions', time: '5 min', desc: 'How well you notice and handle feelings — yours and other people’s.', href: '/emotional-intelligence-test/', glyph: 'eq', color: 'var(--color-red)', tint: 'var(--color-tint-red)' },
];

export const testFilters: { key: 'all' | TestCategory; label: string }[] = [
  { key: 'all', label: 'All tests' },
  { key: 'brain', label: 'Memory & focus' },
  { key: 'personality', label: 'Personality' },
  { key: 'emotions', label: 'Emotions' },
];

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
  { q: 'Is it really free?', a: 'Yes. Every test and every result is free, with no sign-up. The site is supported by ads.' },
  { q: 'How accurate are these tests?', a: "They're based on well-known psychology experiments and questionnaires. Great for learning about yourself — but one result is a snapshot, not a final answer." },
  { q: 'Do you save my answers?', a: 'No. Your answers are scored on your own device and never sent to us.' },
  { q: 'Is this a medical or mental-health test?', a: "No. KnowPsyche is for learning and self-reflection. It can't diagnose anything — for that, please talk to a professional." },
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
  { key: 'focus', label: 'Focus', title: 'One thing at a time.', note: 'See how well you ignore distractions — it takes three minutes.', cta: { label: 'Attention span test', href: '/attention-span-test/' }, col: '#7d8cf0', anim: 'pulse-loop', speed: '26s' },
  { key: 'reflect', label: 'Reflect', title: 'What did you notice today?', note: 'A thought that kept coming back is worth a closer look.', col: '#EDCA69', anim: 'breathe', speed: '90s' },
];

export const PRIVATE_LINE = 'Private by design: your answers never leave this page.';

export const DISCLAIMER =
  "KnowPsyche tests are for learning and self-reflection. They are not medical or psychological assessments. If you're worried about your health or wellbeing, please speak to a qualified professional.";
