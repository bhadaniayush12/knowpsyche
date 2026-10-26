import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QUESTION_COUNTS, endRun, isAllowedPayload, trackEvent } from '../analytics';

// Google Analytics 4: page views and three test events with fixed values, only on knowpsyche.com.
// These read the source, and run the BaseLayout loader in a small fake browser.

const root = fileURLToPath(new URL('../../../', import.meta.url));
const srcDir = join(root, 'src');
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const layout = read('src/layouts/BaseLayout.astro');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
const thisFile = fileURLToPath(import.meta.url);
const sources = walk(srcDir)
  .filter((p) => /\.(astro|ts|js|mjs|md|mdx)$/.test(p) && p !== thisFile)
  .map((p) => ({ path: relative(root, p), text: readFileSync(p, 'utf8') }));

const CONFIG_CALL = "gtag('config', gaId, { allow_google_signals: false, allow_ad_personalization_signals: false });";

describe('no test data goes to Google Analytics', () => {
  it('only the loader and the small event helper call gtag', () => {
    const calls = sources.flatMap((f) =>
      [...f.text.matchAll(/\bgtag\s*\(.*$/gm)].map((m) => ({ path: f.path, call: m[0].trim() })),
    );
    // gtag('js', new Date()) is part of Google's standard snippet: it only starts the tag and carries a timestamp.
    expect(calls).toEqual([
      { path: 'src/layouts/BaseLayout.astro', call: "gtag('js', new Date());" },
      { path: 'src/layouts/BaseLayout.astro', call: CONFIG_CALL },
      { path: 'src/lib/analytics.ts', call: "gtag('event', name, params);" },
    ]);
  });

  it('nothing else talks to Google tags outside the loader and event helper', () => {
    for (const f of sources) {
      if (f.path === 'src/layouts/BaseLayout.astro' || f.path === 'src/lib/analytics.ts') continue;
      expect(f.text, f.path).not.toMatch(/dataLayer|googletagmanager|google-analytics|\bgtag\b|\bga\s*\(/);
    }
    expect(layout.match(/dataLayer\.push/g)).toHaveLength(1); // inside the gtag function only
    expect(layout.match(/\bgtag\b/g)).toHaveLength(4); // the function, js, config, and the gtag/js script URL
  });

  it('no user properties, consent mode, ads or Tag Manager code', () => {
    expect(layout).not.toMatch(/user_properties|user_id|'set'|'consent'|GTM-|gtm\.js|AW-|send_page_view|page_title|page_location/);
  });

  it('no network calls anywhere in src, so answers, scores and saved results have no way out', () => {
    for (const f of sources) {
      expect(f.text, f.path).not.toMatch(/\bfetch\s*\(|sendBeacon|XMLHttpRequest|new WebSocket|EventSource/);
    }
  });
});

describe('test event contract', () => {
  const testPage = read('src/layouts/TestPage.astro');
  beforeEach(() => {
    endRun();
    vi.unstubAllGlobals();
  });

  const start = { test_name: 'enneagram', test_category: 'personality', language: 'en' };
  const complete = { ...start, question_count: 45 };
  const share = { test_name: 'enneagram', method: 'share' };

  it('sends only fixed test metadata and observes each visible completion', () => {
    expect(testPage).toContain("trackEvent('test_start', { test_name, test_category, language })");
    expect(testPage).toContain("trackEvent('test_complete', { test_name, test_category, language, question_count });");
    expect(testPage).toContain("trackEvent('result_share', { test_name, method });");
    expect(testPage).toContain("visible && !resultVisible");
    expect(testPage).toContain("resultVisible = visible");
    expect(testPage).toContain("share && resultVisible && result.contains(share)");
    expect(testPage).toContain("method === 'share' || method === 'download' || method === 'copy'");
    expect(testPage).toContain('data-question-count={QUESTION_COUNTS[testId]}');
  });

  it('only TestPage calls trackEvent, and only with the three events and their fixed fields', () => {
    const calls = sources.flatMap((f) =>
      [...f.text.matchAll(/\btrackEvent\((?!name)[^)]*\)/g)].map((m) => ({ path: f.path, call: m[0] })),
    );
    expect(calls).toEqual([
      { path: 'src/layouts/TestPage.astro', call: "trackEvent('test_start', { test_name, test_category, language })" },
      { path: 'src/layouts/TestPage.astro', call: "trackEvent('result_share', { test_name, method })" },
      { path: 'src/layouts/TestPage.astro', call: "trackEvent('test_complete', { test_name, test_category, language, question_count })" },
    ]);
  });

  it('TestPage sends test_start and ends runs only on the pages\' own run signals', () => {
    expect(testPage).toContain("document.addEventListener('kp:run-start', () => trackEvent('test_start', { test_name, test_category, language }));");
    expect(testPage).toContain("document.addEventListener('kp:run-end', endRun);");
    // No guessing from button class names: a page's own handler can start a new run before a bubbling click arrives.
    expect(testPage).not.toMatch(/-restart|start-practice|data-test-start\]|data-try-again/);
    const ui = read('src/lib/test-ui.ts');
    expect(ui).toContain("export function runStarted() {\n  document.dispatchEvent(new Event('kp:run-start'));\n}");
    expect(ui).toContain("export function runEnded() {\n  document.dispatchEvent(new Event('kp:run-end'));\n}");
  });

  // Where each test's run begins (however it was started: Start, Space, keys 1-5, a tap or a press)
  // and where a run is thrown away. `head` opens the block the call must sit in.
  const block = (page: string, head: string) => {
    const i = page.indexOf(head);
    expect(i, head).toBeGreaterThan(-1);
    return page.slice(i, page.indexOf('\n  }', i) + 4);
  };
  it.each([
    ['enneagram', 'const choose = (value: number) => {', /if \(answeredCount\(\) === 0\) runStarted\(\);\n\s*answers\[index\] = value;/],
    ['emotional-intelligence', 'const choose = (value: number) => {', /if \(answeredCount\(\) === 0\) runStarted\(\);\n\s*answers\[index\] = value;/],
    ['enneagram', "$('[data-test-start]').addEventListener('click', () => {", /if \(done\) reset\(\);\n\s*runStarted\(\);/],
    ['emotional-intelligence', "$('[data-test-start]').addEventListener('click', () => {", /if \(done\) reset\(\);\n\s*runStarted\(\);/],
    ['stroop', 'function startPractice() {', /\{\n\s*runStarted\(\);/],
    ['attention-span', 'function startPractice() {', /\{\n\s*runStarted\(\);/],
    ['reaction-time', 'const beginTry = () => {', /\{\n\s*if \(phase === 'idle'\) runStarted\(\);/],
    ['reaction-time', "$('[data-test-start]').addEventListener('click', () => {", /if \(phase === 'done'\) reset\(\);\n\s*if \(phase === 'idle'\) runStarted\(\);/],
    ['number-memory', 'const start = () => {', /\{\n\s*reset\(\);\n\s*runStarted\(\);/],
    ['photographic-memory', 'const start = () => {', /\{\n\s*reset\(\);\n\s*runStarted\(\);/],
  ] as const)('%s: a run begins with runStarted() in %s', (slug, head, re) => {
    expect(block(read(`src/pages/${slug}-test/index.astro`), head)).toMatch(re);
  });

  it.each([
    ['enneagram', 'const reset = () => {'],
    ['emotional-intelligence', 'const reset = () => {'],
    ['reaction-time', 'const reset = () => {'],
    ['number-memory', 'const reset = () => {'],
    ['photographic-memory', 'const reset = () => {'],
    ['stroop', 'function restartAll() {'],
    ['attention-span', 'function restartAll() {'],
  ] as const)('%s: %s throws the run away (runEnded) straight after clearing its timers', (slug, head) => {
    expect(block(read(`src/pages/${slug}-test/index.astro`), head)).toMatch(/\{\n[^\n]*\n\s*runEnded\(\);/);
  });

  it('the keys and presses that begin a run go through those functions', () => {
    const page = (slug: string) => read(`src/pages/${slug}-test/index.astro`);
    for (const slug of ['enneagram', 'emotional-intelligence']) {
      expect(page(slug), slug).toMatch(/keydown[\s\S]*v >= 1 && v <= 5\)[\s\S]{0,60}choose\(v\)/);
    }
    // Space (Stroop, Attention span) and a tap on the arena (Attention span) start practice.
    expect(page('stroop')).toContain("if (mode === 'idle') startPractice();");
    expect(page('attention-span')).toContain("if (mode === 'idle') startPractice();");
    expect(page('attention-span')).toMatch(/arena\.addEventListener\('click'[\s\S]{0,250}if \(mode === 'idle'\) \{\n\s*startPractice\(\);/);
    // Reaction time: a click, tap, Space or Enter on the box calls press(), which starts a try from idle.
    expect(page('reaction-time')).toMatch(/default:[\s\S]{0,200}startTry\(\);/);
    expect(page('reaction-time')).toMatch(/const startTry = \(\) => \{[\s\S]{0,120}beginTry\(\);/);
  });

  it('runStarted and runEnded only fire DOM events on this page, with no data', async () => {
    const events: Event[] = [];
    vi.stubGlobal('document', { dispatchEvent: (e: Event) => events.push(e) });
    const { runStarted, runEnded } = await import('../test-ui');
    runStarted();
    runEnded();
    expect(events.map((e) => [e.type, e.constructor.name, 'detail' in e])).toEqual([
      ['kp:run-start', 'Event', false],
      ['kp:run-end', 'Event', false],
    ]);
  });

  it('does nothing without gtag and never throws when gtag fails', () => {
    vi.stubGlobal('window', {});
    expect(() => trackEvent('test_start', start)).not.toThrow();
    endRun();
    vi.stubGlobal('window', { gtag: () => { throw new Error('blocked'); } });
    expect(() => trackEvent('test_start', start)).not.toThrow();
    vi.stubGlobal('window', { gtag: vi.fn(), kpTestRunning: () => { throw new Error('broken'); } });
    expect(() => trackEvent('test_complete', complete)).not.toThrow();
  });

  it('passes the exact event name and safe params to the existing gtag', () => {
    const gtag = vi.fn();
    vi.stubGlobal('window', { gtag });
    trackEvent('test_start', start);
    expect(gtag).toHaveBeenCalledExactlyOnceWith('event', 'test_start', start);
  });

  it('while a test is running, the only event that goes is that run\'s single test_start', () => {
    const gtag = vi.fn();
    let running = false;
    vi.stubGlobal('window', { gtag, kpTestRunning: () => running });
    trackEvent('test_start', start); // Start pressed
    running = true; // first stimulus or question
    trackEvent('test_start', start); // e.g. the first answer's kp:run-start
    trackEvent('test_complete', complete);
    trackEvent('result_share', share);
    expect(gtag.mock.calls).toEqual([['event', 'test_start', start]]);
    running = false; // result shows
    trackEvent('test_complete', complete);
    endRun();
    trackEvent('result_share', share);
    expect(gtag.mock.calls.map((c) => c[1])).toEqual(['test_start', 'test_complete', 'result_share']);
  });

  it('a run that begins already running (keys 1-5, no Start) still sends its one test_start', () => {
    const gtag = vi.fn();
    vi.stubGlobal('window', { gtag, kpTestRunning: () => true });
    trackEvent('test_start', start);
    trackEvent('test_start', start);
    expect(gtag).toHaveBeenCalledOnce();
  });

  it('test_start goes once per run: again only after the result shows or Restart (endRun)', () => {
    const gtag = vi.fn();
    vi.stubGlobal('window', { gtag });
    trackEvent('test_start', start);
    trackEvent('test_start', start);
    expect(gtag).toHaveBeenCalledOnce();
    endRun();
    trackEvent('test_start', start);
    expect(gtag).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['an answer', 'test_complete', { ...complete, answer: 3 }],
    ['a score', 'test_complete', { ...complete, score: 72 }],
    ['a band', 'test_complete', { ...complete, band: 'Quick' }],
    ['a timing', 'test_complete', { ...complete, ms: 243 }],
    ['a result type', 'result_share', { ...share, type: 4 }],
    ['a score instead of the question count', 'test_complete', { ...complete, question_count: 72 }],
    ['a headline as the test name', 'test_start', { ...start, test_name: 'Type 4: The Individualist' }],
    ['an unknown category', 'test_start', { ...start, test_category: 'Strong' }],
    ['another language', 'test_start', { ...start, language: 'Type 4' }],
    ['an unknown share method', 'result_share', { ...share, method: '243 ms' }],
    ['a missing field', 'test_complete', start],
    ['an unknown event', 'answer', start],
  ] as const)('drops a payload with %s', (_label, name, params) => {
    const gtag = vi.fn();
    vi.stubGlobal('window', { gtag });
    expect(isAllowedPayload(name, params)).toBe(false);
    trackEvent(name as 'test_start', params);
    expect(gtag).not.toHaveBeenCalled();
  });

  it('accepts every fixed payload the seven tests send', () => {
    for (const [test_name, question_count] of Object.entries(QUESTION_COUNTS)) {
      const test_category = test_name === 'enneagram' || test_name === 'emotional-intelligence' ? 'personality' : 'cognitive';
      expect(isAllowedPayload('test_start', { test_name, test_category, language: 'en' })).toBe(true);
      expect(isAllowedPayload('test_complete', { test_name, test_category, language: 'en', question_count })).toBe(true);
      for (const method of ['share', 'download', 'copy']) expect(isAllowedPayload('result_share', { test_name, method })).toBe(true);
    }
  });
});

describe('BaseLayout loader', () => {
  it('is output only when PUBLIC_GA_ID is set', () => {
    expect(layout).toContain("const gaId = (import.meta.env.PUBLIC_GA_ID ?? '').trim();");
    const block = layout.slice(layout.indexOf('{gaId && ('));
    expect(block.indexOf('{gaId && (')).toBe(0);
    expect(block.indexOf('<script is:inline define:vars={{ gaId }}>')).toBeGreaterThan(0);
  });

  it('the production build has the measurement ID', () => {
    expect(read('.env.production')).toMatch(/^PUBLIC_GA_ID=G-H9999QB11B$/m);
    expect(read('.gitignore')).not.toMatch(/^\.env\.production$/m);
  });

  it('tests tell the loader when they are running', () => {
    expect(read('src/lib/test-ui.ts')).toMatch(/export function guardLeave[^{]*\{\s*markRunning\(inProgress\);/);
    for (const slug of ['reaction-time', 'enneagram', 'photographic-memory', 'number-memory', 'attention-span', 'stroop', 'emotional-intelligence']) {
      expect(read(`src/pages/${slug}-test/index.astro`), slug).toMatch(/\b(guardLeave|markRunning)\(\(\) =>/);
    }
  });
});

// ---------- Run the real inline script in a fake browser ----------

const scriptBody = (() => {
  const open = '<script is:inline define:vars={{ gaId }}>';
  const start = layout.indexOf(open) + open.length;
  return layout.slice(start, layout.indexOf('</script>', start));
})();

function runLoader(hostname: string, opts: { readyState?: string; running?: () => boolean; idle?: boolean } = {}) {
  const appended: { src: string; async: boolean }[] = [];
  const listeners: Record<string, () => void> = {};
  const timers: { fn: () => void; ms: number }[] = [];
  const idles: (() => void)[] = [];
  const win: Record<string, unknown> = {
    gaId: 'G-TEST123',
    location: { hostname },
    document: {
      readyState: opts.readyState ?? 'interactive',
      createElement: () => ({ src: '', async: false }),
      head: { appendChild: (el: { src: string; async: boolean }) => appended.push(el) },
    },
    addEventListener: (type: string, fn: () => void) => (listeners[type] = fn),
    setTimeout: (fn: () => void, ms: number) => timers.push({ fn, ms }),
    kpTestRunning: opts.running,
  };
  if (opts.idle !== false) win.requestIdleCallback = (fn: () => void) => idles.push(fn);
  win.window = win;
  vm.runInNewContext(`(function(){ const gaId = window.gaId; ${scriptBody} })()`, vm.createContext(win));
  return { win, appended, listeners, timers, idles };
}

describe('loader behaviour', () => {
  it.each(['localhost', '127.0.0.1', 'knowpsyche.fix-the-speaker.workers.dev', 'knowpsyche.com.evil.example', 'staging.knowpsyche.com'])(
    'does nothing at all on %s, even after load',
    (host) => {
      const r = runLoader(host, { readyState: 'complete' });
      expect(r.listeners).toEqual({});
      expect(r.idles).toHaveLength(0);
      expect(r.timers).toHaveLength(0);
      expect(r.appended).toHaveLength(0);
      expect(r.win.dataLayer).toBeUndefined();
      expect(r.win.gtag).toBeUndefined();
    },
  );

  it.each(['knowpsyche.com', 'www.knowpsyche.com'])('on %s waits for load, then 3 s, then idle, then loads gtag.js once', (host) => {
    const r = runLoader(host);
    expect(r.appended).toHaveLength(0);
    expect(Object.keys(r.listeners)).toEqual(['load']);
    r.listeners.load();
    expect(r.timers.map((t) => t.ms)).toEqual([3000]);
    r.timers.shift()!.fn();
    expect(r.appended).toHaveLength(0);
    expect(r.idles).toHaveLength(1);
    r.idles[0]();
    expect(r.appended).toEqual([{ src: 'https://www.googletagmanager.com/gtag/js?id=G-TEST123', async: true }]);
    const dl = (r.win.dataLayer as IArguments[]).map((a) => Array.from(a));
    expect(dl).toHaveLength(2);
    expect(dl[0][0]).toBe('js');
    expect(dl[1]).toEqual(['config', 'G-TEST123', { allow_google_signals: false, allow_ad_personalization_signals: false }]);
  });

  it('loads straight after the 3 s when requestIdleCallback is missing (Safari)', () => {
    const r = runLoader('knowpsyche.com', { readyState: 'complete', idle: false });
    expect(r.timers.map((t) => t.ms)).toEqual([3000]);
    expect(r.appended).toHaveLength(0);
    r.timers.shift()!.fn();
    expect(r.appended).toHaveLength(1);
  });

  it('waits while a test is running and loads once it ends', () => {
    let running = true;
    const r = runLoader('knowpsyche.com', { readyState: 'complete', running: () => running });
    (r.win.gtag as (...args: unknown[]) => void)('event', 'test_start', {
      test_name: 'enneagram', test_category: 'personality', language: 'en',
    });
    expect((r.win.dataLayer as IArguments[]).map((a) => a[0])).toEqual(['js', 'config', 'event']);
    r.timers.shift()!.fn();
    r.idles[0]();
    expect(r.appended).toHaveLength(0);
    expect((r.win.dataLayer as IArguments[]).map((a) => a[0])).toEqual(['js', 'config', 'event']);
    expect(r.timers.map((t) => t.ms)).toEqual([2000]);
    r.timers.shift()!.fn(); // still running
    expect(r.appended).toHaveLength(0);
    running = false;
    r.timers.shift()!.fn();
    expect(r.appended).toHaveLength(1);
  });
});

describe('/privacy/ describes the GA4 setup', () => {
  const page = read('src/pages/privacy/index.astro');
  const section = page.slice(page.indexOf('<PolicySection id="analytics"'), page.indexOf('</PolicySection>', page.indexOf('<PolicySection id="analytics"')));

  it('has an Analytics section in the contents', () => {
    expect(page).toContain("{ id: 'analytics', label: 'Analytics' }");
    expect(section).toContain('title="Analytics"');
  });

  it.each([
    'We use Google Analytics 4 to count page views and how long a page stays open, so we can see which pages people visit and read.',
    'named <code>_ga</code> and <code>_ga_*</code>.',
    'Google Analytics also counts when a test is started, finished or shared. It never receives your answers or results.',
    'Google may see your approximate location and your device or browser type',
    'We never send your test answers, results, scores or the name you type in your report to Google Analytics',
    'Saved results stay on your device in local storage and are never sent.',
    'The Analytics data is kept for 2 months.',
    '<a href="https://tools.google.com/dlpage/gaoptout" rel="noopener">',
  ])('says: %s', (text) => expect(section).toContain(text));

  it('has no em dashes and no legal-advice claims', () => {
    expect(page).not.toContain('—');
    expect(page).not.toMatch(/legal advice|GDPR[- ]compliant|fully compliant/i);
  });
});
