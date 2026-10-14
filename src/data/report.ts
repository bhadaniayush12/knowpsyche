// Copy for /report/ (Task C3). Everything here is Drafted unless marked as given by Dev or reused word for word.
import type { TestId } from '../lib/saved-results';

/** The site link printed on every page of the report (given by Dev). */
export const REPORT_REF_URL = 'https://knowpsyche.com/?ref=report';

export const reportPage = {
  // Drafted.
  title: 'Your report | KnowPsyche',
  // Drafted.
  description: 'Your saved KnowPsyche results in one place, kept only in this browser. Add your name and save it as a PDF.',
  // Given by Dev ("Your report").
  h1: 'Your report',
  // Drafted (Dev asked for one line saying this).
  deviceLine: 'This report only shows results saved on this device.',
  // Given by Dev.
  nameLabel: 'Whose report is this?',
  // Drafted.
  nameHint: 'Optional. It stays on this device and appears on the cover.',
  // Given by Dev.
  savePdf: 'Save as PDF',
  // Given by Dev (G1).
  pdfHint: 'On iPhone: tap Share, then Print, then pinch the preview to get a PDF.',
  clear: 'Clear saved results',
  // Drafted: same wording as the result pages' clear status.
  cleared: 'Saved results cleared from this device.',
  // Drafted.
  previewLabel: 'Preview of your report',
  // Drafted: empty state title.
  emptyTitle: 'Nothing saved yet',
  // Given by Dev (G1).
  emptyText: 'Take a test and choose Save result, and your report will appear here.',
  // Reused from the 404 page.
  emptyLink: 'Browse the tests →',
};

export const reportSheet = {
  // Drafted.
  coverEyebrow: 'A KnowPsyche report',
  // Given by Dev: no name = "Your report" with the wordmark.
  noNameLead: 'Your ',
  noNameAccent: 'report',
  // Drafted.
  madeOn: (day: string) => `Made on ${day}`,
  savedOn: (day: string) => `Saved on ${day}`,
  // Given by Dev (section names).
  standout: 'What stood out',
  tryThis: 'One thing to try',
  means: "What it means and what it doesn't",
  // Drafted.
  untriedTitle: 'Other tests, whenever you like',
  // Drafted.
  notesTitle: 'Before you share it',
  // Given by Dev.
  shareLine: 'This file has your name and results. Share it only if you want to.',
  linkText: 'knowpsyche.com/?ref=report',
  linkCta: 'Take the tests free',
  // Word for word from the Disclaimer on /privacy/.
  disclaimer:
    'Everything on KnowPsyche is for education and self-reflection. Our tests are not clinical assessments, cannot diagnose any condition, and are not a substitute for advice from a qualified professional.',
  // Drafted: score labels next to the main number.
  notMeasured: 'None',
};

/** Unit shown after the main number on single-score tests. Drafted. */
export const scoreUnit: Partial<Record<TestId, { before?: string; after?: string }>> = {
  'reaction-time': { after: 'ms average' },
  'photographic-memory': { before: 'Level' },
  'number-memory': { after: 'digits' },
  'attention-span': { after: '/ 100' },
  stroop: { after: 'ms Stroop effect' },
};

/**
 * "What stood out", band by band, keyed by each test's band badge (Dev's copy, Drafted).
 * `all` is used when no band matches: the Enneagram (one line for every type) and a Stroop run that
 * couldn't be measured (it has no band).
 */
export const standout: Record<TestId, { all?: string; byBand?: Record<string, string> }> = {
  'reaction-time': {
    byBand: {
      // Drafted.
      Lightning: 'Your average came out very fast. Part of that is your screen and device, and part is how ready you were.',
      // Drafted.
      Quick: 'Your average came out quick. Your screen and device add a little delay of their own.',
      // Drafted.
      Steady: 'A steady average. This is a snapshot of one moment, nothing more. Screens add some delay.',
      // Drafted.
      'Needs a coffee': 'Your average landed in the slower bands. Tiredness, distractions or a laggy device often explain that.',
      // Drafted.
      'Running on empty': 'Your average was long. That usually says more about the setup or the moment than about you.',
    },
  },
  // Drafted.
  enneagram: { all: 'Your top scores show the patterns you recognised most. A type is a place to start reading, not a label.' },
  'photographic-memory': {
    byBand: {
      // Drafted.
      'Warming up': 'Visual memory fills up fast, and a first go is often the hardest. This is a starting point.',
      // Drafted.
      Solid: 'You held a good amount of the picture from a quick look.',
      // Drafted.
      Sharp: 'You kept a lot of the picture in mind at once.',
      // Drafted.
      Exceptional: 'You got through very detailed patterns.',
    },
  },
  'number-memory': {
    byBand: {
      // Drafted.
      'Warming up': 'You held a short run of digits before they slipped. This is a starting point, not a ceiling.',
      // Drafted.
      Steady: 'You held six or seven digits at once, a steady span for this task.',
      // Drafted.
      Strong: 'You held eight or more digits before losing track.',
      // Drafted.
      Exceptional: 'You went well past ten digits, which usually means you used a strategy such as chunking.',
    },
  },
  'attention-span': {
    byBand: {
      // Drafted.
      Drifting: 'Your focus wandered at times, or a few reds got a click. That happens when we are tired or distracted.',
      // Drafted.
      Steady: 'You stayed with the task most of the time.',
      // Drafted.
      Focused: 'Strong focus, and good control on the reds.',
      // Drafted.
      Laser: 'You caught nearly every green and held back on nearly every red.',
    },
  },
  stroop: {
    // Drafted: a run that couldn't be measured has no band.
    all: "This run couldn't be measured, so there is no result to show for it.",
    byBand: {
      // Drafted.
      Unshakeable: "The clashing words hardly slowed you down. Going carefully can do that, so it doesn't mean the effect is missing in you.",
      // Drafted.
      'Mild pull': 'The clashing words slowed you a little. Reading is so automatic that it gets in the way for a moment.',
      // Drafted.
      'Word-pulled': 'The words pulled on your attention. Tiredness or going fast can make that bigger.',
      // Drafted.
      'Strongly pulled': 'Reading ran on its own and the clashing words slowed you a lot.',
    },
  },
  'emotional-intelligence': {
    // Keyed by the overall band.
    byBand: {
      // Drafted.
      Growing: 'Some areas are still developing. The skills behind this can be practised.',
      // Drafted.
      Solid: 'You handle feelings well most of the time.',
      // Drafted.
      Strong: 'Several areas are clear strengths for you.',
      // Drafted.
      'Very strong': 'Your answers describe confident handling of feelings across areas.',
    },
  },
};

/**
 * "One thing to try", band by band (Dev's copy, Drafted). `all` covers a Stroop run with no band.
 * The Enneagram has no entries here: it uses the type's own tip from enneagram.ts.
 */
export const tryThis: Record<TestId, { all?: string; byBand?: Record<string, string> }> = {
  'reaction-time': {
    byBand: {
      // Drafted.
      Lightning: 'Take it again on a different device and see whether the number holds.',
      // Drafted.
      Quick: 'Rest a finger on the key before each try, then see whether a second go is faster.',
      // Drafted.
      Steady: 'Take it once more after a short break and see how the five tries look side by side.',
      // Drafted.
      'Needs a coffee': 'Try again after a short break, with this tab in front and notifications off.',
      // Drafted.
      'Running on empty': 'Use a computer with a mouse if you can, close other tabs, and try again when you feel rested.',
    },
  },
  enneagram: {},
  'photographic-memory': {
    byBand: {
      // Drafted.
      'Warming up': 'Look for shapes, like a line or an L, instead of remembering single squares.',
      // Drafted.
      Solid: 'Group tiles into shapes and see whether you reach the next level.',
      // Drafted.
      Sharp: 'Notice whether you used shapes or positions. Saying the pattern in your head can help it stick.',
      // Drafted.
      Exceptional: 'Try it once when you are tired and once when you are rested, and see how much the moment changes your result.',
    },
  },
  'number-memory': {
    byBand: {
      // Drafted.
      'Warming up': 'Say the digits in pairs or threes, like a phone number, instead of one at a time.',
      // Drafted.
      Steady: 'Chunk the digits into twos or threes and see whether you can add one more.',
      // Drafted.
      Strong: 'Notice how you did it. Chunking or a rhythm often helps, and it works for things like phone numbers too.',
      // Drafted.
      Exceptional: 'Try the same trick on something real, like a long code, and see how far it goes.',
    },
  },
  'attention-span': {
    byBand: {
      // Drafted.
      Drifting: 'Try again after a break, somewhere quiet, with your phone out of reach.',
      // Drafted.
      Steady: 'Notice whether it slipped early or late. A short break before a long task can help.',
      // Drafted.
      Focused: 'Try it at a different time of day and see whether the number moves.',
      // Drafted.
      Laser: 'One run is one snapshot. Try it on a busier day and see how your focus changes.',
    },
  },
  stroop: {
    // Drafted: a run that couldn't be measured has no band.
    all: 'Take the test again and save the new result.',
    byBand: {
      // Drafted.
      Unshakeable: 'Try again at a quicker pace and see what changes. Speed and accuracy trade off.',
      // Drafted.
      'Mild pull': 'Look at the ink, not the word, and try a second run. The gap often shrinks a little with practice.',
      // Drafted.
      'Word-pulled': 'Rest first, then go at a pace you can keep up. Speed and accuracy trade off.',
      // Drafted.
      'Strongly pulled': 'Try again when rested, a little slower, looking at the ink. Treat this as one snapshot.',
    },
  },
  'emotional-intelligence': {
    // Keyed by the overall band.
    byBand: {
      // Drafted.
      Growing: 'Pick one habit for a week: name what you feel in one word, or take three breaths before you reply.',
      // Drafted.
      Solid: 'Choose your lowest area and try one small habit from it for a week.',
      // Drafted.
      Strong: 'Use a strength to help someone else, like checking in with a friend who has gone quiet.',
      // Drafted.
      'Very strong': 'Keep asking how others see it, since a questionnaire shows how you see yourself.',
    },
  },
};
