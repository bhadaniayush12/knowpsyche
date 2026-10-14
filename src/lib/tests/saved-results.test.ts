import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearResults,
  getIsoDay,
  getName,
  getSavedResult,
  hasSavedData,
  isStorageAvailable,
  readReport,
  saveResult,
  setName,
  STORAGE_KEY,
  CHANGE_EVENT,
  type SavedTestResult,
} from '../saved-results';

const rt = (over: Partial<SavedTestResult> = {}): SavedTestResult => ({
  testId: 'reaction-time',
  date: '2026-10-14',
  badge: 'Quick',
  headline: '220 ms · Quick',
  data: 220,
  ...over,
});

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
    it('is true when storage works', () => {
      expect(isStorageAvailable()).toBe(true);
    });

    it('never writes anything (no storage before opt-in)', () => {
      const set = vi.spyOn(mockStorage, 'setItem');
      expect(isStorageAvailable()).toBe(true);
      expect(set).not.toHaveBeenCalled();
      expect(mockStorage.length).toBe(0);
    });

    it('is false when there is no storage', () => {
      vi.stubGlobal('localStorage', undefined);
      vi.stubGlobal('window', undefined);
      expect(isStorageAvailable()).toBe(false);
    });

    it('is false when reading window.localStorage throws (cookies blocked)', () => {
      const blocked = {};
      Object.defineProperty(blocked, 'localStorage', {
        get() {
          throw new DOMException('The operation is insecure.', 'SecurityError');
        },
      });
      vi.stubGlobal('window', blocked);
      vi.stubGlobal('localStorage', undefined);
      expect(isStorageAvailable()).toBe(false);
      expect(saveResult(rt())).toBe(false);
      expect(readReport()).toBeNull();
      expect(clearResults()).toBe(false);
    });

    it('is false when getItem throws', () => {
      vi.spyOn(mockStorage, 'getItem').mockImplementation(() => {
        throw new DOMException('Access denied', 'SecurityError');
      });
      expect(isStorageAvailable()).toBe(false);
    });
  });

  describe('getIsoDay', () => {
    it('formats a date as the ISO day', () => {
      expect(getIsoDay(new Date('2026-10-14T12:00:00Z'))).toBe('2026-10-14');
    });

    describe("uses the person's local day, not UTC", () => {
      const tz = process.env.TZ;
      afterEach(() => {
        vi.useRealTimers();
        if (tz === undefined) delete process.env.TZ;
        else process.env.TZ = tz;
      });

      it('America/Los_Angeles, 19:00 on 14 October (already 15 October in UTC)', () => {
        process.env.TZ = 'America/Los_Angeles';
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-10-14T19:00:00-07:00'));
        expect(new Date().toISOString().slice(0, 10)).toBe('2026-10-15');
        expect(getIsoDay()).toBe('2026-10-14');
        saveResult(rt({ date: getIsoDay() }));
        expect(getSavedResult('reaction-time')?.date).toBe('2026-10-14');
      });

      it('Asia/Kolkata, 01:30 on 15 October (still 14 October in UTC)', () => {
        process.env.TZ = 'Asia/Kolkata';
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-10-15T01:30:00+05:30'));
        expect(new Date().toISOString().slice(0, 10)).toBe('2026-10-14');
        expect(getIsoDay()).toBe('2026-10-15');
        saveResult(rt({ date: getIsoDay() }));
        expect(getSavedResult('reaction-time')?.date).toBe('2026-10-15');
      });
    });

    it('returns an empty string for an invalid date', () => {
      expect(getIsoDay(new Date('nope'))).toBe('');
    });
  });

  describe('save and read', () => {
    it('saves one result with exactly the allowed fields and reads it back', () => {
      expect(saveResult(rt())).toBe(true);
      const report = readReport();
      expect(report).toEqual({ version: 1, results: { 'reaction-time': rt() } });
      expect(hasSavedData()).toBe(true);
    });

    it('stores Enneagram nine scores and EQ four areas', () => {
      const nine = { '1': 12, '2': 8, '3': 15, '4': 20, '5': 18, '6': 9, '7': 14, '8': 11, '9': 7 };
      const four = { knowing: 70, managing: 55, reading: 80, relationships: 62 };
      saveResult({ testId: 'enneagram', date: '2026-10-14', badge: '4w5', headline: "You're most likely a Type 4: The Individualist", data: nine });
      saveResult({ testId: 'emotional-intelligence', date: '2026-10-14', badge: 'Growing', headline: 'Your strongest area is Reading feelings', data: four });
      expect(getSavedResult('enneagram')?.data).toEqual(nine);
      expect(getSavedResult('emotional-intelligence')?.data).toEqual(four);
    });

    it('never saves an unmeasured Stroop run (no number)', () => {
      expect(saveResult({ testId: 'stroop', date: '2026-10-14', badge: '', headline: 'Not measured', data: null })).toBe(false);
      expect(getSavedResult('stroop')).toBeNull();
      expect(mockStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('never replaces a measured Stroop result with an unmeasured one', () => {
      const measured: SavedTestResult = { testId: 'stroop', date: '2026-10-14', badge: 'Mild pull', headline: 'Mild pull · 120 ms', data: 120 };
      expect(saveResult(measured)).toBe(true);
      const before = mockStorage.getItem(STORAGE_KEY);
      expect(saveResult({ testId: 'stroop', date: '2026-10-15', badge: '', headline: 'Not measured', data: null })).toBe(false);
      expect(getSavedResult('stroop')).toEqual(measured);
      expect(mockStorage.getItem(STORAGE_KEY)).toBe(before);
    });

    it('still reads an unmeasured Stroop entry saved before this rule', () => {
      mockStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, results: { stroop: { testId: 'stroop', date: '2026-10-14', badge: '', headline: 'Not measured', data: null } } }));
      expect(getSavedResult('stroop')?.data).toBeNull();
    });

    it('drops anything extra, such as answers or per-try timings', () => {
      const sneaky = { ...rt(), answers: [1, 2, 3], tries: [210, 230, 220] } as unknown as SavedTestResult;
      saveResult(sneaky);
      const raw = mockStorage.getItem(STORAGE_KEY)!;
      expect(raw).not.toContain('answers');
      expect(raw).not.toContain('tries');
      expect(Object.keys(getSavedResult('reaction-time')!).sort()).toEqual(['badge', 'data', 'date', 'headline', 'testId']);
    });

    it('rejects an unknown test id or a bad data shape', () => {
      expect(saveResult(rt({ testId: 'iq' as never }))).toBe(false);
      expect(saveResult(rt({ data: [1, 2] as never }))).toBe(false);
      expect(saveResult(rt({ data: { a: 'x' } as never }))).toBe(false);
      expect(mockStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('keeps several tests side by side', () => {
      saveResult(rt());
      saveResult({ testId: 'number-memory', date: '2026-10-14', badge: 'Strong span', headline: '9 digits · Strong span', data: 9 });
      expect(Object.keys(readReport()!.results)).toEqual(['reaction-time', 'number-memory']);
    });
  });

  describe('overwrite', () => {
    it('a retake replaces that test only', () => {
      saveResult(rt({ date: '2026-10-13', badge: 'Steady', headline: '260 ms · Steady', data: 260 }));
      const stroop: SavedTestResult = { testId: 'stroop', date: '2026-10-13', badge: 'Mild pull', headline: 'Mild pull · 42 ms', data: 42 };
      saveResult(stroop);
      saveResult(rt());
      expect(getSavedResult('reaction-time')).toEqual(rt());
      expect(getSavedResult('stroop')).toEqual(stroop);
    });
  });

  describe('clear', () => {
    it('removes every result and the name', () => {
      saveResult(rt());
      setName('Sam');
      expect(clearResults()).toBe(true);
      expect(mockStorage.getItem(STORAGE_KEY)).toBeNull();
      expect(readReport()).toBeNull();
      expect(hasSavedData()).toBe(false);
    });

    it('is false and does not throw when removeItem throws', () => {
      vi.spyOn(mockStorage, 'removeItem').mockImplementation(() => {
        throw new DOMException('Access denied', 'SecurityError');
      });
      expect(clearResults()).toBe(false);
    });
  });

  describe('optional name', () => {
    it('is absent by default, survives saves, and an empty name removes it', () => {
      expect(getName()).toBeNull();
      expect(setName('  Sam ')).toBe(true);
      saveResult(rt());
      expect(getName()).toBe('Sam');
      setName('   ');
      expect(getName()).toBeNull();
      expect(readReport()).not.toHaveProperty('name');
    });

    it('counts as saved data so Clear is offered', () => {
      setName('Sam');
      expect(hasSavedData()).toBe(true);
    });
  });

  describe('blocked storage', () => {
    it('saveResult is false and does not throw when setItem throws (quota or private mode)', () => {
      vi.spyOn(mockStorage, 'setItem').mockImplementation(() => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      });
      expect(saveResult(rt())).toBe(false);
      expect(setName('Sam')).toBe(false);
    });

    it('reads return nothing and do not throw when getItem throws', () => {
      vi.spyOn(mockStorage, 'getItem').mockImplementation(() => {
        throw new DOMException('Access denied', 'SecurityError');
      });
      expect(readReport()).toBeNull();
      expect(getSavedResult('reaction-time')).toBeNull();
      expect(hasSavedData()).toBe(false);
      expect(getName()).toBeNull();
    });
  });

  describe('bad JSON', () => {
    it.each([
      ['broken JSON', 'not-valid-json{{;;'],
      ['a string', '"just a string"'],
      ['a number', '42'],
      ['null', 'null'],
      ['an array', '[1,2]'],
      ['no results', '{"version":1}'],
      ['null results', '{"version":1,"results":null}'],
      ['array results', '{"version":1,"results":[]}'],
    ])('readReport is null for %s', (_, raw) => {
      mockStorage.setItem(STORAGE_KEY, raw);
      expect(readReport()).toBeNull();
      expect(hasSavedData()).toBe(false);
    });

    it('drops broken entries but keeps good ones', () => {
      mockStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: 1, results: { 'reaction-time': rt(), stroop: { testId: 'stroop', data: 'x' }, iq: { ...rt(), testId: 'iq' } } }),
      );
      expect(readReport()).toEqual({ version: 1, results: { 'reaction-time': rt() } });
    });

    it.each(['{broken-json', '{"version":1,"results":null}'])('a save over %s starts a fresh report', (raw) => {
      mockStorage.setItem(STORAGE_KEY, raw);
      expect(saveResult(rt())).toBe(true);
      expect(readReport()).toEqual({ version: 1, results: { 'reaction-time': rt() } });
    });
  });
});

describe('change event', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('fires on save and clear, carrying no data', () => {
    const storage = new MockLocalStorage();
    const dispatchEvent = vi.fn();
    vi.stubGlobal('window', { localStorage: storage, dispatchEvent });
    vi.stubGlobal('localStorage', storage);
    saveResult(rt());
    clearResults();
    expect(dispatchEvent).toHaveBeenCalledTimes(2);
    expect(dispatchEvent.mock.calls[0][0].type).toBe(CHANGE_EVENT);
    expect('detail' in dispatchEvent.mock.calls[0][0]).toBe(false);
  });

  it('does not fire when a save fails', () => {
    const storage = new MockLocalStorage();
    vi.spyOn(storage, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    const dispatchEvent = vi.fn();
    vi.stubGlobal('window', { localStorage: storage, dispatchEvent });
    expect(saveResult(rt())).toBe(false);
    expect(dispatchEvent).not.toHaveBeenCalled();
  });
});
