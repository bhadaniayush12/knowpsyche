import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { placeMarker } from './band-scale';

// Q4-A5: the "You · N" label stays inside the card at both ends of every band scale.

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (p: string) => readFileSync(join(root, p), 'utf8');

/** Just enough of a DOM for placeMarker: two elements found by their data-r selector. */
function fakeScale() {
  const make = () => {
    const props: Record<string, string> = {};
    return { textContent: '', style: { left: '', setProperty: (k: string, v: string) => (props[k] = v) }, props };
  };
  const marker = make();
  const label = make();
  const scope = { querySelector: (sel: string) => (sel === '[data-r="marker"]' ? marker : sel === '[data-r="marker-label"]' ? label : null) };
  return { scope: scope as unknown as ParentNode, marker, label };
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

  it('does nothing when the scale is missing', () => {
    expect(() => placeMarker({ querySelector: () => null } as unknown as ParentNode, 10, 'x')).not.toThrow();
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

  it.each(['reaction-time-test', 'number-memory-test', 'photographic-memory-test', 'stroop-test', 'attention-span-test', 'emotional-intelligence-test'])(
    '%s places its marker with placeMarker only',
    (slug) => {
      const page = read(`src/pages/${slug}/index.astro`);
      expect(page).toContain('placeMarker(resultEl, ');
      expect(page).not.toMatch(/marker-label['"\]]*\)?\.style\.left|ml\.style\.left|markerLabel\.style\.left/);
    },
  );
});
