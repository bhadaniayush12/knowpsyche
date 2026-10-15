import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { describe, expect, it } from 'vitest';

// Google Analytics 4 (Task G2): page views only, only on knowpsyche.com, and no test data ever.
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
  it('the only gtag( calls in src are the init and the config call, both in BaseLayout', () => {
    const calls = sources.flatMap((f) =>
      [...f.text.matchAll(/\bgtag\s*\(.*$/gm)].map((m) => ({ path: f.path, call: m[0].trim() })),
    );
    // gtag('js', new Date()) is part of Google's standard snippet: it only starts the tag and carries a timestamp.
    expect(calls).toEqual([
      { path: 'src/layouts/BaseLayout.astro', call: "gtag('js', new Date());" },
      { path: 'src/layouts/BaseLayout.astro', call: CONFIG_CALL },
    ]);
  });

  it('nothing else talks to Google tags: no dataLayer pushes, gtag set or event calls outside the loader', () => {
    for (const f of sources) {
      if (f.path === 'src/layouts/BaseLayout.astro') continue;
      expect(f.text, f.path).not.toMatch(/dataLayer|googletagmanager|google-analytics|\bgtag\b|\bga\s*\(/);
    }
    expect(layout.match(/dataLayer\.push/g)).toHaveLength(1); // inside the gtag function only
    expect(layout.match(/\bgtag\b/g)).toHaveLength(4); // the function, js, config, and the gtag/js script URL
  });

  it('no custom events, user properties, consent mode, ads or Tag Manager code', () => {
    expect(layout).not.toMatch(/'event'|"event"|user_properties|user_id|'set'|'consent'|GTM-|gtm\.js|AW-|send_page_view|page_title|page_location/);
  });

  it('no network calls anywhere in src, so answers, scores and saved results have no way out', () => {
    for (const f of sources) {
      expect(f.text, f.path).not.toMatch(/\bfetch\s*\(|sendBeacon|XMLHttpRequest|new WebSocket|EventSource/);
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
    r.timers.shift()!.fn();
    r.idles[0]();
    expect(r.appended).toHaveLength(0);
    expect(r.win.dataLayer).toBeUndefined();
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
