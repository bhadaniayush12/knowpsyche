// Every real page, for the 404 page's "Did you mean…?" guess. Tests come from homeTests,
// so a new test only needs adding there (plus any extra guesses below).
import type { Route } from '../lib/suggest';
import { homeTests } from './home';

/** Extra words people might type for a test, keyed by href. */
const testAliases: Record<string, string[]> = {
  '/reaction-time-test/': ['reaction', 'reflex', 'reflexes', 'click speed'],
  '/enneagram-test/': ['personality type', 'nine types'],
  '/photographic-memory-test/': ['visual memory', 'eidetic'],
  '/number-memory-test/': ['digit span', 'digits'],
  '/attention-span-test/': ['attention', 'focus', 'go no go'],
  '/stroop-test/': ['stroop effect', 'colour word', 'color word'],
  '/emotional-intelligence-test/': ['eq', 'emotions', 'emotional'],
};

const slugWords = (href: string) => href.replace(/\//g, ' ').replace(/-/g, ' ').trim();

export const routes: Route[] = [
  ...homeTests.map((t) => ({
    href: t.href,
    label: /test$/i.test(t.name) ? t.name : `${t.name} test`,
    keys: [slugWords(t.href), t.name, ...(testAliases[t.href] ?? [])],
  })),
  { href: '/tests/', label: 'list of all tests', keys: ['all tests', 'tests list'] },
  { href: '/about/', label: 'About page', keys: ['about', 'about us', 'who'] },
  { href: '/method/', label: 'Method page', keys: ['method', 'methodology', 'how it works', 'sources'] },
  { href: '/privacy/', label: 'Privacy page', keys: ['privacy', 'privacy policy', 'disclaimer', 'cookies', 'cookie policy'] },
  { href: '/terms/', label: 'Terms of use', keys: ['terms', 'terms of use', 'terms of service', 'terms and conditions', 'tos'] },
  { href: '/contact/', label: 'Contact page', keys: ['contact', 'contact us', 'email', 'feedback'] },
  { href: '/', label: 'homepage', keys: ['home', 'homepage', 'start'] },
];
