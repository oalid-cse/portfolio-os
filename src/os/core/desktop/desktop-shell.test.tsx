import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { portfolioFixture as data } from '../__fixtures__/portfolio-data';
import { TestChrome } from '../__fixtures__/test-chrome';
import { DesktopShell, type DesktopSkin } from './desktop-shell';

afterEach(cleanup);

function setViewport(w: number, h: number) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, writable: true, value: w });
  Object.defineProperty(window, 'innerHeight', { configurable: true, writable: true, value: h });
}

beforeEach(() => setViewport(1280, 800));

const skin: DesktopSkin = {
  wallpaper: <div data-testid="wallpaper" />,
  WindowChrome: TestChrome,
  renderIcon: (id) => <span data-testid={`icon-${id}`} />,
  topBar: (api) => <div data-testid="topbar">{`focused: ${api.focusedId ?? 'none'}`}</div>,
  bottomBar: (api) => (
    <nav aria-label="Taskbar">
      {api.windows.map((w) => (
        <button
          key={w.id}
          type="button"
          aria-pressed={api.focusedId === w.id}
          onClick={() => (api.focusedId === w.id ? api.minimize(w.id) : api.focus(w.id))}
        >
          {`task ${w.title}`}
        </button>
      ))}
      <button type="button" onClick={() => api.openApp('skills')}>
        launch skills
      </button>
    </nav>
  ),
  desktopIcons: ['about', 'projects', 'terminal'],
  insets: { top: 0, bottom: 48 },
  mobileAlternative: 'iphone',
};

const dialog = (name: string) => screen.getByRole('dialog', { name });
const z = (el: HTMLElement) => Number(el.style.zIndex);

describe('DesktopShell', () => {
  it('renders wallpaper, bars and one labelled button per desktop icon', () => {
    render(<DesktopShell data={data} skin={skin} />);
    expect(screen.getByTestId('wallpaper')).toBeInTheDocument();
    expect(screen.getByTestId('topbar')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Taskbar' })).toBeInTheDocument();
    for (const name of ['About', 'Projects', 'Terminal']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
    expect(screen.getByTestId('icon-about')).toBeInTheDocument();
  });

  it('topBar receives the desktop api (e.g. to show the focused window)', () => {
    render(<DesktopShell data={data} skin={skin} />);
    expect(screen.getByTestId('topbar')).toHaveTextContent('focused: none');
    fireEvent.doubleClick(screen.getByRole('button', { name: 'About' }));
    expect(screen.getByTestId('topbar')).toHaveTextContent(/focused: about-\d+/);
  });

  it('double-clicking a desktop icon opens a window with dialog role and the app title', () => {
    render(<DesktopShell data={data} skin={skin} />);
    fireEvent.doubleClick(screen.getByRole('button', { name: 'About' }));
    const win = dialog('About');
    expect(within(win).getByRole('heading', { name: 'Abu Bin Oalid' })).toBeInTheDocument();
  });

  it('single click selects an icon without opening; Enter opens', () => {
    render(<DesktopShell data={data} skin={skin} />);
    const icon = screen.getByRole('button', { name: 'Projects' });
    fireEvent.click(icon);
    expect(icon).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.keyDown(icon, { key: 'Enter' });
    expect(dialog('Projects')).toBeInTheDocument();
  });

  it('opening the same app twice keeps one window', () => {
    render(<DesktopShell data={data} skin={skin} />);
    const icon = screen.getByRole('button', { name: 'About' });
    fireEvent.doubleClick(icon);
    fireEvent.doubleClick(icon);
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
  });

  it('clicking a second window raises its z-index', () => {
    render(<DesktopShell data={data} skin={skin} />);
    fireEvent.doubleClick(screen.getByRole('button', { name: 'About' }));
    fireEvent.doubleClick(screen.getByRole('button', { name: 'Projects' }));
    expect(z(dialog('Projects'))).toBeGreaterThan(z(dialog('About')));
    fireEvent.pointerDown(dialog('About'));
    expect(z(dialog('About'))).toBeGreaterThan(z(dialog('Projects')));
    expect(within(dialog('About')).getByTestId('titlebar')).toHaveAttribute('data-focused', 'true');
  });

  it('the close button from the chrome removes the window', async () => {
    render(<DesktopShell data={data} skin={skin} />);
    fireEvent.doubleClick(screen.getByRole('button', { name: 'About' }));
    fireEvent.click(within(dialog('About')).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('bottomBar api opens, focuses and minimizes windows', () => {
    render(<DesktopShell data={data} skin={skin} />);
    fireEvent.click(screen.getByRole('button', { name: 'launch skills' }));
    expect(dialog('Skills')).toBeInTheDocument();
    const task = screen.getByRole('button', { name: 'task Skills' });
    expect(task).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(task);
    expect(screen.queryByRole('dialog', { name: 'Skills' })).toBeNull();
    fireEvent.click(task);
    expect(dialog('Skills')).toBeInTheDocument();
  });

  it('apps can open other apps via openApp', () => {
    render(<DesktopShell data={data} skin={skin} />);
    fireEvent.doubleClick(screen.getByRole('button', { name: 'Terminal' }));
    const input = within(dialog('Terminal')).getByRole('textbox');
    fireEvent.change(input, { target: { value: 'open skills' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(dialog('Skills')).toBeInTheDocument();
  });

  it('Alt+F4 closes the focused window by default; Escape does not', async () => {
    render(<DesktopShell data={data} skin={skin} />);
    fireEvent.doubleClick(screen.getByRole('button', { name: 'About' }));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(dialog('About')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'F4', altKey: true });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('closing the last window returns focus to what opened it', async () => {
    render(<DesktopShell data={data} skin={skin} />);
    const icon = screen.getByRole('button', { name: 'About' });
    icon.focus();
    fireEvent.keyDown(icon, { key: 'Enter' });
    await waitFor(() => expect(dialog('About')).toHaveFocus());
    fireEvent.keyDown(window, { key: 'F4', altKey: true });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(icon).toHaveFocus();
  });

  it('does not move focus on mount', () => {
    render(<DesktopShell data={data} skin={skin} />);
    expect(document.body).toHaveFocus();
  });

  it('closing a window whose opener is gone falls back to the first desktop icon', async () => {
    render(<DesktopShell data={data} skin={skin} />);
    document.body.focus();
    fireEvent.click(screen.getByRole('button', { name: 'launch skills' }));
    await waitFor(() => expect(dialog('Skills')).toHaveFocus());
    fireEvent.keyDown(window, { key: 'F4', altKey: true });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('button', { name: 'About' })).toHaveFocus();
  });

  it('closeShortcut prop replaces the default', async () => {
    render(<DesktopShell data={data} skin={skin} closeShortcut={(e) => e.metaKey && e.key === 'w'} />);
    fireEvent.doubleClick(screen.getByRole('button', { name: 'About' }));
    fireEvent.keyDown(window, { key: 'F4', altKey: true });
    expect(dialog('About')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'w', metaKey: true });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('viewport resize clamps windows back on screen', () => {
    render(<DesktopShell data={data} skin={skin} />);
    fireEvent.doubleClick(screen.getByRole('button', { name: 'About' }));
    const bar = within(dialog('About')).getByTestId('titlebar');
    fireEvent.pointerDown(bar, { clientX: 400, clientY: 100, pointerId: 1, button: 0 });
    fireEvent.pointerMove(bar, { clientX: 1400, clientY: 100, pointerId: 1, buttons: 1 });
    fireEvent.pointerUp(bar, { pointerId: 1 });
    expect(dialog('About').style.left).toBe(`${1280 - 120}px`);
    act(() => {
      setViewport(1000, 800);
      window.dispatchEvent(new Event('resize'));
    });
    expect(dialog('About').style.left).toBe(`${1000 - 120}px`);
  });

  it('at a 500px viewport the notice is shown and no windows render', () => {
    setViewport(500, 800);
    render(<DesktopShell data={data} skin={skin} />);
    expect(screen.getByText('This desktop experience works best on larger screens.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open iPhone' })).toHaveAttribute('href', '/os/iphone');
    expect(screen.getByRole('link', { name: 'Back to classic view' })).toHaveAttribute('href', '/');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByRole('button', { name: 'About' })).toBeNull();
  });

  it('north-edge resize with topInset=28 clamps at the inset without moving the bottom edge', () => {
    render(<DesktopShell data={data} skin={{ ...skin, insets: { top: 28, bottom: 48 } }} />);
    fireEvent.doubleClick(screen.getByRole('button', { name: 'About' }));
    const win = dialog('About');
    const bottomEdge = parseFloat(win.style.top) + parseFloat(win.style.height);
    const north = win.querySelector('[data-resize="n"]')!;
    fireEvent.pointerDown(north, { clientX: 400, clientY: 200, pointerId: 1, button: 0 });
    fireEvent.pointerMove(north, { clientX: 400, clientY: -500, pointerId: 1, buttons: 1 });
    fireEvent.pointerUp(north, { pointerId: 1 });
    expect(win.style.top).toBe('28px');
    expect(parseFloat(win.style.top) + parseFloat(win.style.height)).toBe(bottomEdge);
  });

  it('text selection is blocked on desktop furniture but not on the shell root', () => {
    const { container } = render(<DesktopShell data={data} skin={skin} />);
    expect(container.firstElementChild).not.toHaveClass('select-none');
    expect(screen.getByTestId('wallpaper').parentElement).toHaveClass('select-none');
    expect(screen.getByRole('button', { name: 'About' }).parentElement).toHaveClass('select-none');
    expect(screen.getByRole('navigation', { name: 'Taskbar' }).parentElement).toHaveClass('select-none');
  });

  it('open windows survive crossing the 768px breakpoint', () => {
    render(<DesktopShell data={data} skin={skin} />);
    fireEvent.doubleClick(screen.getByRole('button', { name: 'About' }));
    act(() => {
      setViewport(500, 800);
      window.dispatchEvent(new Event('resize'));
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    act(() => {
      setViewport(1280, 800);
      window.dispatchEvent(new Event('resize'));
    });
    expect(dialog('About')).toBeInTheDocument();
  });

  it('passes the skin window body class to every window content area', () => {
    render(<DesktopShell data={data} skin={{ ...skin, windowBodyClassName: 'skin-body' }} />);
    fireEvent.doubleClick(screen.getByRole('button', { name: 'About' }));
    expect(dialog('About').querySelector('.skin-body')).not.toBeNull();
  });
  it('renders the skin leftBar in a column sized to the left inset, between top and bottom insets', () => {
    render(
      <DesktopShell
        data={data}
        skin={{
          ...skin,
          insets: { top: 32, bottom: 0, left: 64 },
          leftBar: (api) => <nav aria-label="Dock">{`windows: ${api.windows.length}`}</nav>,
        }}
      />,
    );
    const dock = screen.getByRole('navigation', { name: 'Dock' });
    const column = dock.parentElement!;
    expect(column.style.width).toBe('64px');
    expect(column.style.top).toBe('32px');
    expect(column.style.bottom).toBe('0px');
    expect(column).toHaveClass('select-none');
    fireEvent.doubleClick(screen.getByRole('button', { name: 'About' }));
    expect(dock).toHaveTextContent('windows: 1');
  });

  it('shifts desktop icons right of the left inset and maximizes beside it', () => {
    render(<DesktopShell data={data} skin={{ ...skin, insets: { top: 32, bottom: 0, left: 64 }, leftBar: () => null }} />);
    expect(screen.getByRole('button', { name: 'About' }).parentElement!.style.left).toBe('64px');
    fireEvent.doubleClick(screen.getByRole('button', { name: 'About' }));
    fireEvent.click(within(dialog('About')).getByRole('button', { name: 'Maximize' }));
    expect(dialog('About').style.left).toBe('64px');
    expect(dialog('About').style.width).toBe(`${1280 - 64}px`);
  });
});
