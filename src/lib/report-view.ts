// Fills the /report/ sheets from saved results (C1). Browser only. Every saved string goes in as text,
// never as HTML. Nothing is sent anywhere.
import { reactionBands, result as reactionCopy } from '../data/tests/reaction-time';
import { numberBands, result as numberCopy } from '../data/tests/number-memory';
import { photoBands, result as photoCopy } from '../data/tests/photographic-memory';
import { attentionBands, result as attentionCopy } from '../data/tests/attention-span';
import { stroopBands, result as stroopCopy } from '../data/tests/stroop';
import { types as enneagramTypes_, result as enneagramCopy } from '../data/tests/enneagram';
import { areas, bands as eqBands, result as eqCopy } from '../data/tests/emotional-intelligence';
import { reportSheet, scoreUnit, standout, tryThis } from '../data/report';
import { bandFor, enneagramTypes, fitSize, formatDay, lowestOf, nameParts } from './report';
import type { SavedTestResult, TestId } from './saved-results';

type Band = { badge: string; text: string };

const single: Partial<Record<TestId, { bands: readonly Band[]; change: string; tip: string }>> = {
  'reaction-time': { bands: reactionBands, change: reactionCopy.change, tip: reactionCopy.morningNight },
  'number-memory': { bands: numberBands, change: numberCopy.change, tip: numberCopy.tip },
  'photographic-memory': { bands: photoBands, change: photoCopy.change, tip: photoCopy.tip },
  'attention-span': { bands: attentionBands, change: attentionCopy.change, tip: attentionCopy.tip },
  stroop: { bands: stroopBands, change: stroopCopy.change, tip: stroopCopy.tip },
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

function meaningFor(id: TestId, r: SavedTestResult): string[] {
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
  const overall = eqBands.find((b) => b.badge === r.badge);
  return [overall?.text, eqCopy.closing].filter((x): x is string => Boolean(x));
}

function tipFor(id: TestId, r: SavedTestResult): string {
  const own = tryThis[id].byBand?.[r.badge];
  if (own) return own;
  const s = single[id];
  if (s) return s.tip;
  if (id === 'enneagram') {
    const e = enneagramTypes(r.badge, r.data && typeof r.data === 'object' ? r.data : null);
    if (e.kind === 'even') return enneagramCopy.evenTip;
    return enneagramTypes_.find((t) => t.n === e.types[0])?.tip ?? enneagramCopy.evenTip;
  }
  const low = r.data && typeof r.data === 'object' ? lowestOf(r.data, areas.map((a) => a.id)) : null;
  return areas.find((a) => a.id === low)?.tip ?? areas[0].tip;
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
  f('standout').textContent = standout[id].byBand?.[r.badge] ?? standout[id].all;
  f('try').textContent = tipFor(id, r);
  f('means').replaceChildren(...meaningFor(id, r).map((t) => el('p', '', t)));
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
