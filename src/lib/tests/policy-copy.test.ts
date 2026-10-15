import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Q3 audit: the site shows no ads yet, so no page may say it does. These read the source.

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = (p: string) => readFileSync(join(root, p), 'utf8');

describe('/privacy/ says there are no ads yet', () => {
  const page = read('src/pages/privacy/index.astro');

  it.each([
    "Here's what we keep, how Google Analytics works here, and why no result is a diagnosis.",
    "{ id: 'ads', label: 'Advertising' }",
    "We don't show ads at the moment. If we add them, we'll update this page first and list the cookies they use.",
    "You can block or delete cookies in your browser settings, or install Google's opt-out add-on described above. The tests will still work.",
  ])('says: %s', (text) => expect(page).toContain(text));

  it('has no AdSense, consent-tool or ad opt-out text', () => {
    expect(page).not.toMatch(/AdSense|consent tool|European Economic Area|adssettings|aboutads/i);
  });
});

describe('/terms/ says there are no ads yet', () => {
  const page = read('src/pages/terms/index.astro');

  it.each([
    'Our content is ours, and links to other sites are run by others.',
    "{ id: 'third-parties', label: 'Other sites' }",
    'title="Links to other sites"',
    'KnowPsyche shows no ads at the moment. Links to other websites lead to sites run by third parties.',
    'Our <a href="/privacy/">privacy page</a> explains how cookies work here.',
  ])('says: %s', (text) => expect(page).toContain(text));

  it('has no AdSense or ads text', () => {
    expect(page).not.toMatch(/AdSense|paid for by ads|ads and links|cookies and ads/i);
  });
});

describe('/about/ says there are no ads yet', () => {
  const page = read('src/pages/about/index.astro');

  it('says the site is free and shows no ads right now', () => {
    expect(page).toContain(
      "KnowPsyche is free and shows no ads right now. If we add ads later, they will sit around the content, never inside a test while you're taking it.",
    );
    expect(page).not.toMatch(/AdSense/);
  });
});
