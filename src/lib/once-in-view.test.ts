import { describe, expect, it } from 'vitest';
import { easeHouse } from './once-in-view';

describe('easeHouse', () => {
  it('starts at 0 and ends at 1', () => {
    expect(easeHouse(0)).toBeCloseTo(0, 5);
    expect(easeHouse(1)).toBeCloseTo(1, 5);
  });

  it('only ever goes up, so a count-up never steps back', () => {
    let last = 0;
    for (let t = 0.01; t <= 1; t += 0.01) {
      const v = easeHouse(t);
      expect(v).toBeGreaterThanOrEqual(last);
      last = v;
    }
  });

  it('eases out: past halfway by the middle of the time', () => {
    expect(easeHouse(0.5)).toBeGreaterThan(0.5);
  });
});
