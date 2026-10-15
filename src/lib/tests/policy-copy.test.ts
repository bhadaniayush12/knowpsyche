import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { homeFaqs, homeTests } from '../../data/home';
import { faqs as attentionFaqs } from '../../data/tests/attention-span';
import { faqs as eqFaqs } from '../../data/tests/emotional-intelligence';
import { faqs as enneagramFaqs } from '../../data/tests/enneagram';
import { faqs as numberFaqs } from '../../data/tests/number-memory';
import { faqs as photoFaqs } from '../../data/tests/photographic-memory';
import { faqs as reactionFaqs } from '../../data/tests/reaction-time';
import { faqs as stroopFaqs } from '../../data/tests/stroop';

// Q3 audit: the site shows no ads yet, so no page may say it does. These read the source.

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = (p: string) => readFileSync(join(root, p), 'utf8');

describe('/privacy/ says there are no ads yet', () => {
  const page = read('src/pages/privacy/index.astro');

  it.each([
    "Here's what we keep, how Google Analytics works here, and why no result is a diagnosis.",
    'Never your answers, and never the time of each try. If you type a name on your report page, it is kept the same way, on this device only, and cleared with the rest.',
    "{ id: 'ads', label: 'Advertising' }",
    '<PolicySection id="ads" toc={toc} color="text-gold-ink" title="Advertising">',
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

  it('the small heading says "Why it\'s free"', () => {
    expect(page).toContain(">Why it's free</div>");
    expect(page).not.toContain('How the site pays for itself');
  });
});

describe('home FAQ says there are no ads yet', () => {
  const answer = (q: string) => homeFaqs.find((f) => f.q === q)?.a;

  it('"Is it really free?" does not say the site is supported by ads', () => {
    expect(answer('Is it really free?')).toBe('Yes. Every test and every result is free, with no sign-up.');
  });

  it('"Will there be ads?" still says ads may come later', () => {
    expect(answer('Will there be ads?')).toMatch(/^The site is free to use\. We may show ads later/);
  });
});

describe('dates are not in the future at launch', () => {
  it.each([
    ['src/pages/privacy/index.astro', 'Last updated 17 October 2026'],
    ['src/pages/terms/index.astro', 'Last updated 17 October 2026'],
    ['src/pages/method/index.astro', 'Last reviewed: 17 October 2026'],
  ])('%s says %s', (path, text) => expect(read(path)).toContain(text));

  const dir = 'src/content/learn';
  const files = readdirSync(join(root, dir)).filter((f) => f.endsWith('.md'));
  it.each(files)('%s has no date after 2026-10-17', (f) => {
    const dates = [...read(`${dir}/${f}`).matchAll(/^date(?:Published|Modified): (\S+)$/gm)].map((m) => m[1]);
    expect(dates).toHaveLength(2);
    for (const d of dates) expect(d <= '2026-10-17').toBe(true);
  });
});

describe('FAQs about saving stay true now that "Save result" exists', () => {
  const all = [...homeFaqs, ...attentionFaqs, ...eqFaqs, ...enneagramFaqs, ...numberFaqs, ...photoFaqs, ...reactionFaqs, ...stroopFaqs];

  it('the EQ answer mentions the opt-in', () => {
    expect(eqFaqs.find((f) => f.q === 'Do you save my answers?')?.a).toBe(
      'No. Everything is calculated in your browser, and your answers disappear when you close the page. If you press "Save result", only your scores are kept, on this device.',
    );
  });

  it.each(all.map((f) => [f.q, f.a]))('%s: no blanket "nothing is kept" claim', (_q, a) => {
    expect(a).not.toMatch(/nothing is (saved|stored|kept)|we (don't|do not|never) (save|store|keep)|we save nothing|everything[^.]*disappears/i);
    if (/disappear/i.test(a)) expect(a).toContain('Save result');
  });
});

describe('no popularity claims (we have no visitor data to back them)', () => {
  it('the reaction time card is labelled "Quick start"', () => {
    expect(homeTests.find((t) => t.href === '/reaction-time-test/')?.kind).toBe('Quick start');
  });

  it('no test card claims popularity', () => {
    for (const t of homeTests) expect(`${t.kind} ${t.desc}`).not.toMatch(/popular|trending|everyone/i);
  });
});
