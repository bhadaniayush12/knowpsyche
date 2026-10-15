// Checks the built site in dist/ (run `npm run build` first). No dependencies: plain regex over the HTML,
// which is fine for Astro's own output. Reports:
// - internal links and assets that don't resolve to a file in dist/ (and #fragments that don't exist)
// - <img> without an alt attribute
// - pages with zero or more than one <h1>, and headings that skip a level going down (h2 → h4)
// - <svg> without aria-hidden="true", role="img" or a non-empty aria-label
// - duplicate <title> and duplicate meta descriptions
// - a <title> over 60 characters or a meta description over 155 (Google cuts longer ones)
// - missing canonical (noindex pages are skipped)
// - JSON-LD that isn't valid JSON
// - og:image and twitter:image missing, or the og:image not a 1200×630 PNG in dist/
// - icon files missing from dist/ or the wrong size, pages without the icon links, a manifest that isn't valid JSON
// - robots.txt that doesn't allow all or doesn't point to the sitemap
// - a sitemap that doesn't list exactly the indexable pages (no 404, no noindex pages, no redirects)
// - Learn articles: page + Article JSON-LD + own og:image, relatedTest page exists, ≥ 2 internal links in
//   the body, no page for drafts, and banned wording (MBTI, "top X%", percentile, "better than",
//   "brain age", unlock, subconscious, diagnos… except "not a diagnosis")
// Exits 1 when anything is found.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { readArticles } from './lib/articles.mjs';

const DIST = new URL('../dist/', import.meta.url).pathname;
const SITE = 'https://knowpsyche.com';
const MAX_TITLE = 60;
const MAX_DESC = 155;

if (!existsSync(DIST)) {
  console.error('No dist/ folder. Run `npm run build` first.');
  process.exit(1);
}

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const htmlFiles = walk(DIST).filter((f) => f.endsWith('.html'));

/** dist file → the URL path it's served at. */
const urlPathOf = (file) => {
  const rel = '/' + relative(DIST, file).split(sep).join('/');
  return rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel;
};

/** URL path → dist file, or null. `/x/` → x/index.html. */
const fileFor = (path) => {
  const clean = decodeURIComponent(path);
  const candidates = clean.endsWith('/') ? [clean + 'index.html'] : [clean, clean + '/index.html', clean + '.html'];
  for (const c of candidates) {
    const f = join(DIST, c);
    if (existsSync(f) && statSync(f).isFile()) return f;
  }
  return null;
};

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return m ? (m[1] ?? m[2] ?? m[3]) : undefined;
};

const decode = (s) =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');

const pages = new Map();
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const ids = new Set([...html.matchAll(/\sid\s*=\s*"([^"]+)"/g)].map((m) => m[1]));
  pages.set(file, { html, ids, url: urlPathOf(file) });
}

/** Width and height from a PNG header, or null if it isn't a PNG. */
const pngSize = (buf) => (buf.subarray(1, 4).toString() === 'PNG' ? [buf.readUInt32BE(16), buf.readUInt32BE(20)] : null);

const problems = [];
const report = (page, msg) => problems.push(`${page}  ${msg}`);

const titles = new Map();
const descriptions = new Map();

for (const [file, { html, url }] of pages) {
  // Scripts and styles can contain "<a" or "<h1" in strings; leave them out of the tag scan.
  const body = html.replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<style\b[\s\S]*?<\/style>/gi, '');

  // Links and assets.
  for (const m of body.matchAll(/<(a|link|img|script|source|iframe)\b[^>]*>/gi)) {
    const tag = m[0];
    for (const name of ['href', 'src']) {
      let ref = attr(tag, name);
      if (ref === undefined) continue;
      ref = decode(ref.trim());
      if (/^(mailto:|tel:|javascript:|data:|blob:)/i.test(ref)) continue;
      if (/^https?:\/\//i.test(ref) || ref.startsWith('//')) {
        if (!ref.startsWith(SITE)) continue; // external
        ref = ref.slice(SITE.length) || '/';
      }
      if (ref === '') {
        report(url, `empty ${name} on <${m[1]}>`);
        continue;
      }
      if (ref === '#') {
        report(url, `placeholder link href="#"`);
        continue;
      }
      const [beforeHash, hash] = ref.split('#');
      const pathPart = beforeHash.split('?')[0];
      const resolved = pathPart === '' ? url : new URL(pathPart, SITE + url).pathname;
      const target = fileFor(resolved);
      if (!target) {
        report(url, `broken link: ${ref}`);
        continue;
      }
      if (hash && target.endsWith('.html') && !pages.get(target)?.ids.has(hash)) {
        report(url, `missing anchor: ${ref}`);
      }
    }
  }

  // Images.
  for (const m of body.matchAll(/<img\b[^>]*>/gi)) {
    if (attr(m[0], 'alt') === undefined) report(url, `image without alt: ${attr(m[0], 'src') ?? m[0]}`);
  }

  // One h1.
  const h1s = (body.match(/<h1\b/gi) ?? []).length;
  if (h1s !== 1) report(url, `${h1s} <h1> elements`);

  // Heading order: going down, each heading is at most one level below the one before (h2 → h3, not h2 → h4).
  let prevLevel = 0;
  for (const m of body.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)) {
    const level = Number(m[1]);
    if (level > prevLevel + 1) {
      const text = decode(m[2].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim().slice(0, 50);
      report(url, `heading skips a level: <h${level}> "${text}" after ${prevLevel ? `<h${prevLevel}>` : 'no heading'}`);
    }
    prevLevel = level;
  }

  // SVGs: hidden from screen readers, or named as an image.
  for (const m of body.matchAll(/<svg\b[^>]*>/gi)) {
    const tag = m[0];
    const ok = attr(tag, 'aria-hidden') === 'true' || attr(tag, 'role') === 'img' || (attr(tag, 'aria-label') ?? '').trim() !== '';
    if (!ok) report(url, `<svg> without aria-hidden="true", role="img" or aria-label: ${tag.slice(0, 80)}`);
  }

  // Title and description.
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  if (!title) report(url, 'missing <title>');
  else {
    titles.set(title, [...(titles.get(title) ?? []), url]);
    const n = decode(title).length;
    if (n > MAX_TITLE) report(url, `title is ${n} characters (max ${MAX_TITLE})`);
  }

  const descTag = html.match(/<meta\b[^>]*name\s*=\s*"description"[^>]*>/i)?.[0];
  const desc = descTag && attr(descTag, 'content');
  if (!desc) report(url, 'missing meta description');
  else {
    descriptions.set(desc, [...(descriptions.get(desc) ?? []), url]);
    const n = decode(desc).length;
    if (n > MAX_DESC) report(url, `meta description is ${n} characters (max ${MAX_DESC})`);
  }

  // Canonical, unless the page asks not to be indexed.
  const noindex = /<meta\b[^>]*name\s*=\s*"robots"[^>]*content\s*=\s*"[^"]*noindex/i.test(html);
  if (!noindex && !/<link\b[^>]*rel\s*=\s*"canonical"[^>]*href\s*=\s*"[^"]+"/i.test(html)) {
    report(url, 'missing canonical');
  }

  // Share image: og:image must be a 1200×630 PNG we ship. Width and height are read from the PNG header.
  const ogTag = html.match(/<meta\b[^>]*property\s*=\s*"og:image"[^>]*>/i)?.[0];
  const og = ogTag && attr(ogTag, 'content');
  if (!og) report(url, 'missing og:image');
  else {
    const ogFile = og.startsWith(SITE) ? fileFor(og.slice(SITE.length)) : null;
    if (!ogFile) report(url, `og:image not in dist: ${og}`);
    else {
      const [w, h] = pngSize(readFileSync(ogFile)) ?? [];
      if (w !== 1200 || h !== 630) report(url, `og:image is not a 1200x630 PNG: ${og}`);
    }
  }
  if (!/<meta\b[^>]*name\s*=\s*"twitter:image"[^>]*content\s*=\s*"[^"]+"/i.test(html)) report(url, 'missing twitter:image');

  // Icon links (scripts/icons.mjs makes the files).
  const headLinks = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);
  const hasLink = (rel, href, type) =>
    headLinks.some((t) => attr(t, 'rel') === rel && attr(t, 'href') === href && (!type || attr(t, 'type') === type));
  if (!hasLink('icon', '/favicon.svg', 'image/svg+xml')) report(url, 'missing <link rel="icon"> for /favicon.svg');
  if (!hasLink('icon', '/favicon-32.png', 'image/png')) report(url, 'missing <link rel="icon"> for /favicon-32.png');
  if (!hasLink('apple-touch-icon', '/apple-touch-icon.png')) report(url, 'missing <link rel="apple-touch-icon">');
  if (!hasLink('manifest', '/site.webmanifest')) report(url, 'missing <link rel="manifest">');

  // JSON-LD.
  for (const m of html.matchAll(/<script\b[^>]*type\s*=\s*"application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(m[1]);
    } catch (e) {
      report(url, `invalid JSON-LD: ${e.message}`);
    }
  }
}

// Icons: every file there, PNGs at their exact size, and a manifest that parses and points at real icons.
const ICONS = {
  'favicon.svg': null,
  'favicon.ico': null,
  'favicon-32.png': 32,
  'apple-touch-icon.png': 180,
  'icon-192.png': 192,
  'icon-512.png': 512,
  'icon-512-maskable.png': 512,
};
for (const [name, size] of Object.entries(ICONS)) {
  const f = join(DIST, name);
  if (!existsSync(f)) {
    problems.push(`${name} missing`);
    continue;
  }
  if (size) {
    const [w, h] = pngSize(readFileSync(f)) ?? [];
    if (w !== size || h !== size) problems.push(`${name} is not a ${size}x${size} PNG`);
  }
}
const manifestFile = join(DIST, 'site.webmanifest');
if (!existsSync(manifestFile)) problems.push('site.webmanifest missing');
else {
  try {
    const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
    if (!manifest.name || !manifest.short_name) problems.push('site.webmanifest: missing name or short_name');
    if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) problems.push('site.webmanifest: no icons');
    for (const icon of manifest.icons ?? []) {
      if (!icon.src || !fileFor(icon.src)) problems.push(`site.webmanifest: icon not in dist: ${icon.src}`);
    }
    if (!(manifest.icons ?? []).some((i) => i.purpose === 'maskable')) problems.push('site.webmanifest: no maskable icon');
  } catch (e) {
    problems.push(`site.webmanifest is not valid JSON: ${e.message}`);
  }
}

// robots.txt: allow everything and point to the sitemap index.
const robotsFile = join(DIST, 'robots.txt');
if (!existsSync(robotsFile)) problems.push('robots.txt missing');
else {
  const robots = readFileSync(robotsFile, 'utf8');
  if (!/^Allow:\s*\/\s*$/m.test(robots)) problems.push('robots.txt: no "Allow: /"');
  if (/^Disallow:\s*\S/m.test(robots)) problems.push('robots.txt: has a Disallow rule');
  if (!robots.split('\n').some((l) => l.trim() === `Sitemap: ${SITE}/sitemap-index.xml`)) {
    problems.push(`robots.txt: no "Sitemap: ${SITE}/sitemap-index.xml" line`);
  }
}

// Sitemap: exactly the indexable pages. Not the 404, not noindex pages, not redirect sources.
const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
const indexFile = join(DIST, 'sitemap-index.xml');
if (!existsSync(indexFile)) problems.push('sitemap-index.xml missing');
else {
  const listed = new Set();
  for (const sm of locs(readFileSync(indexFile, 'utf8'))) {
    const smFile = sm.startsWith(SITE) && join(DIST, sm.slice(SITE.length));
    if (!smFile || !existsSync(smFile)) {
      problems.push(`sitemap-index.xml lists a missing sitemap: ${sm}`);
      continue;
    }
    for (const loc of locs(readFileSync(smFile, 'utf8'))) listed.add(loc.startsWith(SITE) ? loc.slice(SITE.length) || '/' : loc);
  }
  const noindexPage = (html) => /<meta\b[^>]*name\s*=\s*"robots"[^>]*content\s*=\s*"[^"]*noindex/i.test(html);
  const indexable = new Set([...pages.values()].filter((p) => p.url !== '/404.html' && !noindexPage(p.html)).map((p) => p.url));
  for (const u of indexable) if (!listed.has(u)) problems.push(`sitemap: missing ${u}`);
  for (const u of listed) if (!indexable.has(u)) problems.push(`sitemap: lists ${u}, which is not an indexable page`);
  const redirectsFile = join(DIST, '_redirects');
  if (existsSync(redirectsFile)) {
    for (const line of readFileSync(redirectsFile, 'utf8').split('\n')) {
      const from = line.trim().split(/\s+/)[0];
      if (from && !from.startsWith('#') && listed.has(from)) problems.push(`sitemap: lists redirect source ${from}`);
    }
  }
  const notFound = pages.get(join(DIST, '404.html'));
  if (!notFound) problems.push('404.html missing');
  else if (!noindexPage(notFound.html)) problems.push('404.html is not noindex');
}

// Learn articles (src/content/learn/*.md). Published ones need a page with Article JSON-LD and their own
// share card, a test page for their relatedTest, and at least 2 links to other KnowPsyche pages in the body.
// Drafts must not have a page. The banned-word scan reads the article source (frontmatter + body).
const BANNED = [
  [/\bMBTI\b/i, 'MBTI'],
  [/\btop\s*\d+\s*%/i, '"top X%"'],
  [/percentile/i, 'percentile'],
  [/better than/i, '"better than"'],
  [/brain age/i, '"brain age"'],
  [/\bunlock/i, 'unlock'],
  [/subconscious/i, 'subconscious'],
  [/diagnos/i, 'diagnos… (only "not a diagnosis" is allowed)'],
];
if (!fileFor('/learn/')) problems.push('/learn/ hub missing');
for (const a of readArticles()) {
  const where = `src/content/learn/${a.file}`;
  const pageFile = join(DIST, 'learn', a.id, 'index.html');
  if (a.data.draft) {
    if (existsSync(pageFile)) problems.push(`${where}: draft article has a page in dist`);
    continue;
  }
  const page = pages.get(pageFile);
  if (!page) {
    problems.push(`${where}: no page at /learn/${a.id}/`);
    continue;
  }
  if (a.data.relatedTest && !fileFor(`/${a.data.relatedTest}/`)) problems.push(`${where}: relatedTest page /${a.data.relatedTest}/ doesn't exist`);

  const internal = [...a.body.matchAll(/\]\(\s*((?:https:\/\/knowpsyche\.com)?\/[^)\s]*)/g)].length;
  if (internal < 2) problems.push(`${where}: ${internal} internal link(s) in the body (min 2)`);

  const lds = [...page.html.matchAll(/<script\b[^>]*type\s*=\s*"application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].flatMap((m) => {
    try {
      return [JSON.parse(m[1])];
    } catch {
      return [];
    }
  });
  if (!lds.some((ld) => ld['@type'] === 'Article')) problems.push(`/learn/${a.id}/  missing Article JSON-LD`);
  const ogTag = page.html.match(/<meta\b[^>]*property\s*=\s*"og:image"[^>]*>/i)?.[0];
  if (ogTag && attr(ogTag, 'content') !== `${SITE}/og/learn-${a.id}.png`) problems.push(`/learn/${a.id}/  og:image is not /og/learn-${a.id}.png`);

  // Comment lines in the frontmatter (writing notes) aren't published, so they're left out of the scan.
  const text = a.frontmatter.split('\n').filter((l) => !/^\s*#/.test(l)).join('\n') + '\n' + a.body;
  for (const [re, label] of BANNED) {
    const scanned = label.startsWith('diagnos') ? text.replace(/not a diagnosis/gi, '') : text;
    const hit = scanned.match(new RegExp(`.{0,30}${re.source}.{0,30}`, re.flags));
    if (hit) problems.push(`${where}: banned wording ${label}: "…${hit[0].trim()}…"`);
  }
}

for (const [title, urls] of titles) if (urls.length > 1) problems.push(`duplicate title "${title}": ${urls.join(', ')}`);
for (const [desc, urls] of descriptions) if (urls.length > 1) problems.push(`duplicate meta description "${desc}": ${urls.join(', ')}`);

if (problems.length) {
  console.error(`${problems.length} problem(s) in ${pages.size} pages:\n`);
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}
console.log(`check: ${pages.size} pages, no problems.`);
