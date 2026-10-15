// Copy shared by every test page. Word for word from docs/content/part-2.md, "Shared rules".
export { PRIVATE_LINE } from './home';

/** Shown under the Start button only when JavaScript is off (Q4-A6, Dev's wording). */
export const NOSCRIPT_LINE = 'This test needs JavaScript. Please turn it on and reload the page.';

export const BANDS_NOTE =
  "These bands are our own guide to help you read your result. They're not compared with a population, and they're not a diagnosis.";

export interface Faq {
  q: string;
  a: string;
}

/** A source line. `title` is shown in italics (journal or book), between `before` and `after`. */
export interface Source {
  before: string;
  title: string;
  after?: string;
}

/** "What's happening in this test?": 3 to 5 short steps, one "What can change your result" line, one Learn article. */
export interface Happening {
  /** `id` marks a step the page script may rewrite after a result (`data-step` on its text). */
  steps: { title: string; text: string; id?: string }[];
  /** The text after "What can change your result:". */
  change: string;
  /** Learn article slug (src/content/learn/<slug>.md). */
  article: string;
}
