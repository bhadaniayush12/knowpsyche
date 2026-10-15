import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { placeMarker } from './band-scale';

// Q4-A5: the "You · N" label stays inside the card at both ends of every band scale.

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (p: string) => readFileSync(join(root, p), 'utf8');

/** Just enough of a DOM for placeMarker: marker, label and the phone legend's lines. */
function fakeScale(bands: string[] = []) {
  const make = () => {
    const props: Record<string, string> = {};
    return { textContent: '', style: { left: '', setProperty: (k: string, v: string) => (props[k] = v) }, props };
  };
  const marker = make();
  const label = make();
  const legend = bands.map((band) => {
    const attrs = new Set<string>();
    return { dataset: { band }, attrs, toggleAttribute: (k: string, on: boolean) => (on ? attrs.add(k) : attrs.delete(k)) };
  });
  const scope = {
    querySelector: (sel: string) => (sel === '[data-r="marker"]' ? marker : sel === '[data-r="marker-label"]' ? label : null),
    querySelectorAll: (sel: string) => (sel === '[data-band-legend] [data-band]' ? legend : []),
  };
  const current = () => legend.filter((l) => l.attrs.has('data-current')).map((l) => l.dataset.band);
  return { scope: scope as unknown as ParentNode, marker, label, current };
}

describe('placeMarker', () => {
  it.each([
    [2, '2%', 'You · No slowdown'],
    [50, '50%', 'You · 237'],
    [100, '100%', 'You · 500'],
  ])('puts the marker at %s and hands the label the same position', (pct, left, text) => {
    const { scope, marker, label } = fakeScale();
    placeMarker(scope, pct, text);
    expect(marker.style.left).toBe(left);
    expect(label.props['--p']).toBe(String(pct));
    expect(label.style.left).toBe(''); // the CSS places the label, never an inline left
    expect(label.textContent).toBe(text);
  });

  it.each([
    [-12, '0%'],
    [130, '100%'],
  ])('keeps an out-of-range %s on the bar', (pct, left) => {
    const { scope, marker, label } = fakeScale();
    placeMarker(scope, pct, 'You');
    expect(marker.style.left).toBe(left);
    expect(label.props['--p']).toBe(left.replace('%', ''));
  });

  it('marks your band in the phone legend, and only that one', () => {
    const { scope, current } = fakeScale(['Drifting', 'Steady', 'Focused', 'Laser']);
    placeMarker(scope, 98, 'You · 100', 'Laser');
    expect(current()).toEqual(['Laser']);
    placeMarker(scope, 2, 'You · 0', 'Drifting'); // a retake moves the mark
    expect(current()).toEqual(['Drifting']);
  });

  it('marks no band when none is given (Stroop with no measured effect, reaction time)', () => {
    const { scope, current } = fakeScale(['Unshakeable', 'Mild pull']);
    placeMarker(scope, 50, 'You · x', 'Mild pull');
    placeMarker(scope, 2, 'You · x');
    expect(current()).toEqual([]);
  });

  it('does nothing when the scale is missing', () => {
    expect(() => placeMarker({ querySelector: () => null, querySelectorAll: () => [] } as unknown as ParentNode, 10, 'x')).not.toThrow();
  });
});

describe('BandScale markup', () => {
  const scale = read('src/components/result/BandScale.astro');

  it('the bar is a size container and the label is clamped to 14px past either end (inside the 22px card padding)', () => {
    expect(scale).toMatch(/\.bs-bar \{\s+container-type: inline-size;/);
    expect(scale).toContain('--o: 14px;');
    expect(scale).toContain('translate: clamp(calc(var(--p) * -1cqw - var(--o)), -50%, calc((100 - var(--p)) * 1cqw + var(--o) - 100%)) 0;');
    expect(scale).toContain('px-[22px]');
  });

  it('band labels have room to the next one and may hyphenate', () => {
    expect(scale).toContain("'flex min-w-0 flex-col gap-0.5 pr-1.5'");
    expect(scale).toMatch(/text-ink-soft hyphens-auto/);
  });

  it('below 640px the labels under the bar give way to a legend, one band per line', () => {
    expect(scale).toContain('<div class="mt-2.5 flex max-sm:hidden" aria-hidden="true">');
    expect(scale).toMatch(/\{!ticks && \(\s+<ul data-band-legend class="[^"]*\bflex-col\b[^"]*\bsm:hidden"/);
    expect(scale).toContain('<li data-band={s.label} class="group flex items-center');
    expect(scale).toContain('data-current:font-semibold');
    expect(scale).toContain('invisible h-4 w-1 flex-none bg-coral group-data-current:visible');
  });

  it.each([
    ['attention-span-test', 'band.badge'],
    ['number-memory-test', 'band.badge'],
    ['photographic-memory-test', 'band.badge'],
    ['emotional-intelligence-test', 'res.overallBand.badge'],
    ['stroop-test', 'measured ? band.badge : undefined'],
  ])('%s tells the legend which band is yours', (slug, arg) => {
    expect(read(`src/pages/${slug}/index.astro`)).toMatch(new RegExp(`placeMarker\\(resultEl, .*, ${arg.replace(/[.?]/g, '\\$&')}\\);`));
  });

  it.each(['reaction-time-test', 'number-memory-test', 'photographic-memory-test', 'stroop-test', 'attention-span-test', 'emotional-intelligence-test'])(
    '%s places its marker with placeMarker only',
    (slug) => {
      const page = read(`src/pages/${slug}/index.astro`);
      expect(page).toContain('placeMarker(resultEl, ');
      expect(page).not.toMatch(/marker-label['"\]]*\)?\.style\.left|ml\.style\.left|markerLabel\.style\.left/);
    },
  );
});
