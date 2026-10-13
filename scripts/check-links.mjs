// Checks the built site in dist/ (run `npm run build` first). No dependencies: plain regex over the HTML,
// which is fine for Astro's own output. Reports:
// - internal links and assets that don't resolve to a file in dist/ (and #fragments that don't exist)
// - <img> without an alt attribute
// - pages with zero or more than one <h1>
// - duplicate <title> and duplicate meta descriptions
// - missing canonical (noindex pages are skipped)
// - JSON-LD that isn't valid JSON
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

  // JSON-LD.
  for (const m of html.matchAll(/<script\b[^>]*type\s*=\s*"application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(m[1]);
    } catch (e) {
      report(url, `invalid JSON-LD: ${e.message}`);
    }
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
