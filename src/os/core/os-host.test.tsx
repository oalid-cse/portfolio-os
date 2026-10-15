import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PortfolioData } from '@/content/types';

vi.mock('./loaders', () => {
  const mockSkin = (id: string) => () =>
    Promise.resolve({ default: () => <div data-os-skin={id}>mock {id}</div> });
  return {
    skinLoaders: {
      windows11: mockSkin('windows11'),
      macos: mockSkin('macos'),
      iphone: mockSkin('iphone'),
      windows10: mockSkin('windows10'),
      windows7: mockSkin('windows7'),
      windowsxp: mockSkin('windowsxp'),
      ubuntu: mockSkin('ubuntu'),
      samsung: mockSkin('samsung'),
    },
  };
});

import { skinLoaders } from './loaders';
import { lazySkins, OsHost } from './os-host';
import { skins } from './registry';

const data = {} as PortfolioData;

afterEach(cleanup);

describe('OsHost', () => {
  it('renders the lazy skin without a loading fallback of its own', async () => {
    render(<OsHost id="windows11" data={data} />);
    // No Suspense fallback inside the host: a suspended hydration must keep the server HTML.
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(await screen.findByText('mock windows11')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('has a loader and a lazy skin for every ready registry id', () => {
    const ready = skins.filter((s) => s.status === 'ready').map((s) => s.id);
    expect(ready.length).toBeGreaterThan(0);
    for (const id of ready) {
      expect(skinLoaders, id).toHaveProperty(id);
      expect(lazySkins, id).toHaveProperty(id);
    }
    expect(Object.keys(lazySkins).sort()).toEqual(Object.keys(skinLoaders).sort());
  });

  it('renders the Windows 10 skin for its id', async () => {
    render(<OsHost id="windows10" data={data} />);
    expect(await screen.findByText('mock windows10')).toBeInTheDocument();
  });

  it('renders the Windows 7 skin for its id', async () => {
    render(<OsHost id="windows7" data={data} />);
    expect(await screen.findByText('mock windows7')).toBeInTheDocument();
  });

  it('renders the Windows XP skin for its id', async () => {
    render(<OsHost id="windowsxp" data={data} />);
    expect(await screen.findByText('mock windowsxp')).toBeInTheDocument();
  });

  it('renders the Ubuntu skin for its id', async () => {
    render(<OsHost id="ubuntu" data={data} />);
    expect(await screen.findByText('mock ubuntu')).toBeInTheDocument();
  });
});
