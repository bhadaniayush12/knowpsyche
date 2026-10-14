import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearResults,
  getIsoDay,
  getName,
  getSavedResult,
  hasAnySavedResults,
  isStorageAvailable,
  readReport,
  removeResult,
  saveResult,
  setName,
  STORAGE_KEY,
} from '../saved-results';

// In-memory localStorage mock for node environment testing
class MockLocalStorage implements Storage {
  private store: Map<string, string> = new Map();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

describe('saved-results storage layer', () => {
  let mockStorage: MockLocalStorage;

  beforeEach(() => {
    mockStorage = new MockLocalStorage();
    vi.stubGlobal('localStorage', mockStorage);
    vi.stubGlobal('window', { localStorage: mockStorage });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('isStorageAvailable', () => {
    it('returns true when storage is functional', () => {
      expect(isStorageAvailable()).toBe(true);
    });

    it('returns false when storage is null or undefined', () => {
      vi.stubGlobal('localStorage', undefined);
      vi.stubGlobal('window', undefined);
      expect(isStorageAvailable()).toBe(false);
    });

    it('returns false when storage throws on setItem (blocked storage)', () => {
      vi.spyOn(mockStorage, 'setItem').mockImplementation(() => {
        throw new DOMException('The operation is insecure.', 'SecurityError');
      });
      expect(isStorageAvailable()).toBe(false);
    });
  });

  describe('getIsoDay', () => {
    it('formats date as YYYY-MM-DD', () => {
      const d = new Date(2026, 9, 14, 12, 0, 0); // Oct 14 2026
      expect(getIsoDay(d)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('saveResult & readReport', () => {
    it('saves a single test result with correct fields and reads it back', () => {
      const res = saveResult({
        testId: 'reaction-time',
        date: '2026-10-14',
        badge: 'Lightning',
        headline: '185 ms · Lightning',
        data: 185,
      });

      expect(res).toBe(true);
      const report = readReport();
      expect(report).not.toBeNull();
      expect(report?.version).toBe(1);
      expect(report?.results['reaction-time']).toEqual({
        testId: 'reaction-time',
        date: '2026-10-14',
        badge: 'Lightning',
        headline: '185 ms · Lightning',
        data: 185,
      });
      expect(hasAnySavedResults()).toBe(true);
    });

    it('stores complex data (Enneagram 9 types or EQ 4 areas)', () => {
      const enneagramScores = {
        '1': 12,
        '2': 8,
        '3': 15,
        '4': 20,
        '5': 18,
        '6': 9,
        '7': 14,
        '8': 11,
        '9': 7,
      };

      saveResult({
        testId: 'enneagram',
        date: '2026-10-14',
        badge: 'Type 4 · The Individualist',
        headline: 'Type 4 with Type 5 wing',
        data: enneagramScores,
      });

      const saved = getSavedResult('enneagram');
      expect(saved?.data).toEqual(enneagramScores);
      expect(saved?.badge).toBe('Type 4 · The Individualist');
    });

    it('stores multiple distinct tests', () => {
      saveResult({
        testId: 'reaction-time',
        date: '2026-10-14',
        badge: 'Lightning',
        headline: '185 ms · Lightning',
        data: 185,
      });
      saveResult({
        testId: 'number-memory',
        date: '2026-10-14',
        badge: 'Deep span',
        headline: '9 digits · Deep span',
        data: 9,
      });

      const report = readReport();
      expect(Object.keys(report?.results ?? {})).toHaveLength(2);
      expect(getSavedResult('reaction-time')?.data).toBe(185);
      expect(getSavedResult('number-memory')?.data).toBe(9);
    });
  });

  describe('overwrite behavior', () => {
    it('retaking a test overwrites that test entry completely without affecting others', () => {
      saveResult({
        testId: 'reaction-time',
        date: '2026-10-13',
        badge: 'Steady',
        headline: '260 ms · Steady',
        data: 260,
      });
      saveResult({
        testId: 'stroop',
        date: '2026-10-13',
        badge: 'Mild pull',
        headline: '42 ms · Mild pull',
        data: 42,
      });

      // Retake reaction time
      saveResult({
        testId: 'reaction-time',
        date: '2026-10-14',
        badge: 'Quick',
        headline: '220 ms · Quick',
        data: 220,
      });

      const report = readReport();
      expect(report?.results['reaction-time']).toEqual({
        testId: 'reaction-time',
        date: '2026-10-14',
        badge: 'Quick',
        headline: '220 ms · Quick',
        data: 220,
      });
      // Stroop remains unchanged
      expect(report?.results['stroop']).toEqual({
        testId: 'stroop',
        date: '2026-10-13',
        badge: 'Mild pull',
        headline: '42 ms · Mild pull',
        data: 42,
      });
    });
  });

  describe('clearResults & removeResult', () => {
    it('clears all results', () => {
      saveResult({
        testId: 'attention-span',
        date: '2026-10-14',
        badge: 'High vigilance',
        headline: 'High vigilance · 88 / 100',
        data: 88,
      });

      expect(hasAnySavedResults()).toBe(true);
      expect(clearResults()).toBe(true);
      expect(readReport()).toBeNull();
      expect(hasAnySavedResults()).toBe(false);
      expect(mockStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('removeResult removes only the target test', () => {
      saveResult({
        testId: 'reaction-time',
        date: '2026-10-14',
        badge: 'Lightning',
        headline: '180 ms',
        data: 180,
      });
      saveResult({
        testId: 'number-memory',
        date: '2026-10-14',
        badge: 'Deep span',
        headline: '9 digits',
        data: 9,
      });

      expect(removeResult('reaction-time')).toBe(true);
      expect(getSavedResult('reaction-time')).toBeNull();
      expect(getSavedResult('number-memory')).not.toBeNull();
    });
  });

  describe('optional name field', () => {
    it('stores and retrieves name', () => {
      expect(getName()).toBeNull();
      expect(setName('Ayush')).toBe(true);
      expect(getName()).toBe('Ayush');

      // Saving a test result preserves the name
      saveResult({
        testId: 'reaction-time',
        date: '2026-10-14',
        badge: 'Quick',
        headline: '210 ms',
        data: 210,
      });
      expect(getName()).toBe('Ayush');
      expect(readReport()?.name).toBe('Ayush');
    });
  });

  describe('blocked storage handling', () => {
    it('saveResult returns false and does not throw when setItem throws', () => {
      vi.spyOn(mockStorage, 'setItem').mockImplementation(() => {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      });

      const res = saveResult({
        testId: 'reaction-time',
        date: '2026-10-14',
        badge: 'Quick',
        headline: '210 ms',
        data: 210,
      });
      expect(res).toBe(false);
    });

    it('readReport returns null and does not throw when getItem throws', () => {
      vi.spyOn(mockStorage, 'getItem').mockImplementation(() => {
        throw new DOMException('Access denied', 'SecurityError');
      });

      expect(readReport()).toBeNull();
      expect(getSavedResult('reaction-time')).toBeNull();
      expect(hasAnySavedResults()).toBe(false);
    });

    it('clearResults returns false and does not throw when removeItem throws', () => {
      vi.spyOn(mockStorage, 'removeItem').mockImplementation(() => {
        throw new DOMException('Access denied', 'SecurityError');
      });

      expect(clearResults()).toBe(false);
    });
  });

  describe('bad JSON handling', () => {
    it('readReport returns null when storage contains corrupted JSON', () => {
      mockStorage.setItem(STORAGE_KEY, 'not-valid-json{{;;');
      expect(readReport()).toBeNull();
      expect(getSavedResult('reaction-time')).toBeNull();
      expect(hasAnySavedResults()).toBe(false);
    });

    it('readReport returns null when storage contains non-object JSON', () => {
      mockStorage.setItem(STORAGE_KEY, '"just a string"');
      expect(readReport()).toBeNull();
      mockStorage.setItem(STORAGE_KEY, '42');
      expect(readReport()).toBeNull();
      mockStorage.setItem(STORAGE_KEY, '{"version": 1}'); // missing results object
      expect(readReport()).toBeNull();
    });

    it('saveResult resets gracefully when existing storage is corrupted JSON', () => {
      mockStorage.setItem(STORAGE_KEY, '{broken-json');
      const ok = saveResult({
        testId: 'photographic-memory',
        date: '2026-10-14',
        badge: 'Vivid memory',
        headline: 'Level 7 · Vivid memory',
        data: 7,
      });
      expect(ok).toBe(true);
      expect(getSavedResult('photographic-memory')?.data).toBe(7);
    });
  });
});
