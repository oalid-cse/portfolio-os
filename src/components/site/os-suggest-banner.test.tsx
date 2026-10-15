import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { DetectedOs } from '@/lib/os-detect';
import { OsSuggestBanner } from './os-suggest-banner';
import { MAIN_CONTENT_ID } from './skip-link';

const detectAs = (os: DetectedOs) => () => Promise.resolve(os);

async function mount(os: DetectedOs) {
  await act(async () => {
    render(<OsSuggestBanner detect={detectAs(os)} />);
  });
}

beforeEach(() => window.localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('OsSuggestBanner', () => {
  it('renders nothing on the server/first render', () => {
    expect(renderToString(<OsSuggestBanner detect={detectAs('macos')} />)).toBe('');
  });

  it('shows the macOS suggestion with Open linking to /os/macos', async () => {
    await mount('macos');
    expect(screen.getByRole('region', { name: 'OS experience suggestion' })).toHaveTextContent(
      "You're on macOS. View this portfolio as macOS?",
    );
    expect(screen.getByRole('link', { name: 'Open' })).toHaveAttribute('href', '/os/macos');
  });

  it('uses the detected name and the skin name separately', async () => {
    await mount('ipad');
    expect(screen.getByRole('region')).toHaveTextContent(
      "You're on iPad. View this portfolio as macOS?",
    );
  });

  it('Not now hides it and sets os-suggest-dismissed=1', async () => {
    await mount('macos');
    await userEvent.click(screen.getByRole('button', { name: 'Not now' }));
    expect(screen.queryByRole('region')).toBeNull();
    expect(window.localStorage.getItem('os-suggest-dismissed')).toBe('1');
  });

  it('does not show when os-suggest-dismissed=1', async () => {
    window.localStorage.setItem('os-suggest-dismissed', '1');
    await mount('macos');
    expect(screen.queryByRole('region')).toBeNull();
  });

  it('does not show for unknown', async () => {
    await mount('unknown');
    expect(screen.queryByRole('region')).toBeNull();
  });

  it('still shows and dismisses when localStorage throws', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    await mount('macos');
    expect(screen.getByRole('region')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Not now' }));
    expect(screen.queryByRole('region')).toBeNull();
  });

  it('Not now sends focus to the main content instead of dropping it to <body>', async () => {
    const main = document.createElement('main');
    main.id = MAIN_CONTENT_ID;
    main.tabIndex = -1;
    document.body.append(main);
    try {
      await mount('macos');
      await userEvent.click(screen.getByRole('button', { name: 'Not now' }));
      expect(main).toHaveFocus();
    } finally {
      main.remove();
    }
  });
});
