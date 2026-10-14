import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ProjectFrontmatter } from '@/content/types';
import { ProjectHeader } from './project-header';

const base: ProjectFrontmatter = {
  slug: 'demo',
  title: 'Demo',
  summary: 'A demo project.',
  tech: ['Laravel'],
  role: 'Backend Engineer',
  year: 2023,
  featured: false,
  order: 1,
};

describe('ProjectHeader', () => {
  it('renders no links/metrics/screenshots blocks when absent', () => {
    render(<ProjectHeader meta={{ ...base, links: undefined, metrics: undefined, screenshots: undefined }} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Demo' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /metrics/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /live|source|marketplace/i })).toBeNull();
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('renders a Live link that opens in a new tab with rel noopener', () => {
    render(<ProjectHeader meta={{ ...base, links: { live: 'https://example.com' } }} />);
    const link = screen.getByRole('link', { name: /live/i });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders metrics when provided', () => {
    render(<ProjectHeader meta={{ ...base, metrics: [{ label: 'Users', value: '10k' }] }} />);
    expect(screen.getByRole('heading', { name: /metrics/i })).toBeInTheDocument();
    expect(screen.getByText('10k')).toBeInTheDocument();
  });
});
