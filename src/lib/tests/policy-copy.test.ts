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

  it('the meta description ends the same way, under 160 characters (Q3-C)', () => {
    const description =
      "Why KnowPsyche exists: free psychology tests scored in your browser and explained in plain words. Who builds it, and why it's free.";
    expect(page).toContain(`"${description}"`);
    expect(description.length).toBeLessThan(160);
    expect(page).not.toMatch(/pays for itself/i);
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

describe('attention article claims only what its sources support (Q3-C)', () => {
  const page = read('src/content/learn/attention-span-myths-and-what-helps.md');

  it('the notification sentence matches Stothart, Mitchum & Yehnert (2015)', () => {
    expect(page).toContain(
      "In one experiment, simply getting a phone notification, without picking up the phone, made people's performance on an attention task worse.",
    );
    expect(page).toContain('Stothart, C., Mitchum, A., & Yehnert, C. (2015)');
    expect(page).not.toContain('costs time and focus');
  });

  it('no uncited claim about heavy phone use studies', () => {
    expect(page).not.toMatch(/heavy phone use/i);
  });
});

describe('method page uses the same tie-break wording as the Enneagram page (Q3-19)', () => {
  it('the Enneagram maths row says a short tie-break round follows', () => {
    const page = read('src/pages/method/index.astro');
    expect(page).toContain(
      "['Enneagram', 'You rate 45 statements from 1 to 5, five for each of the nine types, so each type scores 5 to 25. If your top types are very close, a short tie-break round follows.'],",
    );
    expect(page).not.toContain('within a point of the top score');
  });
});

describe('no banned wording in any visible string in src/data/ (Q5)', () => {
  const BANNED: [RegExp, string][] = [
    [/missing out/i, '"missing out"'],
    [/you(?:'|’)re missing/i, `"you're missing"`],
    [/percentile/i, 'percentile'],
    [/\btop\s*(?:\d+|x)\s*%/i, '"top X%"'],
    [/\bMBTI\b/i, 'MBTI'],
    [/confetti/i, 'confetti'],
    [/streak/i, 'streak'],
  ];
  // String literals only; comments (source notes) are skipped. Whichever token starts first wins, so a quote
  // inside a comment or a // inside a string is read correctly.
  const TOKEN = /\/\/[^\n]*|\/\*[\s\S]*?\*\/|'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`/g;
  const walk = (dir: string): string[] =>
    readdirSync(join(root, dir), { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(`${dir}/${e.name}`) : e.name.endsWith('.ts') ? [`${dir}/${e.name}`] : [],
    );

  it.each(walk('src/data'))('%s', (file) => {
    const src = read(file);
    const hits: string[] = [];
    for (const m of src.matchAll(TOKEN)) {
      if (m[0].startsWith('/')) continue;
      for (const [re, label] of BANNED) {
        if (re.test(m[0])) hits.push(`${file}:${src.slice(0, m.index).split('\n').length}  ${label} in ${m[0]}`);
      }
    }
    expect(hits, hits.join('\n')).toEqual([]);
  });
});
