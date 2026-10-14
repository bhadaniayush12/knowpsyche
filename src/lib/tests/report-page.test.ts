import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { reportPage } from '../../data/report';

// /report/ is decided by CSS before first paint (TrailFlag sets html[data-kp-saved]), so these read the page source.
const src = readFileSync(new URL('../../pages/report/index.astro', import.meta.url), 'utf8');
const css = src.slice(src.indexOf('<style is:global>'), src.indexOf('</style>', src.indexOf('<style is:global>')));
const printCss = css.slice(css.indexOf('@media print'));
const block = (cls: string) => {
  const start = src.indexOf(`class="${cls}`);
  return src.slice(start, src.indexOf('</section>', start));
};
const rulesFor = (sheet: string, selector: RegExp) =>
  [...sheet.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter(([, sel]) => selector.test(sel)).map(([, , body]) => body);

describe('/report/ empty state', () => {
  it('uses the given line and links to /tests/', () => {
    expect(reportPage.emptyText).toBe('Take a test and choose Save result, and your report will appear here.');
    const empty = block('rp-empty');
    expect(empty).toContain('{reportPage.emptyText}');
    expect(empty).toMatch(/href="\/tests\/"/);
  });

  it('shows instead of the report when nothing is saved, and the report shows instead of it when something is', () => {
    expect(css).toMatch(/\.rp-has, \.rp-pdf \{ display: none; \}/);
    expect(css).toMatch(/html\[data-kp-saved\] \.rp-has \{ display: block; \}/);
    expect(css).toMatch(/html\[data-kp-saved\] \.rp-empty \{ display: none; \}/);
  });
});

describe('/report/ Save as PDF button', () => {
  it('sits at the top, in the intro, with the iPhone hint, and only once', () => {
    const intro = block('rp-intro');
    expect(intro).toContain('class="rp-pdf');
    expect(intro).toContain('data-rp-print');
    expect(intro).toContain('{reportPage.pdfHint}');
    expect(reportPage.pdfHint).toBe('On iPhone: tap Share, then Print, then pinch the preview to get a PDF.');
    expect(src.match(/data-rp-print/g)).toHaveLength(2); // the button and the script that wires it
  });

  it('is hidden in the empty state', () => {
    // Hidden by default; only html[data-kp-saved] shows it.
    expect(css.slice(0, css.indexOf('@media print'))).toMatch(/\.rp-pdf \{ display: none; \}/);
    expect(css).toMatch(/html\[data-kp-saved\] \.rp-pdf \{ display: flex; \}/);
  });

  it('is hidden in print', () => {
    const hide = rulesFor(printCss, /(^|,)\s*\.rp-pdf\s*(,|$)/);
    expect(hide.length).toBeGreaterThan(0);
    expect(hide.join(' ')).toMatch(/display:\s*none\s*!important/);
  });

  it('page copy has no em dashes', () => {
    for (const s of Object.values(reportPage)) expect(s).not.toMatch(/—/);
  });
});
