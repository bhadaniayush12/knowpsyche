/**
 * Opt-in saved results, kept only in this browser's localStorage under one key.
 *
 * Only what the result screen already shows is stored:
 * - test id
 * - date (ISO day: YYYY-MM-DD)
 * - band badge
 * - headline
 * - data (Enneagram: nine type scores; EQ: four area scores; others: the main number, or null if none)
 * - an optional name, once for the whole report
 *
 * Never individual answers, never per-try timings. Nothing is written until someone presses Save,
 * and nothing here makes a network request. Every storage call is wrapped in try/catch: if storage
 * is blocked, the opt-in stays hidden and the page works as before. Retaking a test overwrites its entry.
 */

export const STORAGE_KEY = 'knowpsyche_saved_results';

export const TEST_IDS = [
  'reaction-time',
  'enneagram',
  'photographic-memory',
  'number-memory',
  'attention-span',
  'stroop',
  'emotional-intelligence',
] as const;

export type TestId = (typeof TEST_IDS)[number];

export type SavedData = number | null | Record<string, number>;

export interface SavedTestResult {
  testId: TestId;
  date: string; // ISO day "YYYY-MM-DD"
  badge: string;
  headline: string;
  data: SavedData;
}

export interface SavedReport {
  version: 1;
  name?: string;
  results: Partial<Record<TestId, SavedTestResult>>;
}

const isTestId = (v: unknown): v is TestId => typeof v === 'string' && (TEST_IDS as readonly string[]).includes(v);

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

const isSavedData = (v: unknown): v is SavedData =>
  v === null || isFiniteNumber(v) || (isPlainObject(v) && Object.values(v).every(isFiniteNumber));

/** Keeps only the allowed fields, so nothing extra can ride along. Null if the entry is not valid. */
function clean(entry: unknown): SavedTestResult | null {
  if (!isPlainObject(entry)) return null;
  const { testId, date, badge, headline, data } = entry;
  if (!isTestId(testId) || typeof date !== 'string' || typeof badge !== 'string' || typeof headline !== 'string' || !isSavedData(data)) {
    return null;
  }
  return { testId, date, badge, headline, data: isPlainObject(data) ? { ...data } : data };
}

/** This browser's localStorage, or null when it is missing or blocked (reading it can throw). */
export function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
    if (typeof localStorage !== 'undefined' && localStorage) return localStorage;
  } catch {
    return null;
  }
  return null;
}

/**
 * True when localStorage can be read. This only reads, so nothing is written before someone opts in.
 * If a later write still fails (quota, strict privacy modes), `saveResult` returns false and the
 * opt-in hides itself.
 */
export function isStorageAvailable(): boolean {
  try {
    const storage = getStorage();
    if (!storage) return false;
    storage.getItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

/** The person's local day as an ISO day, e.g. "2026-10-14". Local, not UTC, so it matches their calendar. */
export function getIsoDay(d = new Date()): string {
  try {
    if (Number.isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  } catch {
    return '';
  }
}

/** The saved report. Null if nothing is saved, storage is blocked, or the stored JSON is not valid. */
export function readReport(): SavedReport | null {
  try {
    const raw = getStorage()?.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isPlainObject(parsed) || !isPlainObject(parsed.results)) return null;
    const results: SavedReport['results'] = {};
    for (const value of Object.values(parsed.results)) {
      const entry = clean(value);
      if (entry) results[entry.testId] = entry;
    }
    const report: SavedReport = { version: 1, results };
    if (typeof parsed.name === 'string' && parsed.name.trim()) report.name = parsed.name.trim();
    return report;
  } catch {
    return null;
  }
}

/** Fired on window after a save, clear or name change, so the progress trail can update. Carries no data. */
export const CHANGE_EVENT = 'kp:saved-change';

function notify() {
  try {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Nothing to tell.
  }
}

function write(report: SavedReport): boolean {
  const storage = getStorage();
  if (!storage) return false;
  storage.setItem(STORAGE_KEY, JSON.stringify(report));
  notify();
  return true;
}

/** Saves a result, replacing any earlier one for the same test. False if storage is blocked or the entry is not valid. */
export function saveResult(entry: SavedTestResult): boolean {
  try {
    const safe = clean(entry);
    if (!safe) return false;
    const report = readReport() ?? { version: 1, results: {} };
    report.results[safe.testId] = safe;
    return write(report);
  } catch {
    return false;
  }
}

/** The saved result for one test, or null. */
export function getSavedResult(testId: TestId): SavedTestResult | null {
  return readReport()?.results[testId] ?? null;
}

/** True when anything at all is saved (a result or a name), so "Clear saved results" has something to clear. */
export function hasSavedData(): boolean {
  const report = readReport();
  return Boolean(report && (Object.keys(report.results).length > 0 || report.name));
}

/** Removes everything this feature saved. */
export function clearResults(): boolean {
  try {
    const storage = getStorage();
    if (!storage) return false;
    storage.removeItem(STORAGE_KEY);
    notify();
    return true;
  } catch {
    return false;
  }
}

/** Sets the optional name shown on the report. An empty name removes it. */
export function setName(name: string): boolean {
  try {
    const report = readReport() ?? { version: 1, results: {} };
    const trimmed = name.trim();
    if (trimmed) report.name = trimmed;
    else delete report.name;
    return write(report);
  } catch {
    return false;
  }
}

/** The optional name, or null. */
export function getName(): string | null {
  return readReport()?.name ?? null;
}

export interface SaveOptInHandle {
  show(result: Omit<SavedTestResult, 'date'>): void;
  reset(): void;
}

const sameResult = (a: Omit<SavedTestResult, 'date'>, b: Omit<SavedTestResult, 'date'>) =>
  a.badge === b.badge && a.headline === b.headline && JSON.stringify(a.data) === JSON.stringify(b.data);

/** Copy for the save box (SaveResult.astro). Drafted, except `savedText` and `openReport` (given by Dev, G1). */
export const saveCopy = {
  intro: 'Save this result on this device to build your report. It stays in your browser. We never receive it.',
  savedText: 'Saved on this device. We never receive it.',
  openReport: 'Open your report',
  save: 'Save result',
  update: 'Update saved result',
  previous: 'A previous result is saved on this device. Save to overwrite it.',
  cleared: 'Saved results cleared from this device.',
};

export interface SaveBoxView {
  /** This exact result is saved: the box shows the saved line and the "Open your report" link instead of Save. */
  saved: boolean;
  text: string;
  buttonLabel: string;
  status: string;
}

/** What the save box shows, given what is saved for this test and the result on screen. Pure. */
export function saveBoxView(existing: Omit<SavedTestResult, 'date'> | null, current: Omit<SavedTestResult, 'date'>): SaveBoxView {
  if (existing && sameResult(existing, current)) return { saved: true, text: saveCopy.savedText, buttonLabel: saveCopy.save, status: '' };
  if (existing) return { saved: false, text: saveCopy.intro, buttonLabel: saveCopy.update, status: saveCopy.previous };
  return { saved: false, text: saveCopy.intro, buttonLabel: saveCopy.save, status: '' };
}

/**
 * Wires the opt-in on a result page (see SaveResult.astro). Nothing is saved until the Save button is pressed.
 * If storage is blocked, the box stays hidden; if a save or clear fails later, it hides itself.
 */
export function initSaveOptIn(container: HTMLElement | null): SaveOptInHandle {
  const off: SaveOptInHandle = { show() {}, reset() {} };
  if (!container) return off;
  if (!isStorageAvailable()) {
    container.hidden = true;
    return off;
  }

  const saveBtn = container.querySelector<HTMLButtonElement>('[data-save-btn]');
  const clearBtn = container.querySelector<HTMLButtonElement>('[data-clear-btn]');
  const statusEl = container.querySelector<HTMLElement>('[data-save-status]');
  const reportLink = container.querySelector<HTMLElement>('[data-report-link]');
  const textEl = container.querySelector<HTMLElement>('[data-save-text]');
  let current: Omit<SavedTestResult, 'date'> | null = null;
  let broken = false;

  const status = (text: string) => {
    if (statusEl) statusEl.textContent = text;
  };

  const giveUp = () => {
    broken = true;
    container.hidden = true;
  };

  const render = () => {
    if (clearBtn) clearBtn.hidden = !hasSavedData();
    if (!saveBtn || !current) return;
    const view = saveBoxView(getSavedResult(current.testId), current);
    // Once this result is saved, the Save button gives way to the link to the report.
    saveBtn.hidden = view.saved;
    saveBtn.textContent = view.buttonLabel;
    saveBtn.setAttribute('aria-pressed', String(view.saved));
    if (reportLink) reportLink.hidden = !view.saved;
    if (textEl && textEl.textContent !== view.text) textEl.textContent = view.text;
    status(view.status);
  };

  saveBtn?.addEventListener('click', () => {
    if (!current) return;
    if (!saveResult({ ...current, date: getIsoDay() })) return giveUp();
    render();
    // The Save button is gone now; keep focus in the box, on the next step.
    reportLink?.focus();
  });

  clearBtn?.addEventListener('click', () => {
    if (!clearResults()) return giveUp();
    render();
    status(saveCopy.cleared);
    saveBtn?.focus();
  });

  return {
    show(res) {
      if (broken) return;
      current = res;
      container.hidden = false;
      render();
    },
    reset() {
      current = null;
      container.hidden = true;
      status('');
    },
  };
}
