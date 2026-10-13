// Builds the Open Graph images (1200×630 PNG) into public/og/<slug>.png. Runs before every build (`prebuild`).
// satori lays out the card and turns the text into paths using the self-hosted @fontsource .woff files, then
// sharp rasterises the SVG. House style: paper background, ink text, the psi mark, one accent per test.
// The cards name the page only: no scores, no claims.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import satori from 'satori';
import sharp from 'sharp';

const root = new URL('../', import.meta.url);
const OUT = new URL('public/og/', root);
const font = (pkg, file) => readFileSync(new URL(`node_modules/@fontsource/${pkg}/files/${file}`, root));

const fonts = [
  { name: 'Space Grotesk', data: font('space-grotesk', 'space-grotesk-latin-600-normal.woff'), weight: 600, style: 'normal' },
  { name: 'Instrument Serif', data: font('instrument-serif', 'instrument-serif-latin-400-normal.woff'), weight: 400, style: 'normal' },
  { name: 'DM Mono', data: font('dm-mono', 'dm-mono-latin-400-normal.woff'), weight: 400, style: 'normal' },
];

// Tokens from src/styles/global.css.
const C = {
  ink: '#242238',
  paper: '#F4F0E7',
  muted: '#5b5670',
  line: '#E1DACB',
  blue: '#4E61CB',
  yellow: '#EDCA69',
  violet: '#9678BE',
  ochre: '#B07A2A',
  tealDark: '#3f7a70',
  red: '#C9584B',
  coral: '#D87568',
};

// Eyebrows match each page's (src/data/tests/*.ts), minus the duration.
const cards = [
  { slug: 'site', eyebrow: 'Psychology tests', title: 'Psychology tests, explained', accent: C.blue },
  { slug: 'tests', eyebrow: 'Tests', title: 'All 7 psychology tests', accent: C.blue },
  { slug: 'about', eyebrow: 'About', title: 'About KnowPsyche', accent: C.blue },
  { slug: 'reaction-time-test', eyebrow: 'Test / 01 · Attention', title: 'Reaction time test', accent: C.yellow },
  { slug: 'enneagram-test', eyebrow: 'Test / 02 · Personality', title: 'Enneagram test', accent: C.violet },
  { slug: 'photographic-memory-test', eyebrow: 'Test / 03 · Memory', title: 'Photographic memory test', accent: C.ochre },
  { slug: 'number-memory-test', eyebrow: 'Test / 04 · Memory', title: 'Number memory test', accent: C.tealDark },
  { slug: 'attention-span-test', eyebrow: 'Test / 05 · Attention', title: 'Attention span test', accent: C.blue },
  { slug: 'stroop-test', eyebrow: 'Test / 06 · Focus', title: 'Stroop test', accent: C.red },
  { slug: 'emotional-intelligence-test', eyebrow: 'Test / 07 · Emotions', title: 'Emotional intelligence test', accent: C.coral },
];

// The header mark: ψ in paper on an ink rounded square (Header.astro). The house fonts have no Greek glyphs,
// so the ψ is drawn as strokes.
const psi = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><rect width="36" height="36" rx="11" fill="${C.ink}"/>` +
    `<g fill="none" stroke="${C.paper}" stroke-linecap="round"><path stroke-width="2.4" d="M18 7.5v21M15.5 7.5h5M15 28.5h6"/>` +
    `<path stroke-width="1.8" d="M9.5 11.5c1.2-1.4 2.2-.8 2.2 1.2 0 6.2 2.4 9 6.3 9s6.3-2.8 6.3-9c0-2 1-2.6 2.2-1.2"/></g></svg>`,
).toString('base64')}`;

const h = (type, style, ...children) => ({ type, props: { style: { display: 'flex', ...style }, children } });

const card = ({ eyebrow, title, accent }) => {
  // Last word in the serif, like the page H1s.
  const cut = title.lastIndexOf(' ');
  const lead = title.slice(0, cut + 1);
  const last = title.slice(cut + 1);
  const serif = { fontFamily: 'Instrument Serif', fontWeight: 400, letterSpacing: '-0.02em' };
  return h(
    'div',
    { position: 'relative', width: 1200, height: 630, background: C.paper, color: C.ink, fontFamily: 'Space Grotesk' },
    // satori adds padding outside width/height, so the content sits in an inset layer instead.
    h(
      'div',
      { position: 'absolute', top: 64, left: 72, right: 72, bottom: 112, flexDirection: 'column', justifyContent: 'space-between' },
      h(
        'div',
        { alignItems: 'center', gap: 18 },
        { type: 'img', props: { src: psi, width: 64, height: 64 } },
        h('div', { fontSize: 40, fontWeight: 600, letterSpacing: '-0.04em' }, 'know', h('span', { ...serif, fontSize: 46, color: C.blue }, 'psyche')),
        h('div', { marginLeft: 'auto', fontFamily: 'DM Mono', fontSize: 28, color: C.muted }, 'knowpsyche.com'),
      ),
      h(
        'div',
        { flexDirection: 'column', gap: 20 },
        h('div', { fontFamily: 'DM Mono', fontSize: 28, color: C.muted }, eyebrow),
        h(
          'div',
          { flexWrap: 'wrap', alignItems: 'baseline', fontSize: 100, lineHeight: 1.02, letterSpacing: '-0.05em' },
          lead && h('span', { whiteSpace: 'pre' }, lead),
          h('span', { ...serif, fontSize: 114 }, last),
        ),
      ),
    ),
    h('div', { position: 'absolute', left: 0, right: 0, bottom: 0, height: 44, background: accent, borderTop: `3px solid ${C.ink}` }),
  );
};

mkdirSync(OUT, { recursive: true });
for (const c of cards) {
  const svg = await satori(card(c), { width: 1200, height: 630, fonts });
  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
  writeFileSync(new URL(`${c.slug}.png`, OUT), png);
}
console.log(`og: ${cards.length} images in public/og/`);
