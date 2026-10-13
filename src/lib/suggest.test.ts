import { describe, expect, it } from 'vitest';
import { levenshtein, suggestRoute, tokens, type Route } from './suggest';
import { routes } from '../data/routes';

const guess = (path: string) => suggestRoute(path, routes)?.href ?? null;

describe('levenshtein', () => {
  it('counts single edits', () => {
    expect(levenshtein('', '')).toBe(0);
    expect(levenshtein('abc', '')).toBe(3);
    expect(levenshtein('test', 'tset')).toBe(2);
    expect(levenshtein('kitten', 'sitting')).toBe(3);
  });
});

describe('tokens', () => {
  it('lowercases, splits and drops filler words', () => {
    expect(tokens('/Reaction-Time-Test/')).toEqual(['reaction', 'time']);
    expect(tokens('/about-us.html')).toEqual(['about']);
    expect(tokens('/stroop%20test')).toEqual(['stroop']);
  });
  it('survives malformed escapes', () => {
    expect(tokens('/%E0%A4%A/enneagram')).toContain('enneagram');
  });
});

describe('suggestRoute', () => {
  it.each([
    ['/reaction-tset/', '/reaction-time-test/'],
    ['/reacton-time/', '/reaction-time-test/'],
    ['/REACTION-TIME', '/reaction-time-test/'],
    ['/enneagram/', '/enneagram-test/'],
    ['/eneagram-test', '/enneagram-test/'],
    ['/stroop', '/stroop-test/'],
    ['/stroop-test.html', '/stroop-test/'],
    ['/number-memory', '/number-memory-test/'],
    ['/attention', '/attention-span-test/'],
    ['/eq-test/', '/emotional-intelligence-test/'],
    ['/privacy-policy', '/privacy/'],
    ['/privacy-policy.html', '/privacy/'],
    ['/terms-of-service/', '/terms/'],
    ['/terms-and-conditions', '/terms/'],
    ['/about-us/', '/about/'],
    ['/contact-us', '/contact/'],
    ['/contcat/', '/contact/'],
    ['/test/', '/tests/'],
    ['/tests.html', '/tests/'],
  ])('%s → %s', (path, href) => {
    expect(guess(path)).toBe(href);
  });

  it.each(['/xyz123', '/wp-admin/login.php', '/blog/2019/06/hello', '/iq-test/', '/', ''])(
    'gives no guess for %s',
    (path) => {
      expect(guess(path)).toBeNull();
    },
  );

  it('breaks ties by route order', () => {
    // "memory" fits both memory tests equally; photographic is listed first.
    expect(guess('/memory/')).toBe('/photographic-memory-test/');
    const a: Route = { href: '/a/', label: 'A', keys: ['same'] };
    const b: Route = { href: '/b/', label: 'B', keys: ['same'] };
    expect(suggestRoute('/same/', [a, b])).toBe(a);
    expect(suggestRoute('/same/', [b, a])).toBe(b);
  });

  it('returns null with no routes', () => {
    expect(suggestRoute('/stroop/', [])).toBeNull();
  });
});
