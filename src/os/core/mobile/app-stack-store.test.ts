import { describe, expect, it } from 'vitest';
import { createAppStackStore } from './app-stack-store';

describe('createAppStackStore', () => {
  it('starts on the home screen', () => {
    expect(createAppStackStore().getState().current).toBeNull();
  });

  it('opens an app', () => {
    const store = createAppStackStore();
    store.getState().openApp('projects');
    expect(store.getState().current).toBe('projects');
  });

  it('opening another app replaces the current one (one app at a time)', () => {
    const store = createAppStackStore();
    store.getState().openApp('projects');
    store.getState().openApp('about');
    expect(store.getState().current).toBe('about');
  });

  it('accepts skin-defined pseudo-app ids', () => {
    const store = createAppStackStore();
    store.getState().openApp('switch-os');
    expect(store.getState().current).toBe('switch-os');
  });

  it('goHome returns to the home screen and is a no-op there', () => {
    const store = createAppStackStore();
    store.getState().openApp('terminal');
    store.getState().goHome();
    expect(store.getState().current).toBeNull();
    store.getState().goHome();
    expect(store.getState().current).toBeNull();
  });

  it('each store is independent', () => {
    const a = createAppStackStore();
    const b = createAppStackStore();
    a.getState().openApp('about');
    expect(b.getState().current).toBeNull();
  });
});
