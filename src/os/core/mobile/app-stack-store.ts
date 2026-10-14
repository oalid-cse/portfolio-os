import { createStore, type StoreApi } from 'zustand/vanilla';

export type AppStackState = {
  /** The open app (an AppId or a skin-defined pseudo-app id), or null on the home screen. */
  current: string | null;
  /** Opens an app full-screen. One app at a time: opening another replaces the current one. */
  openApp(id: string): void;
  goHome(): void;
};

export type AppStackStore = StoreApi<AppStackState>;

/** One store per mobile shell instance (never a module singleton). */
export function createAppStackStore(): AppStackStore {
  return createStore<AppStackState>()((set) => ({
    current: null,
    openApp: (id) => set({ current: id }),
    goHome: () => set({ current: null }),
  }));
}
