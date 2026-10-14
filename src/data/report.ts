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
  clear: 'Clear saved results',
  // Drafted: same wording as the result pages' clear status.
  cleared: 'Saved results cleared from this device.',
  // Drafted.
  previewLabel: 'Preview of your report',
  // Drafted: empty state.
  emptyTitle: 'Nothing saved yet',
  emptyText: 'Take any test and press "Save result" on your result. It will show up here, ready to save as a PDF.',
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
 * "What stood out": Drafted placeholders until Dev supplies the band-by-band copy.
 * Fill `byBand` with { [band badge]: text } and it wins over `all`.
 */
export const standout: Record<TestId, { all: string; byBand?: Record<string, string> }> = {
  'reaction-time': { all: 'Your average speed is the headline here. Your five tries together say more than any single one.' },
  enneagram: { all: 'The type that scored highest shows what tends to drive your choices.' },
  'photographic-memory': { all: 'How many tiles you could hold from a quick look before the pattern slipped.' },
  'number-memory': { all: 'How many digits you held in mind at once before losing track.' },
  'attention-span': { all: 'How well you kept your focus over 80 circles, catching greens and holding back on reds.' },
  stroop: { all: 'How much the written word pulled on you when it clashed with the ink colour.' },
  'emotional-intelligence': { all: 'Your strongest area is where you already handle feelings with the most ease.' },
};

/**
 * "One thing to try": placeholders until Dev's band-by-band copy arrives. Empty `byBand` means the report
 * reuses the test's own "Try this" tip from its result page (see report-view.ts).
 */
export const tryThis: Record<TestId, { byBand?: Record<string, string> }> = {
  'reaction-time': {},
  enneagram: {},
  'photographic-memory': {},
  'number-memory': {},
  'attention-span': {},
  stroop: {},
  'emotional-intelligence': {},
};
