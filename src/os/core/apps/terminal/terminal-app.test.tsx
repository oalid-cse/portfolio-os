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
});
