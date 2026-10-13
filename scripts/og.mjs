// Builds the Open Graph images (1200×630 PNG) into public/og/<slug>.png. Runs before every build (`prebuild`).
// satori lays out the card and turns the text into paths using the self-hosted @fontsource .woff files, then
// sharp rasterises the SVG. Same input, same PNG: no dates, no randomness.
// House style: paper background, ink text, the psi mark. The accent colour is only in the motif and the bottom bar.
// The cards name the page only: no scores, no claims.
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import satori from 'satori';
import sharp from 'sharp';
import { markSvg } from '../src/lib/brand/mark.js';
import { publishedArticles } from './lib/articles.mjs';

const root = new URL('../', import.meta.url);
const OUT = new URL('public/og/', root);
const font = (pkg, file) => readFileSync(new URL(`node_modules/@fontsource/${pkg}/files/${file}`, root));

const fonts = [
  { name: 'Space Grotesk', data: font('space-grotesk', 'space-grotesk-latin-600-normal.woff'), weight: 600, style: 'normal' },
  { name: 'Instrument Serif', data: font('instrument-serif', 'instrument-serif-latin-400-italic.woff'), weight: 400, style: 'italic' },
  { name: 'DM Mono', data: font('dm-mono', 'dm-mono-latin-400-normal.woff'), weight: 400, style: 'normal' },
];

// Tokens from src/styles/global.css.
const C = {
  ink: '#242238',
  inkSoft: '#3d3952',
  paper: '#F4F0E7',
  blue: '#4E61CB',
  yellow: '#EDCA69',
  violet: '#9678BE',
  violetInk: '#7550A6',
  teal: '#3f8f82',
  tealDeep: '#2f6f63',
  mintGo: '#8FD0C2',
  coral: '#D87568',
  red: '#C9584B',
};

const W = 1200;
const H = 630;
const PAD = 72;
const MOTIF = 400;
const MOTIF_RIGHT = 56;
const BAR = 8;
// Left column: everything left of the motif, with a 40px gap.
const COL = W - PAD - MOTIF - MOTIF_RIGHT - 40;
// Title size: as big as the longer of the two lines allows, up to TITLE_MAX.
const TITLE_MAX = 124;

const svgUri = (body, size) =>
  `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">${body}</svg>`).toString('base64')}`;

// The psi mark, from the one shared drawing (src/lib/brand/mark.js).
const psi = `data:image/svg+xml;base64,${Buffer.from(markSvg()).toString('base64')}`;

const h = (type, style, ...children) => ({ type, props: { style: { display: 'flex', ...style }, children } });
const img = (src, size) => ({ type: 'img', props: { src, width: size, height: size } });

// Motifs: one plain geometric drawing per test in a 400×400 box, in the test's accent colour.
const S = MOTIF;
const at = (r, deg) => [S / 2 + r * Math.sin((deg * Math.PI) / 180), S / 2 - r * Math.cos((deg * Math.PI) / 180)].map((v) => +v.toFixed(2));
const motifs = {
  // A large circle with a smaller one inside.
  reaction: (a) => svgUri(`<circle cx="200" cy="200" r="186" fill="none" stroke="${a}" stroke-width="14"/><circle cx="200" cy="200" r="96" fill="${a}"/>`, S),
  // Nine points on a circle (9 at the top), joined as the enneagram figure: 1-4-2-8-5-7-1 and 3-6-9.
  enneagram: (a) => {
    const p = (n) => at(176, (n % 9) * 40);
    const path = (ns) => 'M' + ns.map((n) => p(n).join(' ')).join('L');
    return svgUri(
      `<circle cx="200" cy="200" r="176" fill="none" stroke="${a}" stroke-width="5"/>` +
        `<path d="${path([1, 4, 2, 8, 5, 7, 1])}${path([3, 6, 9, 3])}" fill="none" stroke="${a}" stroke-width="5" stroke-linejoin="round"/>` +
        [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<circle cx="${p(n)[0]}" cy="${p(n)[1]}" r="20" fill="${a}"/>`).join(''),
      S,
    );
  },
  // A 3×3 grid of tiles, some filled.
  photographic: (a) =>
    svgUri(
      [1, 0, 0, 0, 1, 1, 0, 1, 0]
        .map((on, i) => {
          const x = (i % 3) * 144 + 3;
          const y = Math.floor(i / 3) * 144 + 3;
          return on ? `<rect x="${x - 3}" y="${y - 3}" width="112" height="112" rx="18" fill="${a}"/>` : `<rect x="${x}" y="${y}" width="106" height="106" rx="15" fill="none" stroke="${a}" stroke-width="6"/>`;
        })
        .join(''),
      S,
    ),
  // Concentric circles around a dot.
  attention: (a) => svgUri([186, 140, 94].map((r) => `<circle cx="200" cy="200" r="${r}" fill="none" stroke="${a}" stroke-width="8"/>`).join('') + `<circle cx="200" cy="200" r="40" fill="${a}"/>`, S),
  // Three overlapping rounded blocks in the Stroop ink colours (red, blue, yellow; stroop-test page),
  // stacked with a paper edge so each stays a clean colour.
  stroop: () =>
    svgUri(
      [[C.red, 6], [C.blue, 98], [C.yellow, 190]]
        .map(([c, o]) => `<rect x="${o}" y="${o}" width="204" height="204" rx="36" fill="${c}" stroke="${C.paper}" stroke-width="10"/>`)
        .join(''),
      S,
    ),
  // Two overlapping circles.
  emotional: (a) => svgUri([130, 270].map((cx) => `<circle cx="${cx}" cy="200" r="130" fill="${a}" fill-opacity=".7"/>`).join(''), S),
};

// Three outlined digits, stepped down so they read as digits rather than one number. "4 8 2" are the first
// digits of the number on the homepage test card (TestGlyph.astro).
const digits = (a) =>
  h(
    'div',
    { width: S, height: S, position: 'relative', fontFamily: 'Space Grotesk', fontSize: 220, lineHeight: 1, color: 'transparent', WebkitTextStroke: `7px ${a}` },
    ...['4', '8', '2'].map((d, i) => h('div', { position: 'absolute', left: 8 + i * 132, top: -10 + i * 100 }, d)),
  );

// Accents: no two tests share one. Text stays ink; the accent is only in the motif and the bottom bar.
// Eyebrows match each page's (src/data/tests/*.ts), minus the duration.
const cards = [
  { slug: 'site', eyebrow: 'Psychology tests', title: 'Psychology tests, explained', accent: C.ink },
  { slug: 'tests', eyebrow: 'Tests', title: 'All 7 psychology tests', accent: C.ink },
  { slug: 'about', eyebrow: 'KnowPsyche', title: 'About KnowPsyche', accent: C.ink },
  { slug: 'learn', eyebrow: 'Learn psychology', title: 'Learn psychology, in plain English', accent: C.ink },
  { slug: 'reaction-time-test', eyebrow: 'Test / 01 · Attention', title: 'Reaction time test', accent: C.yellow, motif: motifs.reaction },
  { slug: 'enneagram-test', eyebrow: 'Test / 02 · Personality', title: 'Enneagram test', accent: C.violet, motif: motifs.enneagram },
  { slug: 'photographic-memory-test', eyebrow: 'Test / 03 · Memory', title: 'Photographic memory test', accent: C.mintGo, motif: motifs.photographic },
  { slug: 'number-memory-test', eyebrow: 'Test / 04 · Memory', title: 'Number memory test', accent: C.teal, digits: true },
  { slug: 'attention-span-test', eyebrow: 'Test / 05 · Attention', title: 'Attention span test', accent: C.blue, motif: motifs.attention },
  { slug: 'stroop-test', eyebrow: 'Test / 06 · Focus', title: 'Stroop test', accent: C.coral, motif: motifs.stroop },
  { slug: 'emotional-intelligence-test', eyebrow: 'Test / 07 · Emotions', title: 'Emotional intelligence test', accent: C.violetInk, motif: motifs.emotional },
];

// Learn articles: one card each (learn-<slug>.png), titled by the article, in the accent and motif of its
// relatedTest. The pillar article (no relatedTest) gets the site style. The eyebrow names the category,
// with "Learn · " in front when that still fits on one line (about 26 mono characters at this size).
const EYEBROW_MAX = 26;
for (const a of publishedArticles()) {
  const test = cards.find((c) => c.slug === a.data.relatedTest);
  const withLearn = `Learn · ${a.data.category}`;
  cards.push({
    slug: `learn-${a.id}`,
    eyebrow: withLearn.length <= EYEBROW_MAX ? withLearn : a.data.category,
    title: a.data.title,
    accent: test?.accent ?? C.ink,
    motif: test?.motif,
    digits: test?.digits,
  });
}

// Title type, as on the page H1s: Space Grotesk 600, tight tracking, the last word in the italic serif.
// The serif is set at the same size: its x-height is already a touch taller than the sans, which makes up
// for its lighter strokes, and both sit on one baseline.
const titleLine = (words, serifLast, size) => {
  const sans = serifLast ? words.slice(0, -1) : words;
  return h(
    'div',
    { alignItems: 'baseline', fontSize: size, lineHeight: 1, letterSpacing: '-0.055em', whiteSpace: 'pre' },
    sans.length > 0 && h('span', {}, sans.join(' ') + (serifLast ? ' ' : '')),
    serifLast && h('span', { fontFamily: 'Instrument Serif', fontStyle: 'italic', fontWeight: 400, letterSpacing: '-0.01em' }, words.at(-1)),
  );
};

// Width of a title line in px: render it alone and trim the paper around the ink.
const measure = async (words, serifLast, size) => {
  const el = h('div', { width: 3000, height: 300, background: C.paper, color: C.ink, fontFamily: 'Space Grotesk' }, titleLine(words, serifLast, size));
  const svg = await satori(el, { width: 3000, height: 300, fonts });
  const { info } = await sharp(Buffer.from(svg)).flatten({ background: C.paper }).trim().toBuffer({ resolveWithObject: true });
  return info.width;
};

// Two lines: try every break and keep the one whose longer line is shortest, then size it to fit COL.
const layoutTitle = async (title) => {
  const words = title.split(' ');
  let best;
  for (let k = 1; k < words.length; k++) {
    const widest = Math.max(await measure(words.slice(0, k), false, 100), await measure(words.slice(k), true, 100));
    if (!best || widest < best.widest) best = { k, widest };
  }
  const size = Math.min(TITLE_MAX, Math.floor((100 * COL) / best.widest));
  return { lines: [words.slice(0, best.k), words.slice(best.k)], size };
};

const mono = { fontFamily: 'DM Mono', fontWeight: 400, color: C.inkSoft, textTransform: 'uppercase', letterSpacing: '0.04em' };

const card = ({ eyebrow, accent, motif, digits: showDigits }, { lines, size }) =>
  h(
    'div',
    { position: 'relative', width: W, height: H, background: C.paper, color: C.ink, fontFamily: 'Space Grotesk' },
    // Header. satori adds padding outside width/height, so content sits in absolutely placed layers.
    h(
      'div',
      { position: 'absolute', top: 48, left: PAD, right: PAD, alignItems: 'center', gap: 20 },
      img(psi, 76),
      h('div', { alignItems: 'baseline', fontSize: 48, fontWeight: 600, letterSpacing: '-0.03em' }, 'know', h('span', { fontFamily: 'Instrument Serif', fontStyle: 'italic', fontWeight: 400, fontSize: 54, color: C.blue }, 'psyche')),
      h('div', { ...mono, marginLeft: 'auto', fontSize: 34, textTransform: 'none', letterSpacing: '0' }, 'knowpsyche.com'),
    ),
    // Left column, centred between the header and the bar.
    h(
      'div',
      { position: 'absolute', top: 124, bottom: BAR, left: PAD, width: COL, flexDirection: 'column', justifyContent: 'center' },
      h('div', { ...mono, fontSize: 40, marginBottom: 26 }, eyebrow),
      h('div', { flexDirection: 'column', gap: Math.round(size * 0.04) }, titleLine(lines[0], false, size), titleLine(lines[1], true, size)),
      h('div', { ...mono, fontSize: 30, marginTop: 34 }, 'Free · Nothing stored'),
    ),
    // Motif, centred on the same band as the left column.
    h('div', { position: 'absolute', right: MOTIF_RIGHT, top: 124 + (H - 124 - BAR - MOTIF) / 2, width: MOTIF, height: MOTIF }, showDigits ? digits(accent) : img(motif ? motif(accent) : psi, MOTIF)),
    h('div', { position: 'absolute', left: 0, right: 0, bottom: 0, height: BAR, background: accent }),
  );

mkdirSync(OUT, { recursive: true });
// Article cards are rebuilt every time, so a deleted or drafted article leaves no card behind.
for (const f of readdirSync(OUT)) if (f.startsWith('learn-')) rmSync(new URL(f, OUT));
for (const c of cards) {
  const svg = await satori(card(c, await layoutTitle(c.title)), { width: W, height: H, fonts });
  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
  writeFileSync(new URL(`${c.slug}.png`, OUT), png);
}
console.log(`og: ${cards.length} images in public/og/`);
