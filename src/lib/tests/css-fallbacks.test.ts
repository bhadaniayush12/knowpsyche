import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Q6-6 and Q6-7: older browsers drop a declaration or rule they can't parse. Each fallback must survive that.

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = (p: string) => readFileSync(join(root, p), 'utf8');

describe('band scale label without container query units (Q6-6)', () => {
  const label = read('src/components/result/BandScale.astro').match(/\.bs-label \{[^}]*\}/)![0];

  it('a plain centring translate comes first, the cqw clamp second', () => {
    const plain = label.indexOf('translate: -50% 0;');
    const clamp = label.indexOf('translate: clamp(');
    expect(plain).toBeGreaterThan(-1);
    expect(clamp).toBeGreaterThan(plain);
    expect(label.slice(clamp)).toContain('cqw');
  });
});
