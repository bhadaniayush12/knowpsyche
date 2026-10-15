// Copy from docs/content/part-1.md, "Test 1 — Reaction Time". Word for word.
// Lines marked "drafted" were missing from the content doc and approved in the build plan.
import type { Faq, Source, Happening } from '../shared';

export interface ReactionBand {
  /** Upper bound in ms, inclusive. `Infinity` for the last band. */
  max: number;
  badge: string;
  text: string;
}

export const reactionBands: ReactionBand[] = [
  // Drafted: removed comparison wording.
  { max: 199, badge: 'Lightning', text: 'Crisp and very fast. Great focus, or a very responsive screen.' },
  // Drafted: removed comparison wording.
  { max: 250, badge: 'Quick', text: 'Quick and alert on the trigger.' },
  // Drafted: describes the average without comparing to others.
  { max: 300, badge: 'Steady', text: 'A steady pace. Your screen and device add a little to this.' },
  { max: 400, badge: 'Needs a coffee', text: 'Tiredness, distractions or a laggy device often explain this.' },
  { max: Infinity, badge: 'Running on empty', text: 'Try again on a computer with a mouse, after a short break.' },
];

export const page = {
  // Drafted: em dash removed.
  title: 'Reaction Time Test: Free, 5 Tries, Instant Result',
  // Drafted: removed comparison wording (146 chars <= 155 chars).
  description:
    "How fast do you react? Click when the screen changes. Get your average in milliseconds, see your response band, and learn what affects your speed.",
  h1: 'Reaction time test',
  intro: 'Wait for the box to change, then click as fast as you can. Five tries, then your average.',
  // Touch screens: same line with "tap" (shared rule: timed tests on phones say "tap").
  introTouch: 'Wait for the box to change, then tap as fast as you can. Five tries, then your average.',
  crumb: 'Reaction time',
  // Drafted.
  eyebrow: 'Test / 01 · Attention · 1 min',
  metaLine: 'About 1 minute · 5 tries · Saved only if you choose',
};

export type ReactionMode = 'visual' | 'sound' | 'f1' | 'space';

export const modes: { key: ReactionMode; label: string; note?: string; resultNote?: string }[] = [
  { key: 'visual', label: 'Visual' },
  {
    key: 'sound',
    label: 'Sound',
    note: 'Your speakers can add a small delay.',
    // Drafted, from "Sound mode usually comes out a little faster than visual".
    resultNote: 'Sound mode usually comes out a little faster than visual.',
  },
  {
    key: 'f1',
    label: 'F1 lights',
    note: 'Can you match a race start?',
    // Drafted, from "F1 mode a little slower".
    resultNote: 'F1 mode usually comes out a little slower than visual.',
  },
  // Drafted note.
  { key: 'space', label: 'Spacebar', note: 'Press the spacebar instead of clicking.' },
];

// Drafted (Q2-14, Dev's wording): sound mode can't start a try because the audio isn't running.
export const soundBlocked = "Sound can't play right now (silent mode or blocked). Switching to visual mode.";

/** Box text per phase. `{v}` = Click/Tap, `{V}` = capitalised. Drafted except where the content doc gives it. */
export const arena = {
  idle: {
    big: '{V} to start',
    small: {
      visual: 'When the box turns light teal, {v} as fast as you can.',
      sound: 'When you hear the beep, {v} as fast as you can.',
      f1: '{V} the moment all five lights go out.',
      space: 'When the box turns light teal, press Space as fast as you can.',
    } as Record<ReactionMode, string>,
  },
  spaceIdleBig: 'Press Space to start',
  wait: {
    big: 'Wait for it…',
    small: { visual: 'Not yet.', sound: 'Listen for the beep.', f1: 'Wait for the lights to go out.', space: 'Not yet.' } as Record<ReactionMode, string>,
  },
  go: { visual: 'CLICK!', space: 'SPACE!' },
  goTouch: 'TAP!',
  early: { big: 'Too soon!', small: 'That try doesn’t count. {V} to try again.' },
  guess: { big: 'Too quick to count', small: 'Under 100 ms is a guess, not a reaction. {V} to try again.' },
  shown: { small: '{V} to keep going.' },
  done: { small: 'Your average across 5 tries. Your result is below.' },
};

export const result = {
  change:
    'Sleep, alertness, practice and age all play a part. So does your device: screens and mice can add tens of milliseconds before your brain is even involved.',
  // Next test (name, link, time) comes from nextAfter() in data/home.ts, in doc order.
  // Drafted: the doc's line points to Attention span; the chain now follows the doc order 1–7.
  nextLine: 'Speed is one side of you. See what drives your choices in the Enneagram test.',
  learn: { href: '/method/', label: 'How we build our tests →' },
  spreadChallenge: 'Fast, but a bit inconsistent. Can you get all five within 50 ms?',
  // Drafted: em dash removed.
  morningNight: 'Tiredness slows reactions. Test yourself in the morning and again late at night, and see the difference.',
};

export const faqs: Faq[] = [
  // Drafted: em dash removed.
  { q: 'What is reaction time?', a: 'The time between noticing a signal and responding to it: here, between the box changing and your click.' },
  // Drafted: general browser fact without comparison to what most people do.
  { q: 'What is the average reaction time?', a: 'Browser tests often measure between 200 and 300 ms, but times vary with your screen, mouse or phone, and how alert you feel.' },
  { q: 'What is a good reaction time?', a: 'Under 250 ms is quick; under 200 ms is very fast.' },
  { q: 'Why is my reaction time so slow?', a: 'The usual reasons are tiredness, distraction, a phone touchscreen, or a slow monitor or mouse.' },
  { q: 'How can I improve my reaction time?', a: 'Sleep well, warm up with a few tries, stay focused, and practise. For gaming, a fast mouse and a high-refresh monitor help most.' },
  // Drafted: em dash removed.
  { q: 'Does being tired slow your reaction time?', a: 'Yes. Lack of sleep is one of the most reliable ways to slow down.' },
  { q: 'Does caffeine help?', a: "Some studies find a small improvement in alertness and reaction time, especially when you're tired." },
  // Drafted: removed comparison wording.
  { q: 'At what age is reaction time fastest?', a: 'Usually in the late teens and twenties. It slows gradually after that.' },
  { q: "What's the difference between a reaction and a reflex?", a: "A reflex (like the knee-jerk) happens automatically without a decision. A reaction needs your brain to notice and decide, so it's slower." },
  { q: "What's the difference between simple and choice reaction time?", a: 'Simple = one signal, one response (this test). Choice = several possible signals and responses, which takes longer.' },
  // Drafted: em dash removed.
  { q: "Why don't times under 100 ms count?", a: "Humans can't really react that fast to a signal, so it's a lucky guess. Sprint races use the same idea: a start under 0.1 seconds counts as a false start." },
  { q: 'Why is sound faster than sight?', a: 'Many studies find people react slightly faster to sounds than to lights.' },
  { q: 'Is this a medical test?', a: "No. It's for curiosity and self-reflection, not a diagnosis." },
];

export const sources: Source[] = [
  { before: 'Woods, D. L., et al. (2015). Factors influencing the latency of simple reaction time. ', title: 'Frontiers in Human Neuroscience', after: '.' },
  { before: 'Jain, A., et al. (2015). A comparative study of visual and auditory reaction times. ', title: 'International Journal of Applied and Basic Medical Research', after: '.' },
];

// "What's happening in this test?" (D1). Every line Drafted, checked against src/lib/tests/reaction-time.ts and the page script.
export const happening: Happening = {
  steps: [
    // Drafted: Dev's base.
    { title: 'Wait.', text: "The box sits still, then changes after a random pause, so you can't guess when." },
    // Drafted: Dev's base, plus the other modes (sound, F1 lights, spacebar). Q2-08: "light teal", the colour on screen.
    { title: 'React.', text: 'When it turns light teal, click or tap as fast as you can. The other modes use a beep, race lights going out, or the spacebar instead.' },
    // Drafted: Dev's base; the code also repeats presses under 100 ms.
    { title: 'Five tries.', text: "Each try is timed from the change to your press. If you press before the change, or less than 100 ms after it, that try doesn't count and you go again." },
    // Drafted: Dev's base.
    { title: 'Your average.', text: 'The five times are averaged. First tries are often slower while you learn the task, so look at the pattern too.' },
  ],
  // Drafted.
  change: 'your screen and device, how rested you are, and whether you were ready. A different setup can give a different number.',
  article: 'what-a-reaction-time-test-measures',
};
