import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { OsSwitcher } from './os-switcher';
import { skins } from './registry';

afterEach(cleanup);

describe('OsSwitcher', () => {
  it('marks the current skin with aria-current and links the other ready skins', () => {
    render(<OsSwitcher current="windows11" variant="menu" />);
    const nav = screen.getByRole('navigation', { name: 'Switch OS version' });
    expect(within(nav).getByRole('link', { name: 'Windows 11' })).toHaveAttribute('aria-current', 'page');
    const mac = within(nav).getByRole('link', { name: 'macOS' });
    expect(mac).toHaveAttribute('href', '/os/macos');
    expect(mac).not.toHaveAttribute('aria-current');
  });

  it('renders coming-soon skins as disabled text, not links', () => {
    render(<OsSwitcher current="macos" variant="list" />);
    const comingSoon = skins.filter((s) => s.status === 'coming-soon');
    expect(screen.getAllByRole('link')).toHaveLength(skins.length - comingSoon.length);
    for (const s of comingSoon) {
      const item = screen.getByText(s.name, { exact: false });
      expect(item).toHaveAttribute('aria-disabled', 'true');
      expect(item.closest('a')).toBeNull();
    }
  });
});
