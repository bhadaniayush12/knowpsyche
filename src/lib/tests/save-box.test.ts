import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearResults, getIsoDay, initSaveOptIn, needsDayRefresh, saveBoxView, saveCopy, type SavedTestResult } from '../saved-results';

const current: Omit<SavedTestResult, 'date'> = { testId: 'number-memory', badge: 'Steady', headline: '7 digits held', data: 7 };

// Just enough of a DOM for initSaveOptIn: elements with hidden, text, attributes, click and focus.
class FakeEl {
  hidden = false;
  textContent = '';
  attrs: Record<string, string> = {};
  private handlers: (() => void)[] = [];
  setAttribute(k: string, v: string) { this.attrs[k] = v; }
  addEventListener(_type: string, fn: () => void) { this.handlers.push(fn); }
  click() { this.handlers.forEach((fn) => fn()); }
  focus(opts?: FocusOptions) { focused = this; focusOpts = opts; }
}
let focused: FakeEl | null = null;
let focusOpts: FocusOptions | undefined;

const makeBox = () => {
  const parts = {
    '[data-save-btn]': new FakeEl(),
    '[data-clear-btn]': new FakeEl(),
    '[data-save-status]': new FakeEl(),
    '[data-report-link]': new FakeEl(),
    '[data-save-text]': new FakeEl(),
  };
  parts['[data-report-link]'].hidden = true;
  parts['[data-save-text]'].textContent = saveCopy.intro;
  const container = Object.assign(new FakeEl(), { querySelector: (s: string) => parts[s as keyof typeof parts] ?? null });
  container.hidden = true;
  return { container, ...parts };
};

const memoryStorage = (): Storage => {
  const m = new Map<string, string>();
  return {
    get length() { return m.size; },
    clear: () => m.clear(),
    getItem: (k) => m.get(k) ?? null,
    key: (i) => [...m.keys()][i] ?? null,
    removeItem: (k) => void m.delete(k),
    setItem: (k, v) => void m.set(k, String(v)),
  };
};

// A window that keeps its listeners, so change and storage events reach the box.
type Listener = (e: { type: string; key?: string | null }) => void;
let listeners: Record<string, Listener[]> = {};
const fakeWindow = (storage: Storage) => {
  listeners = {};
  return {
    localStorage: storage,
    addEventListener: (type: string, fn: Listener) => void (listeners[type] ??= []).push(fn),
    dispatchEvent: (e: Event) => {
      (listeners[e.type] ?? []).forEach((fn) => fn(e));
      return true;
    },
  };
};
/** Another tab writing the same localStorage: the write happens, then only a storage event arrives here. */
const otherTab = (write: () => void, key: string | null = 'knowpsyche_saved_results') => {
  write();
  (listeners.storage ?? []).forEach((fn) => fn({ type: 'storage', key }));
};

describe('saveBoxView', () => {
  it('nothing saved: intro and Save', () => {
    expect(saveBoxView(null, current)).toEqual({ saved: false, text: saveCopy.intro, buttonLabel: 'Save result', status: '' });
  });
  it('this result saved: the saved line, report link instead of Save', () => {
    const v = saveBoxView({ ...current }, current);
    expect(v.saved).toBe(true);
    expect(v.text).toBe('Saved on this device. We never receive it.');
  });
  it('a different result saved: offers to update', () => {
    const v = saveBoxView({ ...current, data: 5, headline: '5 digits held' }, current);
    expect(v.saved).toBe(false);
    expect(v.buttonLabel).toBe('Update saved result');
  });
  it('copy has no em dashes', () => {
    for (const s of Object.values(saveCopy)) expect(s).not.toMatch(/—/);
  });
});

describe('needsDayRefresh (Q1-11)', () => {
  const saved = (over: Partial<SavedTestResult> = {}): SavedTestResult => ({ ...current, date: '2026-10-10', ...over });
  it('same result, later day: yes', () => expect(needsDayRefresh(saved(), current, '2026-10-14')).toBe(true));
  it('same result, same day: no', () => expect(needsDayRefresh(saved({ date: '2026-10-14' }), current, '2026-10-14')).toBe(false));
  it('same result, earlier day (clock moved back): no', () => expect(needsDayRefresh(saved({ date: '2026-10-20' }), current, '2026-10-14')).toBe(false));
  it('different result: no', () => expect(needsDayRefresh(saved({ data: 5 }), current, '2026-10-14')).toBe(false));
  it('nothing saved: no', () => expect(needsDayRefresh(null, current, '2026-10-14')).toBe(false));
  it('no usable day: no', () => expect(needsDayRefresh(saved(), current, '')).toBe(false));
});

describe('save box on a result page', () => {
  beforeEach(() => {
    const storage = memoryStorage();
    vi.stubGlobal('localStorage', storage);
    vi.stubGlobal('window', fakeWindow(storage));
    focused = null;
  });
  afterEach(() => vi.unstubAllGlobals());

  it('shows "Open your report" linking to /report/ after Save, and keeps Clear available', () => {
    const box = makeBox();
    const handle = initSaveOptIn(box.container as unknown as HTMLElement);
    handle.show(current);
    expect(box.container.hidden).toBe(false);
    expect(box['[data-report-link]'].hidden).toBe(true);
    expect(box['[data-save-btn]'].hidden).toBe(false);

    box['[data-save-btn]'].click();

    expect(box['[data-report-link]'].hidden).toBe(false);
    expect(box['[data-save-btn]'].hidden).toBe(true);
    expect(box['[data-save-text]'].textContent).toBe('Saved on this device. We never receive it.');
    expect(box['[data-clear-btn]'].hidden).toBe(false);
    expect(focused).toBe(box['[data-report-link]']);
  });

  it('Clear brings Save back and hides the link', () => {
    const box = makeBox();
    initSaveOptIn(box.container as unknown as HTMLElement).show(current);
    box['[data-save-btn]'].click();
    box['[data-clear-btn]'].click();
    expect(box['[data-report-link]'].hidden).toBe(true);
    expect(box['[data-save-btn]'].hidden).toBe(false);
    expect(box['[data-save-text]'].textContent).toBe(saveCopy.intro);
    expect(box['[data-save-status]'].textContent).toBe(saveCopy.cleared);
    expect(box['[data-clear-btn]'].hidden).toBe(true);
  });

  it('an unmeasured Stroop run gets no box, so no Save or Update button, and the measured result stays', () => {
    const measured = { testId: 'stroop' as const, badge: 'Mild pull', headline: 'Mild pull · 120 ms', data: 120 };
    const unmeasured = { testId: 'stroop' as const, badge: '', headline: "We couldn't measure this one. Try again.", data: null };
    const box = makeBox();
    const handle = initSaveOptIn(box.container as unknown as HTMLElement);
    handle.show(measured);
    box['[data-save-btn]'].click();
    const before = localStorage.getItem('knowpsyche_saved_results');

    handle.show(unmeasured);
    expect(box.container.hidden).toBe(true);
    // Even a click that slips through (a stale button) saves nothing.
    box['[data-save-btn]'].click();
    expect(localStorage.getItem('knowpsyche_saved_results')).toBe(before);
    expect(JSON.parse(before!).results.stroop.data).toBe(120);

    // A measured retake shows the box again.
    handle.show({ ...measured, data: 90, headline: 'Mild pull · 90 ms' });
    expect(box.container.hidden).toBe(false);
    expect(box['[data-save-btn]'].textContent).toBe('Update saved result');
  });

  it('an unmeasured Stroop run with nothing saved also gets no box', () => {
    const box = makeBox();
    initSaveOptIn(box.container as unknown as HTMLElement).show({ testId: 'stroop', badge: '', headline: 'x', data: null });
    expect(box.container.hidden).toBe(true);
    expect(localStorage.getItem('knowpsyche_saved_results')).toBeNull();
  });

  it('stays hidden when storage is blocked', () => {
    vi.stubGlobal('window', {
      get localStorage(): Storage {
        throw new Error('blocked');
      },
    });
    vi.stubGlobal('localStorage', undefined);
    const box = makeBox();
    initSaveOptIn(box.container as unknown as HTMLElement).show(current);
    expect(box.container.hidden).toBe(true);
  });

  it('Clear in another tab brings back "Save result" (Q1-05)', () => {
    const box = makeBox();
    initSaveOptIn(box.container as unknown as HTMLElement).show(current);
    box['[data-save-btn]'].click();
    expect(box['[data-save-btn]'].hidden).toBe(true);

    otherTab(() => localStorage.removeItem('knowpsyche_saved_results'));

    expect(box['[data-save-btn]'].hidden).toBe(false);
    expect(box['[data-save-btn]'].textContent).toBe(saveCopy.save);
    expect(box['[data-report-link]'].hidden).toBe(true);
    expect(box['[data-save-text]'].textContent).toBe(saveCopy.intro);
    expect(box['[data-clear-btn]'].hidden).toBe(true);
  });

  it('a clear of all storage in another tab (key null) also re-renders, other keys do not (Q1-05)', () => {
    const box = makeBox();
    initSaveOptIn(box.container as unknown as HTMLElement).show(current);
    box['[data-save-btn]'].click();
    otherTab(() => localStorage.setItem('something-else', '1'), 'something-else');
    expect(box['[data-save-btn]'].hidden).toBe(true);
    otherTab(() => localStorage.clear(), null);
    expect(box['[data-save-btn]'].hidden).toBe(false);
  });

  it('a clear somewhere else on this page (change event) brings back "Save result" (Q1-05)', () => {
    const box = makeBox();
    initSaveOptIn(box.container as unknown as HTMLElement).show(current);
    box['[data-save-btn]'].click();
    clearResults();
    expect(box['[data-save-btn]'].hidden).toBe(false);
    expect(box['[data-report-link]'].hidden).toBe(true);
  });

  it('a save that fails keeps the box and the Save button, and says why in the status line (Q1-06)', () => {
    const storage = memoryStorage();
    storage.setItem = () => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    };
    vi.stubGlobal('localStorage', storage);
    vi.stubGlobal('window', fakeWindow(storage));
    const box = makeBox();
    initSaveOptIn(box.container as unknown as HTMLElement).show(current);
    box['[data-save-btn]'].click();
    expect(box.container.hidden).toBe(false);
    expect(box['[data-save-btn]'].hidden).toBe(false);
    expect(box['[data-save-btn]'].textContent).toBe(saveCopy.save);
    expect(box['[data-report-link]'].hidden).toBe(true);
    expect(box['[data-save-status]'].textContent).toBe("Couldn't save on this device. Your browser may be blocking storage.");
    expect(storage.getItem('knowpsyche_saved_results')).toBeNull();
  });

  it('the same result shown on a later day updates the stored day silently and shows "Saved" (Q1-11)', () => {
    localStorage.setItem('knowpsyche_saved_results', JSON.stringify({ version: 1, results: { 'number-memory': { ...current, date: '2020-01-01' } } }));
    const box = makeBox();
    initSaveOptIn(box.container as unknown as HTMLElement).show(current);
    const stored = JSON.parse(localStorage.getItem('knowpsyche_saved_results')!);
    expect(stored.results['number-memory'].date).toBe(getIsoDay());
    expect(box['[data-save-btn]'].hidden).toBe(true);
    expect(box['[data-report-link]'].hidden).toBe(false);
    expect(box['[data-save-text]'].textContent).toBe(saveCopy.savedText);
    expect(box['[data-save-status]'].textContent).toBe('');
  });

  it('a different result on a later day is not written until Save (Q1-11)', () => {
    const before = JSON.stringify({ version: 1, results: { 'number-memory': { ...current, data: 5, headline: '5 digits held', date: '2020-01-01' } } });
    localStorage.setItem('knowpsyche_saved_results', before);
    initSaveOptIn(makeBox().container as unknown as HTMLElement).show(current);
    expect(localStorage.getItem('knowpsyche_saved_results')).toBe(before);
  });

  it('after Save, "Open your report" gets focus with the ring forced visible (Q1-14)', () => {
    const box = makeBox();
    initSaveOptIn(box.container as unknown as HTMLElement).show(current);
    box['[data-save-btn]'].click();
    expect(focused).toBe(box['[data-report-link]']);
    expect(focusOpts).toEqual({ focusVisible: true });
  });
});
