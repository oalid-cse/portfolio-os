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
  /** Atomic move+resize (edge drags): keeps the bottom edge fixed when the top is clamped to topInset. */
  setBounds(id: string, bounds: Geometry): void;
  clampAll(): void;
};

export type WindowStore = StoreApi<WindowStoreState>;

export type WindowStoreOptions = {
  viewport: () => { w: number; h: number };
  topInset?: number;
  bottomInset?: number;
};

export type Geometry = Pick<WinState, 'x' | 'y' | 'w' | 'h'>;

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

  const workHeight = () => viewport().h - topInset - bottomInset;

  /** Fits a size to the work area while respecting the minimum window size. */
  const fitSize = (w: number, h: number) => ({
    w: Math.max(MIN_W, Math.min(w, viewport().w)),
    h: Math.max(MIN_H, Math.min(h, workHeight())),
  });

  const maximizedGeometry = (): Geometry => ({ x: 0, y: topInset, w: viewport().w, h: Math.max(MIN_H, workHeight()) });

  /** Centred inside the work area: the first window's position and where the cascade wraps back to. */
  const cascadeStart = (w: number, h: number) => ({
    x: Math.round((viewport().w - w) / 2),
    y: topInset + Math.max(0, Math.round((workHeight() - h) / 2)),
  });

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
        const w = Math.max(MIN_W, Math.min(900, vw - 80));
        const h = Math.max(MIN_H, Math.min(600, vh - 120));
        const last = get().windows.at(-1);
        let start = last ? { x: last.x + CASCADE, y: last.y + CASCADE } : cascadeStart(w, h);
        // Wrap the cascade back to the start once the next window would leave the work area.
        if (start.x + w > vw || start.y + h > vh - bottomInset) start = cascadeStart(w, h);
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
          const prev = prevGeometry.get(id) ?? win;
          prevGeometry.delete(id);
          // The viewport may have changed while maximized: fit and clamp the restored geometry.
          const size = fitSize(prev.w, prev.h);
          patch(id, () => ({ ...size, ...clampPos(prev.x, prev.y, size.w), mode: 'normal' }));
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

      setBounds(id, { x, y, w, h }) {
        patch(id, (win) => {
          if (win.mode === 'maximized') return {};
          let top = y;
          let height = h;
          if (top < topInset) {
            height -= topInset - top; // keep the bottom edge where it was asked to be
            top = topInset;
          }
          const width = Math.max(MIN_W, w);
          return { w: width, h: Math.max(MIN_H, height), ...clampPos(x, top, width) };
        });
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
