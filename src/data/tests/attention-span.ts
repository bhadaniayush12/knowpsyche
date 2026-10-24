// Copy from docs/content/part-2.md, "Test 5 — Attention Span". Word for word.
// Lines marked "Drafted" are not in the content doc: written for the build, waiting for Dev's review.
import type { Faq, Source, Happening } from '../shared';

export interface AttentionBand {
  min: number;
  badge: string;
  text: string;
  /** Touch screens: same line with "tapped" (shared rule). */
  textTouch?: string;
}

/** Bands: Under 70 (Drifting), 70–84 (Steady), 85–94 (Focused), 95+ (Laser). */
export const attentionBands: AttentionBand[] = [
  // textTouch drafted: the doc line with "tapped".
  { min: 0, badge: 'Drifting', text: 'This run included missed greens or presses on red circles.', textTouch: 'This run included missed greens or taps on red circles.' },
  { min: 70, badge: 'Steady', text: 'You stayed with the task most of the time.' },
  { min: 85, badge: 'Focused', text: 'You caught most greens and held back on most reds in this run.' },
  { min: 95, badge: 'Laser', text: 'You barely missed a thing.' },
];

export const page = {
  // Drafted: em dash removed.
  title: 'Attention Span Test: How Well Do You Stay Focused?',
  description:
    'Click for green, hold back for a red X. A 2–3 minute focus test based on a classic psychology task. Free, instant results for this task.',
  h1: 'Attention span test',
  // Drafted: em dash removed.
  // Q2-05: "a red circle with an X" (Dev's wording), so the shape cue is in the instructions too.
  intro: "Circles will appear one at a time. Click (or tap) when you see green. Do nothing when you see a red circle with an X. Stay with it: it's longer than it feels.",
  // Touch screens: same line with "tap" (shared rule).
  // Drafted: em dash removed.
  introTouch: "Circles will appear one at a time. Tap when you see green. Do nothing when you see a red circle with an X. Stay with it: it's longer than it feels.",
  crumb: 'Attention span',
  // Drafted (eyebrow and metaLine).
  eyebrow: 'Test / 05 · Attention · 2–3 min',
  metaLine: 'About 2–3 minutes · 80 circles · Saved only if you choose',
};

export const ui = {
  // Practice feedback from doc.
  nice: 'Nice!',
  // Drafted: em dash removed.
  oopsRed: 'Oops, that was red',
  // Drafted: practice feedback for the other two outcomes; em dash removed.
  niceIgnored: 'Nice, you held back!',
  // Drafted: em dash removed.
  oopsGreen: 'Missed: click on green',
  // Drafted: touch version of the line above; em dash removed.
  oopsGreenTouch: 'Missed: tap on green',
  // Drafted: touch version of the stage line (the doc intro's first instruction, with "Tap").
  stageLineTouch: 'Tap when you see <b class="text-teal-ink">green</b>. Do nothing when you see a <b class="text-coral-ink">red circle with an X</b>.',
  // Drafted: everything from here to the end of `ui`.
  ready: 'Click or press Space to start practice.',
  readyTouch: 'Tap to start practice.',
  practiceLabel: 'Practice round',
  practiceNote: '6 rounds with feedback · not scored',
  practiceCount: (n: number, total: number) => `Practice · ${n} / ${total}`,
  practiceDoneTitle: 'Practice complete',
  practiceDoneText: 'Ready for the real test? 80 circles with no feedback so you stay in flow.',
  practiceDoneNote: 'Ready for the real test',
  mainNote: 'No feedback · stay focused',
  arenaLabel: 'Attention span stimulus area',
  startMain: 'Start the test',
  circleCount: (n: number, total: number) => `Circle ${n} / ${total}`,
  pausedTitle: 'Test paused',
  pausedMessage: 'The window lost focus or was hidden. To keep scores accurate, please restart the test.',
  restart: 'Restart ↺',
  leaveWarning: 'Your progress will be lost if you leave this page.',
  copyScore: 'Copy my scores',
};

/** Drafted: labels on the result's score breakdown, the share card and the copied text. */
export const resultUi = {
  eyebrow: 'Your result · Attention span',
  breakdownTitle: 'Test breakdown · 80 circles',
  focusDetail: 'greens caught',
  selfControlDetail: 'reds held back',
  speedDetail: 'avg reaction time',
  steady: 'Consistent',
  steadyDetail: 'consistent across halves',
  dipped: 'Dipped',
  dippedDetail: (diff: number) => `second half −${diff} pts`,
  copyDipped: 'Dipped in 2nd half',
  shareLabel: 'My attention score',
  shareTagline: 'How well do you stay focused?',
};

export const result = {
  change: 'The score summarizes responses in this run; the cited sources do not identify why you missed or pressed on a signal.',
  // Drafted: "Try this" reuses FAQ 4's answer word for word (the doc gives no tip).
  tip: "Optional suggestion: choose a manageable task and reduce interruptions. The cited sources do not establish an improvement routine for this game.",
  // Drafted: em dash removed. Q2-23: second sentence is Dev's wording.
  dippedNote: 'Your score was lower in the second half. This comparison does not establish why it changed or whether a dip is expected.',
  // Next test (name, link, time) comes from nextAfter() in data/home.ts, in doc order.
  // Drafted: em dash removed.
  nextLine: 'Try the Stroop test. It puts your focus up against your reading habit.',
  learn: { href: '/method/', label: 'How we build our tests →' },
};

export const faqs: Faq[] = [
  {
    q: 'What is attention span?',
    // Drafted: em dash removed.
    a: "Here, the phrase refers to staying with a task. This game does not estimate one general attention-span duration.",
  },
  {
    q: 'Is the average attention span really 8 seconds, shorter than a goldfish?',
    a: 'No. That claim is widely repeated but has no solid research behind it.',
  },
  {
    q: 'What is a Go/No-Go task?',
    a: 'A classic psychology task: respond to one kind of signal and hold back on another. Here, it records responses and withheld responses; the cited model does not validate a general focus or self-control score for this game.',
  },
  {
    q: 'How can I improve my attention span?',
    a: "Optional suggestion: choose a manageable task and reduce interruptions. The cited sources do not establish an improvement routine for this game.",
  },
  {
    q: 'Can this test tell if I have ADHD?',
    a: "No. It's not a diagnosis. If focus problems affect your daily life, talk to a doctor or psychologist.",
  },
];

export const sources: Source[] = [
  {
    before: 'Gomez, P., Ratcliff, R., & Perea, M. (2007). A model of the go/no-go task. ',
    title: 'Journal of Experimental Psychology: General',
    after: '.',
  },
  {
    before: 'Donders, F. C. (1969). On the speed of mental processes (W. G. Koster, Trans.). ',
    title: 'Acta Psychologica',
    after: ', 30, 412–431. (Original work published 1868; the first go/no-go style reaction task.)',
  },
];

// "What's happening in this test?" (D1). Every line Drafted, checked against src/lib/tests/attention-span.ts and the page script.
export const happening: Happening = {
  steps: [
    // Drafted.
    { title: 'Practise first.', text: "Six practice circles with feedback come first. They don't count." },
    // Drafted.
    { title: 'Green or red.', text: 'Circles appear one at a time for half a second each. Click or tap for green, and do nothing for a red circle with an X. A press only counts while the circle is on screen.' },
    // Drafted.
    { title: 'Stay with it.', text: 'The real run is 80 circles, 60 green and 20 red, with no feedback.' },
    // Drafted.
    { title: 'Keep this tab in front.', text: 'If you switch tabs or the window loses focus, the run stops and you start again, so the timing stays fair.' },
    // Drafted.
    { title: 'Your score.', text: "Your score out of 100 is the average of two numbers: the share of greens you caught and the share of reds you held back on. Your speed is shown but doesn't change the score." },
  ],
  // Drafted.
  change: 'the responses entered in this session. These sources do not establish which conditions explain a score change.',
  article: 'attention-span-myths-and-what-helps',
};
