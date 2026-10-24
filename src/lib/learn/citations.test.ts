import { describe, expect, it } from 'vitest';
import { citationUrl } from '../../data/citations';

describe('verified citation identity', () => {
  it('keeps the Goleman book unlinked despite its title matching another paper', () => {
    expect(citationUrl('Goleman, D. (1995). *Emotional Intelligence: Why It Can Matter More Than IQ*. Bantam Books.')).toBeUndefined();
  });

  it('distinguishes the 1990 framework from the 2016 ability-model paper', () => {
    expect(citationUrl('Salovey, P., & Mayer, J. D. (1990). Emotional intelligence.')).toBe('https://doi.org/10.2190/DUGG-P24E-52WK-6CDG');
    expect(citationUrl('Mayer, J. D., Caruso, D. R., & Salovey, P. (2016). The ability model of emotional intelligence: Principles and updates.')).toBe('https://doi.org/10.1177/1754073916639667');
  });

  it('does not link an unverified author or year to a familiar title', () => {
    expect(citationUrl('Someone, A. (1990). Emotional intelligence.')).toBeUndefined();
    expect(citationUrl('Salovey, P., & Mayer, J. D. (1991). Emotional intelligence.')).toBeUndefined();
  });
});
