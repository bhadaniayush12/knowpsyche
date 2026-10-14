/**
 * KnowPsyche Local Storage Layer for Saved Results.
 *
 * All results are saved in the user's own browser via localStorage under one key.
 * Only summary data already visible on the result page is stored:
 * - test id
 * - date (ISO day: YYYY-MM-DD)
 * - band badge
 * - headline
 * - data (Enneagram: nine scores; EQ: four area scores; others: the main number)
 *
 * NO individual answers and NO per-try timings are ever stored.
 * An optional name field may be stored once.
 * Every read and write is wrapped in try/catch to gracefully handle blocked storage.
 * Retaking a test overwrites that test's saved entry.
 */

export const STORAGE_KEY = 'knowpsyche_saved_results';

export type TestId =
  | 'reaction-time'
  | 'enneagram'
  | 'photographic-memory'
  | 'number-memory'
  | 'attention-span'
  | 'stroop'
  | 'emotional-intelligence';

export interface SavedTestResult {
  testId: string;
  date: string; // ISO day "YYYY-MM-DD"
  badge: string;
  headline: string;
  data: number | Record<string, number>;
}

export interface SavedReport {
  version: 1;
  name?: string;
  results: Record<string, SavedTestResult>;
}

/** Safely get localStorage reference. */
export function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

/** Check if localStorage is available and writable. Returns false if blocked or unavailable. */
export function isStorageAvailable(): boolean {
  try {
    const storage = getStorage();
    if (!storage) return false;
    const testKey = '__kp_test__';
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/** Returns the ISO day string (e.g. "2026-10-14"). */
export function getIsoDay(d = new Date()): string {
  try {
    return d.toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

/** Read the full saved report from localStorage. Returns null if empty, blocked, or invalid JSON. */
export function readReport(): SavedReport | null {
  try {
    const storage = getStorage();
    if (!storage) return null;
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || typeof parsed.results !== 'object') {
      return null;
    }
    return parsed as SavedReport;
  } catch {
    return null;
  }
}

/** Save or overwrite a test result. Returns true on success, false if storage is blocked. */
export function saveResult(entry: SavedTestResult): boolean {
  try {
    const storage = getStorage();
    if (!storage) return false;
    const existing = readReport() ?? { version: 1, results: {} };
    existing.results[entry.testId] = {
      testId: entry.testId,
      date: entry.date,
      badge: entry.badge,
      headline: entry.headline,
      data: entry.data,
    };
    storage.setItem(STORAGE_KEY, JSON.stringify(existing));
    return true;
  } catch {
    return false;
  }
}

/** Get a saved result for a specific test, or null if none saved. */
export function getSavedResult(testId: string): SavedTestResult | null {
  const report = readReport();
  return report?.results?.[testId] ?? null;
}

/** Returns true if any test result is currently saved in localStorage. */
export function hasAnySavedResults(): boolean {
  const report = readReport();
  return Boolean(report && Object.keys(report.results).length > 0);
}

/** Clear all saved results and report from localStorage. */
export function clearResults(): boolean {
  try {
    const storage = getStorage();
    if (!storage) return false;
    storage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

/** Remove a single test result from saved storage. */
export function removeResult(testId: string): boolean {
  try {
    const storage = getStorage();
    if (!storage) return false;
    const report = readReport();
    if (!report || !report.results[testId]) return false;
    delete report.results[testId];
    if (Object.keys(report.results).length === 0 && !report.name) {
      storage.removeItem(STORAGE_KEY);
    } else {
      storage.setItem(STORAGE_KEY, JSON.stringify(report));
    }
    return true;
  } catch {
    return false;
  }
}

/** Set optional user name stored once for the report. */
export function setName(name: string): boolean {
  try {
    const storage = getStorage();
    if (!storage) return false;
    const report = readReport() ?? { version: 1, results: {} };
    report.name = name.trim();
    storage.setItem(STORAGE_KEY, JSON.stringify(report));
    return true;
  } catch {
    return false;
  }
}

/** Get the optional user name stored for the report. */
export function getName(): string | null {
  const report = readReport();
  return report?.name ?? null;
}

export interface SaveOptInHandle {
  show(result: Omit<SavedTestResult, 'date'>): void;
  reset(): void;
}

/**
 * Initializes the opt-in UI component on a result page.
 * If storage is blocked, the container remains hidden and everything works as before.
 */
export function initSaveOptIn(container: HTMLElement | null): SaveOptInHandle {
  if (!container || !isStorageAvailable()) {
    if (container) container.hidden = true;
    return {
      show() {},
      reset() {},
    };
  }

  const saveBtn = container.querySelector<HTMLButtonElement>('[data-save-btn]');
  const clearBtn = container.querySelector<HTMLButtonElement>('[data-clear-btn]');
  const statusEl = container.querySelector<HTMLElement>('[data-save-status]');

  let currentResult: Omit<SavedTestResult, 'date'> | null = null;

  const updateClearVisibility = () => {
    if (clearBtn) {
      clearBtn.hidden = !hasAnySavedResults();
    }
  };

  const updateButtonState = () => {
    if (!saveBtn || !currentResult) return;
    const existing = getSavedResult(currentResult.testId);
    if (existing) {
      const isSameData = JSON.stringify(existing.data) === JSON.stringify(currentResult.data);
      if (isSameData && existing.badge === currentResult.badge) {
        saveBtn.textContent = 'Saved on this device';
        saveBtn.setAttribute('aria-pressed', 'true');
        if (statusEl) statusEl.textContent = 'Saved to your browser on this device.';
      } else {
        saveBtn.textContent = 'Update saved result';
        saveBtn.setAttribute('aria-pressed', 'false');
        if (statusEl) statusEl.textContent = 'A previous result is saved on this device. Save to overwrite it.';
      }
    } else {
      saveBtn.textContent = 'Save result';
      saveBtn.setAttribute('aria-pressed', 'false');
      if (statusEl) statusEl.textContent = '';
    }
    updateClearVisibility();
  };

  saveBtn?.addEventListener('click', () => {
    if (!currentResult) return;
    const ok = saveResult({
      ...currentResult,
      date: getIsoDay(),
    });
    if (ok) {
      if (saveBtn) {
        saveBtn.textContent = 'Saved on this device';
        saveBtn.setAttribute('aria-pressed', 'true');
      }
      if (statusEl) statusEl.textContent = 'Saved to your browser on this device.';
      updateClearVisibility();
    }
  });

  clearBtn?.addEventListener('click', () => {
    clearResults();
    updateButtonState();
    if (statusEl) statusEl.textContent = 'Saved results cleared from this device.';
  });

  return {
    show(res) {
      currentResult = res;
      container.hidden = false;
      updateButtonState();
    },
    reset() {
      currentResult = null;
      container.hidden = true;
      if (statusEl) statusEl.textContent = '';
    },
  };
}
