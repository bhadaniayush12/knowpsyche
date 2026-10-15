import { describe, expect, it } from 'vitest';
import { fitSize } from './share-card';

// A stand-in for measureText: each character is `ratio` × the font size wide.
const measure = (text: string, ratio: number) => (px: number) => text.length * px * ratio;

describe('share card shrink-to-fit', () => {
  it('keeps the largest size when the line already fits', () => {
    expect(fitSize(measure('247', 0.6), 320, 40, 716)).toBe(320);
  });

  it('steps down in 2px steps until the line fits', () => {
    const px = fitSize(measure('Two areas tied for strongest', 0.6), 64, 32, 716);
    expect(px % 2).toBe(0);
    expect(measure('Two areas tied for strongest', 0.6)(px)).toBeLessThanOrEqual(716);
    expect(measure('Two areas tied for strongest', 0.6)(px + 2)).toBeGreaterThan(716);
  });

  it('a wide fallback font (1.5× wider) still fits every line, or stops at the minimum', () => {
    const lines: [string, number, number][] = [
      ['MY EMOTIONAL INTELLIGENCE SCORE', 32, 20],
      ['Three areas tied for strongest', 64, 32],
      ['How well do you know your feelings?', 96, 40],
    ];
    for (const [text, max, min] of lines) {
      const m = measure(text, 0.9);
      const px = fitSize(m, max, min, 716);
      expect(px).toBeGreaterThanOrEqual(min);
      if (px > min) expect(m(px)).toBeLessThanOrEqual(716);
    }
  });

  it('never goes below the minimum, even for an impossible line', () => {
    expect(fitSize(measure('x'.repeat(500), 1), 64, 32, 716)).toBe(32);
  });

  it('lands on the minimum even when the step overshoots it', () => {
    expect(fitSize(() => 1e6, 33, 20, 100, 8)).toBe(20);
  });
});
