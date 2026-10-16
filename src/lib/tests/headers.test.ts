import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Q6-3: no other site may show ours in a frame. Only that: no HSTS and no full Content-Security-Policy.

const root = fileURLToPath(new URL('../../../', import.meta.url));
const headers = readFileSync(join(root, 'public/_headers'), 'utf8');

/** The header lines of one rule block, by its path line. */
const block = (path: string) => {
  const lines = headers.split('\n');
  const start = lines.indexOf(path);
  expect(start).toBeGreaterThan(-1);
  const out: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (!/^\s+\S/.test(line)) break;
    out.push(line.trim());
  }
  return out;
};

describe('public/_headers (Q6-3)', () => {
  it('every page refuses to be framed', () => {
    const all = block('/*');
    expect(all).toContain('X-Frame-Options: DENY');
    expect(all).toContain("Content-Security-Policy: frame-ancestors 'none'");
  });

  it('the CSP is frame-ancestors only, and there is no HSTS', () => {
    const csp = headers.match(/^\s*Content-Security-Policy:.*$/gim) ?? [];
    expect(csp.map((l) => l.trim())).toEqual(["Content-Security-Policy: frame-ancestors 'none'"]);
    expect(headers).not.toMatch(/Strict-Transport-Security/i);
  });

  it('nothing is noindex (L1: the site is live on knowpsyche.com)', () => {
    expect(headers).not.toMatch(/noindex/i);
    expect(headers).not.toMatch(/X-Robots-Tag/i);
  });
});
