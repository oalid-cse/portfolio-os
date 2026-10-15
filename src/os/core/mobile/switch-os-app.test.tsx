import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { SwitchOsApp } from './switch-os-app';

afterEach(cleanup);

const classNames = { root: 'x-root', note: 'x-note', group: 'x-group', action: 'x-action' };

describe('SwitchOsApp', () => {
  it('lists the skins with the current one marked, then the way back, with the skin classes', () => {
    const { container } = render(<SwitchOsApp current="iphone" classNames={classNames} />);
    expect(container.firstElementChild).toHaveClass('os-app', 'x-root');
    expect(screen.getByText('Choose how to view this portfolio.')).toHaveClass('x-note');
    expect(container.querySelectorAll('.x-group')).toHaveLength(2);
    const current = screen.getAllByRole('link').find((a) => a.getAttribute('aria-current') === 'page');
    expect(current).toHaveAttribute('href', '/os/iphone');
    expect(container.querySelector('.x-action')).not.toBeNull();
  });
});
