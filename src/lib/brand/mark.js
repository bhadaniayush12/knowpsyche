// The psi mark: ψ in paper on an ink rounded square. This is the only drawing of it in the project:
// Logo.astro (header), scripts/og.mjs (share cards) and scripts/icons.mjs (favicons, app icons) all read it.
// The house fonts have no Greek glyphs, so the ψ is drawn as strokes on a 36×36 grid (the header's 36px tile).
// Plain JS so the Node build scripts can import it without a compile step.

export const INK = '#242238';
export const PAPER = '#F4F0E7';

/** Grid size and corner radius of the tile. */
export const MARK_SIZE = 36;
export const MARK_RADIUS = 11;

/** Stem with its two serifs, and the bowl (the two arms joined at the bottom). */
export const PSI_STEM = 'M18 7.5v21M15.5 7.5h5M15 28.5h6';
export const PSI_BOWL = 'M9.5 11.5c1.2-1.4 2.2-.8 2.2 1.2 0 6.2 2.4 9 6.3 9s6.3-2.8 6.3-9c0-2 1-2.6 2.2-1.2';

/** Stroke widths. `bold` is for tiny sizes (16–48px favicons), where the regular strokes go faint. */
export const PSI_WEIGHTS = {
  regular: { stem: 2.4, bowl: 1.8 },
  bold: { stem: 3.3, bowl: 2.6 },
};

/**
 * The mark as an SVG string.
 * @param {{ weight?: 'regular' | 'bold', bleed?: boolean, scale?: number }} [opts]
 *   `bleed`: square ink background with no rounded corners (apple-touch and maskable icons).
 *   `scale`: shrink the ψ around the centre, e.g. to sit inside a maskable icon's safe zone.
 */
export const markSvg = ({ weight = 'regular', bleed = false, scale = 1 } = {}) => {
  const w = PSI_WEIGHTS[weight];
  const c = MARK_SIZE / 2;
  const transform = scale === 1 ? '' : ` transform="translate(${c} ${c}) scale(${scale}) translate(${-c} ${-c})"`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MARK_SIZE} ${MARK_SIZE}">` +
    `<rect width="${MARK_SIZE}" height="${MARK_SIZE}"${bleed ? '' : ` rx="${MARK_RADIUS}"`} fill="${INK}"/>` +
    `<g fill="none" stroke="${PAPER}" stroke-linecap="round"${transform}>` +
    `<path stroke-width="${w.stem}" d="${PSI_STEM}"/><path stroke-width="${w.bowl}" d="${PSI_BOWL}"/></g></svg>`
  );
};
