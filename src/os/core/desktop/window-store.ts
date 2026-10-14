import { createStore, type StoreApi } from 'zustand/vanilla';
import type { AppId } from '../types';

export const TITLE_BAR_HEIGHT = 40;
export const MIN_W = 320;
export const MIN_H = 200;
/** How much of the title bar must stay horizontally inside the viewport. */
const VISIBLE_TITLE = 120;
const CASCADE = 32;

export type WinMode = 'normal' | 'minimized' | 'maximized';

export type WinState = {
  id: string;
  appId: AppId;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  mode: WinMode;
};

export type WindowStoreState = {
  windows: WinState[];
  focusedId: string | null;
  open(appId: AppId, title: string): void;
  close(id: string): void;
  focus(id: string): void;
  minimize(id: string): void;
  toggleMaximize(id: string): void;
  move(id: string, x: number, y: number): void;
  resize(id: string, w: number, h: number): void;
  clampAll(): void;
};

export type WindowStore = StoreApi<WindowStoreState>;

export type WindowStoreOptions = {
  viewport: () => { w: number; h: number };
  topInset?: number;
  bottomInset?: number;
};

type Geometry = Pick<WinState, 'x' | 'y' | 'w' | 'h'>;

export function createWindowStore({ viewport, topInset = 0, bottomInset = 0 }: WindowStoreOptions): WindowStore {
  let seq = 0;
  /** Geometry before maximizing, restored by the next toggleMaximize. */
  const prevGeometry = new Map<string, Geometry>();
  /** Mode to return to when a minimized window is restored. */
  const restoreMode = new Map<string, Exclude<WinMode, 'minimized'>>();

  const clampPos = (x: number, y: number, w: number) => {
    const { w: vw, h: vh } = viewport();
    return {
      x: Math.max(VISIBLE_TITLE - w, Math.min(x, vw - VISIBLE_TITLE)),
      y: Math.max(topInset, Math.min(y, vh - bottomInset - TITLE_BAR_HEIGHT)),
    };
  };

  const maximizedGeometry = (): Geometry => {
    const { w: vw, h: vh } = viewport();
    return { x: 0, y: topInset, w: vw, h: vh - topInset - bottomInset };
  };

  const maxZ = (windows: WinState[]) => windows.reduce((m, w) => Math.max(m, w.z), 0);

  const topVisible = (windows: WinState[]) =>
    windows.filter((w) => w.mode !== 'minimized').sort((a, b) => b.z - a.z)[0]?.id ?? null;

  return createStore<WindowStoreState>()((set, get) => {
    const patch = (id: string, fn: (w: WinState) => Partial<WinState>) =>
      set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, ...fn(w) } : w)) }));

    const has = (id: string) => get().windows.some((w) => w.id === id);

    const focus = (id: string) => {
      if (!has(id)) return;
      const z = maxZ(get().windows) + 1;
      patch(id, (w) => ({ z, mode: w.mode === 'minimized' ? (restoreMode.get(id) ?? 'normal') : w.mode }));
      set({ focusedId: id });
    };

    return {
      windows: [],
      focusedId: null,

      open(appId, title) {
        const existing = get().windows.find((w) => w.appId === appId);
        if (existing) return focus(existing.id);
        const { w: vw, h: vh } = viewport();
        const w = Math.min(900, vw - 80);
        const h = Math.min(600, vh - 120);
        const last = get().windows.at(-1);
        const start = last
          ? { x: last.x + CASCADE, y: last.y + CASCADE }
          : {
              x: Math.round((vw - w) / 2),
              y: topInset + Math.max(0, Math.round((vh - topInset - bottomInset - h) / 2)),
            };
        const id = `${appId}-${++seq}`;
        const win: WinState = { id, appId, title, ...clampPos(start.x, start.y, w), w, h, z: maxZ(get().windows) + 1, mode: 'normal' };
        set((s) => ({ windows: [...s.windows, win], focusedId: id }));
      },

      close(id) {
        if (!has(id)) return;
        prevGeometry.delete(id);
        restoreMode.delete(id);
        const windows = get().windows.filter((w) => w.id !== id);
        const focusedId = get().focusedId === id ? topVisible(windows) : get().focusedId;
        set({ windows, focusedId });
      },

      focus,

      minimize(id) {
        const win = get().windows.find((w) => w.id === id);
        if (!win || win.mode === 'minimized') return;
        restoreMode.set(id, win.mode);
        patch(id, () => ({ mode: 'minimized' }));
        if (get().focusedId === id) set({ focusedId: topVisible(get().windows) });
      },

      toggleMaximize(id) {
        const win = get().windows.find((w) => w.id === id);
        if (!win) return;
        if (win.mode === 'maximized') {
          const prev = prevGeometry.get(id);
          prevGeometry.delete(id);
          patch(id, () => ({ ...(prev ?? {}), mode: 'normal' }));
        } else {
          prevGeometry.set(id, { x: win.x, y: win.y, w: win.w, h: win.h });
          patch(id, () => ({ ...maximizedGeometry(), mode: 'maximized' }));
        }
        focus(id);
      },

      move(id, x, y) {
        patch(id, (w) => (w.mode === 'maximized' ? {} : clampPos(x, y, w.w)));
      },

      resize(id, w, h) {
        patch(id, () => ({ w: Math.max(MIN_W, w), h: Math.max(MIN_H, h) }));
      },

      clampAll() {
        set((s) => ({
          windows: s.windows.map((w) => {
            const maximized = w.mode === 'maximized' || (w.mode === 'minimized' && restoreMode.get(w.id) === 'maximized');
            if (maximized) return { ...w, ...maximizedGeometry() };
            return { ...w, ...clampPos(w.x, w.y, w.w) };
          }),
        }));
      },
    };
  });
}
