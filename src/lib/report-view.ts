// Fills the /report/ sheets from saved results (C1). Browser only. Every saved string goes in as text,
// never as HTML. Nothing is sent anywhere.
import { reactionBands, result as reactionCopy } from '../data/tests/reaction-time';
import { numberBands, result as numberCopy } from '../data/tests/number-memory';
import { photoBands, result as photoCopy } from '../data/tests/photographic-memory';
import { attentionBands, result as attentionCopy } from '../data/tests/attention-span';
import { happening as stroopHappening, stroopBands, result as stroopCopy } from '../data/tests/stroop';
import { types as enneagramTypes_, result as enneagramCopy } from '../data/tests/enneagram';
import { areas, bands as eqBands } from '../data/tests/emotional-intelligence';
import { reportSheet, scoreUnit, standout, tryThis } from '../data/report';
import { bandFor, enneagramTypes, fitSize, formatDay, nameParts } from './report';
import type { SavedTestResult, TestId } from './saved-results';

type Band = { badge: string; text: string };

const single: Partial<Record<TestId, { bands: readonly Band[]; change: string }>> = {
  'reaction-time': { bands: reactionBands, change: reactionCopy.change },
  'number-memory': { bands: numberBands, change: numberCopy.change },
  'photographic-memory': { bands: photoBands, change: photoCopy.change },
  'attention-span': { bands: attentionBands, change: attentionCopy.change },
  // The result page's line is a fragment under its own heading; on the sheet it needs to read as a sentence,
  // so this is the full line from the Stroop page's "What's happening in this test?", word for word.
  stroop: { bands: stroopBands, change: `What can change your result: ${stroopHappening.change}` },
};

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

/** A labelled bar row: name, track with fill, value. `max` is the top of the scale. */
function barRow(label: string, value: number, max: number, valueText: string, main = false) {
  const row = el('li', `rp-bar${main ? ' rp-bar-main' : ''}`);
  const head = el('div', 'rp-bar-head');
  head.append(el('span', 'rp-bar-name', label), el('span', 'rp-bar-val', valueText));
  const track = el('div', 'rp-track');
  const fill = el('div', 'rp-fill');
  fill.style.width = `${Math.max(2, Math.min(100, (value / max) * 100))}%`;
  track.append(fill);
  row.append(head, track);
  return row;
}

function visualFor(id: TestId, r: SavedTestResult): HTMLElement {
  const box = el('div', 'rp-visual');
  if (id === 'enneagram' && r.data && typeof r.data === 'object') {
    const scores = r.data;
    const main = new Set(enneagramTypes(r.badge, scores).types);
    const list = el('ul', 'rp-bars rp-bars-9');
    for (const t of enneagramTypes_) {
      const v = scores[String(t.n)] ?? 0;
      list.append(barRow(`Type ${t.n} · ${t.name.replace(/^The /, '')}`, v, 25, `${v}/25`, main.has(t.n)));
    }
    box.append(list);
    return box;
  }
  if (id === 'emotional-intelligence' && r.data && typeof r.data === 'object') {
    const scores = r.data;
    const list = el('ul', 'rp-bars');
    for (const a of areas) {
      const v = scores[a.id];
      if (typeof v !== 'number') continue;
      list.append(barRow(a.name, v, 100, `${v} · ${bandFor(v, eqBands).badge}`));
    }
    box.append(list);
    return box;
  }
  // Single number + the bands for this test, the one you landed in filled.
  const unit = scoreUnit[id] ?? {};
  const num = el('div', 'rp-num');
  if (unit.before) num.append(el('span', 'rp-unit', unit.before));
  num.append(el('span', 'rp-num-v', typeof r.data === 'number' ? String(r.data) : reportSheet.notMeasured));
  if (unit.after && typeof r.data === 'number') num.append(el('span', 'rp-unit', unit.after));
  const chips = el('ul', 'rp-chips');
  for (const b of single[id]?.bands ?? []) {
    const c = el('li', `rp-chip${b.badge === r.badge ? ' rp-chip-on' : ''}`, b.badge);
    chips.append(c);
  }
  box.append(num, chips);
  return box;
}

/** "What it means" lines for a saved result. Empty when the result page has nothing to repeat here. */
export function meaningFor(id: TestId, r: SavedTestResult): string[] {
  const s = single[id];
  if (s) {
    const band = s.bands.find((b) => b.badge === r.badge);
    const first = id === 'stroop' && r.data === null ? stroopCopy.notMeasured : band?.text;
    return [first, s.change].filter((x): x is string => Boolean(x));
  }
  if (id === 'enneagram') {
    const e = enneagramTypes(r.badge, r.data && typeof r.data === 'object' ? r.data : null);
    if (e.kind === 'even') return [enneagramCopy.evenMeaning, enneagramCopy.change];
    const lines = e.types.map((n) => enneagramTypes_.find((t) => t.n === n)).filter(Boolean).map((t) => `Type ${t!.n}, ${t!.name}: ${t!.drive}`);
    return [...lines, enneagramCopy.change];
  }
  // EQ: the band texts describe one area each, and the result page has no paragraph for the overall
  // badge, so there is nothing right to say here and the box is hidden.
  return [];
}

/**
 * "What stood out" and "One thing to try" for a saved result, or null when there is nothing right to say:
 * every test except the Enneagram needs a badge that is one of its current bands (a renamed band, an
 * unmeasured Stroop run or hand-edited data gets null). The Enneagram copy is only ever used for the Enneagram.
 */
export function boxCopy(r: SavedTestResult): { standout: string; tip: string } | null {
  const id = r.testId;
  if (id === 'enneagram') {
    // The main type's own tip, or the "even" tip.
    const e = enneagramTypes(r.badge, r.data && typeof r.data === 'object' ? r.data : null);
    const tip = e.kind === 'even' ? enneagramCopy.evenTip : (enneagramTypes_.find((t) => t.n === e.types[0])?.tip ?? enneagramCopy.evenTip);
    return standout.enneagram.all ? { standout: standout.enneagram.all, tip } : null;
  }
  const bands: readonly { badge: string }[] = single[id]?.bands ?? (id === 'emotional-intelligence' ? eqBands : []);
  if (!r.badge || !bands.some((b) => b.badge === r.badge)) return null;
  const s = standout[id].byBand?.[r.badge];
  const tip = tryThis[id].byBand?.[r.badge];
  return s && tip ? { standout: s, tip } : null;
}

/** Fills the two boxes, or hides their row completely when there is no copy for this result. No DOM building. */
export function fillBoxes(sheet: Pick<HTMLElement, 'querySelector'>, r: SavedTestResult) {
  const row = sheet.querySelector<HTMLElement>('.rp-two');
  const s = sheet.querySelector<HTMLElement>('[data-f="standout"]');
  const t = sheet.querySelector<HTMLElement>('[data-f="try"]');
  const copy = boxCopy(r);
  if (row) row.hidden = !copy;
  if (s) s.textContent = copy?.standout ?? '';
  if (t) t.textContent = copy?.tip ?? '';
}

/** Fills one test sheet. */
export function fillSheet(sheet: HTMLElement, r: SavedTestResult) {
  const id = r.testId;
  const f = (k: string) => sheet.querySelector<HTMLElement>(`[data-f="${k}"]`)!;
  f('date').textContent = reportSheet.savedOn(formatDay(r.date));
  f('headline').textContent = r.headline;
  f('badge').textContent = r.badge;
  f('badge').hidden = !r.badge;
  f('visual').replaceChildren(visualFor(id, r));
  fillBoxes(sheet, r);
  const means = meaningFor(id, r);
  f('means').replaceChildren(...means.map((t) => el('p', '', t)));
  const meansBox = sheet.querySelector<HTMLElement>('.rp-means');
  if (meansBox) meansBox.hidden = means.length === 0;
}

/** Writes the cover title and fits it: as big as possible, at most two lines, never wider than the cover. */
export function fillCover(cover: HTMLElement, name: string | null) {
  const title = cover.querySelector<HTMLElement>('[data-f="name"]')!;
  const parts = nameParts(name, { lead: reportSheet.noNameLead, accent: reportSheet.noNameAccent });
  title.replaceChildren(document.createTextNode(parts.lead), ...(parts.accent ? [el('span', 'rp-accent', parts.accent)] : []));
  cover.toggleAttribute('data-named', parts.named);
  fitName(title);
}

export function fitName(title: HTMLElement) {
  title.classList.remove('rp-break');
  const width = title.clientWidth;
  if (!width) return;
  const { size, fits } = fitSize(
    (s) => {
      title.style.setProperty('--fs', `${s}cqw`);
      const lh = parseFloat(getComputedStyle(title).lineHeight) || 1;
      return { lines: Math.round(title.scrollHeight / lh), overflow: title.scrollWidth > width + 1 };
    },
    { max: 15, min: 5, step: 0.25, maxLines: 2 },
  );
  title.style.setProperty('--fs', `${size}cqw`);
  // A single very long word that won't fit even at the smallest size is allowed to break.
  if (!fits) title.classList.add('rp-break');
}
