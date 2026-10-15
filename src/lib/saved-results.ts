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

/** Longest badge or headline kept, and longest name (the same as the name input's maxlength). */
export const MAX_TEXT = 120;
export const MAX_NAME = 60;

/**
 * What each test's saved number (or numbers) may be. Plain data, so the head flag (TrailFlag.astro) checks
 * exactly the same rules without importing anything. `keys`: the data is an object with exactly these keys,
 * each a number in range; otherwise one number in range. `int`: whole numbers only. `nullable`: null allowed.
 */
export interface DataRule {
  min: number;
  max: number;
  int?: boolean;
  nullable?: boolean;
  keys?: readonly string[];
}
export const DATA_RULES: Record<TestId, DataRule> = {
  // Milliseconds.
  'reaction-time': { min: 0, max: 100000 },
  // Area ids from data/tests/emotional-intelligence.ts; each area score is 0 to 100.
  'emotional-intelligence': { min: 0, max: 100, int: true, keys: ['knowing', 'managing', 'reading', 'relationships'] },
  // Each type's sum of five 1 to 5 answers.
  enneagram: { min: 5, max: 25, int: true, keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] },
  // Level reached.
  'photographic-memory': { min: 0, max: 100000, int: true },
  // Digits held.
  'number-memory': { min: 0, max: 100000, int: true },
  // Score out of 100 (an average of two whole percentages, so it can end in .5).
  'attention-span': { min: 0, max: 100 },
  // Milliseconds; the effect can be negative (clashing words faster). Null only for an unmeasured run.
  stroop: { min: -100000, max: 100000, nullable: true },
};

const inRange = (v: unknown, rule: DataRule): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v >= rule.min && v <= rule.max && (!rule.int || Number.isInteger(v));

function isValidData(testId: TestId, v: unknown): v is SavedData {
  const rule = DATA_RULES[testId];
  if (v === null) return Boolean(rule.nullable);
  if (!rule.keys) return inRange(v, rule);
  if (!isPlainObject(v)) return false;
  const keys = Object.keys(v);
  return keys.length === rule.keys.length && rule.keys.every((k) => Object.prototype.hasOwnProperty.call(v, k) && inRange(v[k], rule));
}

/** A real calendar day written as YYYY-MM-DD. */
export function isIsoDay(v: unknown): v is string {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const [y, m, d] = v.split('-').map(Number);
  return m >= 1 && m <= 12 && d >= 1 && d <= new Date(Date.UTC(y, m, 0)).getUTCDate();
}

const isShortText = (v: unknown): v is string => typeof v === 'string' && v.length <= MAX_TEXT;

/**
 * Keeps only the allowed fields, so nothing extra can ride along. Null if the entry is not valid: an unknown
 * test, a day that isn't YYYY-MM-DD, a badge or headline over MAX_TEXT, or data outside DATA_RULES.
 * Anything that fails is dropped, never stored. TrailFlag.astro repeats these checks; keep them in step.
 */
function clean(entry: unknown): SavedTestResult | null {
  if (!isPlainObject(entry)) return null;
  const { testId, date, badge, headline, data } = entry;
  if (!isTestId(testId) || !isIsoDay(date) || !isShortText(badge) || !isShortText(headline) || !isValidData(testId, data)) {
    return null;
  }
  return { testId, date, badge, headline, data: isPlainObject(data) ? { ...data } : data };
}

/** The trimmed name if it can be kept (a non-empty string up to MAX_NAME), else null. */
function cleanName(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t && t.length <= MAX_NAME ? t : null;
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
 * opt-in says it couldn't save.
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
    const name = cleanName(parsed.name);
    if (name) report.name = name;
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

/**
 * Every write goes through here: the stored report is read again right before setItem, then changed, so a
 * save made in another tab since this page loaded is never written over.
 */
function update(change: (report: SavedReport) => void): boolean {
  const storage = getStorage();
  if (!storage) return false;
  const report = readReport() ?? { version: 1, results: {} };
  change(report);
  storage.setItem(STORAGE_KEY, JSON.stringify(report));
  notify();
  return true;
}

/**
 * Two tabs saving different tests in the same instant can still both read before either writes. For a short
 * while after a save, if another tab's write leaves this tab's result out, it is put back (merged with what is
 * there now). A clear from another tab always wins.
 */
const RACE_MS = 2000;
let justSaved: { entry: SavedTestResult; until: number } | null = null;
let watching = false;
function guardAgainstOtherTabs(entry: SavedTestResult) {
  justSaved = { entry, until: Date.now() + RACE_MS };
  if (watching) return;
  try {
    window.addEventListener('storage', (e: StorageEvent) => {
      if (e.key !== null && e.key !== STORAGE_KEY) return;
      const mine = justSaved;
      if (!mine || e.newValue === null || Date.now() > mine.until) {
        justSaved = null;
        return;
      }
      if (readReport()?.results[mine.entry.testId]) return;
      try {
        update((report) => void (report.results[mine.entry.testId] = mine.entry));
      } catch {
        // Nothing more to do; the other tab's result stays.
      }
    });
    watching = true;
  } catch {
    // No window events: nothing to guard.
  }
}

/**
 * True when a result has something to save. An unmeasured Stroop run has no effect number (data null),
 * so it is never saved and can never replace a measured one.
 */
export function isSaveable(entry: Pick<SavedTestResult, 'testId' | 'data'>): boolean {
  return !(entry.testId === 'stroop' && entry.data === null);
}

/**
 * Saves a result, replacing any earlier one for the same test. False if storage is blocked, the entry is
 * not valid, or it is not saveable (see isSaveable).
 */
export function saveResult(entry: SavedTestResult): boolean {
  try {
    const safe = clean(entry);
    if (!safe || !isSaveable(safe)) return false;
    if (!update((report) => void (report.results[safe.testId] = safe))) return false;
    guardAgainstOtherTabs(safe);
    return true;
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
    justSaved = null;
    notify();
    return true;
  } catch {
    return false;
  }
}

/** Sets the optional name shown on the report. An empty name removes it; one over MAX_NAME is not stored. */
export function setName(name: string): boolean {
  try {
    const trimmed = name.trim();
    if (trimmed.length > MAX_NAME) return false;
    return update((report) => {
      if (trimmed) report.name = trimmed;
      else delete report.name;
    });
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

/**
 * True when the result on screen is the one already saved, but saved on an earlier day. The person chose to
 * save this result before; only its day moves forward, so the report shows when it was last seen. Pure.
 */
export function needsDayRefresh(existing: SavedTestResult | null, current: Omit<SavedTestResult, 'date'>, today: string): boolean {
  return Boolean(existing && sameResult(existing, current) && isIsoDay(today) && existing.date < today);
}

/** Copy for the save box (SaveResult.astro). Drafted, except `savedText` and `openReport` (given by Dev, G1). */
export const saveCopy = {
  intro: 'Save this result on this device to build your report. It stays in your browser. We never receive it.',
  savedText: 'Saved on this device. We never receive it.',
  openReport: 'Open your report',
  save: 'Save result',
  update: 'Update saved result',
  previous: 'A previous result is saved on this device. Save to overwrite it.',
  cleared: 'Saved results cleared from this device.',
  // Given by Dev (Q1-06).
  saveFailed: "Couldn't save on this device. Your browser may be blocking storage.",
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
 * If storage is blocked, the box stays hidden. If a save fails later, the box stays and says so in its status
 * line; if a clear fails, it hides itself.
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
    // A failed write (quota, strict privacy modes) keeps the box and the Save button, and says why.
    if (!saveResult({ ...current, date: getIsoDay() })) return status(saveCopy.saveFailed);
    render();
    // The Save button is gone now; keep focus in the box, on the next step, with its focus ring showing
    // (focusVisible where supported; SaveResult.astro also styles :focus on this link for WebKit).
    reportLink?.focus({ focusVisible: true } as FocusOptions);
  });

  clearBtn?.addEventListener('click', () => {
    if (!clearResults()) return giveUp();
    render();
    status(saveCopy.cleared);
    saveBtn?.focus();
  });

  // Saved results can change under this box: Clear in another tab (storage event) or on this page (change
  // event). Re-render so the box always matches what is stored, e.g. back to "Save result" after a clear.
  const refresh = () => {
    if (!broken && current) render();
  };
  try {
    window.addEventListener(CHANGE_EVENT, refresh);
    window.addEventListener('storage', (e: StorageEvent) => {
      if (e.key === null || e.key === STORAGE_KEY) refresh();
    });
    // Back/Forward restored this page from the cache: results may have changed since.
    window.addEventListener('pageshow', (e: PageTransitionEvent) => {
      if (e.persisted) refresh();
    });
  } catch {
    // No window events: the box still works, it just won't follow other tabs.
  }

  return {
    show(res) {
      if (broken) return;
      // Nothing to save (an unmeasured Stroop run): no box at all, so there is no Save or Update button.
      if (!isSaveable(res)) {
        current = null;
        container.hidden = true;
        status('');
        return;
      }
      current = res;
      // The same result again on a later day: update the stored day quietly; the box shows "Saved" as before.
      const today = getIsoDay();
      if (needsDayRefresh(getSavedResult(res.testId), res, today)) saveResult({ ...res, date: today });
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
