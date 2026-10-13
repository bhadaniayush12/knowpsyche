// Reads the Learn articles (src/content/learn/*.md) for the Node build scripts (og.mjs, check-links.mjs).
// No YAML dependency: only top-level scalar fields are parsed (title, category, relatedTest, draft…).
// The full schema check is Astro's job (src/content.config.ts); this only needs the simple fields.
import { readdirSync, readFileSync } from 'node:fs';

const DIR = new URL('../../src/content/learn/', import.meta.url);

const unquote = (v) => {
  v = v.trim();
  if (v.startsWith('"') && v.endsWith('"')) return JSON.parse(v);
  if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1).replace(/''/g, "'");
  return v;
};

/** Every article: { id, file, data: { title, category, relatedTest?, draft, … }, frontmatter, body }. */
export const readArticles = () =>
  readdirSync(DIR)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((file) => {
      const raw = readFileSync(new URL(file, DIR), 'utf8');
      const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
      const frontmatter = m ? m[1] : '';
      const data = {};
      for (const line of frontmatter.split(/\r?\n/)) {
        const kv = line.match(/^([A-Za-z]\w*):\s*(\S.*)$/);
        if (kv) data[kv[1]] = unquote(kv[2]);
      }
      data.draft = data.draft === 'true';
      return { id: file.replace(/\.md$/, ''), file, data, frontmatter, body: m ? m[2] : raw };
    });

/** Published articles only (what gets a page). */
export const publishedArticles = () => readArticles().filter((a) => !a.data.draft);
