// Copy from docs/content/part-2.md, "Test 7 — Emotional Intelligence". Word for word.
// Lines marked "Drafted" are not in the content doc: written for the build, waiting for Dev's review.
import type { Faq, Source } from '../shared';

export type AreaId = 'knowing' | 'managing' | 'reading' | 'relationships';

export const page = {
  title: 'Emotional Intelligence Test (Free, 28 Questions) | KnowPsyche',
  description:
    "A free, private emotional intelligence test. 28 quick statements on how you notice, manage and read feelings, yours and other people's. Results in about 5 minutes, never stored.",
  h1: 'How do you handle feelings?',
  intro:
    "Emotional intelligence is how well you notice feelings, yours and other people's, and what you do with them. Rate 28 statements about how you usually act. There are no right answers, only honest ones. Your result shows four areas, so you can see where you're already strong and what's worth practising.",
  crumb: 'Emotional intelligence',
  // Drafted (eyebrow, and metaLine in the same format as the other tests).
  eyebrow: 'Test / 07 · Emotions · 5 min',
  metaLine: 'About 5 minutes · 28 statements · Nothing saved',
};

/** Answer scale, values 1–5. */
export const scale = ['Not like me', 'A little like me', 'Somewhat like me', 'Mostly like me', 'Very like me'];

export interface Area {
  id: AreaId;
  name: string;
  high: string;
  lower: string;
  tip: string;
}

export const areas: Area[] = [
  {
    id: 'knowing',
    name: 'Knowing your feelings',
    high: 'You usually know what you feel and why. That makes it easier to choose how to respond instead of just reacting.',
    lower: "Feelings sometimes show up before you can name them. That's common, and it gets easier.",
    tip: 'Once a day, stop and name your feeling in one specific word ("restless", "proud", "left out"). Naming a feeling is one of the simplest ways to get some distance from it.',
  },
  {
    id: 'managing',
    name: 'Managing your feelings',
    high: "Strong feelings don't easily push you around. You can pause, reset and keep going.",
    lower: "Big feelings can take the wheel for a while. That's human, and it's a skill you can build.",
    tip: 'When you feel the surge, take three slow breaths before you reply. Even a short pause gives you more choice about what you say next.',
  },
  {
    id: 'reading',
    name: 'Reading other people',
    high: "You pick up on how people feel, even when they don't say it. People likely feel understood around you.",
    lower: "Other people's feelings can be hard to read. Asking is a perfectly good substitute for guessing.",
    tip: 'In your next conversation, ask one "how did that feel?" question and really listen to the answer.',
  },
  {
    id: 'relationships',
    name: 'Handling relationships',
    high: 'You can handle the hard parts of relationships: saying sorry, saying no, talking through a conflict.',
    lower: 'Tough conversations may feel easier to avoid. Small, honest steps help.',
    tip: 'Next time something bothers you, say it early and simply: "When X happened, I felt Y."',
  },
];

export interface Statement {
  /** Number in the content doc, 1–28. */
  n: number;
  text: string;
  area: AreaId;
  /** Reverse-scored: score = 6 − answer. */
  reverse: boolean;
}

/** The 28 statements in doc order. `area` and `reverse` are hidden from users and used only for scoring. */
export const statements: Statement[] = [
  { n: 1, area: 'knowing', reverse: false, text: 'I can usually name what I\'m feeling, not just "good" or "bad".' },
  { n: 2, area: 'knowing', reverse: false, text: 'I notice when my mood starts to change, before it takes over.' },
  { n: 3, area: 'knowing', reverse: false, text: 'I know which situations tend to stress me out.' },
  { n: 4, area: 'knowing', reverse: true, text: "Sometimes I'm upset and have no idea why." },
  { n: 5, area: 'knowing', reverse: false, text: "I can tell how my feelings are shaping a decision I'm making." },
  { n: 6, area: 'knowing', reverse: false, text: 'I understand what my strong reactions say about what matters to me.' },
  { n: 7, area: 'knowing', reverse: true, text: 'Other people often notice my mood before I do.' },
  { n: 8, area: 'managing', reverse: false, text: "When I'm angry, I can pause before I say something I'd regret." },
  { n: 9, area: 'managing', reverse: false, text: 'I can calm myself down after a stressful moment.' },
  { n: 10, area: 'managing', reverse: true, text: 'A bad mood in the morning usually ruins my whole day.' },
  { n: 11, area: 'managing', reverse: false, text: "I can keep working on something even when I don't feel like it." },
  { n: 12, area: 'managing', reverse: false, text: 'When plans fall apart, I adjust instead of shutting down.' },
  { n: 13, area: 'managing', reverse: true, text: "I often act on impulse and wish I hadn't." },
  { n: 14, area: 'managing', reverse: false, text: 'I can stay hopeful when things are hard for a while.' },
  { n: 15, area: 'reading', reverse: false, text: "I can tell how someone feels from their face or tone, even if they don't say it." },
  { n: 16, area: 'reading', reverse: false, text: 'I notice when someone in a group feels left out.' },
  { n: 17, area: 'reading', reverse: false, text: "I can see a situation from someone else's side, even when I disagree." },
  { n: 18, area: 'reading', reverse: true, text: 'People sometimes surprise me by being upset with something I said.' },
  { n: 19, area: 'reading', reverse: false, text: 'I can sense the mood of a room when I walk in.' },
  { n: 20, area: 'reading', reverse: false, text: 'I pay attention to what people mean, not only what they say.' },
  { n: 21, area: 'reading', reverse: true, text: 'I find it hard to understand why people react the way they do.' },
  { n: 22, area: 'relationships', reverse: false, text: "I can tell someone they've upset me without starting a fight." },
  { n: 23, area: 'relationships', reverse: false, text: 'When friends argue, I can help them hear each other.' },
  { n: 24, area: 'relationships', reverse: false, text: 'I find it easy to say sorry when I get something wrong.' },
  { n: 25, area: 'relationships', reverse: true, text: 'I avoid hard conversations even when they need to happen.' },
  { n: 26, area: 'relationships', reverse: false, text: 'People come to me when they need to talk.' },
  { n: 27, area: 'relationships', reverse: false, text: 'I can say no without feeling guilty for days.' },
  { n: 28, area: 'relationships', reverse: true, text: 'I tend to give up on people after one disagreement.' },
];

/**
 * Fixed order shown on screen (doc numbers). Areas interleaved so the same area never appears twice
 * in a row, and no two reverse-scored statements sit next to each other. Never shuffled at runtime.
 */
export const order = [2, 27, 19, 13, 6, 10, 5, 21, 23, 15, 25, 9, 24, 7, 26, 18, 11, 1, 28, 20, 14, 16, 12, 4, 17, 22, 3, 8];

export interface EqBand {
  min: number;
  badge: string;
  text: string;
}

/** Bands (our guide, not a norm): Under 50 Growing, 50–70 Solid, 70–85 Strong, 85+ Very strong. Each starts at its lower number. */
export const bands: EqBand[] = [
  { min: 0, badge: 'Growing', text: 'This area is still developing. Totally normal; it improves with practice.' },
  { min: 50, badge: 'Solid', text: 'You handle this well most of the time.' },
  { min: 70, badge: 'Strong', text: 'A clear strength for you.' },
  { min: 85, badge: 'Very strong', text: 'Something people probably rely on you for.' },
];

export const result = {
  sameAnswerNote: 'You gave every statement the same answer. Your result may be less useful. Want to try again?',
  closing:
    "Emotional intelligence isn't fixed. Everyone's result moves as they practise. Come back in a few months and see what's changed.",
  next: {
    href: '/enneagram-test/',
    name: 'Enneagram',
    time: '8 min',
    line: 'See what drives you underneath',
  },
  learn: { href: '/method/', label: 'How we build our tests →' },
};

export const ui = {
  /** The doc's "7 of 28" progress form. */
  count: (n: number, total: number) => `${n} of ${total}`,
  // Drafted: everything from here to the end of `ui`.
  back: '← Back',
  restart: 'Restart ↺',
  copyScores: 'Copy my scores',
  leaveWarning: 'Your answers will be lost if you leave this page.',
};

/** Headline from the doc: "Your strongest area: Reading other people." */
export const strongestLine = (names: string[]) =>
  names.length === 1
    ? `Your strongest area: ${names[0]}.`
    : // Drafted: the doc says "If two areas tie, show both" but gives no wording.
      `Your strongest areas: ${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}.`;

/** Drafted: labels on the result's score card, the share card and the copied text. */
export const resultUi = {
  eyebrow: 'Your result · Emotional intelligence',
  overall: 'Overall',
  cardTitle: 'Your four areas · out of 100',
  tryThis: 'Try this',
  shareLabel: 'My emotional intelligence',
  shareStrongest: (names: string[]) => `Strongest: ${names.join(' & ')}`,
  shareTagline: 'How do you handle feelings?',
  /** Area row and card label, e.g. "71/100 · Strong". */
  scoreBand: (score: number, badge: string) => `${score}/100 · ${badge}`,
  copyOverall: (overall: number, badge: string) => `Emotional intelligence: ${overall}/100 (${badge})`,
  copyArea: (name: string, score: number, badge: string) => `${name}: ${score}/100 (${badge})`,
  shareText: (overall: number, names: string[]) =>
    `My emotional intelligence result: ${overall}/100. Strongest area: ${names.join(' & ')}. How do you handle feelings?`,
};

export const faqs: Faq[] = [
  {
    q: 'What is emotional intelligence?',
    a: "It's the ability to notice, understand and manage feelings, both your own and other people's. Psychologists Peter Salovey and John Mayer described it in 1990, and Daniel Goleman's 1995 book made the idea popular.",
  },
  {
    q: 'Is EQ more important than IQ?',
    a: 'They measure different things. IQ tests are about reasoning and problem-solving; emotional intelligence is about feelings and relationships. Both matter, in different situations. Claims that EQ "matters twice as much" as IQ aren\'t well supported by research.',
  },
  {
    q: 'Can you improve your emotional intelligence?',
    a: 'Yes. These are skills, not fixed traits. Practising things like naming feelings, pausing before reacting and asking people how they feel can help over time.',
  },
  {
    q: 'How accurate is this test?',
    a: "It's a self-report test, so it shows how you see yourself. That's useful, but people don't always see themselves clearly. For a fuller picture, ask someone who knows you well how they'd answer a few of the statements about you.",
  },
  {
    q: 'Is this a clinical or professional assessment?',
    a: "No. It's an educational self-reflection tool, not a diagnosis, and it can't be used for hiring or clinical decisions. If you're struggling with your emotions, talking to a qualified professional is a good step.",
  },
  {
    q: 'Do you save my answers?',
    a: 'No. Everything is calculated in your browser and disappears when you close the page.',
  },
  {
    q: 'How long does the test take?',
    a: 'About 5 minutes. There are 28 statements and no time limit.',
  },
  {
    q: "What's a good emotional intelligence score?",
    a: "There's no pass mark. Our bands (Growing, Solid, Strong, Very strong) are a simple guide we made to help you read your result. They aren't compared with other people.",
  },
];

export const sources: Source[] = [
  {
    before: 'Salovey, P., & Mayer, J. D. (1990). Emotional intelligence. ',
    title: 'Imagination, Cognition and Personality',
    after: ', 9(3), 185–211.',
  },
  {
    before: 'Goleman, D. (1995). ',
    title: 'Emotional Intelligence: Why It Can Matter More Than IQ',
    after: '. Bantam Books.',
  },
];

export const sourcesNote =
  'The four areas follow the common self-awareness / self-management / social awareness / relationship skills grouping. All 28 statements are our own writing; we do not use any published, copyrighted EQ questionnaire.';
