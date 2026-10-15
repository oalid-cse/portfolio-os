import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { portfolioFixture as data } from '../__fixtures__/portfolio-data';
import { MobileShell, type MobileSkin } from './mobile-shell';

afterEach(cleanup);

function SwitchOsApp() {
  return <p>pick an os</p>;
}

const skin: MobileSkin = {
  wallpaper: <div data-testid="wallpaper" />,
  renderIcon: (id) => <span data-testid={`icon-${id}`} />,
  StatusBar: () => <div data-testid="status-bar">9:41</div>,
  homeApps: ['projects', 'skills', 'terminal'],
  dockApps: ['about', 'contact'],
  HomeIndicator: ({ onHome, onBack }) => (
    <div>
      <button type="button" onClick={onBack}>
        Back
      </button>
      <button type="button" onClick={onHome}>
        Go home
      </button>
    </div>
  ),
  AppHeader: ({ title, onBack }) => (
    <header>
      <button type="button" onClick={onBack}>
        ‹ Back
      </button>
      <span data-testid="app-title">{title}</span>
    </header>
  ),
  extraApps: [{ id: 'switch-os', title: 'Switch OS', icon: <span data-testid="icon-switch" />, Component: SwitchOsApp }],
};

const home = () => screen.getByRole('list', { name: 'Home screen' });
const openScreen = (name: string) => screen.getByRole('region', { name });

/** Back home: the grid is interactive again (an exiting app may still be animating away). */
async function expectHome() {
  await waitFor(() => expect(home().closest('[inert]')).toBeNull());
}

function mockReducedMotion() {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query === '(prefers-reduced-motion: reduce)',
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

afterEach(() => vi.unstubAllGlobals());

describe('MobileShell', () => {
  it('renders nothing on the server (the phone mounts once, on the client)', () => {
    expect(renderToString(<MobileShell data={data} skin={skin} />)).toBe('');
  });

  it('renders wallpaper, status bar, home grid (home apps + extra apps) and dock', () => {
    render(<MobileShell data={data} skin={skin} />);
    expect(screen.getByTestId('wallpaper')).toBeInTheDocument();
    expect(screen.getByTestId('status-bar')).toBeInTheDocument();
    for (const name of ['Projects', 'Skills', 'Terminal', 'Switch OS']) {
      expect(within(home()).getByRole('button', { name })).toBeInTheDocument();
    }
    const dock = screen.getByRole('navigation', { name: 'Dock' });
    expect(within(dock).getByRole('button', { name: 'About' })).toBeInTheDocument();
    expect(within(dock).getByRole('button', { name: 'Contact' })).toBeInTheDocument();
    expect(screen.getByTestId('icon-switch')).toBeInTheDocument();
  });

  it('tapping the Projects icon opens the app screen with header Projects', () => {
    render(<MobileShell data={data} skin={skin} />);
    fireEvent.click(within(home()).getByRole('button', { name: 'Projects' }));
    const app = openScreen('Projects');
    expect(within(app).getByTestId('app-title')).toHaveTextContent('Projects');
    expect(within(app).getByRole('heading', { name: 'Projects' })).toBeInTheDocument();
  });

  it('Go home returns to the grid', async () => {
    render(<MobileShell data={data} skin={skin} />);
    fireEvent.click(screen.getByRole('button', { name: 'About' }));
    expect(openScreen('About')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Go home' }));
    await expectHome();
  });

  it('the header back button and the nav-bar back slot both return home', async () => {
    render(<MobileShell data={data} skin={skin} />);
    fireEvent.click(within(home()).getByRole('button', { name: 'Skills' }));
    fireEvent.click(screen.getByRole('button', { name: '‹ Back' }));
    await expectHome();
    fireEvent.click(within(home()).getByRole('button', { name: 'Skills' }));
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    await expectHome();
  });

  it('the nav-bar back slot leaves an open app, and does nothing on the home screen', async () => {
    render(<MobileShell data={data} skin={skin} />);
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.queryByRole('region')).toBeNull();
    expect(within(home()).getByRole('button', { name: 'Projects' })).toBeInTheDocument();
    fireEvent.click(within(home()).getByRole('button', { name: 'Terminal' }));
    expect(openScreen('Terminal')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    await expectHome();
  });

  it('the home screen is inert while an app is open', () => {
    render(<MobileShell data={data} skin={skin} />);
    fireEvent.click(within(home()).getByRole('button', { name: 'Projects' }));
    expect(screen.getByRole('list', { name: 'Home screen', hidden: true }).closest('[inert]')).not.toBeNull();
  });

  it('opens skin-defined extra apps', () => {
    render(<MobileShell data={data} skin={skin} />);
    fireEvent.click(within(home()).getByRole('button', { name: 'Switch OS' }));
    expect(within(openScreen('Switch OS')).getByText('pick an os')).toBeInTheDocument();
  });

  it('apps can open other apps (Terminal `open projects` switches apps)', () => {
    render(<MobileShell data={data} skin={skin} />);
    fireEvent.click(within(home()).getByRole('button', { name: 'Terminal' }));
    const input = screen.getByLabelText('oalid@portfolio:~$');
    fireEvent.change(input, { target: { value: 'open projects' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(openScreen('Projects')).toBeInTheDocument();
  });

  describe('with reduced motion', () => {
    it('apps appear and disappear without animation', () => {
      mockReducedMotion();
      render(<MobileShell data={data} skin={skin} />);
      fireEvent.click(within(home()).getByRole('button', { name: 'Projects' }));
      expect(openScreen('Projects')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Go home' }));
      expect(screen.queryByRole('region')).toBeNull();
    });

    it('opening another app replaces the current one', () => {
      mockReducedMotion();
      render(<MobileShell data={data} skin={skin} />);
      fireEvent.click(within(home()).getByRole('button', { name: 'Terminal' }));
      const input = screen.getByLabelText('oalid@portfolio:~$');
      fireEvent.change(input, { target: { value: 'open projects' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(screen.getAllByRole('region')).toHaveLength(1);
      expect(openScreen('Projects')).toBeInTheDocument();
    });
  });

  it('returns focus to the launching icon when going home', async () => {
    render(<MobileShell data={data} skin={skin} />);
    const icon = within(home()).getByRole('button', { name: 'Skills' });
    fireEvent.click(icon);
    expect(openScreen('Skills')).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Go home' }));
    await waitFor(() => expect(icon).toHaveFocus());
  });

  describe('swipe up from the bottom edge', () => {
    const FRAME = { top: 0, left: 0, right: 390, bottom: 844, width: 390, height: 844, x: 0, y: 0 };

    function renderInApp() {
      render(<MobileShell data={data} skin={skin} />);
      const screenEl = screen.getByTestId('device-screen');
      vi.spyOn(screenEl, 'getBoundingClientRect').mockReturnValue({ ...FRAME, toJSON: () => FRAME } as DOMRect);
      fireEvent.click(within(home()).getByRole('button', { name: 'Projects' }));
      return screenEl;
    }

    function drag(target: HTMLElement, fromY: number, toY: number) {
      act(() => {
        fireEvent.pointerDown(target, { clientX: 195, clientY: fromY, pointerId: 1 });
        fireEvent.pointerMove(window, { clientX: 195, clientY: (fromY + toY) / 2, pointerId: 1 });
        fireEvent.pointerUp(window, { clientX: 195, clientY: toY, pointerId: 1 });
      });
    }

    it('a drag starting within 24px of the bottom and moving > 80px up goes home', async () => {
      const screenEl = renderInApp();
      drag(screenEl, 834, 700);
      await expectHome();
    });

    it('a short drag does not go home', () => {
      const screenEl = renderInApp();
      drag(screenEl, 834, 790);
      expect(openScreen('Projects')).toBeInTheDocument();
    });

    it('a drag starting higher up (app content) does not go home', () => {
      const screenEl = renderInApp();
      drag(screenEl, 600, 300);
      expect(openScreen('Projects')).toBeInTheDocument();
    });
  });
});
