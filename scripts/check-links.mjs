// Checks the built site in dist/ (run `npm run build` first). No dependencies: plain regex over the HTML,
// which is fine for Astro's own output. Reports:
// - internal links and assets that don't resolve to a file in dist/ (and #fragments that don't exist)
// - <img> without an alt attribute
// - pages with zero or more than one <h1>
// - duplicate <title> and duplicate meta descriptions
// - missing canonical (noindex pages are skipped)
// - JSON-LD that isn't valid JSON
// - og:image and twitter:image missing, or the og:image not a 1200×630 PNG in dist/
// - robots.txt that doesn't allow all or doesn't point to the sitemap
// - a sitemap that doesn't list exactly the indexable pages (no 404, no noindex pages, no redirects)
// Exits 1 when anything is found.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const SITE = 'https://knowpsyche.com';

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

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');

const pages = new Map();
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const ids = new Set([...html.matchAll(/\sid\s*=\s*"([^"]+)"/g)].map((m) => m[1]));
  pages.set(file, { html, ids, url: urlPathOf(file) });
}

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

  // Title and description.
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  if (!title) report(url, 'missing <title>');
  else titles.set(title, [...(titles.get(title) ?? []), url]);

  const descTag = html.match(/<meta\b[^>]*name\s*=\s*"description"[^>]*>/i)?.[0];
  const desc = descTag && attr(descTag, 'content');
  if (!desc) report(url, 'missing meta description');
  else descriptions.set(desc, [...(descriptions.get(desc) ?? []), url]);

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
      const png = readFileSync(ogFile);
      const isPng = png.subarray(1, 4).toString() === 'PNG';
      const [w, h] = isPng ? [png.readUInt32BE(16), png.readUInt32BE(20)] : [];
      if (w !== 1200 || h !== 630) report(url, `og:image is not a 1200x630 PNG: ${og}`);
    }
  }
  if (!/<meta\b[^>]*name\s*=\s*"twitter:image"[^>]*content\s*=\s*"[^"]+"/i.test(html)) report(url, 'missing twitter:image');

  // JSON-LD.
  for (const m of html.matchAll(/<script\b[^>]*type\s*=\s*"application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(m[1]);
    } catch (e) {
      report(url, `invalid JSON-LD: ${e.message}`);
    }
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

for (const [title, urls] of titles) if (urls.length > 1) problems.push(`duplicate title "${title}": ${urls.join(', ')}`);
for (const [desc, urls] of descriptions) if (urls.length > 1) problems.push(`duplicate meta description "${desc}": ${urls.join(', ')}`);

if (problems.length) {
  console.error(`${problems.length} problem(s) in ${pages.size} pages:\n`);
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}
console.log(`check: ${pages.size} pages, no problems.`);
