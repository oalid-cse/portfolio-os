import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ButtonLink } from './button';

describe('ButtonLink plain-anchor branch', () => {
  it('keeps aria-label, id, className and data-* on PDF links', () => {
    render(
      <ButtonLink href="/a.pdf" aria-label="Get CV" id="cv" className="extra" data-x="1" download>
        Download PDF
      </ButtonLink>,
    );
    const a = screen.getByRole('link', { name: 'Get CV' });
    expect(a).toHaveAttribute('id', 'cv');
    expect(a).toHaveAttribute('data-x', '1');
    expect(a).toHaveAttribute('download');
    expect(a.className).toContain('extra');
  });

  it('opens external links safely and does not leak Link-only props', () => {
    render(
      <ButtonLink href="https://example.com" prefetch={false} replace scroll={false}>
        Out
      </ButtonLink>,
    );
    const a = screen.getByRole('link', { name: 'Out' });
    expect(a).toHaveAttribute('target', '_blank');
    expect(a).toHaveAttribute('rel', 'noopener noreferrer');
    expect(a).not.toHaveAttribute('prefetch');
    expect(a).not.toHaveAttribute('replace');
  });
});
