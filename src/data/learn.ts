// The Learn section: hub copy, shared labels and the author used in Article JSON-LD.
// Not in the content docs: drafted for the build, waiting for Dev's review. The articles themselves
// live in src/content/learn/*.md.

/**
 * Author and publisher of every article, in the byline and the Article JSON-LD.
 * One constant, so a named author can replace it later in one place.
 */
export const AUTHOR = {
  '@type': 'Organization',
  name: 'KnowPsyche',
  url: 'https://knowpsyche.com/',
  logo: { '@type': 'ImageObject', url: 'https://knowpsyche.com/icon-512.png', width: 512, height: 512 },
} as const;

// Drafted.
export const hubTitle = 'Learn Psychology: Plain-English Guides | KnowPsyche';
// Drafted.
export const hubDescription =
  'Short, plain-English guides to memory, focus, emotions and personality, and the research behind each of our tests. Free to read, no sign-up.';
// Drafted. Two lines, the second in the serif accent (fixed break, as on /tests/).
export const hubH1 = ['Learn psychology,', 'in plain English.'] as const;
// Drafted.
export const hubEyebrow = 'Learn · Guides';
// Drafted.
export const hubIntro =
  "Short guides to the ideas behind our tests: how memory, focus and feelings work, what the research says, and what a test can and can't tell you.";
// Drafted. Shown on /learn/ when no article is published.
export const hubEmpty = 'The first guides are on their way. Until then, you can try one of our tests.';

// Drafted. The line near Sources on a test page, before the article links.
export const learnMoreLabel = 'Learn more:';
// Drafted. Heading above the related articles at the end of an article.
export const keepReadingLabel = 'Keep reading';
// From docs/design/Article.dc.html (Dev's wording, without the dash).
export const articleFootnote = 'For learning and self-reflection, not medical advice.';
// From docs/design/Article.dc.html.
export const tryTestLabel = 'Try a related test';
export const tocLabel = 'In this guide';
