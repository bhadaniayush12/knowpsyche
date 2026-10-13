// Share card: drawn on <canvas> in the browser, shared with the Web Share API,
// downloaded as a PNG when sharing files isn't possible. Nothing is uploaded.

export interface ShareData {
  /** Small label above the number, e.g. "My reaction time". */
  label: string;
  /** The headline result, e.g. "247". */
  big: string;
  /** Unit after the number, e.g. "ms". Optional. */
  unit?: string;
  /** Badge or second line, e.g. "Quick". */
  badge: string;
  /** Closing line in serif, e.g. "Can you beat it?". */
  tagline: string;
  /** Top-right tag, e.g. "Test / 01". */
  tag: string;
  /** Text passed to the share sheet. */
  text: string;
  /** Link passed to the share sheet and copied by "Copy link". */
  url: string;
  /** PNG file name without extension. */
  filename: string;
}

export const CARD_W = 1080;
export const CARD_H = 1920;

const INK = '#242238';
const PAPER = '#F4F0E7';
const YELLOW = '#EDCA69';
const LILAC = '#E5DFEF';

const SANS = '"Space Grotesk", system-ui, sans-serif';
const SERIF = '"Instrument Serif", Georgia, serif';
const MONO = '"DM Mono", ui-monospace, monospace';

type Ctx = CanvasRenderingContext2D & { letterSpacing?: string };

function spaced(ctx: Ctx, px: number) {
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${px}px`;
}

async function loadFonts() {
  if (!document.fonts) return;
  await Promise.all([
    document.fonts.load(`600 100px ${SANS}`),
    document.fonts.load(`italic 400 100px ${SERIF}`),
    document.fonts.load(`400 30px ${MONO}`),
  ]).catch(() => undefined);
}

/** Largest font size (≤ max) at which `text` fits in `width`. */
function fit(ctx: Ctx, text: string, font: (px: number) => string, max: number, width: number) {
  let px = max;
  ctx.font = font(px);
  while (px > 40 && ctx.measureText(text).width > width) {
    px -= 8;
    ctx.font = font(px);
  }
  return px;
}

export async function drawShareCard(canvas: HTMLCanvasElement, d: ShareData) {
  await loadFonts();
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d') as Ctx | null;
  if (!ctx) return;

  ctx.fillStyle = LILAC;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // The card: ink, tilted 2°, yellow offset shadow (Result.dc.html).
  const w = 860;
  const h = 1300;
  ctx.save();
  ctx.translate(CARD_W / 2, CARD_H / 2);
  ctx.rotate((-2 * Math.PI) / 180);
  ctx.translate(-w / 2, -h / 2);
  ctx.fillStyle = YELLOW;
  ctx.fillRect(30, 30, w, h);
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, w, h);

  const pad = 72;
  ctx.textBaseline = 'alphabetic';

  // Wordmark + tag
  ctx.fillStyle = PAPER;
  spaced(ctx, -1.5);
  ctx.font = `600 54px ${SANS}`;
  ctx.fillText('know', pad, pad + 50);
  const kw = ctx.measureText('know').width;
  ctx.fillStyle = YELLOW;
  ctx.font = `italic 400 62px ${SERIF}`;
  spaced(ctx, 0);
  ctx.fillText('psyche', pad + kw, pad + 50);
  ctx.fillStyle = 'rgba(244,240,231,.7)';
  ctx.font = `400 26px ${MONO}`;
  spaced(ctx, 2.5);
  ctx.textAlign = 'right';
  ctx.fillText(d.tag.toUpperCase(), w - pad, pad + 44);
  ctx.textAlign = 'left';

  // Label
  const mid = 520;
  ctx.fillStyle = 'rgba(244,240,231,.8)';
  ctx.font = `400 32px ${MONO}`;
  ctx.fillText(d.label.toUpperCase(), pad, mid - 210);

  // Big number + unit
  ctx.fillStyle = PAPER;
  spaced(ctx, -14);
  const unitPx = 96;
  ctx.font = `600 ${unitPx}px ${SANS}`;
  const unitW = d.unit ? ctx.measureText(d.unit).width + 24 : 0;
  const bigPx = fit(ctx, d.big, (px) => `600 ${px}px ${SANS}`, 320, w - pad * 2 - unitW);
  ctx.font = `600 ${bigPx}px ${SANS}`;
  ctx.fillText(d.big, pad, mid + 40);
  const bw = ctx.measureText(d.big).width;
  if (d.unit) {
    spaced(ctx, -3);
    ctx.font = `600 ${unitPx}px ${SANS}`;
    ctx.fillText(d.unit, pad + bw + 24, mid + 40);
  }
  spaced(ctx, 0);

  // Pulse line
  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 7;
  ctx.lineJoin = 'round';
  const ly = mid + 150;
  const lw = w - pad * 2;
  ctx.beginPath();
  ctx.moveTo(pad, ly);
  ctx.lineTo(pad + lw * 0.42, ly);
  ctx.lineTo(pad + lw * 0.46, ly - 50);
  ctx.lineTo(pad + lw * 0.5, ly + 50);
  ctx.lineTo(pad + lw * 0.54, ly);
  ctx.lineTo(pad + lw, ly);
  ctx.stroke();

  // Badge
  spaced(ctx, -2);
  ctx.font = `600 ${fit(ctx, d.badge, (px) => `600 ${px}px ${SANS}`, 64, w - pad * 2)}px ${SANS}`;
  ctx.fillStyle = PAPER;
  ctx.fillText(d.badge, pad, mid + 320);
  spaced(ctx, 0);

  // Tagline + site
  ctx.fillStyle = PAPER;
  ctx.font = `italic 400 ${fit(ctx, d.tagline, (px) => `italic 400 ${px}px ${SERIF}`, 96, w - pad * 2)}px ${SERIF}`;
  ctx.fillText(d.tagline, pad, h - pad - 70);
  ctx.fillStyle = 'rgba(244,240,231,.7)';
  ctx.font = `400 28px ${MONO}`;
  spaced(ctx, 2.5);
  ctx.fillText('KNOWPSYCHE.COM', pad, h - pad);
  spaced(ctx, 0);
  ctx.restore();
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

function download(blob: Blob, filename: string) {
  const a = document.createElement('a');
  const href = URL.createObjectURL(blob);
  a.href = href;
  a.download = `${filename}.png`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}

const isAbort = (e: unknown) => e instanceof DOMException && e.name === 'AbortError';

/**
 * Binds the ShareCard component (`[data-share]`) once and redraws it for each new result.
 * The PNG is made ahead of time so the share sheet opens straight from the click.
 */
export function createShareCard(root: HTMLElement | null) {
  if (!root) return { update: async (_d: ShareData) => {} };
  const canvas = root.querySelector<HTMLCanvasElement>('canvas')!;
  const status = root.querySelector<HTMLElement>('[data-share-status]')!;
  let data: ShareData | null = null;
  let blob: Promise<Blob | null> = Promise.resolve(null);

  const say = (msg: string) => {
    status.textContent = msg;
  };

  root.querySelector('[data-share-action="share"]')?.addEventListener('click', async () => {
    if (!data) return;
    const png = await blob;
    const file = png ? new File([png], `${data.filename}.png`, { type: 'image/png' }) : null;
    try {
      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: data.text, url: data.url });
        say('Shared.');
        return;
      }
      if (navigator.share) {
        await navigator.share({ text: data.text, url: data.url });
        say('Shared.');
        return;
      }
    } catch (e) {
      if (isAbort(e)) return;
    }
    if (png) {
      download(png, data.filename);
      say('Sharing isn’t available here, so the image was downloaded instead.');
    }
  });

  root.querySelector('[data-share-action="download"]')?.addEventListener('click', async () => {
    if (!data) return;
    const png = await blob;
    if (png) {
      download(png, data.filename);
      say('Image downloaded.');
    }
  });

  root.querySelector('[data-share-action="copy"]')?.addEventListener('click', async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.url);
      say('Link copied.');
    } catch {
      say(`Copy this link: ${data.url}`);
    }
  });

  return {
    async update(d: ShareData) {
      data = d;
      say('');
      await drawShareCard(canvas, d);
      blob = toBlob(canvas);
    },
  };
}
