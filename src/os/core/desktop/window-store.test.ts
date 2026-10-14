import { beforeEach, describe, expect, it } from 'vitest';
import { createWindowStore, MIN_H, MIN_W, TITLE_BAR_HEIGHT } from './window-store';

let vw = 1440;
let vh = 900;
const TOP = 30;
const BOTTOM = 48;

function setup(opts: { top?: number; bottom?: number } = { top: TOP, bottom: BOTTOM }) {
  const store = createWindowStore({ viewport: () => ({ w: vw, h: vh }), topInset: opts.top, bottomInset: opts.bottom });
  const s = () => store.getState();
  const win = (id: string) => {
    const w = s().windows.find((x) => x.id === id);
    if (!w) throw new Error(`no window ${id}`);
    return w;
  };
  return { store, s, win };
}

beforeEach(() => {
  vw = 1440;
  vh = 900;
});

describe('createWindowStore', () => {
  it('exports the title bar height and min size constants', () => {
    expect(TITLE_BAR_HEIGHT).toBe(40);
    expect(MIN_W).toBe(320);
    expect(MIN_H).toBe(200);
  });

  it('opens a window with default size min(900, vw-80) x min(600, vh-120), focused', () => {
    const { s } = setup();
    s().open('about', 'About');
    expect(s().windows).toHaveLength(1);
    const w = s().windows[0]!;
    expect(w).toMatchObject({ appId: 'about', title: 'About', w: 900, h: 600, mode: 'normal' });
    expect(s().focusedId).toBe(w.id);
  });

  it('default size shrinks on small viewports', () => {
    vw = 800;
    vh = 600;
    const { s } = setup();
    s().open('about', 'About');
    expect(s().windows[0]).toMatchObject({ w: 720, h: 480 });
  });

  it('open twice → one window, focused', () => {
    const { s } = setup();
    s().open('about', 'About');
    s().open('skills', 'Skills');
    s().open('about', 'About');
    expect(s().windows.filter((w) => w.appId === 'about')).toHaveLength(1);
    const about = s().windows.find((w) => w.appId === 'about')!;
    expect(s().focusedId).toBe(about.id);
    expect(about.z).toBe(Math.max(...s().windows.map((w) => w.z)));
  });

  it('open on a minimized app restores and focuses it', () => {
    const { s, win } = setup();
    s().open('about', 'About');
    const id = s().focusedId!;
    s().minimize(id);
    expect(win(id).mode).toBe('minimized');
    s().open('about', 'About');
    expect(win(id).mode).toBe('normal');
    expect(s().focusedId).toBe(id);
  });

  it('new windows cascade by +32px from the last one', () => {
    const { s } = setup();
    s().open('about', 'About');
    s().open('skills', 'Skills');
    s().open('projects', 'Projects');
    const [a, b, c] = s().windows;
    expect(b!.x - a!.x).toBe(32);
    expect(b!.y - a!.y).toBe(32);
    expect(c!.x - b!.x).toBe(32);
    expect(c!.y - b!.y).toBe(32);
  });

  it('first window opens inside the insets', () => {
    const { s } = setup();
    s().open('about', 'About');
    const w = s().windows[0]!;
    expect(w.y).toBeGreaterThanOrEqual(TOP);
    expect(w.y + w.h).toBeLessThanOrEqual(vh - BOTTOM);
    expect(w.x).toBeGreaterThanOrEqual(0);
    expect(w.x + w.w).toBeLessThanOrEqual(vw);
  });

  it('focus sets z = max + 1', () => {
    const { s, win } = setup();
    s().open('about', 'About');
    const a = s().focusedId!;
    s().open('skills', 'Skills');
    const b = s().focusedId!;
    const max = Math.max(win(a).z, win(b).z);
    s().focus(a);
    expect(win(a).z).toBe(max + 1);
    expect(s().focusedId).toBe(a);
  });

  it('close removes the window and focuses the next-highest visible one', () => {
    const { s } = setup();
    s().open('about', 'About');
    const a = s().focusedId!;
    s().open('skills', 'Skills');
    const b = s().focusedId!;
    s().close(b);
    expect(s().windows.map((w) => w.id)).toEqual([a]);
    expect(s().focusedId).toBe(a);
    s().close(a);
    expect(s().windows).toEqual([]);
    expect(s().focusedId).toBeNull();
  });

  it('minimizing the focused window focuses the next-highest visible one', () => {
    const { s } = setup();
    s().open('about', 'About');
    const a = s().focusedId!;
    s().open('skills', 'Skills');
    const b = s().focusedId!;
    s().open('projects', 'Projects');
    const c = s().focusedId!;
    s().focus(a); // z order now b < c < a
    s().minimize(c); // not focused: focus stays
    expect(s().focusedId).toBe(a);
    s().minimize(a); // next-highest visible is b (c is minimized)
    expect(s().focusedId).toBe(b);
    s().minimize(b);
    expect(s().focusedId).toBeNull();
  });

  it('focus restores a minimized window', () => {
    const { s, win } = setup();
    s().open('about', 'About');
    const a = s().focusedId!;
    s().minimize(a);
    s().focus(a);
    expect(win(a).mode).toBe('normal');
    expect(s().focusedId).toBe(a);
  });

  it('toggleMaximize fills the area between insets and restores previous geometry', () => {
    const { s, win } = setup();
    s().open('about', 'About');
    const id = s().focusedId!;
    s().move(id, 200, 150);
    s().resize(id, 500, 400);
    s().toggleMaximize(id);
    expect(win(id)).toMatchObject({ mode: 'maximized', x: 0, y: TOP, w: vw, h: vh - TOP - BOTTOM });
    s().toggleMaximize(id);
    expect(win(id)).toMatchObject({ mode: 'normal', x: 200, y: 150, w: 500, h: 400 });
  });

  it('minimizing a maximized window restores it as maximized', () => {
    const { s, win } = setup();
    s().open('about', 'About');
    const id = s().focusedId!;
    s().toggleMaximize(id);
    s().minimize(id);
    s().focus(id);
    expect(win(id).mode).toBe('maximized');
  });

  it('move updates position', () => {
    const { s, win } = setup();
    s().open('about', 'About');
    const id = s().focusedId!;
    s().move(id, 300, 200);
    expect(win(id)).toMatchObject({ x: 300, y: 200 });
  });

  it('move far off-screen right keeps 120px visible', () => {
    const { s, win } = setup();
    s().open('about', 'About');
    const id = s().focusedId!;
    s().move(id, 99999, 50);
    expect(win(id).x).toBe(vw - 120);
  });

  it('move far off-screen left keeps 120px visible', () => {
    const { s, win } = setup();
    s().open('about', 'About');
    const id = s().focusedId!;
    s().move(id, -99999, 50);
    expect(win(id).x).toBe(120 - win(id).w);
  });

  it('move above top inset clamps to topInset', () => {
    const { s, win } = setup();
    s().open('about', 'About');
    const id = s().focusedId!;
    s().move(id, 100, -500);
    expect(win(id).y).toBe(TOP);
  });

  it('move below the bottom keeps the title bar above the bottom inset', () => {
    const { s, win } = setup();
    s().open('about', 'About');
    const id = s().focusedId!;
    s().move(id, 100, 99999);
    expect(win(id).y).toBe(vh - BOTTOM - TITLE_BAR_HEIGHT);
  });

  it('insets default to 0', () => {
    const { s, win } = setup({});
    s().open('about', 'About');
    const id = s().focusedId!;
    s().move(id, 100, -500);
    expect(win(id).y).toBe(0);
    s().move(id, 100, 99999);
    expect(win(id).y).toBe(vh - TITLE_BAR_HEIGHT);
  });

  it('resize enforces 320x200 minimum', () => {
    const { s, win } = setup();
    s().open('about', 'About');
    const id = s().focusedId!;
    s().resize(id, 10, 10);
    expect(win(id)).toMatchObject({ w: 320, h: 200 });
    s().resize(id, 640, 480);
    expect(win(id)).toMatchObject({ w: 640, h: 480 });
  });

  it('clampAll after viewport shrink pulls windows back', () => {
    const { s, win } = setup();
    s().open('about', 'About');
    const id = s().focusedId!;
    s().move(id, 1300, 800);
    vw = 1024;
    vh = 700;
    s().clampAll();
    expect(win(id).x).toBe(1024 - 120);
    expect(win(id).y).toBe(700 - BOTTOM - TITLE_BAR_HEIGHT);
  });

  it('clampAll refits maximized windows to the new viewport', () => {
    const { s, win } = setup();
    s().open('about', 'About');
    const id = s().focusedId!;
    s().toggleMaximize(id);
    vw = 1024;
    vh = 700;
    s().clampAll();
    expect(win(id)).toMatchObject({ x: 0, y: TOP, w: 1024, h: 700 - TOP - BOTTOM });
  });

  it('actions on unknown ids are no-ops', () => {
    const { s } = setup();
    s().open('about', 'About');
    const before = s().windows;
    s().move('nope', 1, 1);
    s().resize('nope', 1, 1);
    s().focus('nope');
    s().minimize('nope');
    s().toggleMaximize('nope');
    s().close('nope');
    expect(s().windows).toEqual(before);
  });
});
