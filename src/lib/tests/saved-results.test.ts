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
  DATA_RULES,
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

describe('what clean() keeps (Q1-13)', () => {
  let storage: MockLocalStorage;
  beforeEach(() => {
    storage = new MockLocalStorage();
    vi.stubGlobal('localStorage', storage);
    vi.stubGlobal('window', { localStorage: storage });
  });
  afterEach(() => vi.unstubAllGlobals());

  const e = (testId: SavedTestResult['testId'], data: unknown, over: Record<string, unknown> = {}) =>
    ({ testId, date: '2026-10-14', badge: 'B', headline: 'H', data, ...over }) as unknown as SavedTestResult;
  /** Stores raw JSON (as if hand-edited) and reads it back through readReport. */
  const kept = (entry: unknown, extra: Record<string, unknown> = {}) => {
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, results: { x: entry }, ...extra }));
    return readReport();
  };
  const keeps = (entry: SavedTestResult) => Object.keys(kept(entry)!.results).length === 1;
  const eq = (v: number, over: Record<string, number> = {}) => ({ knowing: v, managing: v, reading: v, relationships: v, ...over });
  const enne = (v: number, over: Record<string, number> = {}) => ({ ...Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => [String(n), v])), ...over });

  describe('day must be a real YYYY-MM-DD', () => {
    it.each(['2026-10-14', '2024-02-29', '2026-12-31'])('keeps %s', (date) => expect(keeps(e('number-memory', 7, { date }))).toBe(true));
    it.each(['garbage', '', '2026-1-4', '14-10-2026', '2026-10-14T10:00:00Z', ' 2026-10-14', '2026-13-01', '2026-00-10', '2026-02-30', '2025-02-29', '2026-10-00'])(
      'drops %j',
      (date) => expect(keeps(e('number-memory', 7, { date }))).toBe(false),
    );
    it('drops a day that is not a string', () => expect(keeps(e('number-memory', 7, { date: 20261014 }))).toBe(false));
  });

  describe('badge and headline up to 120 characters', () => {
    it('keeps exactly 120', () => expect(keeps(e('number-memory', 7, { badge: 'b'.repeat(120), headline: 'h'.repeat(120) }))).toBe(true));
    it('drops a 121-character headline', () => expect(keeps(e('number-memory', 7, { headline: 'h'.repeat(121) }))).toBe(false));
    it('drops a 121-character badge', () => expect(keeps(e('number-memory', 7, { badge: 'b'.repeat(121) }))).toBe(false));
    it('keeps an empty badge', () => expect(keeps(e('stroop', null, { badge: '' }))).toBe(true));
  });

  describe('name up to 60 characters', () => {
    it('keeps 60', () => expect(kept(e('number-memory', 7), { name: 'n'.repeat(60) })!.name).toBe('n'.repeat(60)));
    it('keeps a name that is 60 once trimmed', () => expect(kept(e('number-memory', 7), { name: `  ${'n'.repeat(60)}  ` })!.name).toBe('n'.repeat(60)));
    it('drops 61 (the results stay)', () => {
      const r = kept(e('number-memory', 7), { name: 'n'.repeat(61) })!;
      expect(r.name).toBeUndefined();
      expect(Object.keys(r.results)).toEqual(['number-memory']);
    });
    it('setName does not store 61', () => {
      expect(setName('n'.repeat(61))).toBe(false);
      expect(storage.getItem(STORAGE_KEY)).toBeNull();
      expect(setName('n'.repeat(60))).toBe(true);
      expect(getName()).toBe('n'.repeat(60));
    });
  });

  describe('reaction time: a number from 0 to 100000 ms', () => {
    it.each([0, 1, 220, 245.5, 100000])('keeps %s', (v) => expect(keeps(e('reaction-time', v))).toBe(true));
    it.each([-1, 100001, 999999999, NaN, Infinity, '220', null, { a: 1 }])('drops %j', (v) => expect(keeps(e('reaction-time', v))).toBe(false));
  });

  describe('Stroop: -100000 to 100000 ms, or null for an unmeasured run', () => {
    it.each([-20, 0, 120, null, -100000, 100000])('keeps %j', (v) => expect(keeps(e('stroop', v))).toBe(true));
    it.each([-100001, 100001, '120', { a: 1 }])('drops %j', (v) => expect(keeps(e('stroop', v))).toBe(false));
  });

  describe('attention span: 0 to 100', () => {
    it.each([0, 78, 89.5, 100])('keeps %s', (v) => expect(keeps(e('attention-span', v))).toBe(true));
    it.each([-1, 101, null])('drops %j', (v) => expect(keeps(e('attention-span', v))).toBe(false));
  });

  describe('number memory and photographic memory: whole numbers from 0', () => {
    it.each([['number-memory', 0], ['number-memory', 12], ['photographic-memory', 0], ['photographic-memory', 14]] as const)('%s keeps %s', (id, v) =>
      expect(keeps(e(id, v))).toBe(true),
    );
    it.each([
      ['number-memory', -5],
      ['number-memory', 7.5],
      ['number-memory', null],
      ['number-memory', 100001],
      ['photographic-memory', -1],
      ['photographic-memory', 3.2],
      ['photographic-memory', null],
    ] as const)('%s drops %j', (id, v) => expect(keeps(e(id, v))).toBe(false));
  });

  describe('EQ: exactly the four areas, each a whole number 0 to 100', () => {
    it.each([eq(0), eq(100), eq(64)])('keeps %j', (v) => expect(keeps(e('emotional-intelligence', v))).toBe(true));
    it.each([
      eq(101),
      eq(-1),
      eq(50, { knowing: 50.5 }),
      { knowing: 50, managing: 50, reading: 50 },
      { ...eq(50), extra: 50 },
      { foo: 60 },
      {},
      60,
      null,
    ])('drops %j', (v) => expect(keeps(e('emotional-intelligence', v))).toBe(false));
    it('the area ids match the EQ test data', async () => {
      const { areas } = await import('../../data/tests/emotional-intelligence');
      expect(DATA_RULES['emotional-intelligence'].keys).toEqual(areas.map((a) => a.id));
    });
  });

  describe('Enneagram: exactly types 1 to 9, each a whole number 5 to 25', () => {
    it.each([enne(5), enne(25), enne(10, { 4: 22, 5: 21 })])('keeps %j', (v) => expect(keeps(e('enneagram', v))).toBe(true));
    it.each([enne(4), enne(26), enne(10, { 4: 999, 5: -3 }), enne(10, { 4: 22.5 }), { ...enne(10), x: 2 }, { 4: 22 }, {}, 22, null])('drops %j', (v) =>
      expect(keeps(e('enneagram', v))).toBe(false),
    );
  });

  it('saveResult refuses what clean() drops, and stores nothing', () => {
    expect(saveResult(e('reaction-time', -5))).toBe(false);
    expect(saveResult(e('number-memory', 7, { date: '2026-13-45' }))).toBe(false);
    expect(saveResult(e('number-memory', 7, { headline: 'h'.repeat(121) }))).toBe(false);
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe('two tabs saving at the same time (Q1-15)', () => {
  // Two tabs share one localStorage. Each tab is its own copy of the module with its own window, and only
  // the *other* tab's window gets a storage event, as in a browser.
  type Tab = { mod: typeof import('../saved-results'); fire: (newValue: string | null, key?: string | null) => void };
  let shared: MockLocalStorage;

  const openTab = async (): Promise<Tab> => {
    vi.resetModules();
    const listeners: ((e: Partial<StorageEvent>) => void)[] = [];
    vi.stubGlobal('localStorage', shared);
    vi.stubGlobal('window', {
      localStorage: shared,
      addEventListener: (type: string, fn: (e: Partial<StorageEvent>) => void) => type === 'storage' && listeners.push(fn),
      dispatchEvent: () => true,
    });
    const mod = await import('../saved-results');
    return { mod, fire: (newValue, key = STORAGE_KEY) => listeners.forEach((fn) => fn({ key, newValue })) };
  };
  const nm = rt({ testId: 'number-memory', badge: 'Steady', headline: '7 digits · Steady', data: 7 });
  const stroop = rt({ testId: 'stroop', badge: 'Mild pull', headline: '120 ms · Mild pull', data: 120 });
  const ids = () => Object.keys(JSON.parse(shared.getItem(STORAGE_KEY)!).results).sort();

  beforeEach(() => {
    shared = new MockLocalStorage();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('each write reads storage again first, so a save from another tab since load is kept', async () => {
    const a = await openTab();
    const b = await openTab();
    b.mod.saveResult(stroop);
    a.mod.saveResult(nm);
    expect(ids()).toEqual(['number-memory', 'stroop']);
    a.mod.setName('Sam');
    expect(ids()).toEqual(['number-memory', 'stroop']);
  });

  it('both read before either writes: the tab whose result was dropped puts it back', async () => {
    const a = await openTab();
    // Another tab read an empty store at the same moment A did, so its write leaves A's result out.
    a.mod.saveResult(nm);
    shared.setItem(STORAGE_KEY, JSON.stringify({ version: 1, results: { stroop } }));
    a.fire(shared.getItem(STORAGE_KEY));
    expect(ids()).toEqual(['number-memory', 'stroop']);
  });

  it('a clear in another tab wins: nothing is put back', async () => {
    const a = await openTab();
    a.mod.saveResult(nm);
    shared.removeItem(STORAGE_KEY);
    a.fire(null);
    expect(shared.getItem(STORAGE_KEY)).toBeNull();
    // Nor after a later save from that tab.
    shared.setItem(STORAGE_KEY, JSON.stringify({ version: 1, results: { stroop } }));
    a.fire(shared.getItem(STORAGE_KEY));
    expect(ids()).toEqual(['stroop']);
  });

  it('only for a short while after the save', async () => {
    vi.useFakeTimers();
    try {
      const a = await openTab();
      a.mod.saveResult(nm);
      vi.advanceTimersByTime(2500);
      shared.setItem(STORAGE_KEY, JSON.stringify({ version: 1, results: { stroop } }));
      a.fire(shared.getItem(STORAGE_KEY));
      expect(ids()).toEqual(['stroop']);
    } finally {
      vi.useRealTimers();
    }
  });

  it('another tab updating the same test keeps its newer value', async () => {
    const a = await openTab();
    a.mod.saveResult(nm);
    const newer = { ...nm, data: 9, headline: '9 digits · Strong', badge: 'Strong' };
    shared.setItem(STORAGE_KEY, JSON.stringify({ version: 1, results: { 'number-memory': newer } }));
    a.fire(shared.getItem(STORAGE_KEY));
    expect(JSON.parse(shared.getItem(STORAGE_KEY)!).results['number-memory'].data).toBe(9);
  });
});
