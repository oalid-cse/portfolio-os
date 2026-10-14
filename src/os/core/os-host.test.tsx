import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PortfolioData } from '@/content/types';

vi.mock('./loaders', () => ({
  skinLoaders: {
    windows11: () =>
      Promise.resolve({
        default: () => <div data-os-skin="windows11">mock skin</div>,
      }),
    macos: () => Promise.resolve({ default: () => <div>macos</div> }),
    iphone: () => Promise.resolve({ default: () => <div>iphone</div> }),
  },
}));

import { OsHost } from './os-host';

const data = {} as PortfolioData;

afterEach(cleanup);

describe('OsHost', () => {
  it('shows the loader and then the lazy skin', async () => {
    render(<OsHost id="windows11" data={data} />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading…');
    expect(await screen.findByText('mock skin')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
