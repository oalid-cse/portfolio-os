import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { portfolioFixture as data } from '../../__fixtures__/portfolio-data';
import { TerminalApp } from './terminal-app';

afterEach(cleanup);

function run(input: HTMLElement, text: string) {
  fireEvent.change(input, { target: { value: text } });
  fireEvent.keyDown(input, { key: 'Enter' });
}

describe('TerminalApp', () => {
  it('keeps the input in view when it gains focus (on-screen keyboards)', () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    const original = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = spy;
    try {
      render(<TerminalApp data={data} openApp={vi.fn()} />);
      const input = screen.getByRole('textbox');
      spy.mockClear();
      fireEvent.blur(input);
      fireEvent.focus(input);
      expect(spy.mock.contexts).toContain(input);
      spy.mockClear();
      vi.advanceTimersByTime(400); // again once the keyboard has resized the viewport
      expect(spy.mock.contexts).toContain(input);
    } finally {
      Element.prototype.scrollIntoView = original;
      vi.useRealTimers();
    }
  });

  it('shows welcome line and focuses the input', () => {
    render(<TerminalApp data={data} openApp={vi.fn()} />);
    expect(screen.getByText("Welcome! Type 'help' to see available commands.")).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('ArrowUp recalls previous command; Enter runs; clear empties history', () => {
    render(<TerminalApp data={data} openApp={vi.fn()} />);
    const input = screen.getByRole('textbox');
    run(input, 'whoami');
    expect(screen.getByText('Abu Bin Oalid - Senior Backend Engineer')).toBeInTheDocument();
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input).toHaveValue('whoami');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveValue('');
    run(input, 'clear');
    expect(screen.queryByText('Abu Bin Oalid - Senior Backend Engineer')).toBeNull();
  });

  it('open calls openApp', () => {
    const openApp = vi.fn();
    render(<TerminalApp data={data} openApp={openApp} />);
    run(screen.getByRole('textbox'), 'open skills');
    expect(openApp).toHaveBeenCalledWith('skills');
  });

  it('resume opens the PDF in a new tab; exit navigates in place', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    const assign = vi.fn();
    const original = window.location;
    Object.defineProperty(window, 'location', { configurable: true, value: { ...original, assign } });
    try {
      render(<TerminalApp data={data} openApp={vi.fn()} />);
      const input = screen.getByRole('textbox');
      run(input, 'resume');
      expect(open).toHaveBeenCalledWith(data.profile.resumePdf, '_blank', 'noopener');
      expect(assign).not.toHaveBeenCalled();
      run(input, 'exit');
      expect(assign).toHaveBeenCalledWith('/');
      expect(open).toHaveBeenCalledTimes(1);
    } finally {
      open.mockRestore();
      Object.defineProperty(window, 'location', { configurable: true, value: original });
    }
  });
});
