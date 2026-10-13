// Copy from docs/content/part-2.md, "Test 5 — Attention Span". Word for word.
// Lines marked "Drafted" are not in the content doc: written for the build, waiting for Dev's review.
import type { Faq, Source } from '../shared';

export interface AttentionBand {
  min: number;
  badge: string;
  text: string;
}

/** Bands: Under 70 (Drifting), 70–84 (Steady), 85–94 (Focused), 95+ (Laser). */
export const attentionBands: AttentionBand[] = [
  { min: 0, badge: 'Drifting', text: 'Your focus wandered or you clicked on reds. Very common when tired or distracted.' },
  { min: 70, badge: 'Steady', text: 'You stayed with the task most of the time.' },
  { min: 85, badge: 'Focused', text: 'Strong focus and good self-control.' },
  { min: 95, badge: 'Laser', text: 'You barely missed a thing.' },
];

export const page = {
  title: 'Attention Span Test — How Well Do You Stay Focused?',
  description:
    'Click for green, hold back for red. A 2-minute focus test based on a classic psychology task. Free, instant results for focus and self-control.',
  h1: 'Attention span test',
  intro: "Circles will appear one at a time. Click (or tap) when you see green. Do nothing when you see red. Stay with it — it's longer than it feels.",
  // Touch screens: same line with "tap" (shared rule).
  introTouch: "Circles will appear one at a time. Tap when you see green. Do nothing when you see red. Stay with it — it's longer than it feels.",
  crumb: 'Attention span',
  // Drafted (eyebrow and metaLine).
  eyebrow: 'Test / 05 · Attention · 2–3 min',
  metaLine: 'About 2–3 minutes · 80 circles · Nothing saved',
};

export const ui = {
  // Practice feedback from doc.
  nice: 'Nice!',
  oopsRed: 'Oops — that was red',
  // Drafted: practice feedback for the other two outcomes.
  niceIgnored: 'Nice — you held back!',
  oopsGreen: 'Missed — click on green',
  // Drafted: touch version of the line above.
  oopsGreenTouch: 'Missed — tap on green',
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
  steady: 'Steady',
  steadyDetail: 'consistent across halves',
  dipped: 'Dipped',
  dippedDetail: (diff: number) => `second half −${diff} pts`,
  copyDipped: 'Dipped in 2nd half',
  shareLabel: 'My attention score',
  shareTagline: 'How well do you stay focused?',
};

export const result = {
  change: 'Sleep, phone notifications, noise and how interested you are in the task.',
  // Drafted: "Try this" reuses FAQ 4's answer word for word (the doc gives no tip).
  tip: "Remove notifications, work in focused blocks (for example 25 minutes), sleep well, and take short breaks before you're exhausted.",
  dippedNote: "Your focus dipped in the second half — that's normal; attention tires with time.",
  next: {
    href: '/stroop-test/',
    name: 'Stroop test',
    time: '1 min',
    line: 'Try the Stroop test — it puts your focus up against your reading habit.',
  },
  learn: { href: '/method/', label: 'How we build our tests →' },
};

export const faqs: Faq[] = [
  {
    q: 'What is attention span?',
    a: "How long you can keep your focus on one task. It isn't one fixed number — it changes with the task, your mood and how tired you are.",
  },
  {
    q: 'Is the average attention span really 8 seconds, shorter than a goldfish?',
    a: 'No. That claim is widely repeated but has no solid research behind it.',
  },
  {
    q: 'What is a Go/No-Go task?',
    a: 'A classic psychology task: respond to one kind of signal and hold back on another. It measures focus and self-control together.',
  },
  {
    q: 'How can I improve my attention span?',
    a: "Remove notifications, work in focused blocks (for example 25 minutes), sleep well, and take short breaks before you're exhausted.",
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
