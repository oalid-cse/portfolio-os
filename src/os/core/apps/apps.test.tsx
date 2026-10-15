import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { portfolioFixture as data } from '../__fixtures__/portfolio-data';
import { apps } from './index';
import { ScreenTitleContext } from './app-heading';

afterEach(cleanup);

const renderApp = (id: keyof typeof apps, d = data) => {
  const { Component } = apps[id];
  return render(<Component data={d} openApp={vi.fn()} />);
};

describe('shared apps', () => {
  it('About shows name and title', () => {
    renderApp('about');
    expect(screen.getByRole('heading', { name: 'Abu Bin Oalid' })).toBeInTheDocument();
    expect(screen.getByText('Senior Backend Engineer')).toBeInTheDocument();
  });

  it('only a top heading that repeats the app name is marked os-app-title (skins with a large title may drop it)', () => {
    for (const id of Object.keys(apps) as (keyof typeof apps)[]) {
      const { container, unmount } = renderApp(id);
      for (const h of container.querySelectorAll('.os-app-title')) expect(h.textContent).toBe(apps[id].title);
      unmount();
    }
    const { container } = renderApp('browser');
    expect(screen.getByRole('heading', { level: 1, name: 'Blog' })).not.toHaveClass('os-app-title');
    expect(container.querySelector('.os-app-title')).toBeNull();
  });

  it('Experience shows 3 companies in order', () => {
    renderApp('experience');
    const names = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(names.slice(0, 3)).toEqual(['Alpha Co', 'Beta Ltd', 'Gamma Inc']);
  });

  it('Skills shows groups', () => {
    renderApp('skills');
    expect(screen.getByText('Backend')).toBeInTheDocument();
    expect(screen.getByText('Redis')).toBeInTheDocument();
  });

  it('Projects list -> detail with case-study link', () => {
    renderApp('projects');
    fireEvent.click(screen.getByRole('button', { name: /Alhisab/ }));
    const link = screen.getByRole('link', { name: 'Open full case study' });
    expect(link).toHaveAttribute('href', '/projects/alhisab');
    expect(link).toHaveAttribute('target', '_blank');
    fireEvent.click(screen.getByRole('button', { name: /All projects/ }));
    expect(screen.getByRole('button', { name: /Beta App/ })).toBeInTheDocument();
  });

  it('Resume has iframe and download link', () => {
    renderApp('resume');
    expect(screen.getByTitle('Resume PDF')).toHaveAttribute('src', '/resume/abu-bin-oalid.pdf');
    expect(screen.getByRole('link', { name: /Download/ })).toHaveAttribute('download');
  });

  it('Contact without form shows mailto and socials', () => {
    renderApp('contact');
    expect(screen.getByRole('link', { name: 'hello@example.com' })).toHaveAttribute('href', 'mailto:hello@example.com');
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /send/i })).toBeNull();
  });

  it('Contact with form flag renders the form', () => {
    renderApp('contact', { ...data, features: { contactForm: true } });
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
  });

  it('Browser shows empty state, and posts when present', () => {
    renderApp('browser');
    expect(screen.getByText('No posts yet.')).toBeInTheDocument();
    cleanup();
    renderApp('browser', {
      ...data,
      posts: [{ slug: 'hi', title: 'Hi', summary: 's', publishedAt: '2026-01-02', tags: [] }],
    });
    expect(screen.getByRole('link', { name: 'Hi' })).toHaveAttribute('href', '/blog/hi');
  });

  it('Experience nests Education under the app title: one h1, Education an h2, schools h3', () => {
    renderApp('experience');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 2, name: 'Education' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Example University' })).toBeInTheDocument();
  });

  it('Projects detail labels its links in title case', () => {
    renderApp('projects');
    fireEvent.click(screen.getByRole('button', { name: /Alhisab/ }));
    expect(screen.getByRole('link', { name: 'Live' })).toHaveAttribute('href', 'https://example.com/alhisab');
  });

  it('Experience and Skills can be scrolled with the keyboard (no other focusable content)', () => {
    for (const id of ['experience', 'skills', 'about'] as const) {
      const { container, unmount } = renderApp(id);
      expect(container.querySelector('.os-app')).toHaveAttribute('tabindex', '0');
      unmount();
    }
  });

  it('under a screen title (mobile large title), app headings start at h2', () => {
    const inScreen = (id: keyof typeof apps) => {
      const { Component } = apps[id];
      return render(
        <ScreenTitleContext value>
          <Component data={data} openApp={vi.fn()} />
        </ScreenTitleContext>,
      );
    };
    inScreen('about');
    expect(screen.getByRole('heading', { level: 2, name: 'Abu Bin Oalid' })).toBeInTheDocument();
    cleanup();
    inScreen('browser');
    expect(screen.getByRole('heading', { level: 2, name: 'Blog' })).toBeInTheDocument();
    cleanup();
    inScreen('projects');
    fireEvent.click(screen.getByRole('button', { name: /Alhisab/ }));
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
    expect(screen.getByRole('heading', { level: 2, name: 'Alhisab' })).toBeInTheDocument();
  });
});
