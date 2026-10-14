type Area = 'local' | 'session';

function store(area: Area): Storage {
  return area === 'local' ? window.localStorage : window.sessionStorage;
}

/** Every call is try/catch: storage can be blocked, full, or absent. */
export const safeStorage = {
  get(key: string, area: Area = 'local'): string | null {
    try {
      return store(area).getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string, area: Area = 'local'): void {
    try {
      store(area).setItem(key, value);
    } catch {
      /* ignore */
    }
  },
};
