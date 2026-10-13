// Builds the favicons and app icons into public/ from the one psi drawing (src/lib/brand/mark.js).
// Runs before every build (`prebuild`). Same input, same files: no dates, no metadata.
// - favicon.svg, favicon-32.png, favicon.ico (16, 32, 48): bold strokes so the ψ survives at 16px.
//   The ink tile reads on both light and dark browser tabs.
// - apple-touch-icon.png (180): full-bleed ink, no transparency; iOS rounds the corners itself.
// - icon-192.png, icon-512.png: the rounded tile, as in the header.
// - icon-512-maskable.png: full-bleed ink, ψ well inside the 80% safe-zone circle.
// favicon.ico holds PNG images (supported by every browser since IE Vista), written by hand: no extra dependency.
import { writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { INK, MARK_SIZE, markSvg } from '../src/lib/brand/mark.js';

const OUT = new URL('../public/', import.meta.url);

const png = async (svg, size, { opaque = false } = {}) => {
  // Rasterise at the target size directly (density scales the 36-unit viewBox), not by resizing a bitmap.
  let img = sharp(Buffer.from(svg), { density: (72 * size) / MARK_SIZE }).resize(size, size);
  if (opaque) img = img.flatten({ background: INK }).removeAlpha();
  return img.png({ compressionLevel: 9, palette: false }).toBuffer();
};

const ico = (images) => {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(size, e); // width (0 would mean 256)
    header.writeUInt8(size, e + 1); // height
    header.writeUInt8(0, e + 2); // palette colours
    header.writeUInt8(0, e + 3); // reserved
    header.writeUInt16LE(1, e + 4); // colour planes
    header.writeUInt16LE(32, e + 6); // bits per pixel
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((i) => i.data)]);
};

const bold = markSvg({ weight: 'bold' });
const write = (name, data) => writeFileSync(new URL(name, OUT), data);

write('favicon.svg', bold + '\n');
write('favicon-32.png', await png(bold, 32));
write('favicon.ico', ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(bold, size) })))));
write('apple-touch-icon.png', await png(markSvg({ bleed: true }), 180, { opaque: true }));
write('icon-192.png', await png(markSvg(), 192));
write('icon-512.png', await png(markSvg(), 512));
write('icon-512-maskable.png', await png(markSvg({ bleed: true, scale: 0.9 }), 512, { opaque: true }));
console.log('icons: favicon.svg, favicon.ico, 5 PNGs in public/');
