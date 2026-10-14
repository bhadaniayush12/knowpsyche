// Copy shared by every test page. Word for word from docs/content/part-2.md, "Shared rules".
export { PRIVATE_LINE } from './home';

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
  steps: { title: string; text: string }[];
  /** The text after "What can change your result:". */
  change: string;
  /** Learn article slug (src/content/learn/<slug>.md). */
  article: string;
}
